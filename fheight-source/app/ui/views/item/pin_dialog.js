// pragma PKGS: alwaysloaded

'use strict';

var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var PinDialogTempl = require('app/ui/templates/item/pin_dialog.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');

/**
 * PIN Dialog for FHE Session encryption
 *
 * Usage:
 * var pinDialog = new PinDialogItemView({ isCreate: true });
 * pinDialog.on('confirm', function(pin) { ... });
 * pinDialog.on('cancel', function() { ... });
 * NavigationManager.getInstance().showDialogView(pinDialog);
 */
var PinDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-pin-dialog',
  className: 'modal prompt-modal',

  template: PinDialogTempl,

  ui: {
    $pinInput: '.pin-input',
    $pinConfirmInput: '.pin-confirm-input',
    $pinError: '.pin-error',
    $errorText: '.error-text',
  },

  events: {
    click: 'onPress',
    'click .cancel-dialog': 'onCancel',
    'click .confirm-dialog': 'onConfirm',
    'keyup .pin-input': 'onPinKeyUp',
    'keyup .pin-confirm-input': 'onPinKeyUp',
  },

  initialize: function () {
    this.model = new Backbone.Model({
      isCreate: this.options.isCreate || false,
      message: this.options.message || '',
    });
  },

  onRender: function () {
    // Focus on PIN input after render
    var self = this;
    setTimeout(function() {
      self.ui.$pinInput.focus();
    }, 100);
  },

  onPress: function (e) {
    if ($(e.target).attr('id') === this.id) {
      this.onCancel(e);
    }
  },

  onShow: function () {
    // Listen to specific user attempted actions
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onConfirm);
  },

  onPinKeyUp: function (e) {
    // Hide error on input
    this.hideError();

    // Enter key submits
    if (e.keyCode === 13) {
      this.onConfirm();
    }
  },

  showError: function (message) {
    this.ui.$errorText.text(message);
    this.ui.$pinError.removeClass('hide');
    this.ui.$pinInput.addClass('has-error');
    if (this.ui.$pinConfirmInput.length) {
      this.ui.$pinConfirmInput.addClass('has-error');
    }
  },

  hideError: function () {
    this.ui.$pinError.addClass('hide');
    this.ui.$pinInput.removeClass('has-error');
    if (this.ui.$pinConfirmInput.length) {
      this.ui.$pinConfirmInput.removeClass('has-error');
    }
  },

  validatePin: function (pin) {
    if (!pin || pin.length < 4) {
      return { valid: false, error: 'PIN must be at least 4 digits' };
    }
    if (pin.length > 6) {
      return { valid: false, error: 'PIN must be at most 6 digits' };
    }
    if (!/^\d+$/.test(pin)) {
      return { valid: false, error: 'PIN must contain only numbers' };
    }
    return { valid: true };
  },

  onCancel: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    this.trigger('cancel');
    NavigationManager.getInstance().destroyDialogView();
  },

  onConfirm: function () {
    var pin = this.ui.$pinInput.val();
    var isCreate = this.model.get('isCreate');

    // Validate PIN
    var validation = this.validatePin(pin);
    if (!validation.valid) {
      this.showError(validation.error);
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
      return;
    }

    // If creating, check confirmation matches
    if (isCreate) {
      var confirmPin = this.ui.$pinConfirmInput.val();
      if (pin !== confirmPin) {
        this.showError('PINs do not match');
        audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
        return;
      }
    }

    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
    this.trigger('confirm', pin);
    NavigationManager.getInstance().destroyDialogView();
  },

});

module.exports = PinDialogItemView;
