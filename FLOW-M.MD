# FHE Multiplayer Flow

## Dosya Referanslari

| Kisaltma | Dosya |
|----------|-------|
| CLIENT/deck_select | app/ui/views/composite/deck_select.js |
| CLIENT/games_manager | app/ui/managers/games_manager.js |
| CLIENT/fhe_session | app/common/fheGameSession.js |
| CLIENT/game | app/ui/views2/layouts/game.js |
| SERVER/matchmaker | server/routes/matchmaker.coffee |
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
