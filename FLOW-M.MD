# FHE Multiplayer Flow - Detayli Teknik Dokuman

Bu dokuman FHE modunda multiplayer oyunun basindan sonuna kadar
hangi dosyada hangi methodun cagrildigini adim adim aciklar.

---

## DOSYA REFERANSLARI

| Kisaltma | Dosya Yolu | Konum |
|----------|------------|-------|
| CLIENT/deck_select | app/ui/views/composite/deck_select.js | CLIENT |
| CLIENT/games_manager | app/ui/managers/games_manager.js | CLIENT |
| CLIENT/fhe_session | app/common/fheGameSession.js | CLIENT |
| CLIENT/wallet | app/common/wallet.js | CLIENT |
| CLIENT/game | app/ui/views2/layouts/game.js | CLIENT |
| SERVER/matchmaker | server/routes/matchmaker.coffee | SERVER (API) |
| SERVER/tokenmanager | server/redis/r-tokenmanager.coffee | SERVER (API) |
| SERVER/validators | server/validators/index.js | SERVER (API) |
| SERVER/worker | worker/creategame.coffee | SERVER (WORKER) |
| SERVER/gameSetup | app/sdk/gameSetup.js | SERVER (WORKER) |
| SERVER/drawCardAction | app/sdk/actions/drawCardAction.js | SERVER (GAME) |
| SERVER/game | server/game.coffee | SERVER (GAME) |
| SERVER/blockchain | server/lib/blockchain.coffee | SERVER |
| CONTRACT | contracts/src/GameSession.sol | BLOCKCHAIN |

---

## VERI AKISI OZETI

```
CLIENT                    SERVER (API)              SERVER (WORKER)           SERVER (GAME)
   |                           |                           |                        |
   |--[1] POST /matchmaking--->|                           |                        |
   |   (fhe_enabled=true)      |                           |                        |
   |                           |--[2] TokenManager.create->|                        |
   |                           |   (fhe fields in token)   |                        |
   |                           |                           |                        |
   |                           |<--[3] Match found---------|                        |
   |                           |                           |                        |
   |                           |--[4] Kue job: createGame->|                        |
   |                           |                           |--[5] creategame.coffee-|
   |                           |                           |   playerData.fhe_enabled
   |                           |                           |   -> fhePlayer=true    |
   |                           |                           |   -> startingHandSize=0|
   |                           |                           |                        |
   |                           |                           |--[6] gameSetup.js----->|
   |                           |                           |   FHE deck in order    |
   |                           |                           |   NO cards drawn       |
   |                           |                           |                        |
   |<--[7] Game ready----------|---------------------------|------------------------|
   |                           |                           |                        |
   |--[8] Connect socket-------|---------------------------|----------------------->|
   |                           |                           |                        |
   |                           |                           |     [9] initGameSession|
   |                           |                           |     games[id].fhe state|
   |                           |                           |                        |
   |--[10] FHE reveal TX------>|                           |                        |
   |   (blockchain)            |                           |                        |
   |                           |                           |                        |
   |--[11] socket: fhe_initial_hand_revealed-------------->|----------------------->|
   |                           |                           |                        |
   |                           |                           |  [12] BLOCKCHAIN VERIFY|
   |                           |                           |  getVerifiedDrawOrder()|
   |                           |                           |                        |
   |<--[13] fhe_initial_hand_revealed_response-------------|<-----------------------|
   |   (cardIndices)           |                           |                        |
```

---

## ASAMA 1: Oyun Baslatma (Deck Select Ekrani)

### Adim 1: Kullanici "Play" butonuna basar
```
DOSYA: deck_select.js
METHOD: onConfirmSelection() veya onConfirmCasualSelection()
SATIR: ~650-680
KONUM: CLIENT
```
- Kullanici deck secip "Play" butonuna tiklar
- `CONFIG.fheEnabled` kontrol edilir
- FHE aktifse `_initFHEAndFindGame()` cagrilir

### Adim 2: Wallet baglantisi kontrol edilir
```
DOSYA: deck_select.js
METHOD: _initFHEAndFindGame()
SATIR: ~690-750
KONUM: CLIENT
```
```javascript
if (!Wallet.getState().connected) {
  walletPromise = Wallet.connect();  // MetaMask popup
} else {
  walletPromise = Promise.resolve();
}
```

### Adim 3: FHE Session baslatilir (PIN giris)
```
DOSYA: fheGameSession.js
METHOD: fheGameMode.initialize()
SATIR: ~180-220
KONUM: CLIENT
```
- `showPinDialog()` ile PIN popup gosterilir
- Kullanici 6 haneli PIN girer

### Adim 4: Sifrelenmis keypair localStorage'dan alinir
```
DOSYA: fheGameSession.js
METHOD: loadSession(pin)
SATIR: ~85-130
KONUM: CLIENT
DATA: ENCRYPTED (AES-GCM) -> DECRYPTED with PIN
```
- `localStorage.getItem('fhe_session')` ile sifrelenmis veri alinir
- `userDecrypt(encryptedData, pin)` ile AES-GCM decrypt yapilir
- Sonuc: `{ privateKey, publicKey, address }` (PLAINTEXT)

### Adim 5: Session wallet olusturulur
```
DOSYA: fheGameSession.js
METHOD: loadSession(pin) devami
SATIR: ~130-150
KONUM: CLIENT
```
- `new ethers.Wallet(privateKey)` ile wallet olusturulur
- `wallet.connect(provider)` ile Sepolia RPC'ye baglanir
- `fheGameMode.sessionWallet` set edilir

---

## ASAMA 2: Blockchain Game Olusturma

### Adim 6: createSinglePlayerGame TX gonderilir
```
DOSYA: fheGameSession.js
METHOD: createSinglePlayerGame()
SATIR: ~160-200
KONUM: CLIENT -> BLOCKCHAIN
DATA: gameId (plaintext uint256)
```
- `gameId = Date.now()` ile unique ID olusturulur
- Contract instance alinir: `new ethers.Contract(address, abi, sessionWallet)`
- `contract.createSinglePlayerGame(gameId)` TX gonderilir (BLOCKCHAIN TX)
- TX onaylanir, `fheGameMode.blockchainGameId` set edilir

### Adim 7: Contract 40 adet FHE random uretir
```
DOSYA: GameSession.sol
FUNCTION: createSinglePlayerGame(uint256 gameId)
KONUM: BLOCKCHAIN (Zama fhEVM)
DATA: 40x euint8 (ENCRYPTED on-chain)
```
```solidity
for (uint8 i = 0; i < 40; i++) {
    games[gameId].encryptedIndices[i] = FHE.randomEuint8();
    // Her index 0-255 arasi ENCRYPTED random
}
games[gameId].player = msg.sender;
games[gameId].currentTurn = 0;
games[gameId].revealedCount = 0;
games[gameId].isActive = true;
emit GameCreated(gameId, msg.sender);
```

---

## ASAMA 3: Matchmaking (Server Token Flow)

### Adim 8: Matchmaking request server'a gonderilir
```
DOSYA: games_manager.js
METHOD: findNewGameWithFHE()
SATIR: ~528-585
KONUM: CLIENT -> SERVER (HTTP POST)
DATA: PLAINTEXT JSON
```
```javascript
matchRequest = {
  // Normal fields
  deck: [...],
  factionId: 1,
  gameType: "ranked",
  // FHE fields (PLAINTEXT)
  fhe_enabled: true,
  fhe_game_id: "1766103487556",
  fhe_contract_address: "0x...",
  fhe_player_wallet: "0x..."
};
POST /matchmaking -> matchRequest
```

### Adim 9: Server FHE data'yi validate eder
```
DOSYA: validators/index.js
STRUCT: matchmakingInput
SATIR: ~69-84
KONUM: SERVER (API)
DATA: PLAINTEXT (validation only)
```
```javascript
const matchmakingInput = t.struct({
  // ... normal fieldlar ...
  // FHE multiplayer fields (optional)
  fhe_enabled: t.maybe(t.Bool),
  fhe_game_id: t.maybe(t.Str),
  fhe_contract_address: t.maybe(t.Str),
  fhe_player_wallet: t.maybe(t.Str),
});
```

### Adim 10: Matchmaker token'a FHE data ekler
```
DOSYA: matchmaker.coffee
METHOD: router.post "/matchmaking"
SATIR: ~310-330
KONUM: SERVER (API)
DATA: PLAINTEXT -> Redis token
```
```coffee
tokenData = {
  userId: userId
  name: name
  deck: @.deck
  factionId: factionId
  # ... diger normal fieldlar ...
  # FHE multiplayer fields (from client request)
  fhe_enabled: result.value.fhe_enabled      # true
  fhe_game_id: result.value.fhe_game_id      # "1766103487556"
  fhe_contract_address: result.value.fhe_contract_address
  fhe_player_wallet: result.value.fhe_player_wallet
}
```

### Adim 11: TokenManager FHE alanlari kaydeder
```
DOSYA: r-tokenmanager.coffee
METHOD: create(opts)
SATIR: ~50-73
KONUM: SERVER (API)
DATA: PLAINTEXT -> Redis Hash
```
```coffee
create: (opts = {}) ->
  token = {}
  # ... normal fields ...
  # FHE multiplayer fields (CRITICAL - recently added!)
  token.fhe_enabled = opts.fhe_enabled or null
  token.fhe_game_id = opts.fhe_game_id or null
  token.fhe_contract_address = opts.fhe_contract_address or null
  token.fhe_player_wallet = opts.fhe_player_wallet or null
  return token
```

### Adim 12: Match bulunur, Kue job olusturulur
```
KONUM: SERVER (API) -> Redis Queue
DATA: player1Token, player2Token (PLAINTEXT from Redis)
```
- Iki oyuncu eslestigi zaman `createGame` Kue job'u olusturulur
- Her iki oyuncunun token'i job data'sina eklenir

---

## ASAMA 4: Game Session Olusturma (Worker)

### Adim 13: Worker token'dan FHE bilgilerini okur
```
DOSYA: creategame.coffee
METHOD: createGame()
SATIR: ~48-80
KONUM: SERVER (WORKER)
DATA: playerData.fhe_enabled (PLAINTEXT from token)
```
```coffee
# Token'dan FHE bilgileri alinir
player1FheEnabled = player1DataForGame?.fhe_enabled
player2FheEnabled = player2DataForGame?.fhe_enabled

if player1FheEnabled or player2FheEnabled
  Logger.module("GAME CREATE").debug "FHE MULTIPLAYER MODE"

  if player1FheEnabled
    player1DataForGame.fhePlayer = true
    player1DataForGame.startingHandSize = 0  # KRITIK: Kart cekme!

  if player2FheEnabled
    player2DataForGame.fhePlayer = true
    player2DataForGame.startingHandSize = 0  # KRITIK: Kart cekme!

# GameSession'a FHE flag'i set et
if player1FheEnabled or player2FheEnabled
  newGameSession.fheEnabled = true
```

### Adim 14: GameSetup FHE modunda deck'i hazirlar
```
DOSYA: gameSetup.js
METHOD: addCardsToDeck()
SATIR: ~165-218
KONUM: SERVER (WORKER)
DATA: deck cards (PLAINTEXT card IDs)
```
```javascript
// FHE player check
const isFhePlayer = playerData.fhePlayer || playerData.fhe_enabled;
const isFheEnabled = gameSession.fheEnabled || playerData.fhe_enabled;

if (isFheEnabled && isFhePlayer) {
  console.log('[GAME SETUP] FHE MODE: Adding deck cards in ORIGINAL ORDER (no hand)');

  // Deck'i ORIGINAL SIRADA ekle (shuffle YOK)
  // Hand'a kart cekme YOK
  for (const cardData of playerCardsData) {
    const card = gameSession.getExistingCardFromIndexOrCreateCardFromData(cardData);
    gameSession.applyCardToDeck(playerDeck, cardData, card);
  }

  // FHE deck order'i sakla (blockchain verification icin)
  gameSession.fheDeckOrders[playerId] = playerCardsData.map(c => c.id);

  // Hand BOS - kartlar blockchain'den gelecek
  return;  // Normal kart cekme atla
}
```

### Adim 15: DrawCardAction FHE icin skip edilir
```
DOSYA: drawCardAction.js
METHOD: _execute()
SATIR: ~28-51
KONUM: SERVER (WORKER/GAME)
DATA: Check only, no cards drawn
```
```javascript
_execute() {
  const gameSession = this.getGameSession();
  const ownerId = this.getOwnerId();
  const playerSetupData = gameSession.getPlayerSetupDataForPlayerId(ownerId);

  // FHE check - BOTH gameSession flag AND playerSetupData
  const isFheEnabled = gameSession.fheEnabled ||
                       (playerSetupData && playerSetupData.fhe_enabled);

  if (isFheEnabled) {
    const aiPlayerId = gameSession.getAiPlayerId();
    const isAiPlayer = aiPlayerId && ownerId === aiPlayerId;

    if (!isAiPlayer) {
      // FHE human player - skip ALL card drawing logic
      Logger.module('SDK').log('[FHE] DrawCardAction: Skipping for FHE player');
      this._fheSkipped = true;
      return;  // Don't call super._execute()
    }
  }

  // Normal (non-FHE) card draw continues...
}
```

---

## ASAMA 5: Game Server FHE State

### Adim 16: Game server FHE state olusturur
```
DOSYA: game.coffee
METHOD: initGameSession()
SATIR: ~1142-1195
KONUM: SERVER (GAME)
DATA: FHE state from playerSetupData (PLAINTEXT)
```
```coffee
# Player setup data'dan FHE bilgilerini oku
player1SetupData = gameSession.getPlayer1SetupData()
player2SetupData = gameSession.getPlayer2SetupData()

# Her oyuncu icin FHE state olustur
games[gameId].fhe = {
  player1: null
  player2: null
}

if player1SetupData?.fhe_enabled
  games[gameId].fhe.player1 = {
    enabled: true
    blockchainGameId: player1SetupData.fhe_game_id    # Client'in blockchain game'i
    contractAddress: player1SetupData.fhe_contract_address
    wallet: player1SetupData.fhe_player_wallet
    network: 'sepolia'
    revealedCount: 0
    initialHandRevealComplete: false
  }

# Player 2 icin ayni...
if player2SetupData?.fhe_enabled
  games[gameId].fhe.player2 = { ... }

# FHE varsa turn timer BASLATMA (initial hand reveal bekleniyor)
if hasFHEPlayer
  Logger.module("FHE").debug "FHE mode - turn timer after initial hand reveal"
else
  restartTurnTimer(gameId)
```

---

## ASAMA 6: Ilk El (5 Kart Cekme)

### Adim 17: Client FHE reveal yapar (blockchain)
```
DOSYA: fheGameSession.js
METHOD: revealInitialHand()
SATIR: ~250-330
KONUM: CLIENT -> BLOCKCHAIN
DATA:
  - INPUT: gameId (plaintext)
  - PROCESS: 5x euint8 (ENCRYPTED) -> Zama KMS -> 5x uint8 (DECRYPTED)
  - OUTPUT: clearIndices [196, 178, 219, 187, 5] (plaintext)
```
```javascript
// 1. Contract'tan encrypted handle'lari al
const handles = await contract.getDrawHandles(gameId, 5);
// handles = [0x..., 0x..., 0x..., 0x..., 0x...] (66 char hex each)

// 2. Zama KMS'den decrypt et
const { clearValues, decryptionProof } = await publicDecrypt(handles);
// clearValues = [196, 178, 219, 187, 5] (plaintext uint8)

// 3. Contract'a reveal TX gonder (proof ile)
await contract.revealDrawBatch(gameId, clearValues, decryptionProof);
// Contract: revealedValues[0..4] = clearValues, revealedCount = 5
```

### Adim 18: Client server'a reveal tamamlandi bildirir
```
DOSYA: fheGameSession.js
METHOD: notifyServer('fhe_initial_hand_revealed', data)
SATIR: ~320-330
KONUM: CLIENT -> SERVER (SOCKET)
DATA: PLAINTEXT JSON (gameId, blockchainGameId only - NO card data!)
```
```javascript
socket.emit("fhe_initial_hand_revealed", {
  gameId: gameId,                    // Server game ID
  blockchainGameId: blockchainGameId // Client's blockchain game ID
  // NOTE: Kart bilgisi GONDERILMEZ - server blockchain'den okur!
});
```

### Adim 19: Server blockchain'den dogrular
```
DOSYA: game.coffee
HANDLER: onFHEInitialHandRevealed
SATIR: ~1722-1837
KONUM: SERVER (GAME)
DATA:
  - INPUT: gameId, blockchainGameId
  - BLOCKCHAIN READ: indices (plaintext from blockchain)
  - OUTPUT: verified cards
```
```coffee
onFHEInitialHandRevealed = (requestData) ->
  socket = @
  gameId = requestData.gameId
  playerId = @.playerId

  fheState = getFHEStateForPlayer(gameId, playerId)
  blockchainGameId = fheState.blockchainGameId
  fheDeckOrder = getFHEDeckOrderForPlayer(gameId, playerId)

  INITIAL_HAND_SIZE = 5

  # BLOCKCHAIN VERIFICATION - Never trust client!
  BlockchainModule.verifyAndCalculateCards(network, blockchainGameId, fheDeckOrder, INITIAL_HAND_SIZE)
  .then (result) ->
    if !result.verified
      socket.emit "fhe_initial_hand_revealed_response", { error: "Verification failed" }
      return

    # Blockchain'den dogrulanmis kartlar
    verifiedCards = result.cards  # [cardId1, cardId2, ...]

    # Kartlari SDK'ya uygula
    for cardId in verifiedCards
      # drawPile'dan bul ve hand'a ekle
      game.session.applyCardToHand(playerDeck, cardIndex, card, handSlotIndex)

    # FHE state guncelle
    fheState.revealedCount = 5
    fheState.initialHandRevealComplete = true

    # Client'a onay gonder
    socket.emit "fhe_initial_hand_revealed_response", {
      success: true
      verified: true
      revealedCount: 5
      cardIndices: cardIndicesForClient  # SDK card indices
    }

    # Tum FHE oyuncular hazirsa turn timer baslat
    if allFhePlayersReady
      restartTurnTimer(gameId)
```

### Adim 20: Blockchain verification detayi
```
DOSYA: blockchain.coffee
METHOD: verifyAndCalculateCards()
SATIR: ~250-278
KONUM: SERVER
DATA: BLOCKCHAIN VIEW CALL (no TX, no gas)
```
```coffee
verifyAndCalculateCards = (network, gameId, deckOrder, expectedCount) ->
  # 1. Blockchain'den revealed indices oku (VIEW call - ucretsiz)
  indices = await contract.getVerifiedDrawOrder(gameId)
  # indices = [196, 178, 219, 187, 5] (plaintext from blockchain)

  # 2. Ayni algoritmay? calistir
  result = calculateCardsFromIndices(deckOrder, indices)
  # result.drawnCards = [cardId1, cardId2, ...]

  return {
    verified: true,
    cards: result.drawnCards,
    indices: indices
  }

calculateCardsFromIndices = (deck, indices) ->
  remaining = deck.slice()  # Copy
  drawnCards = []

  for index in indices
    pos = index % remaining.length
    drawnCards.push(remaining[pos])
    remaining.splice(pos, 1)  # Remove drawn card

  return { drawnCards, remainingDeck: remaining }
```

### Adim 21: Client eli gosterir
```
DOSYA: game.js
METHOD: _populateFHEHand()
SATIR: ~1219-1300
KONUM: CLIENT
DATA: cardIndices from server response (PLAINTEXT)
```
```javascript
// Server'dan gelen cardIndices kullanilir
// Bu SDK card index'leri, client bunlari UI'a render eder
for (let i = 0; i < cardIndices.length; i++) {
  const cardIndex = cardIndices[i];
  const card = gameSession.getCardByIndex(cardIndex);
  this.bindCardNodeAtIndex(card, cardIndex);
}
// El gosterilir, oyun baslar
```

---

## ASAMA 7: Turn Sonu + Kart Cekme

### Adim 22: Kullanici "End Turn" basar
```
KONUM: CLIENT -> SERVER
DATA: EndTurnAction (normal game action)
```
- Server turn'u bitirir
- `DrawCardAction` FHE oyuncu icin SKIP edilir (Adim 15)

### Adim 23: Client turn degistigini algilar
```
DOSYA: game.js
METHOD: _onAfterShowEndTurn()
SATIR: ~415-450
KONUM: CLIENT
```
- FHE modda `fheGameMode.revealDrawCard()` cagrilir

### Adim 24: Client incrementTurn TX gonderir
```
DOSYA: fheGameSession.js
METHOD: incrementTurn()
SATIR: ~355-380
KONUM: CLIENT -> BLOCKCHAIN (TX)
```
```javascript
await contract.incrementTurn(gameId);
// Contract: currentTurn++, allowedReveals = 5 + currentTurn
```

### Adim 25: Client yeni kart reveal yapar
```
DOSYA: fheGameSession.js
METHOD: revealDrawCard()
SATIR: ~400-460
KONUM: CLIENT -> BLOCKCHAIN
DATA:
  - INPUT: 1x euint8 (ENCRYPTED)
  - OUTPUT: 1x uint8 (DECRYPTED)
```
```javascript
// 1 handle al
const [handle] = await contract.getDrawHandles(gameId, 1);

// KMS decrypt
const { clearValues, proof } = await publicDecrypt([handle]);
const clearIndex = clearValues[0];

// Reveal TX
await contract.revealDrawBatch(gameId, [clearIndex], proof);
// revealedCount = 6
```

### Adim 26: Client server'a bildirir
```
DOSYA: fheGameSession.js
KONUM: CLIENT -> SERVER (SOCKET)
DATA: gameId, turn (PLAINTEXT - NO card data!)
```
```javascript
socket.emit("fhe_card_drawn", {
  gameId: gameId,
  turn: currentTurn
  // Kart bilgisi YOK - server blockchain'den okur!
});
```

### Adim 27: Server blockchain'den dogrular
```
DOSYA: game.coffee
HANDLER: onFHECardDrawn
SATIR: ~1843-1950
KONUM: SERVER (GAME)
```
```coffee
onFHECardDrawn = (requestData) ->
  # BLOCKCHAIN VERIFICATION - Never trust client!
  BlockchainModule.getVerifiedDrawOrder(network, blockchainGameId)
  .then (indices) ->
    # TUM indices ile hesapla (remaining deck dogru olsun)
    result = BlockchainModule.calculateCardsFromIndices(fheDeckOrder, indices)

    # Son kart = yeni cekilen
    cardId = result.drawnCards[result.drawnCards.length - 1]

    # Karti SDK'ya uygula
    game.session.applyCardToHand(playerDeck, cardIndex, card)

    # State guncelle
    fheState.revealedCount = indices.length

    socket.emit "fhe_card_drawn_response", {
      success: true
      turn: turn
      cardId: cardId
      cardIndex: appliedCardIndex
      burned: cardBurned  # El doluysa burn
    }
```

### Adim 28: Client karti ele ekler
```
DOSYA: game.js
METHOD: _addFHECardToHand()
SATIR: ~1130-1210
KONUM: CLIENT
DATA: cardIndex from server (PLAINTEXT)
```

---

## TX OZETI (Blockchain Islemleri)

| Adim | Islem | Gonderen | TX/VIEW | Gas |
|------|-------|----------|---------|-----|
| 6 | createSinglePlayerGame | CLIENT | TX | Yes |
| 17 | getDrawHandles | CLIENT | VIEW | No |
| 17 | revealDrawBatch (5 kart) | CLIENT | TX | Yes |
| 19 | getVerifiedDrawOrder | SERVER | VIEW | No |
| 24 | incrementTurn | CLIENT | TX | Yes |
| 25 | getDrawHandles (1) | CLIENT | VIEW | No |
| 25 | revealDrawBatch (1) | CLIENT | TX | Yes |
| 27 | getVerifiedDrawOrder | SERVER | VIEW | No |

**10 Turn Oyun (her oyuncu icin):**
= 1 (create) + 1 (ilk el reveal) + 10 x 2 (increment + reveal)
= 22 TX per player

**Server: 0 TX** - Sadece VIEW call yapar (gas masrafi YOK)

---

## DATA ENCRYPTION OZETI

| Veri | Nerede | Durum |
|------|--------|-------|
| FHE private key | Client localStorage | ENCRYPTED (AES-GCM + PIN) |
| FHE indices (blockchain) | Smart contract | ENCRYPTED (euint8) |
| FHE indices (revealed) | Smart contract | PLAINTEXT (uint8) |
| Deck order | Server memory | PLAINTEXT |
| Card IDs | Server -> Client | PLAINTEXT |
| matchmaking request | Client -> Server | PLAINTEXT (HTTPS) |
| token in Redis | Server | PLAINTEXT |
| socket messages | Client <-> Server | PLAINTEXT (WSS) |

---

## GUVENLIK OZETI

| Konu | Aciklama |
|------|----------|
| RANDOM | FHE.randomEuint8() - coprocessor uretir, manipule edilemez |
| DECRYPT | Sadece Zama KMS yapabilir (threshold decryption) |
| PROOF | decryptionProof olmadan reveal yapilamaz |
| CLIENT | Kendi FHE game'ini olusturur, kendi kartlarini reveal eder |
| SERVER | ASLA client'a guvenmez - her reveal icin blockchain VIEW call |
| SERVER TX | YOK - Server hicbir zaman TX gondermez |
| VERIFICATION | `getVerifiedDrawOrder()` - contract'tan plaintext indices okur |
| DECK ORDER | Her oyuncunun deck'i `fheDeckOrders[playerId]` ile saklanir |

---

## MULTIPLAYER FARK: Single Player vs Multiplayer

| Ozellik | Single Player | Multiplayer |
|---------|---------------|-------------|
| Server | single_player.coffee | game.coffee |
| Port | 8000 | 8001 |
| FHE state | `games[id].fhe = {...}` | `games[id].fhe = { player1, player2 }` |
| Deck order | `gameSession.fheDeckOrder` | `gameSession.fheDeckOrders[playerId]` |
| Game creation | Direct | Via Worker (Kue job) |
| Token flow | N/A | matchmaker -> tokenmanager -> worker |
| FHE flags | `fhePlayer`, `startingHandSize` | Same, set in creategame.coffee |

---

## KRITIK DOSYA DEGISIKLIKLERI

### 1. r-tokenmanager.coffee (Satir 68-72)
```coffee
# FHE multiplayer fields - BU OLMADAN FHE CALISMAZ!
token.fhe_enabled = opts.fhe_enabled or null
token.fhe_game_id = opts.fhe_game_id or null
token.fhe_contract_address = opts.fhe_contract_address or null
token.fhe_player_wallet = opts.fhe_player_wallet or null
```

### 2. creategame.coffee (Satir 59-80)
```coffee
if player1FheEnabled or player2FheEnabled
  if player1FheEnabled
    player1DataForGame.fhePlayer = true
    player1DataForGame.startingHandSize = 0  # KRITIK!
  # ...
  newGameSession.fheEnabled = true
```

### 3. gameSetup.js (Satir 175-217)
```javascript
if (isFheEnabled && isFhePlayer) {
  // Deck ORIGINAL ORDER'da, hand BOS
  gameSession.fheDeckOrders[playerId] = playerCardsData.map(c => c.id);
  return;  // Normal kart cekme SKIP
}
```

### 4. drawCardAction.js (Satir 37-50)
```javascript
if (isFheEnabled && !isAiPlayer) {
  this._fheSkipped = true;
  return;  // FHE player icin kart cekme SKIP
}
```

---

## MEVCUT DURUM

| Asama | Konum | Durum |
|-------|-------|-------|
| 1-5 | CLIENT | TAMAMLANDI |
| 6-7 | BLOCKCHAIN | TAMAMLANDI |
| 8-12 | SERVER (API) | TAMAMLANDI |
| 13-15 | SERVER (WORKER) | TAMAMLANDI |
| 16 | SERVER (GAME) | TAMAMLANDI |
| 17-21 | CLIENT + SERVER | TAMAMLANDI |
| 22-28 | CLIENT + SERVER | TAMAMLANDI |
