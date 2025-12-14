normal fhe olmayan modda oynuyorum hiçbir problem yok
ilk başta 5 kart var ( 2 tanesi replace edilebilir ister et ister etme )
sonra continue basıyorum kartlar aşağya oturuyor 6 slot var 
az önceki 5 tane kart ( 2 tanesi replace edilmiş veya edilmemiş ) 6 slota oturuyor 1 slot boş
end turn diyince her zaman bir slot doluyor ( full dolu değilse )
deckdeki rakam sürekli azalıyor slot doldukça

bu akışı 1_GAME_START_NORMAL.md 2_END_TURN_ACTION_NORMAL.md de takip edeceksin.

ilk başta decrypt ediyoruz 5 kartı.
continue diyoruz kartlar alta yerleşiyor
sonra end turn diyince yeni kart gelmiyor 

bizim FHE de session ile ilerleyerek. 


FHE AKIŞ - Başlangıç eli (5 kart):

1. 6 slot tanımı: Aynı - app/common/config.js içinde CONFIG.MAX_HAND_SIZE = 6
2. 5 kartın yerleştirilmesi: _populateFHEHand(decryptedCardIds) çağrılıyor (game.js line 1017-1100). Bu fonksiyon blockchain'den gelen decrypt edilmiş 5 kart ID'sini alıyor.
3. _populateFHEHand fonksiyonu: Her kart için:
   var fheCard = CardFactory.cardForIdentifier(fheCardId, gameSession);
   var cardIndex = gameSession.generateIndex();
   fheCard.setIndex(cardIndex);
   fheCard.setOwnerId(myPlayerId);
   gameSession.cardsByIndex[cardIndex] = fheCard;
   deck.hand[i] = cardIndex;
4. Sonuç:
   - deck.hand = [cardIndex0, cardIndex1, cardIndex2, cardIndex3, cardIndex4, null]                                                                                                                                                                                                                                
   - 5 kart dolu, 6. slot (index 5) boş



FHE Akış - 6. Slot Dolumu (End Turn) - MEVCUT DURUM

OYUNCU END TURN BASILAR
│
▼
┌─────────────────────────────────────────────────────────┐
│ 1. EndTurnAction tetiklenir                             │
│    (Normal akışla aynı)                                 │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 2. Turn değişir, StartTurnAction oluşur                 │
│    (Normal akışla aynı)                                 │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 3. DrawCardAction sub-action olarak çalışır             │
│    app/sdk/actions/drawCardAction.js:28-50              │
│                                                         │
│    if (gameSession.fheEnabled) {                        │
│      const isAiPlayer = this.getOwnerId() === aiId;     │
│      if (!isAiPlayer) {                                 │
│        // FHE PLAYER İÇİN:                              │
│        this._fheSkipped = true;                         │
│        return;  ◄── BURADA DURUYOR!                     │
│      }                                                  │
│    }                                                    │
│                                                         │
│    -> super._execute() ÇAĞRILMIYOR                      │
│    -> deck.putCardIndexInHand() ÇAĞRILMIYOR             │
│    -> SDK deck.hand[] GÜNCELLENMİYOR                    │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 4. Frontend: onAfterShowStep() çalışır                  │
│    game.js:378-420                                      │
│                                                         │
│    var allActions = action.getFlattenedActionTree();    │
│    var myDrawCardActions = allActions.filter(...);      │
│                                                         │
│    if (myDrawCardActions.length > 0) {                  │
│      fheSession.drawCard()                              │
│        .then(function(cardId) {                         │
│          this._addFHECardToHand(cardId);                │
│        })                                               │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 5. fheGameSession.drawCard() çalışır                    │
│    fheGameSession.js:580-657                            │
│                                                         │
│    -> contract.getCardFromDeck(gameId, localDeckIndex)  │
│    -> userDecrypt ile kart ID decrypt edilir            │
│    -> self.decryptedHand.push(newCardId)                │
│    -> self.localDeckIndex++                             │
│    -> resolve(newCardId)   // Tek cardId döner          │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 6. _addFHECardToHand(cardId) çalışır                    │
│    game.js:950-1006                                     │
│                                                         │
│    var card = CardFactory.cardForIdentifier(cardId);    │
│    var cardIndex = card.getIndex();                     │
│    deck.hand[emptySlot] = cardIndex;  ◄── SDK GÜNCELLE  │
│    deck._indexesInHand.push(cardIndex);                 │
│    deck._cachedCardsInHand = null;                      │
│                                                         │
│    -> Görsel güncelleme yapılır                         │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 7. Sonuç:                                               │
│    -> SDK deck.hand[5] = cardIndex (6. slot dolar)      │
│    -> fheGameSession.decryptedHand'e de eklendi         │
│    -> Kart görsel olarak ele eklenir                    │
└─────────────────────────────────────────────────────────┘

Özet: FHE akışında DrawCardAction._execute() SDK mantığını ATLIYOR, bunun yerine frontend fheSession.drawCard() ile blockchain'den kartı alıp _addFHECardToHand() ile SDK'yı manuel güncelliyor.


================================================================================
FHE Akış - Kart Oynama (Board'a Koyma + Elden Eksilme) - MEVCUT SORUN
================================================================================

OYUNCU ELDEN KART SEÇER VE BOARD'A SÜRÜKLER
│
▼
┌─────────────────────────────────────────────────────────┐
│ 8. PlayCardFromHandAction oluşturulur                   │
│    app/view/layers/game/GameLayer.js:6411-6418          │
│                                                         │
│    -> Normal akışla AYNI - FHE kontrolü YOK!            │
│    -> submitExplicitAction() çağrılıyor                 │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 9. PlayCardFromHandAction._execute() çalışır            │
│    app/sdk/actions/playCardFromHandAction.js:87-111     │
│                                                         │
│    ❌ FHE KONTROLÜ YOK!                                 │
│    -> cardDataOrIndex = deck.getCardIndexInHandAtIndex()│
│                                                         │
│    SORUN: FHE modunda deck.hand[] bizim manuel          │
│    eklediğimiz cardIndex'leri içeriyor AMA              │
│    server tarafı bu kartları TANIMIYOR!                 │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 10. ApplyCardToBoardAction._execute() çalışır           │
│     app/sdk/actions/applyCardToBoardAction.js:127-165   │
│                                                         │
│     ❌ FHE KONTROLÜ YOK!                                │
│     -> applyCardToBoard(card, x, y, ...) çağrılır       │
│                                                         │
│     SORUN: Server bu kartı bilmiyor, validation         │
│     başarısız oluyor veya yanlış kart kullanılıyor!     │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 11. OYUNDAN ATILIYOR!                                   │
│                                                         │
│     NEDEN: Server tarafında FHE oyuncusunun             │
│     deck.hand[] boş veya yanlış (scrubbed) kartlar var  │
│     Client tarafında decrypt edilmiş gerçek kartlar var │
│     Bu uyuşmazlık validation hatasına yol açıyor        │
└─────────────────────────────────────────────────────────┘


================================================================================
SORUN ANALİZİ
================================================================================

NORMAL AKIŞ:
  Server deck.hand[] = [cardIndex1, cardIndex2, ...]  (GERÇEK KARTLAR)
  Client deck.hand[] = [cardIndex1, cardIndex2, ...]  (AYNI)
  -> PlayCardFromHandAction server'da çalışıyor ✓

FHE AKIŞ (MEVCUT - BOZUK):
  Server deck.hand[] = [null/scrubbed...]  (SERVER KARŞI TARAFIN ELİNİ BİLMEZ)
  Client deck.hand[] = [cardIndex1, cardIndex2, ...]  (BİZİM MANUEL EKLEDİĞİMİZ)
  -> PlayCardFromHandAction server'da çalışırken HATA ✗

  Server açısından:
  - FHE oyuncusunun eli "scrubbed" (gizli)
  - DrawCardAction FHE için return; yapıyor
  - Server deck.hand[] güncellenmedi
  - Kart oynandığında server "bu kart elde yok" diyor!


================================================================================
MEVCUT FHE FONKSİYONLARI (Henüz Entegre Edilmemiş)
================================================================================

fheGameSession.playCard(handSlot, x, y)
  - app/sdk/fhe/fheGameSession.js:666-738
  - decryptedHand[handSlot] dan kart ID alır
  - Blockchain TX atar (contract.playCard)
  - KMS'ten public decrypt proof alır
  - _removeCardFromHand(handSlot) çağırır

fheCardHandler.playCard(handSlot, x, y)
  - app/sdk/fhe/fheCardHandler.js:168-176
  - fheGameSession.playCard() wrapper

fheGameMode.playCard(handSlot, x, y)
  - app/sdk/fhe/fheGameMode.js:254-259
  - cardHandler.playCard() wrapper


================================================================================
ÇÖZÜM YAKLAŞIMI - TX OLMADAN NORMAL AKIŞA DEVAM
================================================================================

DrawCardAction'daki çözümü PlayCardFromHandAction için uygula:

OYUNCU ELDEN KART SEÇER VE BOARD'A SÜRÜKLER
│
▼
┌─────────────────────────────────────────────────────────┐
│ 8. PlayCardFromHandAction oluşturulur                   │
│    app/view/layers/game/GameLayer.js:6411-6418          │
│                                                         │
│    -> Normal akışla AYNI (değişiklik YOK)               │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 9. PlayCardFromHandAction._execute() - FHE EKLENMELİ    │
│    app/sdk/actions/playCardFromHandAction.js:87         │
│                                                         │
│    ⚠️ EKLENMESİ GEREKEN:                                │
│    if (gameSession.fheEnabled && !isAiPlayer) {         │
│      // FHE oyuncusu için normal akışa devam et         │
│      // AMA server tarafında deck.hand[] bizim          │
│      // eklediğimiz kartları bilmeli                    │
│    }                                                    │
│                                                         │
│    SORUN: Server FHE oyuncusunun elini bilmiyor!        │
└─────────────────────────────────────────────────────────┘


================================================================================
ASIL SORUN - Server/Client Sync
================================================================================

DrawCard çözümündeki mantık:
1. DrawCardAction._execute() server'da return; yapıyor (FHE için)
2. Frontend fheSession.drawCard() ile kartı alıyor
3. Frontend _addFHECardToHand() ile CLIENT'ın deck.hand[] güncelliyor
4. AMA SERVER'ın deck.hand[] hala boş/scrubbed!

Kart oynandığında:
1. Client PlayCardFromHandAction gönderiyor
2. Server deck.hand[slot] kontrol ediyor
3. Server'da bu slot null/scrubbed -> HATA!

ÇÖZÜM SEÇENEKLERİ:

A) Server tarafını da güncelle (ZOR):
   - Her drawCard sonrası server'a "kartı ekledim" bilgisi gönder
   - Server deck.hand[] senkronize et
   - Tüm action'lar normal çalışır

B) FHE için validation bypass (TEHLİKELİ):
   - Server'da FHE oyuncusu için validation atla
   - Client'a güven
   - Güvenlik riski!

C) Client-only mode (MEVCUT YAPIYLA UYUMLU):
   - FHE oyuncusu için tüm kart işlemleri client'ta
   - Server'a sadece sonuçlar (board state) gönderilir
   - Mevcut single_player yapısına benzer

D) Hybrid mode (ÖNERİLEN):
   - DrawCard sonrası kartın cardIndex'ini server'a bildir
   - Server deck.hand[] günceller (scrubbed değil, gerçek index)
   - PlayCardFromHandAction normal çalışır
   - Sadece kartın ne olduğu gizli kalır


================================================================================
ACİL FIX - PlayCardFromHandAction için minimum değişiklik
================================================================================

playCardFromHandAction.js:87 sonrasına ekle:

_execute() {
  // FHE MODE: Server tarafında validation'ı atla
  // Client tarafında kart zaten decrypt edilmiş
  const gameSession = this.getGameSession();
  if (gameSession.fheEnabled) {
    const aiPlayerId = gameSession.getAiPlayerId && gameSession.getAiPlayerId();
    const isAiPlayer = aiPlayerId && this.getOwnerId() === aiPlayerId;

    if (!isAiPlayer && gameSession.getIsRunningAsAuthoritative()) {
      // FHE human player - server'da validation'ı atla
      // Client zaten doğru kartı biliyor
      Logger.module('SDK').log('[FHE] PlayCardFromHandAction: Server validation bypass for FHE player');

      // Kartı client'tan al (cardDataOrIndex zaten set edilmiş)
      // Normal akışa devam et
    }
  }

  // ... normal akış devam ...
}