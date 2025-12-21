###
# FHE Marble Verifier - Server-side verification for FHE-based marble opening
#
# Bu modul contract'tan verified random degerleri okur ve kartlari hesaplar.
# Server randomizasyon YAPMAZ - sadece contract'tan verify edilmis degerleri okur.
#
# FLOW:
# 1. Client marble acar -> contract'ta drawRandoms ve revealRandoms yapar
# 2. Client server'a bildirir (fhe_marble_revealed event)
# 3. Server bu modulu kullanarak contract'tan getVerifiedRandoms() cagirir
# 4. Server kartlari hesaplar ve DB'ye yazar
###

Promise = require 'bluebird'
Logger = require '../../app/common/logger'
SDK = require '../../app/sdk'

# Ethers for contract interaction
ethers = require 'ethers'

# Contract artifact
MarbleRandomsArtifact = require '../../../fhevm-contracts/artifacts/contracts/MarbleRandoms.sol/MarbleRandoms.json'

# Contract address (will be loaded from config)
config = require '../../config/config.js'

class FHEMarbleVerifier
  # RPC Provider
  @_provider: null

  # Contract instance
  @_contract: null

  ###*
  # Initialize the verifier with RPC connection
  # @returns {Promise<void>}
  ###
  @init: () ->
    if @_contract
      return Promise.resolve()

    rpcUrl = config.get('fhe.sepoliaRpcUrl') or 'https://eth-sepolia.g.alchemy.com/v2/zx-gKGneFq4SkfpYLlFIEf7mVPMXxjdV'
    contractAddress = config.get('fhe.marbleRandomsContract') or '0x905cA0c59588d3F64cdad12534B5C450485206cc'

    @_provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    @_contract = new ethers.Contract(contractAddress, MarbleRandomsArtifact.abi, @_provider)

    Logger.module("FHE_MARBLE_VERIFIER").log "Initialized with contract: #{contractAddress}"
    Promise.resolve()

  ###*
  # Get verified random values from contract
  # @param {string} marbleId - Marble ID (bytes32 hex string)
  # @returns {Promise<{rarity: number[], index: number[], prismatic: number[]}>}
  ###
  @getVerifiedRandoms: (marbleId) ->
    self = @

    @init()
    .then () ->
      self._contract.getVerifiedRandoms(marbleId)
    .then (result) ->
      # Result is [uint8[5] rarity, uint8[5] index, uint8[5] prismatic]
      return {
        rarity: result[0].map((v) -> Number(v))
        index: result[1].map((v) -> Number(v))
        prismatic: result[2].map((v) -> Number(v))
      }

  ###*
  # Check if marble is revealed
  # @param {string} marbleId - Marble ID
  # @returns {Promise<boolean>}
  ###
  @isMarbleRevealed: (marbleId) ->
    self = @

    @init()
    .then () ->
      self._contract.isMarbleRevealed(marbleId)

  ###*
  # Calculate cards from verified random values
  # Uses same algorithm as original unlockBoosterPack but with FHE randoms
  #
  # @param {number} cardSetId - Card set ID
  # @param {number[]} rarity - 5 rarity random values (0-255)
  # @param {number[]} index - 5 index random values (0-255)
  # @param {number[]} prismatic - 5 prismatic random values (0-255)
  # @returns {number[]} Array of 5 card IDs
  ###
  @calculateCardsFromRandoms: (cardSetId, rarity, index, prismatic) ->
    new_cards = []

    # Rarity thresholds (0-255 scale, matching contract/client)
    # 0-186 = Common (73%)
    # 187-225 = Rare (15%)
    # 226-250 = Epic (10%)
    # 251-255 = Legendary (2%)
    COMMON_THRESHOLD = 186
    RARE_THRESHOLD = 225
    EPIC_THRESHOLD = 250

    # Prismatic chance thresholds (per 256)
    # ~4% common, ~6% rare, ~7% epic, ~8% legendary
    PRISMATIC_COMMON = 10    # 10/256 ≈ 4%
    PRISMATIC_RARE = 15      # 15/256 ≈ 6%
    PRISMATIC_EPIC = 18      # 18/256 ≈ 7%
    PRISMATIC_LEGENDARY = 20 # 20/256 ≈ 8%

    for i in [0...5]
      rarityRand = rarity[i]
      indexRand = index[i]
      prismaticRand = prismatic[i]

      # Determine rarity
      if rarityRand <= COMMON_THRESHOLD
        rarityType = SDK.Rarity.Common
        prismaticThreshold = PRISMATIC_COMMON
      else if rarityRand <= RARE_THRESHOLD
        rarityType = SDK.Rarity.Rare
        prismaticThreshold = PRISMATIC_RARE
      else if rarityRand <= EPIC_THRESHOLD
        rarityType = SDK.Rarity.Epic
        prismaticThreshold = PRISMATIC_EPIC
      else
        rarityType = SDK.Rarity.Legendary
        prismaticThreshold = PRISMATIC_LEGENDARY

      # Get card pool for this rarity
      cardPool = SDK.GameSession.getCardCaches()
        .getCardSet(cardSetId)
        .getRarity(rarityType)
        .getIsCollectible(true)
        .getIsUnlockable(false)
        .getIsPrismatic(false)
        .getIsLegacy(false)
        .getCardIds()

      if cardPool.length == 0
        # Fallback to no legacy filter
        cardPool = SDK.GameSession.getCardCaches()
          .getCardSet(cardSetId)
          .getRarity(rarityType)
          .getIsCollectible(true)
          .getIsUnlockable(false)
          .getIsPrismatic(false)
          .getCardIds()

      # Select card using index random
      selectedIndex = indexRand % cardPool.length
      cardId = SDK.Cards.getBaseCardId(cardPool[selectedIndex])

      # Check for prismatic
      if prismaticRand < prismaticThreshold
        cardId = SDK.Cards.getPrismaticCardId(cardId)

      # Duplicate check - if we already have this card, pick next
      while _.contains(new_cards, cardId) and cardPool.length > 1
        selectedIndex = (selectedIndex + 1) % cardPool.length
        cardId = SDK.Cards.getBaseCardId(cardPool[selectedIndex])
        if prismaticRand < prismaticThreshold
          cardId = SDK.Cards.getPrismaticCardId(cardId)

      new_cards.push(cardId)

    return new_cards

  ###*
  # Full flow: Verify from contract and calculate cards
  # @param {string} marbleId - Marble ID
  # @param {number} cardSetId - Card set ID
  # @returns {Promise<number[]>} Array of 5 card IDs
  ###
  @verifyAndCalculateCards: (marbleId, cardSetId) ->
    self = @

    @isMarbleRevealed(marbleId)
    .then (revealed) ->
      if not revealed
        throw new Error("Marble not revealed in contract: #{marbleId}")

      return self.getVerifiedRandoms(marbleId)
    .then (randoms) ->
      Logger.module("FHE_MARBLE_VERIFIER").log "Got verified randoms for #{marbleId}"
      Logger.module("FHE_MARBLE_VERIFIER").log "Rarity: #{randoms.rarity}"
      Logger.module("FHE_MARBLE_VERIFIER").log "Index: #{randoms.index}"
      Logger.module("FHE_MARBLE_VERIFIER").log "Prismatic: #{randoms.prismatic}"

      cards = self.calculateCardsFromRandoms(cardSetId, randoms.rarity, randoms.index, randoms.prismatic)

      Logger.module("FHE_MARBLE_VERIFIER").log "Calculated cards: #{cards}"
      return cards

# underscore required for _.contains
_ = require 'underscore'

module.exports = FHEMarbleVerifier
