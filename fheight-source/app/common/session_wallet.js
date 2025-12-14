'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var _ = require('underscore');
var Backbone = require('backbone');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');

// Storage keys - SADECE address ve on-chain status kaydet, private key ASLA!
// Key artik ana cüzdan adresine bagli: fheight_session_wallet_address_<mainWalletAddress>
var STORAGE_KEY_PREFIX = 'fheight_session_wallet_address_';

/**
 * Get the correct ethereum provider via Wallet module (uses EIP-6963)
 */
function getEthereumProvider() {
  var Wallet = require('app/common/wallet');
  var walletManager = Wallet.getInstance();
  return walletManager.getProvider();
}

// Cache for main wallet address (set by syncWithBlockchain)
var _cachedMainWalletAddress = null;

/**
 * Get storage key for current main wallet
 * Her ana cüzdan icin ayri session wallet
 */
function getStorageKey() {
  // First check cache (set by syncWithBlockchain)
  if (_cachedMainWalletAddress) {
    return STORAGE_KEY_PREFIX + _cachedMainWalletAddress.toLowerCase();
  }

  // Fallback to walletManager.address
  var Wallet = require('app/common/wallet');
  var walletManager = Wallet.getInstance();
  var mainAddress = walletManager.address;

  if (!mainAddress) {
    // Fallback - ama normalde bu durum olmamali
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
 * ONEMLI: Private key ASLA localStorage'a kaydedilmez!
 *
 * Akis:
 * 1. createWallet() cagrilinca:
 *    - Random wallet olustur (memory'de)
 *    - Private key'i FHE ile sifrele
 *    - TX at ve WalletVault'a kaydet
 *    - Sadece ADDRESS localStorage'a kaydedilir
 *
 * 2. Private key gerektiginde:
 *    - userDecrypt ile blockchain'den al
 *    - Kullan ve unut (memory'de kalir, diske yazilmaz)
 */
var SessionWalletManager = function() {
  this._wallet = null;  // Memory'de, localStorage'a YAZILMAZ
  this._balance = '0.0000';
  this._balancePollingInterval = null;
  this._provider = null;
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
 * Her ana cüzdan icin ayri kontrol edilir
 */
SessionWalletManager.prototype.hasWallet = function() {
  var storageKey = getStorageKey();
  return !!localStorage.getItem(storageKey);
};

/**
 * Get wallet address
 * Her ana cüzdan icin ayri adres döner
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

/**
 * Get ethers provider (connected to wallet - for signing transactions)
 */
SessionWalletManager.prototype._getProvider = function() {
  if (!this._provider && window.ethers) {
    var provider = getEthereumProvider();
    if (provider) {
      this._provider = new window.ethers.providers.Web3Provider(provider);
    }
  }
  return this._provider;
};

/**
 * Get read-only provider for current network (for READ operations)
 * Uses Wallet.getReadOnlyProvider() with current network name
 * IMPORTANT: This now respects the active network!
 */
SessionWalletManager.prototype._getReadOnlyProvider = function() {
  var Wallet = require('app/common/wallet');
  var state = Wallet.getState();
  var networkName = state.networkName;

  // Only support sepolia and hardhat
  if (networkName !== 'sepolia' && networkName !== 'hardhat') {
    Logger.module('SESSION_WALLET').warn('Unsupported network for session wallet:', networkName);
    return null;
  }

  Logger.module('SESSION_WALLET').log('Getting read-only provider for network:', networkName);
  return Wallet.getReadOnlyProvider(networkName);
};

/**
 * Create FHE Wallet - tek adimda wallet olustur ve blockchain'e kaydet
 *
 * AKIS:
 * 1. Random wallet olustur (memory)
 * 2. Private key'i FHE ile sifrele
 * 3. TX at -> WalletVault.storeKey()
 * 4. Sadece address'i localStorage'a kaydet
 * 5. Private key ASLA diske yazilmaz!
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

      var ethProvider = getEthereumProvider();
      if (!ethProvider) {
        reject(new Error('MetaMask not found. Please install MetaMask.'));
        return;
      }

      var Wallet = require('app/common/wallet');
      var walletManager = Wallet.getInstance();

      // Wallet bağlı değilse önce bağlanmayı dene
      var connectPromise;
      if (!walletManager.connected || !walletManager.address) {
        Logger.module('SESSION_WALLET').log('Main wallet not connected, attempting to connect...');
        connectPromise = walletManager.connect();
      } else {
        connectPromise = Promise.resolve(walletManager.address);
      }

      connectPromise.then(function() {
        if (!walletManager.connected || !walletManager.address) {
          throw new Error('Failed to connect main wallet');
        }
        return self._createWalletInternal(walletManager);
      })
      .then(resolve)
      .catch(reject);

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

      // Step 1: Create random wallet (in memory only!)
      var wallet = window.ethers.Wallet.createRandom();
      var privateKey = wallet.privateKey;
      var address = wallet.address;

      Logger.module('SESSION_WALLET').log('Wallet created in memory:', address);
      Logger.module('SESSION_WALLET').log('Encrypting private key with FHE...');

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
          // SepoliaConfig for FHEVM instance
          var config = {
            aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
            kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
            inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
            verifyingContractAddressDecryption: '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
            verifyingContractAddressInputVerification: '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
            chainId: 11155111,
            gatewayChainId: 10901,
            network: getEthereumProvider(),
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
          return tx.wait();
        })
        .then(function(receipt) {
          Logger.module('SESSION_WALLET').log('FHE wallet created and stored on-chain:', receipt.transactionHash);

          // Step 4: Save ONLY address to localStorage (NOT private key!)
          // Key ana cüzdan adresine bagli
          var storageKey = getStorageKey();
          localStorage.setItem(storageKey, address);

          // Keep wallet in memory for immediate use
          self._wallet = wallet;

          // Private key artik memory'de, localStorage'a YAZILMADI!
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
 * Bu fonksiyon private key'i memory'e alir ama ASLA diske yazmaz!
 *
 * @returns {Promise<string>} The decrypted private key
 */
SessionWalletManager.prototype.retrieveFromChain = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    // Login olmuşsak MetaMask zaten bağlı, doğru provider'ı al
    var ethProvider = getEthereumProvider();
    if (!ethProvider) {
      reject(new Error('MetaMask not found'));
      return;
    }

    var fheSession = null;
    var vaultAddress = null;
    var userAddress = null;
    var ethersProvider = null;
    var signer = null;

    // Önce MetaMask'tan hesap al
    ethProvider.request({ method: 'eth_accounts' })
      .then(function(accounts) {
        if (!accounts || accounts.length === 0) {
          throw new Error('No wallet connected. Please connect your wallet first.');
        }

        userAddress = accounts[0];
        Logger.module('SESSION_WALLET').log('Using wallet address:', userAddress);

        // ethers provider ve signer oluştur
        ethersProvider = new window.ethers.providers.Web3Provider(ethProvider);
        signer = ethersProvider.getSigner();

        fheSession = self._getFHESession();
        vaultAddress = self._getWalletVaultAddress();

        // FHE session initialize edilmemişse veya WalletVault izinli değilse yeni session gerekli
        var sessionContracts = fheSession.contractAddresses || [];
        var hasWalletVaultPermission = sessionContracts.some(function(addr) {
          return addr && addr.toLowerCase() === vaultAddress.toLowerCase();
        });

        if (!fheSession.isSessionValid() || !hasWalletVaultPermission) {
          Logger.module('SESSION_WALLET').log('FHE session needs WalletVault permission, clearing and reinitializing...');
          Logger.module('SESSION_WALLET').log('Current session contracts:', sessionContracts);
          Logger.module('SESSION_WALLET').log('WalletVault address:', vaultAddress);

          // Mevcut session'ı temizle ve WalletVault dahil yeni session oluştur
          fheSession.clearSession();

          // Tüm contract'ları dahil et (GameSession + WalletVault)
          var FHESession = require('app/common/fhe_session');
          var addresses = FHESession.getInstance().getContractAddresses();
          var allContracts = [addresses.GameSession, vaultAddress].filter(Boolean);

          Logger.module('SESSION_WALLET').log('Creating new session with contracts:', allContracts);
          return fheSession.initializeSession(allContracts);
        }

        Logger.module('SESSION_WALLET').log('Existing session has WalletVault permission');
        return Promise.resolve();
      })
      .then(function() {

        if (!vaultAddress) {
          throw new Error('WalletVault contract address not configured');
        }

        Logger.module('SESSION_WALLET').log('Retrieving encrypted key from WalletVault...');

        var contract = new window.ethers.Contract(vaultAddress, WALLET_VAULT_ABI, ethersProvider);

        // First check if user has stored key
        return contract.hasKey(userAddress);
      })
      .then(function(hasKey) {
        if (!hasKey) {
          throw new Error('No key stored for this wallet');
        }

        // Get encrypted key handle
        var contract = new window.ethers.Contract(vaultAddress, WALLET_VAULT_ABI, signer);
        return contract.getEncryptedKey();
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

        // Reconstruct wallet IN MEMORY ONLY - localStorage'a YAZMA!
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
 * ONEMLI: Bu fonksiyon private key'i ASLA localStorage'a yazmaz!
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
 */
SessionWalletManager.prototype.getSigner = function() {
  if (!this._wallet) {
    // Wallet not in memory - needs to be retrieved first
    return null;
  }

  var provider = this._getProvider();
  if (!provider) {
    return null;
  }

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
 * Send ETH from session wallet
 * ONEMLI: Session wallet'in kendi private key'i ile imzalar
 * Ana cüzdandan sign istenmez!
 */
SessionWalletManager.prototype.sendETH = function(toAddress, amount) {
  var self = this;
  return new Promise(function(resolve, reject) {
    // Check if wallet is in memory
    if (!self._wallet) {
      reject(new Error('Session wallet not loaded. Please reveal your private key first to load the wallet into memory.'));
      return;
    }

    // Get read-only provider and connect session wallet to it
    var Wallet = require('app/common/wallet');
    var networkName = Wallet.getState().networkName;

    // Get the appropriate RPC URL based on network
    var rpcUrl;
    if (networkName === 'sepolia') {
      rpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com';
    } else if (networkName === 'hardhat') {
      rpcUrl = 'http://127.0.0.1:8545';
    } else {
      reject(new Error('Unsupported network for withdraw: ' + networkName));
      return;
    }

    Logger.module('SESSION_WALLET').log('Sending ETH via session wallet on network:', networkName);

    // Create provider and connect session wallet directly (NO MetaMask needed!)
    var provider = new window.ethers.providers.JsonRpcProvider(rpcUrl);
    var connectedWallet = self._wallet.connect(provider);

    var tx = {
      to: toAddress,
      value: window.ethers.utils.parseEther(amount.toString()),
    };

    connectedWallet.sendTransaction(tx)
      .then(function(txResponse) {
        Logger.module('SESSION_WALLET').log('TX sent:', txResponse.hash);
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
  var self = this;
  return this.ensureWalletLoaded()
    .then(function() {
      var signer = self.getSigner();
      if (!signer) {
        throw new Error('Wallet not available');
      }
      return signer.sendTransaction(tx);
    });
};

/**
 * Call a contract method
 */
SessionWalletManager.prototype.callContract = function(contractAddress, abi, methodName, args) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.ensureWalletLoaded()
      .then(function() {
        var signer = self.getSigner();
        if (!signer) {
          throw new Error('Wallet not available');
        }

        var contract = new window.ethers.Contract(contractAddress, abi, signer);
        return contract[methodName].apply(contract, args);
      })
      .then(function(txResponse) {
        resolve(txResponse);
      })
      .catch(function(err) {
        reject(err);
      });
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

  // Use read-only provider - always connects to target network (Sepolia)
  // This works regardless of what network the user's wallet is on
  var provider = this._getReadOnlyProvider();
  if (!provider) {
    Logger.module('SESSION_WALLET').warn('No read-only provider available for balance check');
    return Promise.resolve(this._balance);
  }

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
    // Clear localStorage (only address) - key ana cüzdan adresine bagli
    var storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
    self._wallet = null;
    self._balance = '0.0000';
    self.stopBalancePolling();

    // If requested, also clear from blockchain
    if (clearOnChain !== false) {
      var Wallet = require('app/common/wallet');
      var walletManager = Wallet.getInstance();
      var vaultAddress = self._getWalletVaultAddress();

      if (walletManager.connected && vaultAddress) {
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
 * Her ana cüzdan icin ayri session wallet
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
 * Sync with blockchain - login sonrasi cagrilir
 * Blockchain'de wallet varsa localStorage'a kaydeder
 * ONEMLI: Read-only provider kullanir - wallet hangi agda olursa olsun calisir!
 * @returns {Promise<string|null>} Session wallet address if exists, null otherwise
 */
SessionWalletManager.prototype.syncWithBlockchain = function() {
  var self = this;
  self._syncing = true;
  self.trigger('syncStarted');

  return new Promise(function(resolve, reject) {
    // Safety check - ensure MetaMask/wallet is fully initialized
    // SES sandbox needs time to fully initialize window.ethereum
    var walletProvider = null;
    try {
      walletProvider = getEthereumProvider();
    } catch (e) {
      Logger.module('SESSION_WALLET').warn('getEthereumProvider threw error (wallet not ready?):', e.message);
      self._syncing = false;
      self._synced = true;
      self.trigger('syncCompleted', null);
      resolve(null);
      return;
    }

    if (!walletProvider || !window.ethers) {
      Logger.module('SESSION_WALLET').log('No provider or ethers available, skipping sync');
      self._syncing = false;
      self._synced = true;
      self.trigger('syncCompleted', null);
      resolve(null);
      return;
    }

    // Additional check - ensure provider is ready
    if (typeof walletProvider.request !== 'function') {
      Logger.module('SESSION_WALLET').warn('Wallet provider not ready (no request method), skipping sync');
      self._syncing = false;
      self._synced = true;
      self.trigger('syncCompleted', null);
      resolve(null);
      return;
    }

    var Wallet = require('app/common/wallet');

    // CRITICAL: First fetch chainId from wallet and update Wallet module state
    // This ensures network is known BEFORE we try to get read-only provider
    walletProvider.request({ method: 'eth_chainId' })
      .then(function(chainId) {
        Logger.module('SESSION_WALLET').log('syncWithBlockchain - fetched chainId from wallet:', chainId);

        // Update Wallet module's cached network state
        var walletManager = Wallet.getInstance();
        var networkName = walletManager.getNetworkName(chainId);
        Wallet.setCurrentNetwork(networkName);
        Wallet.setCurrentChainId(chainId);

        Logger.module('SESSION_WALLET').log('syncWithBlockchain - network set to:', networkName);

        // Now get read-only provider (should work now that network is set)
        var readOnlyProvider = self._getReadOnlyProvider();
        if (!readOnlyProvider) {
          Logger.module('SESSION_WALLET').warn('No read-only provider available, skipping sync');
          self._syncing = false;
          self._synced = true;
          self.trigger('syncCompleted', null);
          resolve(null);
          return null;
        }

        // Only support sepolia and hardhat
        if (networkName !== 'sepolia' && networkName !== 'hardhat') {
          Logger.module('SESSION_WALLET').warn('Unsupported network for session wallet sync:', networkName);
          self._syncing = false;
          self._synced = true;
          self.trigger('syncCompleted', null);
          resolve(null);
          return null;
        }

        Logger.module('SESSION_WALLET').log('syncWithBlockchain - using network:', networkName);

        return { readOnlyProvider: readOnlyProvider, networkName: networkName };
      })
      .then(function(context) {
        if (!context) return null; // Already resolved

        var readOnlyProvider = context.readOnlyProvider;
        var networkName = context.networkName;

        // Get contract addresses for current network
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

        // Get main wallet address from connected wallet (this is user identity, not network-dependent)
        walletProvider.request({ method: 'eth_accounts' })
          .then(function(accounts) {
            if (!accounts || accounts.length === 0) {
              Logger.module('SESSION_WALLET').log('No wallet connected');
              self._syncing = false;
              self._synced = true;
              self.trigger('syncCompleted', null);
              resolve(null);
              return null;
            }

            var userAddress = accounts[0];
            Logger.module('SESSION_WALLET').log('Main wallet address:', userAddress);

            // Cache main wallet address immediately so getStorageKey() works
            _cachedMainWalletAddress = userAddress;

            // Use read-only provider for contract calls - this is the key fix!
            var contract = new window.ethers.Contract(vaultAddress, WALLET_VAULT_ABI, readOnlyProvider);

            // Check if user has a stored key on blockchain
            return contract.hasKey(userAddress)
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
                return contract.getSessionWallet(userAddress)
                  .then(function(sessionWalletAddress) {
                    return { sessionWalletAddress: sessionWalletAddress, userAddress: userAddress };
                  });
              });
          })
          .then(function(result) {
            if (!result) return; // Already resolved

            var sessionWalletAddress = result.sessionWalletAddress;
            var mainWalletAddress = result.userAddress;

            if (sessionWalletAddress && sessionWalletAddress !== '0x0000000000000000000000000000000000000000') {
              Logger.module('SESSION_WALLET').log('Found session wallet on blockchain:', sessionWalletAddress);

              // Save to localStorage
              if (mainWalletAddress) {
                _cachedMainWalletAddress = mainWalletAddress;
                var storageKey = STORAGE_KEY_PREFIX + mainWalletAddress.toLowerCase();
                localStorage.setItem(storageKey, sessionWalletAddress);
                Logger.module('SESSION_WALLET').log('Session wallet synced to localStorage with key:', storageKey);
              }

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

module.exports = SessionWalletManager;
