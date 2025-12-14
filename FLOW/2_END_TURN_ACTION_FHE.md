# END TURN ACTION - FHE Mod Akışı

## NORMAL vs FHE KARŞILAŞTIRMA

| Adım | Normal Mod | FHE Mod |
|------|------------|---------|
| End Turn butonu | SDK action | SDK action (AYNI) |
| Tur state güncelle | Server'da | Server'da (AYNI) |
| Kart çekme tetikleme | SDK | SDK (AYNI) |
| Kart nereden çekiliyor? | deck.drawPile (server) | Contract deck[deckIndex] (blockchain) |
| Kart nasıl belirleniyor? | Math.random() | Önceden shuffle edilmiş (contract'ta) |
| Kart görünür mü? | Server biliyor | Şifreli (sadece oyuncu görebilir) |
| TX gerekli mi? | HAYIR | **HAYIR** (userDecrypt TX değil) |

---

## FLOWCHART

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           END TURN BUTONU                                    │
│                    game_bottom_bar.js:142                                    │
│         onClickSubmitTurn() → gameSession.submitExplicitAction()             │
│                                                                              │
│  ✅ AYNI - Normal akışla aynı                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EndTurnAction._execute()                             │
│                         endTurnAction.js:28                                  │
│                                                                              │
│  ✅ AYNI - p_endTurn() çağırıyor                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         gameSession.p_endTurn()                              │
│                         gameSession.js:1576                                  │
│                                                                              │
│  ✅ AYNI - Tur state güncelleme                                             │
│    1. currentTurn.setEnded(true)                                            │
│    2. turns.push(currentTurn)                                               │
│    3. pushEvent(EVENTS.end_turn)                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              gameSession._onExecuteQueueAction()                             │
│              gameSession.js:2173-2186                                        │
│                                                                              │
│  ✅ AYNI - Kart çekme tetikleme                                             │
│    hasDrawnCardsForTurn = true                                              │
│    deck.actionsDrawNewCards() → DrawCardAction oluştur                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DrawCardAction execute                                    │
│                    SDK tarafında                                             │
│                                                                              │
│  Normal akış devam ediyor, FHE kontrolü game.js'te                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    game.js onAfterShowStep()                                 │
│                    app/ui/views/layouts/game.js                              │
│                                                                              │
│  🆕 FHE AKIŞI BURADA BAŞLIYOR                                               │
│                                                                              │
│  if (CONFIG.fheEnabled && action instanceof SDK.DrawCardAction) {           │
│    // Sadece kendi kartımız için                                            │
│    if (ownerId === myPlayerId) {                                            │
│      fheSession.drawCard()  // Contract'tan al + decrypt                    │
│        .then(function(cardId) {                                             │
│          EventBus.trigger(EVENTS.fhe_card_drawn, { cardId });               │
│        });                                                                   │
│    }                                                                         │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 1: Contract'tan el kartlarını al (VIEW CALL - TX YOK!)                │
│                                                                              │
│  Dosya: fheGameSession.js                                                   │
│  Metod: drawCard() → decryptHand()                                          │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    var previousHandSize = self.decryptedHand.length;                        │
│    self.decryptHand()  // getHand() + userDecrypt()                         │
│      .then(function(newHand) {                                              │
│        if (newHand.length > previousHandSize) {                             │
│          var newCardId = newHand[newHand.length - 1];                       │
│          resolve(newCardId);                                                │
│        }                                                                     │
│      });                                                                     │
│                                                                              │
│  ⚠️  CONTRACT SOURCE OF TRUTH!                                              │
│  ⚠️  Local deck state YOK - Contract'tan oku                                │
│  ⚠️  TX YOK - Sadece view call + HTTP request                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 2: Contract.getHand() çağır (VIEW CALL)                               │
│                                                                              │
│  Dosya: fheGameSession.js                                                   │
│  Metod: decryptHand() içinde                                                │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    var handData = await contract.getHand(gameId);                           │
│    // handData.handles = [handle0, handle1, handle2, ...]                   │
│    // handData.handSize = 6                                                 │
│                                                                              │
│  Contract tarafı (GameSession.sol):                                         │
│    function getHand(uint256 gameId) view returns (                          │
│      euint16[6] handles,                                                    │
│      uint8 handSize                                                         │
│    ) {                                                                       │
│      return (games[gameId].players[msg.sender].hand,                        │
│              games[gameId].players[msg.sender].handSize);                   │
│    }                                                                         │
│                                                                              │
│  ⚠️  VIEW CALL - Gas yok, TX yok                                           │
│  ⚠️  Handle'lar şifreli - decrypt gerekli                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 3: userDecrypt() ile kartları aç                                       │
│                                                                              │
│  Dosya: fhe_session.js                                                      │
│  Metod: FHESession.prototype.decrypt()                                      │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    const cardIds = await fheSession.decrypt(                                │
│      handles,              // Contract'tan gelen handle'lar                 │
│      contractAddress                                                        │
│    );                                                                        │
│                                                                              │
│  Arka planda:                                                                │
│    1. generateKeypair() ile oluşturulan keypair kullanılıyor               │
│    2. Signature ile KMS'e HTTP istek atılıyor (Relayer üzerinden)          │
│    3. KMS ACL kontrolü yapıyor (bu oyuncu bu kartı görebilir mi?)          │
│    4. KMS decrypt edip döndürüyor                                          │
│                                                                              │
│  ⚠️  TX YOK - HTTP request to Relayer                                      │
│  ⚠️  POPUP YOK - Signature oyun başında bir kez alındı                     │
│                                                                              │
│  Dönen: [10101, 10205, 10301, ...] (kart ID'leri)                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 4: Yeni kartı bul ve event tetikle                                     │
│                                                                              │
│  Dosya: fheGameSession.js                                                   │
│  Metod: drawCard() içinde                                                   │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    // Önceki el boyutu ile karşılaştır                                      │
│    if (newHand.length > previousHandSize) {                                 │
│      var newCardId = newHand[newHand.length - 1];                           │
│      self.decryptedHand = newHand;  // Cache güncelle                       │
│      resolve(newCardId);                                                    │
│    }                                                                         │
│                                                                              │
│  Event tetikleme (game.js):                                                 │
│    EventBus.trigger(EVENTS.fhe_card_drawn, { cardId: cardId });            │
│                                                                              │
│  ✅ Kart çekildi ve frontend biliyor                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SONUÇ: Kart çekildi                                                         │
│                                                                              │
│  Oyuncu:                                                                     │
│    - Yeni kartı görüyor (decrypt edildi)                                    │
│    - El sayısı +1                                                           │
│    - Deste sayısı -1                                                        │
│                                                                              │
│  Server:                                                                     │
│    - Kartın ne olduğunu BİLMİYOR                                            │
│    - Sadece "1 kart çekildi" biliyor                                        │
│                                                                              │
│  Contract:                                                                   │
│    - deckIndex zaten arttırılmış (oyun başında drawCard TX ile)            │
│    - hand array'i dolu (oyun başında)                                       │
│    - SOURCE OF TRUTH                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## CONTRACT STATE - SOURCE OF TRUTH

```
CONTRACT STATE (Blockchain):
┌────────────────────────────────────────────────────────────────┐
│ player.deckIndex = 6     ← Oyun başında 5 + tur başı 1        │
│ player.handSize = 6      ← Başlangıç 5 + çekilen 1            │
│ player.hand[0..5]        ← 6 kart handle'ı (şifreli)          │
│ player.deck[6..39]       ← Kalan 34 kart (şifreli)            │
└────────────────────────────────────────────────────────────────┘

FRONTEND CACHE (Local):
┌────────────────────────────────────────────────────────────────┐
│ fheGameSession.decryptedHand = [10101, 10205, ...]            │
│ fheGameSession.handHandles = [handle0, handle1, ...]          │
│                                                                │
│ ⚠️  Bu sadece CACHE - Source of truth CONTRACT!               │
└────────────────────────────────────────────────────────────────┘

deckIndex NEDİR?
┌────────────────────────────────────────────────────────────────┐
│ deckIndex = Kaç kart çekilmiş                                  │
│                                                                │
│ Oyun başı: deckIndex = 5 (5 kart başlangıç eli)               │
│ Tur 1 başı: deckIndex = 6 (1 kart çekildi)                    │
│ Tur 2 başı: deckIndex = 7 (1 kart daha çekildi)               │
│ ...                                                            │
│                                                                │
│ Kalan kart = 40 - deckIndex                                    │
│ Örnek: 40 - 6 = 34 kart kaldı                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## ÖZET TABLO

| Sıra | Dosya | Fonksiyon | Normal | FHE | TX? |
|------|-------|-----------|--------|-----|-----|
| 1 | game_bottom_bar.js:142 | onClickSubmitTurn() | ✅ | ✅ AYNI | - |
| 2 | endTurnAction.js:28 | _execute() | ✅ | ✅ AYNI | - |
| 3 | gameSession.js:1576 | p_endTurn() | ✅ | ✅ AYNI | - |
| 4 | gameSession.js:2173 | _onExecuteQueueAction() | ✅ | ✅ AYNI | - |
| 5 | deck.js:271 | actionsDrawNewCards() | ✅ | ✅ AYNI | - |
| 6 | game.js | onAfterShowStep() | - | 🆕 FHE kontrolü | - |
| 7 | fheGameSession.js | drawCard() | - | decryptHand() çağır | - |
| 8 | Contract | getHand() | - | Handle'ları al | ❌ VIEW |
| 9 | fhe_session.js | decrypt() | - | userDecrypt (HTTP) | ❌ |
| 10 | game.js | event trigger | - | fhe_card_drawn | ❌ |

**TX SAYISI: 0** (End turn için blockchain'e yazma yok)

---

## userDecrypt DETAYLI AKIŞ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  fheSession.decrypt(handles, contractAddress)                                │
│  fhe_session.js                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. Keypair ve Signature hazır mı kontrol et                                 │
│                                                                              │
│  if (!this.keypair || !this.signature) {                                    │
│    throw "Session not initialized";                                         │
│  }                                                                           │
│                                                                              │
│  Keypair ve signature OYUN BAŞINDA oluşturuldu:                             │
│    - keypair = fhevmInstance.generateKeypair()                              │
│    - signature = MetaMask sign (1 popup, oyun başında)                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. Handle'ları hex formatına çevir                                          │
│                                                                              │
│  handles.map(h => {                                                         │
│    return {                                                                 │
│      handle: "0x" + h.toString(16).padStart(64, '0'),                      │
│      contractAddress: contractAddress                                       │
│    };                                                                        │
│  });                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. KMS'e istek at (Relayer üzerinden)                                       │
│                                                                              │
│  instance.userDecrypt(                                                       │
│    handlePairs,           // [{handle, contractAddress}]                    │
│    keypair.privateKey,    // Tarayıcıda saklanan                            │
│    keypair.publicKey,     // KMS'e verilen                                  │
│    signature,             // MetaMask imzası                                │
│    [contractAddress],     // İzin verilen contract'lar                      │
│    userAddress,           // Cüzdan adresi                                  │
│    startTimestamp,        // Signature başlangıç zamanı                     │
│    durationDays           // Signature geçerlilik süresi                    │
│  );                                                                          │
│                                                                              │
│  ⚠️  TX DEĞİL - HTTP request to Relayer                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. KMS kontrolleri                                                          │
│                                                                              │
│  KMS (Key Management Service):                                               │
│    1. Signature geçerli mi? (ecrecover → cüzdan adresi)                     │
│    2. Signature süresi dolmamış mı?                                         │
│    3. ACL kontrolü: Bu cüzdan bu handle'ı görebilir mi?                     │
│       - Contract'ta FHE.allow(handle, userAddress) çağrılmış mı?           │
│    4. Tüm kontroller OK → Decrypt et                                        │
│                                                                              │
│  KMS decrypt yapıyor:                                                        │
│    - Master key ile şifreyi aç                                              │
│    - Kullanıcının publicKey'i ile yeniden şifrele (reencrypt)              │
│    - Şifreli sonucu döndür                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  5. Frontend'de son decrypt                                                  │
│                                                                              │
│  KMS'ten gelen şifreli sonucu kendi privateKey ile aç:                      │
│    clearValue = decrypt(encryptedResult, keypair.privateKey)                │
│                                                                              │
│  Dönen: cardId (örn: 10101)                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## GÜVENLİK ANALİZİ

```
NORMAL MOD:
- Server kartı biliyor (shuffle server'da)
- Server manipüle edebilir

FHE MOD:
- Server kartı BİLMİYOR (shuffle frontend'de)
- Contract kartı BİLMİYOR (şifreli)
- KMS kartı BİLMİYOR (sadece decrypt için anahtar)
- Sadece OYUNCU kartı görebiliyor (ACL izni var)

KİM NE BİLİYOR?
┌─────────────────────────────────────────────────────────────────┐
│ Aktör          │ Deste Sırası │ Çekilen Kart │ El Kartları     │
├─────────────────────────────────────────────────────────────────┤
│ Oyuncu         │ ❌ BİLMİYOR  │ ✅ BİLİYOR   │ ✅ BİLİYOR      │
│ Server         │ ❌ BİLMİYOR  │ ❌ BİLMİYOR  │ ❌ BİLMİYOR     │
│ Contract       │ ❌ BİLMİYOR  │ ❌ BİLMİYOR  │ ❌ BİLMİYOR     │
│ KMS            │ ❌ BİLMİYOR  │ ❌ BİLMİYOR  │ ❌ BİLMİYOR     │
│ Rakip          │ ❌ BİLMİYOR  │ ❌ BİLMİYOR  │ ❌ BİLMİYOR     │
└─────────────────────────────────────────────────────────────────┘

⚠️  NOT: Oyuncu artık deste sırasını BİLMİYOR!
    - Shuffle frontend'de yapıldı AMA şifrelendi
    - Frontend shuffle sırasını SAKLAMIYOR (localDeckOrder yok!)
    - Contract source of truth, frontend sadece decrypt ediyor
    - Bu daha güvenli: Oyuncu bile sonraki kartı tahmin edemez
```

---

## POPUP VE TX SAYISI

| İşlem | Popup | TX | Gas |
|-------|-------|-----|-----|
| End Turn butonu | ❌ | ❌ | ❌ |
| Contract.getHand() | ❌ | ❌ (view) | ❌ |
| userDecrypt (HTTP) | ❌ | ❌ | ❌ |
| Event trigger | ❌ | ❌ | ❌ |

**TOPLAM: 0 popup, 0 TX, 0 gas**

---

## KOD ÖRNEKLERİ

### game.js - onAfterShowStep() FHE Handler

```javascript
// FHE MODE: DrawCardAction tetiklendiginde kart cek
// Contract'tan getHand() + userDecrypt() ile yeni karti ogren (TX YOK!)
if (CONFIG.fheEnabled && action instanceof SDK.DrawCardAction) {
  var ownerId = action.getOwnerId();
  var myPlayerId = SDK.GameSession.getInstance().getMyPlayerId();

  if (ownerId === myPlayerId && !this._fheDecrypting) {
    this._fheDecrypting = true;
    var fheSession = FHEGameSession.getInstance();

    Logger.module('FHE').log('[DRAW] DrawCardAction detected for my player');

    // Contract'tan getHand + decrypt (TX yok, gas yok)
    fheSession.drawCard()
      .then(function(cardId) {
        if (cardId !== null) {
          Logger.module('FHE').log('[DRAW] FHE card drawn:', cardId);
          EventBus.getInstance().trigger(EVENTS.fhe_card_drawn, { cardId: cardId });
        } else {
          Logger.module('FHE').warn('[DRAW] Deck empty - fatigue!');
        }
        this._fheDecrypting = false;
      }.bind(this))
      .catch(function(error) {
        Logger.module('FHE').error('[DRAW] FHE draw failed:', error);
        this._fheDecrypting = false;
      }.bind(this));
  }
}
```

### fheGameSession.js - drawCard()

```javascript
FHEGameSession.prototype.drawCard = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (!self.contract || self.gameId === null) {
      reject(new Error('Not in a game'));
      return;
    }

    var previousHandSize = self.decryptedHand.length;
    Logger.module('FHE_GAME').log('[DRAW] Previous hand size:', previousHandSize);

    // Contract'tan yeni hand'i al ve decrypt et
    self.decryptHand()
      .then(function(newHand) {
        Logger.module('FHE_GAME').log('[DRAW] New hand size:', newHand.length);

        if (newHand.length > previousHandSize) {
          var newCardId = newHand[newHand.length - 1];
          Logger.module('FHE_GAME').log('[DRAW] New card drawn:', newCardId);
          resolve(newCardId);
        } else {
          Logger.module('FHE_GAME').warn('[DRAW] No new card (deck empty or hand full)');
          resolve(null);
        }
      })
      .catch(function(error) {
        Logger.module('FHE_GAME').error('[DRAW] Failed:', error);
        reject(error);
      });
  });
};
```

---

*Son güncelleme: 2025-12-11*
