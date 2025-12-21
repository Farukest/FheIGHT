# FHEIGHT

**Fully Homomorphic Encryption Tactical Board Game on Blockchain**

FHEIGHT is a tactical board game where players command characters, execute actions, and engage in strategic combat using card-based abilities. The game supports both **multiplayer PvP** and **singleplayer vs AI** modes, with Fully Homomorphic Encryption (FHE) securing all randomness - card draws, ability outcomes, AI difficulty scaling, and combat results remain encrypted until legitimately revealed, preventing any prediction or manipulation.

---

### Built with Zama fhEVM

This is a production-ready fhEVM implementation showcasing encrypted tactical gameplay with private card draws, character actions, combat resolution, and verifiable randomness through gateway-based decryption. The system ensures neither players nor the server can predict or manipulate game outcomes.

**Technical Deep Dive:** [FHEVM_INTEGRATION.md](./FHEVM_INTEGRATION.md) - Complete guide on encryption workflows, smart contract patterns, client-side decryption, session wallet security, and privacy architecture.

**Game Features Guide:** [GAME_FEATURES.md](./GAME_FEATURES.md) - Complete guide on play modes, social features, collection system, quests, codex lore, and all customization options.

---

## Table of Contents

1. [Overview](#overview)
2. [Game Features](#game-features)
3. [Directory Structure](#directory-structure)
4. [System Architecture](#system-architecture)
5. [FHE Session Security](#fhe-session-security)
6. [Smart Contract Architecture](#smart-contract-architecture)
7. [FHE Game Flow](#fhe-game-flow)
8. [Server as Observer](#server-as-observer)
9. [Marble System](#marble-system)
10. [Technology Stack](#technology-stack)
11. [Installation](#installation)
12. [Project Status](#project-status)
13. [Contributing](#contributing)
14. [License](#license)
15. [Acknowledgments](#acknowledgments)
16. [Contact & Support](#contact--support)

---

## Overview

FHEIGHT solves the fundamental problem of randomness in blockchain-based card games. Traditional approaches either rely on trusted servers (centralization) or commit-reveal schemes (vulnerable to front-running). FHEIGHT uses Zama's fhEVM to generate and process encrypted random values that remain hidden until both players are ready to reveal.

### Key Features

**Game Modes**
- Multiplayer PvP: Real-time competitive matches with server synchronization
- Singleplayer vs AI: FHE-secured AI difficulty - unpredictable, verifiable behavior

**FHE Encryption Layer**

*Encrypted Data Types*

| Data Type | FHE Type | Purpose |
|-----------|----------|---------|
| Card Draw Index | `euint8` | Encrypted random (0-255) determining which card is drawn |
| Rarity Roll | `euint8` | Encrypted rarity calculation for marble/booster packs |
| Prismatic Check | `euint8` | Encrypted check for prismatic card variants |
| AI Decision Seed | `euint8` | Encrypted seed for AI move selection and difficulty |
| Session Wallet Key | `euint256` | Encrypted private key stored in WalletVault |

*FHE Operations Used*

| Operation | Function | Purpose |
|-----------|----------|---------|
| Random Generation | `FHE.randEuint8()` | Generate encrypted random value on-chain |
| External Input | `FHE.fromExternal()` | Accept client-encrypted values with proof |
| Access Control | `FHE.allowThis()` | Grant contract permission to use encrypted value |
| User Permission | `FHE.allow()` | Grant specific address permission to decrypt |
| Public Decrypt | `FHE.makePubliclyDecryptable()` | Enable gateway decryption for authorized users |
| Handle Convert | `FHE.toBytes32()` | Convert encrypted value to handle for gateway |
| Proof Verify | `FHE.checkSignatures()` | Verify decryption proof from gateway |

**Encryption Flow: Draw → Decrypt → Reveal → Verify**

```
1. DRAW        Contract generates euint8 via FHE.randEuint8()
               Value encrypted, stored on-chain as handle
                              |
                              |
                              v
2. DECRYPT     Client requests decryption from Zama Gateway
               Gateway returns plaintext only to authorized wallet
                              |
                              |
                              v
3. REVEAL      Client submits decrypted value + proof to contract
               Contract verifies proof matches original handle
                              |
                              |
                              v
4. VERIFY      Server reads verified value from contract
               Calculates game outcome, updates state
```

**Privacy Architecture**
- Encrypted Card Draws: Card selection encrypted until player reveals - opponents cannot predict
- Encrypted Combat Results: Damage rolls and ability outcomes computed on encrypted values
- Encrypted AI Behavior: AI decisions derived from on-chain encrypted randomness
- Client-Side Decryption: Zama Gateway decrypts values only for authorized session wallet
- On-Chain Verification: Contract verifies decryption proof before accepting revealed value

**Card Abilities with FHE**

All card abilities that involve randomness use on-chain FHE:

| Ability Type | FHE Integration | Examples |
|--------------|-----------------|----------|
| Replace Card | Draws new card using next FHE random | Manual replace, Aethermaster |
| Draw from Deck | Uses FHE random for deck position | Spelljammer, Blaze Hound |
| Draw Random Type | FHE random + card type filter | Draw random Arcanyst spell |
| Put Card in Hand | FHE random selects from pool | Dying Wish abilities |
| Transform Hand | FHE randoms for each new card | Mnemovore-style effects |

**Security Model**
- Session Wallets: Burnable encrypted keys for gasless, secure gameplay
- On-Chain Card Registry: Card metadata and attributes stored immutably on blockchain
- Server as Observer: Server syncs players and verifies chain state - never generates randomness
- Provably Fair: All randomness generated by Zama fhEVM coprocessor, verifiable on-chain

---

## Game Features

FHEIGHT offers a complete tactical card game experience. For detailed documentation, see [GAME_FEATURES.md](./GAME_FEATURES.md).

### Play Modes

| Mode | Type | Description |
|------|------|-------------|
| **Season Ladder** | Multiplayer | Ranked competitive with monthly seasons and tier rewards |
| **The Gauntlet** | Multiplayer | Draft mode - build deck from random picks, escalating rewards |
| **Friendly Challenge** | Multiplayer | Challenge friends to casual unranked matches |
| **Practice** | Singleplayer | Play against AI opponents with FHE-secured decisions |
| **Solo Challenges** | Singleplayer | Story-driven puzzles that teach mechanics |
| **Secret Boss Fights** | Singleplayer | Time/quest-based bosses with exclusive rewards |
| **Sandbox** | Singleplayer | Play as both P1 and P2 for deck testing |
| **Developer Sandbox** | Singleplayer | Shuffle-free, mulligan-free mode (admin only) |

### Social Features

| Feature | Description |
|---------|-------------|
| Friends List | Add, remove, search players by username |
| Recent Players | Friend invite from recent match opponents |
| Live Chat | Real-time messaging with friends |
| Do Not Disturb | Block chat and game invites |
| Player Profiles | View rank, hero progress, monthly history |
| Match Replay | Rewatch any game with playback controls |

### Collection & Customization

| Feature | Description |
|---------|-------------|
| FHE Secured Decks | Deck contents encrypted on-chain |
| Hero Skins | 3 visual variants per hero |
| Craft & Disenchant | Convert cards to/from Spirit currency |
| Mystery Crates | FHE-secured random card packs |
| Battle Maps | 6 unique battlefield themes |

### Watch

| Feature | Description |
|---------|-------------|
| Live Streams | Spectate ongoing matches |
| Rank Filtering | Filter streams by player rank |
| Spectator Mode | Watch friends with P1/P2 perspective toggle |

### Quests & Progression

| Feature | Description |
|---------|-------------|
| Daily Quests | Daily objectives for gold rewards |
| Daily Boss Challenges | Rotating boss with unique rules |
| Game Templates | Standard, Draft, Sealed, Brawl modes |

### Codex

| Feature | Description |
|---------|-------------|
| 43 Lore Entries | Complete world history from 0 AE to modern era |
| Voice Narration | Professional voice acting for all entries |
| Unlock System | Progress through gameplay and quests |

### Settings

| Category | Options |
|----------|---------|
| **Visual** | Viewport, Language, HiDPI, Lighting/Shadow/Board Quality, Bloom |
| **Game** | Show Stats, Tips, Battle Log, Player Details, Sticky Targeting, Dev Mode, FHE Secure Mode |
| **Account** | Do Not Disturb, Block Spectators, Change Username, Redeem Codes |
| **Audio** | Master, Music, Voice, Effects Volume |

---

## Directory Structure

```
FHEIGHT/
├── docs/                          # Documentation
│   ├── README.md                  # This file
│   ├── FHEVM_INTEGRATION.md       # FHE technical deep dive
│   └── GAME_FEATURES.md           # Gameplay features guide
│
├── fheight-source/                # Game application
│   ├── app/                       # Frontend source code
│   │   ├── sdk/                   # Game SDK modules
│   │   │   ├── fhe/               # FHE integration (fhe_session.js, fhe_sdk.js)
│   │   │   └── gameSession/       # Session wallet management
│   │   ├── ui/                    # UI components
│   │   ├── view/                  # Game views
│   │   └── localization/          # Multi-language support
│   ├── server/                    # Backend server
│   │   ├── lib/                   # Server logic (CoffeeScript)
│   │   └── api/                   # REST API endpoints
│   ├── config/                    # Configuration files
│   ├── scripts/                   # Build and utility scripts
│   └── worker/                    # Background workers
│
├── fhevm-contracts/               # Smart contracts
│   ├── contracts/                 # Solidity contracts
│   │   ├── GameSession.sol        # FHE card draws and game state
│   │   ├── WalletVault.sol        # Encrypted session wallet storage
│   │   ├── MarbleRandoms.sol      # FHE crate/booster randomness
│   │   ├── GameGold.sol           # ERC-20 in-game currency
│   │   └── CardNFT.sol            # ERC-721 card ownership
│   ├── scripts/                   # Deployment scripts
│   ├── test/                      # Contract tests
│   └── tasks/                     # Hardhat tasks
│
└── document/                      # Zama fhEVM reference docs
```

---

## System Architecture

```
+------------------------------------------------------------------------------------------------+
|                                        CLIENT LAYER                                            |
+------------------------------------------------------------------------------------------------+
|                                                                                                |
|   +------------------+       +------------------------+       +--------------------+           |
|   |   Game Engine    |       |   Session Wallet Mgr   |       |    FHE Session     |           |
|   |   (Cocos2d-JS)   |       |  (Burnable Encry. Key) |       |    (fhevmjs)       |           |
|   +------------------+       +------------------------+       +--------------------+           |
|            |                            ^                              |                       |
|            |                            |                              |                       |
|            |                            |                              |                       |
|            |                 +----------+----------+                   |                       |
|            |                 |                     |                   |                       |
|            |                 |                     |                   |                       |
|            |        +--------+--------+   +--------+--------+          |                       |
|            |        | Wallet Manager  |   | Encrypted Store |          |                       |
|            |        | (MetaMask/WC)   |   | (LocalStorage)  |          |                       |
|            |        +-----------------+   +-----------------+          |                       |
|            |                 |                     |                   |                       |
|            |                 |                     |                   |                       |
|            |                 | AES-256 Encrypt     | TTL Expiry        |                       |
|            |                 | with User PIN       | Auto-Refresh      |                       |
|            |                 |                     |                   |                       |
|            |                 |                     |                   |                       |
|            +-----------------+---------------------+-------------------+                       |
|                                        |                                                       |
|                                        |                                                       |
+------------------------------------------------------------------------------------------------+
                                         |
                                         |
                                         |
                                         | Socket.IO + HTTPS
                                         v
+------------------------------------------------------------------------------------------------+
|                              SERVER LAYER (OBSERVER + SYNC)                                    |
+------------------------------------------------------------------------------------------------+
|                                                                                                |
|   +------------------+       +------------------------+       +--------------------+           |
|   |   Game Server    |       |     API Server         |       |   FHE Verifier     |           |
|   |   (Socket.IO)    |       |     (Express)          |       |   (Read-Only)      |           |
|   +------------------+       +------------------------+       +--------------------+           |
|            |                            |                              |                       |
|            |                            |                              |                       |
|   +--------+----------------------------+------------------------------+-------+               |
|   |                           SERVER RESPONSIBILITIES                          |               |
|   +----------------------------------------------------------------------------+               |
|   |                                                                            |               |
|   |   SYNC (Coordinator)              |   OBSERVE (Verifier)                   |               |
|   |   --------------------------------|----------------------------------------|               |
|   |   - Player matchmaking            |   - Listen blockchain events           |               |
|   |   - Turn order management         |   - Read verified FHE values           |               |
|   |   - Game state broadcast          |   - Cross-check on-chain data          |               |
|   |   - Action validation timing      |   - NO random generation               |               |
|   |   - Disconnect handling           |   - NO card manipulation               |               |
|   |   - Real-time P2P relay           |   - Audit trail logging                |               |
|   |                                                                            |               |
|   +----------------------------------------------------------------------------+               |
|            |                            |                              |                       |
|            |                            |                              |                       |
|            v                            v                              v                       |
|   +------------------+       +----------------------+       +----------------------+           |
|   |      Redis       |       |      PostgreSQL      |       |      Firebase        |           |
|   |   (Matchmaking)  |       |    (Game State)      |       |      (Auth)          |           |
|   +------------------+       +----------------------+       +----------------------+           |
|                                                                                                |
+------------------------------------------------------------------------------------------------+
                                         |
                                         |
                                         | JSON-RPC (Read + Write TX)
                                         v
+------------------------------------------------------------------------------------------------+
|                                    BLOCKCHAIN LAYER                                            |
+------------------------------------------------------------------------------------------------+
|                                                                                                |
|   +-----------------------------------------------------------------------+                    |
|   |                           WalletVault                                  |                   |
|   |                    (Session Wallet Custody & ETH)                      |                   |
|   +----------------------------------+------------------------------------+                    | 
|                                      |                                                         |
|                                      |                                                         |
|              +-----------------------+-----------------------+                                 |
|              |                       |                       |                                 |
|              |                       |                       |                                 |
|              v                       v                       v                                 |
|   +-------------------+   +-------------------+   +-------------------+                        |
|   |   CardRegistry    |   |   GameSession     |   |   MarbleRandoms   |                        |
|   | (Card Metadata)   |   | (FHE Card Draws)  |   | (FHE Pack Open)   |                        |
|   +-------------------+   +-------------------+   +-------------------+                        |
|              |                       |                       |                                 |
|              |                       |                       |                                 |
|              v                       v                       v                                 |
|   +-------------------+   +-------------------+   +-------------------+                        |
|   |     CardNFT       |   |    GameGold       |   | Zama Coprocessor  |                        |
|   |   (ERC-721)       |   |    (ERC-20)       |   |   (FHE Compute)   |                        |
|   +-------------------+   +-------------------+   +-------------------+                        |
|                                                                                                |
+------------------------------------------------------------------------------------------------+
```

---

## FHE Session Security

The FHE session system secures the Zama reencryption keypair - used for Gateway communication and decrypt operations.

### What is the Reencryption Keypair?

This is NOT an Ethereum wallet keypair. It's a special ML-KEM keypair generated by fhevmjs SDK specifically for:
- Requesting decryption from Zama Gateway
- Proving authorization to decrypt specific encrypted values
- Signed once with MetaMask, then reused without popups

### Key Generation and Storage Flow

```
+------------------+                  +----------------------+                  +------------------+
|  Wallet Manager  |                  |   FHE Session Mgr    |                  | Encrypted Store  |
|  (MetaMask/WC)   |                  | (Reencryption Key)   |                  | (LocalStorage)   |
+--------+---------+                  +----------+-----------+                  +--------+---------+
         |                                       |                                       |
         |                                       |                                       |
         | 1. User connects wallet               |                                       |
         +-------------------------------------->|                                       |
         |                                       |                                       |
         |                                       |                                       |
         |                                       | 2. fhevmjs.generateKeypair()          |
         |                                       |    (ML-KEM reencryption keypair)      |
         |                                       |                                       |
         |                                       +-------+                               |
         |                                       |       |                               |
         |                                       |       |                               |
         |                                       |<------+                               |
         |                                       |                                       |
         |                                       | 3. Create EIP712 typed data           |
         |                                       |    Sign with MetaMask (1 popup)       |
         |                                       |                                       |
         |<--------------------------------------+                                       |
         |                                       |                                       |
         |                                       |                                       |
         | 4. User signs EIP712                  |                                       |
         +-------------------------------------->|                                       |
         |                                       |                                       |
         |                                       |                                       |
         | 5. Request PIN from user              |                                       |
         |<--------------------------------------+                                       |
         |                                       |                                       |
         |                                       |                                       |
         | 6. User enters PIN                    |                                       |
         +-------------------------------------->|                                       |
         |                                       |                                       |
         |                                       |                                       |
         |                                       | 7. AES-256-GCM encrypt:               |
         |                                       |    - reencryption keypair             |
         |                                       |    - EIP712 signature                 |
         |                                       |    - contract addresses               |
         |                                       +-------------------------------------->|
         |                                       |                                       |
         |                                       |                                       |
         |                                       |                         8. Store with |
         |                                       |                            TTL expiry |
         |                                       |                                       |
         | 9. FHE session ready                  |                                       |
         |<--------------------------------------+                                       |
         |                                       |                                       |
         |                                       |                                       |
         |                                       |                                       |
```

### Security Properties

| Property | Implementation |
|----------|----------------|
| Key Type | ML-KEM reencryption keypair (fhevmjs SDK) |
| Key Encryption | AES-256-GCM with PIN-derived key (PBKDF2) |
| Storage | Browser LocalStorage (encrypted blob only) |
| TTL Expiry | Session expires after configurable duration |
| Memory Only | Decrypted keypair exists only in runtime memory |
| One-Time Sign | MetaMask popup only on first session creation |

### On Game Start Flow

```
+------------------+                  +----------------------+                  +------------------+
|   Game Engine    |                  |   FHE Session Mgr    |                  | Encrypted Store  |
+--------+---------+                  +----------+-----------+                  +--------+---------+
         |                                       |                                       |
         |                                       |                                       |
         | 1. Game start request                 |                                       |
         +-------------------------------------->|                                       |
         |                                       |                                       |
         |                                       |                                       |
         |                                       | 2. Check if reencryption keypair      |
         |                                       |    in memory                          |
         |                                       |                                       |
         |                                       +-------+                               |
         |                                       |       |                               |
         |                                       |       |                               |
         |                                       |<------+                               |
         |                                       |                                       |
         |                                       | 3. If not in memory:                  |
         |                                       |    Read encrypted blob (ML-KEM)       |
         |                                       +-------------------------------------->|
         |                                       |                                       |
         |                                       |                                       |
         |                                       |                    4. Return blob     |
         |                                       |                       + TTL status    |
         |                                       |<--------------------------------------+
         |                                       |                                       |
         |                                       |                                       |
         |                                       | 5. If expired:                        |
         |                                       |    Request PIN again                  |
         |<--------------------------------------+                                       |
         |                                       |                                       |
         |                                       |                                       |
         | 6. User enters PIN                    |                                       |
         +-------------------------------------->|                                       |
         |                                       |                                       |
         |                                       | 7. Decrypt ML-KEM keypair             |
         |                                       |    and load to memory                 |
         |                                       |                                       |
         |                                       +-------+                               |
         |                                       |       |                               |
         |                                       |       |                               |
         |                                       |<------+                               |
         |                                       |                                       |
         |                                       |                                       |
         | 8. Ready for Gateway decrypt          |                                       |
         |<--------------------------------------+                                       |
         |                                       |                                       |
```

---

## Smart Contract Architecture

### Contract Hierarchy

```
                              +---------------------------+
                              |       WalletVault         |
                              |---------------------------|
                              | - Session wallet custody  |
                              | - ETH deposits/withdraws  |
                              | - Authorize session keys  |
                              +-------------+-------------+
                                            |
                                            |
                                            | owns/authorizes
                                            |
                                            |
          +---------------------------------+---------------------------------+
          |                                 |                                 |
          |                                 |                                 |
          v                                 v                                 v
+-------------------+             +-------------------+             +-------------------+
|   CardRegistry    |             |   GameSession     |             |  MarbleRandoms    |
|-------------------|             |-------------------|             |-------------------|
| - Card metadata   |             | - FHE random gen  |             | - FHE pack open   |
| - Card attributes |             | - Draw/reveal     |             | - 15 randoms/pack |
| - Rarity info     |             | - Game state      |             | - Rarity calc     |
+--------+----------+             +--------+----------+             +--------+----------+
         |                                 |                                 |
         |                                 |                                 |
         | references                      | game rewards                    | mints cards
         v                                 v                                 v
+-------------------+             +-------------------+             +-------------------+
|     CardNFT       |             |    GameGold       |             | Zama Coprocessor  |
|-------------------|             |-------------------|             |-------------------|
| - ERC-721 tokens  |             | - ERC-20 token    |             | - FHE.randEuint8  |
| - Card ownership  |             | - In-game currency|             | - Decrypt/Verify  |
| - Prismatic cards |             | - Rewards         |             | - Gateway/KMS     |
+-------------------+             +-------------------+             +-------------------+
```

### Contract Details (Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| WalletVault | `0x053E51a173b863E6495Dd1AeDCB0F9766e03f4A0` | Session wallet custody, ETH management, key authorization |
| CardRegistry | `0xf9EB68605c1df066fC944c28770fFF8476ADE8fc` | On-chain card metadata, attributes, rarity definitions |
| GameSession | `0x0Cc86698f008a6b86d1469Dcc8929E4FF7c28dBD` | FHE-encrypted card draws, game state management |
| CardNFT | `0xD200776dE5A8472382F5b8b902a676E2117d7A31` | ERC-721 collectible cards, ownership tracking |
| GameGold | `0xdB1274A736812A28b782879128f237f35fed7B81` | ERC-20 in-game currency, rewards distribution |
| MarbleRandoms | `0x905cA0c59588d3F64cdad12534B5C450485206cc` | FHE-encrypted marble (booster pack) opening |

### Contract Details (Hardhat Local)

| Contract | Address |
|----------|---------|
| GameGold | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| CardNFT | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| CardRegistry | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |
| GameSession | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |
| WalletVault | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` |
| MarbleRandoms | `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707` |

### CardRegistry Integration

The CardRegistry contract stores all card metadata on-chain, ensuring card attributes cannot be tampered with:

```
+-------------------+
|   CardRegistry    |
+-------------------+
|                   |
| Card Attributes:  |
| - cardId          |
| - name            |
| - faction         |
| - rarity          |
| - attack          |
| - health          |
| - manaCost        |
| - abilities[]     |
|                   |
+-------------------+
        |
        | getCard(cardId)
        v
+-------------------+
|   GameSession     |
+-------------------+
|                   |
| On card draw:     |
| 1. FHE random     |
| 2. Map to cardId  |
| 3. Fetch metadata |
| 4. Verify attrs   |
|                   |
+-------------------+
```

---

## FHE Game Flow

### In-Game Card Draw (Core Gameplay)

The server acts as an **observer only** - it never generates randomness, only verifies on-chain results.

```
+---------+      +----------+      +-------------+      +-----------+      +----------+
| Player  |      |  Client  |      | GameSession |      | Zama FHE  |      |  Server  |
+---------+      +----------+      +-------------+      +-----------+      +----------+
     |                |                   |                   |                 |
     |                |                   |                   |                 |
     | Draw Card      |                   |                   |                 |
     +--------------->|                   |                   |                 |
     |                |                   |                   |                 |
     |                |                   |                   |                 |
     |                | 1. drawCard(gameId, playerId)         |                 |
     |                +------------------>|                   |                 |
     |                |                   |                   |                 |
     |                |                   |                   |                 |
     |                |                   | 2. FHE.randEuint8()                 |
     |                |                   +------------------>|                 |
     |                |                   |                   |                 |
     |                |                   |                   |                 |
     |                |                   |    euint8 handle  |                 |
     |                |                   |<------------------+                 |
     |                |                   |                   |                 |
     |                |                   |                   |                 |
     |                | 3. getCardHandle()|                   |                 |
     |                +------------------>|                   |                 |
     |                |                   |                   |                 |
     |                |                   |                   |                 |
     |                |     handle        |                   |                 |
     |                |<------------------+                   |                 |
     |                |                   |                   |                 |
     |                |                   |                   |                 |
     |                | 4. Gateway.decrypt(handle)            |                 |
     |                +-------------------------------------->|                 |
     |                |                   |                   |                 |
     |                |                   |                   |                 |
     |                |              decrypted value + proof  |                 |
     |                |<--------------------------------------+                 |
     |                |                   |                   |                 |
     |                |                   |                   |                 |
     |                | 5. revealCard(value, proof)           |                 |
     |                +------------------>|                   |                 |
     |                |                   |                   |                 |
     |                |                   |                   |                 |
     |                |                   | 6. Verify proof   |                 |
     |                |                   | 7. Store result   |                 |
     |                |                   | 8. Emit event     |                 |
     |                |                   +------------------------------------>|
     |                |                   |                   |                 |
     |                |                   |                   |     9. OBSERVE  |
     |                |                   |                   |     Read event  |
     |                |                   |                   |     Verify chain|
     |                |                   |                   |     Update DB   |
     |                |                   |                   |                 |
     | Card Revealed  |                   |                   |                 |
     |<---------------+                   |                   |                 |
     |                |                   |                   |                 |
     |                |                   |                   |                 |
     |                |                   |                   |                 |
```

### Server Observer Role

The server's role is strictly limited to observation and verification:

| Server Action | Description |
|---------------|-------------|
| Listen Events | Subscribe to contract events (CardRevealed, GameEnded) |
| Read State | Call view functions to get verified random values |
| Verify | Cross-check on-chain data with game state |
| Update DB | Store verified results in PostgreSQL |
| Never Generate | Server NEVER generates random values |

```
+-------------------+                              +-------------------+
|   GameSession     |                              |   Server          |
|   (Blockchain)    |                              |   (Observer)      |
+-------------------+                              +-------------------+
         |                                                  |
         |                                                  |
         | emit CardRevealed(gameId, playerId, cardId)      |
         +------------------------------------------------->|
         |                                                  |
         |                                                  |
         |                                    1. Receive event
         |                                    2. getVerifiedCard(gameId)
         |<-------------------------------------------------+
         |                                                  |
         |                                                  |
         | return { cardId, proof, timestamp }              |
         +------------------------------------------------->|
         |                                                  |
         |                                                  |
         |                                    3. Verify data matches
         |                                    4. Update game state DB
         |                                    5. Broadcast to players
         |                                                  |
         |                                                  |
         |                                                  |
```

---

## Server as Observer + Sync

The server has two distinct roles: **Synchronization** (coordinating players) and **Observation** (verifying blockchain state).

### Dual Role Architecture

```
+--------------------------------------------------------------------------------------+
|                                   SERVER ROLES                                       |
+--------------------------------------------------------------------------------------+
|                                                                                      |
|   +----------------------------------+     +----------------------------------+      |
|   |        SYNC (Coordinator)        |     |       OBSERVE (Verifier)         |      |
|   +----------------------------------+     +----------------------------------+      |
|   |                                  |     |                                  |      |
|   |                                  |     |                                  |      |
|   |  Player A  <---->  Server  <---->  Player B     Blockchain                |      |
|   |     |                            |     |             |                    |      |
|   |     |   Turn Order               |     |             |                    |      |
|   |     |   Game State               |     |    Events   |                    |      |
|   |     |   Actions                  |     |<------------+                    |      |
|   |     |                            |     |             |                    |      |
|   |     |                            |     |             |                    |      |
|   +----------------------------------+     +----------------------------------+      |
|                                                                                      |
+--------------------------------------------------------------------------------------+
```

### Player Synchronization Flow

```
+------------+                    +------------+                    +------------+
|  Player A  |                    |   Server   |                    |  Player B  |
+-----+------+                    +-----+------+                    +-----+------+
      |                                 |                                 |
      |                                 |                                 |
      | 1. Play card action             |                                 |
      +-------------------------------->|                                 |
      |                                 |                                 |
      |                                 | 2. Validate action              |
      |                                 |    (timing, rules)              |
      |                                 |                                 |
      |                                 |                                 |
      |                                 +-------+                         |
      |                                 |       |                         |
      |                                 |       |                         |
      |                                 |<------+                         |
      |                                 |                                 |
      |                                 |                                 |
      |                                 | 3. Broadcast to opponent        |
      |                                 +-------------------------------->|
      |                                 |                                 |
      |                                 | 4. Update game state            |
      |                                 |                                 |
      |                                 |                                 |
      |                                 +-------+                         |
      |                                 |       |                         |
      |                                 |       |                         |
      |                                 |<------+                         |
      |                                 |                                 |
      |                                 |                                 |
      | 5. Confirm action               |                                 |
      |<--------------------------------+                                 |
      |                                 |                                 |
      |                                 |                                 |
      |                                 |                 6. Render card  |
      |                                 |                                 |
      |                                 |                                 |
      |                                 |                                 |
```

### Trust Model

```
+------------------+     +------------------+     +------------------+
|     CLIENT       |     |     SERVER       |     |   BLOCKCHAIN     |
|------------------|     |------------------|     |------------------|
|                  |     |                  |     |                  |
| - Generate TX    |     | - SYNC players   |     | - Source of      |
| - Sign with      |     | - Coordinate     |     |   truth          |
|   session key    |     |   turns          |     | - FHE randoms    |
| - Decrypt FHE    |     | - OBSERVE chain  |     | - Immutable      |
| - Send actions   |     | - Verify state   |     |   state          |
|                  |     | - NO randomness  |     |                  |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         |                        |                        |
         |   Game Actions         |                        |
         +----------------------->|                        |
         |                        |                        |
         |                        |                        |
         |   TX (FHE ops)         |                        |
         +----------------------------------------------->|
         |                        |                        |
         |                        |                        |
         |                        |    Events/State        |
         |                        |<-----------------------+
         |                        |                        |
         |                        |                        |
         |   Sync State           |                        |
         |<-----------------------+                        |
         |                        |                        |
         |                        |                        |
         |                        |                        |
```

### Why Server Cannot Cheat

| Attack Vector | Prevention |
|---------------|------------|
| Fake random values | Randoms generated on-chain by Zama FHE |
| Modify card draws | Draws verified by smart contract proofs |
| Replay old games | Each game has unique on-chain session ID |
| Favor specific players | All operations require cryptographic proofs |
| Desync game state | Both clients verify against blockchain |
| Fake opponent actions | Actions signed by session wallet |

---

## Marble System

Marbles (booster packs) use FHE for provably fair card pack opening.

### Marble Opening Flow

```
+---------+      +----------+      +---------------+      +-----------+      +----------+
| Player  |      |  Client  |      | MarbleRandoms |      | Zama FHE  |      |  Server  |
+---------+      +----------+      +---------------+      +-----------+      +----------+
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     | Open Pack      |                    |                    |                 |
     +--------------->|                    |                    |                 |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                | 1. drawRandoms(marbleId)                |                 |
     |                +------------------->|                    |                 |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                |                    | 2. Generate 15 euint8                |
     |                |                    | (5 rarity, 5 index, 5 prismatic)     |
     |                |                    +------------------->|                 |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                |                    |   15 handles       |                 |
     |                |                    |<-------------------+                 |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                | 3. getRandomHandles()                   |                 |
     |                +------------------->|                    |                 |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                |    handles[15]     |                    |                 |
     |                |<-------------------+                    |                 |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                | 4. Decrypt all handles via Gateway      |                 |
     |                +--------------------------------------->|                  |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                |              values[15] + proofs        |                 |
     |                |<---------------------------------------+                  |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                | 5. revealRandoms(values, proofs)        |                 |
     |                +------------------->|                    |                 |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                |                    | 6. Verify all      |                 |
     |                |                    | 7. Store verified  |                 |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                | 8. Notify server   |                    |                 |
     |                +---------------------------------------------------------->|
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                |                    |                    |        9. Read  |
     |                |                    |                    |        contract |
     |                |                    |<-------------------------------------+
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                |                    | getVerifiedRandoms()                 |
     |                |                    +------------------------------------->|
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                |                    |                    |    10. Calculate|
     |                |                    |                    |        cards    |
     |                |                    |                    |        Update DB|
     |                |                    |                    |                 |
     | Cards Revealed |                    |                    |                 |
     |<---------------+                    |                    |                 |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
     |                |                    |                    |                 |
```

### Random Value Layout

| Index | Purpose | Description |
|-------|---------|-------------|
| 0-4 | Rarity | Determines Common/Rare/Epic/Legendary |
| 5-9 | Card Index | Selects specific card from pool |
| 10-14 | Prismatic | Determines prismatic variant |

### Rarity Thresholds (0-255)

| Range | Rarity | Probability |
|-------|--------|-------------|
| 0-186 | Common | 73% |
| 187-225 | Rare | 15% |
| 226-250 | Epic | 10% |
| 251-255 | Legendary | 2% |

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Cocos2d-JS | 3.x | Game engine and rendering |
| Backbone.js | 1.x | MVC structure |
| fhevmjs | 0.9.x | FHE client operations |
| ethers.js | 5.x | Blockchain interaction |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x | Runtime environment |
| CoffeeScript | 2.x | Server logic |
| Express | 4.x | HTTP API server |
| Socket.IO | 2.x | Real-time game communication |
| PostgreSQL | 14.x | Persistent data storage |
| Redis | 7.x | Session and matchmaking cache |

### Blockchain

| Technology | Version | Purpose |
|------------|---------|---------|
| Solidity | 0.8.24 | Smart contract language |
| Hardhat | 2.x | Development framework |
| Zama fhEVM | 0.9.x | FHE operations |
| OpenZeppelin | 5.x | Standard implementations |

---

## Installation

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x
- Redis 7.x
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/Farukest/FHEIGHT.git
cd fheight

# Install dependencies
cd fheight-source && npm install
cd ../fhevm-contracts && npm install

# Start development servers (Windows)
powershell -ExecutionPolicy Bypass -File start-servers.ps1
```

---

## Project Status

### Completed Features

| Category | Feature |
|----------|---------|
| **FHE Integration** | Encrypted card draws with Gateway decryption |
| **FHE Integration** | Session wallet system with PIN encryption |
| **FHE Integration** | On-chain proof verification for revealed values |
| **Smart Contracts** | GameSession - FHE random generation and verification |
| **Smart Contracts** | WalletVault - Encrypted session key storage |
| **Smart Contracts** | MarbleRandoms - FHE-secured crate/booster opening |
| **Smart Contracts** | GameGold (ERC-20) and CardNFT (ERC-721) |
| **Gameplay** | Multiplayer PvP with real-time synchronization |
| **Gameplay** | Singleplayer vs AI with FHE-secured decisions |
| **Gameplay** | All card abilities with FHE random integration |
| **UI/UX** | FHE status indicators and decrypt flow |
| **UI/UX** | Multi-language localization system |

### Planned Features

| Category | Feature |
|----------|---------|
| **Characters** | New playable characters with unique designs |
| **Characters** | Character skill algorithms and ability trees |
| **Characters** | Fair power balancing algorithms for skills |
| **Characters** | Buff/debuff system with FHE-secured values |
| **Cards** | New skill cards and spell effects |
| **Cards** | Ultimate power cards with special animations |
| **Cards** | Card synergy system between factions |
| **Gameplay** | Tournament system with on-chain brackets |
| **Gameplay** | Spectator mode with encrypted card hiding |
| **Social** | Guild system with shared rewards |
| **Social** | Trading system with FHE-secured offers |
| **Blockchain** | Cross-chain bridge for card NFTs |
| **Blockchain** | Mainnet deployment with production Gateway |
| **Mobile** | iOS and Android native clients |
| **Mobile** | Mobile-optimized FHE session flow |

---

## Contributing

We welcome contributions to FHEIGHT. Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Follow the existing code style (CoffeeScript for server, JavaScript for client)
4. Test your changes locally with `start-servers.ps1`
5. Submit a pull request with a clear description

### Areas for Contribution

| Area | Description |
|------|-------------|
| **Smart Contracts** | New FHE-powered game mechanics |
| **Game Balance** | Card ability tuning and testing |
| **Localization** | Translations for new languages |
| **Documentation** | Guides, tutorials, API docs |
| **Testing** | Unit tests, integration tests |

### Code Standards

- Solidity: Follow Zama fhEVM patterns from `document/` folder
- Server: CoffeeScript with existing lib patterns
- Client: JavaScript ES6+ with Backbone.js structure
- All FHE operations must use `FHE.*` methods (not TFHE)

---

## License

Proprietary - All Rights Reserved

---

## Acknowledgments

FHEIGHT is built with the following technologies:

| Technology | Provider | Usage |
|------------|----------|-------|
| **fhEVM** | [Zama](https://www.zama.ai/) | Fully Homomorphic Encryption for smart contracts |
| **Cocos2d-JS** | [Cocos](https://www.cocos.com/) | Game engine and rendering |
| **Hardhat** | [Nomic Foundation](https://hardhat.org/) | Smart contract development framework |
| **OpenZeppelin** | [OpenZeppelin](https://www.openzeppelin.com/) | ERC-20/ERC-721 standard implementations |
| **ethers.js** | [ethers.io](https://ethers.io/) | Ethereum JavaScript library |
| **Socket.IO** | [Socket.IO](https://socket.io/) | Real-time game communication |
| **Redis** | [Redis](https://redis.io/) | Session and matchmaking cache |
| **PostgreSQL** | [PostgreSQL](https://www.postgresql.org/) | Persistent data storage |

Special thanks to the Zama team for fhEVM and the fhevmjs SDK that makes encrypted on-chain randomness possible.

---

## Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Farukest/FHEIGHT/issues)
- **Twitter**: [@0xflydev](https://twitter.com/0xflydev)
- **GitHub**: [@Farukest](https://github.com/Farukest)

---

Built with Zama fhEVM, Cocos2d-JS, and Solidity

---

## Documentation

- [FHE Integration Guide](./FHEVM_INTEGRATION.md)
- [Game Features Guide](./GAME_FEATURES.md)
- [API Reference](./API.md)
- [Smart Contract Documentation](./CONTRACTS.md)
