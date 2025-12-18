'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var SessionWalletPopupTmpl = require('app/ui/templates/item/session_wallet_popup.hbs');
var SessionWallet = require('app/common/session_wallet');
var Wallet = require('app/common/wallet');
var NavigationManager = require('app/ui/managers/navigation_manager');

/**
 * Session Wallet Popup View
 * Displays session wallet UI with balance, address, and actions
 * Uses FHE encryption for private key storage (no PIN needed)
 */
var SessionWalletPopupView = Backbone.Marionette.ItemView.extend({

  className: 'session-wallet-popup-container',

  template: SessionWalletPopupTmpl,

  ui: {
    $walletNotCreated: '.wallet-not-created',
    $walletCreated: '.wallet-created',
    $walletExportKey: '.wallet-export-key',
    $walletWithdraw: '.wallet-withdraw',
    $walletDeposit: '.wallet-deposit',
    $walletCreating: '.wallet-creating',
    $balanceValue: '.balance-value',
    $addressValue: '.address-value',
    $availableAmount: '.available-amount',
    $qrSection: '.wallet-qr-section',
    $qrCanvas: '.qr-canvas',
    $advancedOptions: '.advanced-options',
    $privateKeyDisplay: '.private-key-display',
    $privateKeyText: '.private-key-text',
    $withdrawAmountInput: '.withdraw-amount-input',
    $depositAmountInput: '.deposit-amount-input',
    $mainWalletBalance: '.main-wallet-balance',
    $depositForm: '.deposit-form',
    $depositStatus: '.deposit-status',
    $withdrawForm: '.withdraw-form',
    $withdrawStatus: '.withdraw-status',
    $revealKeyBtn: '.reveal-key-btn',
    $networkBadge: '.wallet-network-badge',
    $networkLabel: '.network-label',
  },

  events: {
    'click .wallet-close-btn': 'onClose',
    'click .wallet-create-btn': 'onCreateWallet',
    'click .copy-address-btn': 'onCopyAddress',
    'click .show-qr-btn': 'onToggleQR',
    'click .deposit-btn': 'onShowDeposit',
    'click .withdraw-btn': 'onShowWithdraw',
    'click .toggle-advanced-btn': 'onToggleAdvanced',
    'click .export-key-btn': 'onShowExportKey',
    'click .clear-wallet-btn': 'onClearWallet',
    'click .reveal-key-btn': 'onRevealKey',
    'click .copy-key-btn': 'onCopyKey',
    'click .back-to-wallet-btn': 'onBackToWallet',
    'click .max-btn': 'onMaxWithdraw',
    'click .confirm-withdraw-btn': 'onConfirmWithdraw',
    'click .confirm-deposit-btn': 'onConfirmDeposit',
    'click .btn-refresh': 'onRefreshBalance',
  },

  initialize: function() {
    this.sessionWallet = SessionWallet;
    var self = this;

    // Listen for balance updates (manual binding - listenTo doesn't work with module wrapper)
    this._onBalanceChanged = function(balance) {
      self.onBalanceChanged(balance);
    };
    SessionWallet.on('balanceChanged', this._onBalanceChanged);

    // Listen for chain changes - update network badge and re-sync
    this._onChainChanged = function(event) {
      Logger.module('SESSION_WALLET').log('Chain changed, updating wallet popup...');
      self.onNetworkChanged();
    };
    window.addEventListener('wallet:chainChanged', this._onChainChanged);
  },

  serializeData: function() {
    var hasWallet = this.sessionWallet.hasWallet();
    var address = hasWallet ? this.sessionWallet.getAddress() : '';
    var shortAddress = address ? address.slice(0, 6) + '...' + address.slice(-4) : '';
    var balance = hasWallet ? this.sessionWallet.getBalance() : '0.0000';

    // Get current network from Wallet module
    var state = Wallet.getState();
    var networkName = 'Unknown';
    var networkClass = 'unknown';

    if (state.networkName === 'sepolia') {
      networkName = 'Sepolia';
      networkClass = 'sepolia';
    } else if (state.networkName === 'hardhat') {
      networkName = 'Hardhat';
      networkClass = 'hardhat';
    } else if (state.chainId) {
      networkName = 'Chain ' + parseInt(state.chainId, 16);
    }

    return {
      hasWallet: hasWallet,
      address: address,
      shortAddress: shortAddress,
      balance: balance,
      networkName: networkName,
      networkClass: networkClass,
    };
  },

  onRender: function() {
    // Initialize tooltips
    this.$el.find('[data-toggle="tooltip"]').tooltip();

    // If wallet exists, start balance polling
    if (this.sessionWallet.hasWallet()) {
      this.sessionWallet.startBalancePolling();
    }
  },

  onDestroy: function() {
    this.$el.find('[data-toggle="tooltip"]').tooltip('destroy');
    this.sessionWallet.stopBalancePolling();

    // Remove balance change listener
    if (this._onBalanceChanged) {
      SessionWallet.off('balanceChanged', this._onBalanceChanged);
      this._onBalanceChanged = null;
    }

    // Remove chain change listener
    if (this._onChainChanged) {
      window.removeEventListener('wallet:chainChanged', this._onChainChanged);
      this._onChainChanged = null;
    }
  },

  onClose: function() {
    this.trigger('close');
  },

  onCreateWallet: function() {
    var self = this;

    // Show loading state
    this.showState('creating');

    // Create wallet directly - no PIN needed
    this.sessionWallet.createWallet()
      .then(function(address) {
        Logger.module('SESSION_WALLET').log('Wallet created successfully:', address);
        self.render();
        self.sessionWallet.startBalancePolling();
      })
      .catch(function(err) {
        Logger.module('SESSION_WALLET').error('Failed to create wallet:', err);
        // No alert - silently return to previous state (user cancelled MetaMask)
        self.showState('not-created');
      });
  },

  onCopyAddress: function() {
    var address = this.sessionWallet.getAddress();
    if (address) {
      navigator.clipboard.writeText(address).then(function() {
        Logger.module('SESSION_WALLET').log('Address copied to clipboard');
      });
    }
  },

  onToggleQR: function() {
    var $qrSection = this.ui.$qrSection;

    if ($qrSection.hasClass('hide')) {
      $qrSection.removeClass('hide');
      this.generateQRCode();
    } else {
      $qrSection.addClass('hide');
    }
  },

  generateQRCode: function() {
    var address = this.sessionWallet.getAddress();
    if (!address) return;

    var canvas = this.ui.$qrCanvas[0];
    if (!canvas) return;

    // Simple QR code generation using canvas
    // For production, use a proper QR library like qrcode.js
    var ctx = canvas.getContext('2d');
    canvas.width = 150;
    canvas.height = 150;

    // Placeholder - draw address text
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 150, 150);
    ctx.fillStyle = '#000';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('QR: ' + address.slice(0, 10), 75, 75);
    ctx.fillText(address.slice(10, 20), 75, 90);

    // TODO: Integrate proper QR library
    Logger.module('SESSION_WALLET').log('QR code placeholder generated for:', address);
  },

  onShowDeposit: function() {
    var self = this;
    this.showState('deposit');
    this.ui.$depositAmountInput.val('');

    // Get main wallet state from Wallet module
    var walletState = Wallet.getState();

    if (!walletState.connected || !walletState.address) {
      this.ui.$mainWalletBalance.text('Not Connected');
      this.$el.find('.confirm-deposit-btn').prop('disabled', true);
      return;
    }

    this.$el.find('.confirm-deposit-btn').prop('disabled', false);
    this.ui.$mainWalletBalance.text('Loading...');

    // Get balance from Wallet module (use Alchemy RPC - fast, no timeout)
    Wallet.getBalanceViaRPC()
      .then(function(balance) {
        if (self.isDestroyed) return;
        var formatted = parseFloat(balance).toFixed(4);
        self.ui.$mainWalletBalance.text(formatted + ' ETH');
      })
      .catch(function(err) {
        if (self.isDestroyed) return;
        Logger.module('SESSION_WALLET').error('Failed to get main wallet balance:', err);
        self.ui.$mainWalletBalance.text('Error');
      });
  },

  onConfirmDeposit: function() {
    var self = this;
    var toAddress = this.sessionWallet.getAddress();
    var amount = this.ui.$depositAmountInput.val();

    if (!toAddress) {
      Logger.module('SESSION_WALLET').error('No session wallet address');
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Logger.module('SESSION_WALLET').error('Invalid deposit amount');
      return;
    }

    // Use wallet.js module for connection check
    var walletState = Wallet.getState();
    if (!walletState.connected || !walletState.address) {
      Logger.module('SESSION_WALLET').error('Main wallet not connected');
      return;
    }

    // Show loading state
    this.ui.$depositForm.addClass('hide');
    this.ui.$depositStatus.removeClass('hide');

    // Use wallet.js sendTransactionAndWait - handles everything via EIP-1193
    // Works with any wallet (MetaMask, Rabby, Coinbase, WalletConnect, etc.)
    Wallet.sendTransactionAndWait(toAddress, amount)
      .then(function(receipt) {
        Logger.module('SESSION_WALLET').log('Deposit confirmed:', receipt.transactionHash);
        // Refresh balance immediately after TX confirms
        return self.sessionWallet.refreshBalance();
      })
      .then(function(newBalance) {
        Logger.module('SESSION_WALLET').log('Balance updated after deposit:', newBalance);
        // Return to wallet view after balance is updated
        self.onBackToWallet();
      })
      .catch(function(err) {
        Logger.module('SESSION_WALLET').error('Deposit failed:', err);
        // Reset form state on error
        self.ui.$depositForm.removeClass('hide');
        self.ui.$depositStatus.addClass('hide');
      });
  },

  onShowWithdraw: function() {
    this.showState('withdraw');
    this.ui.$withdrawAmountInput.val('');
    this.ui.$availableAmount.text(this.sessionWallet.getBalance() + ' ETH');
  },

  onMaxWithdraw: function() {
    var balance = this.sessionWallet.getBalance();
    // Leave some for gas
    var maxAmount = Math.max(0, parseFloat(balance) - 0.001);
    this.ui.$withdrawAmountInput.val(maxAmount.toFixed(6));
  },

  onConfirmWithdraw: function() {
    var self = this;
    var amount = this.ui.$withdrawAmountInput.val();

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Logger.module('SESSION_WALLET').error('Invalid withdraw amount');
      return;
    }

    var mainAddress = Wallet.getState().address;
    if (!mainAddress) {
      Logger.module('SESSION_WALLET').error('Main wallet not connected');
      return;
    }

    // Show loading state
    this.ui.$withdrawForm.addClass('hide');
    this.ui.$withdrawStatus.removeClass('hide');

    // First ensure wallet is loaded (may need FHE decrypt)
    this.sessionWallet.ensureWalletLoaded()
      .then(function() {
        return self.sessionWallet.sendETH(mainAddress, amount);
      })
      .then(function(txHash) {
        Logger.module('SESSION_WALLET').log('Withdraw confirmed:', txHash);
        // Refresh balance immediately
        return self.sessionWallet.refreshBalance();
      })
      .then(function() {
        // Return to wallet view after balance updated
        self.onBackToWallet();
      })
      .catch(function(err) {
        Logger.module('SESSION_WALLET').error('Withdraw failed:', err);
        // Reset form state on error
        self.ui.$withdrawForm.removeClass('hide');
        self.ui.$withdrawStatus.addClass('hide');
      });
  },

  onToggleAdvanced: function() {
    this.ui.$advancedOptions.toggleClass('hide');
  },

  onShowExportKey: function() {
    this.showState('export-key');
    this.ui.$privateKeyDisplay.addClass('hide');
    // Reset reveal button visibility (it gets hidden after successful reveal)
    this.ui.$revealKeyBtn.removeClass('hide');
    // Clear previous private key
    this.ui.$privateKeyText.val('');
  },

  onRevealKey: function() {
    var self = this;
    var $btn = this.ui.$revealKeyBtn;

    // Prevent double-click
    if ($btn.prop('disabled')) {
      return;
    }

    // Save original button content and show loading state
    var originalHtml = $btn.html();
    $btn.prop('disabled', true);
    $btn.addClass('loading');
    $btn.html('<i class="fa fa-spinner fa-spin"></i> <span>Decrypting...</span>');

    // Get private key - this may use FHE decrypt if key is on-chain
    this.sessionWallet.getPrivateKey()
      .then(function(privateKey) {
        self.ui.$privateKeyText.val(privateKey);
        self.ui.$privateKeyDisplay.removeClass('hide');
        // Hide the reveal button after success
        $btn.addClass('hide');
      })
      .catch(function(err) {
        Logger.module('SESSION_WALLET').error('Failed to reveal key:', err);
        alert('Failed to retrieve key: ' + err.message);
      })
      .finally(function() {
        // Restore button state
        $btn.prop('disabled', false);
        $btn.removeClass('loading');
        $btn.html(originalHtml);
      });
  },

  onCopyKey: function() {
    var self = this;
    var privateKey = this.ui.$privateKeyText.val();
    if (privateKey) {
      var $btn = this.$el.find('.copy-key-btn');
      var $text = $btn.find('.copy-text');
      var $icon = $btn.find('i');

      navigator.clipboard.writeText(privateKey).then(function() {
        Logger.module('SESSION_WALLET').log('Private key copied to clipboard');

        // Show success state
        $text.text('Copied (Keep It Safe!)');
        $icon.removeClass('fa-copy').addClass('fa-check');
        $btn.addClass('copied');

        // Reset after 2 seconds
        setTimeout(function() {
          $text.text('Copy');
          $icon.removeClass('fa-check').addClass('fa-copy');
          $btn.removeClass('copied');
        }, 2000);
      });
    }
  },

  onClearWallet: function() {
    var self = this;

    NavigationManager.getInstance().showDialogForConfirmation(
      'Are you sure you want to clear the session wallet? Make sure you have withdrawn all funds!',
      'This action cannot be undone.',
      'Clear Wallet'
    ).then(function() {
      self.sessionWallet.clearWallet()
        .then(function() {
          Logger.module('SESSION_WALLET').log('Wallet cleared');
          self.render();
        })
        .catch(function(err) {
          Logger.module('SESSION_WALLET').error('Failed to clear wallet:', err);
        });
    }).catch(function() {
      // User cancelled - do nothing
    });
  },

  onBackToWallet: function() {
    this.showState('created');
  },

  onRefreshBalance: function() {
    var self = this;
    this.sessionWallet.refreshBalance()
      .then(function(balance) {
        Logger.module('SESSION_WALLET').log('Balance refreshed:', balance);
      });
  },

  onBalanceChanged: function(balance) {
    if (this.ui.$balanceValue instanceof $) {
      this.ui.$balanceValue.text(balance);
    }
    if (this.ui.$availableAmount instanceof $) {
      this.ui.$availableAmount.text(balance + ' ETH');
    }
  },

  /**
   * Handle network change - update badge and re-sync wallet
   */
  onNetworkChanged: function() {
    var self = this;

    // Update network badge
    var state = Wallet.getState();
    var networkName = 'Unknown';
    var networkClass = 'unknown';

    if (state.networkName === 'sepolia') {
      networkName = 'Sepolia';
      networkClass = 'sepolia';
    } else if (state.networkName === 'hardhat') {
      networkName = 'Hardhat';
      networkClass = 'hardhat';
    } else if (state.chainId) {
      networkName = 'Chain ' + parseInt(state.chainId, 16);
    }

    // Update badge UI
    if (this.ui.$networkBadge instanceof $) {
      this.ui.$networkBadge.removeClass('sepolia hardhat unknown').addClass(networkClass);
    }
    if (this.ui.$networkLabel instanceof $) {
      this.ui.$networkLabel.text(networkName);
    }

    // Re-sync wallet with blockchain (different network = different contract addresses)
    Logger.module('SESSION_WALLET').log('Network changed to', networkName, '- re-syncing wallet...');

    this.sessionWallet.syncWithBlockchain()
      .then(function(address) {
        if (address) {
          Logger.module('SESSION_WALLET').log('Wallet synced on new network:', address);
        } else {
          Logger.module('SESSION_WALLET').log('No wallet found on new network');
        }
        // Re-render to update wallet state
        self.render();
        // Restart balance polling
        if (self.sessionWallet.hasWallet()) {
          self.sessionWallet.startBalancePolling();
        }
      })
      .catch(function(err) {
        Logger.module('SESSION_WALLET').error('Failed to sync on network change:', err);
      });
  },

  showState: function(state) {
    // Hide all states
    this.ui.$walletNotCreated.addClass('hide');
    this.ui.$walletCreated.addClass('hide');
    this.ui.$walletExportKey.addClass('hide');
    this.ui.$walletWithdraw.addClass('hide');
    this.ui.$walletDeposit.addClass('hide');
    this.ui.$walletCreating.addClass('hide');

    // Reset form states
    if (this.ui.$depositForm instanceof $) {
      this.ui.$depositForm.removeClass('hide');
      this.ui.$depositStatus.addClass('hide');
    }
    if (this.ui.$withdrawForm instanceof $) {
      this.ui.$withdrawForm.removeClass('hide');
      this.ui.$withdrawStatus.addClass('hide');
    }

    // Show requested state
    switch (state) {
      case 'not-created':
        this.ui.$walletNotCreated.removeClass('hide');
        break;
      case 'created':
        this.ui.$walletCreated.removeClass('hide');
        break;
      case 'export-key':
        this.ui.$walletExportKey.removeClass('hide');
        break;
      case 'withdraw':
        this.ui.$walletWithdraw.removeClass('hide');
        break;
      case 'deposit':
        this.ui.$walletDeposit.removeClass('hide');
        break;
      case 'creating':
        this.ui.$walletCreating.removeClass('hide');
        break;
    }
  },

});

module.exports = SessionWalletPopupView;
