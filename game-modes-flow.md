# FHEIGHT Game Modes - Complete Flow Documentation

Bu dosya tüm oyun modlarının akışını, validasyonlarını ve parametrelerini içerir.
FHE entegrasyonu için her modun nasıl çalıştığını bilmemiz gerekiyor.

---

## ÖZET: 9 OYUN MODU

| Mod | Tip | Deck Zorunlu? | Network? | FHE Uygun? |
|-----|-----|---------------|----------|------------|
| Ranked | Multiplayer | EVET (prod: 40 kart) | EVET | Gelecekte |
| Casual | Multiplayer | EVET (prod: 40 kart) | EVET | Gelecekte |
| Friendly | Multiplayer | EVET (prod: 40 kart) | EVET | Gelecekte |
| Gauntlet | Multiplayer | Draft bazlı (31 kart) | EVET | Gelecekte |
| Rift | Multiplayer | Rift deck | EVET | Gelecekte |
| Single Player | vs AI | EVET (27-40 kart)* | EVET (server AI) | EVET - Öncelik |
| Boss Battle | vs AI | EVET (27-40 kart)* | EVET (server AI) | EVET |
| Challenge | Local | HAYIR (scripted) | HAYIR | HAYIR |
| Sandbox | Local | 2 deck gerekli | HAYIR | HAYIR |

**\*Not:** Development/Staging ortamlarında `allCardsAvailable: true` olduğundan deck validasyonu ATLANIR!

---

## 1. RANKED (Competitive Multiplayer)

### Giriş Noktası
- **UI Dosya**: `app/ui/views/composite/deck_select_ranked.js`
- **Event**: `EVENTS.matchmaking_start`

### Validasyon
```javascript
NewPlayerManager.canPlayRanked() // Zorunlu
// Deck: 40 kart
// General: deck[0] must be general
```

### Parametreler
```javascript
{
  deck: Array(40),           // 40 kartlık deste
  factionId: number,         // Faction ID
  gameType: SDK.GameType.Ranked,
  generalId: number,         // General kart ID
  cardBackId: string,        // Kozmetik
  battleMapId: string,       // Kozmetik
  hasPremiumBattleMaps: bool
}
```

### Akış
1. Oyuncu deck seçer
2. `onConfirmSelection()` çağrılır
3. `GamesManager.findNewGame()` çağrılır
4. `POST /matchmaking` endpoint'ine istek
5. Firebase `/user-games` watch başlar
6. Eşleşme bulununca `App._joinGame()`

### Backend Endpoints
- `POST /matchmaking` - Eşleşme kuyruğuna gir
- `DELETE /matchmaking` - Kuyruktan çık
- `GET /api/me/rank` - Rank bilgisi
- `POST /api/me/rank` - Rank güncelle
- `GET /api/me/rank/history` - Rank geçmişi
- `GET /api/me/rank/current_ladder_position` - Sıralama

### Ödüller
- Faction XP
- Rank değişimi (win/loss)

---

## 2. CASUAL (Unranked Multiplayer)

### Giriş Noktası
- **UI Dosya**: `app/ui/views/composite/deck_select_unranked.js`
- **Event**: `EVENTS.matchmaking_start`

### Validasyon
```javascript
NewPlayerManager.canPlayQuickMatch() // Zorunlu
// Deck: 40 kart
```

### Parametreler
```javascript
{
  deck: Array(40),
  factionId: number,
  gameType: SDK.GameType.Casual, // Fark bu
  generalId: number,
  cardBackId: string,
  battleMapId: string
}
```

### Akış
Ranked ile aynı, sadece `gameType` farklı.

### Ödüller
- Faction XP
- Rank ETKİLEMEZ

---

## 3. FRIENDLY (Friend Match)

### Giriş Noktası
- **UI Dosya**: `app/ui/views/composite/deck_select_friendly.js`
- **Event**: `EVENTS.matchmaking_start`

### Özel Özellikler
- Custom deck + Gauntlet run + Rift run destekler
- Davet sistemi var (`GamesManager.inviteId`)

### Parametreler
```javascript
{
  deck: Array(40),
  factionId: number,
  gameType: SDK.GameType.Friendly,
  generalId: number,
  ticketId: string,    // Gauntlet/Rift için opsiyonel
  inviteId: string     // Arkadaş daveti
}
```

### Deck Transformasyonu
```javascript
// Eğer Gauntlet veya Rift deck ise:
if (isGauntlet || isRift) {
  generalId = model.generalId;
  ticketId = model.ticketId;
}
```

---

## 4. GAUNTLET (Arena Draft)

### Giriş Noktası
- **UI Dosya**: `app/ui/views/layouts/arena_layout.js` (deck_select DEĞİL!)
- **Event**: Draft sonrası matchmaking

### Özel Özellikler
- Draft bazlı deste oluşturma
- Ticket gerekli
- Özel arena layout

### Akış
1. Ticket satın al/kullan
2. Draft fazı (kart seçimi)
3. `GamesManager.findNewGame(..., ticketId)`
4. Matchmaking

### Backend Endpoints
- `GET /api/me/gauntlet/runs` - Aktif run'lar
- `GET /api/me/gauntlet/runs/decks` - Run deck'leri
- `POST /api/me/gauntlet/run` - Yeni run başlat
- `GET /api/me/gauntlet/run/:ticketId` - Run detayı

### Ödüller
- Faction XP
- Rank etkisi
- Kart/Gold ödülleri (win sayısına göre)

---

## 5. RIFT (Seasonal Progression)

### Giriş Noktası
- **UI Dosya**: `app/ui/views/layouts/rift_layout.js`

### Özel Özellikler
- Sezonluk içerik
- Rift-only deck'ler
- Ticket gerekli

### Backend Endpoints
- `GET /api/me/rift/runs`
- `GET /api/me/rift/runs/decks`
- `POST /api/me/rift/run`
- `GET /api/me/rift/run/:ticketId`

---

## 6. SINGLE PLAYER (Practice vs AI) - FHE ÖNCELİK

### Giriş Noktası
- **UI Dosya**: `app/ui/views/composite/deck_select_single_player.js`
- **Event**: `EVENTS.start_single_player`
- **Handler**: `App._startSinglePlayerGame()`

### Validasyon
```javascript
// deck_select_single_player.js
onConfirmSelection: function() {
  // Deck seçili mi kontrol
  var deckModel = this.selectedDeckModel;
  if (deckModel == null) return;

  // Deck kartlarını al
  var deck = deckModel.get('cards');
  // General ID = deck[0].id
  var generalId = deck[0].id;
}
```

### Parametreler
```javascript
{
  myPlayerDeck: Array,        // Deck kartları (boyut esnek?)
  myPlayerFactionId: number,
  myPlayerGeneralId: number,  // deck[0].id
  myPlayerCardBackId: string,
  myPlayerBattleMapId: string,
  aiGeneralId: number,        // Rakip AI general
  aiDifficulty: number,       // Opsiyonel
  aiNumRandomCards: number    // Opsiyonel
}
```

### Rakip Seçimi
```javascript
// Faction progression'a göre önerilen rakip
if (Faction5.level == null) -> Faction5 General
else if (Faction3.level) -> Faction3 General
// vs.
```

### Akış (Normal)
1. Rakip seç (AI General)
2. Deck seç
3. `onConfirmSelection()` -> `EVENTS.start_single_player`
4. `App._startSinglePlayerGame()` çağrılır
5. `POST /api/me/games/single_player` endpoint'ine istek
6. Server oyun oluşturur, AI'ı başlatır
7. `App._joinGame()` ile oyuna katıl

### Akış (FHE Enabled)
```javascript
// application.js
App._startSinglePlayerGame = function(...) {
  if (CONFIG.fheEnabled) {
    return App._startSinglePlayerGameFHE(...);
  }
  // Normal akış...
}
```

### FHE Akışı
1. Wallet connect (eğer bağlı değilse)
2. FHE Session init (EIP-712 imza)
3. `GameSession.createGame()` contract çağrısı
4. `POST /api/me/games/single_player` (fhe_enabled: true ile)
5. Oyun başlar

### Backend Endpoint
```javascript
POST /api/me/games/single_player
{
  deck: Array,
  cardBackId: string,
  battleMapId: string,
  hasPremiumBattleMaps: bool,
  ai_general_id: number,
  ai_difficulty: number,      // Opsiyonel
  ai_num_random_cards: number, // Opsiyonel
  ai_username: string,
  // FHE için ek:
  fhe_enabled: bool,
  fhe_game_id: number,
  fhe_contract_address: string,
  fhe_player_wallet: string
}
```

### Ödüller
- Faction XP
- Rank ETKİLEMEZ

---

## 7. BOSS BATTLE

### Giriş Noktası
- **UI Dosya**: `app/ui/views/composite/deck_select_boss_battle.js`
- **Event**: `EVENTS.start_boss_battle`
- **Handler**: `App._startBossBattleGame()`

### Özel Özellikler
- Single Player'ı extend eder
- Sadece aktif boss event'leri gösterir
- Boss yenilme durumu takip edilir

### Rakip Seçimi
```javascript
// Otomatik ilk boss seçilir
ProgressionManager.getCurrentBossEventModels()
```

### Akış
1. Boss otomatik seçilir (veya listeden seç)
2. Deck seç
3. `onConfirmSelection()` -> `EVENTS.start_boss_battle`
4. `App._startBossBattleGame()`
5. `POST /api/me/games/boss_battle`

### Backend Endpoint
```javascript
POST /api/me/games/boss_battle
{
  deck: Array,
  cardBackId: string,
  battleMapId: string,
  ai_general_id: number,
  ai_username: string
  // difficulty ve random_cards YOK
}
```

### Ödüller
- Faction XP
- Boss yenilme kaydı
- Achievement/Ödül (ilk yenişte)

---

## 8. CHALLENGE (Scripted Scenarios)

### Giriş Noktası
- **UI Dosya**: `app/ui/views/composite/challenge_category_select.js`
- **Event**: `EVENTS.start_challenge`
- **Handler**: `App._startGameWithChallenge()`

### Özel Özellikler
- **TAMAMEN LOCAL** - Server yok
- Scripted senaryolar
- Tutorial'lar için kullanılır
- Deck GEREKMEZ (challenge tanımlar)

### Akış
1. Kategori seç
2. Challenge seç
3. `EVENTS.start_challenge` -> challenge objesi gönderilir
4. `App._startGameWithChallenge(challenge)`
5. `challenge.setupSession(SDK.GameSession)`
6. Local olarak oyun başlar

### Challenge Yapısı
```javascript
{
  type: string,           // Challenge tipi
  setupSession: function, // GameSession'ı configure eder
  // Deck, board durumu, vs. hepsi script'te
}
```

### Backend Endpoints
- **YOK** - Tamamen local

### Ödüller
- Attempt kaydı
- Completion ödülleri/achievement'lar

---

## 9. SANDBOX (2-Player Local)

### Giriş Noktası
- **UI Dosya**: `app/ui/views/composite/deck_select_sandbox.js`
- **Event**: `EVENTS.start_challenge`

### Özel Özellikler
- **TAMAMEN LOCAL** - Server yok
- 2 OYUNCU için 2 DECK gerekli
- Sırayla P1 ve P2 deck seçimi
- Developer modu var (sadece non-production)

### State Machine
```
1. Player 1 deck seç
2. Otomatik Player 2'ye geç
3. Player 2 deck seç
4. Her iki deck onaylandığında başla
```

### Kaydedilen Config
```javascript
CONFIG.lastSelectedSandboxPlayer1DeckId
CONFIG.lastSelectedSandboxPlayer2DeckId
```

### Akış
1. P1 deck seç -> Confirm
2. UI otomatik P2'ye geçer
3. P2 deck seç -> Confirm
4. Her iki deck ile challenge oluştur
5. `EVENTS.start_challenge`
6. Local oyun başlar

### Developer Modu
```javascript
// Sadece non-production'da
SDK.PlayModes.Developer // Ek test özellikleri
```

### Backend Endpoints
- **YOK** - Tamamen local

### Ödüller
- **YOK** - Test amaçlı

---

## ORTAK VALİDASYON KURALLARI

### CONFIG Değerleri
```javascript
// app/common/config.js
CONFIG.MAX_DECK_SIZE = 40;              // Standart deck boyutu
CONFIG.MIN_BASICS_DECK_SIZE = 27;       // Starter deck minimum
CONFIG.MAX_DECK_SIZE_GAUNTLET = 31;     // Gauntlet deck boyutu
CONFIG.DECK_SIZE_INCLUDES_GENERAL = true; // General deck'e dahil
CONFIG.MAX_DECK_DUPLICATES = 3;         // Aynı karttan max 3
```

### Server Deck Validasyonu
```coffeescript
# server/lib/data_access/users.coffee - isAllowedToUseDeck()

# 1. İlk kart general olmalı
generalId = deck[0]?.id
generalCard = SDK.GameSession.getCardCaches().getCardById(generalId)
if not generalCard?.isGeneral
  throw "First card must be a general"

# 2. Deck boyutu kontrolü
maxDeckSize = if CONFIG.DECK_SIZE_INCLUDES_GENERAL
  then CONFIG.MAX_DECK_SIZE
  else CONFIG.MAX_DECK_SIZE + 1  # = 40

# 3. Starter deck (sadece basic kartlar)
if basicsOnly
  if deck.length < CONFIG.MIN_BASICS_DECK_SIZE  # 27
    throw "Starter decks must have at least 27 cards"
  if deck.length > maxDeckSize  # 40
    throw "Starter decks must not have more than 40 cards"

# 4. Normal deck (non-basic kartlar içerir)
else if deck.length != maxDeckSize  # TAM 40 OLMALI
  throw "Deck must have 40 cards"

# 5. Max 3 adet aynı kart
# 6. Max 1 general
# 7. Max 1 mythron kart
# 8. Max 1 trial kart total
```

### Starter Deck Boyutları (factionFactory.js)
```javascript
// Her faction için tanımlı starter deck = 28 KART
// Örnek: Faction1 (Lyonar) starter deck
starterDeck: [
  {id: Cards.Faction1.General},      // 1 General
  {id: Cards.Artifact.SunstoneBracers}, // x3
  {id: Cards.Spell.TrueStrike},      // x3
  {id: Cards.Spell.WarSurge},        // x3
  // ... toplam 28 kart
]

// Level 0'da: 28 kart
// Level arttıkça unlock edilen kartlar eklenir
// Max level'da: 28 + (level başına unlock kartlar * 3)
```

### Deck Grupları
```javascript
'starter'  // Başlangıç desteleri (27-40 arası kabul)
'custom'   // Özel desteler (TAM 40 kart zorunlu)
```

### New Player Kontrolleri
```javascript
NewPlayerManager.canPlayRanked()     // Ranked için
NewPlayerManager.canPlayQuickMatch() // Casual için
```

### Kozmetikler
```javascript
cardBackId: string,
battleMapId: string,
hasPremiumBattleMaps: bool
```

---

## FHE ENTEGRASYON PLANI

### Öncelik Sırası
1. **Single Player** - En basit, server AI
2. **Boss Battle** - Single Player'a benzer
3. **Ranked/Casual** - Multiplayer, daha karmaşık
4. **Gauntlet/Rift** - Özel mekanikler

### Single Player FHE Gereksinimleri
- Deck 40 kart olmalı (contract sabit)
- General ID gerekli
- Session key imzası gerekli
- Contract'ta oyun oluşturma

### Contract Uyumu
```solidity
// GameSession.sol
uint8 constant DECK_SIZE = 40;

function createGame(
  address fheWallet,
  uint32 generalCardId,
  uint16[40] calldata deckCardIds
) external returns (uint256 gameId);
```

### CEVAPLANAN SORULAR

#### 1. Single Player'da deck her zaman 40 kart mı?
**HAYIR!** İki durum var:
- **Starter deck** (sadece basic kartlar): 27-40 arası kabul edilir
- **Custom deck** (non-basic kartlar içerir): TAM 40 kart zorunlu

Validasyon kodu (`server/lib/data_access/users.coffee:927-936`):
```coffeescript
if basicsOnly
  if deck.length < 27 → HATA
  if deck.length > 40 → HATA
else  # non-basic kartlar var
  if deck.length != 40 → HATA
```

#### 2. Starter deck'ler 40 kart mı?
**HAYIR!** Starter deck'ler 28 kart ile tanımlanmış:
- factionFactory.js'de her faction için 28 kartlık starter deck var
- Level 0'da oyuncu 28 kart ile başlar
- Level arttıkça unlock edilen kartlar eklenir
- MIN_BASICS_DECK_SIZE = 27 (1 kart tolerance)

#### 3. AI deck'i kim oluşturuyor?
**SERVER!** AI deck'i `createSinglePlayerGame()` fonksiyonunda server tarafından oluşturuluyor.
Contract sadece oyuncu deck'ini tutar.

---

## FHE İÇİN ÇÖZÜM ÖNERİLERİ

### Seçenek 1: Contract'ı Esnek Yap
```solidity
// Değişken boyutlu deck kabul et
function createGame(
  address fheWallet,
  uint32 generalCardId,
  uint16[] calldata deckCardIds  // 27-40 arası
) external returns (uint256 gameId);
```

### Seçenek 2: Starter Deck'leri 40'a Tamamla
FHE modu için starter deck'leri backend'de 40'a tamamla:
```javascript
if (fheEnabled && deck.length < 40) {
  // Neutral basic kartlarla doldur
  while (deck.length < 40) {
    deck.push({ id: Cards.Neutral.PutridMindflayer });
  }
}
```

### Seçenek 3: FHE Sadece Custom Deck'lerle
FHE modunu sadece 40 kartlık custom deck'ler için aktif et.
Starter deck ile FHE oynanamaz.

### ÖNERİLEN: Seçenek 3
En temiz çözüm. Kullanıcıya "FHE modu için 40 kartlık deck gerekli" uyarısı göster.

---

## KEY FILES

| Dosya | Açıklama |
|-------|----------|
| `app/sdk/gameType.js` | Game type tanımları |
| `app/ui/views/layouts/play.js` | Play modu router |
| `app/ui/managers/games_manager.js` | Matchmaking controller |
| `app/ui/views/composite/deck_select.js` | Base deck selector |
| `app/application.js` | Game start handlers |
| `server/routes/api/me/games.js` | Backend game endpoints |

---

---

## END TURN AKIŞI (NORMAL MOD) - TAM DETAY

### ÖZET
```
End Turn butonu → EndTurnAction → p_endTurn() → EVENTS.end_turn
                                            ↓
                                 [Action queue boşalınca]
                                            ↓
                          deck.actionsDrawNewCards() → DrawCardAction
                                            ↓
                          DrawCardAction._execute() → deck'ten kart çek
                                            ↓
                          PutCardInHandAction._execute() → hand'e kart ekle
```

### ADIM 1: END TURN BUTONU
**Dosya:** `app/ui/views/item/game_bottom_bar.js:142-154`

```javascript
onClickSubmitTurn: function () {
  var gameLayer = Scene.getInstance().getGameLayer();
  var gameSession = SDK.GameSession.getInstance();
  if (gameLayer && gameLayer.getIsMyTurn() && !gameLayer.getPlayerSelectionLocked()) {
    // EndTurnAction oluştur ve gönder
    gameSession.submitExplicitAction(gameSession.actionEndTurn());
  }
},
```

### ADIM 2: END TURN ACTION EXECUTE
**Dosya:** `app/sdk/actions/endTurnAction.js:28-30`

```javascript
_execute() {
  return this.getGameSession().p_endTurn();
}
```

**NOT:** EndTurnAction hand/deck DEĞİŞTİRMEZ! Sadece p_endTurn() çağırır.

### ADIM 3: P_ENDTURN - TUR BİTİŞİ
**Dosya:** `app/sdk/gameSession.js:1576-1591`

```javascript
p_endTurn() {
  if (this.isActive() && !this.getCurrentTurn().getEnded()) {
    const currentPlayer = this.getCurrentPlayer();

    // 1. Turu bitmiş olarak işaretle
    this.currentTurn.setEnded(true);

    // 2. Tur'u player ID ile etiketle
    this.currentTurn.setPlayerId(currentPlayer.getPlayerId());

    // 3. Bitmiş turu stack'e ekle
    this.turns.push(this.currentTurn);

    // 4. END_TURN event'i yayınla
    return this.pushEvent({
      type: EVENTS.end_turn,
      action: this.getExecutingAction(),
      executeAuthoritativeSubActions: !this.getIsRunningAsAuthoritative(),
      turn: this.currentTurn,
      gameSession: this
    });
  }
}
```

**NOT:** p_endTurn() hand/deck DEĞİŞTİRMEZ! Sadece turn state günceller ve event yayınlar.

### ADIM 4: ACTION QUEUE BOŞALINCA - KART ÇEKİMİ TETİKLENİR
**Dosya:** `app/sdk/gameSession.js:2173-2186`

```javascript
// _onExecuteQueueAction içinde, queue boşalınca:
} else if (this.getCurrentTurn().getEnded()) {
  // Tur bittiyse ve queue boşaldıysa KART ÇEK
  if (!this._private.hasDrawnCardsForTurn) {
    this._private.hasDrawnCardsForTurn = true;

    // deck.actionsDrawNewCards() → DrawCardAction array döner
    let drawCardActionsForTurn = this.getCurrentPlayer().getDeck().actionsDrawNewCards();

    if ((drawCardActionsForTurn != null) && (drawCardActionsForTurn.length > 0)) {
      const drawCardActionsToExecute = drawCardActionsForTurn;
      drawCardActionsForTurn = null;

      // Her DrawCardAction execute edilir
      for (action of Array.from(drawCardActionsToExecute)) {
        this.executeAction(action);
      }
    }
  }
}
```

**HOOK:** Bu noktada FHE için kart çekimi yapılmalı!

### ADIM 5: DECK.ACTIONSDRAWNEWCARDS - DRAWCARDACTION OLUŞTURMA
**Dosya:** `app/sdk/cards/deck.js:271-302`

```javascript
actionsDrawNewCards() {
  const actions = [];

  // Varsayılan çekilecek kart sayısı (CONFIG.CARD_DRAW_PER_TURN = 1)
  let numRemainingActions = CONFIG.CARD_DRAW_PER_TURN;

  // Modifier'lar ile değişebilir (örn: +1 kart çek modifier'ı)
  let cardDrawChange = 0;
  for (var cardDrawModifier of Array.from(this.getOwner().getPlayerModifiersByClass(PlayerModifierCardDrawModifier))) {
    cardDrawChange += cardDrawModifier.getCardDrawChange();
  }
  numRemainingActions += cardDrawChange;

  // Elde boş slot varsa doldur
  for (let i = 0; i < CONFIG.MAX_HAND_SIZE; i++) {
    if (numRemainingActions === 0) break;

    if (this.hand[i] == null) {  // Boş slot
      actions.push(this.actionDrawCard());  // DrawCardAction oluştur
      numRemainingActions--;
    }
  }

  // El doluysa kart yak (burn)
  while ((numRemainingActions > 0) && !this.getGameSession().getIsDeveloperMode()) {
    actions.push(this.actionDrawCard());
    numRemainingActions--;
  }

  return actions;
}
```

### ADIM 6: DRAWCARDACTION._EXECUTE - DECK'TEN KART ÇEK
**Dosya:** `app/sdk/actions/drawCardAction.js:28-76`

```javascript
_execute() {
  if (this.getGameSession().getIsRunningAsAuthoritative()) {
    let index;
    const player = this.getGameSession().getPlayerById(this.getOwnerId());
    const deck = player.getDeck();
    const drawPile = deck.getDrawPile();  // deck.drawPile array'i

    // FHE MODE CHECK - FHE player için skip (şu an)
    const gameSession = this.getGameSession();
    if (gameSession.fheEnabled) {
      const aiPlayerId = gameSession.getAiPlayerId && gameSession.getAiPlayerId();
      const isAiPlayer = aiPlayerId && this.getOwnerId() === aiPlayerId;

      if (!isAiPlayer) {
        // FHE human player - blockchain'den gelecek, skip
        this._fheSkipped = true;
        return;
      }
    }

    // KART SEÇİMİ (DECK'TEN)
    if (this.cardIndexFromDeck != null) {
      // Belirli kart çekme (spell efekti vs.)
      index = this.cardIndexFromDeck;
    } else if (!this.getGameSession().getAreDecksRandomized()) {
      // Developer mode - en sondaki kart (deterministik)
      index = drawPile.length - 1;
    } else {
      // Normal mod - random index
      index = this.getGameSession().getRandomIntegerForExecution(drawPile.length);
    }

    // cardDataOrIndex = çekilecek kartın index'i veya data'sı
    this.cardDataOrIndex = this.cardIndexFromDeck || drawPile[index];

    // Deck boşsa - HURTING DAMAGE (fatigue)
    if (this.getIsDrawFromEmptyDeck() && !this.burnCard) {
      const damageTarget = this.getGameSession().getGeneralForPlayerId(this.getOwnerId());
      const hurtingDamageAction = new HurtingDamageAction(this.getGameSession());
      hurtingDamageAction.setOwnerId(this.getOwnerId());
      hurtingDamageAction.setTarget(damageTarget);
      this.getGameSession().executeAction(hurtingDamageAction);
    }
  }

  // Parent class: PutCardInHandAction._execute() çağır
  return super._execute();
}
```

### ADIM 7: PUTCARDINHANDACTION._EXECUTE - HAND'E KART EKLE
**Dosya:** `app/sdk/actions/putCardInHandAction.js:100-134`

```javascript
_execute() {
  super._execute();

  if (this.cardDataOrIndex != null) {
    const card = this.getCard();  // cardDataOrIndex'ten Card objesi oluştur
    const deck = this.getGameSession().getPlayerById(this.getOwnerId()).getDeck();

    // Server tarafı: card data regenerate
    if (this.getGameSession().getIsRunningAsAuthoritative()) {
      // ... card data işlemleri
    }

    if (this.burnCard) {
      // El doluysa burn
      this.indexOfCardInHand = this.getGameSession().applyCardToHand(deck, this.cardDataOrIndex, card, this.indexOfCardInHand, this, true);
    } else {
      // HAND'E EKLE
      this.indexOfCardInHand = this.getGameSession().applyCardToHand(deck, this.cardDataOrIndex, card, this.indexOfCardInHand, this);
    }
  }
}
```

### ADIM 8: GAMESESSION.APPLYCARDSTOHAND - ASIL DEĞİŞİKLİK
**Dosya:** `app/sdk/gameSession.js:3338-3409`

```javascript
applyCardToHand(deck, cardDataOrIndex, card, indexInHand, sourceAction, burnCard) {
  if (deck != null) {
    if (card != null) {
      card.applyCardData(cardDataOrIndex);
    }

    // 1. Kartı indexle
    const cardIndex = this._indexCardAsNeeded(card, cardDataOrIndex);

    // 2. DECK'TEN ÇIKAR (eğer oradaysa)
    this._removeCardFromCurrentLocation(card, cardIndex, sourceAction);

    if (burnCard) {
      indexInHand = null;
    } else {
      // 3. HAND'E EKLE
      if (indexInHand != null) {
        deck.putCardIndexInHandAtIndex(cardIndex, indexInHand);
      } else {
        indexInHand = deck.putCardIndexInHand(cardIndex);
      }
    }

    if (card != null) {
      // Event: apply_card_to_hand
      this.pushEventTypeToStack("apply_card_to_hand");
      this.pushCardToStack(card);

      if (indexInHand == null) {
        card.onRemoveFromHand(deck, sourceAction);  // Burn
      } else {
        card.onApplyToHand(deck, sourceAction);     // Normal
      }

      this.popCardFromStack(card);
      this.popEventTypeFromStack();
    }
  }
  return indexInHand;
}
```

### ADIM 9: _REMOVECARDFROMCURRENTLOCATION - DECK'TEN ÇIKARMA
**Dosya:** `app/sdk/gameSession.js:3204-3235`

```javascript
_removeCardFromCurrentLocation(card, cardIndex, sourceAction) {
  if (card != null) {
    const owner = card.getOwner();

    if (card.getIsLocatedInDeck()) {
      // DECK'TEN ÇIKAR
      indexRemoved = this.removeCardByIndexFromDeck(owner.getDeck(), cardIndex, card, sourceAction);
      // ...
    }
    // ... diğer location'lar
  }
}
```

### ADIM 10: DECK.REMOVECARDINDEXFROMDECK - DRAWPILE'DAN ÇIKARMA
**Dosya:** `app/sdk/cards/deck.js:372-389`

```javascript
removeCardIndexFromDeck(cardIndex) {
  let indexOfCard = null;

  if (cardIndex != null) {
    for (let i = 0; i < this.drawPile.length; i++) {
      var existingCardIndex = this.drawPile[i];
      if (existingCardIndex != null && existingCardIndex === cardIndex) {
        indexOfCard = i;
        this.drawPile.splice(i, 1);  // ARRAY'DEN ÇIKAR
        this.flushCachedCards();
        break;
      }
    }
  }
  return indexOfCard;
}
```

### ADIM 11: DECK.PUTCARDINDEXINHAND - HAND'E EKLEME
**Dosya:** `app/sdk/cards/deck.js:332-348`

```javascript
putCardIndexInHand(cardIndex) {
  let indexOfCardInHand = null;

  if (cardIndex != null) {
    // İlk boş slotu bul
    for (let i = 0; i < CONFIG.MAX_HAND_SIZE; i++) {
      if (this.hand[i] == null) {
        this.hand[i] = cardIndex;  // HAND ARRAY'E EKLE
        indexOfCardInHand = i;
        this.flushCachedCardsInHand();
        break;
      }
    }
  }
  return indexOfCardInHand;
}
```

---

## ÖZET: DECK VE HAND DEĞİŞİKLİĞİ NEREDE?

| Adım | Metod | Değişiklik |
|------|-------|------------|
| 1-4 | EndTurn → p_endTurn | **DEĞİŞİKLİK YOK** - Sadece turn state |
| 5 | deck.actionsDrawNewCards() | **DEĞİŞİKLİK YOK** - Sadece action oluştur |
| 6 | DrawCardAction._execute() | **KARAR** - Hangi kart çekilecek (index belirleme) |
| 7 | PutCardInHandAction._execute() | **DEĞİŞİKLİK BAŞLANGIÇ** - applyCardToHand çağırır |
| 8 | gameSession.applyCardToHand() | **ORCHESTRATION** - deck'ten çıkar, hand'e ekle |
| 9 | _removeCardFromCurrentLocation() | **DECK DEĞİŞİKLİĞİ** - deck.drawPile'dan çıkar |
| 10 | deck.removeCardIndexFromDeck() | **drawPile.splice()** - Array'den çıkarma |
| 11 | deck.putCardIndexInHand() | **HAND DEĞİŞİKLİĞİ** - hand[i] = cardIndex |

---

## FHE İÇİN HOOK NOKTASI

**En uygun yer:** `gameSession.js:2173-2186` - Action queue boşalınca

```javascript
} else if (this.getCurrentTurn().getEnded()) {
  if (!this._private.hasDrawnCardsForTurn) {
    this._private.hasDrawnCardsForTurn = true;

    // ========== FHE HOOK NOKTASI ==========
    // Burada FHE için:
    // 1. Contract'tan deck[deckIndex] oku (view call)
    // 2. userDecrypt ile kartı aç
    // 3. SDK deck/hand'e ekle (local)
    // 4. deckIndex++ (local)
    // =========================================

    let drawCardActionsForTurn = this.getCurrentPlayer().getDeck().actionsDrawNewCards();
    // ...
  }
}
```

**VEYA** DrawCardAction._execute() içinde (şu anki FHE skip yerine decrypt yapılabilir)

---

## VERİ YAPILARI

### deck.drawPile (Array)
```javascript
// Deck'teki kartların INDEX'leri (card objeleri değil!)
drawPile = [cardIndex1, cardIndex2, cardIndex3, ...]

// Kart çekilince:
drawPile.splice(i, 1)  // index'i çıkar
```

### deck.hand (Array - Fixed Size 6)
```javascript
// Eldeki kartların INDEX'leri (null = boş slot)
hand = [cardIndex1, null, cardIndex3, cardIndex4, null, cardIndex6]
hand.length = 6  // Her zaman 6

// Kart eklenince:
hand[firstEmptySlot] = cardIndex
```

### Card Index vs Card ID
```javascript
// cardIndex = GameSession içindeki unique index
// cardId = Kart tipi (örn: Cards.Faction1.SilverguardKnight = 10101)

// cardIndex ile Card objesi alma:
const card = gameSession.getCardByIndex(cardIndex);

// Card'dan ID alma:
const cardId = card.getId();  // 10101
```

---

*Son güncelleme: 2025-12-11*
