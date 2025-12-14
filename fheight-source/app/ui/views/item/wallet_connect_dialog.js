'use strict';

/**
 * Wallet Connect Dialog
 * TODO: Implement wallet connection dialog
 */

var NavigationManager = require('app/ui/managers/navigation_manager');

var WalletConnectDialogItemView = Backbone.Marionette.ItemView.extend({
  id: 'app-wallet-connect-dialog',
  className: 'modal prompt-modal wallet-modal',
  template: require('app/ui/templates/item/wallet_connect_dialog.hbs'),

  // TODO: Implement
});

module.exports = WalletConnectDialogItemView;
