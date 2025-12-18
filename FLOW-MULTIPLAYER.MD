 ---
🔍 FHE Single Player → Multiplayer Analizi

Mevcut Single Player Mimarisi

┌─────────────────────────────────────────────────────────────┐
│                    SINGLE PLAYER FHE FLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CLIENT (Browser)              SERVER (Node.js)              │
│  ┌─────────────┐              ┌─────────────┐               │
│  │ FHEGameSession │◄──socket──►│ single_player.coffee │     │
│  │ - wallet     │              │ - games{}            │      │
│  │ - deck[]     │              │ - session            │      │
│  │ - myHand[]   │              │ - FHE handlers       │      │
│  └──────┬──────┘              └─────────────┘               │
│         │                                                    │
│         │ TX                                                 │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │ GameSession.sol │ ← 40 FHE.rand() encrypted indices      │
│  │ - 1 player   │                                           │
│  │ - 1 deck     │                                           │
│  └─────────────┘                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Mevcut Flow:
1. Client: createSinglePlayerGame(gameId) → 40 encrypted random index
2. Client: getDrawHandles(5) → encrypted handles
3. Client: ZAMA KMS publicDecrypt() → clear indices
4. Client: revealDrawBatch() → verify proof on-chain
5. Client → Server: fhe_initial_hand_revealed (kartları bildir)
6. Server: SDK'da kartları el'e ekle

  ---
Multiplayer İçin Gerekli Değişiklikler

1. Contract Değişikliği (ZORUNLU)

// MEVCUT - sadece 1 oyuncu
struct Game {
address player;        // TEK oyuncu
uint8 currentTurn;
...
}

// YENİ - 2 oyuncu
struct MultiplayerGame {
address player1;
address player2;
uint8 currentTurn;
uint8 activePlayer;    // 1 veya 2
...
}

// MEVCUT - 40 index (1 deck)
mapping(uint256 => mapping(uint8 => euint8)) private drawIndices;

// YENİ - 80 index (2 deck)
mapping(uint256 => mapping(uint8 => mapping(uint8 => euint8))) private drawIndices;
// drawIndices[gameId][playerId][cardIndex]

Yeni Fonksiyonlar:
- createMultiplayerGame(gameId, player1, player2) → 80 FHE.rand (2x40)
- getDrawHandlesForPlayer(gameId, playerId, count) → Sadece kendi deck'inden
- revealDrawBatchForPlayer(gameId, playerId, ...) → Player-specific reveal

2. Server Değişikliği (game.coffee)

# MEVCUT (single_player.coffee - satır 139-147)
socket.on "fhe_game_created", onFHEGameCreated
socket.on "fhe_initial_hand_revealed", onFHEInitialHandRevealed
socket.on "fhe_card_drawn", onFHECardDrawn

# YENİ (game.coffee'ye eklenmeli)
# Aynı handler'lar AMA:
# - 2 oyuncu için ayrı deck state
# - Her oyuncunun reveal'ını AYRI takip
# - İkisi de reveal edince oyun başlar

Multiplayer FHE State:
games[gameId].fhe = {
enabled: true                                                                                                                                                                                                                                                                                                   
player1: {
deck: []
revealedIndices: []
handReady: false                                                                                                                                                                                                                                                                                              
}
player2: {
deck: []
revealedIndices: []
handReady: false                                                                                                                                                                                                                                                                                              
}
}

3. Client Değişikliği (fheGameSession.js)

// MEVCUT - tek deck                                                                                                                                                                                                                                                                                              
this.deck = [];
this.myHand = [];

// YENİ - opponent deck görünmez ama state'i var                                                                                                                                                                                                                                                                  
this.myDeck = [];
this.myHand = [];
this.opponentHandSize = 0;  // Sadece sayı (kartlar şifreli)

  ---
Zorluk Değerlendirmesi

| Bileşen                    | Zorluk   | Neden                                         |
  |----------------------------|----------|-----------------------------------------------|
| Contract                   | 🟡 ORTA  | 80 FHE.rand = 2x gas, yeni struct/mapping     |
| Server (game.coffee)       | 🟢 KOLAY | Handler'ları kopyala, 2 oyuncu için adapte et |
| Client (fheGameSession.js) | 🟢 KOLAY | Tek değişiklik: playerId parametre ekle       |
| Senkronizasyon             | 🔴 ZOR   | İki oyuncu reveal zamanlama sorunu            |

  ---
Kritik Sorular

1. İki oyuncu aynı anda mı reveal edecek?
- Paralel: Her ikisi de kendi initial hand'ini bağımsız reveal → daha hızlı
- Sıralı: Önce player1, sonra player2 → daha basit

2. Turn geçişi nasıl olacak?
   Turn 1: Player1 oynar → end turn
   Player1 deck'ten 1 kart çeker (FHE reveal)
   Player2'ye geçer
   Turn 2: Player2 oynar → end turn
   Player2 deck'ten 1 kart çeker (FHE reveal)
   Player1'e geçer
   ...

3. Opponent kartlarını görmeme:
- Her oyuncu SADECE kendi drawIndices'ini decrypt edebilir
- ACL: FHE.allow(drawIndices[gameId][1][i], player1) → sadece player1 görebilir
- Bu FHE'nin doğal özelliği - built-in güvenlik

  ---
Önerilen Yol

1. Contract güncelle:
    - createMultiplayerGame()
    - Player-specific reveal functions
    - 80 FHE.rand (daha fazla gas!)

2. game.coffee'ye FHE handler'ları ekle:
    - single_player.coffee'den kopyala
    - 2 oyuncu state'i için adapte et
    - "Her iki oyuncu da ready" kontrolü

3. Client'ta minimal değişiklik:
    - playerId parametresi ekle
    - Opponent hand size tracking

4. Test:
    - İki browser ile test (farklı wallet)
    - Timing/sync sorunları için edge case'ler

  ---
Sonuç

Ne kadar zor?

- Kod miktarı: ~500-800 satır yeni/değişiklik
- Karmaşıklık: Orta (en zor kısım 2-player sync)
- Risk: Gas limitleri (80 FHE.rand = ~16M gas, Sepolia'da sorun olabilir)

Evet, bağımsız single player gibi olacaksınız - herkes kendi deck'ini reveal eder, server coordinator. Multiplayer'da "hile" mümkün değil çünkü kimse opponent'ın şifreli kartlarını decrypt edemez.