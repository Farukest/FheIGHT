'use strict';

/**
 * FHE Game Session - ZAMA FHEVM Single Player Integration
 *
 * This module implements the flow described in FLOW.MD:
 * - Contract only manages random index generation and reveal operations
 * - Game logic (board, hand, mana) is kept on server side
 * - Client calculates its own cards (doesn't trust server)
 *
 * FLOW:
 * 1. createSinglePlayerGame(gameId) - Generate 40 FHE.rand
 * 2. getDrawHandles(count) - Get encrypted handles
 * 3. SDK.publicDecrypt() - Decrypt with KMS
 * 4. revealDrawBatch(indices, proof) - Verify and store
 * 5. calculateCardsFromIndices() - Client calculates its own cards
 */

var Promise = require('bluebird');
var Logger = require('app/common/logger');
var Wallet = require('app/common/wallet');
var SessionWallet = require('app/common/session_wallet');
var ethers = require('ethers');

// ============ CONTRACT ABI ============
// Automatically imported from Hardhat artifact
// Updated after npx hardhat compile
var GameSessionArtifact = require('../../../../fhevm-contracts/artifacts/contracts/GameSession.sol/GameSession.json');
var GAME_SESSION_ABI = GameSessionArtifact.abi;

// ============ CONSTANTS ============
var DECK_SIZE = 40;
var INITIAL_HAND_SIZE = 5;

/**
 * FHE Game Session Manager
 *
 * Manages the flow described in FLOW.MD:
 * - Communication with contract (TX and VIEW)
 * - Index reveal and card calculation
 * - Deck state tracking
 */
function FHEGameSession() {
  this.contract = null;
  this.contractAddress = null;
  this.gameId = null;
  this.serverGameId = null;    // Server-side game ID (Redis)
  this.blockchainGameId = null; // Blockchain game ID (same as gameId for contract)
  this.network = 'sepolia';
  this.sessionWallet = SessionWallet;

  // Deck and card state (client-side)
  this.deck = [];              // 40-card deck (comes from server)
  this.remainingDeck = [];     // Remaining cards (decreases as cards are drawn)
  this.myHand = [];            // Cards in hand
  this.revealedIndices = [];   // All revealed indices
  this.currentTurn = 0;        // Current turn number

  // SDK instance (for publicDecrypt)
  this._fhevmInstance = null;

  // Socket reference for server notifications (FLOW.MD)
  this._socket = null;

  // Cache for retry mechanism - stores successful decrypt results
  // If server fails after blockchain success, we can retry without re-decrypt
  this._cachedInitialHandData = null;
}

// ============ SOCKET INTEGRATION ============

/**
 * Set socket for server notifications
 * Per FLOW.MD: Client must notify server after each FHE operation
 * @param {object} socket - Socket.io client instance
 */
FHEGameSession.prototype.setSocket = function(socket) {
  this._socket = socket;
  Logger.module('FHE_GAME').log('Socket set for server notifications');
};

/**
 * Set server game ID (Redis game ID)
 * @param {string} gameId - Server-side game ID
 */
FHEGameSession.prototype.setServerGameId = function(gameId) {
  this.serverGameId = gameId;
};

/**
 * Set network
 * @param {string} network - 'sepolia' or 'hardhat'
 */
FHEGameSession.prototype.setNetwork = function(network) {
  this.network = network || 'sepolia';
};

/**
 * Emit event to server (internal)
 * @private
 */
FHEGameSession.prototype._notifyServer = function(eventName, data) {
  if (this._socket) {
    this._socket.emit(eventName, data);
    Logger.module('FHE_GAME').log('Server notified:', eventName);
  } else {
    Logger.module('FHE_GAME').warn('No socket set, cannot notify server:', eventName);
  }
};

// ============ CONNECTION ============

/**
 * Connect to contract
 * @param {string} contractAddress - GameSession contract address
 * @returns {Promise<void>}
 */
FHEGameSession.prototype.connect = function(contractAddress) {
  var self = this;

  return new Promise(function(resolve, reject) {
    try {
      self.contractAddress = contractAddress;
      var readOnlyProvider = Wallet.getActiveRpcProvider();

      self.contract = new ethers.Contract(
        contractAddress,
        GAME_SESSION_ABI,
        readOnlyProvider
      );

      Logger.module('FHE_GAME').log('Connected to GameSession:', contractAddress);
      resolve();
    } catch (e) {
      Logger.module('FHE_GAME').error('Connection failed:', e);
      reject(e);
    }
  });
};

/**
 * Disconnect and clear state
 */
FHEGameSession.prototype.disconnect = function() {
  if (this.contract) {
    this.contract.removeAllListeners();
  }
  this.contract = null;
  this.contractAddress = null;
  this.gameId = null;
  this.serverGameId = null;
  this.blockchainGameId = null;
  this.deck = [];
  this.remainingDeck = [];
  this.myHand = [];
  this.revealedIndices = [];
  this.currentTurn = 0;
  // Keep socket and network for potential reconnection
};

// ============ GAME CREATION (FLOW Step 5) ============

/**
 * Create new single player game
 * FLOW Step 5: CLIENT → CONTRACT: createSinglePlayerGame(gameId)
 *
 * @param {number|string} gameId - Unique game ID from server
 * @param {number[]} deck - 40-card deck (comes from server, client stores)
 * @returns {Promise<void>}
 */
FHEGameSession.prototype.createSinglePlayerGame = function(gameId, deck) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!self.contract) {
      reject(new Error('Contract not connected'));
      return;
    }

    // Save deck (for card calculation)
    self.deck = deck.slice();
    self.remainingDeck = deck.slice();
    self.myHand = [];
    self.revealedIndices = [];
    self.gameId = gameId;

    Logger.module('FHE_GAME').log('Creating single player game:', gameId);
    Logger.module('FHE_GAME').log('Deck size:', deck.length);

    // TX encode
    var iface = new ethers.utils.Interface(GAME_SESSION_ABI);
    var data = iface.encodeFunctionData('createSinglePlayerGame', [gameId]);

    // Send TX with session wallet
    self.sessionWallet.signTransaction({
      to: self.contractAddress,
      data: data,
      gasLimit: '0x7A1200' // 8M gas (40x FHE.rand)
    })
    .then(function(txResponse) {
      Logger.module('FHE_GAME').log('TX sent:', txResponse.hash);
      return txResponse.wait();
    })
    .then(function(receipt) {
      if (receipt.status === 0) {
        throw new Error('Transaction reverted');
      }

      Logger.module('FHE_GAME').log('Game created successfully');
      Logger.module('FHE_GAME').log('40 FHE.rand indices generated in contract');

      // Store blockchain gameId
      self.blockchainGameId = gameId;

      // NOTE: fhe_game_created event is sent in game.js showNextStepInGameSetup
      // Because at this point the socket is not yet connected

      // IMPORTANT: Return the gameId so caller can use it!
      resolve(self.gameId);
    })
    .catch(function(error) {
      Logger.module('FHE_GAME').error('createSinglePlayerGame failed:', error);
      reject(error);
    });
  });
};

// ============ INITIAL HAND (FLOW Steps 7-13) ============

/**
 * Draw and reveal initial hand (5 cards)
 * FLOW Steps 7-13: Get handle -> Decrypt -> Reveal -> Calculate cards
 *
 * If blockchain operations were successful but server failed,
 * use retryNotifyServer() instead to avoid "Exceeds allowed reveals" error.
 *
 * @returns {Promise<number[]>} Initial hand of 5 cards
 */
FHEGameSession.prototype.revealInitialHand = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self.gameId === null) {
      reject(new Error('Not in a game'));
      return;
    }

    // CHECK: If we have cached data, use retryNotifyServer instead
    if (self._cachedInitialHandData) {
      Logger.module('FHE_GAME').log('=== REVEAL INITIAL HAND (USING CACHE) ===');
      Logger.module('FHE_GAME').log('Cached hand found, skipping blockchain operations');
      self.retryNotifyServer()
        .then(resolve)
        .catch(reject);
      return;
    }

    Logger.module('FHE_GAME').log('=== REVEAL INITIAL HAND ===');

    // Wait for ZAMA infrastructure to index ACL
    // 10 seconds - ACL indexing can take time (on Sepolia)
    Logger.module('FHE_GAME').log('Waiting for ZAMA ACL indexing (10 seconds)...');

    var waitForACL = new Promise(function(res) {
      setTimeout(res, 10000);
    });

    waitForACL
    .then(function() {
      Logger.module('FHE_GAME').log('ACL wait complete, proceeding...');
      // Step 7: Check getAllowedReveals
      return self._getAllowedReveals();
    })
      .then(function(allowed) {
        Logger.module('FHE_GAME').log('Allowed reveals:', allowed);

        if (allowed < INITIAL_HAND_SIZE) {
          throw new Error('Not enough allowed reveals');
        }

        // Step 8: getDrawHandles(5)
        return self._getDrawHandles(INITIAL_HAND_SIZE);
      })
      .then(function(handles) {
        Logger.module('FHE_GAME').log('Got', handles.length, 'handles');

        // Step 9: publicDecrypt
        return self._publicDecrypt(handles);
      })
      .then(function(result) {
        Logger.module('FHE_GAME').log('Decrypted indices:', result.clearIndices);

        // Step 10: Store clearIndices
        self.revealedIndices = result.clearIndices.slice();

        // Step 11: revealDrawBatch TX (pass all params from SDK response)
        return self._revealDrawBatch(
          result.clearIndices,
          result.abiEncodedClearValues,
          result.proof
        );
      })
      .then(function() {
        // Step 12: Calculate cards
        self.myHand = self._calculateCards(self.revealedIndices);

        Logger.module('FHE_GAME').log('=== INITIAL HAND READY ===');
        Logger.module('FHE_GAME').log('Hand:', self.myHand);

        // CACHE: Save successful blockchain result for retry
        self._cachedInitialHandData = {
          hand: self.myHand.slice(),
          revealedIndices: self.revealedIndices.slice()
        };
        Logger.module('FHE_GAME').log('Cached hand data for potential retry');

        // FLOW Step 14: Notify server and WAIT FOR RESPONSE!
        return self._notifyServerInitialHand();
      })
      .then(function(serverCardIndices) {
        // Success - clear cache since we don't need retry anymore
        self._cachedInitialHandData = null;

        // Step 13: Return hand AND cardIndices to caller
        resolve({
          cardIds: self.myHand.slice(),
          cardIndices: serverCardIndices  // Server-assigned indices for sync
        });
      })
      .catch(function(error) {
        Logger.module('FHE_GAME').error('revealInitialHand failed:', error);
        // DON'T clear cache on error - we may need to retry
        reject(error);
      });
  });
};

/**
 * Notify server about initial hand (internal helper)
 * @private
 * @returns {Promise<Array>} Server card indices
 */
FHEGameSession.prototype._notifyServerInitialHand = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    // Listen for server response BEFORE emitting
    self._socket.once('fhe_initial_hand_revealed_response', function(response) {
      Logger.module('FHE_GAME').log('Server response:', JSON.stringify(response));
      if (response.success && response.cardIndices) {
        Logger.module('FHE_GAME').log('Server cardIndices:', response.cardIndices);
        // Store server cardIndices for client use
        self.serverCardIndices = response.cardIndices;
        resolve(response.cardIndices);
      } else if (response.success) {
        // Old server without cardIndices support
        Logger.module('FHE_GAME').warn('Server did not return cardIndices - sync may fail!');
        resolve(null);
      } else {
        Logger.module('FHE_GAME').error('Server error:', response.error);
        reject(new Error(response.error || 'Server error'));
      }
    });

    // Now emit to server
    self._socket.emit('fhe_initial_hand_revealed', {
      gameId: self.serverGameId,
      blockchainGameId: self.gameId,
      hand: self.myHand,
      revealedIndices: self.revealedIndices.slice()
    });
    Logger.module('FHE_GAME').log('Server notified: fhe_initial_hand_revealed');
  });
};

/**
 * Retry notifying server with cached hand data
 * Use this when blockchain succeeded but server failed
 * This avoids "Exceeds allowed reveals" error on retry
 *
 * @returns {Promise<Object>} Hand data with cardIds and cardIndices
 */
FHEGameSession.prototype.retryNotifyServer = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!self._cachedInitialHandData) {
      reject(new Error('No cached hand data - must call revealInitialHand first'));
      return;
    }

    Logger.module('FHE_GAME').log('=== RETRY NOTIFY SERVER (CACHED) ===');
    Logger.module('FHE_GAME').log('Using cached hand:', self._cachedInitialHandData.hand);

    // Restore from cache
    self.myHand = self._cachedInitialHandData.hand.slice();
    self.revealedIndices = self._cachedInitialHandData.revealedIndices.slice();

    self._notifyServerInitialHand()
      .then(function(serverCardIndices) {
        // Success - clear cache
        self._cachedInitialHandData = null;
        Logger.module('FHE_GAME').log('Retry successful, cache cleared');

        resolve({
          cardIds: self.myHand.slice(),
          cardIndices: serverCardIndices
        });
      })
      .catch(function(error) {
        Logger.module('FHE_GAME').error('Retry notify server failed:', error);
        // Keep cache for another retry
        reject(error);
      });
  });
};

/**
 * Check if we have cached hand data for retry
 * @returns {boolean} True if cached data exists
 */
FHEGameSession.prototype.hasCachedHandData = function() {
  return this._cachedInitialHandData !== null;
};

/**
 * Clear cached hand data (use when starting new game)
 */
FHEGameSession.prototype.clearCachedHandData = function() {
  this._cachedInitialHandData = null;
};

// ============ TURN INCREMENT (FLOW Step 29) ============

/**
 * Increment turn
 * FLOW Step 29: CLIENT → CONTRACT: incrementTurn(gameId)
 *
 * @returns {Promise<void>}
 */
FHEGameSession.prototype.incrementTurn = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self.gameId === null) {
      reject(new Error('Not in a game'));
      return;
    }

    Logger.module('FHE_GAME').log('Incrementing turn...');

    var iface = new ethers.utils.Interface(GAME_SESSION_ABI);
    var data = iface.encodeFunctionData('incrementTurn', [self.gameId]);

    self.sessionWallet.signTransaction({
      to: self.contractAddress,
      data: data,
      gasLimit: '0x100000'
    })
    .then(function(txResponse) {
      Logger.module('FHE_GAME').log('incrementTurn TX sent:', txResponse.hash);
      return txResponse.wait();
    })
    .then(function(receipt) {
      if (receipt.status === 0) {
        throw new Error('incrementTurn reverted - complete reveals first');
      }

      // Track current turn
      self.currentTurn++;
      Logger.module('FHE_GAME').log('Turn incremented to:', self.currentTurn);
      resolve();
    })
    .catch(function(error) {
      Logger.module('FHE_GAME').error('incrementTurn failed:', error);
      reject(error);
    });
  });
};

// ============ DRAW CARD (FLOW Steps 31-36) ============

/**
 * Draw new card (at end of turn)
 * FLOW Steps 31-36: Get handle -> Decrypt -> Reveal -> Calculate card
 *
 * @returns {Promise<number>} Drawn card ID
 */
FHEGameSession.prototype.revealDrawCard = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self.gameId === null) {
      reject(new Error('Not in a game'));
      return;
    }

    Logger.module('FHE_GAME').log('=== REVEAL DRAW CARD ===');

    // FLOW.MD Step 29: incrementTurn - increase allowedReveals
    self.incrementTurn()
      .then(function() {
        // Step 31: getDrawHandles(1)
        return self._getDrawHandles(1);
      })
      .then(function(handles) {
        Logger.module('FHE_GAME').log('Got handle for new card');

        // Step 32: publicDecrypt
        return self._publicDecrypt(handles);
      })
      .then(function(result) {
        Logger.module('FHE_GAME').log('Decrypted index:', result.clearIndices[0]);

        // Step 33: Store index
        self.revealedIndices.push(result.clearIndices[0]);

        // Step 34: revealDrawBatch TX (pass all params from SDK response)
        return self._revealDrawBatch(
          result.clearIndices,
          result.abiEncodedClearValues,
          result.proof
        );
      })
      .then(function() {
        // Step 35: Calculate card
        var newIndex = self.revealedIndices[self.revealedIndices.length - 1];
        var pos = newIndex % self.remainingDeck.length;
        var drawnCard = self.remainingDeck[pos];

        // Remove from remaining deck
        self.remainingDeck.splice(pos, 1);

        // Add to hand
        self.myHand.push(drawnCard);

        Logger.module('FHE_GAME').log('=== CARD DRAWN ===');
        Logger.module('FHE_GAME').log('Card ID:', drawnCard);
        Logger.module('FHE_GAME').log('Hand size:', self.myHand.length);
        Logger.module('FHE_GAME').log('Deck remaining:', self.remainingDeck.length);

        // FLOW Step 37: Notify server "Card draw completed" and wait for response
        // Server response will have cardIndex - we'll use it on client
        self._socket.emit('fhe_card_drawn', {
          gameId: self.serverGameId,
          turn: self.currentTurn,
          cardId: drawnCard  // FHE-revealed card ID
        });
        Logger.module('FHE_GAME').log('Server notified: fhe_card_drawn');

        // Wait for server response - get cardIndex and burned info
        self._socket.once('fhe_card_drawn_response', function(response) {
          Logger.module('FHE_GAME').log('Server response:', JSON.stringify(response));
          if (response.success) {
            // Return cardId, cardIndex, and burned flag from server
            resolve({
              cardId: drawnCard,
              cardIndex: response.cardIndex || null,
              burned: response.burned || false  // True if hand was full
            });
          } else {
            // Fallback: just return cardId (old behavior)
            resolve({ cardId: drawnCard, cardIndex: null, burned: false });
          }
        });
      })
      .catch(function(error) {
        Logger.module('FHE_GAME').error('revealDrawCard failed:', error);
        reject(error);
      });
  });
};

// ============ CARD CALCULATION (FLOW Step 12, 35) ============

/**
 * Calculate cards from indices
 * Client calculates cards using its own deck + clearIndices
 *
 * @private
 * @param {number[]} indices - Clear indices
 * @returns {number[]} Card IDs
 */
FHEGameSession.prototype._calculateCards = function(indices) {
  var self = this;
  var cards = [];
  var remaining = self.deck.slice();

  for (var i = 0; i < indices.length; i++) {
    var idx = indices[i];
    var pos = idx % remaining.length;
    cards.push(remaining[pos]);
    remaining.splice(pos, 1);
  }

  // Update remainingDeck
  self.remainingDeck = remaining;

  return cards;
};

/**
 * Remove card from hand (when played)
 * @param {number} handIndex - Card index in hand
 */
FHEGameSession.prototype.removeCardFromHand = function(handIndex) {
  if (handIndex >= 0 && handIndex < this.myHand.length) {
    this.myHand.splice(handIndex, 1);
    Logger.module('FHE_GAME').log('Card removed from hand, new size:', this.myHand.length);
  }
};

// ============ VIEW FUNCTIONS ============

/**
 * getAllowedReveals view call
 * @private
 */
FHEGameSession.prototype._getAllowedReveals = function() {
  return this.contract.getAllowedReveals(this.gameId);
};

/**
 * getDrawHandles view call
 * @private
 */
FHEGameSession.prototype._getDrawHandles = function(count) {
  return this.contract.getDrawHandles(this.gameId, count);
};

/**
 * Get game info
 * @returns {Promise<object>}
 */
FHEGameSession.prototype.getGameInfo = function() {
  var self = this;

  return this.contract.getGameInfo(this.gameId)
    .then(function(result) {
      return {
        player: result.player,
        currentTurn: result.currentTurn,
        revealedCount: result.revealedCount,
        allowedReveals: result.allowedReveals,
        isActive: result.isActive
      };
    });
};

/**
 * Get verified draw order (used by server)
 * @returns {Promise<number[]>}
 */
FHEGameSession.prototype.getVerifiedDrawOrder = function() {
  return this.contract.getVerifiedDrawOrder(this.gameId);
};

// ============ TX FUNCTIONS ============

/**
 * revealDrawBatch TX
 * @private
 * @param {number[]} clearIndices - Decrypted index values
 * @param {string} abiEncodedClearValues - ABI-encoded clear values from SDK
 * @param {string} decryptionProof - KMS decryption proof
 */
FHEGameSession.prototype._revealDrawBatch = function(clearIndices, abiEncodedClearValues, decryptionProof) {
  var self = this;

  var iface = new ethers.utils.Interface(GAME_SESSION_ABI);
  var data = iface.encodeFunctionData('revealDrawBatch', [
    self.gameId,
    clearIndices,
    abiEncodedClearValues || '0x',
    decryptionProof || '0x'
  ]);

  return self.sessionWallet.signTransaction({
    to: self.contractAddress,
    data: data,
    gasLimit: '0x200000'
  })
  .then(function(txResponse) {
    Logger.module('FHE_GAME').log('revealDrawBatch TX sent:', txResponse.hash);
    return txResponse.wait();
  })
  .then(function(receipt) {
    if (receipt.status === 0) {
      throw new Error('revealDrawBatch reverted');
    }
    Logger.module('FHE_GAME').log('Reveal confirmed');
    return receipt;
  });
};

/**
 * End game
 * @returns {Promise<void>}
 */
FHEGameSession.prototype.endGame = function() {
  var self = this;

  var iface = new ethers.utils.Interface(GAME_SESSION_ABI);
  var data = iface.encodeFunctionData('endGame', [self.gameId]);

  return self.sessionWallet.signTransaction({
    to: self.contractAddress,
    data: data,
    gasLimit: '0x100000'
  })
  .then(function(txResponse) {
    return txResponse.wait();
  })
  .then(function(receipt) {
    Logger.module('FHE_GAME').log('Game ended');
    self.disconnect();
  });
};

/**
 * Complete mulligan phase for multiplayer FHE
 * @param {boolean[]} mulliganSlots - Array of 5 booleans, true = replace this card
 * @returns {Promise<void>}
 */
FHEGameSession.prototype.completeMulligan = function(mulliganSlots) {
  var self = this;
  Logger.module('FHE_GAME').log('completeMulligan called with slots:', mulliganSlots);

  // For now, multiplayer FHE uses same reveal flow as single player
  // Contract doesn't have separate mulligan - it's handled by additional reveals
  // Just mark mulligan as complete and return
  return new Promise(function(resolve) {
    Logger.module('FHE_GAME').log('Mulligan phase complete (no contract call needed - handled by reveal flow)');
    resolve();
  });
};

// ============ DECRYPT (KMS) ============

/**
 * publicDecrypt - Decrypt with KMS
 * @private
 * @param {number[]|BigInt[]} handles - Encrypted handles
 * @returns {Promise<{clearIndices: number[], proof: string}>}
 */
FHEGameSession.prototype._publicDecrypt = function(handles) {
  var self = this;
  var currentNetwork = Wallet.getCurrentNetwork();

  return new Promise(function(resolve, reject) {
    // Convert handles to hex string
    var handleStrings = handles.map(function(h, idx) {
      var result;
      if (typeof h === 'bigint') {
        result = '0x' + h.toString(16).padStart(64, '0');
      } else if (h._hex) {
        result = h._hex;
      } else if (typeof h === 'number') {
        result = '0x' + h.toString(16).padStart(64, '0');
      } else {
        result = h.toString();
      }
      Logger.module('FHE_GAME').log('[DEBUG] Handle[' + idx + '] type=' + typeof h + ' raw=' + h + ' converted=' + result);
      return result;
    });

    Logger.module('FHE_GAME').log('[DEBUG] All handleStrings:', handleStrings);

    // Mock mode (Hardhat/localhost)
    if (currentNetwork === 'hardhat' || currentNetwork === 'localhost') {
      Logger.module('FHE_GAME').log('[MOCK] Using mock decrypt');

      // In mock mode, handle values are direct indices
      var clearIndices = handles.map(function(h) {
        if (typeof h === 'bigint') return Number(h) % 256;
        if (typeof h === 'number') return h % 256;
        if (h._hex) return parseInt(h._hex, 16) % 256;
        return parseInt(h.toString(), 10) % 256;
      });

      resolve({
        clearIndices: clearIndices,
        proof: '0x'
      });
      return;
    }

    // Real mode - SDK publicDecrypt
    self._getFhevmInstance()
      .then(function(instance) {
        Logger.module('FHE_GAME').log('[KMS] Calling publicDecrypt with handles:', handleStrings);
        return instance.publicDecrypt(handleStrings);
      })
      .then(function(result) {
        Logger.module('FHE_GAME').log('[KMS] publicDecrypt response:', result);

        // SDK returns clearValues as an OBJECT (map), not array!
        // Format: { '0xhandle1': value1, '0xhandle2': value2, ... }
        var clearIndices = handleStrings.map(function(h) {
          var value = result.clearValues[h];
          Logger.module('FHE_GAME').log('[KMS] Handle', h, '-> clear value:', value);
          // Value could be bigint or number
          if (typeof value === 'bigint') {
            // Can't use 256n literal in browserify, use BigInt(256)
            return Number(value % BigInt(256));
          }
          return Number(value) % 256;
        });

        Logger.module('FHE_GAME').log('[KMS] Decrypt success, clearIndices:', clearIndices);
        resolve({
          clearIndices: clearIndices,
          abiEncodedClearValues: result.abiEncodedClearValues || '0x',
          proof: result.decryptionProof || '0x'
        });
      })
      .catch(function(error) {
        Logger.module('FHE_GAME').error('[KMS] Decrypt failed:', error);

        // Check for 500 error specifically (Gateway not ready)
        var is500Error = false;
        if (error && error.message) {
          // Check error message for 500 status
          if (error.message.indexOf('500') !== -1 ||
              error.message.indexOf('Internal Server Error') !== -1 ||
              error.message.indexOf('Gateway') !== -1) {
            is500Error = true;
          }
        }
        if (error && error.status === 500) {
          is500Error = true;
        }
        if (error && error.response && error.response.status === 500) {
          is500Error = true;
        }

        // Create a typed error for UI handling
        var typedError = new Error(error.message || 'Decrypt failed');
        typedError.is500Error = is500Error;
        typedError.originalError = error;
        reject(typedError);
      });
  });
};

/**
 * Get FHEVM SDK instance
 * @private
 */
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

// ============ GETTERS ============

/**
 * Get cards in hand
 * @returns {number[]}
 */
FHEGameSession.prototype.getHand = function() {
  return this.myHand.slice();
};

/**
 * Get remaining deck size
 * @returns {number}
 */
FHEGameSession.prototype.getRemainingDeckSize = function() {
  return this.remainingDeck.length;
};

/**
 * Get Game ID
 * @returns {number|null}
 */
FHEGameSession.prototype.getGameId = function() {
  return this.gameId;
};

/**
 * Get session wallet address
 * @returns {string}
 */
FHEGameSession.prototype.getSessionWalletAddress = function() {
  return this.sessionWallet.getAddress();
};

/**
 * Get current turn
 * @returns {number}
 */
FHEGameSession.prototype.getCurrentTurn = function() {
  return this.currentTurn;
};

/**
 * Get server game ID
 * @returns {string|null}
 */
FHEGameSession.prototype.getServerGameId = function() {
  return this.serverGameId;
};

/**
 * Get blockchain game ID
 * @returns {number|null}
 */
FHEGameSession.prototype.getBlockchainGameId = function() {
  return this.blockchainGameId;
};

// ============ SINGLETON ============

var instance = null;

module.exports = {
  getInstance: function() {
    if (!instance) {
      instance = new FHEGameSession();
    }
    return instance;
  },

  // Export for testing
  GAME_SESSION_ABI: GAME_SESSION_ABI,
  DECK_SIZE: DECK_SIZE,
  INITIAL_HAND_SIZE: INITIAL_HAND_SIZE
};
