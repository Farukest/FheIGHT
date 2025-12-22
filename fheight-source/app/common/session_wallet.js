'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var _ = require('underscore');
var Backbone = require('backbone');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');

// Storage keys - ONLY save address and on-chain status, NEVER private key!
// Key is now bound to main wallet address: fheight_session_wallet_address_<mainWalletAddress>
var STORAGE_KEY_PREFIX = 'fheight_session_wallet_address_';

/**
 * Get main wallet state from wallet.js module
 * wallet.js is initialized via IIFE on page load
 */
function getMainWalletState() {
  var Wallet = require('app/common/wallet');
  return Wallet.getState();
}

/**
 * Get main wallet manager instance
 */
function getMainWallet() {
  var Wallet = require('app/common/wallet');
  return Wallet.getInstance();
}

/**
 * Get active RPC provider from wallet.js
 * Dynamically returns RPC provider based on active network
 */
function getActiveRpcProvider() {
  var Wallet = require('app/common/wallet');
  return Wallet.getActiveRpcProvider();
}

/**
 * Get storage key for current main wallet
 * Separate session wallet for each main wallet
 * Main wallet address comes from wallet.js (initialized via IIFE)
 */
function getStorageKey() {
  var state = getMainWalletState();
  var mainAddress = state.address;

  if (!mainAddress) {
    Logger.module('SESSION_WALLET').warn('Main wallet address not available yet');
    return STORAGE_KEY_PREFIX + 'unknown';
  }

  return STORAGE_KEY_PREFIX + mainAddress.toLowerCase();
}

// WalletVault contract ABI (minimal)
var WALLET_VAULT_ABI = [
  'function storeKey(bytes32 encKey, bytes calldata inputProof, address sessionWallet) external',
  'function getEncryptedKey() external view returns (uint256)',
  'function hasStoredKey() external view returns (bool)',
  'function getSessionWallet(address owner) external view returns (address)',
  'function clearKey() external',
  'function hasKey(address owner) external view returns (bool)'
];

/**
 * Session Wallet Manager (FHE Version)
 *
 * IMPORTANT: Private key is NEVER saved to localStorage!
 *
 * Flow:
 * 1. When createWallet() is called:
 *    - Create random wallet (in memory)
 *    - Encrypt private key with FHE
 *    - Send TX and save to WalletVault
 *    - ONLY ADDRESS is saved to localStorage
 *
 * 2. When private key is needed:
 *    - Retrieve from blockchain via userDecrypt
 *    - Use and forget (stays in memory, never written to disk)
 */
var SessionWalletManager = function() {
  this._wallet = null;  // In memory, NEVER written to localStorage
  this._balance = '0.0000';
  this._balancePollingInterval = null;
  // _provider removed - all operations use Wallet.getActiveRpcProvider()
  this._fheSession = null;
  this._walletVaultAddress = null;
};

// Mix in Backbone.Events for event handling
_.extend(SessionWalletManager.prototype, Backbone.Events);

// Singleton instance
var _instance = null;

SessionWalletManager.getInstance = function() {
  if (!_instance) {
    _instance = new SessionWalletManager();
  }
  return _instance;
};

/**
 * Get FHE Session Manager (lazy load)
 */
SessionWalletManager.prototype._getFHESession = function() {
  if (!this._fheSession) {
    var FHESession = require('app/common/fhe_session');
    this._fheSession = FHESession.getInstance();
  }
  return this._fheSession;
};

/**
 * Get WalletVault contract address
 */
SessionWalletManager.prototype._getWalletVaultAddress = function() {
  // Always get fresh address from FHESession (don't cache - network might have changed)
  var FHESession = require('app/common/fhe_session');
  var addresses = FHESession.getInstance().getContractAddresses();
  this._walletVaultAddress = addresses.WalletVault;
  return this._walletVaultAddress;
};

/**
 * Check if wallet exists (only address in localStorage)
 * Checked separately for each main wallet
 */
SessionWalletManager.prototype.hasWallet = function() {
  var storageKey = getStorageKey();
  return !!localStorage.getItem(storageKey);
};

/**
 * Get wallet address
 * Returns separate address for each main wallet
 */
SessionWalletManager.prototype.getAddress = function() {
  var storageKey = getStorageKey();
  return localStorage.getItem(storageKey) || '';
};

/**
 * Get current balance
 */
SessionWalletManager.prototype.getBalance = function() {
  return this._balance;
};

// Old _getProvider() removed - it used MetaMask's slow RPC (rpc.sepolia.org)
// All session wallet operations now use Wallet.getActiveRpcProvider() from wallet.js
// This ensures fast, reliable Alchemy RPC for all TX and read operations

/**
 * Create FHE Wallet - create wallet and save to blockchain in one step
 *
 * FLOW:
 * 1. Create random wallet (memory)
 * 2. Encrypt private key with FHE
 * 3. Send TX -> WalletVault.storeKey()
 * 4. Save ONLY address to localStorage
 * 5. Private key is NEVER written to disk!
 *
 * @returns {Promise<string>} Wallet address
 */
SessionWalletManager.prototype.createWallet = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    try {
      if (!window.ethers) {
        reject(new Error('ethers.js not loaded'));
        return;
      }

      // Get wallet state from main wallet.js module
      var state = getMainWalletState();
      var walletManager = getMainWallet();

      if (!state.connected || !state.address) {
        // Try to connect if wallet is not connected
        Logger.module('SESSION_WALLET').log('Main wallet not connected, attempting to connect...');
        walletManager.connect()
          .then(function() {
            var newState = getMainWalletState();
            if (!newState.connected || !newState.address) {
              throw new Error('Failed to connect main wallet');
            }
            return self._createWalletInternal(walletManager);
          })
          .then(resolve)
          .catch(reject);
      } else {
        // Wallet already connected, continue directly
        self._createWalletInternal(walletManager)
          .then(resolve)
          .catch(reject);
      }

    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Internal wallet creation (called after main wallet is connected)
 */
SessionWalletManager.prototype._createWalletInternal = function(walletManager) {
  var self = this;
  return new Promise(function(resolve, reject) {
    try {
      var vaultAddress = self._getWalletVaultAddress();

      if (!vaultAddress) {
        reject(new Error('WalletVault contract address not configured'));
        return;
      }

      Logger.module('SESSION_WALLET').log('Creating FHE wallet...');

      // Emit progress event - Step 1
      self.trigger('walletProgress', { step: 1, message: 'GENERATING WALLET...' });

      // Step 1: Create random wallet (in memory only!)
      var wallet = window.ethers.Wallet.createRandom();
      var privateKey = wallet.privateKey;
      var address = wallet.address;

      Logger.module('SESSION_WALLET').log('Wallet created in memory:', address);
      Logger.module('SESSION_WALLET').log('Encrypting private key with FHE...');

      // Emit progress event - Step 2
      self.trigger('walletProgress', { step: 2, message: 'ENCRYPTING WITH FHE...' });

      // Step 2: Initialize FHEVM SDK (same pattern as fheGameSession.js)
      var sdk = window.relayerSDK || window.fhevm;
      if (typeof sdk === 'undefined' || typeof sdk.createInstance !== 'function') {
        reject(new Error('FHEVM SDK not loaded. Check if relayerSDK script is included.'));
        return;
      }

      Logger.module('SESSION_WALLET').log('Using global relayerSDK for FHE encryption');

      // Initialize SDK (WASM loading required)
      var initPromise = (typeof sdk.initSDK === 'function')
        ? sdk.initSDK()
        : Promise.resolve();

      var fhevmInstance = null;

      initPromise
        .then(function() {
          // FHEVM SDK config - get from wallet.js via centralized methods
          var Wallet = require('app/common/wallet');
          var activeRpcUrl = Wallet.getActiveRpcUrl();
          var chainId = Wallet.getActiveChainId();

          Logger.module('SESSION_WALLET').log('FHEVM config - chainId:', chainId, 'rpcUrl:', activeRpcUrl);

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

          Logger.module('SESSION_WALLET').log('Creating FHEVM instance with SepoliaConfig');
          return sdk.createInstance(config);
        })
        .then(function(instance) {
          Logger.module('SESSION_WALLET').log('FHEVM instance created successfully');
          fhevmInstance = instance;

          // Convert private key to BigInt (remove 0x prefix)
          var keyHex = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
          var keyBigInt = BigInt('0x' + keyHex);

          // Create encrypted input
          var input = fhevmInstance.createEncryptedInput(vaultAddress, walletManager.address);
          input.add256(keyBigInt);

          return input.encrypt();
        })
        .then(function(encrypted) {
          Logger.module('SESSION_WALLET').log('Private key encrypted, sending TX to WalletVault...');

          // Emit progress event - Step 3
          self.trigger('walletProgress', { step: 3, message: 'SIGN TRANSACTION...' });

          // Step 3: Send TX to store encrypted key on-chain
          var signer = walletManager.getSigner();
          var contract = new window.ethers.Contract(vaultAddress, WALLET_VAULT_ABI, signer);

          return contract.storeKey(
            encrypted.handles[0],
            encrypted.inputProof,
            address
          );
        })
        .then(function(tx) {
          Logger.module('SESSION_WALLET').log('TX sent:', tx.hash);

          // Emit progress event - Step 4
          self.trigger('walletProgress', { step: 4, message: 'CONFIRMING TX...' });

          return tx.wait();
        })
        .then(function(receipt) {
          Logger.module('SESSION_WALLET').log('FHE wallet created and stored on-chain:', receipt.transactionHash);

          // Step 4: Save ONLY address to localStorage (NOT private key!)
          // Key is bound to main wallet address
          var storageKey = getStorageKey();
          localStorage.setItem(storageKey, address);

          // Keep wallet in memory for immediate use
          self._wallet = wallet;

          // Private key is now in memory, NOT written to localStorage!
          Logger.module('SESSION_WALLET').log('Address saved to localStorage. Private key is FHE-encrypted on blockchain.');

          // Trigger global event for UI updates (unlock menus, remove overlay)
          EventBus.getInstance().trigger(EVENTS.session_wallet_created, address);

          resolve(address);
        })
        .catch(function(err) {
          Logger.module('SESSION_WALLET').error('Failed to create FHE wallet:', err);
          reject(err);
        });

    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Retrieve private key from blockchain via FHE userDecrypt
 * This function loads private key into memory but NEVER writes to disk!
 *
 * @returns {Promise<string>} The decrypted private key
 */
SessionWalletManager.prototype.retrieveFromChain = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    // Get wallet info from main wallet.js module
    var state = getMainWalletState();
    var walletManager = getMainWallet();

    if (!state.connected || !state.address) {
      reject(new Error('Wallet not connected. Please connect your wallet first.'));
      return;
    }

    var fheSession = null;
    var vaultAddress = null;
    var userAddress = state.address;
    var signer = walletManager.getSigner();
    // Read operations use centralized Wallet.getActiveRpcProvider() - dynamic RPC based on network
    var readOnlyProvider = getActiveRpcProvider();

    Logger.module('SESSION_WALLET').log('Using wallet address from wallet.js:', userAddress);

    // Continue with info from wallet.js
    Promise.resolve()
      .then(function() {

        fheSession = self._getFHESession();
        vaultAddress = self._getWalletVaultAddress();

        // Also get GameSession address - session should cover ALL required contracts
        var FHESession = require('app/common/fhe_session');
        var addresses = FHESession.getInstance().getContractAddresses();
        var gameSessionAddress = addresses.GameSession;

        Logger.module('SESSION_WALLET').log('WalletVault address:', vaultAddress);
        Logger.module('SESSION_WALLET').log('GameSession address:', gameSessionAddress);
        Logger.module('SESSION_WALLET').log('Calling initializeSessionWithPIN with BOTH contracts...');

        // initializeSessionWithPIN:
        // - Uses valid session if it exists in memory
        // - Asks for PIN and loads if encrypted session exists
        // - Otherwise creates new session (MetaMask signature + create PIN)
        // IMPORTANT: ALL contract addresses must be included (WalletVault + GameSession)
        // Otherwise signature mismatch occurs when decrypting from GameSession!
        var allContracts = [vaultAddress];
        if (gameSessionAddress) {
          allContracts.push(gameSessionAddress);
        }
        return fheSession.initializeSessionWithPIN(allContracts);
      })
      .then(function() {

        if (!vaultAddress) {
          throw new Error('WalletVault contract address not configured');
        }

        Logger.module('SESSION_WALLET').log('Retrieving encrypted key from WalletVault...');

        var contract = new window.ethers.Contract(vaultAddress, WALLET_VAULT_ABI, readOnlyProvider);

        // First check if user has stored key
        return contract.hasKey(userAddress);
      })
      .then(function(hasKey) {
        if (!hasKey) {
          throw new Error('No key stored for this wallet');
        }

        // Get encrypted key handle - use Alchemy RPC with from address (view function)
        var contract = new window.ethers.Contract(vaultAddress, WALLET_VAULT_ABI, readOnlyProvider);
        return contract.getEncryptedKey({ from: userAddress });
      })
      .then(function(encryptedHandle) {
        Logger.module('SESSION_WALLET').log('Got encrypted handle (raw):', encryptedHandle.toString());

        // Convert BigNumber to bytes32 hex format (SDK expects 0x + 64 hex chars)
        var handleHex;
        if (typeof encryptedHandle === 'string' && encryptedHandle.startsWith('0x')) {
          // Already hex
          handleHex = encryptedHandle;
        } else {
          // BigNumber - convert to hex and pad to 32 bytes
          handleHex = '0x' + BigInt(encryptedHandle.toString()).toString(16).padStart(64, '0');
        }

        Logger.module('SESSION_WALLET').log('Got encrypted handle (hex):', handleHex);

        // Use FHE session to decrypt (userDecrypt - no TX needed)
        return fheSession.decrypt([handleHex], vaultAddress);
      })
      .then(function(decrypted) {
        if (!decrypted || decrypted.length === 0) {
          throw new Error('Decryption returned empty result');
        }

        // Convert BigInt back to private key hex
        var keyBigInt = BigInt(decrypted[0]);
        var keyHex = '0x' + keyBigInt.toString(16).padStart(64, '0');

        Logger.module('SESSION_WALLET').log('Key decrypted successfully (in memory only)');

        // Reconstruct wallet IN MEMORY ONLY - DO NOT write to localStorage!
        self._wallet = new window.ethers.Wallet(keyHex);

        resolve(keyHex);
      })
      .catch(function(err) {
        Logger.module('SESSION_WALLET').error('Failed to retrieve from chain:', err);
        reject(err);
      });
  });
};

/**
 * Get private key (retrieves from chain via FHE userDecrypt)
 * IMPORTANT: This function NEVER writes private key to localStorage!
 *
 * @returns {Promise<string>} The private key
 */
SessionWalletManager.prototype.getPrivateKey = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    // If wallet is already in memory, return its private key
    if (self._wallet && self._wallet.privateKey) {
      resolve(self._wallet.privateKey);
      return;
    }

    // Otherwise retrieve from blockchain via FHE
    self.retrieveFromChain()
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Get wallet signer (connected to provider)
 * If wallet is not in memory, retrieves from blockchain first
 * Uses Alchemy RPC for fast, reliable TX sending
 */
SessionWalletManager.prototype.getSigner = function() {
  if (!this._wallet) {
    // Wallet not in memory - needs to be retrieved first
    return null;
  }

  // Use centralized Alchemy RPC provider (NOT MetaMask's slow RPC)
  var provider = getActiveRpcProvider();

  return this._wallet.connect(provider);
};

/**
 * Ensure wallet is loaded (retrieve from chain if needed)
 * Call this before operations that need the signer
 */
SessionWalletManager.prototype.ensureWalletLoaded = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self._wallet) {
      resolve(self._wallet);
      return;
    }

    // Retrieve from blockchain
    self.retrieveFromChain()
      .then(function() {
        resolve(self._wallet);
      })
      .catch(reject);
  });
};

/**
 * Get signer asynchronously (ensures wallet is loaded first)
 * Use this instead of getSigner() when wallet might not be loaded yet
 * @returns {Promise<ethers.Wallet>} Signer connected to Alchemy RPC
 */
SessionWalletManager.prototype.getSignerAsync = function() {
  var self = this;
  return this.ensureWalletLoaded()
    .then(function() {
      var signer = self.getSigner();
      if (!signer) {
        throw new Error('Session wallet signer not available');
      }
      return signer;
    });
};

/**
 * Send ETH from session wallet
 * IMPORTANT: Signs with session wallet's own private key
 * No signature required from main wallet!
 * Uses Alchemy RPC for fast, reliable TX sending
 */
SessionWalletManager.prototype.sendETH = function(toAddress, amount) {
  var self = this;
  return new Promise(function(resolve, reject) {
    // Check if wallet is in memory
    if (!self._wallet) {
      reject(new Error('Session wallet not loaded. Please reveal your private key first to load the wallet into memory.'));
      return;
    }

    // Get network from main wallet module
    var networkName = getMainWalletState().networkName;

    if (networkName !== 'sepolia' && networkName !== 'hardhat') {
      reject(new Error('Unsupported network for withdraw: ' + networkName));
      return;
    }

    Logger.module('SESSION_WALLET').log('Sending ETH via session wallet on network:', networkName);

    // Use centralized Wallet.getActiveRpcProvider() - dynamic RPC based on network
    var provider = getActiveRpcProvider();

    var connectedWallet = self._wallet.connect(provider);

    var tx = {
      to: toAddress,
      value: window.ethers.utils.parseEther(amount.toString()),
    };

    connectedWallet.sendTransaction(tx)
      .then(function(txResponse) {
        Logger.module('SESSION_WALLET').log('TX sent:', txResponse.hash);
        // Wait for confirmation using the same Alchemy provider
        return txResponse.wait();
      })
      .then(function(receipt) {
        Logger.module('SESSION_WALLET').log('TX confirmed:', receipt.transactionHash);
        resolve(receipt.transactionHash);
      })
      .catch(function(err) {
        Logger.module('SESSION_WALLET').error('Send ETH failed:', err);
        reject(err);
      });
  });
};

/**
 * Sign a transaction (for game contract calls)
 */
SessionWalletManager.prototype.signTransaction = function(tx) {
  return this.getSignerAsync()
    .then(function(signer) {
      return signer.sendTransaction(tx);
    });
};

/**
 * Call a contract method
 */
SessionWalletManager.prototype.callContract = function(contractAddress, abi, methodName, args) {
  return this.getSignerAsync()
    .then(function(signer) {
      var contract = new window.ethers.Contract(contractAddress, abi, signer);
      return contract[methodName].apply(contract, args);
    });
};

/**
 * Refresh balance - uses read-only provider (independent of wallet network)
 */
SessionWalletManager.prototype.refreshBalance = function() {
  var self = this;
  var address = this.getAddress();

  if (!address) {
    return Promise.resolve('0.0000');
  }

  // Use centralized Wallet.getActiveRpcProvider() - dynamic RPC based on network
  var provider = getActiveRpcProvider();

  return provider.getBalance(address)
    .then(function(balance) {
      var ethBalance = window.ethers.utils.formatEther(balance);
      self._balance = parseFloat(ethBalance).toFixed(4);
      self.trigger('balanceChanged', self._balance);
      return self._balance;
    })
    .catch(function(err) {
      Logger.module('SESSION_WALLET').error('Failed to get balance:', err);
      return self._balance;
    });
};

/**
 * Start balance polling
 */
SessionWalletManager.prototype.startBalancePolling = function(interval) {
  var self = this;
  interval = interval || 10000;

  if (this._balancePollingInterval) {
    clearInterval(this._balancePollingInterval);
  }

  this.refreshBalance();

  this._balancePollingInterval = setInterval(function() {
    self.refreshBalance();
  }, interval);
};

/**
 * Stop balance polling
 */
SessionWalletManager.prototype.stopBalancePolling = function() {
  if (this._balancePollingInterval) {
    clearInterval(this._balancePollingInterval);
    this._balancePollingInterval = null;
  }
};

/**
 * Clear wallet
 * Removes address from localStorage and clears from blockchain
 */
SessionWalletManager.prototype.clearWallet = function(clearOnChain) {
  var self = this;
  return new Promise(function(resolve, reject) {
    // Clear localStorage (only address) - key is bound to main wallet address
    var storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
    self._wallet = null;
    self._balance = '0.0000';
    self.stopBalancePolling();

    // If requested, also clear from blockchain
    if (clearOnChain !== false) {
      var walletManager = getMainWallet();
      var state = getMainWalletState();
      var vaultAddress = self._getWalletVaultAddress();

      if (state.connected && vaultAddress) {
        var signer = walletManager.getSigner();
        var contract = new window.ethers.Contract(vaultAddress, WALLET_VAULT_ABI, signer);

        contract.clearKey()
          .then(function(tx) {
            return tx.wait();
          })
          .then(function() {
            Logger.module('SESSION_WALLET').log('Wallet cleared from blockchain');
            resolve();
          })
          .catch(function(err) {
            Logger.module('SESSION_WALLET').error('Failed to clear from chain:', err);
            resolve(); // Still resolve since local clear succeeded
          });
        return;
      }
    }

    Logger.module('SESSION_WALLET').log('Wallet cleared');
    resolve();
  });
};

/**
 * Initialize - check if wallet exists and optionally load it
 * Separate session wallet for each main wallet
 */
SessionWalletManager.prototype.initialize = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var storageKey = getStorageKey();
    var address = localStorage.getItem(storageKey);

    if (!address) {
      resolve(null);
      return;
    }

    // Address exists but wallet not in memory
    // Don't automatically retrieve - let user trigger it when needed
    Logger.module('SESSION_WALLET').log('FHE wallet address found for current main wallet:', address);
    resolve(address);
  });
};

/**
 * Sync with blockchain - called after login
 * Saves to localStorage if wallet exists on blockchain
 * Gets network and address info from main wallet.js module
 * @returns {Promise<string|null>} Session wallet address if exists, null otherwise
 */
SessionWalletManager.prototype.syncWithBlockchain = function() {
  var self = this;
  self._syncing = true;
  self.trigger('syncStarted');

  return new Promise(function(resolve, reject) {
    // Get state from main wallet.js module (initialized via IIFE)
    var state = getMainWalletState();

    if (!window.ethers) {
      Logger.module('SESSION_WALLET').log('ethers not available, skipping sync');
      self._syncing = false;
      self._synced = true;
      self.trigger('syncCompleted', null);
      resolve(null);
      return;
    }

    if (!state.connected || !state.address) {
      Logger.module('SESSION_WALLET').log('Wallet not connected, skipping sync');
      self._syncing = false;
      self._synced = true;
      self.trigger('syncCompleted', null);
      resolve(null);
      return;
    }

    var networkName = state.networkName;
    var userAddress = state.address;

    Logger.module('SESSION_WALLET').log('syncWithBlockchain - network:', networkName, 'address:', userAddress);

    // Only support sepolia and hardhat
    if (networkName !== 'sepolia' && networkName !== 'hardhat') {
      Logger.module('SESSION_WALLET').warn('Unsupported network for session wallet sync:', networkName);
      self._syncing = false;
      self._synced = true;
      self.trigger('syncCompleted', null);
      resolve(null);
      return;
    }

    // Get read-only provider from centralized wallet.js
    var readOnlyProvider = getActiveRpcProvider();

    // Get contract addresses for the current network
    var FHESession = require('app/common/fhe_session');
    var addresses = FHESession.DEPLOYED_CONTRACTS[networkName];
    var vaultAddress = addresses ? addresses.WalletVault : null;

    if (!vaultAddress) {
      Logger.module('SESSION_WALLET').warn('No WalletVault address configured for', networkName);
      self._syncing = false;
      self._synced = true;
      self.trigger('syncCompleted', null);
      resolve(null);
      return;
    }

    // Use read-only provider for contract calls
    var contract = new window.ethers.Contract(vaultAddress, WALLET_VAULT_ABI, readOnlyProvider);

    // Check if user has a stored key on blockchain
    contract.hasKey(userAddress)
      .then(function(hasKey) {
        if (!hasKey) {
          Logger.module('SESSION_WALLET').log('No session wallet on blockchain for this user');
          self._syncing = false;
          self._synced = true;
          self.trigger('syncCompleted', null);
          resolve(null);
          return null;
        }

        // Get session wallet address from blockchain
        return contract.getSessionWallet(userAddress);
      })
      .then(function(sessionWalletAddress) {
        if (!sessionWalletAddress) return; // Already resolved

        if (sessionWalletAddress !== '0x0000000000000000000000000000000000000000') {
          Logger.module('SESSION_WALLET').log('Found session wallet on blockchain:', sessionWalletAddress);

          // Save to localStorage (key is based on main wallet address from wallet.js)
          var storageKey = STORAGE_KEY_PREFIX + userAddress.toLowerCase();
          localStorage.setItem(storageKey, sessionWalletAddress);
          Logger.module('SESSION_WALLET').log('Session wallet synced to localStorage with key:', storageKey);

          self._syncing = false;
          self._synced = true;
          self.trigger('syncCompleted', sessionWalletAddress);
          resolve(sessionWalletAddress);
        } else {
          self._syncing = false;
          self._synced = true;
          self.trigger('syncCompleted', null);
          resolve(null);
        }
      })
      .catch(function(err) {
        Logger.module('SESSION_WALLET').error('Error syncing with blockchain:', err);
        self._syncing = false;
        self._synced = true;
        self.trigger('syncCompleted', null);
        resolve(null);
      });
  });
};

/**
 * Check if sync is in progress
 */
SessionWalletManager.prototype.isSyncing = function() {
  return this._syncing || false;
};

/**
 * Check if sync has completed
 */
SessionWalletManager.prototype.isSynced = function() {
  return this._synced || false;
};

// ==================== MODULE EXPORTS ====================
module.exports = {
  getInstance: function() {
    return SessionWalletManager.getInstance();
  },
  hasWallet: function() {
    return SessionWalletManager.getInstance().hasWallet();
  },
  getAddress: function() {
    return SessionWalletManager.getInstance().getAddress();
  },
  getBalance: function() {
    return SessionWalletManager.getInstance().getBalance();
  },
  createWallet: function() {
    return SessionWalletManager.getInstance().createWallet();
  },
  retrieveFromChain: function() {
    return SessionWalletManager.getInstance().retrieveFromChain();
  },
  getPrivateKey: function() {
    return SessionWalletManager.getInstance().getPrivateKey();
  },
  getSigner: function() {
    return SessionWalletManager.getInstance().getSigner();
  },
  getSignerAsync: function() {
    return SessionWalletManager.getInstance().getSignerAsync();
  },
  ensureWalletLoaded: function() {
    return SessionWalletManager.getInstance().ensureWalletLoaded();
  },
  sendETH: function(toAddress, amount) {
    return SessionWalletManager.getInstance().sendETH(toAddress, amount);
  },
  signTransaction: function(tx) {
    return SessionWalletManager.getInstance().signTransaction(tx);
  },
  callContract: function(contractAddress, abi, methodName, args) {
    return SessionWalletManager.getInstance().callContract(contractAddress, abi, methodName, args);
  },
  refreshBalance: function() {
    return SessionWalletManager.getInstance().refreshBalance();
  },
  startBalancePolling: function(interval) {
    return SessionWalletManager.getInstance().startBalancePolling(interval);
  },
  stopBalancePolling: function() {
    return SessionWalletManager.getInstance().stopBalancePolling();
  },
  clearWallet: function(clearOnChain) {
    return SessionWalletManager.getInstance().clearWallet(clearOnChain);
  },
  initialize: function() {
    return SessionWalletManager.getInstance().initialize();
  },
  syncWithBlockchain: function() {
    return SessionWalletManager.getInstance().syncWithBlockchain();
  },
  isSyncing: function() {
    return SessionWalletManager.getInstance().isSyncing();
  },
  isSynced: function() {
    return SessionWalletManager.getInstance().isSynced();
  },
  // Event methods (from Backbone.Events)
  on: function(event, callback) {
    return SessionWalletManager.getInstance().on(event, callback);
  },
  off: function(event, callback) {
    return SessionWalletManager.getInstance().off(event, callback);
  },
  trigger: function(event, data) {
    return SessionWalletManager.getInstance().trigger(event, data);
  }
};
