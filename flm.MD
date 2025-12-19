SINGLE PLAYER FHE AKIŞI

1. _startSinglePlayerGameFHE() → application.js:1909
   │
   ├─ Wallet bağlı mı kontrol
   │
   └─ proceedWithFHEGame()
   │
   ├─ fheGameMode.initialize(contractAddress) → fheGameMode.js:56
   │  │
   │  └─ fheSession.initializeSessionWithPIN(contracts) → fhe_session.js:1105
   │     │
   │     ├─ Memory'de session varsa → direkt kullan
   │     │
   │     ├─ localStorage'da şifreli session varsa (hasEncryptedSession)
   │     │  │
   │     │  ├─ showPinDialog(false, 'Unlock..') → PIN EKRANI
   │     │  │
   │     │  ├─ loadSession(pin) → şifreli pair'i PIN ile decrypt
   │     │  │
   │     │  └─ Session geçerliyse → kullan, değilse yeni oluştur
   │     │
   │     └─ Session yoksa → _createNewSessionWithPIN()
   │        │
   │        ├─ generateKeypair() → yeni keypair oluştur
   │        ├─ createSessionSignature() → MetaMask imza
   │        ├─ showPinDialog(true, 'Create PIN..') → PIN OLUŞTUR
   │        └─ saveSession(pin) → şifrele ve localStorage'a kaydet
   │
   ├─ fheGameMode.createSinglePlayerGame() → fheGameMode.js:153
   │  │
   │  └─ Contract'a TX gönder → gameId al
   │
   └─ Server'a POST (fhe_enabled: true, fhe_game_id)
   │
   └─ _joinGame(gameListingData) → Oyuna katıl

PIN sorulduğu yer: fhe_session.js:1131 - showPinDialog(false, 'Unlock your FHE session')           

{
publicKey: ...,     // FHE public key (ML-KEM)                                                                                                                                                                                                                                                                  
privateKey: ...,    // FHE private key (ŞİFRELİ)                                                                                                                                                                                                                                                                
signature: ...,     // MetaMask ile alınan imza                                                                                                                                                                                                                                                                 
contractAddresses: [...],  // İzin verilen contract'lar                                                                                                                                                                                                                                                         
expiry: ...,        // Session süresi                                                                                                                                                                                                                                                                           
sessionStartTimeStamp: ...
}

ÖZET - PIN Akışı:

MEVCUT SESSION VARSA:
localStorage → PIN gir → decrypt → keypair memory'e yükle → devam

YENİ SESSION:
generateKeypair() → createSessionSignature() (MetaMask) → PIN oluştur →
saveSession(pin) ile şifrele → localStorage'a kaydet → devam

  ---
Buldum dediklerin:
1. ✅ PIN nerede soruluyor: fhe_session.js:1131 - showPinDialog()
2. ✅ Ne decrypt ediliyor: FHE keypair (publicKey + privateKey) + signature
3. ✅ Nereden okunuyor: localStorage (SESSION_STORAGE_KEY)



multiplayer Olması gereken:
_findingGame() → UI göster → FHE init + createGame TX → found_game bekle → _joinGame()