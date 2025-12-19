fhe_session.js:806 FHE_SESSIO  | FHEVM SDK instance ready
fheGameMode.js:85 FHE_MODE    | FHE Session initialized {fromCache: true}
fheGameSession.js:128 FHE_GAME    | Connected to GameSession: 0x0Cc86698f008a6b86d1469Dcc8929E4FF7c28dBD
fheGameMode.js:98 FHE_MODE    | FHE mode active
deck_select.js:727 DECK_SELEC  | FHE: Creating game on blockchain...
fheGameMode.js:165 FHE_MODE    | Creating FHE SINGLE PLAYER game with uniqueGameId: 1766103821459
fheGameSession.js:183 FHE_GAME    | Creating single player game: 1766103821459
fheGameSession.js:184 FHE_GAME    | Deck size: 45
session_wallet.js:370 SESSION_WA  | Using wallet address from wallet.js: 0x78c1e25054e8a3f1bc7f9d16f4e5dac0ba415cf9
session_wallet.js:384 SESSION_WA  | WalletVault address: 0x053E51a173b863E6495Dd1AeDCB0F9766e03f4A0
session_wallet.js:385 SESSION_WA  | GameSession address: 0x0Cc86698f008a6b86d1469Dcc8929E4FF7c28dBD
session_wallet.js:386 SESSION_WA  | Calling initializeSessionWithPIN with BOTH contracts...
fhe_session.js:1109 FHE_SESSIO  | === initializeSessionWithPIN START ===
fhe_session.js:402 FHE_SESSIO  | === isSessionValid CHECK ===
fhe_session.js:403 FHE_SESSIO  |   initialized: true
fhe_session.js:404 FHE_SESSIO  |   keypair: EXISTS
fhe_session.js:405 FHE_SESSIO  |   signature: EXISTS (len=132)
fhe_session.js:406 FHE_SESSIO  |   sessionExpiry: 1766188795000 - now: 1766103821460 - expired: false
fhe_session.js:418 FHE_SESSIO  |   RESULT: TRUE
fhe_session.js:1120 FHE_SESSIO  | Using existing session from memory
session_wallet.js:406 SESSION_WA  | Retrieving encrypted key from WalletVault...
session_wallet.js:423 SESSION_WA  | Got encrypted handle (raw): 59064444638846451626819433751581472007313725645701383917300168066379006019584
session_wallet.js:435 SESSION_WA  | Got encrypted handle (hex): 0x82954a7d69d87b4828f7a9c27fa1983baa9c82fecf000000000000aa36a70800
fhe_session.js:402 FHE_SESSIO  | === isSessionValid CHECK ===
fhe_session.js:403 FHE_SESSIO  |   initialized: true
fhe_session.js:404 FHE_SESSIO  |   keypair: EXISTS
fhe_session.js:405 FHE_SESSIO  |   signature: EXISTS (len=132)
fhe_session.js:406 FHE_SESSIO  |   sessionExpiry: 1766188795000 - now: 1766103822189 - expired: false
fhe_session.js:418 FHE_SESSIO  |   RESULT: TRUE
fhe_session.js:841 FHE_SESSIO  | Requesting decrypt... {handles: 1}
fhe_session.js:898 FHE_SESSIO  | Calling SDK userDecrypt... {handles: 1, targetContract: '0x053E51a173b863E6495Dd1AeDCB0F9766e03f4A0', sessionContracts: Array(2), userAddress: '0x78c1e25054E8a3F1BC7f9d16f4E5dAC0BA415CF9', startTimestamp: '1766102395', …}
fhe_session.js:922 FHE_SESSIO  | === SDK userDecrypt RESPONSE ===
fhe_session.js:923 FHE_SESSIO  | Result type: object
fhe_session.js:924 FHE_SESSIO  | Result keys: ['0x82954a7d69d87b4828f7a9c27fa1983baa9c82fecf000000000000aa36a70800']
fhe_session.js:933 FHE_SESSIO  |   Handle[0]: 0x82954a7d69d87b4828... = 22182991225526166169563761152920328413580585565666259265341380622025723114368n
fhe_session.js:940 FHE_SESSIO  | Decrypt successful {count: 1, values: Array(1)}
session_wallet.js:449 SESSION_WA  | Key decrypted successfully (in memory only)
fheGameSession.js:197 FHE_GAME    | TX sent: 0x5c15e1d2d675014f2913d2c1cd621db5b44ab01e10f3ff1fb7101895b983e234
fheGameSession.js:205 FHE_GAME    | Game created successfully
fheGameSession.js:206 FHE_GAME    | 40 FHE.rand indices generated in contract
fheGameSession.js:128 FHE_GAME    | Connected to GameSession: 0x0Cc86698f008a6b86d1469Dcc8929E4FF7c28dBD
fheCardHandler.js:44 FHE_CARD    | FHE Card Handler enabled for game: 1766103821459
fheGameMode.js:177 FHE_MODE    | FHE single player game created: 1766103821459
deck_select.js:733 DECK_SELEC  | FHE: Game created with ID: 1766103821459
games_manager.js:543 UI          | GamesManager::findNewGameWithFHE -> for faction id 1 with FHE data {fhe_enabled: true, fhe_game_id: 1766103821459, fhe_contract_address: '0x0Cc86698f008a6b86d1469Dcc8929E4FF7c28dBD', fhe_player_wallet: '0x78c1e25054e8a3f1bc7f9d16f4e5dac0ba415cf9'}
application.js:1567 APPLICATIO  | App._matchmakingStart
games_manager.js:589 UI          | GamesManager._onFindingGame
application.js:1626 APPLICATIO  | App._findingGame {name: '0xflydev', gameType: 'ranked', namespace: 'development', deck: Array(46), factionId: 1, …}
chat_manager.js:345 UI          | ChatManager::setStatus -> queue
games_manager.js:597 UI          | GamesManager._startWatchingForGame
vendor.js:23422 [Violation] 'load' handler took 190ms
games_manager.js:212 UI          | GamesManager::requestEnterMatchmaking -> entered queue
games_manager.js:218 UI          | GamesManager::requestEnterMatchmaking -> expected wait 14.9s
application.js:1670 APPLICATIO  | App._findingGame -> showFindingGamePromise DONE
games_manager.js:616 UI          | GamesManager._onGameFound
application.js:1682 APPLICATIO  | App._findingGame -> onFoundGame() {created_at: 1766103857062, deck_cards: Array(46), faction_id: 1, game_id: '-OgnzYTa-8UjrXppHgfm', game_type: 'ranked', …}
application.js:1692 APPLICATIO  | App._findingGame -> onFoundGame() App._foundGamePromise RESOLVED
application.js:1706 APPLICATIO  | App._findingGame -> show found game {created_at: 1766103857062, deck_cards: Array(46), faction_id: 1, game_id: '-OgnzYTa-8UjrXppHgfm', game_type: 'ranked', …}
MatchmakingLayer.js:123 ENGINE      | MatchmakingLayer.showVsForGame 1 2 false 0.35
vendor.js:23422 [Violation] 'load' handler took 159ms
application.js:2282 APPLICATIO  | App._joinGame {created_at: 1766103857062, deck_cards: Array(46), faction_id: 1, game_id: '-OgnzYTa-8UjrXppHgfm', game_type: 'ranked', …}
networkManager.js:65 SDK         | NetworkManager:connect -> gameId: -OgnzYTa-8UjrXppHgfm
networkManager.js:94 SDK         | NetworkManager: connecting to game server ws://localhost:8001
connect @ networkManager.js:94
(anonymous) @ application.js:2298
tryCatcher @ bluebird.js:4594
Promise2._settlePromiseFromHandler @ bluebird.js:2698
Promise2._settlePromiseAt @ bluebird.js:2772
Promise2._settlePromises @ bluebird.js:2888
Async._drainQueue @ bluebird.js:175
Async._drainQueues @ bluebird.js:185
Async.drainQueues @ bluebird.js:67
setTimeout
schedule @ bluebird.js:131
Async._queueTick @ bluebird.js:193
AsyncInvoke @ bluebird.js:117
Async.invoke @ bluebird.js:147
Promise2._then @ bluebird.js:2427
Promise2.then @ bluebird.js:2304
(anonymous) @ package_manager.js:610
(anonymous) @ vendor.js:23092
(anonymous) @ vendor.js:23547
(anonymous) @ vendor.js:23485
(anonymous) @ package_manager.js:1605
loadCallback @ vendor.js:23427
networkManager.js:122 IO          | NetworkManager::IO:connected -> SUCCESS
networkManager.js:123 IO          | NetworkManager::IO:connected -> Successfully connected to server
networkManager.js:256 SDK         | NetworkManager:joinGameRoom
networkManager.js:153 IO          | NetworkManager::IO:join_game_response -> [object Object]
application.js:2485 APPLICATIO  | App._startGameWithData {gameSetupData: {…}, status: 'new', cardsByIndex: {…}, modifiersByIndex: {…}, createdAt: 1766103857062, …}
application.js:2509 APPLICATIO  | App:_startGame new
application.js:2512 === _startGame DEV MODE STATUS ===
application.js:2513 CONFIG.DEV_MODE_ENABLED: false
application.js:2514 gameSession.getIsDeveloperMode(): false
application.js:2515 gameSession.getAreDecksRandomized(): true
application.js:2516 gameSession.isChallenge(): false
application.js:2517 ==================================
chat_manager.js:345 UI          | ChatManager::setStatus -> game
application.js:3935 APPLICATIO  | App._subscribeToGameNetworkEvents
games_manager.js:801 UI          | GamesManager::cancelMatchmaking -> wasLookingForGame? false
game.js:597 UI          | GameLayout.showNextStepInGameSetup
game.js:637 FHE_UI      | [FHE] showNextStepInGameSetup: FHE mode detected
fheGameSession.js:75 FHE_GAME    | Socket set for server notifications
game.js:646 FHE_UI      | [FHE] Socket set for server notifications
game.js:657 FHE_UI      | [FHE] >>> Sending fhe_game_created with data: {"gameId":"-OgnzYTa-8UjrXppHgfm","blockchainGameId":1766103821459,"network":"sepolia"}
game.js:658 FHE_UI      | [FHE] >>> Socket connected: true id: lUnbQt6_F-rF1VRPAAAH
fheGameSession.js:101 FHE_GAME    | Server notified: fhe_game_created
game.js:660 FHE_UI      | [FHE] Sent fhe_game_created event to server (blockchainGameId: 1766103821459 )
game.js:756 UI          | GameLayout.showChooseHand
game.js:686 FHE_UI      | [FHE] Starting revealInitialHand for gameId: 1766103821459
fheGameSession.js:241 FHE_GAME    | === REVEAL INITIAL HAND ===
fheGameSession.js:245 FHE_GAME    | Waiting for ZAMA ACL indexing (10 seconds)...
application.js:3907 APPLICATIO  | App._subscribeToGameLocalEvents
FX.js:422 ENGINE      | FX.reset
GameLayer.js:929 ENGINE      | GameLayer.onSetupTransitionIn
BattleMap.js:319 ENGINE      | BattleMap::setup
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 29 to 40.
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 40 to 54.
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 29 to 40.
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 40 to 54.
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
bluebird.js:66 [Violation] 'setTimeout' handler took 120ms
vendor.js:23422 [Violation] 'load' handler took 260ms
GameLayer.js:257 ENGINE      | GameLayer.start
GameLayer.js:941 ENGINE      | GameLayer.onTransitionIn
GameLayer.js:257 ENGINE      | GameLayer.start
GameLayer.js:1224 ENGINE      | GameLayer.showChooseHand
fheGameSession.js:253 FHE_GAME    | ACL wait complete, proceeding...
fheGameSession.js:258 FHE_GAME    | Allowed reveals: 5
fheGameSession.js:268 FHE_GAME    | Got 5 handles
fheGameSession.js:668 FHE_GAME    | [DEBUG] Handle[0] type=string raw=0x3eed16c3e23a912a1eb53fcd188a5c617c4fff2c7fff0000000000aa36a70200 converted=0x3eed16c3e23a912a1eb53fcd188a5c617c4fff2c7fff0000000000aa36a70200
fheGameSession.js:668 FHE_GAME    | [DEBUG] Handle[1] type=string raw=0xe98fe4b37b28b9afcad91de4255c81517d134f23a1ff0000000000aa36a70200 converted=0xe98fe4b37b28b9afcad91de4255c81517d134f23a1ff0000000000aa36a70200
fheGameSession.js:668 FHE_GAME    | [DEBUG] Handle[2] type=string raw=0x73077e8d23c4cfebed410bb44e117b380e10034e46ff0000000000aa36a70200 converted=0x73077e8d23c4cfebed410bb44e117b380e10034e46ff0000000000aa36a70200
fheGameSession.js:668 FHE_GAME    | [DEBUG] Handle[3] type=string raw=0x3ff278d9a3d74f899b763b358fd4952cf362b3365cff0000000000aa36a70200 converted=0x3ff278d9a3d74f899b763b358fd4952cf362b3365cff0000000000aa36a70200
fheGameSession.js:668 FHE_GAME    | [DEBUG] Handle[4] type=string raw=0xd8c06e87cea88630ddb7892351593f9f6cc41c4ed4ff0000000000aa36a70200 converted=0xd8c06e87cea88630ddb7892351593f9f6cc41c4ed4ff0000000000aa36a70200
fheGameSession.js:672 FHE_GAME    | [DEBUG] All handleStrings: (5) ['0x3eed16c3e23a912a1eb53fcd188a5c617c4fff2c7fff0000000000aa36a70200', '0xe98fe4b37b28b9afcad91de4255c81517d134f23a1ff0000000000aa36a70200', '0x73077e8d23c4cfebed410bb44e117b380e10034e46ff0000000000aa36a70200', '0x3ff278d9a3d74f899b763b358fd4952cf362b3365cff0000000000aa36a70200', '0xd8c06e87cea88630ddb7892351593f9f6cc41c4ed4ff0000000000aa36a70200']
fheGameSession.js:696 FHE_GAME    | [KMS] Calling publicDecrypt with handles: (5) ['0x3eed16c3e23a912a1eb53fcd188a5c617c4fff2c7fff0000000000aa36a70200', '0xe98fe4b37b28b9afcad91de4255c81517d134f23a1ff0000000000aa36a70200', '0x73077e8d23c4cfebed410bb44e117b380e10034e46ff0000000000aa36a70200', '0x3ff278d9a3d74f899b763b358fd4952cf362b3365cff0000000000aa36a70200', '0xd8c06e87cea88630ddb7892351593f9f6cc41c4ed4ff0000000000aa36a70200']
fheGameSession.js:700 FHE_GAME    | [KMS] publicDecrypt response: {clearValues: {…}, abiEncodedClearValues: '0x000000000000000000000000000000000000000000000000…00000000000000000000000000000000000000000000000ac', decryptionProof: '0x07d5efaf970afe843e32adf5ac636f14584a9d2c68f554c5…6ab17927fe9770a95f35ef1edf71a471410177861c7201d1c'}
fheGameSession.js:706 FHE_GAME    | [KMS] Handle 0x3eed16c3e23a912a1eb53fcd188a5c617c4fff2c7fff0000000000aa36a70200 -> clear value: 42n
fheGameSession.js:706 FHE_GAME    | [KMS] Handle 0xe98fe4b37b28b9afcad91de4255c81517d134f23a1ff0000000000aa36a70200 -> clear value: 91n
fheGameSession.js:706 FHE_GAME    | [KMS] Handle 0x73077e8d23c4cfebed410bb44e117b380e10034e46ff0000000000aa36a70200 -> clear value: 200n
fheGameSession.js:706 FHE_GAME    | [KMS] Handle 0x3ff278d9a3d74f899b763b358fd4952cf362b3365cff0000000000aa36a70200 -> clear value: 100n
fheGameSession.js:706 FHE_GAME    | [KMS] Handle 0xd8c06e87cea88630ddb7892351593f9f6cc41c4ed4ff0000000000aa36a70200 -> clear value: 172n
fheGameSession.js:715 FHE_GAME    | [KMS] Decrypt success, clearIndices: (5) [42, 91, 200, 100, 172]
fheGameSession.js:274 FHE_GAME    | Decrypted indices: (5) [42, 91, 200, 100, 172]
fheGameSession.js:589 FHE_GAME    | revealDrawBatch TX sent: 0x87666be5d8828ee36966b1de7f6f58b67902ff82ddf147fab5999ef8c6638dfa


fheGameSession.js:596 FHE_GAME    | Reveal confirmed
fheGameSession.js:290 FHE_GAME    | === INITIAL HAND READY ===
fheGameSession.js:291 FHE_GAME    | Hand: (5) [10207, 20066, 19027, 20068, 20047]
fheGameSession.js:321 FHE_GAME    | Server notified: fhe_initial_hand_revealed
fheGameSession.js:298 FHE_GAME    | Server response: {"success":true,"verified":true,"revealedCount":5,"cardIndices":[10624,5595,8687,6875,6058]}
fheGameSession.js:300 FHE_GAME    | Server cardIndices: (5) [10624, 5595, 8687, 6875, 6058]
game.js:693 FHE_UI      | [FHE] Hand revealed - cardIds: (5) [10207, 20066, 19027, 20068, 20047]
game.js:694 FHE_UI      | [FHE] Hand revealed - serverCardIndices: (5) [10624, 5595, 8687, 6875, 6058]
game.js:698 FHE_UI      | [FHE] Remaining deck size: 40
game.js:1219 FHE_UI      | [FHE] === _populateFHEHand START ===
game.js:1220 FHE_UI      | [FHE] FHE Card IDs: (5) [10207, 20066, 19027, 20068, 20047]
game.js:1221 FHE_UI      | [FHE] Server cardIndices: (5) [10624, 5595, 8687, 6875, 6058]
game.js:1222 FHE_UI      | [FHE] Card count: 5
game.js:1236 FHE_UI      | [FHE] Current deck hand (should be empty): (6) [null, null, null, null, null, null]
game.js:1237 FHE_UI      | [FHE] fheEnabled on gameSession: true
game.js:1261 FHE_UI      | [FHE] Using SERVER cardIndex: 10624
game.js:1274 FHE_UI      | [FHE] Slot 0: Stormmetal Golem (ID: 10207, index: 10624)
game.js:1261 FHE_UI      | [FHE] Using SERVER cardIndex: 5595
game.js:1274 FHE_UI      | [FHE] Slot 1: True Strike (ID: 20066, index: 5595)
game.js:1261 FHE_UI      | [FHE] Using SERVER cardIndex: 8687
game.js:1274 FHE_UI      | [FHE] Slot 2: Primus Shieldmaster (ID: 19027, index: 8687)
game.js:1261 FHE_UI      | [FHE] Using SERVER cardIndex: 6875
game.js:1274 FHE_UI      | [FHE] Slot 3: Divine Bond (ID: 20068, index: 6875)
game.js:1261 FHE_UI      | [FHE] Using SERVER cardIndex: 6058
game.js:1274 FHE_UI      | [FHE] Slot 4: War Surge (ID: 20047, index: 6058)
game.js:1284 FHE_UI      | [FHE] Set FHE deck remaining from blockchain: 40
game.js:1286 FHE_UI      | [FHE] === POPULATE COMPLETE ===
game.js:1287 FHE_UI      | [FHE] Added 5 FHE cards to empty deck
game.js:1291 FHE_UI      | [FHE] Verified hand after populate:
game.js:1294 FHE_UI      | [FHE]   [0] Stormmetal Golem (ID: 10207)
game.js:1294 FHE_UI      | [FHE]   [1] True Strike (ID: 20066)
game.js:1294 FHE_UI      | [FHE]   [2] Primus Shieldmaster (ID: 19027)
game.js:1294 FHE_UI      | [FHE]   [3] Divine Bond (ID: 20068)
game.js:1294 FHE_UI      | [FHE]   [4] War Surge (ID: 20047)
game.js:706 FHE_UI      | [FHE] Attempting to hide decrypt state...
game.js:707 FHE_UI      | [FHE] gameLayer exists: true
game.js:708 FHE_UI      | [FHE] bottomDeckLayer exists: true
game.js:710 FHE_UI      | [FHE] Calling hideFHEDecryptState()
GameLayer.js:1224 ENGINE      | GameLayer.showChooseHand
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 0
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 0


networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 0
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 0
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 0
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 0
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2342 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GS._queueStep ->  11471
gameSession.js:1963 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GS._startNextStep -> 11471 w/ action DrawStartingHandAction
gameSession.js:1978 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GS._startStep ->  11471
gameSession.js:2041 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GS._executeActionForStep ->  DrawStartingHandAction 11548
gameSession.js:2397 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GS._endStep 11471
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action DrawStartingHandAction {type: 'DrawStartingHandAction', ownerId: '-OgigZPqLhwiT8ILtaB9', mulliganIndices: Array(0), mulliganedHandCardsData: Array(0), newHandCardsData: Array(0), …}
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
game.js:986 FHE_UI      | === showSubmitChosenHand FHE CHECK ===
game.js:987 FHE_UI      | [FHE] mulliganIndices: []
game.js:988 FHE_UI      | [FHE] fheEnabled: true
game.js:989 FHE_UI      | [FHE] isDeveloperMode: false
game.js:993 FHE_UI      | [FHE] FHE MODE detected
game.js:1001 FHE_UI      | [FHE] isSinglePlayerGame: false
game.js:1002 FHE_UI      | [FHE] fheGameSession.gameId: 1766103821459
game.js:1010 FHE_UI      | [FHE] MULTIPLAYER - Calling completeMulligan on contract...
game.js:1022 FHE_UI      | [FHE] mulliganSlots for contract: (5) [false, false, false, false, false]
fheGameSession.js:632 FHE_GAME    | completeMulligan called with slots: (5) [false, false, false, false, false]
fheGameSession.js:638 FHE_GAME    | Mulligan phase complete (no contract call needed - handled by reveal flow)
game.js:1027 FHE_UI      | [FHE] completeMulligan TX confirmed
game.js:1028 FHE_UI      | [FHE] New hand ready, decrypting...
game.js:1032 FHE_UI      | [FHE] Decrypted hand after mulligan: undefined
game.js:1060 UI          | GameLayout.showSubmitChosenHand -> [] submitted? true
GameLayer.js:1276 ENGINE      | GameLayer.showSubmitChosenHand
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2342 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GS._queueStep ->  11554
gameSession.js:1963 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GS._startNextStep -> 11554 w/ action DrawStartingHandAction
gameSession.js:1978 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GS._startStep ->  11554
gameSession.js:2041 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GS._executeActionForStep ->  DrawStartingHandAction 11568
game.js:1081 UI          | GameLayout.onDrawStartingHand []
game.js:1089 FHE_UI      | === onDrawStartingHand FHE CHECK ===
game.js:1090 FHE_UI      | [FHE] fheEnabled: true
game.js:1091 FHE_UI      | [FHE] isDeveloperMode: false
game.js:1094 FHE_UI      | [FHE] FHE MODE ACTIVE
game.js:1104 FHE_UI      | [FHE] isSinglePlayerGame: false
game.js:1105 FHE_UI      | [FHE] fheGameSession.gameId: 1766103821459
game.js:1106 FHE_UI      | [FHE] hasValidGameId: true
game.js:1111 FHE_UI      | [FHE] Cards already populated in showNextStepInGameSetup, skipping re-populate
gameSession.js:2397 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GameSession.p_resolveStep
gameSession.js:980 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GS.setStatus - from new to active
gameSession.js:2476 SDK         | [G:-OgnzYTa-8UjrXppHgfm] GS._endStep 11554
GameLayer.js:1292 ENGINE      | GameLayer.showDrawStartingHand
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(15), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action DrawStartingHandAction {type: 'DrawStartingHandAction', ownerId: '-Ofum3S3l_5MupHTGsy0', mulliganIndices: Array(0), mulliganedHandCardsData: Array(0), newHandCardsData: Array(0), …}
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
game.js:597 UI          | GameLayout.showNextStepInGameSetup
game.js:1309 UI          | GameLayout.showActiveGame
GameLayer.js:1345 ENGINE      | GameLayer.showActiveGame -> waiting for new
GameLayer.js:1357 ENGINE      | GameLayer.showActiveGame
BattleMap.js:1532 ENGINE      | BattleMap::activate
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 2
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 2
GameLayer.js:1382 ENGINE      | GameLayer set active game
ENGINE      | GameLayer.showStartTurn
IO          | NetworkManager::IO:network_game_event -> turn_time; step count 2
