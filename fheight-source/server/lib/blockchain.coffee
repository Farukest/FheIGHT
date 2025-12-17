# Server-side blockchain module for FHE game verification
# Per FLOW.MD: Server NEVER sends TX, only VIEW calls
#
# FLOW.MD Steps:
# - Step 15: Server calls getVerifiedDrawOrder(gameId) after client reveals
# - Step 16: Server calculates cards using same algorithm as client
# - Step 38-39: After turn end, server reads new indices

{ ethers } = require 'ethers'
Logger = require '../../app/common/logger'
config = require '../../config/config'

# GameSession contract ABI - VIEW FUNCTIONS ONLY
# Server asla TX göndermez!
GAME_SESSION_ABI = [
  # getVerifiedDrawOrder - Doğrulanmış tüm draw index'leri
  {
    "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }],
    "name": "getVerifiedDrawOrder",
    "outputs": [{ "internalType": "uint8[]", "name": "", "type": "uint8[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  # getGameInfo - Oyun bilgileri
  {
    "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }],
    "name": "getGameInfo",
    "outputs": [
      { "internalType": "address", "name": "player", "type": "address" },
      { "internalType": "uint8", "name": "currentTurn", "type": "uint8" },
      { "internalType": "uint8", "name": "revealedCount", "type": "uint8" },
      { "internalType": "uint8", "name": "allowedReveals", "type": "uint8" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  # getRevealedCount
  {
    "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }],
    "name": "getRevealedCount",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  # getCurrentTurn
  {
    "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }],
    "name": "getCurrentTurn",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  # isGameActive
  {
    "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }],
    "name": "isGameActive",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  # getAllowedReveals
  {
    "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }],
    "name": "getAllowedReveals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
]

# Contract addresses
CONTRACT_ADDRESSES =
  sepolia: '0x0Cc86698f008a6b86d1469Dcc8929E4FF7c28dBD'  # v19 - FHE.allowThis() added
  hardhat: '0x68B1D87F95878fE05B998F19b66F4baba5De1aed'

# RPC URLs
RPC_URLS =
  sepolia: process.env.SEPOLIA_RPC_URL or 'https://eth-sepolia.g.alchemy.com/v2/zx-gKGneFq4SkfpYLlFIEf7mVPMXxjdV'
  hardhat: 'http://127.0.0.1:8545'

class BlockchainModule

  # Provider cache
  @_providers: {}

  ###*
  # Get provider for network (cached)
  # @param {string} network - 'sepolia' or 'hardhat'
  # @return {ethers.JsonRpcProvider}
  ###
  @_getProvider: (network) ->
    if !@_providers[network]
      rpcUrl = RPC_URLS[network]
      if !rpcUrl
        throw new Error("Unknown network: #{network}")
      @_providers[network] = new ethers.JsonRpcProvider(rpcUrl)
    return @_providers[network]

  ###*
  # Get contract instance (read-only)
  # @param {string} network - 'sepolia' or 'hardhat'
  # @return {ethers.Contract}
  ###
  @_getContract: (network) ->
    provider = @_getProvider(network)
    contractAddress = CONTRACT_ADDRESSES[network]
    if !contractAddress
      throw new Error("Unknown network: #{network}")
    return new ethers.Contract(contractAddress, GAME_SESSION_ABI, provider)

  ###*
  # Get verified draw order from contract
  # FLOW.MD Step 15 & 38: Server calls this to get revealed indices
  # @param {string} network - 'sepolia' or 'hardhat'
  # @param {string|number} gameId - Blockchain game ID
  # @return {Promise<number[]>} - Array of revealed draw indices
  ###
  @getVerifiedDrawOrder: (network, gameId) ->
    Logger.module("BLOCKCHAIN").debug "getVerifiedDrawOrder(#{gameId}) on #{network}"

    try
      contract = @_getContract(network)
      contract.getVerifiedDrawOrder(gameId)
      .then (indices) ->
        # Convert BigInt array to number array
        result = indices.map((idx) -> Number(idx))
        Logger.module("BLOCKCHAIN").debug "  Verified indices: [#{result.join(', ')}]"
        return result
      .catch (error) ->
        Logger.module("BLOCKCHAIN").error "getVerifiedDrawOrder failed: #{error.message}"
        throw error
    catch error
      return Promise.reject(error)

  ###*
  # Get game info from contract
  # @param {string} network - 'sepolia' or 'hardhat'
  # @param {string|number} gameId - Blockchain game ID
  # @return {Promise<{player, currentTurn, revealedCount, allowedReveals, isActive}>}
  ###
  @getGameInfo: (network, gameId) ->
    Logger.module("BLOCKCHAIN").debug "getGameInfo(#{gameId}) on #{network}"

    try
      contract = @_getContract(network)
      contract.getGameInfo(gameId)
      .then (result) ->
        info = {
          player: result[0]
          currentTurn: Number(result[1])
          revealedCount: Number(result[2])
          allowedReveals: Number(result[3])
          isActive: result[4]
        }
        Logger.module("BLOCKCHAIN").debug "  Game info:", info
        return info
      .catch (error) ->
        Logger.module("BLOCKCHAIN").error "getGameInfo failed: #{error.message}"
        throw error
    catch error
      return Promise.reject(error)

  ###*
  # Get revealed count from contract
  # @param {string} network - 'sepolia' or 'hardhat'
  # @param {string|number} gameId - Blockchain game ID
  # @return {Promise<number>}
  ###
  @getRevealedCount: (network, gameId) ->
    try
      contract = @_getContract(network)
      contract.getRevealedCount(gameId)
      .then (count) -> Number(count)
    catch error
      return Promise.reject(error)

  ###*
  # Get current turn from contract
  # @param {string} network - 'sepolia' or 'hardhat'
  # @param {string|number} gameId - Blockchain game ID
  # @return {Promise<number>}
  ###
  @getCurrentTurn: (network, gameId) ->
    try
      contract = @_getContract(network)
      contract.getCurrentTurn(gameId)
      .then (turn) -> Number(turn)
    catch error
      return Promise.reject(error)

  ###*
  # Check if game is active
  # @param {string} network - 'sepolia' or 'hardhat'
  # @param {string|number} gameId - Blockchain game ID
  # @return {Promise<boolean>}
  ###
  @isGameActive: (network, gameId) ->
    try
      contract = @_getContract(network)
      contract.isGameActive(gameId)
    catch error
      return Promise.reject(error)

  ###*
  # Get allowed reveals count
  # @param {string} network - 'sepolia' or 'hardhat'
  # @param {string|number} gameId - Blockchain game ID
  # @return {Promise<number>}
  ###
  @getAllowedReveals: (network, gameId) ->
    try
      contract = @_getContract(network)
      contract.getAllowedReveals(gameId)
      .then (count) -> Number(count)
    catch error
      return Promise.reject(error)

  ###*
  # Calculate cards from deck using revealed indices
  # FLOW.MD Step 16 & 39: Same algorithm as client uses
  # @param {Array} deck - Full deck (40 cards, ordered by server)
  # @param {number[]} indices - Revealed indices from contract
  # @return {Array} - Calculated cards in draw order
  ###
  @calculateCardsFromIndices: (deck, indices) ->
    remaining = deck.slice()  # Copy
    cards = []

    for idx in indices
      pos = idx % remaining.length
      cards.push(remaining[pos])
      remaining.splice(pos, 1)

    return {
      drawnCards: cards
      remainingDeck: remaining
    }

  ###*
  # Verify client's claim against contract
  # Server calls this when client says "reveal complete"
  # @param {string} network - Network name
  # @param {string|number} gameId - Blockchain game ID
  # @param {Array} deck - Server's copy of player deck
  # @param {number} expectedRevealCount - How many cards should be revealed
  # @return {Promise<{verified, cards, error}>}
  ###
  @verifyAndCalculateCards: (network, gameId, deck, expectedRevealCount) ->
    Logger.module("BLOCKCHAIN").debug "verifyAndCalculateCards for game #{gameId}"

    @getVerifiedDrawOrder(network, gameId)
    .then (indices) =>
      # Check reveal count matches expectation
      if indices.length != expectedRevealCount
        return {
          verified: false
          error: "Expected #{expectedRevealCount} reveals, got #{indices.length}"
        }

      # Calculate cards using same algorithm as client
      result = @calculateCardsFromIndices(deck, indices)

      Logger.module("BLOCKCHAIN").debug "  Verified #{result.drawnCards.length} cards"

      return {
        verified: true
        cards: result.drawnCards
        remainingDeck: result.remainingDeck
        indices: indices
      }
    .catch (error) ->
      Logger.module("BLOCKCHAIN").error "verifyAndCalculateCards failed: #{error.message}"
      return {
        verified: false
        error: error.message
      }

module.exports = BlockchainModule
