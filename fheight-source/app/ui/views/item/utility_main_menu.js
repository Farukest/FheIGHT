'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var UtilityMainMenuTmpl = require('app/ui/templates/item/utility_main_menu.hbs');
var ChatManager = require('app/ui/managers/chat_manager');
var QuestsManager = require('app/ui/managers/quests_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var ServerStatusManager = require('app/ui/managers/server_status_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var QuestLogLayout = require('app/ui/views2/quests/quest_log_layout');
var ProfileLayout = require('app/ui/views2/profile/profile_layout');
var ProgressionManager = require('app/ui/managers/progression_manager');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var ShopManager = require('app/ui/managers/shop_manager');
var Session = require('app/common/session2');
var PremiumPurchaseDialog = require('app/ui/views2/shop/premium_purchase_dialog');
var openUrl = require('app/common/openUrl');
var i18next = require('i18next');
var BosterPackUnlockView = require('../layouts/booster_pack_collection');
var UtilityMenuItemView = require('./utility_menu');
var Wallet = require('app/common/wallet');
// Session wallet imports are done lazily to avoid load-time issues
var SessionWallet = null;
var SessionWalletPopupView = null;

/**
 * Out of game utility menu that shows basic utilities plus buttons for quests, profile, shop, and gold/boosters.
 */
var UtilityMainMenuItemView = UtilityMenuItemView.extend({

  id: 'app-utility-main-menu',

  template: UtilityMainMenuTmpl,

  ui: {
    $goldCount: '.gold-count',
    $goldButton: '.gold',
    $diamondCount: '.diamond-count',
    $diamondButton: '.diamond',
    $networkIndicator: '.network-indicator',
    $networkName: '.network-name',
    $boosterPackCollection: '.booster-pack-collection',
    $boosterPackCountLabel: '.booster-pack-count-label',
    $boosterPackCountNumberLabel: '.booster-pack-count-label > span.count',
    $boosterPackStaticLabel: '.booster-pack-count-label > span.booster-pack-descriptor',
    $symbolBoosterPackCenter: '.symbol-booster-pack-center',
    $symbolBoosterPackRing: '.symbol-booster-pack-ring',
    $symbolBoosterPackCaret: '.symbol-booster-pack-caret',
    $btnGroup: '.btn-group',
    $questButton: '.quest-log',
    $profileButton: '.profile',
    $armoryButton: '.armory-button',
    $shopButton: '.shop',
    $sessionWalletButton: '.session-wallet',
    $walletBtnText: '.wallet-btn-text',
  },

  events: {
    'click button': 'onClickRemoveEmphasis',
    'click button.shop': 'toggleShop',
    'click button.quest-log': 'toggleQuestLog',
    'click button.profile': 'toggleProfile',
    'click button.session-wallet': 'toggleSessionWallet',
    'click .gold': 'onGoldClicked',
    'click .diamond': 'onDiamondClicked',
    'click .armory-button': 'toggleShop',
    'click .booster-pack-collection': 'onClickBoosterPackCollection',
    'mouseenter .booster-pack-collection': 'activateSymbolBoosterPack',
    'mouseleave .booster-pack-collection': 'deactivateSymbolBoosterPack',
    'click .network-indicator': 'onNetworkIndicatorClicked',
  },

  templateHelpers: {
    isShopEnabled: function () {
      return ServerStatusManager.getInstance().isShopEnabled();
    },
  },

  onBeforeRender: function () {
    // stop any activated symbols
    this.deactivateSymbolBoosterPack();

    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
    this.$el.find('[data-toggle=\'popover\']').popover('destroy');
  },

  onDestroy: function () {
    UtilityMenuItemView.prototype.onDestroy.apply(this, arguments);

    this.deactivateSymbolBoosterPack();

    if (this._showNewPlayerUITimeoutId != null) {
      clearTimeout(this._showNewPlayerUITimeoutId);
      this._showNewPlayerUITimeoutId = null;
    }

    // Clean up session wallet popup
    if (this._sessionWalletPopup) {
      this._sessionWalletPopup.destroy();
      this._sessionWalletPopup = null;
    }
  },

  onLoggedInShow: function () {
    UtilityMenuItemView.prototype.onLoggedInShow.apply(this, arguments);

    this.listenTo(InventoryManager.getInstance().walletModel, 'change:gold_amount', this.onUpdateGoldCount);
    this.listenTo(InventoryManager.getInstance().boosterPacksCollection, 'add remove', this.onUpdateBoosters);
    this.listenTo(InventoryManager.getInstance().walletModel, 'change:premium_amount', this.onPremiumCurrencyChange);

    // show new player UI after short delay
    this._showNewPlayerUITimeoutId = setTimeout(function () {
      this._showNewPlayerUITimeoutId = null;
      this._showNewPlayerUI();
    }.bind(this), 1500);

    this.onUpdateGoldCount();
    this.onUpdateBoosters();
    this.onPremiumCurrencyChange();
    this.onUpdateNetworkIndicator();

    // Listen for session wallet sync events
    this._setupSessionWalletSyncListeners();

    // Listen for chain changes from wallet
    var self = this;

    // Store bound handlers for cleanup
    this._onChainChanged = function() {
      self.onUpdateNetworkIndicator();
    };

    this._onWalletDisconnected = function() {
      Logger.module('UI').log('Wallet disconnected, logging out...');
      Session.logout();
    };

    Wallet.on('chainChanged', this._onChainChanged);
    Wallet.on('disconnected', this._onWalletDisconnected);

    // Listen to wallet custom events for chain and account changes
    this._onWalletChainChanged = function(event) {
      var chainId = event.detail.chainId;
      Logger.module('UI').log('Wallet chainChanged event:', chainId);
      self.onUpdateNetworkIndicator();
    };
    window.addEventListener('wallet:chainChanged', this._onWalletChainChanged);

    this._onWalletAccountsChanged = function(event) {
      var address = event.detail.address;
      var isConnected = event.detail.isConnected;
      Logger.module('UI').log('Wallet accountsChanged event:', address, 'connected:', isConnected);

      if (!isConnected || !address) {
        Logger.module('UI').log('Wallet disconnected, logging out...');
        Session.logout();
      }
    };
    window.addEventListener('wallet:accountsChanged', this._onWalletAccountsChanged);
  },

  onLoggedOutShow: function () {
    UtilityMenuItemView.prototype.onLoggedOutShow.apply(this, arguments);

    this.stopListening(InventoryManager.getInstance().walletModel, 'change:gold_amount', this.onUpdateGoldCount);
    this.stopListening(InventoryManager.getInstance().boosterPacksCollection, 'add remove', this.onUpdateBoosters);
    this.stopListening(InventoryManager.getInstance().walletModel, 'change:premium_amount', this.onPremiumCurrencyChange);

    // Cleanup session wallet sync listeners
    this._cleanupSessionWalletSyncListeners();

    // Cleanup wallet event listeners
    if (this._onChainChanged) {
      Wallet.off('chainChanged', this._onChainChanged);
    }
    if (this._onWalletDisconnected) {
      Wallet.off('disconnected', this._onWalletDisconnected);
    }

    // Cleanup wallet event listeners
    if (this._onWalletChainChanged) {
      window.removeEventListener('wallet:chainChanged', this._onWalletChainChanged);
    }
    if (this._onWalletAccountsChanged) {
      window.removeEventListener('wallet:accountsChanged', this._onWalletAccountsChanged);
    }
  },

  onLoggedInRender: function () {
    UtilityMenuItemView.prototype.onLoggedInRender.apply(this, arguments);

    var newPlayerManager = NewPlayerManager.getInstance();
    if (!newPlayerManager.canSeeArmory()) {
      this.ui.$armoryButton.addClass('hide');
      this.ui.$goldButton.addClass('hide');
      this.ui.$diamondButton.addClass('hide');
      this.ui.$shopButton.addClass('hide');
    } else {
      this.ui.$armoryButton.removeClass('hide');
      this.ui.$goldButton.removeClass('hide');
      this.ui.$diamondButton.removeClass('hide');
      this.ui.$shopButton.removeClass('hide');
      this.onUpdateGoldCount();
      this.onPremiumCurrencyChange();
    }

    if (!newPlayerManager.canSeeSpiritOrbs()) {
      this.ui.$symbolBoosterPackCaret.addClass('hide');
      this.ui.$boosterPackCountLabel.addClass('hide');
      this.ui.$boosterPackCollection.addClass('hide');
    } else {
      this.ui.$symbolBoosterPackCaret.removeClass('hide');
      this.ui.$boosterPackCountLabel.removeClass('hide');
      this.ui.$boosterPackCollection.removeClass('hide');
    }

    if (!newPlayerManager.canSeeQuests()) {
      this.ui.$questButton.addClass('hide');
    } else {
      this.ui.$questButton.removeClass('hide');
    }

    if (!newPlayerManager.canSeeProfile()) {
      this.ui.$profileButton.addClass('hide');
    } else {
      this.ui.$profileButton.removeClass('hide');
    }
  },

  onLoggedOutRender: function () {
    UtilityMenuItemView.prototype.onLoggedOutRender.apply(this, arguments);
    this.ui.$armoryButton.addClass('hide');
    this.ui.$goldButton.addClass('hide');
    this.ui.$diamondButton.addClass('hide');
    this.ui.$shopButton.addClass('hide');
    this.ui.$symbolBoosterPackCaret.addClass('hide');
    this.ui.$boosterPackCountLabel.addClass('hide');
    this.ui.$boosterPackCollection.addClass('hide');
    this.ui.$questButton.addClass('hide');
    this.ui.$profileButton.addClass('hide');
  },

  _showNewPlayerUI: function () {
    if (ProfileManager.getInstance().get('id')) {
      var newPlayerManager = NewPlayerManager.getInstance();

      if (newPlayerManager.canSeeSpiritOrbs() && !newPlayerManager.getHasOpenedSpiritOrb()) {
        this.ui.$boosterPackCollection.popover({
          content: i18next.t('new_player_experience.highlight_open_spirit_orbs_popover'),
          container: this.$el,
          animation: true,
        });
        this.ui.$boosterPackCollection.popover('show');
      }

      if (newPlayerManager.getEmphasizeQuests()) {
        this.ui.$questButton.popover({
          title: '',
          content: i18next.t('new_player_experience.new_quests_popover'),
          container: this.$el,
          placement: 'top',
          animation: true,
        });
        this.ui.$questButton.popover('show');
        this.ui.$questButton.addClass('glow');
      } else {
        this.ui.$questButton.removeClass('glow');
        this.ui.$questButton.popover('destroy');
      }
    }
  },

  onClickRemoveEmphasis: function (e) {
    $(e.currentTarget).removeClass('glow');
    $(e.currentTarget).popover('destroy');
  },

  onUpdateGoldCount: function () {
    var goldCount = InventoryManager.getInstance().walletModel.get('gold_amount') || 0;
    if (this.ui.$goldCount instanceof $) {
      this.ui.$goldCount.text(goldCount);
    }

    // if we have enough gold to buy a booster or have any boosters, activate the symbol animation
    if (goldCount > 100 || InventoryManager.getInstance().boosterPacksCollection.length > 0) {
      this.activateSymbolBoosterPack();
    }

    // emphasize armory
    var newPlayerManager = NewPlayerManager.getInstance();
    if (newPlayerManager.canSeeArmory()) {
      if (newPlayerManager.getEmphasizeBoosterUnlock()) {
        this.ui.$shopButton.popover({
          content: i18next.t('new_player_experience.buy_spirit_orb'),
          container: this.$el,
          placement: 'top',
          animation: true,
        });
        this.ui.$shopButton.popover('show');
        this.ui.$shopButton.addClass('glow');
      } else if (ShopManager.getInstance().availableSpecials.length > 0 && newPlayerManager.getModuleStage(ShopManager.getInstance().availableSpecials.at(ShopManager.getInstance().availableSpecials.length - 1).id.toLowerCase()) !== 'read') {
        this.ui.$shopButton.popover({
          content: i18next.t('main_menu.new_shop_special_available_popover'),
          container: this.$el,
          placement: 'top',
          animation: true,
        });
        this.ui.$shopButton.popover('show');
        this.ui.$shopButton.addClass('glow');
      } else {
        this.ui.$shopButton.removeClass('glow');
        this.ui.$shopButton.popover('destroy');
      }
    }
  },

  onPremiumCurrencyChange: function () {
    this.ui.$diamondCount.text(InventoryManager.getInstance().getWalletModelPremiumAmount());
  },

  onUpdateNetworkIndicator: function () {
    if (!(this.ui.$networkIndicator instanceof $)) return;

    // Check if wallet provider is available
    if (!Wallet.isProviderAvailable()) {
      this.ui.$networkIndicator.removeClass('sepolia hardhat').addClass('unknown');
      this.ui.$networkName.text('No Wallet');
      return;
    }

    // Get state from wallet module (kept fresh by polling engine)
    var state = Wallet.getState();
    var network = state.networkName;
    var chainId = state.chainId;

    // Remove all network classes first
    this.ui.$networkIndicator.removeClass('sepolia hardhat unknown');

    if (network === 'sepolia') {
      this.ui.$networkIndicator.addClass('sepolia');
      this.ui.$networkName.text('Sepolia');
    } else if (network === 'hardhat') {
      this.ui.$networkIndicator.addClass('hardhat');
      this.ui.$networkName.text('Local H.');
    } else if (chainId) {
      this.ui.$networkIndicator.addClass('unknown');
      this.ui.$networkName.text('Chain ' + parseInt(chainId, 16));
    } else {
      this.ui.$networkIndicator.addClass('unknown');
      this.ui.$networkName.text('Connecting...');
    }

    Logger.module('UI').log('Network indicator updated:', network, 'chainId:', chainId);
  },

  onUpdateBoosters: function () {
    var goldCount = InventoryManager.getInstance().walletModel.get('gold_amount');

    this.model.set('_booster_pack_count', InventoryManager.getInstance().boosterPacksCollection.length);
    this.ui.$boosterPackCountNumberLabel.text(InventoryManager.getInstance().boosterPacksCollection.length);
    var label = i18next.t('common.spirit_orb', { count: InventoryManager.getInstance().boosterPacksCollection.length });
    this.ui.$boosterPackStaticLabel.text(label);

    // if we have enough gold to buy a booster or have any boosters, activate the symbol animation
    if (goldCount > 100 || InventoryManager.getInstance().boosterPacksCollection.length > 0) {
      this.activateSymbolBoosterPack();
    }
  },

  activateSymbolBoosterPack: function () {
    if (this.ui.$symbolBoosterPackCenter instanceof $) {
      if (this.ui.$symbolBoosterPackCenter._animation == null) {
        this.ui.$symbolBoosterPackCenter._animation = this.ui.$symbolBoosterPackCenter[0].animate([
          { opacity: 0.7 },
          { opacity: 1.0 },
        ], {
          duration: CONFIG.PULSE_MEDIUM_DURATION * 1000.0,
          direction: 'alternate',
          iterations: Infinity,
        });
      } else {
        this.ui.$symbolBoosterPackCenter._animation.play();
      }
    }
    if (this.ui.$symbolBoosterPackRing instanceof $) {
      if (this.ui.$symbolBoosterPackRing._animation == null) {
        this.ui.$symbolBoosterPackRing._animation = this.ui.$symbolBoosterPackRing[0].animate([
          { transform: 'rotateZ(0deg)' },
          { transform: 'rotateZ(360deg)' },
        ], {
          duration: 12000.0,
          iterations: Infinity,
        });
      } else {
        this.ui.$symbolBoosterPackRing._animation.play();
      }
    }
  },

  deactivateSymbolBoosterPack: function () {
    if (this.ui.$symbolBoosterPackCenter instanceof $ && this.ui.$symbolBoosterPackCenter._animation != null) {
      this.ui.$symbolBoosterPackCenter._animation.pause();
    }
    if (this.ui.$symbolBoosterPackRing instanceof $ && this.ui.$symbolBoosterPackRing._animation != null) {
      this.ui.$symbolBoosterPackRing._animation.pause();
    }
  },

  toggleProfile: function () {
    NavigationManager.getInstance().toggleModalViewByClass(ProfileLayout, { model: ProfileManager.getInstance().profile });
  },

  toggleQuestLog: function () {
    NewPlayerManager.getInstance().removeQuestEmphasis();
    NavigationManager.getInstance().toggleModalViewByClass(QuestLogLayout, {
      collection: QuestsManager.getInstance().getQuestCollection(),
      model: ProgressionManager.getInstance().gameCounterModel,
    });
    this._showNewPlayerUI();
  },

  toggleShop: function () {
    EventBus.getInstance().trigger(EVENTS.show_shop);
  },

  toggleSessionWallet: function () {
    // Hide guide overlay when wallet button is clicked
    $('body').removeClass('session-wallet-guide-active');
    $('.session-wallet-guide-overlay').addClass('hide');

    // Lazy load session wallet modules on first use
    if (!SessionWalletPopupView) {
      SessionWallet = require('app/common/session_wallet');
      SessionWalletPopupView = require('./session_wallet_popup');
    }

    // Check if sync is in progress - don't open popup if syncing
    if (SessionWallet.isSyncing()) {
      Logger.module('UI').log('Session wallet sync in progress, cannot open popup');
      return;
    }

    // Toggle session wallet popup
    if (this._sessionWalletPopup && this._sessionWalletPopup.$el.is(':visible')) {
      // Close the popup
      this._sessionWalletPopup.destroy();
      this._sessionWalletPopup = null;
    } else {
      // Create and show the popup
      if (this._sessionWalletPopup) {
        this._sessionWalletPopup.destroy();
      }
      this._sessionWalletPopup = new SessionWalletPopupView();
      this._sessionWalletPopup.render();
      // Append to body so it's above everything
      $('body').append(this._sessionWalletPopup.$el);
      // Listen for close event
      this.listenTo(this._sessionWalletPopup, 'close', function() {
        if (this._sessionWalletPopup) {
          this._sessionWalletPopup.destroy();
          this._sessionWalletPopup = null;
        }
      }.bind(this));
    }
  },

  /**
   * Setup session wallet sync event listeners
   * Handles sync state changes to enable/disable wallet button
   */
  _setupSessionWalletSyncListeners: function() {
    var self = this;

    // Lazy load SessionWallet
    if (!SessionWallet) {
      SessionWallet = require('app/common/session_wallet');
    }

    // Store handlers for cleanup
    this._onSyncStarted = function() {
      self._setWalletButtonLoading(true);
    };

    this._onSyncCompleted = function() {
      self._setWalletButtonLoading(false);
    };

    SessionWallet.on('syncStarted', this._onSyncStarted);
    SessionWallet.on('syncCompleted', this._onSyncCompleted);

    // Check current sync state - if already syncing, show loading state
    if (SessionWallet.isSyncing()) {
      this._setWalletButtonLoading(true);
    } else if (!SessionWallet.isSynced()) {
      // If not synced yet and not syncing, show loading state until sync happens
      this._setWalletButtonLoading(true);
    }
  },

  /**
   * Set wallet button loading/disabled state
   */
  _setWalletButtonLoading: function(isLoading) {
    if (!(this.ui.$sessionWalletButton instanceof $)) return;

    if (isLoading) {
      // Disable button
      this.ui.$sessionWalletButton.addClass('disabled loading');
      this.ui.$sessionWalletButton.prop('disabled', true);

      // Update tooltip to "Loading wallet..."
      this.ui.$sessionWalletButton.attr('data-original-title', 'Loading wallet...');
      this.ui.$sessionWalletButton.tooltip('fixTitle');

      // Update button text
      if (this.ui.$walletBtnText instanceof $) {
        this.ui.$walletBtnText.text('Loading...');
      }
    } else {
      // Enable button
      this.ui.$sessionWalletButton.removeClass('disabled loading');
      this.ui.$sessionWalletButton.prop('disabled', false);

      // Reset tooltip
      this.ui.$sessionWalletButton.attr('data-original-title', 'FHE Session Wallet');
      this.ui.$sessionWalletButton.tooltip('fixTitle');

      // Reset button text
      if (this.ui.$walletBtnText instanceof $) {
        this.ui.$walletBtnText.text('Wallet');
      }
    }
  },

  /**
   * Clean up session wallet sync listeners
   */
  _cleanupSessionWalletSyncListeners: function() {
    if (!SessionWallet) return;

    if (this._onSyncStarted) {
      SessionWallet.off('syncStarted', this._onSyncStarted);
      this._onSyncStarted = null;
    }

    if (this._onSyncCompleted) {
      SessionWallet.off('syncCompleted', this._onSyncCompleted);
      this._onSyncCompleted = null;
    }
  },

  onGoldClicked: function () {
    if (ServerStatusManager.getInstance().isShopEnabled()) {
      this.toggleShop();
    } else {
      EventBus.getInstance().trigger(EVENTS.show_booster_pack_unlock);
    }
  },

  onDiamondClicked: _.throttle(function (e) {
    // NavigationManager.getInstance().showModalView(new PremiumPurchaseDialog());
  }, 1500, { trailing: false }),

  onClickBoosterPackCollection: function () {
    EventBus.getInstance().trigger(EVENTS.show_booster_pack_unlock);
  },

  /**
   * Switch to network directly (no popup needed)
   */
  onNetworkIndicatorClicked: function (e) {
    var self = this;

    // Get current network and toggle to other
    var state = Wallet.getState();
    var currentNetwork = state.networkName;
    var targetNetwork = (currentNetwork === 'sepolia') ? 'hardhat' : 'sepolia';

    Logger.module('UI').log('Switching from', currentNetwork, 'to', targetNetwork);

    if (Wallet.isProviderAvailable()) {
      Wallet.switchNetwork(targetNetwork)
        .then(function() {
          Logger.module('UI').log('Switched to', targetNetwork);
          self.onUpdateNetworkIndicator();
        })
        .catch(function(err) {
          Logger.module('UI').error('Switch failed:', err);
        });
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = UtilityMainMenuItemView;
