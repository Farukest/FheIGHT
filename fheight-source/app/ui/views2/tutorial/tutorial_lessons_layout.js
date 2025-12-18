// pragma PKGS: nongame

'use strict';

var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var CONFIG = require('app/common/config');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var Scene = require('app/view/Scene');
var SDK = require('app/sdk');
var moment = require('moment');
var Promise = require('bluebird');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
// template
//
var Animations = require('app/ui/views/animations');
var NavigationManager = require('app/ui/managers/navigation_manager');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var UtilsUI = require('app/common/utils/utils_ui');
var FHEIGHTBackbone = require('app/ui/extensions/fheight_backbone');
var FHEIGHTFirebase = require('app/ui/extensions/fheight_firebase');
var ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
var i18next = require('i18next');
var TutorialLessonsLayoutTemplate = require('./templates/tutorial_lessons_layout.hbs');
// Wallet modules for FHE session wallet creation
var Wallet = require('app/common/wallet');
var SessionWallet = require('app/common/session_wallet');

var TutorialLessonsLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-tutorial',
  className: 'modal fheight-modal',
  template: TutorialLessonsLayoutTemplate,
  ui: {},
  events: {
    'click .lesson > .image': 'onLessonSelected',
    'click #button_continue': 'onContinuePressed',
    'click #button_skip': 'onSkipPressed',
    'mouseenter .lesson': 'onMouseEnterLesson',
  },

  _screenBlurId: null,
  _previousBlurProgramKey: null,
  _lastCompletedChallenge: null,

  initialize: function (options) {
    this._lastCompletedChallenge = options.lastCompletedChallenge;
    this.model = new Backbone.Model();

    // Check if session wallet already exists (wallet step completed)
    var walletConnected = SessionWallet.hasWallet();
    this.model.set('walletConnected', walletConnected);

    var tutorialChallenges = SDK.ChallengeFactory.getChallengesForCategoryType(SDK.ChallengeCategory.tutorial.type);
    var lessons = [];
    _.each(tutorialChallenges, function (c) {
      var data = _.pick(c, ['type', 'name', 'description', 'iconUrl']);
      data.isComplete = ProgressionManager.getInstance().hasCompletedChallengeOfType(c.type);
      lessons.push(data);
      this.model.set(c.type, data);
    }.bind(this));
    this.model.set('lessons', lessons);
  },

  onShow: function () {
    this._previousBlurProgramKey = Scene.getInstance().getFX().surfaceBlurShaderProgramKey;
    if (this._screenBlurId == null) {
      this._screenBlurId = UtilsJavascript.generateIncrementalId();
    }
    Scene.getInstance().getFX().screenBlurShaderProgramKey = 'BlurFullScreenMega';
    Scene.getInstance().getFX().requestBlurScreen(this._screenBlurId);

    this.animateReveal();
  },

  onPrepareForDestroy: function () {
    Scene.getInstance().getFX().screenBlurShaderProgramKey = this._previousBlurProgramKey;
    Scene.getInstance().getFX().requestUnblurScreen(this._screenBlurId);
  },

  animateReveal: function () {
    var title = this.$el.find('.header > h1').css('opacity', 0)[0];
    var hr = this.$el.find('.header > hr').css('opacity', 0)[0];
    var titleParagraph = this.$el.find('.header > p').css('opacity', 0)[0];
    var lessons = this.$el.find('.lessons > .lesson').css('opacity', 0);
    var line = this.$el.find('.line').css('opacity', 0)[0];
    var actionBar = this.$el.find('.action-bar').css('opacity', 0)[0];

    // remove the last completed lesson marker so we can animate it in
    for (var i = 0; i < lessons.length; i++) {
      if (this._lastCompletedChallenge && $(lessons[i]).attr('id') === this._lastCompletedChallenge.type) {
        $(lessons[i]).removeClass('complete').addClass('has-emphasis');
      }
    }

    var delay = 400;

    title.animate([
      { opacity: 0.0, transform: 'translateY(1.0rem)' },
      { opacity: 1.0, transform: 'translateY(0)' },
    ], {
      duration: 200,
      delay: delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    delay += 100;

    hr.animate([
      { opacity: 0.0 },
      { opacity: 1.0 },
    ], {
      duration: 200,
      delay: delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    delay += 100;

    titleParagraph.animate([
      { opacity: 0.0, transform: 'translateY(1.0rem)' },
      { opacity: 1.0, transform: 'translateY(0)' },
    ], {
      duration: 200,
      delay: delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    delay += 100;

    _.each(lessons, function (lesson) {
      lesson.animate([
        { opacity: 0.0, transform: 'translateY(1.0rem)' },
        { opacity: 1.0, transform: 'translateY(0)' },
      ], {
        duration: 400,
        delay: delay,
        easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
        fill: 'forwards',
      });
      delay += 100;
    });

    line.animate([
      { opacity: 0.0 },
      { opacity: 1.0 },
    ], {
      duration: 100,
      delay: delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });
    delay += 100;

    var animation = actionBar.animate([
      { opacity: 0.0, transform: 'translateY(1.0rem)' },
      { opacity: 1.0, transform: 'translateY(0)' },
    ], {
      duration: 200,
      delay: delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    if (this._lastCompletedChallenge) {
      animation.onfinish = function () {
        this.emphasizeNextLesson();
      }.bind(this);
    } else {
      this.emphasizeNextLesson();
    }
  },

  emphasizeNextLesson: function () {
    var lessons = this.$el.find('.lessons > .lesson');
    for (var i = 0; i < lessons.length; i++) {
      var $lesson = $(lessons[i]);
      var lessonId = $lesson.attr('id');

      // Handle last completed challenge animation
      if (this._lastCompletedChallenge && lessonId === this._lastCompletedChallenge.type) {
        _.delay(function () {
          $lesson.removeClass('has-emphasis').addClass('complete');
          audio_engine.current().play_effect(RSX.sfx_ui_confirm.audio);
          this._lastCompletedChallenge = null;
          this.emphasizeNextLesson();
        }.bind(this), 200);
        break;
      } else if (!$lesson.hasClass('complete')) {
        // Skip wallet step if already connected (check model)
        if (lessonId === 'WalletConnect' && this.model.get('walletConnected')) {
          continue;
        }
        $lesson.addClass('has-emphasis');
        break;
      }
    }
  },

  onLessonSelected: function (e) {
    var self = this;
    var lessonType = $(e.currentTarget).data('lesson-id');
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_click.audio, CONFIG.CLICK_SFX_PRIORITY);

    // WalletConnect adımına tıklanamaz - sadece Continue butonu ile
    if (lessonType === 'WalletConnect') {
      return; // Tıklama devre dışı, Continue kullan
    }

    // Wallet adımı tamamlanmadan diğer adımlara geçilemez
    if (!this.model.get('walletConnected')) {
      Logger.module('TUTORIAL').log('Wallet step must be completed first');
      return;
    }

    if (this.model.get(lessonType) && this.model.get(lessonType).isComplete) {
      return;
    }

    var challenge = SDK.ChallengeFactory.challengeForType(lessonType);
    EventBus.getInstance().trigger(EVENTS.start_challenge, challenge);
  },

  /**
   * Handle wallet connect step - creates FHE session wallet
   */
  onWalletConnectSelected: function () {
    var self = this;

    Logger.module('TUTORIAL').log('Starting wallet connect step...');

    // Cache selectors
    var $walletStep = this.$el.find('#WalletConnect');
    var $continueBtn = this.$el.find('#button_continue');
    var $skipBtn = this.$el.find('#button_skip');

    // Önce doğru ağda olup olmadığını kontrol et
    var walletState = Wallet.getState();
    var currentNetwork = walletState.networkName;

    Logger.module('TUTORIAL').log('Current network:', currentNetwork, 'chainId:', walletState.chainId);

    // Sepolia veya hardhat dışında bir ağdaysa, ağ değiştirmeyi iste
    if (currentNetwork !== 'sepolia' && currentNetwork !== 'hardhat') {
      Logger.module('TUTORIAL').log('Wrong network, switching to Sepolia...');

      // Disable buttons during network switch
      $continueBtn.prop('disabled', true).addClass('processing');
      $continueBtn.text('Switching...');
      $skipBtn.prop('disabled', true);

      $walletStep.addClass('loading');
      $walletStep.find('h2').text('SWITCHING NETWORK...');

      // Sepolia'ya geç
      Wallet.switchNetwork('sepolia')
        .then(function() {
          Logger.module('TUTORIAL').log('Network switched to Sepolia');
          // Ağ değişti, şimdi wallet oluştur
          self._createSessionWallet($walletStep);
        })
        .catch(function(err) {
          Logger.module('TUTORIAL').error('Network switch failed:', err);

          // Reset UI
          $walletStep.removeClass('loading');
          $walletStep.find('h2').text('CONNECT WALLET');

          // Reset buttons
          $continueBtn.prop('disabled', false).removeClass('processing');
          $continueBtn.text('Continue');
          $skipBtn.prop('disabled', false);

          // Kullanıcı ağ değiştirmeyi reddetti
        });
      return;
    }

    // Doğru ağdayız, wallet oluştur
    this._createSessionWallet($walletStep);
  },

  /**
   * Internal: Create session wallet after network check
   */
  _createSessionWallet: function($walletStep) {
    var self = this;

    // Cache selectors
    var walletStepSelector = '#WalletConnect';
    var $continueBtn = this.$el.find('#button_continue');
    var $skipBtn = this.$el.find('#button_skip');
    var originalBtnText = 'Continue';

    // Disable buttons during operation
    $continueBtn.prop('disabled', true).addClass('processing');
    $skipBtn.prop('disabled', true);

    // Update UI - wallet step
    self.$el.find(walletStepSelector).addClass('loading');
    self.$el.find(walletStepSelector + ' h2').text('CREATING...');

    // Update button with initial state
    $continueBtn.text('Creating...');

    // Progress step messages for button (shorter versions)
    var buttonMessages = {
      1: 'Generating...',
      2: 'Encrypting...',
      3: 'Sign TX...',
      4: 'Confirming...'
    };

    // Listen for progress events
    var onProgress = function(data) {
      Logger.module('TUTORIAL').log('Wallet progress:', data.step, data.message);

      // Update wallet step h2
      var $h2 = self.$el.find(walletStepSelector + ' h2');
      if ($h2.length > 0) {
        $h2.text(data.message);
      }

      // Update Continue button with shorter message
      var btnMsg = buttonMessages[data.step] || data.message;
      $continueBtn.text(btnMsg);
    };

    SessionWallet.on('walletProgress', onProgress);

    // Create FHE session wallet
    SessionWallet.createWallet()
      .then(function (address) {
        Logger.module('TUTORIAL').log('FHE wallet created:', address);

        // Remove progress listener
        SessionWallet.off('walletProgress', onProgress);

        // Mark as complete
        self.model.set('walletConnected', true);
        var $step = self.$el.find(walletStepSelector);
        $step.removeClass('loading').addClass('complete');
        $step.find('h2').text('WALLET CONNECTED');

        // Reset button to normal state
        $continueBtn.prop('disabled', false).removeClass('processing');
        $continueBtn.text(originalBtnText);
        $skipBtn.prop('disabled', false);

        // Play success sound
        audio_engine.current().play_effect(RSX.sfx_ui_confirm.audio);

        // Move emphasis to next lesson
        self.emphasizeNextLesson();
      })
      .catch(function (err) {
        Logger.module('TUTORIAL').error('Wallet creation failed:', err);

        // Remove progress listener
        SessionWallet.off('walletProgress', onProgress);

        // Reset wallet step
        var $step = self.$el.find(walletStepSelector);
        $step.removeClass('loading');
        $step.find('h2').text('CONNECT WALLET');

        // Reset button to original state - user can try again
        $continueBtn.prop('disabled', false).removeClass('processing');
        $continueBtn.text(originalBtnText);
        $skipBtn.prop('disabled', false);

        // User cancelled MetaMask or TX failed - ready to retry
      });
  },

  onContinuePressed: function () {
    var lessons = this.$el.find('.lessons > .lesson');
    for (var i = 0; i < lessons.length; i++) {
      var $lesson = $(lessons[i]);
      var lessonId = $lesson.attr('id');

      if (!$lesson.hasClass('complete')) {
        // Handle wallet connect step
        if (lessonId === 'WalletConnect') {
          if (!this.model.get('walletConnected')) {
            this.onWalletConnectSelected();
            return;
          }
          continue; // Already connected, skip to next
        }

        // Start regular tutorial challenge
        var challenge = SDK.ChallengeFactory.challengeForType(lessonId);
        if (challenge) {
          EventBus.getInstance().trigger(EVENTS.start_challenge, challenge);
          return;
        }
      }
    }

    // if we're here looks like we're done
    NewPlayerManager.getInstance().updateCoreState();
    NavigationManager.getInstance().requestUserTriggeredExit();
  },

  onSkipPressed: function () {
    // Wallet adımı tamamlanmadan skip edilemez
    if (!this.model.get('walletConnected')) {
      NavigationManager.getInstance().showDialogForConfirmation(
        'You must create your FHE wallet first before skipping the tutorial.',
        'Create Wallet'
      ).then(function() {
        // User clicked OK - do nothing, they need to use Continue button
      }).catch(function() {
        // User cancelled - do nothing
      });
      return;
    }

    NavigationManager.getInstance().showDialogForConfirmation(i18next.t('tutorial.confirm_skip_message')).then(function () {
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());

      var lessons = SDK.ChallengeFactory.getChallengesForCategoryType(SDK.ChallengeCategory.tutorial.type);
      var challengeCompletionPromises = _.map(lessons, function (lesson) {
        // error checking
        if (lesson == null || lesson.type == null) {
          console.error('Error in FTUE Tutorial Challenge data');
          return Promise.reject('Error in FTUE Tutorial Challenge data');
        }

        if (!ProgressionManager.getInstance().hasCompletedChallengeOfType(lesson.type)) {
          // Set challenge as completed
          return ProgressionManager.getInstance().completeChallengeWithType(lesson.type);
        } else {
          // Challenge was already completed
          return Promise.resolve();
        }
      });

      return Promise.all(challengeCompletionPromises)
        .then(function () {
          return NewPlayerManager.getInstance().updateCoreState();
        }).then(function () {
          NavigationManager.getInstance().destroyDialogView();
          NavigationManager.getInstance().requestUserTriggeredExit();
        }).catch(function (error) {
          console.error('Tutorial skip error:', error);
          NavigationManager.getInstance().destroyDialogView();
          NavigationManager.getInstance().requestUserTriggeredExit();
        });
    }.bind(this)).catch(function (error) {
      // User cancelled the dialog or other error
      console.log('Tutorial skip cancelled or error:', error);
    });
  },

  onMouseEnterLesson: function () {
    audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
  },
});

// Expose the class either via CommonJS or the global object
module.exports = TutorialLessonsLayout;
