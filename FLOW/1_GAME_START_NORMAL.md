# OYUN BAŞI - NORMAL AKIŞ (FHE'siz)

## FLOWCHART: Normal Single Player Game Oluşturma

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 1: Kullanıcı "Play" butonuna tıklar                                   │
│                                                                              │
│  Dosya: deck_select_single_player.js                                        │
│  Metod: onStartGamePressed() - satır 200                                    │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    EventBus.trigger(EVENTS.start_single_player, deck, factionId, ...)      │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 2: Application event'i yakalar                                         │
│                                                                              │
│  Dosya: application.js                                                       │
│  Metod: _startSinglePlayerGame() - satır 1802                               │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. CONFIG.fheEnabled kontrol et                                          │
│    2. fheEnabled = false → Normal akış devam                                │
│    3. API'ye POST request at                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 3: API Request gönder                                                  │
│                                                                              │
│  Dosya: application.js - satır 1830-1846                                    │
│  Endpoint: POST /api/me/games/single_player                                 │
│                                                                              │
│  Request Body:                                                               │
│    {                                                                         │
│      deck: [{id: cardId}, ...],      // 40 kartlık deste (plaintext)       │
│      cardBackId: number,                                                    │
│      battleMapId: number,                                                   │
│      ai_general_id: number,                                                 │
│      ai_difficulty: number,                                                 │
│      isDeveloperMode: boolean                                               │
│    }                                                                         │
│                                                                              │
│  ⚠️  FARK: Kartlar PLAINTEXT gönderiliyor (şifrelenmemiş)                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 4: Server request'i alır                                               │
│                                                                              │
│  Dosya: server/routes/api/me/games.coffee                                   │
│  Metod: POST /single_player handler - satır 350-430                         │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. Request body'yi validate et (validators.singlePlayerInput)           │
│    2. gameSetupOptions oluştur                                              │
│    3. createSinglePlayerGame() çağır                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 5: GameSession oluştur                                                 │
│                                                                              │
│  Dosya: server/lib/create_single_player_game.coffee                         │
│  Metod: createSinglePlayerGame() - satır 31-260                             │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. GameSession.create() - satır 151                                      │
│    2. setIsDeveloperMode() - satır 158-160                                  │
│    3. GameSetup.setupNewSession() - satır 162                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 6: Desteyi ayarla ve shuffle et                                        │
│                                                                              │
│  Dosya: app/sdk/gameSetup.js                                                │
│  Metod: addCardsToDeck() - satır 165-226                                    │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    for each card in deck:                                                   │
│      1. Kart datasını oluştur                                               │
│      2. gameSession.getAreDecksRandomized() kontrol et                      │
│         - TRUE (normal): index = Math.floor(Math.random() * length)        │
│         - FALSE (dev): index = playerCardsData.length - 1 (deterministik)  │
│      3. Kartı drawPile'a ekle                                               │
│                                                                              │
│  ⚠️  FARK: Shuffle SERVER'DA yapılıyor (Math.random)                       │
│  ⚠️  Server shuffle sırasını biliyor!                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 7: Başlangıç elini çek                                                 │
│                                                                              │
│  Dosya: app/sdk/gameSetup.js                                                │
│  Metod: setupNewSession() içinde                                            │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    for (i = 0; i < 5; i++) {                                                │
│      DrawStartingHandAction execute et                                      │
│      → drawPile'dan kart al                                                 │
│      → hand'e ekle                                                          │
│    }                                                                         │
│                                                                              │
│  ✅ STATE DEĞİŞTİ:                                                          │
│    deck.drawPile = [kart5, kart6, ..., kart39] (35 kart kaldı)             │
│    deck.hand = [kart0, kart1, kart2, kart3, kart4, null] (5 kart)          │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 8: Oyun state ayarla                                                   │
│                                                                              │
│  Dosya: app/sdk/gameSession.js                                              │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    game.status = 'active'                                                   │
│    player.currentMana = 2                                                   │
│    player.maxMana = 2                                                       │
│    turnNumber = 1                                                           │
│                                                                              │
│  ✅ STATE DEĞİŞTİ: Oyun başladı                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 9: Socket.io ile oyun verisini gönder                                  │
│                                                                              │
│  Server → Client:                                                            │
│    - Tüm oyun state'i                                                       │
│    - El kartları (PLAINTEXT - server biliyor)                               │
│    - Deste sırası (PLAINTEXT - server biliyor)                              │
│                                                                              │
│  ⚠️  GÜVENLİK SORUNU:                                                       │
│    Server TÜM kartları biliyor:                                             │
│    - Senin elin                                                             │
│    - Deste sırası                                                           │
│    - Rakibin eli (multiplayer'da)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADIM 10: Frontend oyunu başlatır                                            │
│                                                                              │
│  Dosya: app/ui/views/layouts/game.js                                        │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. GameSession'ı deserialize et                                          │
│    2. UI'ı güncelle                                                         │
│    3. El kartlarını göster                                                  │
│                                                                              │
│  ⚠️  Decrypt YOK - kartlar zaten plaintext                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## SDK STATE - OYUN BAŞI SONRASI

```
BAŞLANGIÇ DURUMU:

┌────────────────────────────────────────────────────────────────┐
│ deck.drawPile (Array):                                         │
│                                                                 │
│   [cardIndex5, cardIndex6, cardIndex7, ..., cardIndex39]       │
│   Length: 35 (40 - 5 başlangıç eli)                            │
│                                                                 │
│   ⚠️  Server bu array'i biliyor!                               │
├────────────────────────────────────────────────────────────────┤
│ deck.hand (Array[6]):                                          │
│                                                                 │
│   [cardIndex0, cardIndex1, cardIndex2, cardIndex3, cardIndex4, null]
│                                                                 │
│   5 kart dolu, 1 slot boş                                      │
│   ⚠️  Server bu kartları biliyor!                              │
├────────────────────────────────────────────────────────────────┤
│ player.currentMana = 2                                          │
│ player.maxMana = 2                                              │
│ game.turnNumber = 1                                             │
│ game.currentPlayerId = player1                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## ÖZET TABLO

| Adım | Dosya | Metod | Ne Yapıyor |
|------|-------|-------|------------|
| 1 | deck_select_single_player.js:200 | onStartGamePressed() | Event trigger |
| 2 | application.js:1802 | _startSinglePlayerGame() | FHE kontrol, API çağır |
| 3 | application.js:1830 | - | POST /api/me/games/single_player |
| 4 | games.coffee:350 | POST handler | Validate, createGame çağır |
| 5 | create_single_player_game.coffee:151 | createSinglePlayerGame() | GameSession oluştur |
| 6 | gameSetup.js:165 | addCardsToDeck() | Shuffle (Math.random) |
| 7 | gameSetup.js | setupNewSession() | Başlangıç eli çek |
| 8 | gameSession.js | - | Mana, turn ayarla |
| 9 | Socket.io | - | Oyun verisini gönder |
| 10 | game.js | - | UI başlat |

---

## NORMAL vs FHE KARŞILAŞTIRMA

| Özellik | Normal Mod | FHE Mod |
|---------|------------|---------|
| Shuffle nerede? | Server (Math.random) | Frontend (crypto.getRandomValues) |
| Kartlar şifreli mi? | HAYIR (plaintext) | EVET (euint16) |
| Server kartları biliyor mu? | EVET | HAYIR |
| Blockchain kullanılıyor mu? | HAYIR | EVET |
| TX gerekli mi? | HAYIR | EVET (oyun başı) |
| Decrypt gerekli mi? | HAYIR | EVET (userDecrypt) |

---

## GÜVENLİK ANALİZİ

```
NORMAL MOD GÜVENLİK SORUNLARI:

1. SERVER HER ŞEYİ BİLİYOR:
   - Senin elin
   - Deste sırası (sonraki çekilecek kartlar)
   - Rakibin eli

2. MANIPÜLASYON RİSKİ:
   - Server shuffle'ı manipüle edebilir
   - Server "şanslı" rakibe iyi kartlar verebilir
   - Server oyun sonucunu etkileyebilir

3. GÜVEN MODELİ:
   - "Server dürüst" varsayımına dayanıyor
   - Prove edilemiyor

FHE MOD ÇÖZÜMÜ:
   - Shuffle frontend'de (server bilmiyor)
   - Kartlar şifreli (server açamıyor)
   - Blockchain'de kanıtlanabilir
```

---

*Son güncelleme: 2025-12-11*
