'use strict';

/**
 * Wallet Connection Manager
 * Handles MetaMask/injected provider connections for FHEIGHT
 */

var Promise = require('bluebird');
var Logger = require('app/common/logger');

// Get RPC URL from env or use default
var SEPOLIA_RPC_URL = (typeof process !== 'undefined' && process.env && process.env.SEPOLIA_RPC_URL)
  ? process.env.SEPOLIA_RPC_URL
  : 'https://eth-sepolia.g.alchemy.com/v2/QSKgm3HkNCI9KzcjveL9a';

// Network configurations
var NETWORKS = {
  sepolia: {
    chainId: '0xaa36a7',  // 11155111
    chainName: 'Sepolia Testnet',
    rpcUrls: [SEPOLIA_RPC_URL, 'https://rpc.sepolia.org'],
    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  },
  hardhat: {
    chainId: '0x7a69',  // 31337
    chainName: 'Hardhat Local',
    rpcUrls: ['http://127.0.0.1:8545'],
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: []
  }
};

// Get target network - default to sepolia for browser
var TARGET_NETWORK = (typeof process !== 'undefined' && process.env && process.env.WALLET_NETWORK)
  ? process.env.WALLET_NETWORK
  : 'sepolia';

/**
 * Wallet Manager Class - uses Backbone.Events for event handling
 */
var ethers = require('ethers');

function WalletManager() {
  this.address = null;
  this.connected = false;
  this.provider = null;       // window.ethereum
  this.ethersProvider = null; // ethers.providers.Web3Provider
  this.signer = null;         // ethers signer for TX
  this._eventHandlers = {};
}

// Simple event emitter methods
WalletManager.prototype.on = function(event, callback) {
  if (!this._eventHandlers[event]) {
    this._eventHandlers[event] = [];
  }
  this._eventHandlers[event].push(callback);
};

WalletManager.prototype.off = function(event, callback) {
  if (!this._eventHandlers[event]) return;
  var index = this._eventHandlers[event].indexOf(callback);
  if (index > -1) {
    this._eventHandlers[event].splice(index, 1);
  }
};

WalletManager.prototype.emit = function(event, data) {
  if (!this._eventHandlers[event]) return;
  this._eventHandlers[event].forEach(function(callback) {
    callback(data);
  });
};

WalletManager.prototype.removeListener = WalletManager.prototype.off;

/**
 * Check if wallet provider is available
 */
WalletManager.prototype.isProviderAvailable = function() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * Get the ethereum provider
 */
WalletManager.prototype.getProvider = function() {
  if (!this.isProviderAvailable()) {
    return null;
  }
  return window.ethereum;
};

/**
 * Connect to wallet
 * @returns {Promise<string>} wallet address
 */
WalletManager.prototype.connect = function() {
  var self = this;
  Logger.module('WALLET').log('connect: starting');

  return new Promise(function(resolve, reject) {
    if (!self.isProviderAvailable()) {
      reject(new Error('No wallet provider found. Please install MetaMask.'));
      return;
    }

    var provider = self.getProvider();

    // Request account access
    provider.request({ method: 'eth_requestAccounts' })
      .then(function(accounts) {
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }

        self.address = accounts[0];
        self.connected = true;
        self.provider = provider;

        // ethers.js provider ve signer olustur (TX imzalamak icin)
        Logger.module('WALLET').log('Creating Web3Provider with window.ethereum');
        self.ethersProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        self.signer = self.ethersProvider.getSigner();

        Logger.module('WALLET').log('connect: success', self.address);
        Logger.module('WALLET').log('Signer created:', !!self.signer);

        // Detect and cache current network
        return self.getChainId();
      })
      .then(function(chainId) {
        var networkName = self.getNetworkName(chainId);
        currentNetwork = networkName;
        currentChainId = chainId;
        Logger.module('WALLET').log('connect: network detected', networkName, chainId);

        self.emit('connected', self.address);

        // Listen for account changes
        provider.on('accountsChanged', function(newAccounts) {
          if (newAccounts.length === 0) {
            self.disconnect();
          } else if (newAccounts[0] !== self.address) {
            self.address = newAccounts[0];
            self.emit('accountChanged', self.address);
          }
        });

        // Listen for chain changes
        provider.on('chainChanged', function(chainId) {
          var networkName = self.getNetworkName(chainId);
          currentNetwork = networkName;
          currentChainId = chainId;
          Logger.module('WALLET').log('chainChanged:', chainId, '-> network:', networkName);
          self.emit('chainChanged', { chainId: chainId, network: networkName });
        });

        // Listen for disconnect
        provider.on('disconnect', function() {
          self.disconnect();
        });

        resolve(self.address);
      })
      .catch(function(error) {
        Logger.module('WALLET').error('connect: error', error);
        if (error.code === 4001) {
          reject(new Error('User rejected the connection request'));
        } else {
          reject(error);
        }
      });
  });
};

/**
 * Disconnect wallet
 */
WalletManager.prototype.disconnect = function() {
  Logger.module('WALLET').log('disconnect');
  this.address = null;
  this.connected = false;
  this.provider = null;
  this.ethersProvider = null;
  this.signer = null;
  this.emit('disconnected');
};

/**
 * Sign a message for authentication
 * @param {string} message - Message to sign
 * @returns {Promise<string>} signature
 */
WalletManager.prototype.signMessage = function(message) {
  var self = this;
  Logger.module('WALLET').log('signMessage: starting');

  return new Promise(function(resolve, reject) {
    if (!self.connected || !self.provider) {
      reject(new Error('Wallet not connected'));
      return;
    }

    // Use personal_sign for human-readable message
    self.provider.request({
      method: 'personal_sign',
      params: [message, self.address]
    })
    .then(function(signature) {
      Logger.module('WALLET').log('signMessage: success');
      resolve(signature);
    })
    .catch(function(error) {
      Logger.module('WALLET').error('signMessage: error', error);
      if (error.code === 4001) {
        reject(new Error('User rejected the signature request'));
      } else {
        reject(error);
      }
    });
  });
};

/**
 * Generate login message
 * @returns {string} formatted login message
 */
WalletManager.prototype.generateLoginMessage = function() {
  var timestamp = Date.now();
  return 'Sign this message to login to FHEIGHT.\n\n' +
         'Wallet: ' + this.address + '\n' +
         'Timestamp: ' + timestamp + '\n\n' +
         'This request will not trigger a blockchain transaction or cost any gas fees.';
};

/**
 * Get current chain ID
 * @returns {Promise<string>} chain ID in hex
 */
WalletManager.prototype.getChainId = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!self.provider) {
      reject(new Error('Wallet not connected'));
      return;
    }

    self.provider.request({ method: 'eth_chainId' })
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Switch to target network
 * @param {string} networkName - 'sepolia' or 'hardhat'
 * @returns {Promise}
 */
WalletManager.prototype.switchNetwork = function(networkName) {
  var self = this;
  var network = NETWORKS[networkName || TARGET_NETWORK];

  if (!network) {
    return Promise.reject(new Error('Unknown network: ' + networkName));
  }

  return new Promise(function(resolve, reject) {
    if (!self.provider) {
      reject(new Error('Wallet not connected'));
      return;
    }

    // Try to switch to the network
    self.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }]
    })
    .then(resolve)
    .catch(function(error) {
      // If the chain hasn't been added, add it
      if (error.code === 4902) {
        return self.provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: network.chainId,
            chainName: network.chainName,
            rpcUrls: network.rpcUrls,
            nativeCurrency: network.nativeCurrency,
            blockExplorerUrls: network.blockExplorerUrls
          }]
        }).then(resolve);
      }
      reject(error);
    });
  });
};

/**
 * Check if on correct network
 * @returns {Promise<boolean>}
 */
WalletManager.prototype.isCorrectNetwork = function() {
  var self = this;
  var targetChainId = NETWORKS[TARGET_NETWORK].chainId;

  return this.getChainId().then(function(currentChainId) {
    return currentChainId.toLowerCase() === targetChainId.toLowerCase();
  });
};

/**
 * Format wallet address for display
 * @param {string} address - Full wallet address
 * @returns {string} Shortened address (0x1234...5678)
 */
WalletManager.prototype.formatAddress = function(address) {
  if (!address) return '';
  return address.slice(0, 6) + '...' + address.slice(-4);
};

/**
 * Get wallet address
 * @returns {string} wallet address or null
 */
WalletManager.prototype.getAddress = function() {
  return this.address;
};

/**
 * Get formatted address for username
 * @returns {string}
 */
WalletManager.prototype.getFormattedAddress = function() {
  return this.formatAddress(this.address);
};

/**
 * Get ethers.js signer for signing transactions and typed data
 * @returns {object} ethers Signer object
 */
WalletManager.prototype.getSigner = function() {
  if (!this.signer) {
    throw new Error('Wallet not connected - no signer available');
  }
  return this.signer;
};

/**
 * Get current network name from chain ID
 * @param {string} chainId - Chain ID in hex (e.g. '0xaa36a7')
 * @returns {string} Network name ('sepolia', 'hardhat', or 'unknown')
 */
WalletManager.prototype.getNetworkName = function(chainId) {
  if (!chainId) return 'unknown';
  var normalizedChainId = chainId.toLowerCase();

  for (var networkName in NETWORKS) {
    if (NETWORKS[networkName].chainId.toLowerCase() === normalizedChainId) {
      return networkName;
    }
  }
  return 'unknown';
};

/**
 * Get current network name (async - queries wallet)
 * @returns {Promise<string>} Network name
 */
WalletManager.prototype.getCurrentNetwork = function() {
  var self = this;
  return this.getChainId().then(function(chainId) {
    return self.getNetworkName(chainId);
  });
};

/**
 * Check if FHE is supported on current network
 * @returns {Promise<boolean>}
 */
WalletManager.prototype.isFHESupported = function() {
  return this.getCurrentNetwork().then(function(network) {
    return network === 'sepolia' || network === 'hardhat';
  });
};

/**
 * Get ETH balance for connected address
 * Uses window.ethereum directly to avoid RPC timeout issues
 * @returns {Promise<string>} Balance in ETH
 */
WalletManager.prototype.getBalance = function() {
  var self = this;

  if (!this.address || !this.provider) {
    return Promise.resolve('0');
  }

  Logger.module('WALLET').log('Fetching balance for:', this.address);

  // Use eth_getBalance directly through window.ethereum (wallet's own RPC)
  return this.provider.request({
    method: 'eth_getBalance',
    params: [this.address, 'latest']
  })
  .then(function(balanceHex) {
    // Convert hex wei to decimal ETH
    var balanceWei = parseInt(balanceHex, 16);
    var balanceEth = balanceWei / 1e18;
    var formattedBalance = balanceEth.toFixed(6);
    Logger.module('WALLET').log('Balance:', formattedBalance, 'ETH');
    return formattedBalance;
  })
  .catch(function(err) {
    Logger.module('WALLET').error('Failed to get balance:', err.message);
    return '0';
  });
};

/**
 * Get ETH balance using ethers.js (alternative method)
 * @returns {Promise<string>} Balance in ETH
 */
WalletManager.prototype.getBalanceEthers = function() {
  var self = this;

  if (!this.address || !this.ethersProvider) {
    return Promise.resolve('0');
  }

  Logger.module('WALLET').log('Fetching balance via ethers for:', this.address);

  return this.ethersProvider.getBalance(this.address)
    .then(function(balanceWei) {
      var formattedBalance = ethers.utils.formatEther(balanceWei);
      Logger.module('WALLET').log('Balance (ethers):', formattedBalance, 'ETH');
      return formattedBalance;
    })
    .catch(function(err) {
      Logger.module('WALLET').error('Failed to get balance (ethers):', err.message);
      return '0';
    });
};

/**
 * Get ETH balance using Alchemy RPC (works without wallet connection)
 * Good for reading any address balance
 * @param {string} address - Address to check (defaults to connected wallet)
 * @returns {Promise<string>} Balance in ETH
 */
WalletManager.prototype.getBalanceViaRPC = function(address) {
  var targetAddress = address || this.address;

  if (!targetAddress) {
    return Promise.resolve('0');
  }

  Logger.module('WALLET').log('Fetching balance via Alchemy RPC for:', targetAddress);

  // Create a JsonRpcProvider with Alchemy endpoint
  var rpcProvider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);

  return rpcProvider.getBalance(targetAddress)
    .then(function(balanceWei) {
      var formattedBalance = ethers.utils.formatEther(balanceWei);
      Logger.module('WALLET').log('Balance (Alchemy RPC):', formattedBalance, 'ETH');
      return formattedBalance;
    })
    .catch(function(err) {
      Logger.module('WALLET').error('Failed to get balance via RPC:', err.message);
      return '0';
    });
};

/**
 * Send ETH transaction directly via connected wallet (EIP-1193)
 * Works with any wallet: MetaMask, Rabby, Coinbase, WalletConnect, etc.
 * @param {string} to - Recipient address
 * @param {string} valueEth - Amount in ETH (e.g. "0.1")
 * @returns {Promise<string>} Transaction hash
 */
WalletManager.prototype.sendTransaction = function(to, valueEth) {
  var self = this;

  if (!this.provider || !this.address) {
    return Promise.reject(new Error('Wallet not connected'));
  }

  // Convert ETH to wei hex
  var valueWei = ethers.utils.parseEther(valueEth);
  var valueHex = '0x' + valueWei.toBigInt().toString(16);

  Logger.module('WALLET').log('Sending TX:', valueEth, 'ETH to', to);

  // Use eth_sendTransaction - wallet handles everything (signing + broadcasting + gas estimation)
  return this.provider.request({
    method: 'eth_sendTransaction',
    params: [{
      from: this.address,
      to: to,
      value: valueHex
      // Gas estimation handled by wallet
    }]
  })
  .then(function(txHash) {
    Logger.module('WALLET').log('TX sent:', txHash);
    return txHash;
  });
};

/**
 * Send ETH and wait for confirmation (uses Alchemy RPC for waiting)
 * @param {string} to - Recipient address
 * @param {string} valueEth - Amount in ETH
 * @returns {Promise<object>} Transaction receipt
 */
WalletManager.prototype.sendTransactionAndWait = function(to, valueEth) {
  var self = this;

  return this.sendTransaction(to, valueEth)
    .then(function(txHash) {
      Logger.module('WALLET').log('Waiting for TX confirmation via Alchemy...');
      // Use Alchemy RPC to wait for confirmation (fast, reliable)
      var rpcProvider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
      return rpcProvider.waitForTransaction(txHash);
    })
    .then(function(receipt) {
      Logger.module('WALLET').log('TX confirmed:', receipt.transactionHash);
      return receipt;
    });
};

// Singleton instance
var instance = null;

// Current detected network (updated on connect and chainChanged)
var currentNetwork = null;

// Current chain ID (updated on connect and chainChanged)
var currentChainId = null;

// ==================== EAGER INITIALIZATION ====================
// Modül yüklendiğinde otomatik olarak wallet state'i senkronize et
// Bu sayede sayfa yenilendiğinde connect() çağrılmadan state dolu olur

(function initWalletState() {
  console.log('[EAGER INIT] wallet.js IIFE starting...');

  if (typeof window === 'undefined') {
    console.log('[EAGER INIT] No window, skipping');
    return;
  }

  if (!window.ethereum) {
    console.log('[EAGER INIT] No window.ethereum, skipping');
    return;
  }

  var ethereum = window.ethereum;
  console.log('[EAGER INIT] window.ethereum found, requesting accounts...');

  // 1. Mevcut hesapları al (popup açmaz, sadece daha önce bağlanmış hesapları döner)
  ethereum.request({ method: 'eth_accounts' })
    .then(function(accounts) {
      console.log('[EAGER INIT] eth_accounts result:', accounts);
      if (accounts && accounts.length > 0) {
        console.log('[EAGER INIT] Found connected account:', accounts[0]);

        // Instance oluştur ve state'i doldur
        if (!instance) {
          instance = new WalletManager();
        }
        instance.address = accounts[0];
        instance.connected = true;
        instance.provider = ethereum;

        // ethers provider ve signer oluştur
        if (window.ethers) {
          instance.ethersProvider = new ethers.providers.Web3Provider(ethereum, 'any');
          instance.signer = instance.ethersProvider.getSigner();
        }
      }
    })
    .catch(function(err) {
      console.warn('[EAGER INIT] eth_accounts failed:', err.message);
    });

  // 2. Mevcut chain ID'yi al
  ethereum.request({ method: 'eth_chainId' })
    .then(function(chainId) {
      console.log('[EAGER INIT] Current chainId:', chainId);
      currentChainId = chainId;

      // Network adını belirle
      if (!instance) {
        instance = new WalletManager();
      }
      currentNetwork = instance.getNetworkName(chainId);
      console.log('[EAGER INIT] Network:', currentNetwork);
    })
    .catch(function(err) {
      console.warn('[EAGER INIT] eth_chainId failed:', err.message);
    });

  // 3. Event listener'ları kur (global seviyede, her zaman dinle)
  ethereum.on('accountsChanged', function(accounts) {
    console.log('[GLOBAL] accountsChanged:', accounts);
    if (instance) {
      if (accounts.length === 0) {
        instance.address = null;
        instance.connected = false;
        instance.emit('disconnected');
      } else {
        instance.address = accounts[0];
        instance.connected = true;
        instance.emit('accountChanged', accounts[0]);
      }
    }
  });

  ethereum.on('chainChanged', function(chainId) {
    console.log('[GLOBAL] chainChanged:', chainId);
    currentChainId = chainId;
    if (instance) {
      currentNetwork = instance.getNetworkName(chainId);
      instance.emit('chainChanged', { chainId: chainId, network: currentNetwork });
    }
  });

  console.log('[EAGER INIT] Wallet module initialized with global listeners');
})();

// ==================== MODULE EXPORTS ====================

module.exports = {
  getInstance: function() {
    if (!instance) {
      instance = new WalletManager();
    }
    return instance;
  },
  isProviderAvailable: function() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  },
  NETWORKS: NETWORKS,
  TARGET_NETWORK: TARGET_NETWORK,
  SEPOLIA_RPC_URL: SEPOLIA_RPC_URL,
  getCurrentNetwork: function() {
    return currentNetwork;
  },
  setCurrentNetwork: function(network) {
    currentNetwork = network;
  },
  getBalance: function() {
    if (!instance) return Promise.resolve('0');
    return instance.getBalance();
  },
  // Get balance via Alchemy RPC (works without wallet connection)
  getBalanceViaRPC: function(address) {
    if (!instance) {
      instance = new WalletManager();
    }
    return instance.getBalanceViaRPC(address);
  },
  // Get active RPC URL based on current network
  // Bu method dinamik olarak aktif network'e gore RPC URL dondurur
  // Sepolia -> Alchemy RPC (hizli)
  // Hardhat -> localhost
  // Diger -> null (desteklenmiyor)
  getActiveRpcUrl: function() {
    var network = currentNetwork || TARGET_NETWORK;
    if (network === 'sepolia') {
      return SEPOLIA_RPC_URL;
    } else if (network === 'hardhat' || network === 'localhost') {
      return 'http://127.0.0.1:8545';
    }
    // Fallback to Sepolia for unknown networks
    Logger.module('WALLET').warn('Unknown network for RPC:', network, '- falling back to Sepolia');
    return SEPOLIA_RPC_URL;
  },
  // Aktif network icin RPC provider olusturur (getActiveRpcUrl() kullanir)
  getActiveRpcProvider: function() {
    var rpcUrl = module.exports.getActiveRpcUrl();
    return new ethers.providers.JsonRpcProvider(rpcUrl);
  },
  // Aktif network icin chainId dondurur (number)
  getActiveChainId: function() {
    var network = currentNetwork || TARGET_NETWORK;
    if (network === 'sepolia') {
      return 11155111;
    } else if (network === 'hardhat' || network === 'localhost') {
      return 31337;
    }
    // Fallback to Sepolia
    Logger.module('WALLET').warn('Unknown network for chainId:', network, '- falling back to Sepolia');
    return 11155111;
  },
  // Aktif network ismini dondurur (string)
  getActiveNetwork: function() {
    return currentNetwork || TARGET_NETWORK;
  },
  // Get current wallet state (for UI components)
  getState: function() {
    return {
      networkName: currentNetwork || 'unknown',
      chainId: currentChainId,
      connected: instance ? instance.connected : false,
      address: instance ? instance.address : null
    };
  },
  // Set current chain ID (called when chain changes)
  setCurrentChainId: function(chainId) {
    currentChainId = chainId;
  },
  // Switch network (proxy to instance)
  switchNetwork: function(networkName) {
    if (!instance) {
      instance = new WalletManager();
    }
    return instance.switchNetwork(networkName);
  }
};
