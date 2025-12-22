'use strict';

/**
 * FHE Session Manager
 * ZAMA FHEVM session key and decrypt management
 *
 * FLOW:
 * 1. generateKeypair() - Create session key pair (in browser)
 * 2. createSessionSignature() - Sign with MetaMask (1 popup)
 * 3. Now decrypt can be done without popup
 */

var Promise = require('bluebird');
var Logger = require('app/common/logger');
var Wallet = require('app/common/wallet');
var ethers = require('ethers');

// ==================== AES CRYPTO UTILITIES ====================
// PIN-based encryption for localStorage security

/**
 * Derive encryption key from PIN using PBKDF2
 * @param {string} pin - User's PIN
 * @param {Uint8Array} salt - Random salt
 * @returns {Promise<CryptoKey>}
 */
function deriveKeyFromPIN(pin, salt) {
  var encoder = new TextEncoder();
  var pinData = encoder.encode(pin);

  return window.crypto.subtle.importKey('raw', pinData, 'PBKDF2', false, ['deriveKey'])
    .then(function(keyMaterial) {
      return window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    });
}

/**
 * Encrypt data with PIN
 * @param {string} data - JSON string to encrypt
 * @param {string} pin - User's PIN
 * @returns {Promise<object>} { encrypted: base64, salt: base64, iv: base64 }
 */
function encryptWithPIN(data, pin) {
  var salt = window.crypto.getRandomValues(new Uint8Array(16));
  var iv = window.crypto.getRandomValues(new Uint8Array(12));
  var encoder = new TextEncoder();
  var dataBuffer = encoder.encode(data);

  return deriveKeyFromPIN(pin, salt)
    .then(function(key) {
      return window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        dataBuffer
      );
    })
    .then(function(encrypted) {
      return {
        encrypted: arrayBufferToBase64(encrypted),
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv)
      };
    });
}

/**
 * Decrypt data with PIN
 * @param {object} encryptedData - { encrypted, salt, iv } all base64
 * @param {string} pin - User's PIN
 * @returns {Promise<string>} Decrypted JSON string
 */
function decryptWithPIN(encryptedData, pin) {
  var salt = base64ToArrayBuffer(encryptedData.salt);
  var iv = base64ToArrayBuffer(encryptedData.iv);
  var encrypted = base64ToArrayBuffer(encryptedData.encrypted);

  return deriveKeyFromPIN(pin, new Uint8Array(salt))
    .then(function(key) {
      return window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        encrypted
      );
    })
    .then(function(decrypted) {
      var decoder = new TextDecoder();
      return decoder.decode(decrypted);
    });
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer) {
  var bytes = new Uint8Array(buffer);
  var binary = '';
  for (var i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  var binary = window.atob(base64);
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ==================== END CRYPTO UTILITIES ====================

// FHEVM Contract addresses (Sepolia)
var DEPLOYED_CONTRACTS = {
  sepolia: {
    GameSession: '0x0Cc86698f008a6b86d1469Dcc8929E4FF7c28dBD', // v19 - FHE.allowThis() added for ACL permissions
    CardRegistry: '0xf9EB68605c1df066fC944c28770fFF8476ADE8fc', // with 18 generals + 17 minions
    CardNFT: '0xD200776dE5A8472382F5b8b902a676E2117d7A31',
    GameGold: '0xdB1274A736812A28b782879128f237f35fed7B81',
    WalletVault: '0x053E51a173b863E6495Dd1AeDCB0F9766e03f4A0',
    MarbleRandoms: '0x905cA0c59588d3F64cdad12534B5C450485206cc'
  },
  hardhat: {
    GameGold: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    CardNFT: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    CardRegistry: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    GameSession: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    WalletVault: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    MarbleRandoms: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
  }
};

// Session storage key
var SESSION_STORAGE_KEY = 'fheight_fhe_session';

// Session duration (24 hours)
var SESSION_DURATION_DAYS = 1;

/**
 * FHE Session Manager
 */
function FHESessionManager() {
  this.keypair = null;
  this.signature = null;
  this.sessionStartTime = null;
  this.sessionExpiry = null;
  this.contractAddresses = null;
  this.initialized = false;
  this._fhevmInstance = null; // SDK instance for decrypt
}

/**
 * Check if encrypted session exists in localStorage
 * @returns {boolean}
 */
FHESessionManager.prototype.hasEncryptedSession = function() {
  var stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) return false;

  try {
    var data = JSON.parse(stored);
    // Check if it's PIN-encrypted (version 2) and not expired
    if (data.version === 2 && data.encrypted) {
      if (data.expiry && Date.now() > data.expiry) {
        Logger.module('FHE_SESSION').log('Encrypted session expired');
        return false;
      }
      return true;
    }
    // Legacy version 1 (unencrypted) - also valid
    if (data.version === 1 || data.publicKey) {
      if (data.expiry && Date.now() > data.expiry) {
        return false;
      }
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
};

/**
 * Load session from localStorage (decrypt with PIN)
 * @param {string} pin - User's PIN for decryption
 * @returns {Promise<boolean>} true if loaded successfully
 */
FHESessionManager.prototype.loadSession = function(pin) {
  var self = this;

  return new Promise(function(resolve, reject) {
    try {
      Logger.module('FHE_SESSION').log('=== loadSession ATTEMPT ===');
      var stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        Logger.module('FHE_SESSION').log('  localStorage EMPTY - no session found');
        resolve(false);
        return;
      }

      Logger.module('FHE_SESSION').log('  localStorage has data, parsing...');
      var storageData = JSON.parse(stored);
      Logger.module('FHE_SESSION').log('  storage keys:', Object.keys(storageData));

      // Check if PIN-encrypted (version 2)
      if (storageData.version === 2 && storageData.encrypted) {
        Logger.module('FHE_SESSION').log('  Detected PIN-encrypted session (v2)');

        // Check expiry before decrypting
        if (storageData.expiry && Date.now() > storageData.expiry) {
          Logger.module('FHE_SESSION').log('Session expired, clearing');
          self.clearSession();
          resolve(false);
          return;
        }

        // Decrypt with PIN
        decryptWithPIN(storageData, pin)
          .then(function(decryptedJson) {
            var session = JSON.parse(decryptedJson);
            self._loadSessionData(session);
            resolve(true);
          })
          .catch(function(e) {
            Logger.module('FHE_SESSION').error('PIN decrypt failed (wrong PIN?):', e.message);
            reject(new Error('Wrong PIN'));
          });
        return;
      }

      // Legacy unencrypted session (version 1 or old format)
      Logger.module('FHE_SESSION').log('  Detected legacy session, loading directly');
      var session = storageData;

      // Check expiry
      if (session.expiry && Date.now() > session.expiry) {
        Logger.module('FHE_SESSION').log('Session expired, clearing');
        self.clearSession();
        resolve(false);
        return;
      }

      self._loadSessionData(session);
      resolve(true);

    } catch (e) {
      Logger.module('FHE_SESSION').error('=== loadSession FAILED ===', e);
      resolve(false);
    }
  });
};

/**
 * Internal: Load session data into memory
 * @private
 */
FHESessionManager.prototype._loadSessionData = function(session) {
  Logger.module('FHE_SESSION').log('  Loading session data into memory...');

  // Key format check - ML-KEM keys are much longer
  var pubKey = session.publicKey;
  var isValidKeyFormat = false;

  if (pubKey) {
    if (pubKey instanceof Uint8Array || (pubKey.type === 'Buffer' && pubKey.data)) {
      isValidKeyFormat = true;
    } else if (typeof pubKey === 'string') {
      if (pubKey.startsWith('0x04') && pubKey.length < 200) {
        isValidKeyFormat = false;
        Logger.module('FHE_SESSION').warn('Detected old mock key format');
      } else if (pubKey.length > 1000) {
        isValidKeyFormat = true;
      }
    } else if (typeof pubKey === 'object') {
      isValidKeyFormat = true;
    }
  }

  if (!isValidKeyFormat) {
    Logger.module('FHE_SESSION').log('Invalid key format detected');
    return false;
  }

  this.keypair = {
    publicKey: session.publicKey,
    privateKey: session.privateKey
  };
  this.signature = session.signature;
  this.sessionStartTime = session.startTime;
  this.sessionExpiry = session.expiry;
  this.contractAddresses = session.contractAddresses;
  this.sessionStartTimeStamp = session.sessionStartTimeStamp;
  this.sessionDurationDays = session.sessionDurationDays;
  this.initialized = true;

  Logger.module('FHE_SESSION').log('=== _loadSessionData SUCCESS ===');
  Logger.module('FHE_SESSION').log('  initialized:', this.initialized);
  Logger.module('FHE_SESSION').log('  contractAddresses:', this.contractAddresses);
  return true;
};

/**
 * Save session to localStorage (encrypted with PIN)
 * @param {string} pin - User's PIN for encryption
 * @returns {Promise}
 */
FHESessionManager.prototype.saveSession = function(pin) {
  var self = this;

  var session = {
    publicKey: this.keypair.publicKey,
    privateKey: this.keypair.privateKey,
    signature: this.signature,
    startTime: this.sessionStartTime,
    expiry: this.sessionExpiry,
    contractAddresses: this.contractAddresses,
    sessionStartTimeStamp: this.sessionStartTimeStamp,
    sessionDurationDays: this.sessionDurationDays
  };

  var sessionJson = JSON.stringify(session);

  return encryptWithPIN(sessionJson, pin)
    .then(function(encryptedData) {
      // Store encrypted blob + metadata
      var storageData = {
        encrypted: encryptedData.encrypted,
        salt: encryptedData.salt,
        iv: encryptedData.iv,
        expiry: self.sessionExpiry, // Store expiry unencrypted for quick check
        version: 2 // PIN-encrypted version
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storageData));
      Logger.module('FHE_SESSION').log('Session saved to storage (PIN encrypted)');
    })
    .catch(function(e) {
      Logger.module('FHE_SESSION').error('Failed to save session:', e);
      throw e;
    });
};

/**
 * Legacy saveSession without PIN (for backwards compatibility during transition)
 * @deprecated Use saveSession(pin) instead
 */
FHESessionManager.prototype.saveSessionLegacy = function() {
  try {
    var session = {
      publicKey: this.keypair.publicKey,
      privateKey: this.keypair.privateKey,
      signature: this.signature,
      startTime: this.sessionStartTime,
      expiry: this.sessionExpiry,
      contractAddresses: this.contractAddresses,
      sessionStartTimeStamp: this.sessionStartTimeStamp,
      sessionDurationDays: this.sessionDurationDays,
      version: 1 // Legacy unencrypted version
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    Logger.module('FHE_SESSION').log('Session saved to storage (legacy unencrypted)');
  } catch (e) {
    Logger.module('FHE_SESSION').error('Failed to save session:', e);
  }
};

/**
 * Clear session
 */
FHESessionManager.prototype.clearSession = function() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  this.keypair = null;
  this.signature = null;
  this.sessionStartTime = null;
  this.sessionExpiry = null;
  this.sessionStartTimeStamp = null;
  this.sessionDurationDays = null;
  this.contractAddresses = null;
  this.initialized = false;
  Logger.module('FHE_SESSION').log('Session cleared');
};

/**
 * Is session valid?
 */
FHESessionManager.prototype.isSessionValid = function() {
  Logger.module('FHE_SESSION').log('=== isSessionValid CHECK ===');
  Logger.module('FHE_SESSION').log('  initialized:', this.initialized);
  Logger.module('FHE_SESSION').log('  keypair:', this.keypair ? 'EXISTS' : 'NULL');
  Logger.module('FHE_SESSION').log('  signature:', this.signature ? 'EXISTS (len=' + this.signature.length + ')' : 'NULL');
  Logger.module('FHE_SESSION').log('  sessionExpiry:', this.sessionExpiry, '- now:', Date.now(), '- expired:', this.sessionExpiry ? Date.now() > this.sessionExpiry : 'N/A');

  if (!this.initialized || !this.keypair || !this.signature) {
    Logger.module('FHE_SESSION').log('  RESULT: FALSE (missing data)');
    return false;
  }

  if (this.sessionExpiry && Date.now() > this.sessionExpiry) {
    Logger.module('FHE_SESSION').log('  RESULT: FALSE (expired)');
    return false;
  }

  Logger.module('FHE_SESSION').log('  RESULT: TRUE');
  return true;
};

/**
 * Generate keypair (with ZAMA SDK - ML-KEM keypair)
 * SDK's generateKeypair function generates key pair in correct format
 */
FHESessionManager.prototype.generateKeypair = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    // First prepare SDK instance
    self._initFhevmInstance()
      .then(function() {
        // If SDK instance exists, use its generateKeypair
        if (self._fhevmInstance && typeof self._fhevmInstance.generateKeypair === 'function') {
          Logger.module('FHE_SESSION').log('Generating keypair using SDK instance...');
          var keypair = self._fhevmInstance.generateKeypair();
          self.keypair = {
            publicKey: keypair.publicKey,
            privateKey: keypair.privateKey
          };
          Logger.module('FHE_SESSION').log('Keypair generated via SDK');
          resolve(self.keypair);
          return;
        }

        // If generateKeypair exists in global SDK, use it
        var sdk = window.relayerSDK || window.fhevm;
        if (sdk && typeof sdk.generateKeypair === 'function') {
          Logger.module('FHE_SESSION').log('Generating keypair using global SDK...');
          var keypair = sdk.generateKeypair();
          self.keypair = {
            publicKey: keypair.publicKey,
            privateKey: keypair.privateKey
          };
          Logger.module('FHE_SESSION').log('Keypair generated via global SDK');
          resolve(self.keypair);
          return;
        }

        // If SDK is not available, fallback - simple key for mock mode
        Logger.module('FHE_SESSION').warn('SDK not available, using mock keypair (only works on local network)');
        var privateKeyBytes = new Uint8Array(32);
        window.crypto.getRandomValues(privateKeyBytes);
        var privateKey = '0x' + Array.from(privateKeyBytes)
          .map(function(b) { return b.toString(16).padStart(2, '0'); })
          .join('');
        var publicKey = self._derivePublicKey(privateKey);

        self.keypair = {
          publicKey: publicKey,
          privateKey: privateKey
        };

        Logger.module('FHE_SESSION').log('Mock keypair generated');
        resolve(self.keypair);
      })
      .catch(function(err) {
        Logger.module('FHE_SESSION').error('Keypair generation failed:', err);
        reject(err);
      });
  });
};

/**
 * Derive publicKey from privateKey
 * Note: In real implementation secp256k1 is used
 */
FHESessionManager.prototype._derivePublicKey = function(privateKey) {
  // Simplified - in reality ethers.js SigningKey is used
  // For now use hash of privateKey as publicKey
  var hash = this._simpleHash(privateKey);
  return '0x04' + hash.slice(2); // 0x04 = uncompressed public key prefix
};

/**
 * Simple hash function
 */
FHESessionManager.prototype._simpleHash = function(input) {
  var hash = 0;
  for (var i = 0; i < input.length; i++) {
    var char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
};

/**
 * Create EIP-712 typed data
 */
FHESessionManager.prototype.createEIP712TypedData = function(contractAddresses, userAddress) {
  var self = this;
  // Get chainId with central method from Wallet.js
  var chainId = Wallet.getActiveChainId();
  Logger.module('FHE_SESSION').log('createEIP712TypedData - chainId:', chainId);
  var startTime = Math.floor(Date.now() / 1000);
  var duration = SESSION_DURATION_DAYS * 24 * 60 * 60; // in seconds

  // Convert contract addresses to array
  var contracts = Array.isArray(contractAddresses) ? contractAddresses : [contractAddresses];

  self.contractAddresses = contracts;
  self.sessionStartTime = startTime * 1000; // store in ms
  self.sessionExpiry = (startTime + duration) * 1000;

  return {
    domain: {
      name: 'FHEVM Reencryption',
      version: '1',
      chainId: chainId
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' }
      ],
      Reencrypt: [
        { name: 'publicKey', type: 'bytes' },
        { name: 'contracts', type: 'address[]' },
        { name: 'user', type: 'address' },
        { name: 'startTime', type: 'uint256' },
        { name: 'duration', type: 'uint256' }
      ]
    },
    primaryType: 'Reencrypt',
    message: {
      publicKey: self.keypair.publicKey,
      contracts: contracts,
      user: userAddress,
      startTime: startTime,
      duration: duration
    }
  };
};

/**
 * Get session signature (MetaMask popup)
 * Create signature in correct format using SDK's createEIP712 function
 * @param {string|string[]} contractAddresses - Contract addresses to grant permission
 * @returns {Promise<string>} signature
 */
FHESessionManager.prototype.createSessionSignature = function(contractAddresses) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!self.keypair) {
      reject(new Error('Keypair not generated. Call generateKeypair() first'));
      return;
    }

    if (!self._fhevmInstance) {
      reject(new Error('FHEVM instance not initialized'));
      return;
    }

    if (!Wallet.isProviderAvailable()) {
      reject(new Error('MetaMask not found'));
      return;
    }

    var userAddress = null;
    var signer = null;
    var contracts = Array.isArray(contractAddresses) ? contractAddresses : [contractAddresses];

    // Get account from Wallet module
    Wallet.getConnectedAccounts()
      .then(function(accounts) {
        if (!accounts || accounts.length === 0) {
          throw new Error('No wallet connected');
        }

        userAddress = accounts[0];

        // Get signer from Wallet module
        signer = Wallet.getSigner();

        // Timestamp and duration - these must match with signature!
        var startTimeStamp = Math.floor(Date.now() / 1000).toString();
        var durationDays = SESSION_DURATION_DAYS.toString();

        // Use SDK's createEIP712 function - ACCORDING TO DOCUMENTATION
        var eip712 = self._fhevmInstance.createEIP712(
          self.keypair.publicKey,
          contracts,
          startTimeStamp,
          durationDays
        );

        Logger.module('FHE_SESSION').log('Requesting session signature via SDK createEIP712...');
        Logger.module('FHE_SESSION').log('EIP712 params:', { startTimeStamp: startTimeStamp, durationDays: durationDays });

        // Save signature parameters - we need to use the SAME values in userDecrypt!
        self.sessionStartTime = parseInt(startTimeStamp) * 1000; // in ms
        self.sessionDurationDays = durationDays;
        self.sessionStartTimeStamp = startTimeStamp; // Store as string
        self.contractAddresses = contracts;
        // Calculate expiry (in ms)
        var durationSeconds = parseInt(durationDays) * 24 * 60 * 60;
        self.sessionExpiry = (parseInt(startTimeStamp) + durationSeconds) * 1000;

        // Sign with ethers.js v5 signer - v5 uses _signTypedData
        return signer._signTypedData(
          eip712.domain,
          { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
          eip712.message
        );
      })
      .then(function(signature) {
        self.signature = signature;
        self.initialized = true;

        // NOTE: saveSession() now requires PIN
        // Save operation will be done by initializeSessionWithPIN() or _createNewSessionWithPIN()
        // If legacy initializeSession() is used, saveSessionLegacy() can be called

        Logger.module('FHE_SESSION').log('Session signature obtained via SDK');
        resolve(signature);
      })
      .catch(function(error) {
        Logger.module('FHE_SESSION').error('Signature request failed:', error);
        if (error.code === 4001) {
          reject(new Error('User rejected session signature'));
        } else {
          reject(error);
        }
      });
  });
};

/**
 * Complete session initialization flow
 * 1. Generate keypair
 * 2. Get signature
 * @param {string|string[]} contractAddresses - Required contract addresses
 * @param {boolean} forceNew - Create new even if existing session is valid (default: false)
 * @returns {Promise<object>} { publicKey, signature, fromCache }
 */
FHESessionManager.prototype.initializeSession = function(contractAddresses, forceNew) {
  var self = this;
  var requiredContracts = Array.isArray(contractAddresses) ? contractAddresses : [contractAddresses];

  Logger.module('FHE_SESSION').log('=== initializeSession START ===');
  Logger.module('FHE_SESSION').log('  requiredContracts:', requiredContracts);
  Logger.module('FHE_SESSION').log('  forceNew:', forceNew);

  // Helper: Does current session contain required contracts?
  function sessionHasRequiredContracts() {
    if (!self.contractAddresses || self.contractAddresses.length === 0) {
      return false;
    }
    // Is every required contract in session?
    var sessionContractsLower = self.contractAddresses.map(function(a) { return a.toLowerCase(); });
    return requiredContracts.every(function(addr) {
      return sessionContractsLower.indexOf(addr.toLowerCase()) !== -1;
    });
  }

  // If not forceNew, try existing session
  if (!forceNew) {
    // First check session in memory
    if (self.isSessionValid()) {
      if (sessionHasRequiredContracts()) {
        Logger.module('FHE_SESSION').log('Using existing valid session from memory (has required contracts)');
        return self._initFhevmInstance()
          .then(function() {
            return {
              publicKey: self.keypair.publicKey,
              signature: self.signature,
              fromCache: true
            };
          });
      } else {
        Logger.module('FHE_SESSION').log('Memory session valid but missing required contracts');
        Logger.module('FHE_SESSION').log('  session has:', self.contractAddresses);
        Logger.module('FHE_SESSION').log('  needs:', requiredContracts);
      }
    }

    // If not in memory, load from localStorage
    if (self.loadSession() && self.isSessionValid()) {
      if (sessionHasRequiredContracts()) {
        Logger.module('FHE_SESSION').log('Using existing valid session from storage (has required contracts)');
        return self._initFhevmInstance()
          .then(function() {
            return {
              publicKey: self.keypair.publicKey,
              signature: self.signature,
              fromCache: true
            };
          });
      } else {
        Logger.module('FHE_SESSION').log('Storage session valid but missing required contracts');
        Logger.module('FHE_SESSION').log('  session has:', self.contractAddresses);
        Logger.module('FHE_SESSION').log('  needs:', requiredContracts);
      }
    }
  }

  // Create new session
  // NOTE: Not deleting old session! saveSession() will overwrite.
  // If user cancels without signing, old session remains.
  Logger.module('FHE_SESSION').log('Creating new session for contracts:', requiredContracts);
  return self.generateKeypair()
    .then(function() {
      return self.createSessionSignature(requiredContracts);
    })
    .then(function(signature) {
      // Legacy: save without PIN (backwards compatibility)
      self.saveSessionLegacy();

      // Load FHEVM instance
      return self._initFhevmInstance()
        .then(function() {
          return {
            publicKey: self.keypair.publicKey,
            signature: signature,
            fromCache: false
          };
        });
    });
};

/**
 * Initialize FHEVM SDK instance
 * @private
 */
FHESessionManager.prototype._initFhevmInstance = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    var sdk = window.relayerSDK || window.fhevm;

    if (!sdk) {
      Logger.module('FHE_SESSION').warn('FHEVM SDK not available, decrypt will use mock');
      resolve();
      return;
    }

    // If already exists, use it
    if (self._fhevmInstance) {
      resolve();
      return;
    }

    Logger.module('FHE_SESSION').log('Initializing FHEVM SDK instance...');

    // Get current network from wallet (sync method)
    var network = Wallet.getCurrentNetwork();
    Logger.module('FHE_SESSION').log('SDK init - current network:', network);

    Promise.resolve()
      .then(function() {
        // If initSDK exists, call it (loads WASM)
        var initPromise = (typeof sdk.initSDK === 'function')
          ? sdk.initSDK()
          : Promise.resolve();

        return initPromise.then(function() {
          return network;
        });
      })
      .then(function(network) {
        // Get with central methods from Wallet.js
        var chainId = Wallet.getActiveChainId();
        var activeRpcUrl = Wallet.getActiveRpcUrl();

        Logger.module('FHE_SESSION').log('SDK config - chainId:', chainId, 'rpcUrl:', activeRpcUrl);

        var config = {
          aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
          kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
          inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
          verifyingContractAddressDecryption: '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
          verifyingContractAddressInputVerification: '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
          chainId: chainId,
          gatewayChainId: 10901,
          network: activeRpcUrl,
          relayerUrl: 'https://relayer.testnet.zama.org'
        };

        return sdk.createInstance(config);
      })
      .then(function(instance) {
        self._fhevmInstance = instance;
        Logger.module('FHE_SESSION').log('FHEVM SDK instance ready');
        resolve();
      })
      .catch(function(err) {
        Logger.module('FHE_SESSION').error('Failed to init FHEVM SDK:', err);
        // Continue even if error, mock will be used
        resolve();
      });
  });
};

/**
 * Set FHEVM instance from external source
 * @param {object} instance - SDK instance
 */
FHESessionManager.prototype.setFhevmInstance = function(instance) {
  this._fhevmInstance = instance;
  Logger.module('FHE_SESSION').log('FHEVM instance set externally');
};

/**
 * Send decrypt request to KMS
 * @param {string[]} handles - Encrypted value handles
 * @param {string} contractAddress - Contract address
 * @returns {Promise<any[]>} Decrypted values
 */
FHESessionManager.prototype.decrypt = function(handles, contractAddress) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!self.isSessionValid()) {
      reject(new Error('Session not valid. Call initializeSession() first'));
      return;
    }

    Logger.module('FHE_SESSION').log('Requesting decrypt...', { handles: handles.length });

    // For mock mode (local Hardhat) - read directly from contract
    var currentNetwork = Wallet.getCurrentNetwork();
    if (currentNetwork === 'hardhat' || currentNetwork === 'localhost') {
      Logger.module('FHE_SESSION').log('Using mock decrypt (local network)');
      self._mockDecrypt(handles, contractAddress)
        .then(resolve)
        .catch(reject);
      return;
    }

    // Use SDK's userDecrypt function
    // SDK performs decrypt via relayerUrl (https://relayer.testnet.zama.org)
    var sdk = window.relayerSDK || window.fhevm;

    if (!sdk || !self._fhevmInstance) {
      Logger.module('FHE_SESSION').error('SDK or FHEVM instance not available');
      reject(new Error('SDK not available for decrypt'));
      return;
    }

    // Convert handles to HandleContractPair format
    var handlePairs = handles.map(function(h) {
      return { handle: h, contractAddress: contractAddress };
    });

    // CRITICAL: We must use the SAME values used when creating signature!
    // Otherwise signature verification will fail and we'll get 500 error
    var startTimestamp = self.sessionStartTimeStamp;
    var durationDays = self.sessionDurationDays;

    // If not saved (old session) create new - but this won't work!
    if (!startTimestamp || !durationDays) {
      Logger.module('FHE_SESSION').warn('Session params missing - signature mismatch will occur!');
      Logger.module('FHE_SESSION').warn('Please clear session and reconnect wallet');
      reject(new Error('Session parameters missing. Please clear session (Settings > Clear FHE Session) and reconnect.'));
      return;
    }

    // Signature must go without 0x prefix - according to documentation
    var signatureWithoutPrefix = self.signature;
    if (signatureWithoutPrefix && signatureWithoutPrefix.startsWith('0x')) {
      signatureWithoutPrefix = signatureWithoutPrefix.slice(2);
    }

    // Get account from Wallet module
    Wallet.getConnectedAccounts()
      .then(function(accounts) {
        if (!accounts || accounts.length === 0) {
          throw new Error('No wallet connected');
        }

        // SDK expects checksummed address - normalize with ethers.utils.getAddress
        var rawAddress = accounts[0];
        var userAddress = ethers.utils.getAddress(rawAddress);

        Logger.module('FHE_SESSION').log('Calling SDK userDecrypt...', {
          handles: handles.length,
          targetContract: contractAddress,
          sessionContracts: self.contractAddresses,
          userAddress: userAddress,
          startTimestamp: startTimestamp,
          durationDays: durationDays,
          signaturePrefix: signatureWithoutPrefix ? signatureWithoutPrefix.substring(0, 10) + '...' : 'null'
        });

        return self._fhevmInstance.userDecrypt(
          handlePairs,
          self.keypair.privateKey,
          self.keypair.publicKey,
          signatureWithoutPrefix,
          self.contractAddresses,  // Contract addresses registered in session
          userAddress,
          startTimestamp,
          durationDays
        );
      })
      .then(function(result) {
        // SDK response format: result = { [handle]: value, [handle]: value, ... }
        // According to documentation: const decryptedValue = result[ciphertextHandle];
        Logger.module('FHE_SESSION').log('=== SDK userDecrypt RESPONSE ===');
        Logger.module('FHE_SESSION').log('Result type:', typeof result);
        Logger.module('FHE_SESSION').log('Result keys:', result ? Object.keys(result) : 'null');

        // Extract values using handle strings
        var decrypted = [];
        if (result && typeof result === 'object') {
          // Get values according to handlePairs order
          for (var i = 0; i < handlePairs.length; i++) {
            var handle = handlePairs[i].handle;
            var value = result[handle];
            Logger.module('FHE_SESSION').log('  Handle[' + i + ']:', handle.substring(0, 20) + '... =', value);
            if (value !== undefined) {
              decrypted.push(value);
            }
          }
        }

        Logger.module('FHE_SESSION').log('Decrypt successful', {
          count: decrypted.length,
          values: decrypted
        });
        resolve(decrypted);
      })
      .catch(function(error) {
        Logger.module('FHE_SESSION').error('Decrypt failed:', error);
        reject(error);
      });
  });
};

/**
 * Mock decrypt - for Hardhat local network
 * When using FHE mock, handles actually contain plaintext values
 * @private
 */
FHESessionManager.prototype._mockDecrypt = function(handles, contractAddress) {
  var self = this;

  return new Promise(function(resolve, reject) {
    try {
      Logger.module('FHE_SESSION').log('[FHE MOCK] === MOCK DECRYPT START ===');
      Logger.module('FHE_SESSION').log('[FHE MOCK] Contract:', contractAddress);
      Logger.module('FHE_SESSION').log('[FHE MOCK] Number of handles:', handles.length);

      // In mock FHE, handle is actually the encrypted value itself
      // Uses Hardhat fhevm mock, handles can be decoded directly
      var decrypted = handles.map(function(handle, idx) {
        // Handle can be BigInt or hex string
        var bigIntValue;
        if (typeof handle === 'string') {
          bigIntValue = BigInt(handle);
        } else if (typeof handle === 'bigint') {
          bigIntValue = handle;
        } else {
          bigIntValue = BigInt(handle.toString());
        }

        // In mock, last 2 bytes of handle usually contain the value
        // Or entire handle is decoded
        var value = Number(bigIntValue & BigInt(0xFFFF));

        Logger.module('FHE_SESSION').log('[FHE MOCK]   Handle[' + idx + ']: ' + handle.toString().slice(0, 20) + '... -> CardID=' + value);

        return value;
      });

      Logger.module('FHE_SESSION').log('[FHE MOCK] === MOCK DECRYPT RESULT ===');
      Logger.module('FHE_SESSION').log('[FHE MOCK] Decrypted card IDs:', JSON.stringify(decrypted));
      Logger.module('FHE_SESSION').log('[FHE MOCK] ==============================');

      resolve(decrypted);
    } catch (e) {
      Logger.module('FHE_SESSION').error('[FHE MOCK] Mock decrypt error:', e);
      reject(e);
    }
  });
};

/**
 * Decrypt with privateKey (decrypt reencrypted value from KMS)
 * Note: In real implementation ECIES is used
 */
FHESessionManager.prototype._decryptWithPrivateKey = function(encryptedValue) {
  // Simplified - real ECIES decrypt
  // KMS encrypted with publicKey, we decrypt with privateKey
  // For now return value directly (for testing)
  return encryptedValue;
};

/**
 * Get contract addresses according to network
 * Dynamically uses the network wallet is connected to
 */
FHESessionManager.prototype.getContractAddresses = function(network) {
  var self = this;

  // If network is provided, use it
  if (network) {
    return DEPLOYED_CONTRACTS[network] || DEPLOYED_CONTRACTS.sepolia;
  }

  // Get current network from wallet
  var currentNet = Wallet.getCurrentNetwork();

  // If cached network exists, use it
  if (currentNet && DEPLOYED_CONTRACTS[currentNet]) {
    return DEPLOYED_CONTRACTS[currentNet];
  }

  // Fallback: TARGET_NETWORK
  return DEPLOYED_CONTRACTS[Wallet.TARGET_NETWORK] || DEPLOYED_CONTRACTS.sepolia;
};

/**
 * Get contract addresses according to current network asynchronously
 * @returns {Promise<object>}
 */
FHESessionManager.prototype.getContractAddressesAsync = function() {
  var self = this;

  return Wallet.getInstance().getCurrentNetwork().then(function(network) {
    // Save to cache
    Wallet.setCurrentNetwork(network);
    Logger.module('FHE_SESSION').log('Detected network:', network);

    var contracts = DEPLOYED_CONTRACTS[network];
    if (!contracts) {
      Logger.module('FHE_SESSION').warn('Unknown network, falling back to sepolia');
      return DEPLOYED_CONTRACTS.sepolia;
    }
    return contracts;
  });
};

/**
 * GameSession contract address
 */
FHESessionManager.prototype.getGameSessionAddress = function() {
  var addresses = this.getContractAddresses();
  Logger.module('FHE_SESSION').log('=== CONTRACT ADDRESS DEBUG ===');
  Logger.module('FHE_SESSION').log('Network:', Wallet.getCurrentNetwork());
  Logger.module('FHE_SESSION').log('All addresses:', JSON.stringify(addresses));
  Logger.module('FHE_SESSION').log('GameSession:', addresses.GameSession);
  Logger.module('FHE_SESSION').log('==============================');
  return addresses.GameSession;
};

/**
 * Show PIN dialog and return Promise with PIN
 * @param {boolean} isCreate - true for "Create PIN", false for "Enter PIN"
 * @param {string} message - Optional message to show
 * @returns {Promise<string>} PIN entered by user
 */
FHESessionManager.prototype.showPinDialog = function(isCreate, message) {
  return new Promise(function(resolve, reject) {
    // Lazy load to avoid circular dependency
    var NavigationManager = require('app/ui/managers/navigation_manager');
    var PinDialogItemView = require('app/ui/views/item/pin_dialog');

    var pinDialog = new PinDialogItemView({
      isCreate: isCreate,
      message: message || ''
    });

    pinDialog.on('confirm', function(pin) {
      resolve(pin);
    });

    pinDialog.on('cancel', function() {
      reject(new Error('PIN entry cancelled'));
    });

    NavigationManager.getInstance().showDialogView(pinDialog);
  });
};

/**
 * Initialize session with automatic PIN handling
 * Shows PIN dialog when needed
 * @param {string|string[]} contractAddresses
 * @returns {Promise<object>} { publicKey, signature, fromCache }
 */
FHESessionManager.prototype.initializeSessionWithPIN = function(contractAddresses) {
  var self = this;
  var requiredContracts = Array.isArray(contractAddresses) ? contractAddresses : [contractAddresses];

  Logger.module('FHE_SESSION').log('=== initializeSessionWithPIN START ===');

  // Memory'de gecerli session var mi?
  if (self.isSessionValid()) {
    // Contract'ları kontrol et
    var sessionContractsLower = (self.contractAddresses || []).map(function(a) { return a.toLowerCase(); });
    var hasRequired = requiredContracts.every(function(addr) {
      return sessionContractsLower.indexOf(addr.toLowerCase()) !== -1;
    });

    if (hasRequired) {
      Logger.module('FHE_SESSION').log('Using existing session from memory');
      return self._initFhevmInstance().then(function() {
        return { publicKey: self.keypair.publicKey, signature: self.signature, fromCache: true };
      });
    }
  }

  // Encrypted session exists in localStorage?
  if (self.hasEncryptedSession()) {
    Logger.module('FHE_SESSION').log('Encrypted session found, requesting PIN...');

    return self.showPinDialog(false, 'Unlock your FHE session')
      .then(function(pin) {
        return self.loadSession(pin);
      })
      .then(function(loaded) {
        if (loaded && self.isSessionValid()) {
          // Check contracts
          var sessionContractsLower = (self.contractAddresses || []).map(function(a) { return a.toLowerCase(); });
          var hasRequired = requiredContracts.every(function(addr) {
            return sessionContractsLower.indexOf(addr.toLowerCase()) !== -1;
          });

          if (hasRequired) {
            Logger.module('FHE_SESSION').log('Session loaded from storage with PIN');
            return self._initFhevmInstance().then(function() {
              return { publicKey: self.keypair.publicKey, signature: self.signature, fromCache: true };
            });
          }
        }
        // Session doesn't exist or contracts don't match - create new
        return self._createNewSessionWithPIN(requiredContracts);
      })
      .catch(function(err) {
        if (err.message === 'Wrong PIN') {
          // PIN wrong, retry
          Logger.module('FHE_SESSION').warn('Wrong PIN, retrying...');
          return self.initializeSessionWithPIN(contractAddresses);
        }
        if (err.message === 'PIN entry cancelled') {
          throw err;
        }
        // Other errors - create new session
        return self._createNewSessionWithPIN(requiredContracts);
      });
  }

  // No session at all - create new
  Logger.module('FHE_SESSION').log('No session found, creating new...');
  return self._createNewSessionWithPIN(requiredContracts);
};

/**
 * Create new session and encrypt with PIN
 * @private
 */
FHESessionManager.prototype._createNewSessionWithPIN = function(contractAddresses) {
  var self = this;

  return self.generateKeypair()
    .then(function() {
      return self.createSessionSignature(contractAddresses);
    })
    .then(function(signature) {
      // Show create PIN dialog
      return self.showPinDialog(true, 'Create a PIN to secure your session')
        .then(function(pin) {
          // Encrypt with PIN and save
          return self.saveSession(pin);
        })
        .then(function() {
          return self._initFhevmInstance();
        })
        .then(function() {
          return {
            publicKey: self.keypair.publicKey,
            signature: signature,
            fromCache: false
          };
        });
    });
};

// Singleton instance
var instance = null;

module.exports = {
  getInstance: function() {
    if (!instance) {
      instance = new FHESessionManager();
    }
    return instance;
  },
  DEPLOYED_CONTRACTS: DEPLOYED_CONTRACTS,
  SESSION_DURATION_DAYS: SESSION_DURATION_DAYS
};
