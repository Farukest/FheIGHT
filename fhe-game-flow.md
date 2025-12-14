api # FHE Single Player Game Flow

Son guncelleme: 2025-12-10

---

## OZET AKIS (10 ADIM)

```
1. Practice > Deck sec > Play tikla
2. Frontend deck'i shuffle eder (Fisher-Yates + crypto.getRandomValues)
3. Frontend deck'i sifreler (SDK.createEncryptedInput + add16 x 40)
4. MetaMask popup: Session signature (EIP-712) - TEK SEFERLIK
5. MetaMask popup: createSinglePlayerGame TX (gas)
6. Contract deck'i kaydeder, ilk 5 karti ele atar, ACL yazar
7. Frontend getHand() ile handle'lari alir (view, popup yok)
8. Frontend KMS'e gider, userDecrypt ile kartlari acar
9. Oyuncu kartlarini gorur
10. Replace: replaceCard(slot) TX -> yeni kart cekilir -> decrypt
```

---

## DETAYLI ADIMLAR

### ADIM 1: Oyun Baslatma Tetikleme

```
Dosya: app/ui/views2/deck_select_single_player.js:200
EventBus.trigger(EVENTS.start_single_player, deck, factionId, generalId, ...)
```

### ADIM 2: FHE Kontrolu

```
Dosya: app/application.js:1802
_startSinglePlayerGame() {
  if (CONFIG.fheEnabled) {
    _startSinglePlayerGameFHE()  // -> ADIM 3'e git
  } else {
    // Normal mod (server-side shuffle)
  }
}
```

### ADIM 3: Wallet & Session Baslat

```
Dosya: app/application.js:1897 - _startSinglePlayerGameFHE()

1. Wallet bagli mi kontrol et
2. FHEGameMode.getInstance().initialize()
   -> FHESession.initializeSession(contractAddress)

Dosya: app/common/fhe_session.js:304 - initializeSession()

3. localStorage'da gecerli session var mi?
   EVET -> Kullan, popup yok
   HAYIR -> Devam et

4. generateKeypair()
   -> crypto.getRandomValues(32 byte) = privateKey
   -> publicKey = derive(privateKey)
   -> Cebe koy (this.keypair)

5. createSessionSignature(contractAddress)
   -> EIP-712 typedData olustur
   -> MetaMask popup: eth_signTypedData_v4
   -> signature = "0x1a2b3c..."
   -> localStorage'a kaydet
```

**POPUP 1: Session Signature (gas yok)**

### ADIM 4: Deck Shuffle & Encrypt

```
Dosya: app/sdk/fhe/fheGameSession.js:231 - createSinglePlayerGame()

1. _padDeckTo40(deckCardIds)
   -> Eksik kartlari round-robin ile doldur
   -> [1,2,3...28] -> [1,2,3...28,1,2,3...12] = 40 kart

2. _shuffleDeck(deck)
   -> Fisher-Yates shuffle
   -> crypto.getRandomValues() ile guclu random
   -> Elde ilk 5 kart: shuffled[0..4]

3. _encryptDeck(shuffledDeck)
   Dosya: app/sdk/fhe/fheGameSession.js:867

   MOCK MODE (Hardhat):
   -> Mock handles olustur: "0x" + cardId.padStart(64, '0')
   -> inputProof = "0x"

   REAL MODE (Sepolia):
   -> _getFhevmInstance() ile SDK al
   -> input = sdk.createEncryptedInput(contract, user)
   -> for (i=0; i<40; i++) input.add16(deck[i])
   -> encrypted = await input.encrypt()
   -> { handles: bytes32[40], inputProof: bytes }
```

### ADIM 5: Contract TX Gonder

```
Dosya: app/sdk/fhe/fheGameSession.js:260

1. ABI encode:
   iface.encodeFunctionData('createSinglePlayerGame', [
     fheWallet,           // wallet adresi
     generalCardId,       // general ID
     encryptedDeck,       // bytes32[40] handles
     inputProof           // bytes proof
   ])

2. TX gonder:
   window.ethereum.request({
     method: 'eth_sendTransaction',
     params: [{
       from: walletAddress,
       to: contractAddress,
       data: encodedData,
       gas: '0x7A1200'    // 8M gas
     }]
   })

3. _waitForReceipt(txHash)
   -> Polling ile bekle (max 120 saniye)
   -> receipt.logs'tan GameCreated event'i parse et
   -> gameId = event.args.gameId
```

**POPUP 2: createSinglePlayerGame TX (gas var)**

### ADIM 6: Contract Tarafinda (Solidity)

```
Contract: fhevm-contracts/contracts/GameSession.sol

createSinglePlayerGame(fheWallet, generalCardId, encryptedDeck, inputProof) {
  1. gameId = gameCounter++
  2. games[gameId].player1 = msg.sender
  3. games[gameId].fheWallet1 = fheWallet

  4. for (i=0; i<40; i++) {
       // Sifreli deck'i kaydet
       playerDecks[gameId][0][i] = encryptedDeck[i]
     }

  5. for (i=0; i<5; i++) {
       // Ilk 5 karti ele at
       playerHands[gameId][0][i] = encryptedDeck[i]
       // ACL - sadece oyuncu gorebilir
       FHE.allowThis(playerHands[gameId][0][i])
       FHE.allow(playerHands[gameId][0][i], msg.sender)
     }

  6. emit GameCreated(gameId, msg.sender, fheWallet)
  7. emit GameStarted(gameId)
}
```

### ADIM 7: Handle'lari Al (View Call)

```
Dosya: app/sdk/fhe/fheGameSession.js:466 - decryptHand()

1. contract.getHand(gameId)
   -> View call, gas yok, popup yok
   -> returns uint256[6] handles

2. contract.getPlayerInfo(gameId, playerIndex)
   -> handSize = 5 (baslangic eli)
   -> deckRemaining = 35
```

### ADIM 8: KMS Decrypt

```
Dosya: app/common/fhe_session.js:413 - decrypt()

MOCK MODE (Hardhat):
  -> Handle'in son 16 bit'i = cardId
  -> value = BigInt(handle) & 0xFFFF
  -> Popup yok

REAL MODE (Sepolia):
  -> SDK.userDecrypt(
       handlePairs,        // [{handle, contractAddress}]
       privateKey,         // Session private key
       publicKey,          // Session public key
       signature,          // EIP-712 signature
       [contractAddress],  // Contract listesi
       userAddress,
       startTimestamp,
       durationDays
     )
  -> SDK relayerUrl'e gider (https://relayer.testnet.zama.org)
  -> KMS signature dogrular, ACL kontrol eder
  -> Kutuyu acar, senin publicKey ile reencrypt eder
  -> Sen privateKey ile acarsın
  -> Popup yok (session key ile)
```

### ADIM 9: Kartlari Goster

```
Frontend decryptedHand = [cardId1, cardId2, cardId3, cardId4, cardId5]
UI'da kart gorselleri gosterilir
```

---

## REPLACE AKISI

```
Oyuncu elindeki bir karti degistirmek istiyor (max 2 hak)

1. UI: Replace butonuna tikla, slot sec (0-4)

2. Frontend:
   Dosya: app/sdk/fhe/fheGameSession.js:718 - replaceCard()

   contract.replaceCard(gameId, handSlot)
   -> TX gonder (popup VAR - gas)
   -> _waitForReceipt()

3. Contract:
   replaceCard(gameId, handSlot) {
     // Eski karti deck'e geri koy (optional)

     // Yeni kart cek (deck'ten siradaki)
     idx = 40 - deckRemaining
     newCard = playerDecks[gameId][playerIndex][idx]

     // Ele yerlestir
     playerHands[gameId][playerIndex][handSlot] = newCard

     // ACL yaz
     FHE.allowThis(newCard)
     FHE.allow(newCard, player)

     deckRemaining--

     emit CardReplaced(gameId, playerIndex, handSlot)
   }

4. Frontend:
   return self.decryptHand()  // Yeni eli decrypt et
   -> ADIM 7-9 tekrar
   -> Yeni kart gosterilir
```

**REPLACE POPUP: 1 TX (gas var)**

---

## POPUP SAYISI (TOPLAM)

| Islem | Popup | Tip |
|-------|-------|-----|
| Session signature | 1 | Sign (gas yok) |
| createSinglePlayerGame | 1 | TX (gas var) |
| getHand | 0 | View |
| KMS decrypt | 0 | Session key |
| replaceCard | 1 | TX (gas var) |

**Oyun basi: 2 popup**
**Her replace: 1 popup**

---

## DOSYA REFERANSLARI

| Islem | Dosya | Fonksiyon |
|-------|-------|-----------|
| Event trigger | deck_select_single_player.js:200 | onPlayClicked |
| FHE kontrol | application.js:1802 | _startSinglePlayerGame |
| FHE akisi | application.js:1897 | _startSinglePlayerGameFHE |
| Session init | fhe_session.js:304 | initializeSession |
| Keypair | fhe_session.js:143 | generateKeypair |
| Signature | fhe_session.js:251 | createSessionSignature |
| Shuffle | fheGameSession.js:836 | _shuffleDeck |
| Encrypt | fheGameSession.js:867 | _encryptDeck |
| TX gonder | fheGameSession.js:231 | createSinglePlayerGame |
| Handle al | fheGameSession.js:466 | decryptHand |
| KMS decrypt | fhe_session.js:413 | decrypt |
| Replace | fheGameSession.js:718 | replaceCard |
| Mulligan | fheGameSession.js:753 | completeMulligan |

---

## ONEMLI NOTLAR

1. **Shuffle Frontend'de** - Contract shuffle yapmaz, hazir sifreli deck alir
2. **Session 24 saat** - localStorage'da saklanir, suresi dolunca yeni sign
3. **ACL kritik** - `FHE.allowThis()` + `FHE.allow(player)` olmadan decrypt CALISMAZ
4. **Mock vs Real** - Hardhat'ta gercek FHE yok, handle = plaintext
5. **Relayer URL** - `https://relayer.testnet.zama.org` (SDK otomatik kullanir)

---

## NETWORK ADRESLERI

### Sepolia
```
GameSession: 0xAb87e5Fc5A1574Bd68D371901530dd138c4ED222
CardRegistry: 0x1BD8190C546D58518E438eCC65E7aE01fEd4c169
```

### Hardhat (Local)
```
GameSession: 0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575
CardRegistry: 0x998abeb3E57409262aE5b751f60747921B33613E
```



---

## KART CEKME AKISI (DrawCardAction)

### NORMAL MOD (FHE Kapali)

```
OYUN BASI:
Server shuffle yapar -> drawPile = [card7, card23, card1, card15, ...]

TUR BASI (DRAW):
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Server: StartTurnAction calistirilir                            │
│    Dosya: server/lib/single_player_game.coffee                     │
│                                                                     │
│ 2. Server: DrawCardAction olusturulur                              │
│    Dosya: app/sdk/actions/drawCardAction.js:60                     │
│    -> drawPile'dan SON karti al (pop)                              │
│    -> cardIndex = drawPile[drawPile.length - 1]                    │
│    -> cardData = { id: cardId, index: cardIndex }                  │
│                                                                     │
│ 3. Server -> Frontend: DrawCardAction broadcast edilir             │
│    socket.emit('game_event', { action: DrawCardAction })           │
│                                                                     │
│ 4. Frontend: onDrawStartingHand() veya onAfterShowStartTurn()      │
│    Dosya: app/ui/views/layouts/game.js:602, 726                    │
│    -> action.newCardData icinden kart ID'yi al                     │
│    -> UI'da goster                                                 │
└─────────────────────────────────────────────────────────────────────┘

KARAR VERICI: SERVER
Server drawPile'i kontrol eder, hangi kartin cekilecegini belirler
```

### FHE MOD (FHE Acik)

```
OYUN BASI:
Frontend shuffle yapar -> encryptedDeck = [h1, h2, ... h40]
Contract'a gonderilir, deck[0-39] = encrypted handles
Contract hand[0-4] = deck[0-4] (ilk 5 kart)
deckIndex = 5 (siradaki cekilecek kart)

TUR BASI (DRAW):
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Frontend: onAfterShowStartTurn() tetiklenir                     │
│    Dosya: app/ui/views/layouts/game.js:726                         │
│    -> turnNumber > 1 kontrolu (ilk turda cekim yok)                │
│    -> FHE aktif mi? Benim turum mu?                                │
│                                                                     │
│ 2. Frontend: fheGameMode.drawCard() cagrilir                       │
│    Dosya: app/sdk/fhe/fheGameMode.js:drawCard()                    │
│    -> fheGameSession.drawCard() cagrilir                           │
│                                                                     │
│ 3. FHEGameSession: drawCard()                                      │
│    Dosya: app/sdk/fhe/fheGameSession.js:drawCard()                 │
│    -> TX GONDERILMEZ! Session key ile decrypt yapilir              │
│    -> return self.decryptHand()                                    │
│                                                                     │
│ 4. Contract: drawCard() - AYRI BIR TX GEREKEBILIR                  │
│    Dosya: fhevm-contracts/contracts/GameSession.sol:434            │
│    -> drawnCard = player.deck[player.deckIndex]  // h6             │
│    -> player.hand[player.handSize] = drawnCard                     │
│    -> FHE.allowThis(drawnCard)                                     │
│    -> FHE.allow(drawnCard, player.wallet)                          │
│    -> handSize++, deckIndex++                                      │
│                                                                     │
│ 5. Frontend: decryptHand()                                         │
│    Dosya: app/sdk/fhe/fheGameSession.js:466                        │
│    -> contract.getPlayerHand(gameId) // view call                  │
│    -> handles = [h1, h2, h3, h4, h5, h6]                           │
│                                                                     │
│ 6. FHESession: decrypt(handles)                                    │
│    Dosya: app/common/fhe_session.js:413                            │
│    -> KMS'e git, session key ile decrypt                           │
│    -> cardIds = [23, 45, 12, 67, 89, 34]                           │
│                                                                     │
│ 7. Frontend: _populateFHEHand(cardIds)                             │
│    Dosya: app/ui/views/layouts/game.js:508                         │
│    -> SDK'ya kartlari ekle                                         │
│    -> UI'da goster                                                 │
└─────────────────────────────────────────────────────────────────────┘

KARAR VERICI: CONTRACT (Blockchain)
Contract deck array'ini kontrol eder
Shuffle frontend'de OYUN BASI'nda yapildi
Contract sadece SIRALI ceker: deck[deckIndex++]
```

### KARSILASTIRMA TABLOSU

| Ozellik | Normal Mod | FHE Mod |
|---------|------------|---------|
| Shuffle | Server (oyun basi) | Frontend (oyun basi) |
| Deck Storage | Server memory | Blockchain (encrypted) |
| Kart Secimi | Server (random pop) | Contract (sirali) |
| Karar Verici | Server | Blockchain |
| TX Gerekli mi? | Hayir | Evet (drawCard TX) |
| Gizlilik | Yok (server bilir) | Var (encrypted) |
| Guven | Server'a guven | Trustless |

---

## ENCRYPTED DECK YAPISI

```
FRONTEND SHUFFLE (Fisher-Yates):
┌────────────────────────────────────────────────────────────────────┐
│ originalDeck = [card1, card2, card3, ... card40]                  │
│                                                                    │
│ shuffle():                                                         │
│   for (i = 39; i > 0; i--) {                                      │
│     j = crypto.getRandomValues() % (i + 1)                        │
│     swap(deck[i], deck[j])                                        │
│   }                                                                │
│                                                                    │
│ shuffledDeck = [card23, card7, card45, card12, ... ]              │
└────────────────────────────────────────────────────────────────────┘

ENCRYPT (SDK):
┌────────────────────────────────────────────────────────────────────┐
│ input = sdk.createEncryptedInput(contractAddress, userAddress)    │
│                                                                    │
│ for (i = 0; i < 40; i++) {                                        │
│   input.add16(shuffledDeck[i])  // euint16 olarak ekle            │
│ }                                                                  │
│                                                                    │
│ encrypted = await input.encrypt()                                  │
│                                                                    │
│ encrypted.handles = [h1, h2, h3, ... h40]  // bytes32[40]         │
│ encrypted.inputProof = 0x...               // tek proof           │
└────────────────────────────────────────────────────────────────────┘

CONTRACT'A GONDERIM:
┌────────────────────────────────────────────────────────────────────┐
│ createSinglePlayerGame(fheWallet, generalId, handles, proof)      │
│                                                                    │
│ Contract kayit:                                                    │
│   player.deck[0] = h1   (aslinda card23)                          │
│   player.deck[1] = h2   (aslinda card7)                           │
│   player.deck[2] = h3   (aslinda card45)                          │
│   ...                                                              │
│   player.deck[39] = h40                                           │
│                                                                    │
│   player.hand[0] = h1   (ilk 5 el'e)                              │
│   player.hand[1] = h2                                             │
│   player.hand[2] = h3                                             │
│   player.hand[3] = h4                                             │
│   player.hand[4] = h5                                             │
│   player.handSize = 5                                             │
│   player.deckIndex = 5  (siradaki cekilecek)                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## KART CEKME DETAYI (Contract)

```solidity
// Dosya: fhevm-contracts/contracts/GameSession.sol:434-455

function drawCard(uint256 gameId) external
    onlyCurrentPlayer(gameId)
    gameInProgress(gameId)
{
    Game storage game = games[gameId];
    uint8 playerIndex = game.currentTurn;
    Player storage player = game.players[playerIndex];

    require(player.handSize < MAX_HAND_SIZE, "Hand full");   // Max 6
    require(player.deckIndex < DECK_SIZE, "Deck empty");     // 40

    // SIRALI CEKIM - Random YOK!
    // Cunku deck zaten frontend'de shuffle edildi
    euint16 drawnCard = player.deck[player.deckIndex];  // deck[5] = h6
    player.hand[player.handSize] = drawnCard;           // hand[5] = h6

    // ACL: Sadece kart sahibi gorebilir
    FHE.allowThis(drawnCard);
    FHE.allow(drawnCard, player.wallet);

    player.handSize++;   // 5 -> 6
    player.deckIndex++;  // 5 -> 6
    game.lastActionTime = block.timestamp;

    emit CardDrawn(gameId, playerIndex);
}
```

### NEDEN RANDOM YOK?

```
SORUN: FHE ile random index IMKANSIZ!
┌────────────────────────────────────────────────────────────────────┐
│ // Bu YAPILAMAZ:                                                   │
│ euint8 randomIdx = FHE.randEuint8(35);  // 0-34 arasi             │
│ euint16 card = deck[randomIdx];         // HATA!                  │
│                                                                    │
│ // Neden? Cunku randomIdx ENCRYPTED!                              │
│ // Encrypted index ile array erisimi yapilamaz                    │
│ // Solidity array[encryptedIndex] desteklemiyor                   │
└────────────────────────────────────────────────────────────────────┘

COZUM: Frontend'de shuffle, Contract'ta sirali cekim
┌────────────────────────────────────────────────────────────────────┐
│ 1. Frontend guclu random ile shuffle yapar                        │
│    (crypto.getRandomValues - tarayici entropy)                    │
│                                                                    │
│ 2. Shuffled deck encrypt edilip Contract'a gonderilir             │
│                                                                    │
│ 3. Contract sadece deck[0], deck[1], deck[2]... sirayla ceker     │
│                                                                    │
│ 4. Sonuc: Her cekim FARKLI kart (cunku shuffle edildi)            │
│    Ama Contract'tan bakildiginda SIRALI gorunur                   │
└────────────────────────────────────────────────────────────────────┘
```

---

## FONKSIYON REFERANSLARI (HIZLI ARAMA)

### Frontend - Game UI
| Fonksiyon | Dosya | Satir | Aciklama |
|-----------|-------|-------|----------|
| onAfterShowStartTurn | game.js | 726 | Tur basi, kart cekme tetikler |
| onDrawStartingHand | game.js | 602 | Baslangic eli isler |
| _populateFHEHand | game.js | 508 | Decrypt edilen kartlari SDK'ya ekler |
| showNextStepInGameSetup | game.js | 491 | Oyun setup adimlarini isler |

### Frontend - FHE
| Fonksiyon | Dosya | Satir | Aciklama |
|-----------|-------|-------|----------|
| drawCard | fheGameSession.js | - | Kart cekme (TX yok, decrypt) |
| decryptHand | fheGameSession.js | 466 | Eli decrypt et |
| _encryptDeck | fheGameSession.js | 867 | Desteyi sifrele |
| _shuffleDeck | fheGameSession.js | 836 | Fisher-Yates shuffle |
| createSinglePlayerGame | fheGameSession.js | 231 | Oyun olustur TX |

### Frontend - Session
| Fonksiyon | Dosya | Satir | Aciklama |
|-----------|-------|-------|----------|
| decrypt | fhe_session.js | 413 | KMS ile decrypt |
| initializeSession | fhe_session.js | 304 | Session baslat |
| generateKeypair | fhe_session.js | 143 | Keypair olustur |
| createSessionSignature | fhe_session.js | 251 | EIP-712 imza al |

### Contract - Solidity
| Fonksiyon | Dosya | Satir | Aciklama |
|-----------|-------|-------|----------|
| createSinglePlayerGame | GameSession.sol | - | Oyun olustur |
| drawCard | GameSession.sol | 434 | Desteden kart cek |
| getPlayerHand | GameSession.sol | - | El handle'larini don |
| playCard | GameSession.sol | 464 | Kart oyna |

### Server - Normal Mod
| Fonksiyon | Dosya | Satir | Aciklama |
|-----------|-------|-------|----------|
| _execute | drawCardAction.js | 60 | Server kart cekme |
| addCardsToDeck | gameSetup.js | 165 | Deck olustur/shuffle |
| getAreDecksRandomized | gameSession.js | 1060 | Shuffle aktif mi? |

---

## SERVER vs BLOCKCHAIN DECK UYUMSUZLUGU

```
PROBLEM:
┌────────────────────────────────────────────────────────────────────┐
│ FHE modunda:                                                       │
│                                                                    │
│ BLOCKCHAIN DECK (gercek):                                          │
│   shuffledDeck = [card23, card7, card45, ...]  (frontend shuffle) │
│   Contract bu sirada tutar                                        │
│                                                                    │
│ SERVER DECK (yanlis):                                              │
│   serverDeck = [card1, card5, card12, ...]  (server shuffle)      │
│   Server farkli sirada tutar!                                     │
│                                                                    │
│ SONUC: DrawCardAction.newCardData YANLIS kart doner!              │
└────────────────────────────────────────────────────────────────────┘

MEVCUT COZUM:
┌────────────────────────────────────────────────────────────────────┐
│ FHE player icin server'in DrawCardAction'i IGNORE edilir          │
│                                                                    │
│ game.js:onAfterShowStartTurn():                                   │
│   if (fheEnabled && isMyTurn) {                                   │
│     // Server'in kartini kullanma                                 │
│     // Contract'tan decrypt et                                    │
│     fheGameMode.drawCard().then(...)                              │
│   }                                                                │
│                                                                    │
│ AI player icin server'in DrawCardAction KULLANILIR                │
│ (AI FHE kullanmiyor)                                              │
└────────────────────────────────────────────────────────────────────┘
```

---

Son guncelleme: 2025-12-11