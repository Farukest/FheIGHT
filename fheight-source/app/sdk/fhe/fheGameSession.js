'use strict';

/**
 * FHE Game Session - ZAMA FHEVM Single Player Integration
 *
 * Bu modul FLOW.MD'deki akisi implement eder:
 * - Contract sadece random index uretimi ve reveal islemlerini yonetir
 * - Oyun mantigi (board, hand, mana) server tarafinda tutulur
 * - Client kendi kartlarini kendisi hesaplar (server'a guvenmiyor)
 *
 * FLOW:
 * 1. createSinglePlayerGame(gameId) - 40 FHE.rand uret
 * 2. getDrawHandles(count) - Sifreli handle'lari al
 * 3. SDK.publicDecrypt() - KMS ile decrypt
 * 4. revealDrawBatch(indices, proof) - Verify ve kaydet
 * 5. calculateCardsFromIndices() - Client kendi kartlarini hesaplar
 */

var Promise = require('bluebird');
var Logger = require('app/common/logger');
var Wallet = require('app/common/wallet');
var SessionWalletManager = require('app/common/session_wallet');
var ethers = require('ethers');

// ============ CONTRACT ABI ============
// Otomatik olarak Hardhat artifact'tan import edilir
// npx hardhat compile sonrasi guncellenir
var GameSessionArtifact = require('../../../../fhevm-contracts/artifacts/contracts/GameSession.sol/GameSession.json');
var GAME_SESSION_ABI = GameSessionArtifact.abi;

// ============ CONSTANTS ============
var DECK_SIZE = 40;
var INITIAL_HAND_SIZE = 5;

/**
 * FHE Game Session Manager
 *
 * FLOW.MD'deki akisi yonetir:
 * - Contract ile iletisim (TX ve VIEW)
 * - Index reveal ve kart hesaplama
 * - Deck state takibi
 */
function FHEGameSession() {
  this.contract = null;
  this.contractAddress = null;
  this.gameId = null;
  this.serverGameId = null;    // Server-side game ID (Redis)
  this.blockchainGameId = null; // Blockchain game ID (same as gameId for contract)
  this.network = 'sepolia';
  this.sessionWallet = SessionWalletManager.getInstance();

  // Deck ve kart state (client-side)
  this.deck = [];              // 40 kartlik deste (server'dan gelir)
  this.remainingDeck = [];     // Kalan kartlar (cekildikce azalir)
  this.myHand = [];            // Elde olan kartlar
  this.revealedIndices = [];   // Reveal edilmis tum indexler
  this.currentTurn = 0;        // Current turn number

  // SDK instance (publicDecrypt icin)
  this._fhevmInstance = null;

  // Socket reference for server notifications (FLOW.MD)
  this._socket = null;
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
 * Contract'a baglan
 * @param {string} contractAddress - GameSession contract adresi
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
 * Baglanti kes ve state temizle
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
 * Yeni single player oyun olustur
 * FLOW Step 5: CLIENT → CONTRACT: createSinglePlayerGame(gameId)
 *
 * @param {number|string} gameId - Server'dan gelen unique game ID
 * @param {number[]} deck - 40 kartlik deste (server'dan gelir, client saklar)
 * @returns {Promise<void>}
 */
FHEGameSession.prototype.createSinglePlayerGame = function(gameId, deck) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!self.contract) {
      reject(new Error('Contract not connected'));
      return;
    }

    // Deck'i kaydet (kart hesaplamasi icin)
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

    // Session wallet ile TX gonder
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

      // NOTE: fhe_game_created event game.js showNextStepInGameSetup'da gönderiliyor
      // Çünkü bu noktada socket henüz bağlanmamış oluyor

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
 * Ilk eli cek ve reveal et (5 kart)
 * FLOW Steps 7-13: Handle al -> Decrypt -> Reveal -> Kart hesapla
 *
 * @returns {Promise<number[]>} 5 kartlik ilk el
 */
FHEGameSession.prototype.revealInitialHand = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self.gameId === null) {
      reject(new Error('Not in a game'));
      return;
    }

    Logger.module('FHE_GAME').log('=== REVEAL INITIAL HAND ===');

    // ZAMA infrastructure'ın ACL'yi index'lemesi için bekle
    // 10 saniye - ACL indexing zaman alabilir (Sepolia'da)
    Logger.module('FHE_GAME').log('Waiting for ZAMA ACL indexing (10 seconds)...');

    var waitForACL = new Promise(function(res) {
      setTimeout(res, 10000);
    });

    waitForACL
    .then(function() {
      Logger.module('FHE_GAME').log('ACL wait complete, proceeding...');
      // Step 7: getAllowedReveals kontrolu
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

        // Step 10: clearIndices sakla
        self.revealedIndices = result.clearIndices.slice();

        // Step 11: revealDrawBatch TX (pass all params from SDK response)
        return self._revealDrawBatch(
          result.clearIndices,
          result.abiEncodedClearValues,
          result.proof
        );
      })
      .then(function() {
        // Step 12: Kartlari hesapla
        self.myHand = self._calculateCards(self.revealedIndices);

        Logger.module('FHE_GAME').log('=== INITIAL HAND READY ===');
        Logger.module('FHE_GAME').log('Hand:', self.myHand);

        // FLOW Step 14: Server'a bildir ve RESPONSE BEKLE!
        // Server kartlari olusturur ve cardIndices doner - KRITIK SYNC ICIN!
        return new Promise(function(innerResolve, innerReject) {
          // Listen for server response BEFORE emitting
          self._socket.once('fhe_initial_hand_revealed_response', function(response) {
            Logger.module('FHE_GAME').log('Server response:', JSON.stringify(response));
            if (response.success && response.cardIndices) {
              Logger.module('FHE_GAME').log('Server cardIndices:', response.cardIndices);
              // Store server cardIndices for client use
              self.serverCardIndices = response.cardIndices;
              innerResolve(response.cardIndices);
            } else if (response.success) {
              // Old server without cardIndices support
              Logger.module('FHE_GAME').warn('Server did not return cardIndices - sync may fail!');
              innerResolve(null);
            } else {
              Logger.module('FHE_GAME').error('Server error:', response.error);
              innerReject(new Error(response.error || 'Server error'));
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
      })
      .then(function(serverCardIndices) {
        // Step 13: Return hand AND cardIndices to caller
        resolve({
          cardIds: self.myHand.slice(),
          cardIndices: serverCardIndices  // Server-assigned indices for sync
        });
      })
      .catch(function(error) {
        Logger.module('FHE_GAME').error('revealInitialHand failed:', error);
        reject(error);
      });
  });
};

// ============ TURN INCREMENT (FLOW Step 29) ============

/**
 * Turn'u artir
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
 * Yeni kart cek (turn sonunda)
 * FLOW Steps 31-36: Handle al -> Decrypt -> Reveal -> Kart hesapla
 *
 * @returns {Promise<number>} Cekilen kart ID'si
 */
FHEGameSession.prototype.revealDrawCard = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self.gameId === null) {
      reject(new Error('Not in a game'));
      return;
    }

    Logger.module('FHE_GAME').log('=== REVEAL DRAW CARD ===');

    // FLOW.MD Step 29: incrementTurn - allowedReveals artır
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

        // Step 33: Index sakla
        self.revealedIndices.push(result.clearIndices[0]);

        // Step 34: revealDrawBatch TX (pass all params from SDK response)
        return self._revealDrawBatch(
          result.clearIndices,
          result.abiEncodedClearValues,
          result.proof
        );
      })
      .then(function() {
        // Step 35: Karti hesapla
        var newIndex = self.revealedIndices[self.revealedIndices.length - 1];
        var pos = newIndex % self.remainingDeck.length;
        var drawnCard = self.remainingDeck[pos];

        // Remaining deck'ten cikar
        self.remainingDeck.splice(pos, 1);

        // Ele ekle
        self.myHand.push(drawnCard);

        Logger.module('FHE_GAME').log('=== CARD DRAWN ===');
        Logger.module('FHE_GAME').log('Card ID:', drawnCard);
        Logger.module('FHE_GAME').log('Hand size:', self.myHand.length);
        Logger.module('FHE_GAME').log('Deck remaining:', self.remainingDeck.length);

        // FLOW Step 37: Server'a bildir "Kart çekme tamamlandı" ve response bekle
        // Server response'unda cardIndex olacak - bunu client'ta kullanacağız
        self._socket.emit('fhe_card_drawn', {
          gameId: self.serverGameId,
          turn: self.currentTurn,
          cardId: drawnCard  // FHE-revealed card ID
        });
        Logger.module('FHE_GAME').log('Server notified: fhe_card_drawn');

        // Server response'unu bekle - cardIndex ve burned bilgisini al
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
 * Indexlerden kartlari hesapla
 * Client kendi deck'i + clearIndices ile kartlari hesaplar
 *
 * @private
 * @param {number[]} indices - Clear index'ler
 * @returns {number[]} Kart ID'leri
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

  // remainingDeck guncelle
  self.remainingDeck = remaining;

  return cards;
};

/**
 * Elden kart cikar (oynandiginda)
 * @param {number} handIndex - Eldeki kart indexi
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
 * Oyun bilgilerini al
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
 * Verified draw order al (server kullanir)
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
 * Oyunu sonlandir
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

// ============ DECRYPT (KMS) ============

/**
 * publicDecrypt - KMS ile decrypt
 * @private
 * @param {number[]|BigInt[]} handles - Sifreli handle'lar
 * @returns {Promise<{clearIndices: number[], proof: string}>}
 */
FHEGameSession.prototype._publicDecrypt = function(handles) {
  var self = this;
  var currentNetwork = Wallet.getCurrentNetwork();

  return new Promise(function(resolve, reject) {
    // Handle'lari hex string'e cevir
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

      // Mock'ta handle degerleri direkt index
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
        reject(error);
      });
  });
};

/**
 * FHEVM SDK instance al
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
 * Eldeki kartlari al
 * @returns {number[]}
 */
FHEGameSession.prototype.getHand = function() {
  return this.myHand.slice();
};

/**
 * Kalan deck boyutunu al
 * @returns {number}
 */
FHEGameSession.prototype.getRemainingDeckSize = function() {
  return this.remainingDeck.length;
};

/**
 * Game ID al
 * @returns {number|null}
 */
FHEGameSession.prototype.getGameId = function() {
  return this.gameId;
};

/**
 * Session wallet adresini al
 * @returns {string}
 */
FHEGameSession.prototype.getSessionWalletAddress = function() {
  return this.sessionWallet.getAddress();
};

/**
 * Current turn al
 * @returns {number}
 */
FHEGameSession.prototype.getCurrentTurn = function() {
  return this.currentTurn;
};

/**
 * Server game ID al
 * @returns {string|null}
 */
FHEGameSession.prototype.getServerGameId = function() {
  return this.serverGameId;
};

/**
 * Blockchain game ID al
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
