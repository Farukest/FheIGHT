# FHE Multiplayer Flow

## Dosya Referanslari

| Kisaltma | Dosya |
|----------|-------|
| CLIENT/deck_select | app/ui/views/composite/deck_select.js |
| CLIENT/games_manager | app/ui/managers/games_manager.js |
| CLIENT/fhe_session | app/sdk/fhe/fheGameSession.js |
| CLIENT/game_layout | app/ui/views2/layouts/game.js |
| CLIENT/game_bottom_bar | app/ui/views/composite/game_bottom_bar.js |
| CLIENT/game_choose_hand | app/ui/views/item/game_choose_hand.js |
| CLIENT/localization | app/localization/locales/en/battle.json |
| CLIENT/event_types | app/common/event_types.js |
| CLIENT/application | app/application.js |
| CLIENT/deck_select_boss | app/ui/views/composite/deck_select_boss_battle.js |
| SERVER/matchmaker | server/routes/matchmaker.coffee |
| SERVER/games_api | server/routes/api/me/games.coffee |
| SERVER/validators | server/validators/index.js |
| SERVER/tokenmanager | server/redis/r-tokenmanager.coffee |
| SERVER/worker | worker/creategame.coffee |
| SERVER/gameSetup | app/sdk/gameSetup.js |
| SERVER/game | server/game.coffee |
| SERVER/blockchain | server/lib/blockchain.coffee |

---

## ASAMA 1: Oyun Baslatma

### 1.1 Play butonuna basilir
```
DOSYA: deck_select.js -> onConfirmSelection()
```
- FHE aktifse `_initFHEAndFindGame()` cagrilir
- Wallet baglantisi ve PIN giris yapilir

### 1.2 Blockchain game olusturulur
```
DOSYA: fheGameSession.js -> createSinglePlayerGame()
```
- `contract.createSinglePlayerGame(gameId)` TX
- 40 adet FHE random uretilir (blockchain)

---

## ASAMA 2: Matchmaking

### 2.1 Client matchmaking request gonderir
```
DOSYA: games_manager.js -> findNewGameWithFHE()
```
```javascript
POST /matchmaking {
  deck: [...],
  factionId: 1,
  fhe_enabled: true,
  fhe_game_id: "1766103487556",
  fhe_contract_address: "0x...",
  fhe_player_wallet: "0x..."
}
```

### 2.2 Server token olusturur
```
DOSYA: matchmaker.coffee -> tokenData icine FHE alanlari eklenir
DOSYA: r-tokenmanager.coffee -> create() methodu
```
```coffee
token.fhe_enabled = opts.fhe_enabled
token.fhe_game_id = opts.fhe_game_id
token.fhe_contract_address = opts.fhe_contract_address
token.fhe_player_wallet = opts.fhe_player_wallet
```

### 2.3 Match bulunur, Worker job olusturulur
- Iki oyuncu eslestigi zaman `createGame` Kue job olusturulur
- Token'daki FHE bilgileri job data'sina aktarilir

---

## ASAMA 3: Game Session Olusturma

### 3.1 Worker FHE flag'lerini set eder
```
DOSYA: creategame.coffee
```
```coffee
if player1FheEnabled
  player1DataForGame.fhePlayer = true
  player1DataForGame.startingHandSize = 0  # KRITIK!
```

### 3.2 GameSetup deck'i hazirlar
```
DOSYA: gameSetup.js -> addCardsToDeck()
```
- FHE player icin deck ORIGINAL ORDER'da eklenir
- Hand BOS birakilir (kartlar blockchain'den gelecek)
- `gameSession.fheDeckOrders[playerId]` saklanir

### 3.3 DrawCardAction FHE icin skip edilir
```
DOSYA: drawCardAction.js -> _execute()
```
- FHE human player icin kart cekme SKIP edilir
- `this._fheSkipped = true` set edilir

---

## ASAMA 4: Game Server Baslangic

### 4.1 FHE state olusturulur
```
DOSYA: game.coffee -> initGameSession()
```
```coffee
games[gameId].fhe = {
  player1: {
    enabled: true
    blockchainGameId: "..."
    revealedCount: 0
    initialHandRevealComplete: false
    turnDrawComplete: true  # KRITIK: Baslangicta true
  }
  player2: { ... }
}
```

### 4.2 Turn timer BASLATILMAZ
- FHE oyuncular initial hand reveal yapana kadar timer bekler

---

## ASAMA 5: Ilk El Reveal

### 5.1 Client blockchain reveal yapar
```
DOSYA: fheGameSession.js -> revealInitialHand()
```
1. `contract.getDrawHandles(gameId, 5)` - encrypted handle'lar
2. `publicDecrypt(handles)` - Zama KMS decrypt
3. `contract.revealDrawBatch(gameId, clearIndices, proof)` - TX

### 5.2 Client server'a bildirir
```
DOSYA: fheGameSession.js
```
```javascript
socket.emit("fhe_initial_hand_revealed", {
  gameId: gameId,
  blockchainGameId: blockchainGameId
  // Kart bilgisi GONDERILMEZ!
});
```

### 5.3 Server blockchain'den dogrular
```
DOSYA: game.coffee -> onFHEInitialHandRevealed
DOSYA: blockchain.coffee -> verifyAndCalculateCards()
```
- `getVerifiedDrawOrder()` ile blockchain'den indices okunur
- Kartlar SDK'ya uygulanir
- `initialHandRevealComplete = true` set edilir

### 5.4 Tum oyuncular hazirsa timer baslar
```
DOSYA: game.coffee
```
- Her iki oyuncu da reveal tamamladiysa `restartTurnTimer(gameId)`

---

## ASAMA 6: Turn Sonu (KRITIK AKIS)

### 6.1 Oyuncu End Turn'e basar
```
CLIENT: EndTurnAction gonderilir
SERVER: SDK EndTurnAction ve StartTurnAction step'lerini olusturur
```

### 6.2 Server EndTurnAction step'ini isler
```
DOSYA: game.coffee -> onStep()
```
```coffee
if action instanceof SDK.EndTurnAction
  # ONCE: turnDrawComplete = false set et
  endingPlayerId = action.getOwnerId()
  endingPlayerFhe = getFHEStateForPlayer(gameId, endingPlayerId)
  if endingPlayerFhe?.enabled
    endingPlayerFhe.turnDrawComplete = false

  # SONRA: Step'i emit et
  emitGameEvent(null, gameId, stepEventData)
```

### 6.3 Server StartTurnAction step'ini TUTAR
```
DOSYA: game.coffee -> onStep()
```
```coffee
if action instanceof SDK.StartTurnAction
  # Diger oyuncunun (turn'u bitiren) FHE durumu kontrol et
  if endingPlayerFhe?.enabled and not endingPlayerFhe.turnDrawComplete
    # Step'i TUT, gonderme!
    game.pendingStartTurnStep = stepEventData
    return
```

**KRITIK:** StartTurnAction step'i gonderilmezse client oynayamaz!

### 6.4 stepCount dogru hesaplanir
```
DOSYA: game.coffee -> onGameTimeTick()
```
```coffee
totalStepCount = gameSession.getStepCount() - buffer.length
if games[gameId].pendingStartTurnStep?
  totalStepCount = totalStepCount - 1  # Bekleyen step icin -1
```

**KRITIK:** Bu olmadan client "behind server step count" hatasi alir!

---

## ASAMA 7: FHE Decrypt ve Turn Gecisi

### 7.1 Client incrementTurn TX gonderir
```
DOSYA: fheGameSession.js -> incrementTurn()
```
- `contract.incrementTurn(gameId)` TX

### 7.2 Client yeni kart reveal yapar
```
DOSYA: fheGameSession.js -> revealDrawCard()
```
1. `getDrawHandles(gameId, 1)` - 1 handle
2. `publicDecrypt([handle])` - KMS decrypt
3. `revealDrawBatch(gameId, [clearIndex], proof)` - TX

### 7.3 Client server'a bildirir
```
DOSYA: fheGameSession.js
```
```javascript
socket.emit("fhe_card_drawn", {
  gameId: gameId,
  turn: currentTurn
});
```

### 7.4 Server blockchain'den dogrular
```
DOSYA: game.coffee -> onFHECardDrawn
```
- `getVerifiedDrawOrder()` ile blockchain'den TUM indices okunur
- Son kart hesaplanir ve SDK'ya uygulanir

### 7.5 Bekleyen StartTurnAction step'i gonderilir
```
DOSYA: game.coffee -> onFHECardDrawn
```
```coffee
fheState.turnDrawComplete = true

if game.pendingStartTurnStep?
  emitGameEvent(null, gameId, game.pendingStartTurnStep)
  game.pendingStartTurnStep = null
  restartTurnTimer(gameId)
```

**KRITIK:** Bu adimda diger oyuncuya StartTurnAction gonderilir ve oynayabilir hale gelir!

---

## COZULEN SORUNLAR

### Sorun 1: FHE alanlari token'a aktarilmiyordu
**Cozum:** r-tokenmanager.coffee'ye FHE alanlari eklendi

### Sorun 2: startingHandSize 5 kaliyordu
**Cozum:** creategame.coffee'de `startingHandSize = 0` set edildi

### Sorun 3: Turn gecisi decrypt beklemiyordu
**Cozum:**
- EndTurnAction'da `turnDrawComplete = false`
- StartTurnAction step'i `pendingStartTurnStep`'e kaydedilip tutuldu
- fhe_card_drawn'da bekleyen step gonderildi

### Sorun 4: stepCount desync hatasi
**Cozum:** `pendingStartTurnStep` varsa turn_time event'inde stepCount'tan 1 cikarildi

### Sorun 5: Continue butonu decrypt bitmeden gorunuyordu
**Cozum:**
- game_choose_hand.js onRender()'da FHE modunda buton gizleniyor
- Decrypt basarili olunca setConfirmButtonVisibility(true) ile gosteriliyor

### Sorun 6: Submit Proof butonu decrypt sirasinda aktif gorunuyordu
**Cozum:**
- `_fheSubmitting` flag eklendi
- onClickSubmitTurn()'de flag set + "Submitting" state
- SDK event'leri flag kontroluyle engellendi
- Decrypt basarili/basarisiz olunca flag temizlendi

### Sorun 7: "Exceeds allowed reveals" hatasi retry'da
**Cozum:**
- fheGameSession.js'de `_cachedInitialHandData` cache mekanizmasi
- Blockchain basarili oldugunda cache'e kaydet
- Retry'da cache varsa blockchain'e gitme, sadece server'a bildir

---

## AKIS DIYAGRAMI

```
Player1 EndTurn
    |
    v
SERVER: EndTurnAction step
    |-- turnDrawComplete = false (Player1)
    |-- emit EndTurnAction (her iki client'a)
    v
SERVER: StartTurnAction step
    |-- pendingStartTurnStep = step (TUTULDU!)
    |-- return (emit YAPILMAZ)
    v
Player1 CLIENT:
    |-- incrementTurn TX
    |-- getDrawHandles
    |-- KMS decrypt
    |-- revealDrawBatch TX
    |-- socket.emit("fhe_card_drawn")
    v
SERVER: onFHECardDrawn
    |-- blockchain verify
    |-- SDK'ya kart uygula
    |-- turnDrawComplete = true
    |-- emit pendingStartTurnStep (SIMDI GONDERILDI!)
    |-- restartTurnTimer
    v
Player2 CLIENT:
    |-- StartTurnAction step alindi
    |-- Oynamaya hazir!
```

---

## KRITIK DOSYA/SATIRLAR

| Dosya | Method/Satir | Aciklama |
|-------|--------------|----------|
| r-tokenmanager.coffee:68-72 | create() | FHE token alanlari |
| creategame.coffee:59-80 | createGame() | startingHandSize=0, fhePlayer=true |
| gameSetup.js:175-217 | addCardsToDeck() | FHE deck order, bos hand |
| drawCardAction.js:37-50 | _execute() | FHE skip |
| game.coffee:1172-1186 | initGameSession() | FHE state + turnDrawComplete |
| game.coffee:1292-1330 | onStep() | EndTurn + StartTurn hold |
| game.coffee:884-888 | onGameTimeTick() | stepCount fix |
| game.coffee:1991-2002 | onFHECardDrawn | pending step emit |
| game_bottom_bar.js:162 | onClickSubmitTurn() | _fheSubmitting = true |
| game_bottom_bar.js:252-254 | _updateSubmitTurnState() | _fheSubmitting check |
| game_bottom_bar.js:337-340 | _setSubmitTurnButtonToEnemyState() | _fheSubmitting check |
| game_bottom_bar.js:348-354 | _setSubmitTurnButtonToSubmittingState() | Submitting state |
| game_bottom_bar.js:371-378 | _onFHEDecryptSuccess() | _fheSubmitting = false |
| game_choose_hand.js:46-52 | onRender() | FHE hide button |
| fheGameSession.js:~450 | _cachedInitialHandData | Retry cache |

---

## ASAMA 8: UI State Management (FHE Decrypt Sirasinda)

### 8.1 Initial Hand - Continue Button Gizleme

#### 8.1.1 Oyun basladiginda Continue butonu gizlenir
```
DOSYA: game_choose_hand.js -> onRender()
OYUNCU: P1 ve P2 (kendi clientlarinda)
```
```javascript
// FHE MODE: Hide confirm button initially
var fheEnabled = gameSession.fheEnabled || CONFIG.fheEnabled;
if (fheEnabled && !isDeveloperMode && !isSpectateMode) {
  this.ui.$confirmButton.css({
    opacity: 0,
    'pointer-events': 'none',
  });
}
```
**NEDEN:** Decrypt tamamlanmadan kullanici "Continue" basilabilir gorunuyordu.

#### 8.1.2 Decrypt tamamlaninca Continue butonu gosterilir
```
DOSYA: game_choose_hand.js -> setConfirmButtonVisibility()
DOSYA: game.js (game_layout) -> _showInitialHand() icerisinde cagrilir
```
```javascript
setConfirmButtonVisibility: function (visible) {
  if (visible) {
    this.ui.$confirmButton.css({
      opacity: '',
      'pointer-events': '',
    });
  }
}
```

---

### 8.2 Turn Sonu - Submit Proof Button State

#### 8.2.1 Submit Proof'a basilinca "Submitting" state'e gecer
```
DOSYA: game_bottom_bar.js -> onClickSubmitTurn()
OYUNCU: P1 (turn'u bitiren oyuncu)
```
```javascript
// FHE MODE: Immediately show submitting state before decrypt starts
var fheEnabled = gameSession.fheEnabled || CONFIG.fheEnabled;
if (fheEnabled && !gameSession.getIsDeveloperMode()) {
  this._fheSubmitting = true;  // FLAG SET!
  this._setSubmitTurnButtonToSubmittingState();
}
gameSession.submitExplicitAction(gameSession.actionEndTurn());
```

#### 8.2.2 Submitting state buton gorunumu
```
DOSYA: game_bottom_bar.js -> _setSubmitTurnButtonToSubmittingState()
```
```javascript
_setSubmitTurnButtonToSubmittingState: function () {
  this.ui.$submitTurnType.text(i18next.t('battle.turn_button_label_submitting'));
  this.ui.$submitTurn.addClass('enemy-turn');
  this.ui.$submitTurn.addClass('submitting');
  this.ui.$submitTurn.removeClass('my-turn');
  this.ui.$submitTurn.removeClass('finished');
}
```
**LOCALIZATION:** `battle.turn_button_label_submitting` = "Submitting"

#### 8.2.3 SDK event'leri buton state'ini degistirmeye calisir (ENGELLENIR)
```
DOSYA: game_bottom_bar.js -> onShow() icinde listener'lar
```
```javascript
// Bu event'ler tetiklenir ama _fheSubmitting flag'i sayesinde engellenir:
this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.end_turn, this._setSubmitTurnButtonToEnemyState);
this.listenTo(gameLayer.getEventBus(), EVENTS.show_end_turn, this.onShowEndTurn);
```

#### 8.2.4 _updateSubmitTurnState - Flag kontrolu
```
DOSYA: game_bottom_bar.js -> _updateSubmitTurnState()
```
```javascript
_updateSubmitTurnState: function () {
  if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
    // FHE: Don't update if we're in submitting state (waiting for decrypt)
    if (this._fheSubmitting) {
      return;  // ERKEN CIKIS - state degismez!
    }
    // ... normal state logic
  }
}
```

#### 8.2.5 _setSubmitTurnButtonToEnemyState - Flag kontrolu
```
DOSYA: game_bottom_bar.js -> _setSubmitTurnButtonToEnemyState()
```
```javascript
_setSubmitTurnButtonToEnemyState: function () {
  // FHE: Don't update if we're in submitting state (waiting for decrypt)
  if (this._fheSubmitting) {
    return;  // ERKEN CIKIS - state degismez!
  }
  // ... "Verifying Opponent" state logic
}
```
**KRITIK:** Bu fonksiyon dogrudan `EVENTS.end_turn` event'inden cagriliyordu, `_updateSubmitTurnState` uzerinden gecmiyordu!

#### 8.2.6 Decrypt tamamlaninca flag temizlenir
```
DOSYA: game_bottom_bar.js -> _onFHEDecryptSuccess()
EVENT: EVENTS.fhe_draw_decrypt_success
```
```javascript
_onFHEDecryptSuccess: function (event) {
  this._fheDecryptFailed = false;
  this._fheSubmitting = false;  // FLAG TEMIZLENDI!
  this.ui.$reDecryptButton.hide();
  this.ui.$submitTurn.show();
  this._updateSubmitTurnState();  // Simdi normal state'e gec
}
```

#### 8.2.7 Decrypt basarisiz olursa da flag temizlenir
```
DOSYA: game_bottom_bar.js -> _onFHEDecryptFailed()
EVENT: EVENTS.fhe_draw_decrypt_failed
```
```javascript
_onFHEDecryptFailed: function (event) {
  this._fheDecryptFailed = true;
  this._fheSubmitting = false;  // FLAG TEMIZLENDI!
  this.ui.$submitTurn.hide();
  this.ui.$reDecryptButton.show();  // Re-Decrypt butonu goster
}
```

---

### 8.3 Re-Decrypt Retry Mekanizmasi (Cache)

#### 8.3.1 Basarili decrypt sonucu cache'lenir
```
DOSYA: fheGameSession.js -> revealInitialHand()
OYUNCU: P1 veya P2 (initial hand reveal yapan)
```
```javascript
// Blockchain decrypt basarili olduktan sonra:
self._cachedInitialHandData = {
  hand: self.myHand.slice(),
  revealedIndices: self.revealedIndices.slice()
};
```
**NEDEN:** Blockchain TX basarili ama server bildirim basarisiz olursa, retry'da blockchain'e tekrar gitmek "Exceeds allowed reveals" hatasina neden olur.

#### 8.3.2 Retry'da cache kontrol edilir
```
DOSYA: fheGameSession.js -> revealInitialHand()
```
```javascript
// Fonksiyon basinda cache kontrolu:
if (self._cachedInitialHandData) {
  Logger.module('FHE_GAME').log('Cached hand found, skipping blockchain operations');
  self.retryNotifyServer().then(resolve).catch(reject);
  return;  // Blockchain'e GITME, sadece server'a bildir
}
```

#### 8.3.3 Sadece server bildirim retry edilir
```
DOSYA: fheGameSession.js -> retryNotifyServer()
```
```javascript
retryNotifyServer: function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (!self._cachedInitialHandData) {
      reject(new Error('No cached hand data for retry'));
      return;
    }
    // Cache'den veriyi al
    self.myHand = self._cachedInitialHandData.hand.slice();
    self.revealedIndices = self._cachedInitialHandData.revealedIndices.slice();
    // Sadece server'a bildir
    self._notifyServerInitialHand().then(resolve).catch(reject);
  });
}
```

---

## ASAMA 8 AKIS DIYAGRAMI - P1 Turn Sonu

```
P1 CLIENT: Submit Proof butonuna tiklar
    |
    v
game_bottom_bar.js -> onClickSubmitTurn()
    |-- _fheSubmitting = true
    |-- _setSubmitTurnButtonToSubmittingState()
    |   |-- text = "Submitting"
    |   |-- addClass('enemy-turn', 'submitting')
    |   |-- removeClass('my-turn', 'finished')
    |
    |-- gameSession.submitExplicitAction(EndTurnAction)
    v
SDK: EndTurnAction isler
    |-- EVENTS.end_turn tetiklenir
    v
game_bottom_bar.js -> _setSubmitTurnButtonToEnemyState() (EVENT LISTENER)
    |-- if (_fheSubmitting) return;  // ENGELLENDI!
    v
SDK: StartTurnAction (P2 turn) step olusur
    |-- EVENTS.show_end_turn tetiklenir
    v
game_bottom_bar.js -> onShowEndTurn()
    |-- _updateSubmitTurnState()
        |-- if (_fheSubmitting) return;  // ENGELLENDI!
    v
P1 CLIENT: fheGameSession.js -> revealDrawCard()
    |-- incrementTurn TX
    |-- getDrawHandles()
    |-- KMS decrypt
    |-- revealDrawBatch TX
    |-- socket.emit("fhe_card_drawn")
    v
SERVER: onFHECardDrawn()
    |-- blockchain verify
    |-- SDK'ya kart uygula
    |-- emit pendingStartTurnStep
    |-- EventBus.emit(EVENTS.fhe_draw_decrypt_success)
    v
game_bottom_bar.js -> _onFHEDecryptSuccess()
    |-- _fheSubmitting = false  // FLAG TEMIZLENDI!
    |-- _updateSubmitTurnState()
        |-- _setSubmitTurnButtonToEnemyState()
            |-- text = "Verifying Opponent"
    v
P2 CLIENT: StartTurnAction step alir
    |-- Oynamaya hazir!
```

---

## ASAMA 8 AKIS DIYAGRAMI - Initial Hand Retry

```
P1 CLIENT: revealInitialHand()
    |
    v
Blockchain: getDrawHandles() + revealDrawBatch()
    |-- BASARILI
    v
Cache: _cachedInitialHandData = { hand, revealedIndices }
    |
    v
Server: socket.emit("fhe_initial_hand_revealed")
    |-- 500 ERROR!
    v
EventBus: EVENTS.fhe_draw_decrypt_failed
    |
    v
game_choose_hand.js: showReDecryptButton(true)
    |-- Continue butonu gizlenir
    |-- Re-Decrypt butonu gosterilir
    v
P1: Re-Decrypt butonuna tiklar
    |
    v
game_layout.js: retryFHEDrawDecrypt()
    |
    v
fheGameSession.js: revealInitialHand()
    |-- if (_cachedInitialHandData) {
    |     // CACHE VAR - blockchain'e GITME!
    |     retryNotifyServer()
    |   }
    v
Server: socket.emit("fhe_initial_hand_revealed")
    |-- BASARILI
    v
EventBus: EVENTS.fhe_draw_decrypt_success
    |
    v
game_choose_hand.js: showReDecryptButton(false)
    |-- Re-Decrypt butonu gizlenir
    |-- Continue butonu gosterilir
```

---

## ASAMA 9: Boss Battle FHE Entegrasyonu

Boss Battle, Single Player'in ozel bir turudur. FHE modunda ayni blockchain mekanizmasini kullanir.

### 9.1 Boss Battle vs Single Player Farklari

| Ozellik | Single Player | Boss Battle |
|---------|---------------|-------------|
| Endpoint | `/api/me/games/single_player` | `/api/me/games/boss_battle` |
| AI Difficulty | Dinamik (win count'a gore) | Sabit (1.0 - max) |
| AI Deck | Random | Boss'a ozel (GameSetups) |
| GameType | `SDK.GameType.SinglePlayer` | `SDK.GameType.BossBattle` |
| Client Fonksiyon | `_startSinglePlayerGame` | `_startBossBattleGame` |
| FHE Fonksiyon | `_startSinglePlayerGameFHE` | `_startBossBattleGameFHE` |

### 9.2 Boss Battle FHE Akisi

#### 9.2.1 Kullanici Boss secip BOSS FHEIGHT butonuna basar
```
DOSYA: deck_select_boss_battle.js -> getConfirmSelectionEvent()
RETURN: EVENTS.start_boss_battle
```

#### 9.2.2 Event listener tetiklenir
```
DOSYA: application.js:3881
```
```javascript
EventBus.getInstance().on(EVENTS.start_boss_battle, App._startBossBattleGame, App);
```

#### 9.2.3 FHE kontrolu yapilir
```
DOSYA: application.js -> _startBossBattleGame()
SATIR: 2084-2088
```
```javascript
// Check if FHE mode is enabled
if (CONFIG.fheEnabled) {
  Logger.module("APPLICATION").log("App._startBossBattleGame -> FHE mode enabled, using blockchain flow");
  return App._startBossBattleGameFHE(myPlayerDeck, myPlayerFactionId, myPlayerGeneralId, myPlayerCardBackId, myPlayerBattleMapId, aiGeneralId);
}
```

---

### 9.3 _startBossBattleGameFHE Fonksiyonu

```
DOSYA: application.js
SATIR: 2079-2214
```

#### 9.3.1 Wallet baglantisi kontrolu
```javascript
if (!Wallet.getState().connected) {
  Logger.module("APPLICATION").log("FHE Boss Battle: Wallet not connected, connecting...");
  Wallet.connect()
    .then(function() {
      return proceedWithFHEGame();
    })
    .catch(reject);
} else {
  proceedWithFHEGame().catch(reject);
}
```

#### 9.3.2 FHE GameMode initialize
```javascript
const fheGameMode = FHE.GameMode.getInstance();
const contractAddresses = fheSession.getContractAddresses();
const gameSessionAddress = contractAddresses.GameSession;

return fheGameMode.initialize(gameSessionAddress)
```

#### 9.3.3 Blockchain'de oyun olusturma
```javascript
// Boss Battle ayni createSinglePlayerGame fonksiyonunu kullanir
return fheGameMode.createSinglePlayerGame(myPlayerGeneralId, deckCardIds);
```
**NOT:** Blockchain seviyesinde Boss Battle ve Single Player ayni - sadece backend farkli!

#### 9.3.4 Backend'e FHE parametreleri gonderilir
```javascript
const request = $.ajax({
  url: process.env.API_URL + '/api/me/games/boss_battle',
  data: JSON.stringify({
    deck: myPlayerDeck,
    cardBackId: myPlayerCardBackId,
    battleMapId: myPlayerBattleMapId,
    ai_general_id: aiGeneralId,
    ai_username: aiGeneralName,
    isDeveloperMode: CONFIG.DEV_MODE_ENABLED,
    // FHE specific data
    fhe_enabled: true,
    fhe_game_id: gameId
  }),
  type: 'POST',
  contentType: 'application/json',
  dataType: 'json'
});
```

#### 9.3.5 GameSession'a FHE bilgileri kaydedilir
```javascript
if (gameListingData.fhe_enabled) {
  SDK.GameSession.getInstance().fheEnabled = true;
  SDK.GameSession.getInstance().fheGameId = gameListingData.fhe_game_id;
  SDK.GameSession.getInstance().fheContractAddress = gameListingData.fhe_contract_address;
  Logger.module("APPLICATION").log("FHE Boss Battle: Game session configured with FHE data");
}
```

---

### 9.4 Server Tarafinda Boss Battle FHE

#### 9.4.1 Validator - FHE parametreleri kabul edilir
```
DOSYA: server/validators/index.js
SATIR: 99-108
```
```javascript
const bossBattleInput = t.struct({
  deck: types.Deck,
  cardBackId: t.maybe(t.Num),
  battleMapId: t.maybe(t.Num),
  ai_general_id: t.Number,
  ai_username: t.maybe(t.Str),
  isDeveloperMode: t.maybe(t.Bool),    // EKLENDI
  fhe_enabled: t.maybe(t.Bool),        // EKLENDI
  fhe_game_id: t.maybe(t.Number),      // EKLENDI
});
```

#### 9.4.2 Endpoint - FHE gameSetupOptions'a eklenir
```
DOSYA: server/routes/api/me/games.coffee
SATIR: 476-491
```
```coffee
router.post "/boss_battle", (req, res, next) ->
  # ... deck validation ...

  .then ()->
    # get custom game setup options for boss
    gameSetupOptions = GameSetups[aiGeneralId] || {}

    # add developer mode if requested
    if result.value.isDeveloperMode
      gameSetupOptions.isDeveloperMode = true
      Logger.module("BOSS BATTLE").debug "Developer mode ENABLED"

    # add FHE mode if requested
    if result.value.fhe_enabled
      gameSetupOptions.fheEnabled = true
      gameSetupOptions.fheGameId = result.value.fhe_game_id
      Logger.module("BOSS BATTLE").debug "FHE mode ENABLED - fheGameId: #{result.value.fhe_game_id}"

    # create game
    return createSinglePlayerGame(userId,"You",GameType.BossBattle,deck,cardBackId,battleMapId,aiPlayerId,aiUsername,aiGeneralId,aiDeckId,1.0,0,null,gameSetupOptions)
```

---

### 9.5 Boss Battle FHE Akis Diyagrami

```
KULLANICI: Boss secimi yapar
    |
    v
deck_select_boss_battle.js: getConfirmSelectionEvent()
    |-- EVENTS.start_boss_battle return eder
    v
EventBus: EVENTS.start_boss_battle tetiklenir
    |
    v
application.js: _startBossBattleGame()
    |-- if (CONFIG.fheEnabled) ?
    |   |-- EVET: _startBossBattleGameFHE() cagir
    |   |-- HAYIR: Normal boss battle flow
    v
application.js: _startBossBattleGameFHE()
    |
    |-- [1] Wallet.connect() (gerekirse)
    |
    |-- [2] FHE.GameMode.getInstance().initialize()
    |
    |-- [3] fheGameMode.createSinglePlayerGame()
    |       |-- contract.createSinglePlayerGame(gameId) TX
    |       |-- 40 FHE random uretilir (blockchain)
    |       |-- gameId return edilir
    |
    |-- [4] POST /api/me/games/boss_battle
    |       {
    |         deck, cardBackId, battleMapId,
    |         ai_general_id, ai_username,
    |         isDeveloperMode,
    |         fhe_enabled: true,
    |         fhe_game_id: gameId
    |       }
    v
SERVER: games.coffee -> /boss_battle endpoint
    |
    |-- validators.bossBattleInput ile validate
    |
    |-- gameSetupOptions = GameSetups[aiGeneralId] || {}
    |-- if fhe_enabled:
    |       gameSetupOptions.fheEnabled = true
    |       gameSetupOptions.fheGameId = fhe_game_id
    |
    |-- createSinglePlayerGame(..., gameSetupOptions)
    v
WORKER: creategame.coffee
    |-- gameSetupOptions.fheEnabled kontrol
    |-- player1DataForGame.fhePlayer = true
    |-- player1DataForGame.startingHandSize = 0
    v
SERVER: game.coffee -> initGameSession()
    |-- games[gameId].fhe.player1.enabled = true
    |-- games[gameId].fhe.player1.blockchainGameId = fheGameId
    v
CLIENT: _joinGame(gameListingData)
    |-- SDK.GameSession.getInstance().fheEnabled = true
    |-- SDK.GameSession.getInstance().fheGameId = gameId
    v
OYUN BASLAR (ASAMA 5+ ayni akis devam eder)
```

---

### 9.6 Boss Battle FHE Kritik Dosya/Satirlar

| Dosya | Method/Satir | Aciklama |
|-------|--------------|----------|
| deck_select_boss_battle.js:75 | getConfirmSelectionEvent() | EVENTS.start_boss_battle |
| application.js:3881 | Event listener | start_boss_battle -> _startBossBattleGame |
| application.js:2084-2088 | _startBossBattleGame() | FHE kontrolu ve yonlendirme |
| application.js:2079-2214 | _startBossBattleGameFHE() | Tum FHE boss battle akisi |
| application.js:2130-2135 | createSinglePlayerGame() | Blockchain TX (single player ile ayni) |
| application.js:2143-2159 | POST /boss_battle | FHE parametreleri ile request |
| application.js:2188-2194 | GameSession FHE config | fheEnabled, fheGameId, fheContractAddress |
| validators/index.js:99-108 | bossBattleInput | FHE parametreleri validator'a eklendi |
| games.coffee:476-491 | /boss_battle endpoint | FHE gameSetupOptions eklendi |

---

### 9.7 Boss Battle ve Single Player Ortak FHE Yapisi

Her iki mod da ayni temel FHE altyapisini kullanir:

```
createSinglePlayerGame (contract)  <-- Her ikisi de AYNI fonksiyonu kullanir
         |
         v
  +------+------+
  |             |
  v             v
Single       Boss
Player       Battle
  |             |
  v             v
/single_player  /boss_battle   <-- Farkli endpoint'ler
endpoint        endpoint
  |             |
  +------+------+
         |
         v
createSinglePlayerGame (server)  <-- Ayni server fonksiyonu
         |
         v
    GameSession (fheEnabled = true)
```

**SONUC:** Boss Battle FHE, Single Player FHE'nin ozel bir turu. Blockchain seviyesinde ayni, backend'de sadece AI konfigurasyonu farkli.
