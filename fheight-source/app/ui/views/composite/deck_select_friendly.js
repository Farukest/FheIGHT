// pragma PKGS: game

'use strict';

var _ = require('underscore');
var SDK = require('app/sdk');
var Logger = require('app/common/logger');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var CONFIG = require('app/common/config');
var audio_engine = require('app/audio/audio_engine');
var RSX = require('app/data/resources');
var GamesManager = require('app/ui/managers/games_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var DeckSelectFriendlyTmpl = require('app/ui/templates/composite/deck_select_friendly.hbs');
var DeckSelectCompositeView = require('./deck_select');

// FHE imports
var FHE = require('app/sdk/fhe/fheGameMode');
var FHESession = require('app/common/fhe_session');
var Wallet = require('app/common/wallet');

var DeckSelectFriendlyCompositeView = DeckSelectCompositeView.extend({

  className: 'sliding-panel-select deck-select deck-select-friendly',

  template: DeckSelectFriendlyTmpl,

  _showRiftDecks: false,
  _showGauntletDecks: true,

  onConfirmSelection: function (event) {
    if (this._selectedDeckModel != null) {
      this.ui.$deckSelectConfirm.addClass('disabled');
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      var generalId = null;
      var deck = null;
      var ticketId = null;
      if (this._selectedDeckModel.get('isRift')) {
        generalId = this._selectedDeckModel.get('general_id');
        deck = _.map(this._selectedDeckModel.get('deck'), function (cardId) { return { id: cardId }; });
        ticketId = this._selectedDeckModel.get('ticket_id');
      } else if (this._selectedDeckModel.get('isGauntlet')) {
        generalId = this._selectedDeckModel.get('general_id');
        deck = _.map(this._selectedDeckModel.get('deck'), function (cardId) { return { id: cardId }; });
        ticketId = this._selectedDeckModel.get('ticket_id');
        if (ticketId == null) {
          ticketId = this._selectedDeckModel.get('id');
        }
      } else {
        generalId = this._selectedDeckModel.get('cards')[0].id;
        deck = UtilsJavascript.deepCopy(this._selectedDeckModel.get('cards'));
      }

      var factionId = this._selectedDeckModel.get('faction_id');
      var cardBackId = this._selectedDeckModel.get('card_back_id');
      var battleMapId = ProfileManager.getInstance().get('battle_map_id');

      // FHE mode check - same as ranked/casual
      if (CONFIG.fheEnabled) {
        Logger.module('DECK_SELECT_FRIENDLY').log('FHE mode enabled, initializing before friendly game...');
        this._initFHEAndFindFriendlyGame(deck, factionId, generalId, cardBackId, battleMapId, ticketId);
      } else {
        GamesManager.getInstance().findNewGame(
          deck,
          factionId,
          SDK.GameType.Friendly,
          generalId,
          cardBackId,
          battleMapId,
          ticketId,
        );
      }
    } else {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
      this._showSelectDeckWarningPopover(this.ui.$deckSelectConfirm);
    }
  },

  /**
   * Initialize FHE and create game before friendly matchmaking
   * Similar to _initFHEAndFindGame but for Friendly game type
   */
  _initFHEAndFindFriendlyGame: function (deck, factionId, generalId, cardBackId, battleMapId, ticketId) {
    var self = this;

    // Extract card IDs from deck (deck[0] is general, skip it)
    var deckCardIds = deck.slice(1).map(function(card) {
      return card.id;
    });
    Logger.module('DECK_SELECT_FRIENDLY').log('FHE: Deck card count (excluding general):', deckCardIds.length);

    // Get FHE session and contract addresses
    var fheSession = FHESession.getInstance();

    // Step 1: Ensure wallet is connected
    var walletPromise;
    if (!Wallet.getState().connected) {
      Logger.module('DECK_SELECT_FRIENDLY').log('FHE: Wallet not connected, connecting...');
      self._updateFHEButtonStatus('Connecting Wallet...');
      walletPromise = Wallet.connect();
    } else {
      walletPromise = Promise.resolve();
    }

    walletPromise
      .then(function() {
        // Step 2: Initialize FHE Game Mode (this shows PIN dialog if needed)
        self._updateFHEButtonStatus('Initializing FHE...');

        var fheGameMode = FHE.getInstance();
        var contractAddresses = fheSession.getContractAddresses();
        var gameSessionAddress = contractAddresses.GameSession;

        Logger.module('DECK_SELECT_FRIENDLY').log('FHE: Initializing with contract:', gameSessionAddress);

        return fheGameMode.initialize(gameSessionAddress)
          .then(function() {
            Logger.module('DECK_SELECT_FRIENDLY').log('FHE: Creating game on blockchain...');
            self._updateFHEButtonStatus('Creating Game...');

            // Step 3: Create game on contract
            return fheGameMode.createSinglePlayerGame(generalId, deckCardIds);
          })
          .then(function(fheGameId) {
            Logger.module('DECK_SELECT_FRIENDLY').log('FHE: Game created with ID:', fheGameId);
            self._updateFHEButtonStatus('Waiting for Friend...');

            // Step 4: Now proceed with friendly matchmaking, passing FHE data
            GamesManager.getInstance().findNewGameWithFHE(
              deck,
              factionId,
              SDK.GameType.Friendly,
              generalId,
              cardBackId,
              battleMapId,
              {
                fhe_enabled: true,
                fhe_game_id: fheGameId,
                fhe_contract_address: gameSessionAddress,
                fhe_player_wallet: Wallet.getAddress()
              },
              ticketId
            );
          });
      })
      .catch(function(error) {
        Logger.module('DECK_SELECT_FRIENDLY').error('FHE: Initialization failed:', error);

        // Reset button status and re-enable button on error
        self._updateFHEButtonStatus(null);
        self.ui.$deckSelectConfirm.removeClass('disabled');

        // Shutdown FHE on error
        FHE.getInstance().shutdown();

        // Show error to user
        var errorStr = String(error.message || error || '');
        if (errorStr.includes('PIN entry cancelled')) {
          // User cancelled PIN - just re-enable button, no error message needed
          Logger.module('DECK_SELECT_FRIENDLY').log('FHE: PIN entry cancelled by user');
        } else if (errorStr.includes('INSUFFICIENT_FUNDS') || errorStr.includes('insufficient funds')) {
          var sessionWalletAddress = require('app/common/session_wallet').getAddress() || 'unknown';
          var networkName = Wallet.getCurrentNetwork() || 'Sepolia';
          NavigationManager.getInstance().showDialogForError(
            'Insufficient ETH for gas fees.\n\n' +
            'Your session wallet needs ' + networkName + ' ETH.\n\n' +
            'Session Wallet: ' + sessionWalletAddress
          );
        } else {
          NavigationManager.getInstance().showDialogForError('FHE initialization failed: ' + errorStr);
        }
      });
  },

});

// Expose the class either via CommonJS or the global object
module.exports = DeckSelectFriendlyCompositeView;
