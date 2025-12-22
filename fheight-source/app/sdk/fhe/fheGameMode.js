'use strict';

/**
 * FHE Game Mode
 *
 * Enables FHE mode when starting a game.
 * Integrates with existing GameSession.
 *
 * FLOW:
 * 1. FHE mode is checked when game is created
 * 2. If FHE is active, game is created on contract
 * 3. Card operations are performed via FHE
 * 4. Hand cards are decrypted with KMS
 */

var Promise = require('bluebird');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var FHESession = require('app/common/fhe_session');
var FHEGameSession = require('./fheGameSession');
var FHECardHandler = require('./fheCardHandler');

// FHE Game Mode States
var FHEModeState = {
  DISABLED: 'disabled',
  INITIALIZING: 'initializing',
  ACTIVE: 'active',
  ERROR: 'error'
};

/**
 * FHE Game Mode Manager
 */
function FHEGameMode() {
  this.state = FHEModeState.DISABLED;
  this.contractAddress = null;
  this.gameId = null;
  this.playerIndex = null;
  this.fheSession = null;
  this.fheGameSession = null;
  this.cardHandler = null;
  this.error = null;

  // Cached data
  this._decryptedHand = [];
  this._lastSyncTime = 0;
}

/**
 * Start FHE mode
 * Must be called before game is created
 *
 * @param {string} contractAddress - GameSession contract address
 * @returns {Promise}
 */
FHEGameMode.prototype.initialize = function(contractAddress) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self.state === FHEModeState.ACTIVE) {
      resolve();
      return;
    }

    self.state = FHEModeState.INITIALIZING;
    self.contractAddress = contractAddress;

    Logger.module('FHE_MODE').log('Initializing FHE mode with contract:', contractAddress);

    // Start FHE Session (session key + signature)
    self.fheSession = FHESession.getInstance();

    // Include ALL required contract addresses (GameSession + WalletVault)
    // Otherwise if session only contains GameSession, session wallet
    // would require separate session/signature for private key decrypt
    var addresses = self.fheSession.getContractAddresses();
    var allContracts = [contractAddress]; // GameSession
    if (addresses.WalletVault && allContracts.indexOf(addresses.WalletVault) === -1) {
      allContracts.push(addresses.WalletVault);
    }
    Logger.module('FHE_MODE').log('FHE Session contracts:', allContracts);

    self.fheSession.initializeSessionWithPIN(allContracts)
      .then(function(sessionInfo) {
        Logger.module('FHE_MODE').log('FHE Session initialized', {
          fromCache: sessionInfo.fromCache
        });

        // Start FHE Game Session
        self.fheGameSession = FHEGameSession.getInstance();
        return self.fheGameSession.connect(contractAddress);
      })
      .then(function() {
        // Start Card Handler
        self.cardHandler = FHECardHandler.getInstance();

        self.state = FHEModeState.ACTIVE;
        Logger.module('FHE_MODE').log('FHE mode active');
        resolve();
      })
      .catch(function(error) {
        self.state = FHEModeState.ERROR;
        self.error = error;
        Logger.module('FHE_MODE').error('FHE initialization failed:', error);
        reject(error);
      });
  });
};

/**
 * Create new FHE game (Multiplayer)
 *
 * @param {number} generalCardId - General card ID
 * @param {number[]} deckCardIds - 40 card deck
 * @returns {Promise<number>} gameId
 */
FHEGameMode.prototype.createGame = function(generalCardId, deckCardIds) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self.state !== FHEModeState.ACTIVE) {
      reject(new Error('FHE mode not active. Call initialize() first.'));
      return;
    }

    Logger.module('FHE_MODE').log('Creating FHE multiplayer game');

    self.fheGameSession.createGame(generalCardId, deckCardIds)
      .then(function(gameId) {
        self.gameId = gameId;
        self.playerIndex = 0;

        // Enable card handler
        return self.cardHandler.enable(self.contractAddress, gameId);
      })
      .then(function() {
        self.cardHandler.fheGameSession.playerIndex = 0;
        Logger.module('FHE_MODE').log('FHE multiplayer game created:', self.gameId);
        resolve(self.gameId);
      })
      .catch(reject);
  });
};

/**
 * Create new Single Player FHE game
 * Does not require joinGame, game starts directly
 *
 * @param {number} generalCardId - General card ID
 * @param {number[]} deckCardIds - 40 card deck
 * @returns {Promise<number>} gameId
 */
FHEGameMode.prototype.createSinglePlayerGame = function(generalCardId, deckCardIds) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self.state !== FHEModeState.ACTIVE) {
      reject(new Error('FHE mode not active. Call initialize() first.'));
      return;
    }

    // Generate unique gameId (timestamp-based to ensure uniqueness on blockchain)
    // Note: generalCardId is for SDK, NOT for blockchain gameId!
    var uniqueGameId = Date.now();
    Logger.module('FHE_MODE').log('Creating FHE SINGLE PLAYER game with uniqueGameId:', uniqueGameId);

    self.fheGameSession.createSinglePlayerGame(uniqueGameId, deckCardIds)
      .then(function(gameId) {
        self.gameId = gameId;
        self.playerIndex = 0;

        // Enable card handler
        return self.cardHandler.enable(self.contractAddress, gameId);
      })
      .then(function() {
        self.cardHandler.fheGameSession.playerIndex = 0;
        Logger.module('FHE_MODE').log('FHE single player game created:', self.gameId);
        resolve(self.gameId);
      })
      .catch(reject);
  });
};

/**
 * Join existing FHE game
 *
 * @param {number} gameId - Game ID
 * @param {number} generalCardId - General card ID
 * @param {number[]} deckCardIds - 40 card deck
 * @returns {Promise}
 */
FHEGameMode.prototype.joinGame = function(gameId, generalCardId, deckCardIds) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (self.state !== FHEModeState.ACTIVE) {
      reject(new Error('FHE mode not active. Call initialize() first.'));
      return;
    }

    Logger.module('FHE_MODE').log('Joining FHE game:', gameId);

    self.fheGameSession.joinGame(gameId, generalCardId, deckCardIds)
      .then(function() {
        self.gameId = gameId;
        self.playerIndex = 1;

        // Enable card handler
        return self.cardHandler.enable(self.contractAddress, gameId);
      })
      .then(function() {
        self.cardHandler.fheGameSession.playerIndex = 1;
        Logger.module('FHE_MODE').log('Joined FHE game:', gameId);
        resolve();
      })
      .catch(reject);
  });
};

/**
 * Decrypt hand cards
 *
 * @returns {Promise<number[]>} Decrypted card IDs
 */
FHEGameMode.prototype.decryptHand = function() {
  var self = this;

  if (self.state !== FHEModeState.ACTIVE || !self.cardHandler) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return self.cardHandler.decryptHand()
    .then(function(hand) {
      self._decryptedHand = hand;
      self._lastSyncTime = Date.now();
      return hand;
    });
};

/**
 * Get cached decrypted hand
 */
FHEGameMode.prototype.getDecryptedHand = function() {
  return this._decryptedHand;
};

/**
 * Draw card
 */
FHEGameMode.prototype.drawCard = function() {
  var self = this;

  if (self.state !== FHEModeState.ACTIVE || !self.cardHandler) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return self.fheGameSession.drawCard()
    .then(function(hand) {
      self._decryptedHand = hand;
      return hand;
    });
};

/**
 * Play card
 */
FHEGameMode.prototype.playCard = function(handSlot, x, y) {
  if (this.state !== FHEModeState.ACTIVE || !this.cardHandler) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return this.cardHandler.playCard(handSlot, x, y);
};

/**
 * Replace card
 */
FHEGameMode.prototype.replaceCard = function(handSlot) {
  var self = this;

  if (self.state !== FHEModeState.ACTIVE || !self.cardHandler) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return self.cardHandler.replaceCard(handSlot)
    .then(function(hand) {
      self._decryptedHand = hand;
      return hand;
    });
};

/**
 * Complete mulligan
 */
FHEGameMode.prototype.completeMulligan = function(mulliganSlots) {
  var self = this;

  if (self.state !== FHEModeState.ACTIVE || !self.fheGameSession) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return self.fheGameSession.completeMulligan(mulliganSlots)
    .then(function(hand) {
      self._decryptedHand = hand;
      return hand;
    });
};

/**
 * End turn
 */
FHEGameMode.prototype.endTurn = function() {
  if (this.state !== FHEModeState.ACTIVE || !this.fheGameSession) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return this.fheGameSession.endTurn();
};

/**
 * Move unit
 */
FHEGameMode.prototype.moveUnit = function(fromX, fromY, toX, toY) {
  if (this.state !== FHEModeState.ACTIVE || !this.fheGameSession) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return this.fheGameSession.moveUnit(fromX, fromY, toX, toY);
};

/**
 * Attack
 */
FHEGameMode.prototype.attack = function(attackerX, attackerY, targetX, targetY) {
  if (this.state !== FHEModeState.ACTIVE || !this.fheGameSession) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return this.fheGameSession.attack(attackerX, attackerY, targetX, targetY);
};

/**
 * Resign
 */
FHEGameMode.prototype.resign = function() {
  if (this.state !== FHEModeState.ACTIVE || !this.fheGameSession) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return this.fheGameSession.resign();
};

/**
 * Get game state
 */
FHEGameMode.prototype.getGameState = function() {
  if (this.state !== FHEModeState.ACTIVE || !this.fheGameSession) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return this.fheGameSession.getGameState();
};

/**
 * Get player info
 */
FHEGameMode.prototype.getPlayerInfo = function(playerIndex) {
  if (this.state !== FHEModeState.ACTIVE || !this.fheGameSession) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return this.fheGameSession.getPlayerInfo(playerIndex);
};

/**
 * Get board unit info
 */
FHEGameMode.prototype.getBoardUnit = function(x, y) {
  if (this.state !== FHEModeState.ACTIVE || !this.fheGameSession) {
    return Promise.reject(new Error('FHE mode not active'));
  }

  return this.fheGameSession.getBoardUnit(x, y);
};

/**
 * Is FHE mode active?
 */
FHEGameMode.prototype.isActive = function() {
  return this.state === FHEModeState.ACTIVE;
};

/**
 * Current state
 */
FHEGameMode.prototype.getState = function() {
  return this.state;
};

/**
 * Error message
 */
FHEGameMode.prototype.getError = function() {
  return this.error;
};

/**
 * Shutdown FHE mode
 */
FHEGameMode.prototype.shutdown = function() {
  if (this.cardHandler) {
    this.cardHandler.disable();
  }
  if (this.fheGameSession) {
    this.fheGameSession.disconnect();
  }

  this.state = FHEModeState.DISABLED;
  this.contractAddress = null;
  this.gameId = null;
  this.playerIndex = null;
  this._decryptedHand = [];
  this.error = null;

  Logger.module('FHE_MODE').log('FHE mode shutdown');
};

// Singleton instance
var instance = null;

module.exports = {
  getInstance: function() {
    if (!instance) {
      instance = new FHEGameMode();
    }
    return instance;
  },
  FHEModeState: FHEModeState
};
