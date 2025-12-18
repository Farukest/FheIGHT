// pragma PKGS: game

'use strict';

var _ = require('underscore');
var Animations = require('app/ui/views/animations');
var TransitionRegion = require('app/ui/views/regions/transition');
var GameTmpl = require('app/ui/templates/layouts/game.hbs');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var GameLayer = require('app/view/layers/game/GameLayer');
var UtilsEngine = require('app/common/utils/utils_engine');
var GameFollowupItemView = require('app/ui/views/item/game_followup');
var GameDataManager = require('app/ui/managers/game_data_manager');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var NetworkManager = require('app/sdk/networkManager');
var ProfileManager = require('app/ui/managers/profile_manager');
var NotificationModel = require('app/ui/models/notification');
var GameTopBarCompositeView = require('app/ui/views/composite/game_top_bar');
var GameBottomBarCompositeView = require('app/ui/views/composite/game_bottom_bar');
var GameChooseHandItemView = require('app/ui/views/item/game_choose_hand');
var GameStartingHandItemView = require('app/ui/views/item/game_starting_hand');
var GamePlayerProfilePreview = require('app/ui/views/composite/game_player_profile_preview');
var InstructionNode = require('app/view/nodes/cards/InstructionNode');
var Analytics = require('app/common/analytics');
var moment = require('moment');
var FHEIGHTFirebase = require('app/ui/extensions/fheight_firebase');
var i18next = require('i18next');
const Chroma = require('app/common/chroma');
var FHEGameSession = require('app/sdk/fhe/fheGameSession');
var FHESession = require('app/common/fhe_session');
var GamePlayer2Layout = require('./game_player2');
var GamePlayer1Layout = require('./game_player1');

var GameLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-game',

  template: GameTmpl,

  regions: {
    player1Region: { selector: '#app-game-player1-region', regionClass: TransitionRegion },
    player2Region: { selector: '#app-game-player2-region', regionClass: TransitionRegion },
    leftRegion: { selector: '#app-game-left-region', regionClass: TransitionRegion },
    middleRegion: { selector: '#app-game-middle-region', regionClass: TransitionRegion },
    rightRegion: { selector: '#app-game-right-region', regionClass: TransitionRegion },
    topRegion: { selector: '#app-game-top-region', regionClass: TransitionRegion },
    centerRegion: { selector: '#app-game-center-region', regionClass: TransitionRegion },
    bottomRegion: { selector: '#app-game-bottom-region', regionClass: TransitionRegion },
    followupRegion: { selector: '#app-game-followup-region', regionClass: TransitionRegion },
    customOverlayRegion: { selector: '#app-game-custom-overlay-region', regionClass: TransitionRegion },
  },

  ui: {
    $content: '#app-game-content',
    $overlay: '#app-game-overlay',
    $turnTimerContainer: '.timer-container',
    $turnTimerBar: '.timer-bar',
    spectator_notification: '#spectator_notification',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  chooseHandView: null,

  _hasFadedContent: false,
  _hasShownBattlePetTip: false,
  _aiHasShownGG: false,
  _aiHasShownGLHF: false,
  _numTurnsSinceSignatureCardUsed: -1,
  _remindSignatureCardTimeoutId: null,
  _numTurnsSinceReplaceUsed: -1,
  _remindReplaceCardTimeoutId: null,
  _spectatorNotificationTimeout: null,
  _fheDecrypting: false,
  _fheDecryptFailed: false,

  /* region INITIALIZATION */

  initialize: function () {
    this._numTurnsSinceSignatureCardUsed = -1;
    this._numTurnsSinceReplaceUsed = -1;
  },

  /* endregion INITIALIZATION */

  /* region LAYOUT */

  onResize: function () {
    var startPosition = UtilsEngine.getCardsInHandStartPositionForCSS();
    var endPosition = UtilsEngine.getCardsInHandEndPositionForCSS();
    var startX = startPosition.x - CONFIG.HAND_CARD_SIZE * 0.5;
    var endX = endPosition.x;

    this.ui.$turnTimerContainer.css({
      transform: 'translate(' + (startX) / 10.0 + 'rem, ' + (-startPosition.y - CONFIG.HAND_CARD_SIZE * 0.5) / 10.0 + 'rem)',
      width: (endX - startX) / 10.0 + 'rem',
    });
  },

  _emptyContent: function () {
    this._emptyCentralContent();
    this._emptyPlayerContent();
  },
  _emptyCentralContent: function () {
    this.leftRegion.empty();
    this.middleRegion.empty();
    this.rightRegion.empty();
    this.topRegion.empty();
    this.centerRegion.empty();
    this.bottomRegion.empty();
  },
  _emptyPlayerContent: function () {
    this.player1Region.empty();
    this.player2Region.empty();
  },
  _emptyOverlay: function () {
    this.followupRegion.empty();
    this.customOverlayRegion.empty();
  },

  /* endregion LAYOUT */

  /* region MARIONETTE EVENTS */

  onRender: function () {
    this.onResize();
    this.listenTo(NetworkManager.getInstance().spectators, 'add', this.onSpectatorJoined);
    this.listenTo(NetworkManager.getInstance().spectators, 'remove', this.onSpectatorLeft);
  },

 // GameLayout gösterilince (oyun başlangıcı)
  onShow: function () {
    // listen to game events
    this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.status, this.onGameStatusChanged);
    this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.turn_time, this.onTurnTimeChanged);

    var scene = Scene.getInstance();
    var gameLayer = scene && scene.getGameLayer();
    if (gameLayer != null) {
      this.listenTo(gameLayer.getEventBus(), EVENTS.show_active_game, this.onShowActiveGame);
      this.listenTo(gameLayer.getEventBus(), EVENTS.before_show_game_over, this.onBeforeShowGameOver);
      this.listenTo(gameLayer.getEventBus(), EVENTS.show_game_over, this.onShowGameOver);
      this.listenTo(gameLayer.getEventBus(), EVENTS.show_end_turn, this.onShowEndTurn);
      this.listenTo(gameLayer.getEventBus(), EVENTS.after_show_start_turn, this.onAfterShowStartTurn);
      this.listenTo(gameLayer.getEventBus(), EVENTS.after_show_step, this.onAfterShowStep);
      this.listenTo(gameLayer.getEventBus(), EVENTS.followup_card_start, this.onGameFollowupCardStart);
      this.listenTo(gameLayer.getEventBus(), EVENTS.followup_card_stop, this.onGameFollowupCardStop);
      this.listenTo(gameLayer.getEventBus(), EVENTS.inspect_card_start, this.onInspectCardStart);
      this.listenTo(gameLayer.getEventBus(), EVENTS.inspect_card_stop, this.onInspectCardStop);
    }

    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);

    // oyun başında ilk İlk çağrı
    this.showNextStepInGameSetup();

    this.onResize();
  },

  onDestroy: function () {
    this._clearInspectCardHideProfilesTimeout();
    this._stopReminderTimeouts();
    this.stopListening(SDK.GameSession.getInstance().getEventBus(), EVENTS.action, this.onDrawStartingHand);
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENT LISTENERS */

  onGameStatusChanged: function (event) {
    // defer so the current call stack can complete
    // this allows promises to resolve before we check statuses
    _.defer(function () {
      // when mulligan is done and we need to go to the next step in game setup
      if (event && event.from == SDK.GameStatus.new && event.to == SDK.GameStatus.active) {
        var scene = Scene.getInstance();
        var gameLayer = scene && scene.getGameLayer();
        if (gameLayer != null) {
          // if still choosing starting hand, skip
          if (gameLayer.getStatus() <= GameLayer.STATUS.CHOOSE_HAND
            && gameLayer.getStatus() !== GameLayer.STATUS.TRANSITIONING_TO_DRAW_HAND) {
            this.showNextStepInGameSetup();
          } else {
            // wait until engine is at least showing starting hand
            gameLayer.whenStatus(GameLayer.STATUS.STARTING_HAND).then(function () {
              this.showNextStepInGameSetup();
            }.bind(this));
          }
        }
      }
    }.bind(this));
  },

  onGameFollowupCardStart: function (event) {
    if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
      var followupCard = event.card;
      // fade content out temporarily
      Animations.fadeOut.call(this.ui.$content, 0.0);
      var utilityView = NavigationManager.getInstance().getUtilityView();
      if (utilityView != null) {
        Animations.fadeOut.call(utilityView, 0.0);
      }

      // show
      var gameFollowupItemView = new GameFollowupItemView({ followupCard: followupCard, model: new Backbone.Model() });
      this.followupRegion.show(gameFollowupItemView);
    }
  },

  onGameFollowupCardStop: function (event) {
    if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
      // remove
      this.followupRegion.empty();

      // restore faded regions
      Animations.fadeIn.call(this.ui.$content);
      var utilityView = NavigationManager.getInstance().getUtilityView();
      if (utilityView != null) {
        Animations.fadeIn.call(utilityView);
      }
    }
  },

  onShowActiveGame: function () {
    var gameLayer = Scene.getInstance().getGameLayer();
    if (gameLayer != null) {
      // show bloodborn spell tip if user has never seen it
      if (!NewPlayerManager.getInstance().getHasSeenBloodbornSpellInfo()) {
        var myPlayerLayer = gameLayer.getMyPlayerLayer();
        var mySignatureCardNode = myPlayerLayer.getSignatureCardNode();
        if (!mySignatureCardNode.getIsDisabled()) {
          // flag as having seen tip
          NewPlayerManager.getInstance().setHasSeenBloodbornSpellInfo();

          // assemble text
          var owner = gameLayer.getMyPlayer().getSdkPlayer();
          var cooldown = SDK.GameSession.getInstance().getNumberOfPlayerTurnsUntilPlayerActivatesSignatureCard(owner, true);
          var text = i18next.t('new_player_experience.bloodborn_message', { count: cooldown });

          // show instruction
          var direction = owner.getPlayerId() === SDK.GameSession.getInstance().getPlayer2Id() ? InstructionNode.DIRECTION_RIGHT : InstructionNode.DIRECTION_LEFT;
          gameLayer.showInstructionForSdkNode(mySignatureCardNode, text, null, CONFIG.INSTRUCTIONAL_LONG_DURATION, false, direction);
        }
      }
    }
  },

  onBeforeShowGameOver: function (event) {
    this._stopReminderTimeouts();

    if (!Scene.getInstance().getGameLayer().getIsActive()
      && !Scene.getInstance().getGameLayer().getIsTransitioningToActive()) {
      this._emptyCentralContent();
      this._emptyOverlay();
    } else if (SDK.GameSession.getInstance().isSinglePlayer() && !this._aiHasShownGG) {
      // ai should send player gg as soon as game session is over
      this._aiHasShownGG = true;
      this.showAIEmote(SDK.CosmeticsLookup.Emote.TextGG);
    }
  },

  onShowGameOver: function (event) {
    this._emptyContent();
    this._emptyOverlay();
  },

  onShowEndTurn: function () {
    this._stopReminderTimeouts();
    this.hideTurnTimerBar();
    // FHE MODE: No TX here - card draw is handled by onFHEDrawCard when DrawCardAction step is received
  },

  _stopReminderTimeouts: function () {
    if (this._remindSignatureCardTimeoutId != null) {
      clearTimeout(this._remindSignatureCardTimeoutId);
      this._remindSignatureCardTimeoutId = null;
    }
    if (this._remindReplaceCardTimeoutId != null) {
      clearTimeout(this._remindReplaceCardTimeoutId);
      this._remindReplaceCardTimeoutId = null;
    }
  },

  onAfterShowStartTurn: function () {
    var self = this;

    // FHE MODE: Draw card from blockchain on my turn start
    var gameSession = SDK.GameSession.getInstance();
    // FHE MODE: Card draw is now handled in onAfterShowEndTurn when DrawCardAction is detected
    // No need to draw again on turn start - removed duplicate draw logic

    if (CONFIG.razerChromaEnabled) {
      if (Scene.getInstance().getGameLayer().getIsMyTurn()) {
        Chroma.flashActionThrottled(CONFIG.razerChromaIdleColor, 50, 2)
          .then(() => {
            Chroma.setAll(CONFIG.razerChromaIdleColor);
          });
      } else {
        // enemy color just white, we might want to make this dynamic based on enemy faction
        const color = new Chroma.Color('FFFFFF');
        Chroma.flashActionThrottled(color, 50, 2)
          .then(() => {
            Chroma.setAll(color);
          });
      }
    }
    if (CONFIG.showInGameTips
      && !SDK.GameSession.getInstance().getIsSpectateMode()
      && !SDK.GameSession.getInstance().isChallenge()
      && Scene.getInstance().getGameLayer().getIsMyTurn()) {
      // increment reminder counters
      var gameLayer = Scene.getInstance().getGameLayer();
      if (gameLayer != null) {
        var myPlayer = gameLayer.getMyPlayer();
        var sdkPlayer = myPlayer.getSdkPlayer();
        if (sdkPlayer.getCurrentSignatureCard() != null && sdkPlayer.getIsSignatureCardActive()) {
          this._numTurnsSinceSignatureCardUsed++;
        } else {
          this._numTurnsSinceSignatureCardUsed = -1;
        }
        if (sdkPlayer.getDeck().getCanReplaceCardThisTurn()) {
          this._numTurnsSinceReplaceUsed++;
        } else {
          this._numTurnsSinceReplaceUsed = -1;
        }
      }

      var delay = CONFIG.REMINDER_DELAY;

      // show signature card reminder as needed
      if (this._remindSignatureCardTimeoutId == null
        && this._numTurnsSinceSignatureCardUsed >= CONFIG.NUM_TURNS_BEFORE_SHOW_SIGNATURE_CARD_REMINDER
        && ProgressionManager.getInstance().getGameCount() < CONFIG.NUM_GAMES_TO_SHOW_SIGNATURE_CARD_REMINDER) {
        this._remindSignatureCardTimeoutId = setTimeout(function () {
          this._remindSignatureCardTimeoutId = null;
          var gameLayer = Scene.getInstance().getGameLayer();
          if (gameLayer != null && gameLayer.getIsMyTurn()) {
            var myPlayerLayer = gameLayer.getMyPlayerLayer();
            var mySignatureCardNode = myPlayerLayer.getSignatureCardNode();
            var text = 'Remember, your [Bloodbound Spell] is very powerful.';
            var direction = gameLayer.getMyPlayerId() === SDK.GameSession.getInstance().getPlayer2Id() ? InstructionNode.DIRECTION_RIGHT : InstructionNode.DIRECTION_LEFT;
            gameLayer.showInstructionForSdkNode(mySignatureCardNode, text, null, CONFIG.INSTRUCTIONAL_LONG_DURATION, false, direction);
          }
        }.bind(this), delay * 1000.0);

        // delay in case we're also showing replace reminder
        delay += CONFIG.INSTRUCTIONAL_LONG_DURATION;
      }

      // show replace reminder as needed
      if (this._remindReplaceCardTimeoutId == null
        && this._numTurnsSinceReplaceUsed >= CONFIG.NUM_TURNS_BEFORE_SHOW_REPLACE_REMINDER
        && ProgressionManager.getInstance().getGameCount() < CONFIG.NUM_GAMES_TO_SHOW_REPLACE_REMINDER) {
        this._remindReplaceCardTimeoutId = setTimeout(function () {
          this._remindReplaceCardTimeoutId = null;
          var gameLayer = Scene.getInstance().getGameLayer();
          if (gameLayer != null && gameLayer.getIsMyTurn()) {
            var bottomDeckLayer = gameLayer.getBottomDeckLayer();
            var replaceNode = bottomDeckLayer.getReplaceNode();
            var replacePosition = replaceNode.getPosition();
            replacePosition.y += replaceNode.height * 0.55;
            var text = 'Remember, you can [Replace] cards from your action bar.';
            gameLayer.showInstructionAtPosition(replacePosition, text, null, CONFIG.INSTRUCTIONAL_LONG_DURATION, false, InstructionNode.DIRECTION_DOWN);
          }
        }.bind(this), delay * 1000.0);
      }
    }
  },

  onAfterShowStep: function (e) {
    var step = e && e.step;
    if (step != null) {
      var action = step.getAction();

      // FHE MODE: DrawCardAction tetiklendiginde kart cek
      // Contract'tan getHand() + userDecrypt() ile yeni karti ogren (TX YOK!)
      // DrawCardAction, EndTurnAction'in sub-action'i olarak gelebilir, bu yuzden
      // tum action tree'yi kontrol etmemiz lazim (getFlattenedActionTree)
      if (CONFIG.fheEnabled && !this._fheDecrypting) {
        var myPlayerId = SDK.GameSession.getInstance().getMyPlayerId();

        // Tum action agacini kontrol et (ana action + sub-actions)
        var allActions = action.getFlattenedActionTree();
        var myDrawCardActions = allActions.filter(function(a) {
          return a instanceof SDK.DrawCardAction && a.getOwnerId() === myPlayerId;
        });

        if (myDrawCardActions.length > 0) {
          this._fheDecrypting = true;
          this._fheDrawDecryptFailed = false;
          var fheSession = FHEGameSession.getInstance();
          var gameSession = SDK.GameSession.getInstance();
          var gameLayer = Scene.getInstance().getGameLayer();

          // NOTE: DrawCardAction artık FHE modunda kart eklemiyor (SDK seviyesinde skip)
          // Bu sayede hack'e gerek kalmadı - doğrudan FHE decrypt yapabiliriz

          // Ensure socket is set for server notifications
          if (!fheSession._socket) {
            var socket = NetworkManager.getInstance().socket;
            if (socket) {
              fheSession.setSocket(socket);
              fheSession.setServerGameId(gameSession.getGameId());
            }
          }

          Logger.module('FHE').log('[DRAW] DrawCardAction detected for my player (count: ' + myDrawCardActions.length + ')');

          // Show "Decrypting" state on first empty slot in hand
          if (gameLayer && gameLayer.bottomDeckLayer) {
            gameLayer.bottomDeckLayer.showFHEDecryptStateOnFirstEmptySlot();
          }

          // FLOW.MD Adım 31-35: getDrawHandles -> publicDecrypt -> revealDrawBatch -> calculateCard
          fheSession.revealDrawCard()
            .then(function(cardData) {
              // Hide decrypt state
              if (gameLayer && gameLayer.bottomDeckLayer) {
                gameLayer.bottomDeckLayer.hideFHEDecryptStateOnSlot();
              }

              // cardData = {cardId, cardIndex, burned} from server response
              if (cardData !== null && cardData.cardId !== null) {
                if (cardData.burned) {
                  // Server says hand was full and card was burned
                  Logger.module('FHE').log('[DRAW] FHE card BURNED (hand full):', cardData.cardId);
                  // _addFHECardToHand will handle deck remaining decrement and burn event
                  this._addFHECardToHand(cardData.cardId, cardData.cardIndex);
                } else {
                  Logger.module('FHE').log('[DRAW] FHE card drawn:', cardData.cardId, 'index:', cardData.cardIndex);
                  // SDK'ya karti ekle - server'dan gelen cardIndex'i kullan
                  this._addFHECardToHand(cardData.cardId, cardData.cardIndex);
                  // UI refresh icin event tetikle (only if not burned)
                  EventBus.getInstance().trigger(EVENTS.fhe_card_drawn, { cardId: cardData.cardId });
                }
              } else {
                Logger.module('FHE').warn('[DRAW] Deck empty - fatigue!');
              }
              this._fheDecrypting = false;
              this._fheDrawDecryptFailed = false;
            }.bind(this))
            .catch(function(error) {
              Logger.module('FHE').error('[DRAW] FHE draw failed:', error);
              this._fheDecrypting = false;

              // Check if this is a 500 error
              if (error && error.is500Error) {
                Logger.module('FHE').log('[DRAW] 500 error detected - showing Failed state');
                this._fheDrawDecryptFailed = true;

                // Show "Failed" state on the card slot
                if (gameLayer && gameLayer.bottomDeckLayer) {
                  gameLayer.bottomDeckLayer.showFHEDecryptFailedStateOnSlot();
                }

                // Emit event for bottom bar to show Re-Decrypt button
                EventBus.getInstance().trigger(EVENTS.fhe_draw_decrypt_failed, { error: error });
              } else {
                // Non-500 error - just hide decrypt state
                if (gameLayer && gameLayer.bottomDeckLayer) {
                  gameLayer.bottomDeckLayer.hideFHEDecryptStateOnSlot();
                }
              }
            }.bind(this));
        }
      }

      // reset reminder counters on my actions
      if (action.getOwnerId() === SDK.GameSession.getInstance().getMyPlayerId()) {
        if (action instanceof SDK.PlaySignatureCardAction) {
          this._numTurnsSinceSignatureCardUsed = -1;
        } else if (action instanceof SDK.ReplaceCardFromHandAction) {
          this._numTurnsSinceReplaceUsed = -1;
        }
      }

      // show battle pet tip once per game if user has never seen it
      var hasNotSeenBattlePetInfo = !NewPlayerManager.getInstance().getHasSeenBattlePetInfo();
      var hasNotSeenBattlePetReminder = !NewPlayerManager.getInstance().getHasSeenBattlePetReminder();
      var needsBattlePetTip = !this._hasShownBattlePetTip && (hasNotSeenBattlePetInfo || hasNotSeenBattlePetReminder);
      if (needsBattlePetTip && action instanceof SDK.ApplyCardToBoardAction && action.getCard().getRaceId() === SDK.Races.BattlePet) {
        var gameLayer = Scene.getInstance().getGameLayer();
        if (gameLayer != null) {
          var battlePetNode = gameLayer.getNodeForSdkCard(action.getCard());
          if (battlePetNode != null) {
            // flag as having seen tip
            this._hasShownBattlePetTip = true;
            if (hasNotSeenBattlePetInfo) {
              NewPlayerManager.getInstance().setHasSeenBattlePetInfo();
            } else if (hasNotSeenBattlePetReminder) {
              NewPlayerManager.getInstance().setHasSeenBattlePetReminder();
            }

            // assemble text
            var text = 'This is a [Battle Pet]. At the start of' + (battlePetNode.getSdkCard().isOwnedByMyPlayer() ? ' your' : ' its owner\'s') + ' turn, it will act on its own!';

            // show instruction
            var direction;
            var position = battlePetNode.getPosition();
            var winRect = UtilsEngine.getGSIWinRect();
            if (position.x > winRect.x + winRect.width * 0.5) {
              direction = InstructionNode.DIRECTION_RIGHT;
            } else {
              direction = InstructionNode.DIRECTION_LEFT;
            }
            gameLayer.showInstructionForSdkNode(battlePetNode, text, null, CONFIG.INSTRUCTIONAL_LONG_DURATION, false, direction);
          }
        }
      } else if (!NewPlayerManager.getInstance().getHasSeenBattlePetActionNotification() && action.getIsAutomatic() && action.getSource() != null && action.getSource().getRaceId() === SDK.Races.BattlePet) {
        var gameLayer = Scene.getInstance().getGameLayer();
        if (gameLayer != null) {
          var battlePetNode = gameLayer.getNodeForSdkCard(action.getSource());
          if (battlePetNode != null) {
            // flag as having seen tip
            NewPlayerManager.getInstance().setHasSeenBattlePetActionNotification();

            // assemble text
            var text = 'Remember, a [Battle Pet] will act on its own!';

            // show instruction
            var direction;
            var position = battlePetNode.getPosition();
            var winRect = UtilsEngine.getGSIWinRect();
            if (position.x > winRect.x + winRect.width * 0.5 || action.getSourcePosition().x < action.getTargetPosition().x) {
              direction = InstructionNode.DIRECTION_RIGHT;
            } else {
              direction = InstructionNode.DIRECTION_LEFT;
            }
            gameLayer.showInstructionForSdkNode(battlePetNode, text, null, CONFIG.INSTRUCTIONAL_SHORT_DURATION, false, direction);
          }
        }
      }
    }
  },

  onTurnTimeChanged: function (event) {
    this.updateTurnTimerBar(event && Math.ceil(event.time));
  },

  onInspectCardStart: function () {
    this._clearInspectCardHideProfilesTimeout();
    if (!this._hidingPlayerProfilePreviews) {
      this._hidingPlayerProfilePreviews = true;

      if (this.player1Region.currentView instanceof GamePlayerProfilePreview && this.player1Region.currentView.$el instanceof $) {
        Animations.fadeOut.call(this.player1Region.currentView, 100);
      }

      if (this.player2Region.currentView instanceof GamePlayerProfilePreview && this.player2Region.currentView.$el instanceof $) {
        Animations.fadeOut.call(this.player2Region.currentView, 100);
      }
    }
  },

  onInspectCardStop: function () {
    if (this._hidingPlayerProfilePreviews) {
      this._clearInspectCardHideProfilesTimeout();

      this._clearInspectCardHideProfilesTimeoutId = setTimeout(function () {
        this._hidingPlayerProfilePreviews = false;

        if (this.player1Region.currentView instanceof GamePlayerProfilePreview && this.player1Region.currentView.$el instanceof $) {
          Animations.fadeIn.call(this.player1Region.currentView, 100);
        }

        if (this.player2Region.currentView instanceof GamePlayerProfilePreview && this.player2Region.currentView.$el instanceof $) {
          Animations.fadeIn.call(this.player2Region.currentView, 100);
        }
      }.bind(this), 500);
    }
  },

  _clearInspectCardHideProfilesTimeout: function () {
    if (this._clearInspectCardHideProfilesTimeoutId != null) {
      clearTimeout(this._clearInspectCardHideProfilesTimeoutId);
      this._clearInspectCardHideProfilesTimeoutId = null;
    }
  },

  /* endregion EVENT LISTENERS */

  /* region STATES */

  showNextStepInGameSetup: function () {
    var self = this;
    Logger.module('UI').log('GameLayout.showNextStepInGameSetup');
    if (SDK.GameSession.getInstance().isActive()) {
      return this.showActiveGame();
    } else {
      // show bottom bar for spectate mode immediately
      if (SDK.GameSession.getInstance().getIsSpectateMode() && !(this.bottomRegion.currentView instanceof GameBottomBarCompositeView)) {
        this.bottomRegion.show(new GameBottomBarCompositeView());
      }

      // highlight generals
      Scene.getInstance().getGameLayer().highlightGenerals();

      // when in sandbox mode and my player has starting hand but opponent does not
      if (SDK.GameSession.getInstance().isSandbox()) {
        var myPlayer = SDK.GameSession.current().getMyPlayer();
        var opponentPlayer = SDK.GameSession.current().getOpponentPlayer();
        if (myPlayer.getHasStartingHand() && !opponentPlayer.getHasStartingHand()) {
          // reset game layer status to new
          Scene.getInstance().getGameLayer().resetStatus();

          // swap test user id so we can mulligan for other player
          if (myPlayer.getPlayerId() !== opponentPlayer.getPlayerId()) {
            SDK.GameSession.getInstance().setUserId(opponentPlayer.getPlayerId());
          } else {
            SDK.GameSession.getInstance().setUserId(myPlayer.getPlayerId());
          }
        }
      }

      // show starting or choose hand // başlangıçta 5 kart çekme yer. 5 cards. ilk el
      if (SDK.GameSession.current().getMyPlayer().getHasStartingHand()) {
        return this.showStartingHand();
      } else {
        // FHE MODE: Decrypt and populate hand BEFORE showing choose hand UI
        var gameSession = SDK.GameSession.getInstance();
        var fheEnabled = gameSession.fheEnabled || CONFIG.fheEnabled;
        var isDeveloperMode = gameSession.getIsDeveloperMode();
        var isSinglePlayerGame = gameSession.isSinglePlayer() || gameSession.isBossBattle() || gameSession.isChallenge() || gameSession.isSandbox();

        if (fheEnabled && !isDeveloperMode && isSinglePlayerGame) {
          Logger.module('FHE_UI').log('[FHE] showNextStepInGameSetup: FHE mode detected');

          var fheGameSession = FHEGameSession.getInstance();
          if (fheGameSession && fheGameSession.gameId) {
            // Set socket for server notifications (FLOW.MD)
            var socket = NetworkManager.getInstance().socket;
            if (socket) {
              fheGameSession.setSocket(socket);
              fheGameSession.setServerGameId(gameSession.getGameId());
              Logger.module('FHE_UI').log('[FHE] Socket set for server notifications');

              // CRITICAL: Socket bağlandıktan sonra fhe_game_created event'i gönder
              // createSinglePlayerGame TX sırasında socket henüz yoktu, şimdi yeniden gönder
              // Bu event server'da games[gameId].fhe state'ini oluşturuyor
              if (fheGameSession.blockchainGameId) {
                var fheEventData = {
                  gameId: gameSession.getGameId(),
                  blockchainGameId: fheGameSession.blockchainGameId,
                  network: fheGameSession.network || 'sepolia'
                };
                Logger.module('FHE_UI').log('[FHE] >>> Sending fhe_game_created with data:', JSON.stringify(fheEventData));
                Logger.module('FHE_UI').log('[FHE] >>> Socket connected:', socket.connected, 'id:', socket.id);
                fheGameSession._notifyServer('fhe_game_created', fheEventData);
                Logger.module('FHE_UI').log('[FHE] Sent fhe_game_created event to server (blockchainGameId:', fheGameSession.blockchainGameId, ')');
              } else {
                Logger.module('FHE_UI').warn('[FHE] No blockchainGameId set - cannot notify server');
              }
            } else {
              Logger.module('FHE_UI').warn('[FHE] No socket available for server notifications');
            }

            // First show choose hand UI, then show decrypt state after cards are ready
            var showPromise = self.showChooseHand();
            showPromise.then(function() {
              // Show FHE decrypt state on all card nodes (after cards are created)
              var scene = Scene.getInstance();
              var gameLayer = scene && scene.getGameLayer();
              if (gameLayer && gameLayer.bottomDeckLayer) {
                gameLayer.bottomDeckLayer.showFHEDecryptState();
              }

              // Also disable continue button while decrypting
              self._fheDecrypting = true;
              if (self.chooseHandView) {
                self.chooseHandView.setConfirmButtonVisibility(false);
              }
            });

            // Start reveal in background (FLOW Step 7-13)
            Logger.module('FHE_UI').log('[FHE] Starting revealInitialHand for gameId:', fheGameSession.gameId);

            fheGameSession.revealInitialHand()
              .then(function(handData) {
                // handData = {cardIds: [...], cardIndices: [...]} from server
                var revealedCardIds = handData.cardIds || handData; // backward compat if array
                var serverCardIndices = handData.cardIndices || null;
                Logger.module('FHE_UI').log('[FHE] Hand revealed - cardIds:', revealedCardIds);
                Logger.module('FHE_UI').log('[FHE] Hand revealed - serverCardIndices:', serverCardIndices);

                // deckRemaining = total deck size - revealed cards (FLOW: 40 - 5 = 35)
                var deckRemaining = fheGameSession.getRemainingDeckSize();
                Logger.module('FHE_UI').log('[FHE] Remaining deck size:', deckRemaining);

                // Populate SDK deck with revealed cards - USE SERVER cardIndices for sync!
                self._populateFHEHand(revealedCardIds, [], deckRemaining, serverCardIndices);

                // Hide FHE decrypt state on cards
                var scene = Scene.getInstance();
                var gameLayer = scene && scene.getGameLayer();
                Logger.module('FHE_UI').log('[FHE] Attempting to hide decrypt state...');
                Logger.module('FHE_UI').log('[FHE] gameLayer exists:', !!gameLayer);
                Logger.module('FHE_UI').log('[FHE] bottomDeckLayer exists:', !!(gameLayer && gameLayer.bottomDeckLayer));
                if (gameLayer && gameLayer.bottomDeckLayer) {
                  Logger.module('FHE_UI').log('[FHE] Calling hideFHEDecryptState()');
                  gameLayer.bottomDeckLayer.hideFHEDecryptState();
                } else {
                  Logger.module('FHE_UI').warn('[FHE] Cannot hide decrypt state - bottomDeckLayer not available');
                }

                // Enable continue button
                self._fheDecrypting = false;
                self._fheDecryptFailed = false;
                if (self.chooseHandView) {
                  self.chooseHandView.showReDecryptButton(false);
                  self.chooseHandView.setConfirmButtonVisibility(true);
                }

                // Refresh the card display in GameLayer
                if (gameLayer) {
                  gameLayer.showChooseHand();
                }
              })
              .catch(function(err) {
                Logger.module('FHE_UI').error('[FHE] Decrypt failed:', err);
                // Show Failed state on cards instead of hiding
                var scene = Scene.getInstance();
                var gameLayer = scene && scene.getGameLayer();
                if (gameLayer && gameLayer.bottomDeckLayer) {
                  gameLayer.bottomDeckLayer.showFHEDecryptFailedState();
                }
                self._fheDecrypting = false;
                self._fheDecryptFailed = true;
                // Show Re-Decrypt button instead of Continue
                if (self.chooseHandView) {
                  self.chooseHandView.showReDecryptButton(true);
                }
              });

            return showPromise;
          }
        }

        // Normal flow (non-FHE)
        return this.showChooseHand();
      }
    }
  },

  showChooseHand: function () {
    Logger.module('UI').log('GameLayout.showChooseHand');
    var allPromises = [];

    // always show cards for choose hand
    allPromises.push(Scene.getInstance().getGameLayer().showChooseHand());

    if (!SDK.GameSession.current().getIsSpectateMode()) {
      // store choose hand UI
      var chooseHandItemView = new GameChooseHandItemView({ model: new Backbone.Model({ maxMulliganCount: CONFIG.STARTING_HAND_REPLACE_COUNT }) });
      this.chooseHandView = chooseHandItemView;

      // listen for submit
      this.chooseHandView.on('confirm', this.showSubmitChosenHand, this);
      // listen for re-decrypt
      this.chooseHandView.on('redecrypt', this.retryFHEDecrypt, this);

      // show choose hand UI
      allPromises.push(this.middleRegion.show(chooseHandItemView));
    } else {
      // spectators do not show choose hand UI
      this.chooseHandView = null;

      // set status on game layer to assume hand was submitted
      Scene.getInstance().getGameLayer().showSubmitChosenHand();
    }

    // wait to hear from the server about new cards
    this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.action, this.onDrawStartingHand);

    var gameSession = SDK.GameSession.getInstance();
    if (SDK.GameType.isNetworkGameType(gameSession.getGameType())) {
      // my player
      var myPlayerId = gameSession.getMyPlayerId();
      var myRibbonCollection;
      if (SDK.GameSession.getInstance().isGauntlet() || SDK.GameSession.getInstance().isCasual()) {
        // never show ribbons information in gauntlet and casual
        myRibbonCollection = new Backbone.Collection();
      } else {
        myRibbonCollection = new FHEIGHTFirebase.Collection(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('user-ribbons').child(myPlayerId),
        });
      }
      var myProfile;
      if (ProfileManager.getInstance().get('id') === myPlayerId) {
        myProfile = new Backbone.Model(ProfileManager.getInstance().profile.get('presence'));
      } else {
        myProfile = new FHEIGHTFirebase.Model(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('users').child(myPlayerId).child('presence'),
        });
      }
      if (gameSession.getPlayer2Id() === myPlayerId) {
        allPromises.push(this.player2Region.show(new GamePlayerProfilePreview({ model: myProfile, collection: myRibbonCollection })));
      } else {
        allPromises.push(this.player1Region.show(new GamePlayerProfilePreview({ model: myProfile, collection: myRibbonCollection })));
      }

      // opponent player
      if (SDK.GameType.isMultiplayerGameType(gameSession.getGameType())) {
        var opponentPlayerId = gameSession.getOpponentPlayerId();
        var opponentRibbonCollection;
        if (SDK.GameSession.getInstance().isGauntlet() || SDK.GameSession.getInstance().isCasual()) {
          // never show ribbons information in gauntlet and casual
          opponentRibbonCollection = new Backbone.Collection();
        } else {
          opponentRibbonCollection = new FHEIGHTFirebase.Collection(null, {
            firebase: new Firebase(process.env.FIREBASE_URL).child('user-ribbons').child(opponentPlayerId),
          });
        }
        var opponentProfile = new FHEIGHTFirebase.Model(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('users').child(opponentPlayerId).child('presence'),
        });
        if (gameSession.getPlayer2Id() === opponentPlayerId) {
          allPromises.push(this.player2Region.show(new GamePlayerProfilePreview({ model: opponentProfile, collection: opponentRibbonCollection })));
        } else {
          allPromises.push(this.player1Region.show(new GamePlayerProfilePreview({ model: opponentProfile, collection: opponentRibbonCollection })));
        }
      }
    }

    return Promise.all(allPromises);
  },

  retryFHEDecrypt: function () {
    Logger.module('FHE_UI').log('[FHE] Retrying FHE decrypt...');
    var self = this;

    // Reset failed state
    this._fheDecryptFailed = false;
    this._fheDecrypting = true;

    // Hide Re-Decrypt button, show decrypting state again
    if (this.chooseHandView) {
      this.chooseHandView.showReDecryptButton(false);
    }

    // Get gameLayer and show decrypt state
    var scene = Scene.getInstance();
    var gameLayer = scene && scene.getGameLayer();
    if (gameLayer && gameLayer.bottomDeckLayer) {
      gameLayer.bottomDeckLayer.showFHEDecryptState();
    }

    // Retry the reveal
    var fheGameSession = FHEGameSession.getInstance();
    if (fheGameSession && fheGameSession.gameId) {
      fheGameSession.revealInitialHand()
        .then(function(handData) {
          var revealedCardIds = handData.cardIds || handData;
          var serverCardIndices = handData.cardIndices || null;
          Logger.module('FHE_UI').log('[FHE] Retry successful - cardIds:', revealedCardIds);

          var deckRemaining = fheGameSession.getRemainingDeckSize();
          self._populateFHEHand(revealedCardIds, [], deckRemaining, serverCardIndices);

          if (gameLayer && gameLayer.bottomDeckLayer) {
            gameLayer.bottomDeckLayer.hideFHEDecryptState();
          }

          self._fheDecrypting = false;
          self._fheDecryptFailed = false;
          if (self.chooseHandView) {
            self.chooseHandView.showReDecryptButton(false);
            self.chooseHandView.setConfirmButtonVisibility(true);
          }

          Scene.getInstance().getGameLayer().showChooseHand();
        })
        .catch(function(err) {
          Logger.module('FHE_UI').error('[FHE] Retry failed:', err);
          if (gameLayer && gameLayer.bottomDeckLayer) {
            gameLayer.bottomDeckLayer.showFHEDecryptFailedState();
          }
          self._fheDecrypting = false;
          self._fheDecryptFailed = true;
          if (self.chooseHandView) {
            self.chooseHandView.showReDecryptButton(true);
          }
        });
    } else {
      Logger.module('FHE_UI').error('[FHE] Cannot retry - no FHE game session');
      this._fheDecrypting = false;
      this._fheDecryptFailed = true;
    }
  },

  /**
   * Retries FHE decrypt for End Turn card draw after 500 error.
   * Called from game_bottom_bar.js when user clicks Re-Decrypt button.
   */
  retryFHEDrawDecrypt: function () {
    Logger.module('FHE_UI').log('[FHE] Retrying FHE draw decrypt...');
    var self = this;

    // Reset failed state
    this._fheDrawDecryptFailed = false;
    this._fheDecrypting = true;

    var gameLayer = Scene.getInstance().getGameLayer();
    var fheSession = FHEGameSession.getInstance();

    // Show decrypting state again
    if (gameLayer && gameLayer.bottomDeckLayer) {
      gameLayer.bottomDeckLayer.showFHEDecryptStateOnFirstEmptySlot();
    }

    // Emit event to hide Re-Decrypt button
    EventBus.getInstance().trigger(EVENTS.fhe_draw_decrypt_success, {});

    // Retry the reveal
    fheSession.revealDrawCard()
      .then(function(cardData) {
        // Hide decrypt state
        if (gameLayer && gameLayer.bottomDeckLayer) {
          gameLayer.bottomDeckLayer.hideFHEDecryptStateOnSlot();
        }

        if (cardData !== null && cardData.cardId !== null) {
          if (cardData.burned) {
            Logger.module('FHE_UI').log('[FHE] Retry draw BURNED (hand full):', cardData.cardId);
            self._addFHECardToHand(cardData.cardId, cardData.cardIndex);
          } else {
            Logger.module('FHE_UI').log('[FHE] Retry draw success:', cardData.cardId);
            self._addFHECardToHand(cardData.cardId, cardData.cardIndex);
            EventBus.getInstance().trigger(EVENTS.fhe_card_drawn, { cardId: cardData.cardId });
          }
        } else {
          Logger.module('FHE_UI').warn('[FHE] Retry draw - deck empty (fatigue)');
        }

        self._fheDecrypting = false;
        self._fheDrawDecryptFailed = false;
      })
      .catch(function(error) {
        Logger.module('FHE_UI').error('[FHE] Retry draw failed:', error);
        self._fheDecrypting = false;

        if (error && error.is500Error) {
          self._fheDrawDecryptFailed = true;
          if (gameLayer && gameLayer.bottomDeckLayer) {
            gameLayer.bottomDeckLayer.showFHEDecryptFailedStateOnSlot();
          }
          EventBus.getInstance().trigger(EVENTS.fhe_draw_decrypt_failed, { error: error });
        } else {
          if (gameLayer && gameLayer.bottomDeckLayer) {
            gameLayer.bottomDeckLayer.hideFHEDecryptStateOnSlot();
          }
        }
      });
  },

  showSubmitChosenHand: function () {
    var self = this;

    // Check if still decrypting - show warning and don't proceed
    if (this._fheDecrypting) {
      Logger.module('FHE_UI').log('[FHE] Cannot submit - still decrypting cards');
      // Show notification using existing navigation manager
      var NavigationManager = require('app/ui/managers/navigation_manager');
      NavigationManager.getInstance().showDialogForError('Decrypting your cards! Please wait for decryption to complete.');
      return;
    }

    // create an action to set the starting hand based on selected mulligan cards
    var mulliganIndices = Scene.getInstance().getGameLayer().getMulliganIndices();

    // Check if FHE mode is enabled
    var gameSession = SDK.GameSession.getInstance();
    var fheEnabled = gameSession.fheEnabled || CONFIG.fheEnabled;
    var isDeveloperMode = gameSession.getIsDeveloperMode();

    Logger.module('FHE_UI').log('=== showSubmitChosenHand FHE CHECK ===');
    Logger.module('FHE_UI').log('[FHE] mulliganIndices:', mulliganIndices);
    Logger.module('FHE_UI').log('[FHE] fheEnabled:', fheEnabled);
    Logger.module('FHE_UI').log('[FHE] isDeveloperMode:', isDeveloperMode);

    if (fheEnabled && !isDeveloperMode) {
      // FHE MODE
      Logger.module('FHE_UI').log('[FHE] FHE MODE detected');

      var fheGameSession = FHEGameSession.getInstance();

      // SINGLE PLAYER MODE: Contract zaten mulligan'i atladi (createSinglePlayerGame)
      // Oyun direkt InProgress durumunda, completeMulligan cagirmaya gerek yok
      // Sadece SDK tarafini sync edelim
      var isSinglePlayerGame = gameSession.isSinglePlayer() || gameSession.isBossBattle() || gameSession.isChallenge() || gameSession.isSandbox();
      Logger.module('FHE_UI').log('[FHE] isSinglePlayerGame:', isSinglePlayerGame);
      Logger.module('FHE_UI').log('[FHE] fheGameSession.gameId:', fheGameSession.gameId);

      if (isSinglePlayerGame) {
        // Single player FHE: Contract'ta mulligan yok, direkt SDK ile devam et
        Logger.module('FHE_UI').log('[FHE] SINGLE PLAYER - Skipping contract completeMulligan (already in InProgress state)');
        self._proceedWithMulligan(mulliganIndices);
      } else if (fheGameSession.gameId !== null && fheGameSession.contract) {
        // MULTIPLAYER FHE: Contract completeMulligan cagir
        Logger.module('FHE_UI').log('[FHE] MULTIPLAYER - Calling completeMulligan on contract...');

        // Convert mulliganIndices to bool[5] array
        // mulliganIndices = [1, 3] means replace cards at index 1 and 3
        var mulliganSlots = [false, false, false, false, false];
        for (var i = 0; i < mulliganIndices.length; i++) {
          var idx = mulliganIndices[i];
          if (idx >= 0 && idx < 5) {
            mulliganSlots[idx] = true;
          }
        }

        Logger.module('FHE_UI').log('[FHE] mulliganSlots for contract:', mulliganSlots);

        // Call contract completeMulligan
        fheGameSession.completeMulligan(mulliganSlots)
          .then(function() {
            Logger.module('FHE_UI').log('[FHE] completeMulligan TX confirmed');
            Logger.module('FHE_UI').log('[FHE] New hand ready, decrypting...');

            // Hand is already decrypted by completeMulligan (it calls decryptHand internally)
            var decryptedHand = fheGameSession.decryptedHand;
            Logger.module('FHE_UI').log('[FHE] Decrypted hand after mulligan:', decryptedHand);

            // Now proceed with SDK action (for UI sync)
            self._proceedWithMulligan(mulliganIndices);
          })
          .catch(function(error) {
            Logger.module('FHE_UI').error('[FHE] completeMulligan failed:', error);
            // Fallback to SDK
            self._proceedWithMulligan(mulliganIndices);
          });
      } else {
        Logger.module('FHE_UI').warn('[FHE] FHE game session not initialized');
        self._proceedWithMulligan(mulliganIndices);
      }
    } else {
      // Normal mode (dev mode or FHE disabled)
      Logger.module('FHE_UI').log('[FHE] Normal mode - using SDK mulligan');
      self._proceedWithMulligan(mulliganIndices);
    }
  },

  _proceedWithMulligan: function(mulliganIndices) {
    var drawStartingHandAction = SDK.GameSession.getInstance().getMyPlayer().actionDrawStartingHand(mulliganIndices);

    // submit chosen hand to server to get new cards
    var submitted = SDK.GameSession.getInstance().submitExplicitAction(drawStartingHandAction);

    // update UI if submitted
    Logger.module('UI').log('GameLayout.showSubmitChosenHand ->', mulliganIndices, 'submitted?', submitted);
    if (submitted) {
      // stop listening for submit
      if (this.chooseHandView != null) {
        this.chooseHandView.off('confirm', this.showSubmitChosenHand, this);
        this.chooseHandView = null;
      }

      // remove choose hand view
      this.middleRegion.empty();

      // show submit chosen hand in engine
      Scene.getInstance().getGameLayer().showSubmitChosenHand();
    }
  },

  onDrawStartingHand: function (event) {
    var action = event.action;
    var self = this;

    if (action instanceof SDK.DrawStartingHandAction && action.ownerId === SDK.GameSession.getInstance().getMyPlayerId()) {
      Logger.module('UI').log('GameLayout.onDrawStartingHand', action.mulliganIndices);
      this.stopListening(SDK.GameSession.getInstance().getEventBus(), EVENTS.action, this.onDrawStartingHand);

      // Check if FHE mode is enabled
      var gameSession = SDK.GameSession.getInstance();
      var fheEnabled = gameSession.fheEnabled || CONFIG.fheEnabled;
      var isDeveloperMode = gameSession.getIsDeveloperMode();

      Logger.module('FHE_UI').log('=== onDrawStartingHand FHE CHECK ===');
      Logger.module('FHE_UI').log('[FHE] fheEnabled:', fheEnabled);
      Logger.module('FHE_UI').log('[FHE] isDeveloperMode:', isDeveloperMode);

      if (fheEnabled && !isDeveloperMode) {
        Logger.module('FHE_UI').log('[FHE] FHE MODE ACTIVE');

        // FHE Mode: Get hand from contract and decrypt
        var fheGameSession = FHEGameSession.getInstance();

        // SINGLE PLAYER MODE: Contract islemleri basarisiz olabilir, SDK hand kullan
        // gameId 0 ise TX basarisiz olmus demektir
        var isSinglePlayerGame = gameSession.isSinglePlayer() || gameSession.isBossBattle() || gameSession.isChallenge() || gameSession.isSandbox();
        var hasValidGameId = fheGameSession.gameId !== null && fheGameSession.gameId > 0;

        Logger.module('FHE_UI').log('[FHE] isSinglePlayerGame:', isSinglePlayerGame);
        Logger.module('FHE_UI').log('[FHE] fheGameSession.gameId:', fheGameSession.gameId);
        Logger.module('FHE_UI').log('[FHE] hasValidGameId:', hasValidGameId);

        // FHE MODE: Kartlar zaten showNextStepInGameSetup'ta populate edildi
        // Burada tekrar decrypt/populate yapmaya GEREK YOK
        // Sadece UI'ı güncelle ve devam et
        Logger.module('FHE_UI').log('[FHE] Cards already populated in showNextStepInGameSetup, skipping re-populate');
        Scene.getInstance().getGameLayer().showDrawStartingHand(action.mulliganIndices).then(function () {
          self.showNextStepInGameSetup();
        });
      } else {
        Logger.module('FHE_UI').log('[FHE] Developer mode or FHE disabled - using SDK hand');

        // Normal mode: use SDK hand
        Scene.getInstance().getGameLayer().showDrawStartingHand(action.mulliganIndices).then(function () {
          self.showNextStepInGameSetup();
        });
      }
    }
  },

  /**
   * Adds a single card from FHE blockchain to the player's hand.
   * Used for turn-start card draw in FHE mode.
   *
   * @param {number} cardId - Card ID from FHE contract
   * @param {number|null} serverCardIndex - Card index from server (for sync). If null, generates new index.
   */
  _addFHECardToHand: function(cardId, serverCardIndex) {
    Logger.module('FHE_UI').log('[FHE] === _addFHECardToHand START ===');
    Logger.module('FHE_UI').log('[FHE] Card ID:', cardId, 'Server cardIndex:', serverCardIndex);

    var gameSession = SDK.GameSession.getInstance();
    var myPlayerId = gameSession.getMyPlayerId();
    var myPlayer = gameSession.getPlayerById(myPlayerId);

    if (!myPlayer) {
      Logger.module('FHE_UI').error('[FHE] Player not found!');
      return;
    }

    var deck = myPlayer.getDeck();
    var CardFactory = require('app/sdk/cards/cardFactory');

    // Find first empty slot in hand
    var emptySlot = -1;
    for (var i = 0; i < deck.hand.length; i++) {
      if (deck.hand[i] === null) {
        emptySlot = i;
        break;
      }
    }

    if (emptySlot === -1) {
      // Hand is full - card is "burned" (discarded)
      // Still need to decrement deck remaining for sync
      Logger.module('FHE_UI').log('[FHE] Hand is full - card BURNED (ID: ' + cardId + ')');
      var currentRemaining = deck.getFheDeckRemaining();
      if (currentRemaining !== null && currentRemaining > 0) {
        deck.setFheDeckRemaining(currentRemaining - 1);
        Logger.module('FHE_UI').log('[FHE] Deck remaining after burn:', currentRemaining - 1);
      }
      // Trigger burn event for UI feedback
      EventBus.getInstance().trigger(EVENTS.fhe_card_burned, { cardId: cardId });
      Logger.module('FHE_UI').log('[FHE] === _addFHECardToHand BURNED (hand full) ===');
      return;
    }

    // Create the card
    var fheCard = CardFactory.cardForIdentifier(cardId, gameSession);
    if (!fheCard) {
      Logger.module('FHE_UI').error('[FHE] Failed to create card for ID:', cardId);
      return;
    }

    // Use server-provided cardIndex for sync, or generate new one if not available
    var cardIndex = serverCardIndex != null ? serverCardIndex : gameSession.generateIndex();
    Logger.module('FHE_UI').log('[FHE] Using cardIndex:', cardIndex, '(from server:', serverCardIndex != null, ')');
    fheCard.setIndex(cardIndex);
    fheCard.setOwnerId(myPlayerId);
    fheCard.setOwner(myPlayer);
    gameSession.cardsByIndex[cardIndex] = fheCard;

    // Add to hand
    deck.hand[emptySlot] = cardIndex;
    deck.flushCachedCardsInHand();

    // FHE mode: Decrement deck remaining count
    var currentRemaining = deck.getFheDeckRemaining();
    if (currentRemaining !== null && currentRemaining > 0) {
      deck.setFheDeckRemaining(currentRemaining - 1);
      Logger.module('FHE_UI').log('[FHE] Deck remaining:', currentRemaining - 1);
    }

    // UI UPDATE: bindCardNodeAtIndex ile UI'ya karti bagla
    var gameLayer = Scene.getInstance().getGameLayer();
    if (gameLayer && gameLayer.bottomDeckLayer) {
      gameLayer.bottomDeckLayer.bindCardNodeAtIndex(emptySlot);
      Logger.module('FHE_UI').log('[FHE] Called bindCardNodeAtIndex for slot:', emptySlot);
    }

    Logger.module('FHE_UI').log('[FHE] Added ' + fheCard.getName() + ' (ID: ' + cardId + ', index: ' + cardIndex + ') to slot ' + emptySlot);
    Logger.module('FHE_UI').log('[FHE] === _addFHECardToHand COMPLETE ===');
  },

  /**
   * Populates the player's hand with cards from FHE blockchain.
   * In FHE mode, server doesn't create deck - we populate it here from blockchain.
   *
   * @param {number[]} decryptedCardIds - Card IDs from FHE contract
   * @param {number[]} mulliganIndices - Indices of cards that were mulliganed (unused for now)
   * @param {number} deckRemaining - Remaining cards in deck from blockchain (from getPlayerInfo)
   */
  _populateFHEHand: function(decryptedCardIds, mulliganIndices, deckRemaining, serverCardIndices) {
    Logger.module('FHE_UI').log('[FHE] === _populateFHEHand START ===');
    Logger.module('FHE_UI').log('[FHE] FHE Card IDs:', decryptedCardIds);
    Logger.module('FHE_UI').log('[FHE] Server cardIndices:', serverCardIndices);
    Logger.module('FHE_UI').log('[FHE] Card count:', decryptedCardIds.length);

    var gameSession = SDK.GameSession.getInstance();
    var myPlayerId = gameSession.getMyPlayerId();
    var myPlayer = gameSession.getPlayerById(myPlayerId);

    if (!myPlayer) {
      Logger.module('FHE_UI').error('[FHE] Player not found!');
      return;
    }

    var deck = myPlayer.getDeck();
    var CardFactory = require('app/sdk/cards/cardFactory');

    Logger.module('FHE_UI').log('[FHE] Current deck hand (should be empty):', deck.hand.slice());
    Logger.module('FHE_UI').log('[FHE] fheEnabled on gameSession:', gameSession.fheEnabled);

    // FHE modda deck bos geliyor - direkt kart olustur ve ekle
    var addedCount = 0;
    for (var i = 0; i < decryptedCardIds.length; i++) {
      var fheCardId = decryptedCardIds[i];

      // BigInt ise number'a cevir
      if (typeof fheCardId === 'bigint') {
        fheCardId = Number(fheCardId);
      }

      // FHE kartini olustur
      var fheCard = CardFactory.cardForIdentifier(fheCardId, gameSession);
      if (!fheCard) {
        Logger.module('FHE_UI').error('[FHE] Failed to create card for ID:', fheCardId);
        continue;
      }

      // CRITICAL: Use server-provided cardIndex for sync with authoritative server!
      // If serverCardIndices not provided, fall back to generateIndex (but this will cause sync issues)
      var cardIndex;
      if (serverCardIndices && serverCardIndices[i] != null) {
        cardIndex = serverCardIndices[i];
        Logger.module('FHE_UI').log('[FHE] Using SERVER cardIndex:', cardIndex);
      } else {
        cardIndex = gameSession.generateIndex();
        Logger.module('FHE_UI').warn('[FHE] WARNING: No server cardIndex, using generateIndex:', cardIndex);
      }
      fheCard.setIndex(cardIndex);
      fheCard.setOwnerId(myPlayerId);
      fheCard.setOwner(myPlayer);
      gameSession.cardsByIndex[cardIndex] = fheCard;

      // Eli guncelle - bu slot'a kart ekle
      deck.hand[i] = cardIndex;

      Logger.module('FHE_UI').log('[FHE] Slot ' + i + ': ' + fheCard.getName() + ' (ID: ' + fheCardId + ', index: ' + cardIndex + ')');
      addedCount++;
    }

    // Cache'leri temizle
    deck.flushCachedCardsInHand();

    // FHE mode: Set deck remaining from blockchain (passed as parameter from getPlayerInfo)
    // This value comes directly from contract.getPlayerInfo() - NOT hardcoded!
    deck.setFheDeckRemaining(deckRemaining);
    Logger.module('FHE_UI').log('[FHE] Set FHE deck remaining from blockchain:', deckRemaining);

    Logger.module('FHE_UI').log('[FHE] === POPULATE COMPLETE ===');
    Logger.module('FHE_UI').log('[FHE] Added ' + addedCount + ' FHE cards to empty deck');

    // Dogrulama: Eli logla
    var newHand = deck.getCardsInHandExcludingMissing();
    Logger.module('FHE_UI').log('[FHE] Verified hand after populate:');
    for (var k = 0; k < newHand.length; k++) {
      var card = newHand[k];
      Logger.module('FHE_UI').log('[FHE]   [' + k + '] ' + card.getName() + ' (ID: ' + card.getId() + ')');
    }
  },

  showStartingHand: function () {
    Logger.module('UI').log('GameLayout.showStartingHand');
    this.stopListening(SDK.GameSession.getInstance().getEventBus(), EVENTS.action, this.onDrawStartingHand);

    return Promise.all([
      Scene.getInstance().getGameLayer().showStartingHand(),
      this.middleRegion.show(new GameStartingHandItemView({ model: ProfileManager.getInstance().profile })),
    ]);
  },

  showActiveGame: function () {
    Logger.module('UI').log('GameLayout.showActiveGame');
    this.stopListening(SDK.GameSession.getInstance().getEventBus(), EVENTS.action, this.onDrawStartingHand);

    this.middleRegion.empty();

    var showActiveGamePromise;
    var gameLayer = Scene.getInstance().getGameLayer();
    if (gameLayer) {
      // when in sandbox mode, swap test user id back to profile user id
      if (SDK.GameSession.getInstance().isSandbox()) {
        gameLayer.whenIsStatusForActiveGame().then(function () {
          SDK.GameSession.getInstance().setUserId(SDK.GameSession.getInstance().getPlayer1().playerId);
        }.bind(this));
      }

      // show the active game
      gameLayer.showActiveGame();
      showActiveGamePromise = gameLayer.whenStatus(GameLayer.STATUS.ACTIVE).then(function () {
        // when the bottom deck (hand) is active, show the rest of the UI
        var uiPromises = [
          this.player1Region.show(new GamePlayer1Layout({ model: new Backbone.Model(), collection: new Backbone.Collection() })),
          this.player2Region.show(new GamePlayer2Layout({ model: new Backbone.Model(), collection: new Backbone.Collection() })),
          this.topRegion.show(new GameTopBarCompositeView()),
        ];
        if (!SDK.GameSession.getInstance().getIsSpectateMode() && !(this.bottomRegion.currentView instanceof GameBottomBarCompositeView)) {
          uiPromises.push(this.bottomRegion.show(new GameBottomBarCompositeView()));
        }
        return Promise.all(uiPromises);
      }.bind(this)).then(function () {
        // ai should send player glhf on show
        if (SDK.GameSession.getInstance().isActive() && SDK.GameSession.getInstance().isSinglePlayer() && !this._aiHasShownGLHF && !SDK.GameSession.getInstance().getIsSpectateMode()) {
          this._aiHasShownGLHF = true;
          this.showAIEmote(SDK.CosmeticsLookup.Emote.TextGLHF);
        }
      }.bind(this));
    } else {
      showActiveGamePromise = Promise.resolve();
    }

    return showActiveGamePromise;
  },

  showAIEmote: function (emoteId) {
    var aiPlayerLayout;
    if (this.player1Region.currentView && this.player1Region.currentView.model.get('playerId') === CONFIG.AI_PLAYER_ID) {
      aiPlayerLayout = this.player1Region.currentView;
    } else if (this.player2Region.currentView && this.player2Region.currentView.model.get('playerId') === CONFIG.AI_PLAYER_ID) {
      aiPlayerLayout = this.player2Region.currentView;
    }
    if (aiPlayerLayout != null) {
      aiPlayerLayout.popoverView.showEmote(emoteId);
    }
  },

  /* endregion STATES */

  /* region TURN TIMER */

  updateTurnTimerBar: function (time) {
    const isOpponentTurn = SDK.GameSession.getInstance().getCurrentPlayer() !== SDK.GameSession.getInstance().getMyPlayer();
    time = Math.ceil((time || 0) - CONFIG.TURN_DURATION_LATENCY_BUFFER);
    if (time <= CONFIG.TURN_TIME_SHOW) {
      this.ui.$turnTimerContainer.addClass('active');
      if (isOpponentTurn) {
        this.ui.$turnTimerBar.addClass('opponent');
      } else {
        this.ui.$turnTimerBar.removeClass('opponent');
      }

      var timePct = (time - 1.0) / CONFIG.TURN_TIME_SHOW;
      if (timePct < 0) {
        this.ui.$turnTimerBar.css('transform', 'translateX(100%) scaleX(0.0)');
      } else {
        this.ui.$turnTimerBar.css('transform', 'translateX(100%) scaleX(-' + timePct + ')');
        audio_engine.current().play_effect(RSX.sfx_ui_turn_time.audio, false);
        if (CONFIG.razerChromaEnabled) {
          // see game.scss .timer-bar for color definitions
          if (isOpponentTurn) {
            Chroma.flashTurnTimer(timePct, new Chroma.Color('E22A00'));
          } else {
            Chroma.flashTurnTimer(timePct, new Chroma.Color('00AAFD'));
          }
        }
      }
    } else {
      this.hideTurnTimerBar();
    }
  },

  hideTurnTimerBar: function () {
    if (this.ui.$turnTimerContainer.hasClass('active')) {
      this.ui.$turnTimerContainer.removeClass('active');
      this.ui.$turnTimerBar.css('transform', 'translateX(100%) scaleX(-1.0)');
    }
  },

  /* endregion TURN TIMER */

  onSpectatorJoined: function (spectatorModel) {
    if (spectatorModel.get('playerId') === ProfileManager.getInstance().get('id')) {
      this.showSpectatorNotification(spectatorModel.get('username') + ' is now spectating');
    }
  },

  onSpectatorLeft: function (spectatorModel) {
    if (spectatorModel.get('playerId') === ProfileManager.getInstance().get('id')) {
      this.showSpectatorNotification(spectatorModel.get('username') + ' has left');
    }
  },

  showSpectatorNotification: function (message) {
    this.ui.spectator_notification.show().find('.message').text(message);
    this.ui.spectator_notification.get(0).animate([
      { opacity: 0.0, transform: 'translateY(-2rem)' },
      { opacity: 1.0, transform: 'translateY(0rem)' },
    ], {
      duration: 500,
      delay: 0.0,
      fill: 'forwards',
    });
    clearTimeout(this._spectatorNotificationTimeout);
    this._spectatorNotificationTimeout = setTimeout(function () {
      var animation = this.ui.spectator_notification.get(0).animate([
        { opacity: 1.0, transform: 'translateY(0rem)' },
        { opacity: 0.0, transform: 'translateY(2rem)' },
      ], {
        duration: 300,
        delay: 0.0,
        fill: 'forwards',
      });

      animation.onfinish = this.showSpectatorStatus.bind(this);
    }.bind(this), 3000);
  },

  showSpectatorStatus: function () {
    if (NetworkManager.getInstance().spectators.length > 0) {
      this.ui.spectator_notification.find('.message').html('<i class="fa fa-eye"></i> ' + NetworkManager.getInstance().spectators.length).fadeIn();
      this.ui.spectator_notification.get(0).animate([
        { opacity: 0.0, transform: 'translateY(-2rem)' },
        { opacity: 1.0, transform: 'translateY(0rem)' },
      ], {
        duration: 100,
        delay: 0.0,
        fill: 'forwards',
      });
    }
  },

});

module.exports = GameLayout;
