# FHEIGHT fhEVM Integration

Complete technical documentation for Fully Homomorphic Encryption integration in FHEIGHT. This guide follows the game flow from start to finish - someone reading this should understand exactly how the system works step by step.

---

## Table of Contents

1. [File References](#1-file-references)
2. [Wallet Manager](#2-wallet-manager)
3. [FHE Session Security](#3-fhe-session-security)
4. [FHE Client Setup](#4-fhe-client-setup)
5. [CardRegistry Integration](#5-cardregistry-integration)
6. [Game Session Flow](#6-game-session-flow)
7. [Initial Hand Reveal](#7-initial-hand-reveal)
8. [Turn System and Card Draw](#8-turn-system-and-card-draw)
9. [Replace Card and Skill-Based Card Draw](#9-replace-card-and-skill-based-card-draw)
10. [UI State Management](#10-ui-state-management)
11. [Multiplayer Synchronization](#11-multiplayer-synchronization)
12. [Boss Battle Integration](#12-boss-battle-integration)
13. [Marble System (Booster Packs)](#13-marble-system-booster-packs)
14. [Error Handling and Retry](#14-error-handling-and-retry)
15. [Security Model](#15-security-model)

---

## System Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                              FHEIGHT FHE ARCHITECTURE                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-------------+     +-------------+     +-------------+     +-------------+      |
|  |   CLIENT    |     |   SERVER    |     | BLOCKCHAIN  |     |   ZAMA      |      |
|  | (Browser)   |     | (Node.js)   |     |  (Sepolia)  |     |  (Gateway)  |      |
|  +------+------+     +------+------+     +------+------+     +------+------+      |
|         |                   |                   |                   |             |
|         |                   |                   |                   |             |
|  +------v------+     +------v------+     +------v------+     +------v------+      |
|  |fheGameSession|    |game.coffee |     |GameSession  |     | KMS         |      |
|  |   .js       |     |single_player|    |   .sol      |     | Threshold   |      |
|  |             |     |  .coffee   |     |             |     | Decrypt     |      |
|  +------+------+     +------+------+     +------+------+     +------+------+      |
|         |                   |                   |                   |             |
|         |                   |                   |                   |             |
|         |   1. Create Game  |                   |                   |             |
|         +--------------------------------------------->              |             |
|         |                   |                   |                   |             |
|         |                   |     2. 40x FHE.randEuint8()           |             |
|         |                   |                   +------------------>|             |
|         |                   |                   |                   |             |
|         |   3. getDrawHandles                   |                   |             |
|         +--------------------------------------------->              |             |
|         |                   |                   |                   |             |
|         |   4. publicDecrypt                    |                   |             |
|         +--------------------------------------------------------------------->   |
|         |                   |                   |                   |             |
|         |                   |                   |   5. Decrypt      |             |
|         |                   |                   |<------------------+             |
|         |                   |                   |                   |             |
|         |   6. revealDrawBatch (with proof)     |                   |             |
|         +--------------------------------------------->              |             |
|         |                   |                   |                   |             |
|         |                   |     7. FHE.checkSignatures()          |             |
|         |                   |                   +                   |             |
|         |                   |                   |                   |             |
|         |   8. Notify server|                   |                   |             |
|         +------------------>|                   |                   |             |
|         |                   |                   |                   |             |
|         |                   |   9. getVerifiedDrawOrder()           |             |
|         |                   +------------------>|                   |             |
|         |                   |                   |                   |             |
|         |                   |<------------------+                   |             |
|         |                   |  10. Verified indices                 |             |
|         |                   |                   |                   |             |
|         |  11. Apply cards  |                   |                   |             |
|         |<------------------+                   |                   |             |
|         |                   |                   |                   |             |
|  +------v------+     +------v------+     +------v------+     +------v------+      |
|  | Game plays  |     | Coordinates |     | Stores all  |     | Decrypts    |      |
|  | with cards  |     | game state  |     | randoms     |     | on request  |      |
|  +-------------+     +-------------+     +-------------+     +-------------+      |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### Data Flow Summary

```
Game Creation:
  Client --> Contract.createSinglePlayerGame() --> 40x FHE.randEuint8()

Initial Hand (5 cards):
  Client --> Contract.getDrawHandles(5) --> Zama.publicDecrypt()
         --> Contract.revealDrawBatch() --> FHE.checkSignatures()
         --> Server --> Contract.getVerifiedDrawOrder() --> Apply cards

Each Turn Draw (1 card):
  Client --> Contract.incrementTurn()
         --> Contract.getDrawHandles(1) --> Zama.publicDecrypt()
         --> Contract.revealDrawBatch() --> Server --> Apply card

Marble Opening (5 cards):
  Client --> Contract.drawRandoms() --> 15x FHE.randEuint8()
         --> Zama.publicDecrypt() --> Contract.revealRandoms()
         --> Server --> Contract.getVerifiedRandoms() --> Calculate cards
```

---

## 1. File References

### Client Files

| File | Path | Purpose |
|------|------|---------|
| deck_select.js | app/ui/views/composite/ | Play button, FHE game initialization |
| games_manager.js | app/ui/managers/ | Matchmaking with FHE data |
| fheGameSession.js | app/sdk/fhe/ | FHE client module, blockchain operations |
| fhe.js | app/common/ | FHE utilities |
| wallet.js | app/common/ | MetaMask connection |
| game.js | app/ui/views2/layouts/ | Game UI, card display |
| game_bottom_bar.js | app/ui/views/composite/ | Submit/Decrypt buttons |
| game_choose_hand.js | app/ui/views/item/ | Initial hand UI |
| application.js | app/ | Game start functions |

### Server Files

| File | Path | Purpose |
|------|------|---------|
| single_player.coffee | server/ | Single player game handler |
| game.coffee | server/ | Multiplayer game handler |
| blockchain.coffee | server/lib/ | Contract view calls |
| fhe_marble_verifier.coffee | server/lib/ | Marble card calculation |
| creategame.coffee | worker/ | Game creation worker |
| gameSetup.js | app/sdk/ | Deck setup, FHE deck order |
| matchmaker.coffee | server/routes/ | Matchmaking with FHE tokens |
| r-tokenmanager.coffee | server/redis/ | Token storage with FHE fields |
| inventory.coffee | server/lib/data_access/ | Marble inventory operations |

### Contract Files

| File | Path | Purpose |
|------|------|---------|
| GameSession.sol | fhevm-contracts/contracts/ | In-game FHE random generation |
| MarbleRandoms.sol | fhevm-contracts/contracts/ | Booster pack FHE random |
| CardRegistry.sol | fhevm-contracts/contracts/ | On-chain card metadata |
| WalletVault.sol | fhevm-contracts/contracts/ | Encrypted session key storage |

---

## 2. Wallet Manager

The Wallet Manager is the entry point for all blockchain interactions.

### Connection Flow

```
User                    Wallet Manager              MetaMask
  |                           |                          |
  |                           |                          |
  | 1. Click "Connect"        |                          |
  +-------------------------->|                          |
  |                           |                          |
  |                           |                          |
  |                           | 2. eth_requestAccounts   |
  |                           +------------------------->|
  |                           |                          |
  |                           |                          |
  |                           |         3. User approves |
  |                           |<-------------------------+
  |                           |                          |
  |                           |                          |
  | 4. Connected              |                          |
  |<--------------------------+                          |
  |                           |                          |
  |                           |                          |
  | 5. Initialize Session Wallet                         |
  +-------------------------->|                          |
  |                           |                          |
  |                           |                          |
```

### Wallet State Table

| State | Description | Next Action |
|-------|-------------|-------------|
| `disconnected` | No wallet connected | Show connect button |
| `connecting` | Awaiting user approval | Show spinner |
| `connected` | Main wallet ready | Initialize Session Wallet |
| `error` | Connection failed | Show retry option |

---

## 3. FHE Session Security

The FHE session stores the Zama reencryption keypair - a ML-KEM keypair generated by fhevmjs SDK for Gateway communication.

### What Gets Stored

| Component | Storage Location | Encryption |
|-----------|------------------|------------|
| Zama reencryption keypair (ML-KEM) | LocalStorage | AES-256-GCM with PIN |
| EIP712 signature | LocalStorage | AES-256-GCM with PIN |
| Contract addresses | LocalStorage | AES-256-GCM with PIN |
| Session expiry | LocalStorage | Unencrypted (for quick TTL check) |

### Lifecycle

```
GENERATION --> SIGNATURE --> ENCRYPTION --> STORAGE --> RECOVERY
     |              |             |             |            |
     |              |             |             |            |
fhevmjs.       MetaMask      PIN input    LocalStorage   Game start
generateKeypair EIP712        AES-256      encrypted      PIN prompt
(ML-KEM)       popup          encrypt      + TTL          decrypt to RAM
```

### PIN Encryption Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Algorithm | AES-256-GCM | Authenticated encryption |
| Key Derivation | PBKDF2-SHA256 | PIN to key conversion |
| Iterations | 100,000 | Brute-force protection |
| Salt Size | 16 bytes | Unique per encryption |
| IV Size | 12 bytes | GCM standard |
| TTL | 24 hours | Auto-expiry |

### Storage Structure

```javascript
// LocalStorage key: 'fheight_fhe_session'
localStorage['fheight_fhe_session'] = {
    encrypted: "base64...",   // AES-encrypted session data
    salt: "base64...",        // PBKDF2 salt
    iv: "base64...",          // AES-GCM IV
    expiry: 1703209856789,    // TTL timestamp (unencrypted)
    version: 2                // PIN-encrypted version
}

// Decrypted session data contains:
{
    publicKey: Uint8Array,    // ML-KEM public key (fhevmjs)
    privateKey: Uint8Array,   // ML-KEM private key (fhevmjs)
    signature: "0x...",       // EIP712 signature from MetaMask
    contractAddresses: [],    // Authorized contract addresses
    startTime: 1703123456789,
    expiry: 1703209856789
}
```

### Session Recovery Conditions

| Condition | If TRUE | If FALSE |
|-----------|---------|----------|
| `localStorage['fheight_fhe_session'] exists` | Read blob | Generate new keypair |
| `now < expiry` | Use existing session | Request new PIN |
| `decryption succeeds` | Load to memory | Show "Wrong PIN" |
| `memory.keypair exists` | Skip PIN prompt | Request PIN |

---

## 4. FHE Client Setup

The FHE client (fhevmjs) handles encrypted operations with Zama Gateway.

### SDK Instance Creation (fheGameSession.js)

```javascript
// fheGameSession.js - _getFhevmInstance()
FHEGameSession.prototype._getFhevmInstance = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self._fhevmInstance) {
      resolve(self._fhevmInstance);
      return;
    }

    var sdk = window.relayerSDK || window.fhevm;
    if (!sdk || typeof sdk.createInstance !== 'function') {
      reject(new Error('FHEVM SDK not available'));
      return;
    }

    var initPromise = (typeof sdk.initSDK === 'function')
      ? sdk.initSDK()
      : Promise.resolve();

    initPromise
      .then(function() {
        var config = {
          aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
          kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
          inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
          verifyingContractAddressDecryption: '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
          verifyingContractAddressInputVerification: '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
          chainId: Wallet.getActiveChainId(),
          gatewayChainId: 10901,
          network: Wallet.getActiveRpcUrl(),
          relayerUrl: 'https://relayer.testnet.zama.org'
        };

        return sdk.createInstance(config);
      })
      .then(function(instance) {
        self._fhevmInstance = instance;
        resolve(instance);
      })
      .catch(reject);
  });
};
```

### Initialization Flow

```
Session Wallet Ready
        |
        |
        v
+------------------+
| Create fhevmjs   |
| Instance         |
+------------------+
        |
        |
        v
+------------------+
| Fetch Network    |
| FHE Public Key   |
+------------------+
        |
        |
        v
+------------------------+
| Generate Reencryption  |
| Keypair (for Gateway)  |
| fhevmjs.generateKeypair|
+------------------------+
        |
        |
        v
+------------------------+
| Sign Keypair with      |
| Session Wallet (EIP712)|
+------------------------+
        |
        |
        v
+------------------+
| FHE Ready        |
+------------------+
```

**Reencryption Keypair:** This is NOT the session wallet keypair. It's a separate keypair generated by fhevmjs specifically for Gateway communication. The Gateway uses this to verify that the requesting address is authorized to decrypt the value.

### FHE Operations Used

| Operation | Function | Purpose |
|-----------|----------|---------|
| Random Generation | `FHE.randEuint8()` | Generate encrypted random 0-255 |
| External Input | `FHE.fromExternal()` | Accept client-encrypted value |
| Self Permission | `FHE.allowThis()` | Contract can use value |
| User Permission | `FHE.allow()` | Address can decrypt value |
| Public Decrypt | `FHE.makePubliclyDecryptable()` | Gateway can decrypt |
| Handle Convert | `FHE.toBytes32()` | Convert for verification |
| Proof Verify | `FHE.checkSignatures()` | Verify decryption proof |

---

## 5. CardRegistry Integration

CardRegistry stores all card metadata on-chain, ensuring card attributes cannot be tampered with.

### Architecture

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
+--------+----------+
         |
         | getCard(cardId)
         | 
         v
+-------------------+         +-------------------+
|   GameSession     |         |  MarbleRandoms    |
|-------------------|         |-------------------|
| On card draw:     |         | On pack open:     |
| 1. FHE random     |         | 1. FHE randoms    |
| 2. Map to cardId  |         | 2. Rarity calc    |
| 3. Fetch metadata |         | 3. Select from    |
| 4. Verify attrs   |         |    CardRegistry   |
+-------------------+         +-------------------+
```

### Card Pool Lookup

```javascript
// Server and Client use same SDK for card lookup
var cardPool = SDK.GameSession.getCardCaches()
    .getCardSet(cardSetId)        // Core, Expansion, etc.
    .getRarity(rarityType)        // Common, Rare, Epic, Legendary
    .getIsCollectible(true)
    .getIsPrismatic(false)
    .getCardIds();

// Map FHE random to card
var selectedIndex = randomValue % cardPool.length;
var cardId = cardPool[selectedIndex];
```

---

## 5.5 GameSession Contract Code

The GameSession contract handles FHE random generation for card draws.

### Contract Structure (GameSession.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract GameSession is ZamaEthereumConfig {

    uint8 public constant DECK_SIZE = 40;
    uint8 public constant INITIAL_HAND_SIZE = 5;

    struct Game {
        address player;
        uint8 currentTurn;
        uint8 revealedCount;
        bool isActive;
        uint256 createdAt;
    }

    // Games mapping
    mapping(uint256 => Game) public games;

    // Draw indices - encrypted random values (FHE encrypted)
    // IMPORTANT: euint8[40] array type doesn't work with FHE!
    // Must use nested mapping: gameId => index => euint8
    mapping(uint256 => mapping(uint8 => euint8)) private drawIndices;

    // Revealed values - verified clear indices
    mapping(uint256 => uint8[]) public revealedValues;
}
```

### Game Creation with FHE Random Generation

```solidity
// GameSession.sol - createSinglePlayerGame()
function createSinglePlayerGame(uint256 gameId) external {
    require(games[gameId].player == address(0), "Game exists");

    games[gameId] = Game({
        player: msg.sender,
        currentTurn: 0,
        revealedCount: 0,
        isActive: true,
        createdAt: block.timestamp
    });

    // Generate 40 encrypted random indices (real FHE)
    for (uint8 i = 0; i < DECK_SIZE; i++) {
        euint8 encryptedIndex = FHE.randEuint8();
        // CRITICAL: Allow contract to read this value
        FHE.allowThis(encryptedIndex);
        // Store to storage
        drawIndices[gameId][i] = encryptedIndex;
        // Make publicly decryptable for client SDK
        FHE.makePubliclyDecryptable(encryptedIndex);
    }

    emit GameCreated(gameId, msg.sender);
}
```

### Reveal Batch with Proof Verification

```solidity
// GameSession.sol - revealDrawBatch()
function revealDrawBatch(
    uint256 gameId,
    uint8[] calldata clearIndices,
    bytes calldata abiEncodedClearValues,
    bytes calldata decryptionProof
) external onlyPlayer(gameId) gameActive(gameId) {
    uint8 count = uint8(clearIndices.length);
    uint8 startIdx = games[gameId].revealedCount;

    require(count > 0, "Empty indices");
    require(startIdx + count <= getAllowedReveals(gameId), "Exceeds allowed");
    require(startIdx + count <= DECK_SIZE, "Exceeds deck");

    // Build handle list for verification
    bytes32[] memory cts = new bytes32[](count);
    for (uint8 i = 0; i < count; i++) {
        cts[i] = FHE.toBytes32(drawIndices[gameId][startIdx + i]);
    }

    // Verify KMS decryption proof - reverts if invalid
    FHE.checkSignatures(cts, abiEncodedClearValues, decryptionProof);

    // Store revealed values
    for (uint8 i = 0; i < count; i++) {
        revealedValues[gameId].push(clearIndices[i]);
    }

    games[gameId].revealedCount = startIdx + count;
    emit DrawRevealed(gameId, count, startIdx + count);
}
```

### Get Draw Handles for Client Decrypt

```solidity
// GameSession.sol - getDrawHandles()
function getDrawHandles(
    uint256 gameId,
    uint8 count
) external view returns (bytes32[] memory handles) {
    Game storage game = games[gameId];
    uint8 start = game.revealedCount;
    uint8 allowed = getAllowedReveals(gameId);

    require(start + count <= allowed, "Exceeds allowed reveals");
    require(start + count <= DECK_SIZE, "Exceeds deck");

    handles = new bytes32[](count);

    // Return FHE encrypted handles as bytes32
    for (uint8 i = 0; i < count; i++) {
        handles[i] = FHE.toBytes32(drawIndices[gameId][start + i]);
    }

    return handles;
}
```

### Allowed Reveals Calculation

```solidity
// GameSession.sol - getAllowedReveals()
function getAllowedReveals(uint256 gameId) public view returns (uint8) {
    uint8 turn = games[gameId].currentTurn;
    // Turn 0: 5 cards (initial hand)
    // Turn 1: 6 cards (5 + 1)
    // Turn 2: 7 cards (5 + 2)
    // ...
    uint8 allowed = INITIAL_HAND_SIZE + turn;
    return allowed > DECK_SIZE ? DECK_SIZE : allowed;
}
```

---

## 6. Game Session Flow

### Phase 1: Game Creation

```
KULLANICI                  CLIENT                    SERVER                   CONTRACT
    |                         |                         |                         |
    |                         |                         |                         |
    | 1. Play butonuna basar  |                         |                         |
    +------------------------>|                         |                         |
    |                         |                         |                         |
    |                         |                         |                         |
    |                         | 2. Wallet + PIN check   |                         |
    |                         |                         |                         |
    |                         |                         |                         |
    |                         +-------+                 |                         |
    |                         |       |                 |                         |
    |                         |       |                 |                         |
    |                         |<------+                 |                         |
    |                         |                         |                         |
    |                         |                         |                         |
    |                         | 3. createSinglePlayerGame(gameId)                 |
    |                         +-------------------------------------------------->|
    |                         |                         |                         |
    |                         |                         |                         |
    |                         |                         |                         | 4. 40x FHE.randEuint8()
    |                         |                         |                         |    Store encrypted
    |                         |                         |                         |    emit GameCreated
    |                         |                         |                         |
    |                         |                         |                         |
    |                         | 5. TX confirmed         |                         |
    |                         |<--------------------------------------------------+
    |                         |                         |                         |
    |                         |                         |                         |
    |                         | 6. Matchmaking request  |                         |
    |                         | POST /matchmaking       |                         |
    |                         | { fhe_enabled: true,    |                         |
    |                         |   fhe_game_id: gameId } |                         |
    |                         +------------------------>|                         |
    |                         |                         |                         |
    |                         |                         |                         |
    |                         |                         | 7. Create game session  |
    |                         |                         |    fheDeckOrder = deck  |
    |                         |                         |    startingHandSize = 0 |
    |                         |                         |                         |
    |                         |                         |                         |
    |                         | 8. Game ready           |                         |
    |                         |<------------------------+                         |
    |                         |                         |                         |
    |                         |                         |                         |
    |                         |                         |                         |
```

### Server Game State Setup

```coffeescript
# creategame.coffee
if player1FheEnabled
  player1DataForGame.fhePlayer = true
  player1DataForGame.startingHandSize = 0  # Hand is empty, cards from FHE

# game.coffee
games[gameId].fhe = {
  player1: {
    enabled: true
    blockchainGameId: data.blockchainGameId
    revealedCount: 0
    initialHandRevealComplete: false
    turnDrawComplete: true  # Starts true
  }
}
```

---

## 7. Initial Hand Reveal

### Flow (5 Cards)

```
CLIENT                    CONTRACT                   GATEWAY                  SERVER
   |                            |                        |                       |
   |                            |                        |                       |
   | 1. getDrawHandles(gameId, 5)                        |                       |
   +--------------------------->|                        |                       |
   |                            |                        |                       |
   |                            |                        |                       |
   |    bytes32[5] handles      |                        |                       |
   |<---------------------------+                        |                       |
   |                            |                        |                       |
   |                            |                        |                       |
   | 2. publicDecrypt(handles)  |                        |                       |
   +---------------------------------------------------->|                       |
   |                            |                        |                       |
   |                            |                        |                       |
   |    clearIndices = [17, 3, 29, 8, 12]                |                       |
   |    + decryptionProof       |                        |                       |
   |                            |                        |                       |
   |                            |                        |                       |
   |<----------------------------------------------------+                       |
   |                            |                        |                       |
   |                            |                        |                       |
   | 3. Calculate cards locally |                        |                       |
   |                            |                        |                       |
   +---+                        |                        |                       |
   |   |                        |                        |                       |
   |   | remaining = deck.slice()                        |                       |
   |   | for each idx:          |                        |                       |
   |   |   pos = idx % remaining.length                  |                       |
   |   |   hand.push(remaining[pos])                     |                       |
   |   |   remaining.splice(pos, 1)                      |                       |
   |<--+                        |                        |                       |
   |                            |                        |                       |
   |                            |                        |                       |
   | 4. revealDrawBatch(gameId, clearIndices, proof)     |                       |
   +--------------------------->|                        |                       |
   |                            |                        |                       |
   |                            |                        |                       |
   |                            | FHE.checkSignatures()  |                       |
   |                            | if valid: store        |                       |
   |                            | emit DrawRevealed      |                       |
   |                            |                        |                       |
   |                            |                        |                       |
   |    TX confirmed            |                        |                       |
   |<---------------------------+                        |                       |
   |                            |                        |                       |
   |                            |                        |                       |
   | 5. socket.emit("fhe_initial_hand_revealed")         |                       |
   +---------------------------------------------------------------------------->|
   |                            |                        |                       |
   |                            |                        |                       |
   |                            |                        |     6. VERIFY         |
   |                            |<-----------------------------------------------+
   |                            |                        |                       |
   |                            |                        | getVerifiedDrawOrder()|
   |                            |                        |                       |
   |                            +----------------------------------------------->|
   |                            |                        |                       |
   |                            |                        |                       |
   |                            |                        |     7. Same algorithm |
   |                            |                        |        Apply to SDK   |
   |                            |                        |                       |
   |                            |                        |                       |
   | 8. fhe_initial_hand_revealed_response               |                       |
   |<----------------------------------------------------------------------------+
   |                            |                        |                       |
   |                            |                        |                       |
   |                            |                        |                       |
```

### Card Selection Algorithm

```javascript
// Both client and server use IDENTICAL algorithm
function calculateCardsFromIndices(deck, indices) {
    var remaining = deck.slice();  // Copy of deck
    var cards = [];

    for (var i = 0; i < indices.length; i++) {
        var pos = indices[i] % remaining.length;
        cards.push(remaining[pos]);
        remaining.splice(pos, 1);  // Remove from remaining
    }

    return {
        drawnCards: cards,
        remainingDeck: remaining
    };
}
```

### Client Initial Hand Reveal Code (fheGameSession.js)

```javascript
// fheGameSession.js - revealInitialHand()
FHEGameSession.prototype.revealInitialHand = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self.gameId === null) {
      reject(new Error('Not in a game'));
      return;
    }

    // CHECK: If we have cached data, use retryNotifyServer instead
    if (self._cachedInitialHandData) {
      Logger.module('FHE_GAME').log('Cached hand found, skipping blockchain');
      self.retryNotifyServer().then(resolve).catch(reject);
      return;
    }

    Logger.module('FHE_GAME').log('=== REVEAL INITIAL HAND ===');

    // Wait for ZAMA ACL indexing (10 seconds on Sepolia)
    var waitForACL = new Promise(function(res) {
      setTimeout(res, 10000);
    });

    waitForACL
    .then(function() {
      // Step 1: Check allowed reveals
      return self._getAllowedReveals();
    })
    .then(function(allowed) {
      if (allowed < INITIAL_HAND_SIZE) {
        throw new Error('Not enough allowed reveals');
      }
      // Step 2: Get draw handles
      return self._getDrawHandles(INITIAL_HAND_SIZE);
    })
    .then(function(handles) {
      // Step 3: Public decrypt via KMS
      return self._publicDecrypt(handles);
    })
    .then(function(result) {
      // Step 4: Store revealed indices
      self.revealedIndices = result.clearIndices.slice();

      // Step 5: Submit reveal batch TX
      return self._revealDrawBatch(
        result.clearIndices,
        result.abiEncodedClearValues,
        result.proof
      );
    })
    .then(function() {
      // Step 6: Calculate cards locally
      self.myHand = self._calculateCards(self.revealedIndices);

      // Cache for retry
      self._cachedInitialHandData = {
        hand: self.myHand.slice(),
        revealedIndices: self.revealedIndices.slice()
      };

      // Step 7: Notify server
      return self._notifyServerInitialHand();
    })
    .then(function(serverCardIndices) {
      self._cachedInitialHandData = null; // Clear cache on success
      resolve({
        cardIds: self.myHand.slice(),
        cardIndices: serverCardIndices
      });
    })
    .catch(reject);
  });
};
```

### Client Public Decrypt Code (fheGameSession.js)

```javascript
// fheGameSession.js - _publicDecrypt()
FHEGameSession.prototype._publicDecrypt = function(handles) {
  var self = this;

  return new Promise(function(resolve, reject) {
    // Convert handles to hex strings
    var handleStrings = handles.map(function(h) {
      if (typeof h === 'bigint') {
        return '0x' + h.toString(16).padStart(64, '0');
      } else if (h._hex) {
        return h._hex;
      }
      return h.toString();
    });

    // Get FHEVM SDK instance
    self._getFhevmInstance()
      .then(function(instance) {
        // Call publicDecrypt on Zama Gateway
        return instance.publicDecrypt(handleStrings);
      })
      .then(function(result) {
        // SDK returns clearValues as object map, not array!
        // Format: { '0xhandle1': value1, '0xhandle2': value2, ... }
        var clearIndices = handleStrings.map(function(h) {
          var value = result.clearValues[h];
          if (typeof value === 'bigint') {
            return Number(value % BigInt(256));
          }
          return Number(value) % 256;
        });

        resolve({
          clearIndices: clearIndices,
          abiEncodedClearValues: result.abiEncodedClearValues || '0x',
          proof: result.decryptionProof || '0x'
        });
      })
      .catch(reject);
  });
};
```

### Client Game Creation Code (fheGameSession.js)

```javascript
// fheGameSession.js - createSinglePlayerGame()
FHEGameSession.prototype.createSinglePlayerGame = function(gameId, deck) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!self.contract) {
      reject(new Error('Contract not connected'));
      return;
    }

    // Store deck for card calculation
    self.deck = deck.slice();
    self.remainingDeck = deck.slice();
    self.myHand = [];
    self.revealedIndices = [];
    self.gameId = gameId;

    // Encode TX
    var iface = new ethers.utils.Interface(GAME_SESSION_ABI);
    var data = iface.encodeFunctionData('createSinglePlayerGame', [gameId]);

    // Send TX via session wallet
    self.sessionWallet.signTransaction({
      to: self.contractAddress,
      data: data,
      gasLimit: '0x7A1200' // 8M gas (40x FHE.rand)
    })
    .then(function(txResponse) {
      return txResponse.wait();
    })
    .then(function(receipt) {
      if (receipt.status === 0) {
        throw new Error('Transaction reverted');
      }
      self.blockchainGameId = gameId;
      resolve(self.gameId);
    })
    .catch(reject);
  });
};
```

---

## 8. Turn System and Card Draw

### Turn End Flow (Multiplayer Critical)

```
Player1 (Ending Turn)              SERVER                    Player2
         |                            |                          |
         |                            |                          |
         | 1. EndTurnAction           |                          |
         +--------------------------->|                          |
         |                            |                          |
         |                            |                          |
         |                            | 2. onStep(EndTurnAction) |
         |                            |    turnDrawComplete = false
         |                            |    emit EndTurnAction    |
         |                            +------------------------->|
         |                            |                          |
         |                            |                          |
         |                            | 3. onStep(StartTurnAction)
         |                            | if (!turnDrawComplete)   |
         |                            |   pendingStartTurnStep = step
         |                            |   DO NOT EMIT!           |
         |                            |                          |
         |                            |                          |
         | 4. incrementTurn TX        |                          |
         |                            |                          |
         +---+                        |                          |
         |   |                        |                          |
         |   | getDrawHandles(1)      |                          |
         |   | publicDecrypt          |                          |
         |   | revealDrawBatch        |                          |
         |<--+                        |                          |
         |                            |                          |
         |                            |                          |
         | 5. fhe_card_drawn          |                          |
         +--------------------------->|                          |
         |                            |                          |
         |                            |                          |
         |                            | 6. Blockchain verify     |
         |                            |    Apply card to SDK     |
         |                            |    turnDrawComplete = true
         |                            |                          |
         |                            |                          |
         |                            | 7. NOW emit pending step |
         |                            +------------------------->|
         |                            |                          |
         |                            |                          |
         |                            |    restartTurnTimer()    |
         |                            |                          |
         |                            |                          |
         | 8. fhe_card_drawn_response |                          |
         |<---------------------------+                          |
         |                            |                          |
         |                            |                          |
         |                            |           9. Now can play|
         |                            |                          |
         |                            |                          |
         |                            |                          |
```

### Why StartTurnAction is Held

| Problem | Solution |
|---------|----------|
| Player2 receives turn before Player1 finishes FHE decrypt | Hold StartTurnAction until decrypt complete |
| stepCount desync between client and server | Subtract 1 from stepCount while pending |
| Player2 plays before game state is consistent | Emit StartTurnAction only after verification |

### Pending Step Logic

```coffeescript
# game.coffee - onStep()

if action instanceof SDK.EndTurnAction
  # Mark ending player as "drawing"
  endingPlayerFhe = getFHEStateForPlayer(gameId, action.getOwnerId())
  if endingPlayerFhe?.enabled
    endingPlayerFhe.turnDrawComplete = false

if action instanceof SDK.StartTurnAction
  # If ending player hasn't finished FHE draw, hold this step
  if endingPlayerFhe?.enabled and not endingPlayerFhe.turnDrawComplete
    game.pendingStartTurnStep = stepEventData
    return  # DO NOT emit

# game.coffee - onFHECardDrawn()
fheState.turnDrawComplete = true
if game.pendingStartTurnStep?
  emitGameEvent(null, gameId, game.pendingStartTurnStep)
  game.pendingStartTurnStep = null
  restartTurnTimer(gameId)
```

---

## 9. Replace Card and Skill-Based Card Draw

Card abilities that draw or replace cards also use FHE to ensure fair random selection.

### Replace Card Flow

When a player replaces a card from hand:

```
CLIENT                    FHECardHandler            CONTRACT                  SERVER
   |                            |                        |                       |
   |                            |                        |                       |
   | 1. ReplaceCardFromHandAction(slot)                  |                       |
   +--------------------------->|                        |                       |
   |                            |                        |                       |
   |                            |                        |                       |
   |                            | 2. replaceCard(slot)   |                       |
   |                            +----------------------->|                       |
   |                            |                        |                       |
   |                            |                        |                       |
   |                            |           3. Get next FHE random               |
   |                            |              Map to deck card                  |
   |                            |              Return new handle                 |
   |                            |                        |                       |
   |                            |                        |                       |
   |                            |    4. Decrypt via KMS  |                       |
   |                            |<-----------------------+                       |
   |                            |                        |                       |
   |                            |                        |                       |
   |                            | 5. Calculate new card  |                       |
   |                            |                        |                       |
   |                            +-------+                |                       |
   |                            |       |                |                       |
   |                            |       |                |                       |
   |                            |<------+                |                       |
   |                            |                        |                       |
   |                            |                        |                       |
   |  6. New card ID            |                        |                       |
   |<---------------------------+                        |                       |
   |                            |                        |                       |
   |                            |                        |                       |
   | 7. Update hand UI          |                        |                       |
   |                            |                        |                       |
   +-------+                    |                        |                       |
   |       |                    |                        |                       |
   |       |                    |                        |                       |
   |<------+                    |                        |                       |
   |                            |                        |                       |
   |                            |                        |                       |
   | 8. Notify server           |                        |                       |
   +---------------------------------------------------------------------------->|
   |                            |                        |                       |
   |                            |                        |                       |
   |                            |                        |                       |
```

### FHE Card Handler Integration

```javascript
// FHECardHandler intercepts card actions

// Replace card with FHE
FHECardHandler.replaceCard = function(handSlot) {
    return fheGameSession.replaceCard(handSlot);
};

// Draw card via ability (e.g., "Draw a random minion")
FHECardHandler.drawCard = function(gameSession, playerId) {
    return fheGameSession.drawCard()
        .then(function(decryptedHand) {
            var newCardId = decryptedHand[decryptedHand.length - 1];
            return {
                cardId: newCardId,
                index: decryptedHand.length - 1,
                fromFHE: true
            };
        });
};
```

### Card Abilities Using FHE

| Ability Type | FHE Integration | Example Cards |
|--------------|-----------------|---------------|
| Replace | Uses next FHE random from pool | Manual replace, Aethermaster |
| Draw from deck | Consumes FHE random for index | Spelljammer, Blaze Hound |
| Draw random type | FHE random + type filter | Draw random Arcanyst |
| Put card in hand | FHE random for card selection | Dying wish abilities |
| Transform hand | FHE randoms for each card | Mnemovore effect |

### PutCardInHandAction FHE Flow

When a card ability puts a specific card type in hand:

```
Ability Trigger                  FHECardHandler              CONTRACT
       |                               |                         |
       |                               |                         |
       | 1. PutCardInHandAction        |                         |
       |    (cardType: "Arcanyst")     |                         |
       +------------------------------>|                         |
       |                               |                         |
       |                               |                         |
       |                               | 2. Get card pool        |
       |                               |    by type filter       |
       |                               |                         |
       |                               +-------+                 |
       |                               |       |                 |
       |                               |       |                 |
       |                               |<------+                 |
       |                               |                         |
       |                               |                         |
       |                               | 3. Request FHE random   |
       |                               +------------------------>|
       |                               |                         |
       |                               |                         |
       |                               |      4. euint8 handle   |
       |                               |<------------------------+
       |                               |                         |
       |                               |                         |
       |                               | 5. Decrypt              |
       |                               +------------------------>|
       |                               |                         |
       |                               |                         |
       |                               |      6. Value (0-255)   |
       |                               |<------------------------+
       |                               |                         |
       |                               |                         |
       |                               | 7. Select card          |
       |                               |    value % pool.length  |
       |                               |                         |
       |                               +-------+                 |
       |                               |       |                 |
       |                               |       |                 |
       |                               |<------+                 |
       |                               |                         |
       |                               |                         |
       | 8. Card added to hand         |                         |
       |<------------------------------+                         |
       |                               |                         |
       |                               |                         |
       |                               |                         |
```

### Skill Events with FHE

```javascript
// Lazy decryption for hand visibility
FHECardHandler.decryptCard = function(handSlot) {
    if (pendingDecrypts.has(handSlot)) {
        return pendingDecrypts.get(handSlot);
    }

    var decryptPromise = decryptHand()
        .then(function(hand) {
            pendingDecrypts.delete(handSlot);
            return hand[handSlot];
        });

    pendingDecrypts.set(handSlot, decryptPromise);
    return decryptPromise;
};

// Event listeners for card operations
FHECardHandler.onCardDrawn = function(callback) {
    fheGameSession.on('CardDrawn', function(gameId, playerIndex) {
        callback({ gameId: gameId, playerIndex: playerIndex });
    });
};

FHECardHandler.onCardPlayed = function(callback) {
    fheGameSession.on('CardPlayed', function(gameId, playerIndex, cardId, x, y) {
        callback({ gameId: gameId, cardId: cardId, x: x, y: y });
    });
};
```

---

## 10. UI State Management

### Submit/Continue Button States

```
+-------------------+      +-------------------+      +-------------------+
|    My Turn        | ---> |   Submitting      | ---> |  Enemy Turn       |
|                   |      |                   |      |                   |
| "Submit Proof"    |      | "Submitting"      |      | "Verifying..."    |
| button.my-turn    |      | button.submitting |      | button.enemy-turn |
|                   |      |                   |      |                   |
+-------------------+      +-------------------+      +-------------------+
           ^                                                    |
           |                                                    |
           |                                                    |
           +----------------------------------------------------+
                       (when your turn starts again)
```

### _fheSubmitting Flag

```javascript
// game_bottom_bar.js

onClickSubmitTurn: function () {
    if (fheEnabled) {
        this._fheSubmitting = true;  // SET FLAG
        this._setSubmitTurnButtonToSubmittingState();
    }
    gameSession.submitExplicitAction(EndTurnAction);
}

_updateSubmitTurnState: function () {
    if (this._fheSubmitting) {
        return;  // IGNORE SDK events while submitting
    }
    // normal state logic
}

_setSubmitTurnButtonToEnemyState: function () {
    if (this._fheSubmitting) {
        return;  // IGNORE - keep showing "Submitting"
    }
    // show "Verifying Opponent"
}

_onFHEDecryptSuccess: function () {
    this._fheSubmitting = false;  // CLEAR FLAG
    this._updateSubmitTurnState();  // Now update normally
}
```

### Initial Hand Continue Button

```javascript
// game_choose_hand.js

onRender: function () {
    if (fheEnabled) {
        // Hide Continue button until decrypt complete
        this.ui.$confirmButton.css({
            opacity: 0,
            'pointer-events': 'none',
        });
    }
}

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

## 11. Multiplayer Synchronization

### Server Dual Role

```
+-------------------------------------------------------------------+
|                         SERVER ROLES                              |
+-------------------------------------------------------------------+
|                                                                   |
|   SYNC (Coordinator)                OBSERVE (Verifier)            |
|   -----------------------           -----------------------       |
|   - Match players                   - Listen contract events      |
|   - Manage turn order               - Read verified values        |
|   - Relay actions                   - Cross-check state           |
|   - Handle disconnects              - Never generate randoms      |
|   - Timeout management              - Never decrypt values        |
|                                                                   |
+-------------------------------------------------------------------+
```

### Trust Model

```
+-------------------------------------------------------------------+
|                        TRUSTED ZONE                               |
+-------------------------------------------------------------------+
|   BLOCKCHAIN (Smart Contract)       ZAMA GATEWAY (KMS)            |
|   - FHE random generation           - Threshold decryption        |
|   - Proof verification              - Only for authorized users   |
+-------------------------------------------------------------------+
                     |                        |
                     |                        |
                     v                        v
+-------------------------------------------------------------------+
|                      UNTRUSTED ZONE                               |
+-------------------------------------------------------------------+
|   CLIENT                            SERVER                        |
|   - Signs TX                        - Coordinates players         |
|   - Requests decrypt                - Reads blockchain            |
|   - Calculates cards                - Verifies state              |
|   All critical operations verified on-chain                       |
+-------------------------------------------------------------------+
```

### Why Server Cannot Cheat

| Attack | Why It Fails |
|--------|--------------|
| Server sends fake card | Client verifies on-chain handle |
| Server modifies random | Proof verification fails |
| Server replays old game | Unique on-chain gameId |
| Server favors player | All randoms from FHE coprocessor |

### Server FHE Event Handlers (game.coffee)

```coffeescript
# game.coffee - FHE socket event bindings
socket.on "fhe_game_created", onFHEGameCreated
socket.on "fhe_initial_hand_revealed", onFHEInitialHandRevealed
socket.on "fhe_card_drawn", onFHECardDrawn
```

### Server Initial Hand Verification (game.coffee)

```coffeescript
# game.coffee - onFHEInitialHandRevealed()
onFHEInitialHandRevealed = (requestData) ->
  socket = @
  gameId = requestData.gameId
  playerId = @.playerId

  fheState = getFHEStateForPlayer(gameId, playerId)
  if !fheState?.enabled
    socket.emit "fhe_initial_hand_revealed_response", { error: "FHE not enabled" }
    return

  blockchainGameId = fheState.blockchainGameId
  fheDeckOrder = getFHEDeckOrderForPlayer(gameId, playerId)
  network = fheState.network or 'sepolia'
  INITIAL_HAND_SIZE = 5

  # BLOCKCHAIN VERIFICATION - Never trust client!
  BlockchainModule.verifyAndCalculateCards(network, blockchainGameId, fheDeckOrder, INITIAL_HAND_SIZE)
  .then (result) ->
    if !result.verified
      socket.emit "fhe_initial_hand_revealed_response", { error: "Verification failed" }
      return

    verifiedCards = result.cards
    cardIndicesForClient = []
    player = game.session.getPlayerById(playerId)
    playerDeck = player.getDeck()
    drawPile = playerDeck.getDrawPile()

    # Apply verified cards to hand
    for cardId, handSlotIndex in verifiedCards
      for i in [0...drawPile.length]
        cardIndex = drawPile[i]
        card = game.session.getCardByIndex(cardIndex)
        if card? and card.getId() == cardId
          game.session.applyCardToHand(playerDeck, cardIndex, card, handSlotIndex)
          cardIndicesForClient.push(cardIndex)
          break

    # Update FHE state
    fheState.revealedCount = verifiedCards.length
    fheState.initialHandRevealComplete = true

    socket.emit "fhe_initial_hand_revealed_response", {
      success: true
      cardIndices: cardIndicesForClient
    }

    # Start timer if all FHE players ready
    if allFheDone
      restartTurnTimer(gameId)
```

### Server Card Draw Verification (game.coffee)

```coffeescript
# game.coffee - onFHECardDrawn()
onFHECardDrawn = (requestData) ->
  socket = @
  gameId = requestData.gameId
  playerId = @.playerId

  fheState = getFHEStateForPlayer(gameId, playerId)
  blockchainGameId = fheState.blockchainGameId
  fheDeckOrder = getFHEDeckOrderForPlayer(gameId, playerId)
  network = fheState.network or 'sepolia'
  previousRevealCount = fheState.revealedCount or 5
  expectedNewRevealCount = previousRevealCount + 1

  # BLOCKCHAIN VERIFICATION - Never trust client!
  BlockchainModule.getVerifiedDrawOrder(network, blockchainGameId)
  .then (indices) ->
    if indices.length < expectedNewRevealCount
      socket.emit "fhe_card_drawn_response", { error: "Reveal not yet on blockchain" }
      return

    # Calculate ALL cards using full indices array
    result = BlockchainModule.calculateCardsFromIndices(fheDeckOrder, indices)

    # The last drawn card is the new one
    cardId = result.drawnCards[result.drawnCards.length - 1]

    player = game.session.getPlayerById(playerId)
    playerDeck = player.getDeck()
    drawPile = playerDeck.getDrawPile()

    # Find and apply the card
    for i in [0...drawPile.length]
      cardIndex = drawPile[i]
      card = game.session.getCardByIndex(cardIndex)
      if card? and card.getId() == cardId
        handSlotIndex = playerDeck.getNumCardsInHand()
        if handSlotIndex < 6  # Max hand size
          game.session.applyCardToHand(playerDeck, cardIndex, card, handSlotIndex)
          appliedCardIndex = cardIndex
        else
          cardBurned = true  # Hand full
        break

    # Update state
    fheState.revealedCount = indices.length
    fheState.turnDrawComplete = true

    # Emit pending StartTurnAction if waiting
    if game.pendingStartTurnStep?
      emitGameEvent(null, gameId, game.pendingStartTurnStep)
      game.pendingStartTurnStep = null
      restartTurnTimer(gameId)

    socket.emit "fhe_card_drawn_response", {
      success: true
      cardIndex: appliedCardIndex
      burned: cardBurned
    }
```

### Server Blockchain Module (blockchain.coffee)

```coffeescript
# blockchain.coffee - verifyAndCalculateCards()
verifyAndCalculateCards = (network, blockchainGameId, fheDeckOrder, expectedCount) ->
  getVerifiedDrawOrder(network, blockchainGameId)
  .then (indices) ->
    if indices.length < expectedCount
      return { verified: false, error: "Not enough reveals" }

    # Use only first expectedCount indices
    usedIndices = indices.slice(0, expectedCount)

    # Calculate cards using same algorithm as client
    result = calculateCardsFromIndices(fheDeckOrder, usedIndices)

    return {
      verified: true
      cards: result.drawnCards
      indices: usedIndices
      remainingDeck: result.remainingDeck
    }

# blockchain.coffee - getVerifiedDrawOrder()
getVerifiedDrawOrder = (network, gameId) ->
  provider = getProvider(network)
  contract = new ethers.Contract(GAME_SESSION_ADDRESS, GAME_SESSION_ABI, provider)
  contract.getVerifiedDrawOrder(gameId)
  .then (indices) ->
    # Convert BigNumber array to regular numbers
    return indices.map((idx) -> idx.toNumber())
```

---

## 12. Boss Battle Integration

Boss Battle uses the same FHE system as Single Player with different AI configuration.

### Difference Table

| Aspect | Single Player | Boss Battle |
|--------|---------------|-------------|
| Endpoint | `/api/me/games/single_player` | `/api/me/games/boss_battle` |
| AI Difficulty | Dynamic (win count) | Fixed (1.0 - max) |
| AI Deck | Random | Boss-specific (GameSetups) |
| GameType | `SDK.GameType.SinglePlayer` | `SDK.GameType.BossBattle` |
| Button Text | "Encrypt & Fight" | "BOSS FHEIGHT" |

### Boss Battle FHE Flow

```
deck_select_boss_battle.js: getConfirmSelectionEvent()
    |-- return EVENTS.start_boss_battle
    v
application.js: _startBossBattleGame()
    |-- if (CONFIG.fheEnabled)
    |       _startBossBattleGameFHE()
    v
_startBossBattleGameFHE():
    |-- Wallet.connect()
    |-- FHE.GameMode.initialize()
    |-- createSinglePlayerGame()  // SAME blockchain function
    |-- POST /api/me/games/boss_battle
    |       { fhe_enabled: true, fhe_game_id: gameId }
    v
Server:
    |-- gameSetupOptions.fheEnabled = true
    |-- createSinglePlayerGame(..., gameSetupOptions)
```

---

## 13. Marble System (Booster Packs)

Marbles use FHE for provably fair pack opening with 15 random values.

### Random Value Layout

| Index | Purpose | Description |
|-------|---------|-------------|
| 0-4 | Rarity | Common/Rare/Epic/Legendary roll |
| 5-9 | Card Index | Selects card from pool |
| 10-14 | Prismatic | Prismatic variant check |

### Rarity Thresholds (0-255)

| Range | Rarity | Probability |
|-------|--------|-------------|
| 0-186 | Common | 73% |
| 187-225 | Rare | 15% |
| 226-250 | Epic | 10% |
| 251-255 | Legendary | 2% |

### Prismatic Thresholds

| Rarity | Threshold | Probability |
|--------|-----------|-------------|
| Common | < 10 | ~4% |
| Rare | < 15 | ~6% |
| Epic | < 18 | ~7% |
| Legendary | < 20 | ~8% |

### Marble Flow

```
CLIENT                    MarbleRandoms               SERVER
   |                            |                        |
   |                            |                        |
   | 1. drawRandoms(marbleId, cardSetId)                 |
   +--------------------------->|                        |
   |                            |                        |
   |                            |                        |
   |                            | 15x FHE.randEuint8()   |
   |                            |                        |
   |                            |                        |
   |    TX confirmed            |                        |
   |<---------------------------+                        |
   |                            |                        |
   |                            |                        |
   | 2. getRandomHandles(marbleId)                       |
   +--------------------------->|                        |
   |                            |                        |
   |                            |                        |
   |    bytes32[15] handles     |                        |
   |<---------------------------+                        |
   |                            |                        |
   |                            |                        |
   | 3. Gateway decrypt all 15  |                        |
   |                            |                        |
   |                            |                        |
   | 4. revealRandoms(marbleId, values, proof)           |
   +--------------------------->|                        |
   |                            |                        |
   |                            |                        |
   |                            | FHE.checkSignatures()  |
   |                            | Store verified values  |
   |                            |                        |
   |                            |                        |
   |    TX confirmed            |                        |
   |<---------------------------+                        |
   |                            |                        |
   |                            |                        |
   | 5. PUT /spirit_orbs/fhe_opened/:id                  |
   |    { marble_id: "0x..." }  |                        |
   +---------------------------------------------------->|
   |                            |                        |
   |                            |                        |
   |                            |  6. isMarbleRevealed() |
   |                            |<-----------------------+
   |                            |                        |
   |                            |                        |
   |                            | 7. getVerifiedRandoms()|
   |                            |<-----------------------+
   |                            |                        |
   |                            |    8. Calculate cards  |
   |                            |       using SDK pools  |
   |                            |       Update inventory |
   |                            |                        |
   |                            |                        |
   | 9. Response: { cards: [...] }                       |
   |<----------------------------------------------------+
   |                            |                        |
   |                            |                        |
```

### MarbleRandoms Contract Code (MarbleRandoms.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MarbleRandoms is ZamaEthereumConfig {

    uint8 public constant CARDS_PER_MARBLE = 5;
    uint8 public constant RANDOMS_PER_CARD = 3; // rarity, index, prismatic
    uint8 public constant TOTAL_RANDOMS = 15;   // 5 * 3

    struct MarbleSession {
        address owner;
        uint8 cardSetId;
        bool isDrawn;
        bool isRevealed;
        uint256 createdAt;
    }

    struct RevealedValues {
        uint8[5] rarity;
        uint8[5] index;
        uint8[5] prismatic;
    }

    // Marble sessions
    mapping(bytes32 => MarbleSession) public marbles;

    // Encrypted randoms: 0-4 = rarity, 5-9 = index, 10-14 = prismatic
    mapping(bytes32 => mapping(uint8 => euint8)) private encryptedRandoms;

    // Revealed values
    mapping(bytes32 => RevealedValues) private revealedValues;
}
```

### Marble Draw Randoms Function

```solidity
// MarbleRandoms.sol - drawRandoms()
function drawRandoms(bytes32 marbleId, uint8 cardSetId) external {
    require(marbles[marbleId].owner == address(0), "Marble already drawn");

    marbles[marbleId] = MarbleSession({
        owner: msg.sender,
        cardSetId: cardSetId,
        isDrawn: true,
        isRevealed: false,
        createdAt: block.timestamp
    });

    // Generate 15 encrypted randoms (5 cards x 3 randoms each)
    for (uint8 i = 0; i < TOTAL_RANDOMS; i++) {
        euint8 encryptedRand = FHE.randEuint8();
        FHE.allowThis(encryptedRand);
        encryptedRandoms[marbleId][i] = encryptedRand;
        FHE.makePubliclyDecryptable(encryptedRand);
    }

    emit RandomsGenerated(marbleId, msg.sender, cardSetId);
}
```

### Marble Reveal with Proof Verification

```solidity
// MarbleRandoms.sol - revealRandoms()
function revealRandoms(
    bytes32 marbleId,
    uint8[15] calldata clearValues,
    bytes calldata abiEncodedClearValues,
    bytes calldata decryptionProof
) external onlyOwner(marbleId) {
    MarbleSession storage session = marbles[marbleId];
    require(session.isDrawn, "Not drawn");
    require(!session.isRevealed, "Already revealed");

    // Build handle list for verification
    bytes32[] memory cts = new bytes32[](TOTAL_RANDOMS);
    for (uint8 i = 0; i < TOTAL_RANDOMS; i++) {
        cts[i] = FHE.toBytes32(encryptedRandoms[marbleId][i]);
    }

    // Verify KMS decryption proof - reverts if invalid
    FHE.checkSignatures(cts, abiEncodedClearValues, decryptionProof);

    // Store revealed values in structured format
    RevealedValues storage revealed = revealedValues[marbleId];
    for (uint8 i = 0; i < CARDS_PER_MARBLE; i++) {
        revealed.rarity[i] = clearValues[i];           // 0-4
        revealed.index[i] = clearValues[i + 5];        // 5-9
        revealed.prismatic[i] = clearValues[i + 10];   // 10-14
    }

    session.isRevealed = true;

    emit RandomsRevealed(
        marbleId,
        revealed.rarity,
        revealed.index,
        revealed.prismatic
    );
}
```

### Marble Get Verified Randoms

```solidity
// MarbleRandoms.sol - getVerifiedRandoms()
function getVerifiedRandoms(bytes32 marbleId) external view returns (
    uint8[5] memory rarity,
    uint8[5] memory index,
    uint8[5] memory prismatic
) {
    require(marbles[marbleId].isRevealed, "Not revealed");

    RevealedValues storage revealed = revealedValues[marbleId];
    return (revealed.rarity, revealed.index, revealed.prismatic);
}
```

### Server Card Calculation

```coffeescript
# fhe_marble_verifier.coffee

calculateCardsFromRandoms: (cardSetId, rarity, index, prismatic) ->
  new_cards = []

  COMMON_THRESHOLD = 186
  RARE_THRESHOLD = 225
  EPIC_THRESHOLD = 250

  PRISMATIC_COMMON = 10
  PRISMATIC_RARE = 15
  PRISMATIC_EPIC = 18
  PRISMATIC_LEGENDARY = 20

  for i in [0...5]
    # Determine rarity
    if rarity[i] <= COMMON_THRESHOLD
      rarityType = SDK.Rarity.Common
      prismaticThreshold = PRISMATIC_COMMON
    else if rarity[i] <= RARE_THRESHOLD
      rarityType = SDK.Rarity.Rare
      prismaticThreshold = PRISMATIC_RARE
    else if rarity[i] <= EPIC_THRESHOLD
      rarityType = SDK.Rarity.Epic
      prismaticThreshold = PRISMATIC_EPIC
    else
      rarityType = SDK.Rarity.Legendary
      prismaticThreshold = PRISMATIC_LEGENDARY

    # Get card pool from CardRegistry
    cardPool = SDK.GameSession.getCardCaches()
      .getCardSet(cardSetId)
      .getRarity(rarityType)
      .getIsCollectible(true)
      .getIsPrismatic(false)
      .getCardIds()

    # Select card using index
    selectedIndex = index[i] % cardPool.length
    cardId = SDK.Cards.getBaseCardId(cardPool[selectedIndex])

    # Check prismatic
    if prismatic[i] < prismaticThreshold
      cardId = SDK.Cards.getPrismaticCardId(cardId)

    new_cards.push(cardId)

  return new_cards
```

---

## 14. Error Handling and Retry

### Cached Initial Hand for Retry

```javascript
// fheGameSession.js

// After successful blockchain TX, cache the result
self._cachedInitialHandData = {
    hand: self.myHand.slice(),
    revealedIndices: self.revealedIndices.slice()
};

// On retry, check cache first
if (self._cachedInitialHandData) {
    // Skip blockchain, just notify server
    retryNotifyServer().then(resolve).catch(reject);
    return;
}
```

### Why Cache is Needed

| Problem | Without Cache | With Cache |
|---------|---------------|------------|
| Blockchain TX succeeds | - | - |
| Server notification fails | - | - |
| User clicks Re-Decrypt | Blockchain says "Already revealed" | Skip blockchain, retry server only |

### Retry Flow

```
CLIENT: revealInitialHand()
    |
    |
    v
Blockchain: revealDrawBatch()
    |
    |-- SUCCESS
    |
    v
Cache: _cachedInitialHandData = { hand, indices }
    |
    |
    v
Server: socket.emit("fhe_initial_hand_revealed")
    |
    |-- 500 ERROR
    |
    v
EventBus: EVENTS.fhe_draw_decrypt_failed
    |
    |
    v
UI: Show Re-Decrypt button
    |
    |
    v
User clicks Re-Decrypt
    |
    |
    v
fheGameSession.js: revealInitialHand()
    |
    |-- if (_cachedInitialHandData)
    |       retryNotifyServer()  // Skip blockchain!
    |       
    v
Server: Retry notification
    |
    |-- SUCCESS
    |
    v
EventBus: EVENTS.fhe_draw_decrypt_success
```

---

## 15. Security Model

### FHE Security Properties

| Property | Guarantee |
|----------|-----------|
| Random Generation | `FHE.randEuint8()` - contract cannot predict or manipulate |
| Decryption | Only Zama Gateway KMS can decrypt |
| Proof Verification | `FHE.checkSignatures()` - cryptographic guarantee |
| Client Independence | Client calculates own cards, doesn't trust server |
| Server Independence | Server reads blockchain, doesn't trust client |

### Attack Prevention

| Attack Vector | Prevention |
|---------------|------------|
| Replay attacks | Each gameId/marbleId unique, single use |
| Front-running | Values encrypted until reveal |
| Server manipulation | Server reads, never generates randoms |
| Proof forgery | FHE.checkSignatures cryptographic verification |
| Unauthorized decrypt | Gateway checks EIP712 signature + ACL |
| Session key theft | AES-256-GCM + PIN + TTL expiry |
| Memory attacks | Decrypted key only in RAM, never persisted |

### Contract Condition Tables

**GameSession**

| Method | Condition | Result |
|--------|-----------|--------|
| `createSinglePlayerGame` | `games[gameId].player == 0` | Create / Revert "Game exists" |
| `getDrawHandles` | `games[gameId].isActive` | Return handles / Revert "Not active" |
| `getDrawHandles` | `msg.sender == player` | Continue / Revert "Not player" |
| `revealDrawBatch` | `msg.sender == player` | Continue / Revert "Not player" |
| `revealDrawBatch` | `FHE.checkSignatures()` | Store / Revert |

**MarbleRandoms**

| Method | Condition | Result |
|--------|-----------|--------|
| `drawRandoms` | `marbles[id].owner == 0` | Create / Revert "Already drawn" |
| `getRandomHandles` | `marbles[id].isDrawn` | Return / Revert "Not drawn" |
| `getRandomHandles` | `msg.sender == owner` | Continue / Revert "Not owner" |
| `revealRandoms` | `!marbles[id].isRevealed` | Continue / Revert "Already revealed" |
| `revealRandoms` | `FHE.checkSignatures()` | Store / Revert |

---

## Contract Addresses

### Sepolia

| Contract | Address |
|----------|---------|
| GameSession | `0x0Cc86698f008a6b86d1469Dcc8929E4FF7c28dBD` |
| MarbleRandoms | `0x905cA0c59588d3F64cdad12534B5C450485206cc` |
| WalletVault | `0x053E51a173b863E6495Dd1AeDCB0F9766e03f4A0` |
| CardRegistry | `0xf9EB68605c1df066fC944c28770fFF8476ADE8fc` |
| CardNFT | `0xD200776dE5A8472382F5b8b902a676E2117d7A31` |
| GameGold | `0xdB1274A736812A28b782879128f237f35fed7B81` |

### Hardhat Local

| Contract | Address |
|----------|---------|
| GameGold | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| CardNFT | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| CardRegistry | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |
| GameSession | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` |
| WalletVault | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` |
| MarbleRandoms | `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707` |

---

## View Functions Summary

| Function | Contract | Caller | Data Returned |
|----------|----------|--------|---------------|
| `getAllowedReveals(gameId)` | GameSession | Client | Number of allowed reveals |
| `getDrawHandles(gameId, count)` | GameSession | Client | Encrypted handles |
| `getVerifiedDrawOrder(gameId)` | GameSession | Server | Verified indices |
| `getRevealedCount(gameId)` | GameSession | Both | Reveal count |
| `getCurrentTurn(gameId)` | GameSession | Both | Current turn number |
| `isMarbleRevealed(marbleId)` | MarbleRandoms | Server | Boolean |
| `getVerifiedRandoms(marbleId)` | MarbleRandoms | Server | rarity/index/prismatic arrays |

---

## Transaction Summary

| Phase | TX Count | Who Sends |
|-------|----------|-----------|
| Game Creation | 1 | Client (createSinglePlayerGame) |
| Initial Hand | 1 | Client (revealDrawBatch x5) |
| Each Turn | 2 | Client (incrementTurn + revealDrawBatch) |
| Marble Draw | 1 | Client (drawRandoms) |
| Marble Reveal | 1 | Client (revealRandoms) |

**10 Turn Game Total:** 1 + 1 + (10 x 2) = 22 TX (all from client)

**Server TX Count:** 0 (only VIEW calls)
