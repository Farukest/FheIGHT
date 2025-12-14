# OYUN BAŞI - FHE AKIŞI (Contract + Frontend)

## FLOWCHART: createSinglePlayerGame TX

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 1: Frontend createGame() çağırır                                       │
│                                                                              │
│  Dosya: fheGameMode.js                                                       │
│  Metod: FHEGameMode.prototype.createGame()                                   │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. Wallet bağlı mı kontrol                                               │
│    2. 40 kartı frontend'de shuffle et                                       │
│    3. FHE ile şifrele (encryptedDeck array)                                 │
│    4. contract.createSinglePlayerGame() TX at                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 2: Contract createSinglePlayerGame() TX alır                           │
│                                                                              │
│  Dosya: GameSession.sol                                                      │
│  Metod: createSinglePlayerGame() - satır 247                                 │
│                                                                              │
│  Parametreler:                                                               │
│                                                                              │
│    fheWallet (address):                                                      │
│      FHE Session Wallet - popup olmadan oyun içi TX atabilmek için          │
│      kullanılan GEÇİCİ CÜZDAN ADRESİ.                                       │
│                                                                              │
│      ℹ️  NOT: Bu parametre eskiden "sessionKey" olarak adlandırılıyordu    │
│      ve decrypt keypair ile karışıyordu. Şimdi "fheWallet" olarak          │
│      yeniden adlandırıldı.                                                  │
│                                                                              │
│      ┌────────────────────────────────────────────────────────────────────┐ │
│      │ CONTRACT'TAKİ fheWallet (BU PARAMETRE):                            │ │
│      │                                                                    │ │
│      │   Ne: Tarayıcıda oluşturulan GEÇİCİ CÜZDAN'ın adresi              │ │
│      │   Oluşturma: ethers.Wallet.createRandom()                         │ │
│      │   Tip: address (0x...)                                            │ │
│      │   Amaç: Oyun içi TX'leri popup OLMADAN imzalayabilmek             │ │
│      │                                                                    │ │
│      │   Nasıl çalışıyor:                                                 │ │
│      │   1. Tarayıcıda: const tempWallet = ethers.Wallet.createRandom() │ │
│      │   2. tempWallet.address → Contract'a fheWallet olarak gönder     │ │
│      │   3. tempWallet.privateKey → Tarayıcıda sakla (localStorage)     │ │
│      │   4. Oyun içi TX'leri bu privateKey ile imzala → popup yok       │ │
│      │                                                                    │ │
│      │   Contract kontrolü (satır 137, 169):                             │ │
│      │     require(msg.sender == player.wallet ||                        │ │
│      │             msg.sender == player.fheWallet)                       │ │
│      │     → TX'i MetaMask VEYA geçici cüzdan atabilir                   │ │
│      ├────────────────────────────────────────────────────────────────────┤ │
│      │ STORY.MD'DEKİ DECRYPT KEYPAİR (FARKLI BİR ŞEY):                   │ │
│      │                                                                    │ │
│      │   Ne: FHE decrypt için kullanılan keypair                         │ │
│      │   Oluşturma: fhevmInstance.generateKeypair()                      │ │
│      │   Tip: {publicKey, privateKey} - CÜZDAN DEĞİL                     │ │
│      │   Amaç: KMS'ten şifreli veriyi decrypt etmek                      │ │
│      │   Tx atmadan decrypt için                                         │ │
│      │   Contract ile ilgisi: YOK                                        │ │
│      └────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│    generalCardId (uint32):                                                   │
│      Oyuncunun seçtiği General kartının ID'si.                              │
│      Örnek: 10001 = Argeon, 10002 = Ziran, vs.                              │
│                                                                              │
│    encryptedDeck (externalEuint16[40]):                                      │
│      Frontend'de FHE ile şifrelenmiş 40 kartlık deste.                      │
│      Her eleman bir kart ID'sinin şifreli hali (euint16).                   │
│      Sıra frontend'de shuffle edilmiş, contract sırayı bilmiyor.            │
│                                                                              │
│    inputProof (bytes):                                                       │
│      FHE şifreleme kanıtı. KMS bu proof ile şifrelerin geçerli              │
│      olduğunu doğrular. Tek proof 40 kart için yeterli.                     │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. General kartını doğrula (cardRegistry.isValidGeneral)                 │
│    2. gameId oluştur (nextGameId++)                                         │
│    3. Player bilgilerini kaydet (wallet, sessionKey, generalCardId)         │
│    4. _initializeEncryptedDeck() çağır  ──────────────────────────┐         │
│    5. _drawStartingHand() çağır  ─────────────────────────────────┼────┐    │
│    6. Oyun state ayarla                                           │    │    │
└───────────────────────────────────────────────────────────────────┼────┼────┘
                                                                    │    │
                      ┌─────────────────────────────────────────────┘    │
                      ▼                                                  │
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 3: _initializeEncryptedDeck() - Şifreli desteyi sakla                  │
│                                                                              │
│  Dosya: GameSession.sol                                                      │
│  Metod: _initializeEncryptedDeck() - satır 999                               │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    for (i = 0; i < 40; i++) {                                               │
│      player.deck[i] = FHE.fromExternal(encryptedDeck[i], inputProof)        │
│      FHE.allowThis(player.deck[i])  // Contract okuyabilir                  │
│    }                                                                         │
│                                                                              │
│  ✅ STATE DEĞİŞTİ:                                                          │
│    player.deck[0..39] = [enc0, enc1, enc2, ..., enc39]                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                                                         │
                      ┌──────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 4: _drawStartingHand() - Başlangıç eli çek                             │
│                                                                              │
│  Dosya: GameSession.sol                                                      │
│  Metod: _drawStartingHand() - satır 1021                                     │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    for (i = 0; i < 5; i++) {                     // STARTING_HAND_SIZE = 5  │
│      player.hand[i] = player.deck[i]             // deck[0-4] → hand[0-4]   │
│      FHE.allowThis(player.hand[i])               // Contract okuyabilir     │
│      FHE.allow(player.hand[i], player.wallet)    // User decrypt edebilir   │
│    }                                                                         │
│    player.handSize = 5                                                      │
│    player.deckIndex = 5                          // Sonraki kart = deck[5]  │
│                                                                              │
│  ✅ STATE DEĞİŞTİ:                                                          │
│    player.hand[0..4] = deck[0..4] (handle'lar kopyalandı)                   │
│    player.handSize = 5                                                      │
│    player.deckIndex = 5                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 5: Oyun state ayarla (createSinglePlayerGame içinde devam)             │
│                                                                              │
│  Dosya: GameSession.sol                                                      │
│  Metod: createSinglePlayerGame() - satır 297-302                             │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    game.state = GameState.InProgress                                        │
│    game.currentTurn = 0            // Player 0 başlar                       │
│    game.turnNumber = 1                                                      │
│    game.players[0].maxMana = 2                                              │
│    game.players[0].currentMana = 2                                          │
│                                                                              │
│  ✅ STATE DEĞİŞTİ: Oyun başladı                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                           [TX TAMAMLANDI]
                           [GameCreated event emit edildi]
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 6: Frontend TX receipt alır, eli decrypt eder                          │
│                                                                              │
│  Dosya: fheGameSession.js                                                    │
│  Metod: FHEGameSession.prototype.decryptHand() - satır 469                   │
│                                                                              │
│  Akış:                                                                       │
│    1. contract.getHand(gameId)       → hand handle'larını al (view call)    │
│    2. contract.getPlayerInfo(gameId) → handSize al (kaç kart var)           │
│    3. fheSession.decrypt(handles)    → KMS'den decrypt et                   │
│    4. self.decryptedHand = [cardId1, cardId2, ...]                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## CONTRACT STATE - OYUN BAŞI SONRASI

```
BAŞLANGIÇ DURUMU:

┌────────────────────────────────────────────────────────────────┐
│ player.deck[40]:                                                │
│                                                                 │
│   Index:  [0]  [1]  [2]  [3]  [4]  [5]  [6]  ... [39]          │
│   Değer:  enc  enc  enc  enc  enc  enc  enc  ... enc           │
│            │    │    │    │    │    ↑                          │
│            └────┴────┴────┴────┘    │                          │
│                    │                │                          │
│              HAND'E GİTTİ      deckIndex = 5                   │
│                                (sonraki çekilecek)             │
├────────────────────────────────────────────────────────────────┤
│ player.hand[6]:                                                 │
│                                                                 │
│   Index:  [0]  [1]  [2]  [3]  [4]  [5]                         │
│   Değer:  enc  enc  enc  enc  enc  boş                         │
│            ↑    ↑    ↑    ↑    ↑                               │
│            deck[0-4]'ten kopyalandı                            │
│                                                                 │
│   handSize = 5  (5 kart var)                                   │
├────────────────────────────────────────────────────────────────┤
│ player.deckIndex = 5  (sonraki çekilecek kart pozisyonu)       │
│ player.handSize = 5   (eldeki kart sayısı)                     │
│ player.currentMana = 2                                          │
│ player.maxMana = 2                                              │
│ game.turnNumber = 1                                             │
│ game.currentTurn = 0                                            │
└────────────────────────────────────────────────────────────────┘
```

---

## decryptHand() DETAYLI AKIŞ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  decryptHand() - fheGameSession.js:469                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. contract.getHand(gameId) çağır                                           │
│                                                                              │
│  Dosya: GameSession.sol                                                      │
│  Metod: getHand() - satır 932                                                │
│                                                                              │
│  function getHand(uint256 gameId) external view                             │
│    returns (euint16[6] memory) {                                            │
│      return game.players[playerIndex].hand;                                 │
│  }                                                                           │
│                                                                              │
│  Dönen: [handle0, handle1, handle2, handle3, handle4, 0]                    │
│         (6 elemanlı array, son slot boş)                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. contract.getPlayerInfo(gameId, playerIndex) çağır                        │
│                                                                              │
│  Dosya: GameSession.sol                                                      │
│  Metod: getPlayerInfo() - satır 960                                          │
│                                                                              │
│  Dönen: { wallet, handSize: 5, deckRemaining: 35, currentMana, ... }        │
│                       ↑                                                      │
│                  Bu değer ile kaç handle decrypt edileceği belirlenir       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. Handle'ları hex formatına çevir                                          │
│                                                                              │
│  Dosya: fheGameSession.js - satır 516-540                                    │
│                                                                              │
│  for (i = 0; i < handSize; i++) {                                           │
│    handle → hexHandle (0x... formatı, 64 karakter padding)                  │
│    handleStrings.push(hexHandle)                                            │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. fheSession.decrypt(handleStrings, contractAddress) çağır                 │
│                                                                              │
│  Dosya: fhe_session.js                                                       │
│  Metod: FHESession.prototype.decrypt()                                       │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. Session keypair ve signature ile KMS'e istek at                       │
│    2. instance.userDecrypt(handles, keypair, signature, ...)                │
│    3. KMS şifreli değerleri açar ve döndürür                                │
│                                                                              │
│  Dönen: [10101, 10205, 10302, 10401, 10505]  ← Kart ID'leri                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  5. Sonuç kaydedilir                                                         │
│                                                                              │
│  self.decryptedHand = [10101, 10205, 10302, 10401, 10505]                   │
│                                                                              │
│  Bu array SDK'ya verilir ve UI'da kartlar gösterilir                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ÖZET TABLO

| Adım | Dosya | Metod | Ne Yapıyor | State Değişimi |
|------|-------|-------|------------|----------------|
| 1 | fheGameMode.js | createGame() | Desteyi şifrele, TX at | - |
| 2 | GameSession.sol:247 | createSinglePlayerGame() | Oyunu oluştur | gameId++ |
| 3 | GameSession.sol:999 | _initializeEncryptedDeck() | 40 kartı kaydet | deck[0..39] |
| 4 | GameSession.sol:1021 | _drawStartingHand() | İlk 5 kartı ele al | hand[0..4], handSize=5, deckIndex=5 |
| 5 | GameSession.sol:297 | createSinglePlayerGame() (devam) | Oyunu başlat | state=InProgress, mana=2 |
| 6 | fheGameSession.js:469 | decryptHand() | Eli görünür yap | decryptedHand[] |
| 6a | GameSession.sol:932 | getHand() | Handle'ları döndür | - (view) |
| 6b | GameSession.sol:960 | getPlayerInfo() | El boyutunu döndür | - (view) |
| 6c | fhe_session.js | decrypt() | KMS'den decrypt | - (off-chain) |

---

## INDEX'LER NE ANLAMA GELİYOR

| Değişken | Oyun Başı Değeri | Açıklama |
|----------|------------------|----------|
| `deckIndex` | 5 | deck[5] = sonraki çekilecek kart |
| `handSize` | 5 | hand[0..4] dolu, hand[5] boş |
| `deck[i]` | euint16 handle | i. pozisyondaki şifreli kart |
| `hand[i]` | euint16 handle | Eldeki i. slottaki şifreli kart |
