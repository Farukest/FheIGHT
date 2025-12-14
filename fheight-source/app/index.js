/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */

// ethers.js global export (for contract interactions)
const ethers = require('ethers');
window.ethers = ethers;

// EAGER INIT: Wallet modülünü en başta yükle
// Bu sayede MetaMask bağlantısı sayfa açılır açılmaz kontrol edilir
require('app/common/wallet');

// localization setup
const whenLocalizationReady = require('app/localization/index');

whenLocalizationReady.then(function(){
  let app;
  const i18next = require('i18next');
  return app = require('./application');
});