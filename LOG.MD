bluebird.js:66 [Violation] 'setTimeout' handler took 6497ms
fheGameSession.js:1009 FHE_GAME    | [ENCRYPT] Encryption complete, handles: 40
fheGameSession.js:260 FHE_GAME    | Deck encrypted, handles: 40
fheGameSession.js:271 FHE_GAME    | Sending createSinglePlayerGame TX via wallet API...
fheGameSession.js:285 FHE_GAME    | createSinglePlayerGame TX sent: 0x2444645cdb3815bc72f8b621a8e27f682d8830f50c4f6b70e5e5598f3f45e679
fheGameSession.js:439 FHE_GAME    | Waiting for TX receipt, attempt: 1
fheGameSession.js:439 FHE_GAME    | Waiting for TX receipt, attempt: 2
fheGameSession.js:439 FHE_GAME    | Waiting for TX receipt, attempt: 3
fheGameSession.js:439 FHE_GAME    | Waiting for TX receipt, attempt: 4
fheGameSession.js:447 FHE_GAME    | TX receipt received
fheGameSession.js:291 FHE_GAME    | TX confirmed, parsing events...
fheGameSession.js:292 FHE_GAME    | Receipt status: 0x1
fheGameSession.js:293 FHE_GAME    | Receipt logs count: 175
fheGameSession.js:317 FHE_GAME    | GameCreated event found, gameId: 4
fheGameSession.js:334 FHE_GAME    | Single player game created successfully: 4
fheGameSession.js:104 FHE_GAME    | Creating contract with signer: true
fheGameSession.js:112 FHE_GAME    | Connected to GameSession at: 0xeDAbEB1A3540e7A6b319d2BA38B7d6598E33675a
fheGameSession.js:113 FHE_GAME    | Contract signer: attached
fheCardHandler.js:44 FHE_CARD    | FHE Card Handler enabled for game: 4
fheGameMode.js:164 FHE_MODE    | FHE single player game created: 4
application.js:1960 APPLICATIO  | FHE: Game created with ID: 4
application.js:1965 APPLICATIO  | FHE: Sending to server - isDeveloperMode: false
application.js:2027 APPLICATIO  | FHE: Game session configured with FHE data
MatchmakingLayer.js:123 ENGINE      | MatchmakingLayer.showVsForGame 1 2 false 0.35
application.js:2258 APPLICATIO  | App._joinGame {game_type: 'single_player', game_id: '-OgDgnWEme61-Avdq-bi', is_player_1: false, opponent_username: 'Reva Eventide', opponent_id: 'ai', …}
networkManager.js:65 SDK         | NetworkManager:connect -> gameId: -OgDgnWEme61-Avdq-bi
networkManager.js:92 SDK         | NetworkManager: connecting to game server ws://localhost:8000
connect @ networkManager.js:92
(anonymous) @ application.js:2274
tryCatcher @ bluebird.js:4594
Promise._settlePromiseFromHandler @ bluebird.js:2698
Promise._settlePromiseAt @ bluebird.js:2772
Promise._settlePromises @ bluebird.js:2888
Async._drainQueue @ bluebird.js:175
Async._drainQueues @ bluebird.js:185
Async.drainQueues @ bluebird.js:67
setTimeout
schedule @ bluebird.js:131
Async._queueTick @ bluebird.js:193
AsyncInvoke @ bluebird.js:117
Async.invoke @ bluebird.js:147
Promise._then @ bluebird.js:2427
Promise.then @ bluebird.js:2304
(anonymous) @ package_manager.js:610
(anonymous) @ vendor.js:23092
(anonymous) @ vendor.js:23547
(anonymous) @ vendor.js:23485
(anonymous) @ package_manager.js:1605
loadCallback @ vendor.js:23427
networkManager.js:120 IO          | NetworkManager::IO:connected -> SUCCESS
networkManager.js:121 IO          | NetworkManager::IO:connected -> Successfully connected to server
networkManager.js:254 SDK         | NetworkManager:joinGameRoom
networkManager.js:151 IO          | NetworkManager::IO:join_game_response -> [object Object]
application.js:2461 APPLICATIO  | App._startGameWithData {gameSetupData: {…}, status: 'new', cardsByIndex: {…}, modifiersByIndex: {…}, createdAt: 1765478185033, …}
gameSession.js:516 SDK         | [G:N/A] GS.terminate
application.js:2485 APPLICATIO  | App:_startGame new
application.js:2488 === _startGame DEV MODE STATUS ===
application.js:2489 CONFIG.DEV_MODE_ENABLED: false
application.js:2490 gameSession.getIsDeveloperMode(): false
application.js:2491 gameSession.getAreDecksRandomized(): true
application.js:2492 gameSession.isChallenge(): false
application.js:2493 ==================================
application.js:3909 APPLICATIO  | App._subscribeToGameNetworkEvents
games_manager.js:745 UI          | GamesManager::cancelMatchmaking -> wasLookingForGame? false
game.js:541 UI          | GameLayout.showNextStepInGameSetup
game.js:581 FHE_UI      | [FHE] showNextStepInGameSetup: FHE mode detected
game.js:659 UI          | GameLayout.showChooseHand
game.js:602 FHE_UI      | [FHE] Starting background decrypt for gameId: 4
fheGameSession.js:481 FHE_GAME    | === FHE DECRYPT HAND START ===
fheGameSession.js:482 FHE_GAME    | [FHE] Game ID: 4
fheGameSession.js:483 FHE_GAME    | [FHE] Player Index: 0
fheGameSession.js:484 FHE_GAME    | [FHE] Contract Address: 0xeDAbEB1A3540e7A6b319d2BA38B7d6598E33675a
application.js:3881 APPLICATIO  | App._subscribeToGameLocalEvents
FX.js:422 ENGINE      | FX.reset
GameLayer.js:929 ENGINE      | GameLayer.onSetupTransitionIn
BattleMap.js:319 ENGINE      | BattleMap::setup
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 29 to 40.
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 40 to 54.
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
bluebird.js:66 [Violation] 'setTimeout' handler took 87ms
GameLayer.js:257 ENGINE      | GameLayer.start
GameLayer.js:941 ENGINE      | GameLayer.onTransitionIn
GameLayer.js:257 ENGINE      | GameLayer.start
GameLayer.js:1224 ENGINE      | GameLayer.showChooseHand
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
fheGameSession.js:490 FHE_GAME    | [FHE] Raw handles from contract: 6
fheGameSession.js:492 FHE_GAME    | [FHE]   Handle[0]: 39348170984938203801...
fheGameSession.js:492 FHE_GAME    | [FHE]   Handle[1]: 10754732212896243599...
fheGameSession.js:492 FHE_GAME    | [FHE]   Handle[2]: 14006602821293544056...
fheGameSession.js:492 FHE_GAME    | [FHE]   Handle[3]: 25166725897174875859...
fheGameSession.js:492 FHE_GAME    | [FHE]   Handle[4]: 82964194411649120849...
fheGameSession.js:492 FHE_GAME    | [FHE]   Handle[5]: 0...
fheGameSession.js:500 FHE_GAME    | [FHE] Player hand size: 5
fheGameSession.js:501 FHE_GAME    | [FHE] Player info: {"wallet":"0x78c1e25054E8a3F1BC7f9d16f4E5dAC0BA415CF9","handSize":5,"deckRemaining":35,"currentMana":2,"maxMana":2,"generalHp":25}
fheGameSession.js:542 FHE_GAME    | [FHE] Handle[0] converted: 0x08b3070dd5ec0d4d8b...
fheGameSession.js:542 FHE_GAME    | [FHE] Handle[1] converted: 0xedc5a08f4e9d60ca70...
fheGameSession.js:542 FHE_GAME    | [FHE] Handle[2] converted: 0x1ef774cd598b0d8b0b...
fheGameSession.js:542 FHE_GAME    | [FHE] Handle[3] converted: 0x059062de7d8f250259...
fheGameSession.js:542 FHE_GAME    | [FHE] Handle[4] converted: 0xb76c11e9fc336361c9...
fheGameSession.js:545 FHE_GAME    | [FHE] Sending 5 handles for decrypt
fheGameSession.js:546 FHE_GAME    | [FHE] Session valid: true
fhe_session.js:523 FHE_SESSIO  | Requesting decrypt... {handles: 5}
fhe_session.js:573 FHE_SESSIO  | Calling SDK userDecrypt... {handles: 5, contractAddress: '0xeDAbEB1A3540e7A6b319d2BA38B7d6598E33675a', userAddress: '0x78c1e25054E8a3F1BC7f9d16f4E5dAC0BA415CF9', startTimestamp: '1765478160', durationDays: '1', …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
fhe_session.js:595 FHE_SESSIO  | === SDK userDecrypt RESPONSE ===
fhe_session.js:596 FHE_SESSIO  | Result type: object
fhe_session.js:597 FHE_SESSIO  | Result keys: (5) ['0x08b3070dd5ec0d4d8bd566f8ed6d75e96fb84bfd7b000000000000aa36a70300', '0xedc5a08f4e9d60ca70597119c9d4589c122984ee7e010000000000aa36a70300', '0x1ef774cd598b0d8b0b66e692ad30c2e06bf9760773020000000000aa36a70300', '0x059062de7d8f250259d25ac43e1065dd4e0fdefe1f030000000000aa36a70300', '0xb76c11e9fc336361c9a396d2e15d120979e8e69213040000000000aa36a70300']
fhe_session.js:606 FHE_SESSIO  |   Handle[0]: 0x08b3070dd5ec0d4d8b... = 10206n
fhe_session.js:606 FHE_SESSIO  |   Handle[1]: 0xedc5a08f4e9d60ca70... = 19031n
fhe_session.js:606 FHE_SESSIO  |   Handle[2]: 0x1ef774cd598b0d8b0b... = 30004n
fhe_session.js:606 FHE_SESSIO  |   Handle[3]: 0x059062de7d8f250259... = 19027n
fhe_session.js:606 FHE_SESSIO  |   Handle[4]: 0xb76c11e9fc336361c9... = 10012n
fhe_session.js:613 FHE_SESSIO  | Decrypt successful {count: 5, values: Array(5)}
fheGameSession.js:555 FHE_GAME    | [FHE] === DECRYPTED HAND ===
fheGameSession.js:557 FHE_GAME    | [FHE]   Card[0]: ID=10206
fheGameSession.js:557 FHE_GAME    | [FHE]   Card[1]: ID=19031
fheGameSession.js:557 FHE_GAME    | [FHE]   Card[2]: ID=30004
fheGameSession.js:557 FHE_GAME    | [FHE]   Card[3]: ID=19027
fheGameSession.js:557 FHE_GAME    | [FHE]   Card[4]: ID=10012
fheGameSession.js:559 FHE_GAME    | [FHE] =========================
game.js:606 FHE_UI      | [FHE] Hand decrypted: (5) [10206, 19031, 30004, 19027, 10012]
game.js:611 FHE_UI      | [FHE] Player info from blockchain: {wallet: '0x78c1e25054E8a3F1BC7f9d16f4E5dAC0BA415CF9', handSize: 5, deckRemaining: 35, currentMana: 2, maxMana: 2, …}
game.js:973 FHE_UI      | [FHE] === _populateFHEHand START ===
game.js:974 FHE_UI      | [FHE] FHE Card IDs: (5) [10206, 19031, 30004, 19027, 10012]
game.js:975 FHE_UI      | [FHE] Card count: 5
game.js:989 FHE_UI      | [FHE] Current deck hand (should be empty): (6) [null, null, null, null, null, null]
game.js:990 FHE_UI      | [FHE] fheEnabled on gameSession: true
game.js:1019 FHE_UI      | [FHE] Slot 0: Drybone Golem (ID: 10206, index: 2231)
game.js:1019 FHE_UI      | [FHE] Slot 1: Thorn Needler (ID: 19031, index: 2262)
game.js:1019 FHE_UI      | [FHE] Slot 2: Sunstone Bracers (ID: 30004, index: 2351)
game.js:1019 FHE_UI      | [FHE] Slot 3: Primus Shieldmaster (ID: 19027, index: 2436)
game.js:1019 FHE_UI      | [FHE] Slot 4: Saberspine Tiger (ID: 10012, index: 2522)
game.js:1029 FHE_UI      | [FHE] Set FHE deck remaining from blockchain: 35
game.js:1031 FHE_UI      | [FHE] === POPULATE COMPLETE ===
game.js:1032 FHE_UI      | [FHE] Added 5 FHE cards to empty deck
game.js:1036 FHE_UI      | [FHE] Verified hand after populate:
game.js:1039 FHE_UI      | [FHE]   [0] Drybone Golem (ID: 10206)
game.js:1039 FHE_UI      | [FHE]   [1] Thorn Needler (ID: 19031)
game.js:1039 FHE_UI      | [FHE]   [2] Sunstone Bracers (ID: 30004)
game.js:1039 FHE_UI      | [FHE]   [3] Primus Shieldmaster (ID: 19027)
game.js:1039 FHE_UI      | [FHE]   [4] Saberspine Tiger (ID: 10012)
GameLayer.js:1224 ENGINE      | GameLayer.showChooseHand
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1





--------5 KART VAR REPLACE YAPMADIM VE CONFIRM BASACAM ŞİMDİ ------------


networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
game.js:759 FHE_UI      | === showSubmitChosenHand FHE CHECK ===
game.js:760 FHE_UI      | [FHE] mulliganIndices: []
game.js:761 FHE_UI      | [FHE] fheEnabled: true
game.js:762 FHE_UI      | [FHE] isDeveloperMode: false
game.js:766 FHE_UI      | [FHE] FHE MODE detected
game.js:774 FHE_UI      | [FHE] isSinglePlayerGame: true
game.js:775 FHE_UI      | [FHE] fheGameSession.gameId: 4
game.js:779 FHE_UI      | [FHE] SINGLE PLAYER - Skipping contract completeMulligan (already in InProgress state)
game.js:833 UI          | GameLayout.showSubmitChosenHand -> [] submitted? true
GameLayer.js:1276 ENGINE      | GameLayer.showSubmitChosenHand
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2318 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._queueStep ->  2229
gameSession.js:1963 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextStep -> 2229 w/ action DrawStartingHandAction
gameSession.js:1978 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startStep ->  2229
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  DrawStartingHandAction 2243
game.js:854 UI          | GameLayout.onDrawStartingHand []
game.js:862 FHE_UI      | === onDrawStartingHand FHE CHECK ===
game.js:863 FHE_UI      | [FHE] fheEnabled: true
game.js:864 FHE_UI      | [FHE] isDeveloperMode: false
game.js:867 FHE_UI      | [FHE] FHE MODE ACTIVE
game.js:877 FHE_UI      | [FHE] isSinglePlayerGame: true
game.js:878 FHE_UI      | [FHE] fheGameSession.gameId: 4
game.js:879 FHE_UI      | [FHE] hasValidGameId: true
game.js:884 FHE_UI      | [FHE] Cards already populated in showNextStepInGameSetup, skipping re-populate
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:980 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS.setStatus - from new to active
gameSession.js:2476 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._endStep 2229
GameLayer.js:1292 ENGINE      | GameLayer.showDrawStartingHand
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(15), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action DrawStartingHandAction {type: 'DrawStartingHandAction', ownerId: '-Ofum3S3l_5MupHTGsy0', mulliganIndices: Array(0), mulliganedHandCardsData: Array(0), newHandCardsData: Array(0), …}
game.js:541 UI          | GameLayout.showNextStepInGameSetup
game.js:1054 UI          | GameLayout.showActiveGame
GameLayer.js:1345 ENGINE      | GameLayer.showActiveGame -> waiting for new
GameLayer.js:1357 ENGINE      | GameLayer.showActiveGame
BattleMap.js:1532 ENGINE      | BattleMap::activate
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 2
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 2
GameLayer.js:1382 ENGINE      | GameLayer set active game
GameLayer.js:1742 ENGINE      | GameLayer.showStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 2
GameLayer.js:1860 ENGINE      | GameLayer.afterShowStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 2
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 2
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 2
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2318 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._queueStep ->  2332
gameSession.js:1963 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextStep -> 2332 w/ action ReplaceCardFromHandAction
gameSession.js:1978 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startStep ->  2332
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  ReplaceCardFromHandAction 2370
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._endStep 2332
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action ReplaceCardFromHandAction {type: 'ReplaceCardFromHandAction', ownerId: 'ai', indexOfCardInHand: 0, index: 2370, replacedCardIndex: 1808, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2318 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._queueStep ->  2401
gameSession.js:1963 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextStep -> 2401 w/ action MoveAction
gameSession.js:1978 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startStep ->  2401
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  MoveAction 2442
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._endStep 2401
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action MoveAction {type: 'MoveAction', ownerId: 'ai', sourceIndex: 28, sourcePosition: {…}, targetIndex: 28, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2318 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._queueStep ->  2478
gameSession.js:1963 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextStep -> 2478 w/ action PlayCardFromHandAction
gameSession.js:1978 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startStep ->  2478
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  PlayCardFromHandAction 2526
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._endStep 2478
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(3), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action PlayCardFromHandAction {type: 'PlayCardFromHandAction', ownerId: 'ai', targetPosition: {…}, cardOwnedByGameSession: false, indexOfCardInHand: 0, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
vendor.js:24056 [Violation] 'requestAnimationFrame' handler took 65ms
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2318 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._queueStep ->  2580
gameSession.js:1963 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextStep -> 2580 w/ action EndTurnAction
gameSession.js:1978 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startStep ->  2580
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  EndTurnAction 2614
gameSession.js:1578 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS.p_endTurn -> turn count: 0
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  DrawCardAction 2696
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._endStep 2580
application.js:2318 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._queueStep ->  2730
gameSession.js:1963 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextStep -> 2730 w/ action StartTurnAction
gameSession.js:1978 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startStep ->  2730
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  StartTurnAction 2784
gameSession.js:1602 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextTurn
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._endStep 2730
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(2), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action EndTurnAction {type: 'EndTurnAction', ownerId: 'ai', index: 2614, timestamp: 1765478284260, subActionsOrderedByEventType: Array(1), …}
GameLayer.js:1700 ENGINE      | GameLayer.showEndTurn
GameLayer.js:1727 ENGINE      | GameLayer.afterShowEndTurn
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
application.js:2723 APPLICATIO  | App:onAfterShowEndTurn
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action StartTurnAction {type: 'StartTurnAction', ownerId: '-Ofum3S3l_5MupHTGsy0', isAutomatic: true, index: 2784, timestamp: 1765478284262, …}
GameLayer.js:1742 ENGINE      | GameLayer.showStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
GameLayer.js:1860 ENGINE      | GameLayer.afterShowStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 54 to 73.
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 73 to 98.
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 98 to 132.
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2318 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._queueStep ->  2811
gameSession.js:1963 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextStep -> 2811 w/ action MoveAction
gameSession.js:1978 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startStep ->  2811
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  MoveAction 2879
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._endStep 2811
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action MoveAction {type: 'MoveAction', ownerId: '-Ofum3S3l_5MupHTGsy0', sourceIndex: 184, sourcePosition: {…}, targetIndex: 184, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8



-------- END TURN BASACAM ŞİMDİ ------------


networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2318 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._queueStep ->  2976
gameSession.js:1963 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextStep -> 2976 w/ action EndTurnAction
gameSession.js:1978 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startStep ->  2976
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  EndTurnAction 2993
gameSession.js:1578 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS.p_endTurn -> turn count: 1
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  DrawCardAction 3042
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._endStep 2976
application.js:2318 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._queueStep ->  3138
gameSession.js:1963 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextStep -> 3138 w/ action StartTurnAction
gameSession.js:1978 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startStep ->  3138
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  StartTurnAction 3185
gameSession.js:1602 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextTurn
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._endStep 3138
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(2), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action EndTurnAction {type: 'EndTurnAction', ownerId: '-Ofum3S3l_5MupHTGsy0', index: 2993, timestamp: 1765478310436, subActionsOrderedByEventType: Array(1), …}
GameLayer.js:1700 ENGINE      | GameLayer.showEndTurn
GameLayer.js:1727 ENGINE      | GameLayer.afterShowEndTurn
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
application.js:2723 APPLICATIO  | App:onAfterShowEndTurn
game.js:400 FHE         | [DRAW] DrawCardAction detected for my player (count: 1)
fheGameSession.js:604 FHE_GAME    | [DRAW] Drawing card from deck index: 5
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action StartTurnAction {type: 'StartTurnAction', ownerId: 'ai', isAutomatic: true, index: 3185, timestamp: 1765478310437, …}
GameLayer.js:1742 ENGINE      | GameLayer.showStartTurn
fheGameSession.js:609 FHE_GAME    | [DRAW] Got encrypted handle from deck[5]
fheGameSession.js:629 FHE_GAME    | [DRAW] Handle converted: 0xe1b3dc8f38257a9a1e...
fhe_session.js:523 FHE_SESSIO  | Requesting decrypt... {handles: 1}
fhe_session.js:573 FHE_SESSIO  | Calling SDK userDecrypt... {handles: 1, contractAddress: '0xeDAbEB1A3540e7A6b319d2BA38B7d6598E33675a', userAddress: '0x78c1e25054E8a3F1BC7f9d16f4E5dAC0BA415CF9', startTimestamp: '1765478160', durationDays: '1', …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 10
GameLayer.js:1860 ENGINE      | GameLayer.afterShowStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 10
fhe_session.js:595 FHE_SESSIO  | === SDK userDecrypt RESPONSE ===
fhe_session.js:596 FHE_SESSIO  | Result type: object
fhe_session.js:597 FHE_SESSIO  | Result keys: ['0xe1b3dc8f38257a9a1eac9cd45cab65f3e68c2f4421050000000000aa36a70300']
fhe_session.js:606 FHE_SESSIO  |   Handle[0]: 0xe1b3dc8f38257a9a1e... = 20066n
fhe_session.js:613 FHE_SESSIO  | Decrypt successful {count: 1, values: Array(1)}
fheGameSession.js:640 FHE_GAME    | [DRAW] Card decrypted: 20066
fheGameSession.js:647 FHE_GAME    | [DRAW] localDeckIndex updated to: 6
fheGameSession.js:648 FHE_GAME    | [DRAW] Hand size now: 6
game.js:406 FHE         | [DRAW] FHE card drawn: 20066
game.js:906 FHE_UI      | [FHE] === _addFHECardToHand START ===
game.js:907 FHE_UI      | [FHE] Card ID: 20066
game.js:957 FHE_UI      | [FHE] Deck remaining: 34
game.js:960 FHE_UI      | [FHE] Added True Strike (ID: 20066, index: 2544) to slot 5
game.js:961 FHE_UI      | [FHE] === _addFHECardToHand COMPLETE ===
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 10
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 10
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 10
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 10
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2318 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._queueStep ->  3236
gameSession.js:1963 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startNextStep -> 3236 w/ action MoveAction
gameSession.js:1978 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._startStep ->  3236
gameSession.js:2041 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._executeActionForStep ->  MoveAction 3250
gameSession.js:2397 SDK         | [G:-OgDgnWEme61-Avdq-bi] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgDgnWEme61-Avdq-bi] GS._endStep 3236
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action MoveAction {type: 'MoveAction', ownerId: 'ai', sourceIndex: 28, sourcePosition: {…}, targetIndex: 28, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11


KART GELMEDİ 6.SLOTA TABİKİ