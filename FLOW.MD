# FHE Single Player Flow - Detayli Teknik Dokuman

Bu dokuman FHE modunda single player oyunun basindan sonuna kadar
hangi dosyada hangi methodun cagrildigini adim adim aciklar.

---

## DOSYA REFERANSLARI

| Kisaltma | Dosya Yolu |
|----------|------------|
| CLIENT/deck_select | app/ui/views/composite/deck_select.js |
| CLIENT/games_manager | app/ui/managers/games_manager.js |
| CLIENT/fhe_session | app/common/fheGameSession.js |
| CLIENT/fhe | app/common/fhe.js |
| CLIENT/wallet | app/common/wallet.js |
| CLIENT/game | app/ui/views2/layouts/game.js |
| SERVER/single_player | server/single_player.coffee |
| SERVER/blockchain | server/lib/blockchain.coffee |
| CONTRACT | contracts/src/GameSession.sol |

---

## ASAMA 1: Oyun Baslatma (Deck Select Ekrani)

### Adim 1: Kullanici "Play" butonuna basar
```
DOSYA: deck_select.js
METHOD: onConfirmSelection() veya onConfirmCasualSelection()
SATIR: ~650-680
```
- Kullanici deck secip "Play" butonuna tiklar
- `CONFIG.fheEnabled` kontrol edilir
- FHE aktifse `_initFHEAndFindGame()` cagrilir

### Adim 2: Wallet baglantisi kontrol edilir
```
DOSYA: deck_select.js
METHOD: _initFHEAndFindGame()
SATIR: ~690-750
```
- `Wallet.getInstance()` ile wallet instance alinir
- `wallet.connected` kontrol edilir
- Bagli degilse `wallet.connect()` ile MetaMask popup acilir

### Adim 3: FHE Session baslatilir (PIN giris)
```
DOSYA: fheGameSession.js
METHOD: fheGameMode.initialize()
SATIR: ~180-220
```
- `showPinDialog()` ile PIN popup gosterilir
- Kullanici 6 haneli PIN girer

### Adim 4: Sifrelenmis keypair localStorage'dan alinir
```
DOSYA: fheGameSession.js
METHOD: loadSession(pin)
SATIR: ~85-130
```
- `localStorage.getItem('fhe_session')` ile sifrelenmis veri alinir
- `userDecrypt(encryptedData, pin)` ile AES-GCM decrypt yapilir
- Sonuc: `{ privateKey, publicKey, address }`

### Adim 5: Session wallet olusturulur
```
DOSYA: fheGameSession.js
METHOD: loadSession(pin) devami
SATIR: ~130-150
```
- `new ethers.Wallet(privateKey)` ile wallet olusturulur
- `wallet.connect(provider)` ile RPC'ye baglanir
- `fheGameMode.sessionWallet` set edilir

---

## ASAMA 2: Blockchain Game Olusturma

### Adim 6: createSinglePlayerGame TX gonderilir
```
DOSYA: fheGameSession.js
METHOD: createSinglePlayerGame()
SATIR: ~160-200
```
- `gameId = Date.now()` ile unique ID olusturulur
- Contract instance alinir: `new ethers.Contract(address, abi, sessionWallet)`
- `contract.createSinglePlayerGame(gameId)` TX gonderilir
- TX onaylanir, `fheGameMode.blockchainGameId` set edilir

### Adim 7: Contract 40 adet FHE random uretir
```
DOSYA: GameSession.sol
FUNCTION: createSinglePlayerGame(uint256 gameId)
```
```solidity
for (uint8 i = 0; i < 40; i++) {
    games[gameId].encryptedIndices[i] = FHE.randomEuint8();
}
games[gameId].player = msg.sender;
games[gameId].currentTurn = 0;
games[gameId].revealedCount = 0;
games[gameId].isActive = true;
emit GameCreated(gameId, msg.sender);
```

### Adim 8: Client, server'a oyun olusturuldugunu bildirir
```
DOSYA: fheGameSession.js
METHOD: createSinglePlayerGame() devami
SATIR: ~200-220
```
- Server'a HTTP POST veya socket emit:
  - `gameId`, `blockchainGameId`, `network`, `playerWallet`
- `games_manager.findNewGameWithFHE()` cagrilir (matchmaking)

### Adim 9: Server FHE game state olusturur
```
DOSYA: single_player.coffee
HANDLER: onFHEGameCreated
SATIR: ~2235-2262
```
```coffee
games[gameId].fhe = {
  enabled: true
  blockchainGameId: data.blockchainGameId
  network: data.network
  revealedCount: 0
}
```

---

## ASAMA 3: Ilk El (5 Kart Cekme)

### Adim 10: Client izin verilen reveal sayisini sorgular
```
DOSYA: fheGameSession.js
METHOD: revealInitialHand()
SATIR: ~250-260
```
- `contract.getAllowedReveals(gameId)` VIEW call
- Sonuc: `5` (ilk el icin 5 kart)

### Adim 11: Client FHE handle'lari alir
```
DOSYA: fheGameSession.js
METHOD: revealInitialHand() devami
SATIR: ~265-280
```
- `contract.getDrawHandles(gameId, 5)` VIEW call
- Sonuc: 5 adet encrypted handle (euint8)
- Her handle 66 karakter hex string

### Adim 12: Client KMS'den decrypt ister
```
DOSYA: fheGameSession.js
METHOD: decryptHandles(handles)
SATIR: ~650-700
```
- `publicDecrypt(handles)` cagrilir (Zama KMS)
- KMS response: `{ clearValues, decryptionProof }`
- `clearIndices = [196, 178, 219, 187, 5]` gibi 5 sayi

### Adim 13: Client reveal TX gonderir
```
DOSYA: fheGameSession.js
METHOD: revealInitialHand() devami
SATIR: ~580-600
```
- `contract.revealDrawBatch(gameId, clearIndices, proof)` TX
- Contract onaylar ve `revealedValues` array'ine yazar
- `revealedCount = 5` olur

### Adim 14: Client kartlari hesaplar
```
DOSYA: fheGameSession.js
METHOD: calculateCardsFromIndices(deck, indices)
SATIR: ~520-550
```
```javascript
var remaining = deck.slice();
var cards = [];
for (var i = 0; i < indices.length; i++) {
    var pos = indices[i] % remaining.length;
    cards.push(remaining[pos]);
    remaining.splice(pos, 1);
}
// cards = [20068, 30004, 20066, 11, 10021]
// remaining = 35 kart
```

### Adim 15: Client server'a reveal tamamlandi bildirir
```
DOSYA: fheGameSession.js
METHOD: notifyServer('fhe_initial_hand_revealed', data)
SATIR: ~320-330
```
- Socket emit: `fhe_initial_hand_revealed`
- Data: `{ gameId, blockchainGameId, hand, revealedIndices }`

### Adim 16: Server blockchain'den dogrular
```
DOSYA: single_player.coffee
HANDLER: onFHEInitialHandRevealed
SATIR: ~2271-2394
```
```coffee
# BLOCKCHAIN VERIFICATION - Never trust client!
BlockchainModule.verifyAndCalculateCards(network, blockchainGameId, fheDeckOrder, 5)
```

### Adim 17: Server blockchain indices alir
```
DOSYA: blockchain.coffee
METHOD: verifyAndCalculateCards()
SATIR: ~250-278
```
- `getVerifiedDrawOrder(network, gameId)` VIEW call
- Contract'tan `[196, 178, 219, 187, 5]` doner
- Server kendi deck kopyasiyla ayni algoritmaypi calistirir

### Adim 18: Server kartlari SDK'ya uygular
```
DOSYA: single_player.coffee
HANDLER: onFHEInitialHandRevealed devami
SATIR: ~2343-2370
```
```coffee
for cardId in verifiedCards
  # drawPile'dan bul
  game.session.applyCardToHand(playerDeck, cardIndex, card, handSlotIndex)
```

### Adim 19: Server client'a onay gonderir
```
DOSYA: single_player.coffee
SATIR: ~2377-2385
```
```coffee
socket.emit "fhe_initial_hand_revealed_response", {
  success: true
  verified: true
  revealedCount: 5
  cardIndices: [5183, 3227, 3481, 5580, 3640]
}
```

### Adim 20: Client eli gosterir
```
DOSYA: game.js
METHOD: _populateFHEHand(cardIds, serverCardIndices)
SATIR: ~1219-1300
```
- Server'dan gelen `cardIndices` kullanilir
- `bindCardNodeAtIndex()` ile her kart UI'a eklenir
- El gosterilir, oyun baslar

---

## ASAMA 4: Turn Sonu + Kart Cekme

### Adim 21: Kullanici "End Turn" basar
```
DOSYA: game.js veya GameLayer.js
EVENT: End turn action
```
- `EndTurnAction` server'a gonderilir

### Adim 22: Server turn'u bitirir
```
DOSYA: single_player.coffee
HANDLER: executeAction (EndTurnAction)
```
- `DrawCardAction` FHE oyuncu icin SKIP edilir
- AI turn'unu oynar
- Turn timer yeniden baslar

### Adim 23: Client turn degistigini algilar
```
DOSYA: game.js
METHOD: _onAfterShowEndTurn()
SATIR: ~415-450
```
- `DrawCardAction` event dinlenir
- FHE modda `fheGameMode.revealDrawCard()` cagrilir

### Adim 24: Client incrementTurn TX gonderir
```
DOSYA: fheGameSession.js
METHOD: incrementTurn()
SATIR: ~355-380
```
- `contract.incrementTurn(gameId)` TX
- Contract: `currentTurn++`, `allowedReveals = 5 + currentTurn`

### Adim 25: Client yeni kart handle'i alir
```
DOSYA: fheGameSession.js
METHOD: revealDrawCard()
SATIR: ~400-420
```
- `contract.getDrawHandles(gameId, 1)` - sadece 1 handle
- `decryptHandles([handle])` - KMS decrypt
- Sonuc: `clearIndex = 42`

### Adim 26: Client reveal TX gonderir
```
DOSYA: fheGameSession.js
METHOD: revealDrawCard() devami
SATIR: ~580-600
```
- `contract.revealDrawBatch(gameId, [42], proof)` TX
- `revealedCount = 6` olur

### Adim 27: Client karti hesaplar
```
DOSYA: fheGameSession.js
METHOD: calculateCardsFromIndices()
```
- `remaining` deck uzerinden `42 % 35 = 7` pozisyon
- Yeni kart ID belirlenir

### Adim 28: Client server'a bildirir
```
DOSYA: fheGameSession.js
METHOD: notifyServer('fhe_card_drawn', data)
SATIR: ~450-460
```
- Socket emit: `fhe_card_drawn`
- Data: `{ gameId, turn, cardId }`

### Adim 29: Server blockchain'den dogrular
```
DOSYA: single_player.coffee
HANDLER: onFHECardDrawn
SATIR: ~2401-2528
```
```coffee
# BLOCKCHAIN VERIFICATION - Never trust client!
BlockchainModule.getVerifiedDrawOrder(network, blockchainGameId)
.then (indices) ->
  # TUM indices ile hesapla (remaining deck dogru olsun)
  result = BlockchainModule.calculateCardsFromIndices(fheDeckOrder, indices)
  cardId = result.drawnCards[result.drawnCards.length - 1]
```

### Adim 30: Server karti SDK'ya uygular
```
DOSYA: single_player.coffee
SATIR: ~2484-2500
```
```coffee
game.session.applyCardToHand(playerDeck, appliedCardIndex, card)
```

### Adim 31: Server client'a onay gonderir
```
DOSYA: single_player.coffee
SATIR: ~2518-2524
```
```coffee
socket.emit "fhe_card_drawn_response", {
  success: true
  turn: turn
  cardId: cardId
  cardIndex: appliedCardIndex
  burned: false
}
```

### Adim 32: Client karti ele ekler
```
DOSYA: game.js
METHOD: _addFHECardToHand(cardId, serverCardIndex)
SATIR: ~1130-1210
```
- Server'dan gelen `cardIndex` kullanilir
- `bindCardNodeAtIndex()` ile UI'a eklenir

---

## ASAMA 5: Sonraki Turnlar

Her turn icin Adim 21-32 tekrarlanir:

| Turn | revealedCount | allowedReveals | Yeni Kart |
|------|---------------|----------------|-----------|
| 0    | 5             | 5              | -         |
| 1    | 6             | 6              | 1 kart    |
| 2    | 7             | 7              | 1 kart    |
| 3    | 8             | 8              | 1 kart    |
| ...  | ...           | ...            | ...       |

---

## ASAMA 6: Oyun Sonu

### Adim 33: Bitis kosulu olusur
- General HP = 0
- Surrender
- Disconnect

### Adim 34: Server oyunu sonlandirir
```
DOSYA: single_player.coffee
```
- Kazanan belirlenir
- Sonuc database'e kaydedilir

### Adim 35: Client sonuc ekrani gosterir
```
DOSYA: game.js / GameLayer.js
```
- Victory/Defeat ekrani

---

## TX OZETI (Blockchain Islemleri)

| Adim | Islem | Gonderen | TX Sayisi |
|------|-------|----------|-----------|
| 6 | createSinglePlayerGame | CLIENT | 1 |
| 13 | revealDrawBatch (5 kart) | CLIENT | 1 |
| 24 | incrementTurn | CLIENT | 1 |
| 26 | revealDrawBatch (1 kart) | CLIENT | 1 |
| ... | Her turn 2 TX | CLIENT | 2 |

**10 Turn Oyun:**
= 1 (create) + 1 (ilk el) + 10 x 2 (increment + reveal)
= 22 TX

**Server: 0 TX** - Sadece VIEW call yapar

---

## VIEW CALL OZETI

| Fonksiyon | Cagiran | Aciklama |
|-----------|---------|----------|
| getAllowedReveals | Client | Kac kart cekilebilir |
| getDrawHandles | Client | Encrypted handle'lar |
| getVerifiedDrawOrder | Server | Onaylanmis indices |
| getRevealedCount | Client/Server | Kac reveal yapildi |
| getCurrentTurn | Client/Server | Hangi turn |
| getGameInfo | Server | Tum oyun bilgisi |

---

## GUVENLIK OZETI

| Konu | Aciklama |
|------|----------|
| RANDOM | FHE.randomEuint8() - manipule edilemez |
| DECRYPT | Sadece Zama KMS yapabilir |
| PROOF | decryptionProof olmadan reveal yapilamaz |
| CLIENT | Kendi hesaplar, server'a guvenmez |
| SERVER | Blockchain'den okur, client'a guvenmez |
| SERVER TX | YOK - Sadece VIEW call |

---

## KRITIK NOKTALAR

### 1. Deck Sirasi Eslesmesi
- Client ve Server AYNI deck sirasini kullanmali
- `fheDeckOrder` game session'da saklanir
- Indices uzerinden ayni algoritma calistirilir

### 2. Remaining Deck Hesabi
- Her cekilen kart deck'ten cikarilir
- `pos = index % remaining.length`
- Server TUM indices'i kullanarak remaining'i dogru hesaplar

### 3. Blockchain Verification
- Server ASLA client'a guvenmez
- Her reveal sonrasi `getVerifiedDrawOrder()` cagirilir
- Blockchain'deki deger kullanilir

---

## MULTIPLAYER ICIN NOTLAR

Multiplayer'da her oyuncu kendi FHE game'ini olusturur:

1. Player1: `createSinglePlayerGame(gameId1)`
2. Player2: `createSinglePlayerGame(gameId2)`
3. Matchmaking sonrasi her iki gameId server'a bildirilir
4. Server her oyuncu icin ayri blockchain verification yapar
5. Her oyuncu kendi kartlarini kendi blockchain game'inden cekar

Dosyalar:
- `deck_select.js` - `_initFHEAndFindGame()` multiplayer icin hazir
- `games_manager.js` - `findNewGameWithFHE()` FHE data'yi matchmaking'e ekler
- `game.coffee` - Multiplayer FHE handler'lari eklenecek
