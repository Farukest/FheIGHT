'use strict';

/**
 * FHE Marble Session - ZAMA FHEVM Morphic Marbles (Booster Pack) Integration
 *
 * Bu modul FLOW-MARBLES.MD'deki akisi implement eder:
 * - Contract 15 encrypted random uretir (5 kart x 3 random)
 * - Client decrypt edip reveal eder
 * - Server contracttan verify edip kartlari DB'ye yazar
 *
 * FLOW:
 * 1. drawRandoms(marbleId, cardSetId) - 15 FHE.rand uret
 * 2. getRandomHandles(marbleId) - Sifreli handle'lari al
 * 3. SDK.publicDecrypt() - KMS ile decrypt
 * 4. revealRandoms(marbleId, clearValues, proof) - Verify ve kaydet
 * 5. Server getVerifiedRandoms() - Contract'tan oku, kartlari hesapla
 */

var Promise = require('bluebird');
var Logger = require('app/common/logger');
var Wallet = require('app/common/wallet');
var SessionWallet = require('app/common/session_wallet');
var ethers = require('ethers');

// ============ CONTRACT ABI ============
var MarbleRandomsArtifact = require('../../../../fhevm-contracts/artifacts/contracts/MarbleRandoms.sol/MarbleRandoms.json');
var MARBLE_RANDOMS_ABI = MarbleRandomsArtifact.abi;

// ============ CONSTANTS ============
var CARDS_PER_MARBLE = 5;
var RANDOMS_PER_CARD = 3; // rarity, index, prismatic
var TOTAL_RANDOMS = 15;   // 5 * 3

/**
 * FHE Marble Session Manager
 *
 * Marble acma islemlerini yonetir:
 * - Contract ile iletisim (TX ve VIEW)
 * - Random reveal ve KMS decrypt
 * - Server bildirim
 */
function FHEMarbleSession() {
  this.contract = null;
  this.contractAddress = null;
  this.marbleId = null;
  this.boosterPackId = null;  // Server-side booster pack ID (for API call)
  this.network = 'sepolia';
  this.sessionWallet = SessionWallet;

  // SDK instance (publicDecrypt icin)
  this._fhevmInstance = null;

  // Socket reference for server notifications (deprecated, using API now)
  this._socket = null;

  // Cache for retry mechanism
  this._cachedRevealData = null;
}

// ============ SOCKET INTEGRATION ============

/**
 * Set socket for server notifications
 * @param {object} socket - Socket.io client instance
 */
FHEMarbleSession.prototype.setSocket = function(socket) {
  this._socket = socket;
  Logger.module('FHE_MARBLE').log('Socket set for server notifications');
};

/**
 * Set network
 * @param {string} network - 'sepolia' or 'hardhat'
 */
FHEMarbleSession.prototype.setNetwork = function(network) {
  this.network = network || 'sepolia';
};

// ============ CONNECTION ============

/**
 * Contract'a baglan
 * @param {string} contractAddress - MarbleRandoms contract adresi
 * @returns {Promise<void>}
 */
FHEMarbleSession.prototype.connect = function(contractAddress) {
  var self = this;

  return new Promise(function(resolve, reject) {
    try {
      self.contractAddress = contractAddress;
      var readOnlyProvider = Wallet.getActiveRpcProvider();

      self.contract = new ethers.Contract(
        contractAddress,
        MARBLE_RANDOMS_ABI,
        readOnlyProvider
      );

      Logger.module('FHE_MARBLE').log('Connected to MarbleRandoms:', contractAddress);
      resolve();
    } catch (e) {
      Logger.module('FHE_MARBLE').error('Connection failed:', e);
      reject(e);
    }
  });
};

/**
 * Baglanti kes ve state temizle
 */
FHEMarbleSession.prototype.disconnect = function() {
  if (this.contract) {
    this.contract.removeAllListeners();
  }
  this.contract = null;
  this.contractAddress = null;
  this.marbleId = null;
  this.boosterPackId = null;
  this._cachedRevealData = null;
};

/**
 * Set booster pack ID for API call
 * @param {string} packId - Server-side booster pack ID
 */
FHEMarbleSession.prototype.setBoosterPackId = function(packId) {
  this.boosterPackId = packId;
  Logger.module('FHE_MARBLE').log('Booster pack ID set:', packId);
};

/**
 * Get booster pack ID
 * @returns {string|null}
 */
FHEMarbleSession.prototype.getBoosterPackId = function() {
  return this.boosterPackId;
};

// ============ MARBLE OPENING FLOW ============

/**
 * Marble acma basla - 15 encrypted random uret
 * FLOW Step 1: CLIENT → CONTRACT: drawRandoms(marbleId, cardSetId)
 *
 * @param {string} marbleId - Unique marble ID (bytes32 hex string)
 * @param {number} cardSetId - Card set ID (Core=1, Shimzar=2, etc.)
 * @returns {Promise<string>} marbleId
 */
FHEMarbleSession.prototype.drawRandoms = function(marbleId, cardSetId) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!self.contract) {
      reject(new Error('Contract not connected'));
      return;
    }

    self.marbleId = marbleId;

    Logger.module('FHE_MARBLE').log('Drawing randoms for marble:', marbleId);
    Logger.module('FHE_MARBLE').log('Card set ID:', cardSetId);

    // TX encode
    var iface = new ethers.utils.Interface(MARBLE_RANDOMS_ABI);
    var data = iface.encodeFunctionData('drawRandoms', [marbleId, cardSetId]);

    // Session wallet ile TX gonder
    self.sessionWallet.signTransaction({
      to: self.contractAddress,
      data: data,
      gasLimit: '0x7A1200' // 8M gas (15x FHE.rand)
    })
    .then(function(txResponse) {
      Logger.module('FHE_MARBLE').log('TX sent:', txResponse.hash);
      return txResponse.wait();
    })
    .then(function(receipt) {
      if (receipt.status === 0) {
        throw new Error('Transaction reverted');
      }

      Logger.module('FHE_MARBLE').log('Randoms generated successfully');
      Logger.module('FHE_MARBLE').log('15 FHE.rand values generated in contract');

      resolve(self.marbleId);
    })
    .catch(function(error) {
      Logger.module('FHE_MARBLE').error('drawRandoms failed:', error);
      reject(error);
    });
  });
};

/**
 * Random'lari decrypt ve reveal et
 * FLOW Steps 2-4: Handle al -> Decrypt -> Reveal
 *
 * @returns {Promise<object>} { rarity: uint8[5], index: uint8[5], prismatic: uint8[5] }
 */
FHEMarbleSession.prototype.revealRandoms = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self.marbleId === null) {
      reject(new Error('No marble session'));
      return;
    }

    // CHECK: If we have cached data, use it instead of re-decrypting
    if (self._cachedRevealData) {
      Logger.module('FHE_MARBLE').log('=== REVEAL RANDOMS (USING CACHE) ===');
      self._notifyServerMarbleRevealed(self._cachedRevealData)
        .then(resolve)
        .catch(reject);
      return;
    }

    Logger.module('FHE_MARBLE').log('=== REVEAL RANDOMS ===');

    // ZAMA infrastructure'ın ACL'yi index'lemesi için bekle
    Logger.module('FHE_MARBLE').log('Waiting for ZAMA ACL indexing (10 seconds)...');

    var waitForACL = new Promise(function(res) {
      setTimeout(res, 10000);
    });

    var clearValues = null;
    var abiEncodedClearValues = null;
    var decryptionProof = null;

    waitForACL
    .then(function() {
      Logger.module('FHE_MARBLE').log('ACL wait complete, proceeding...');
      // Step 2: getRandomHandles
      return self._getRandomHandles();
    })
    .then(function(handles) {
      Logger.module('FHE_MARBLE').log('Got', handles.length, 'handles');

      // Step 3: publicDecrypt
      return self._publicDecrypt(handles);
    })
    .then(function(result) {
      Logger.module('FHE_MARBLE').log('Decrypted values count:', result.clearValues.length);

      clearValues = result.clearValues;
      abiEncodedClearValues = result.abiEncodedClearValues;
      decryptionProof = result.proof;

      // Step 4: revealRandoms TX
      return self._revealRandomsTx(
        clearValues,
        abiEncodedClearValues,
        decryptionProof
      );
    })
    .then(function() {
      // Parse revealed values
      var revealed = {
        rarity: clearValues.slice(0, 5),
        index: clearValues.slice(5, 10),
        prismatic: clearValues.slice(10, 15)
      };

      Logger.module('FHE_MARBLE').log('=== RANDOMS REVEALED ===');
      Logger.module('FHE_MARBLE').log('Rarity:', revealed.rarity);
      Logger.module('FHE_MARBLE').log('Index:', revealed.index);
      Logger.module('FHE_MARBLE').log('Prismatic:', revealed.prismatic);

      // Cache for retry
      self._cachedRevealData = revealed;
      Logger.module('FHE_MARBLE').log('Cached reveal data for potential retry');

      // Notify server
      return self._notifyServerMarbleRevealed(revealed);
    })
    .then(function(serverCards) {
      // Success - clear cache
      self._cachedRevealData = null;

      resolve(serverCards);
    })
    .catch(function(error) {
      Logger.module('FHE_MARBLE').error('revealRandoms failed:', error);
      // DON'T clear cache on error - we may need to retry
      reject(error);
    });
  });
};

/**
 * Notify server about marble reveal via API
 * @private
 * @returns {Promise<object>} Server response with cards
 */
FHEMarbleSession.prototype._notifyServerMarbleRevealed = function(revealed) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!self.boosterPackId) {
      reject(new Error('Booster pack ID not set'));
      return;
    }

    // Use API call instead of socket
    var Manager = require('app/ui/managers/manager');
    var url = process.env.API_URL + '/api/me/inventory/spirit_orbs/fhe_opened/' + self.boosterPackId;

    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + Manager.getInstance().getSession().token
      },
      body: JSON.stringify({
        marble_id: self.marbleId
      })
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      Logger.module('FHE_MARBLE').log('Server response:', JSON.stringify(data));
      if (data.cards) {
        Logger.module('FHE_MARBLE').log('Server returned cards:', data.cards.length);
        resolve({
          cards: data.cards,
          rarity: revealed.rarity,
          index: revealed.index,
          prismatic: revealed.prismatic
        });
      } else {
        Logger.module('FHE_MARBLE').error('Server error: no cards in response');
        reject(new Error('No cards in response'));
      }
    })
    .catch(function(error) {
      Logger.module('FHE_MARBLE').error('API call failed:', error);
      reject(error);
    });
  });
};

/**
 * Check if we have cached reveal data for retry
 * @returns {boolean} True if cached data exists
 */
FHEMarbleSession.prototype.hasCachedRevealData = function() {
  return this._cachedRevealData !== null;
};

/**
 * Clear cached reveal data
 */
FHEMarbleSession.prototype.clearCachedRevealData = function() {
  this._cachedRevealData = null;
};

// ============ VIEW FUNCTIONS ============

/**
 * getRandomHandles view call
 * @private
 * @returns {Promise<bytes32[15]>}
 */
FHEMarbleSession.prototype._getRandomHandles = function() {
  return this.contract.getRandomHandles(this.marbleId);
};

/**
 * Get marble info
 * @returns {Promise<object>}
 */
FHEMarbleSession.prototype.getMarbleInfo = function() {
  var self = this;

  return this.contract.getMarbleInfo(this.marbleId)
    .then(function(result) {
      return {
        owner: result.owner,
        cardSetId: result.cardSetId,
        isDrawn: result.isDrawn,
        isRevealed: result.isRevealed,
        createdAt: result.createdAt
      };
    });
};

/**
 * Check if marble is drawn
 * @returns {Promise<boolean>}
 */
FHEMarbleSession.prototype.isMarbleDrawn = function() {
  return this.contract.isMarbleDrawn(this.marbleId);
};

/**
 * Check if marble is revealed
 * @returns {Promise<boolean>}
 */
FHEMarbleSession.prototype.isMarbleRevealed = function() {
  return this.contract.isMarbleRevealed(this.marbleId);
};

// ============ TX FUNCTIONS ============

/**
 * revealRandoms TX
 * @private
 * @param {number[]} clearValues - Decrypted values (15 uint8s)
 * @param {string} abiEncodedClearValues - ABI-encoded clear values from SDK
 * @param {string} decryptionProof - KMS decryption proof
 */
FHEMarbleSession.prototype._revealRandomsTx = function(clearValues, abiEncodedClearValues, decryptionProof) {
  var self = this;

  var iface = new ethers.utils.Interface(MARBLE_RANDOMS_ABI);
  var data = iface.encodeFunctionData('revealRandoms', [
    self.marbleId,
    clearValues,
    abiEncodedClearValues || '0x',
    decryptionProof || '0x'
  ]);

  return self.sessionWallet.signTransaction({
    to: self.contractAddress,
    data: data,
    gasLimit: '0x200000'
  })
  .then(function(txResponse) {
    Logger.module('FHE_MARBLE').log('revealRandoms TX sent:', txResponse.hash);
    return txResponse.wait();
  })
  .then(function(receipt) {
    if (receipt.status === 0) {
      throw new Error('revealRandoms reverted');
    }
    Logger.module('FHE_MARBLE').log('Reveal confirmed');
    return receipt;
  });
};

// ============ DECRYPT (KMS) ============

/**
 * publicDecrypt - KMS ile decrypt
 * @private
 * @param {bytes32[]} handles - Sifreli handle'lar (15 adet)
 * @returns {Promise<{clearValues: number[], proof: string}>}
 */
FHEMarbleSession.prototype._publicDecrypt = function(handles) {
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
      Logger.module('FHE_MARBLE').log('[DEBUG] Handle[' + idx + '] converted=' + result);
      return result;
    });

    // Mock mode (Hardhat/localhost)
    if (currentNetwork === 'hardhat' || currentNetwork === 'localhost') {
      Logger.module('FHE_MARBLE').log('[MOCK] Using mock decrypt');

      var clearValues = handles.map(function(h) {
        if (typeof h === 'bigint') return Number(h) % 256;
        if (typeof h === 'number') return h % 256;
        if (h._hex) return parseInt(h._hex, 16) % 256;
        return parseInt(h.toString(), 10) % 256;
      });

      resolve({
        clearValues: clearValues,
        proof: '0x'
      });
      return;
    }

    // Real mode - SDK publicDecrypt
    self._getFhevmInstance()
      .then(function(instance) {
        Logger.module('FHE_MARBLE').log('[KMS] Calling publicDecrypt with handles');
        return instance.publicDecrypt(handleStrings);
      })
      .then(function(result) {
        Logger.module('FHE_MARBLE').log('[KMS] publicDecrypt response received');

        // SDK returns clearValues as an OBJECT (map), not array!
        var clearValues = handleStrings.map(function(h) {
          var value = result.clearValues[h];
          if (typeof value === 'bigint') {
            return Number(value % BigInt(256));
          }
          return Number(value) % 256;
        });

        Logger.module('FHE_MARBLE').log('[KMS] Decrypt success, clearValues count:', clearValues.length);
        resolve({
          clearValues: clearValues,
          abiEncodedClearValues: result.abiEncodedClearValues || '0x',
          proof: result.decryptionProof || '0x'
        });
      })
      .catch(function(error) {
        Logger.module('FHE_MARBLE').error('[KMS] Decrypt failed:', error);

        var typedError = new Error(error.message || 'Decrypt failed');
        typedError.originalError = error;
        reject(typedError);
      });
  });
};

/**
 * FHEVM SDK instance al
 * @private
 */
FHEMarbleSession.prototype._getFhevmInstance = function() {
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

// ============ UTILITY ============

/**
 * Generate marble ID from user address and timestamp
 * @param {string} userAddress - User wallet address
 * @returns {string} bytes32 hex string
 */
FHEMarbleSession.prototype.generateMarbleId = function(userAddress) {
  var timestamp = Date.now();
  var random = Math.floor(Math.random() * 1000000);
  var input = userAddress.toLowerCase() + '-' + timestamp + '-' + random;
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(input));
};

// ============ GETTERS ============

/**
 * Get current marble ID
 * @returns {string|null}
 */
FHEMarbleSession.prototype.getMarbleId = function() {
  return this.marbleId;
};

/**
 * Get contract address
 * @returns {string|null}
 */
FHEMarbleSession.prototype.getContractAddress = function() {
  return this.contractAddress;
};

/**
 * Session wallet adresini al
 * @returns {string}
 */
FHEMarbleSession.prototype.getSessionWalletAddress = function() {
  return this.sessionWallet.getAddress();
};

// ============ SINGLETON ============

var instance = null;

module.exports = {
  getInstance: function() {
    if (!instance) {
      instance = new FHEMarbleSession();
    }
    return instance;
  },

  // Export for testing
  MARBLE_RANDOMS_ABI: MARBLE_RANDOMS_ABI,
  CARDS_PER_MARBLE: CARDS_PER_MARBLE,
  TOTAL_RANDOMS: TOTAL_RANDOMS
};
