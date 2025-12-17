fhe_session.js:923 FHE_SESSIO  | === SDK userDecrypt RESPONSE ===
fhe_session.js:924 FHE_SESSIO  | Result type: object
fhe_session.js:925 FHE_SESSIO  | Result keys: ['0x82954a7d69d87b4828f7a9c27fa1983baa9c82fecf000000000000aa36a70800']
fhe_session.js:934 FHE_SESSIO  |   Handle[0]: 0x82954a7d69d87b4828... = 22182991225526166169563761152920328413580585565666259265341380622025723114368n
fhe_session.js:941 FHE_SESSIO  | Decrypt successful {count: 1, values: Array(1)}
session_wallet.js:436 SESSION_WA  | Key decrypted successfully (in memory only)
fheGameSession.js:197 FHE_GAME    | TX sent: 0x03ebee7f89599b24faaa18f8c2c8fcd03938ae5ef098aae76ee55110bddf4ee8
fheGameSession.js:205 FHE_GAME    | Game created successfully
fheGameSession.js:206 FHE_GAME    | 40 FHE.rand indices generated in contract
fheGameSession.js:128 FHE_GAME    | Connected to GameSession: 0x0Cc86698f008a6b86d1469Dcc8929E4FF7c28dBD
fheCardHandler.js:44 FHE_CARD    | FHE Card Handler enabled for game: 1765937155874
fheGameMode.js:177 FHE_MODE    | FHE single player game created: 1765937155874
application.js:1973 APPLICATIO  | FHE: Game created with ID: 1765937155874
application.js:1978 APPLICATIO  | FHE: Sending to server - isDeveloperMode: false
application.js:2040 APPLICATIO  | FHE: Game session configured with FHE data
MatchmakingLayer.js:123 ENGINE      | MatchmakingLayer.showVsForGame 1 4 true 0.35
application.js:2271 APPLICATIO  | App._joinGame {game_type: 'single_player', game_id: '-Oge2k6gsTxPvoUlRVCm', is_player_1: true, opponent_username: 'Lilithe Blightchaser', opponent_id: 'ai', …}
networkManager.js:65 SDK         | NetworkManager:connect -> gameId: -Oge2k6gsTxPvoUlRVCm
networkManager.js:92 SDK         | NetworkManager: connecting to game server ws://localhost:18000
connect @ networkManager.js:92
(anonymous) @ application.js:2287
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
networkManager.js:120 IO          | NetworkManager::IO:connected -> SUCCESS
networkManager.js:121 IO          | NetworkManager::IO:connected -> Successfully connected to server
networkManager.js:254 SDK         | NetworkManager:joinGameRoom
networkManager.js:151 IO          | NetworkManager::IO:join_game_response -> [object Object]
application.js:2474 APPLICATIO  | App._startGameWithData {gameSetupData: {…}, status: 'new', cardsByIndex: {…}, modifiersByIndex: {…}, createdAt: 1765937185237, …}
gameSession.js:516 SDK         | [G:N/A] GS.terminate
application.js:2498 APPLICATIO  | App:_startGame new
application.js:2501 === _startGame DEV MODE STATUS ===
application.js:2502 CONFIG.DEV_MODE_ENABLED: false
application.js:2503 gameSession.getIsDeveloperMode(): false
application.js:2504 gameSession.getAreDecksRandomized(): true
application.js:2505 gameSession.isChallenge(): false
application.js:2506 ==================================
application.js:3922 APPLICATIO  | App._subscribeToGameNetworkEvents
games_manager.js:745 UI          | GamesManager::cancelMatchmaking -> wasLookingForGame? false
game.js:560 UI          | GameLayout.showNextStepInGameSetup
game.js:600 FHE_UI      | [FHE] showNextStepInGameSetup: FHE mode detected
fheGameSession.js:75 FHE_GAME    | Socket set for server notifications
game.js:609 FHE_UI      | [FHE] Socket set for server notifications
game.js:620 FHE_UI      | [FHE] >>> Sending fhe_game_created with data: {"gameId":"-Oge2k6gsTxPvoUlRVCm","blockchainGameId":1765937155874,"network":"sepolia"}
game.js:621 FHE_UI      | [FHE] >>> Socket connected: true id: sS04FG62bYJfiRutAAAB
fheGameSession.js:101 FHE_GAME    | Server notified: fhe_game_created
game.js:623 FHE_UI      | [FHE] Sent fhe_game_created event to server (blockchainGameId: 1765937155874 )
game.js:704 UI          | GameLayout.showChooseHand
game.js:648 FHE_UI      | [FHE] Starting revealInitialHand for gameId: 1765937155874
fheGameSession.js:241 FHE_GAME    | === REVEAL INITIAL HAND ===
fheGameSession.js:245 FHE_GAME    | Waiting for ZAMA ACL indexing (10 seconds)...
application.js:3894 APPLICATIO  | App._subscribeToGameLocalEvents
FX.js:422 ENGINE      | FX.reset
GameLayer.js:929 ENGINE      | GameLayer.onSetupTransitionIn
BattleMap.js:319 ENGINE      | BattleMap::setup
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 29 to 40.
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 40 to 54.
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
bluebird.js:66 [Violation] 'setTimeout' handler took 82ms
GameLayer.js:257 ENGINE      | GameLayer.start
GameLayer.js:941 ENGINE      | GameLayer.onTransitionIn
GameLayer.js:257 ENGINE      | GameLayer.start
GameLayer.js:1224 ENGINE      | GameLayer.showChooseHand
fheGameSession.js:253 FHE_GAME    | ACL wait complete, proceeding...
fheGameSession.js:258 FHE_GAME    | Allowed reveals: 5
fheGameSession.js:268 FHE_GAME    | Got 5 handles
fheGameSession.js:624 FHE_GAME    | [DEBUG] Handle[0] type=string raw=0xda60613a562b1d5a31567a34d86108ec97fd50cfc6ff0000000000aa36a70200 converted=0xda60613a562b1d5a31567a34d86108ec97fd50cfc6ff0000000000aa36a70200
fheGameSession.js:624 FHE_GAME    | [DEBUG] Handle[1] type=string raw=0x2bee0196bbe526ff29e2447d14049b42fa1c80dafcff0000000000aa36a70200 converted=0x2bee0196bbe526ff29e2447d14049b42fa1c80dafcff0000000000aa36a70200
fheGameSession.js:624 FHE_GAME    | [DEBUG] Handle[2] type=string raw=0x1504987e9382df2e7af68f555682436e95929a0758ff0000000000aa36a70200 converted=0x1504987e9382df2e7af68f555682436e95929a0758ff0000000000aa36a70200
fheGameSession.js:624 FHE_GAME    | [DEBUG] Handle[3] type=string raw=0x168ca7d30adfa2f9477e73c967f2c6c4b2c4a433d6ff0000000000aa36a70200 converted=0x168ca7d30adfa2f9477e73c967f2c6c4b2c4a433d6ff0000000000aa36a70200
fheGameSession.js:624 FHE_GAME    | [DEBUG] Handle[4] type=string raw=0x01e5035871b50ab99d3230fafb5ab34f79aa4e6d48ff0000000000aa36a70200 converted=0x01e5035871b50ab99d3230fafb5ab34f79aa4e6d48ff0000000000aa36a70200
fheGameSession.js:628 FHE_GAME    | [DEBUG] All handleStrings: (5) ['0xda60613a562b1d5a31567a34d86108ec97fd50cfc6ff0000000000aa36a70200', '0x2bee0196bbe526ff29e2447d14049b42fa1c80dafcff0000000000aa36a70200', '0x1504987e9382df2e7af68f555682436e95929a0758ff0000000000aa36a70200', '0x168ca7d30adfa2f9477e73c967f2c6c4b2c4a433d6ff0000000000aa36a70200', '0x01e5035871b50ab99d3230fafb5ab34f79aa4e6d48ff0000000000aa36a70200']
fheGameSession.js:652 FHE_GAME    | [KMS] Calling publicDecrypt with handles: (5) ['0xda60613a562b1d5a31567a34d86108ec97fd50cfc6ff0000000000aa36a70200', '0x2bee0196bbe526ff29e2447d14049b42fa1c80dafcff0000000000aa36a70200', '0x1504987e9382df2e7af68f555682436e95929a0758ff0000000000aa36a70200', '0x168ca7d30adfa2f9477e73c967f2c6c4b2c4a433d6ff0000000000aa36a70200', '0x01e5035871b50ab99d3230fafb5ab34f79aa4e6d48ff0000000000aa36a70200']
(index):1 Access to fetch at 'https://relayer.testnet.zama.org/v1/public-decrypt' from origin 'http://localhost:3001' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
relayer-sdk-js.umd.cjs:20  POST https://relayer.testnet.zama.org/v1/public-decrypt net::ERR_FAILED 520
T @ relayer-sdk-js.umd.cjs:20
(anonymous) @ relayer-sdk-js.umd.cjs:20
(anonymous) @ relayer-sdk-js.umd.cjs:20
e_ @ relayer-sdk-js.umd.cjs:22
(anonymous) @ relayer-sdk-js.umd.cjs:22
await in (anonymous)
(anonymous) @ fheGameSession.js:653
tryCatcher @ bluebird.js:4594
Promise2._settlePromiseFromHandler @ bluebird.js:2698
Promise2._settlePromiseAt @ bluebird.js:2772
Promise2._settlePromises @ bluebird.js:2888
Async._drainQueue @ bluebird.js:175
Async._drainQueues @ bluebird.js:185
Async.drainQueues @ bluebird.js:67
setTimeout
schedule @ bluebird.js:131

fheGameSession.js:656 FHE_GAME    | [KMS] publicDecrypt response: {clearValues: {…}, abiEncodedClearValues: '0x000000000000000000000000000000000000000000000000…0000000000000000000000000000000000000000000000048', decryptionProof: '0x07d6b54ab53403657a7a4aa222e9610f0f6d02a421ca5802…c134bd88fafaeb8747fd64933f04b0ba0c1cc0cf9c5ca421b'}
fheGameSession.js:662 FHE_GAME    | [KMS] Handle 0xda60613a562b1d5a31567a34d86108ec97fd50cfc6ff0000000000aa36a70200 -> clear value: 155n
fheGameSession.js:662 FHE_GAME    | [KMS] Handle 0x2bee0196bbe526ff29e2447d14049b42fa1c80dafcff0000000000aa36a70200 -> clear value: 13n
fheGameSession.js:662 FHE_GAME    | [KMS] Handle 0x1504987e9382df2e7af68f555682436e95929a0758ff0000000000aa36a70200 -> clear value: 105n
fheGameSession.js:662 FHE_GAME    | [KMS] Handle 0x168ca7d30adfa2f9477e73c967f2c6c4b2c4a433d6ff0000000000aa36a70200 -> clear value: 116n
fheGameSession.js:662 FHE_GAME    | [KMS] Handle 0x01e5035871b50ab99d3230fafb5ab34f79aa4e6d48ff0000000000aa36a70200 -> clear value: 72n
fheGameSession.js:671 FHE_GAME    | [KMS] Decrypt success, clearIndices: (5) [155, 13, 105, 116, 72]
fheGameSession.js:274 FHE_GAME    | Decrypted indices: (5) [155, 13, 105, 116, 72]
fheGameSession.js:563 FHE_GAME    | revealDrawBatch TX sent: 0x1b2e328971d897c4cecc1db930db7040910b934dbea99a91e128b19324338bcd
fheGameSession.js:570 FHE_GAME    | Reveal confirmed
fheGameSession.js:290 FHE_GAME    | === INITIAL HAND READY ===
fheGameSession.js:291 FHE_GAME    | Hand: (5) [10206, 9, 11031, 10021, 30004]
fheGameSession.js:101 FHE_GAME    | Server notified: fhe_initial_hand_revealed
game.js:652 FHE_UI      | [FHE] Hand revealed: (5) [10206, 9, 11031, 10021, 30004]
game.js:656 FHE_UI      | [FHE] Remaining deck size: 34
game.js:1037 FHE_UI      | [FHE] === _populateFHEHand START ===
game.js:1038 FHE_UI      | [FHE] FHE Card IDs: (5) [10206, 9, 11031, 10021, 30004]
game.js:1039 FHE_UI      | [FHE] Card count: 5
game.js:1053 FHE_UI      | [FHE] Current deck hand (should be empty): (6) [null, null, null, null, null, null]
game.js:1054 FHE_UI      | [FHE] fheEnabled on gameSession: true
game.js:1083 FHE_UI      | [FHE] Slot 0: Drybone Golem (ID: 10206, index: 7977)
game.js:1083 FHE_UI      | [FHE] Slot 1: Windblade Adept (ID: 9, index: 8015)
game.js:1083 FHE_UI      | [FHE] Slot 2: Necroseer (ID: 11031, index: 8035)
game.js:1083 FHE_UI      | [FHE] Slot 3: Vale Hunter (ID: 10021, index: 8055)
game.js:1083 FHE_UI      | [FHE] Slot 4: Sunstone Bracers (ID: 30004, index: 8074)
game.js:1093 FHE_UI      | [FHE] Set FHE deck remaining from blockchain: 34
game.js:1095 FHE_UI      | [FHE] === POPULATE COMPLETE ===
game.js:1096 FHE_UI      | [FHE] Added 5 FHE cards to empty deck
game.js:1100 FHE_UI      | [FHE] Verified hand after populate:
game.js:1103 FHE_UI      | [FHE]   [0] Drybone Golem (ID: 10206)
game.js:1103 FHE_UI      | [FHE]   [1] Windblade Adept (ID: 9)
game.js:1103 FHE_UI      | [FHE]   [2] Necroseer (ID: 11031)
game.js:1103 FHE_UI      | [FHE]   [3] Vale Hunter (ID: 10021)
game.js:1103 FHE_UI      | [FHE]   [4] Sunstone Bracers (ID: 30004)
game.js:662 FHE_UI      | [FHE] Attempting to hide decrypt state...
game.js:663 FHE_UI      | [FHE] gameLayer exists: true
game.js:664 FHE_UI      | [FHE] bottomDeckLayer exists: true
game.js:666 FHE_UI      | [FHE] Calling hideFHEDecryptState()
GameLayer.js:1224 ENGINE      | GameLayer.showChooseHand


networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
game.js:804 FHE_UI      | === showSubmitChosenHand FHE CHECK ===
game.js:805 FHE_UI      | [FHE] mulliganIndices: []
game.js:806 FHE_UI      | [FHE] fheEnabled: true
game.js:807 FHE_UI      | [FHE] isDeveloperMode: false
game.js:811 FHE_UI      | [FHE] FHE MODE detected
game.js:819 FHE_UI      | [FHE] isSinglePlayerGame: true
game.js:820 FHE_UI      | [FHE] fheGameSession.gameId: 1765937155874
game.js:824 FHE_UI      | [FHE] SINGLE PLAYER - Skipping contract completeMulligan (already in InProgress state)
game.js:878 UI          | GameLayout.showSubmitChosenHand -> [] submitted? true
GameLayer.js:1276 ENGINE      | GameLayer.showSubmitChosenHand
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}step: {playerId: '-Ofum3S3l_5MupHTGsy0', index: 8085, timestamp: 1765937336470, action: {…}}type: "step"[[Prototype]]: Object
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  8085
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 8085 w/ action DrawStartingHandAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  8085
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  DrawStartingHandAction 8185
game.js:899 UI          | GameLayout.onDrawStartingHand []
game.js:907 FHE_UI      | === onDrawStartingHand FHE CHECK ===
game.js:908 FHE_UI      | [FHE] fheEnabled: true
game.js:909 FHE_UI      | [FHE] isDeveloperMode: false
game.js:912 FHE_UI      | [FHE] FHE MODE ACTIVE
game.js:922 FHE_UI      | [FHE] isSinglePlayerGame: true
game.js:923 FHE_UI      | [FHE] fheGameSession.gameId: 1765937155874
game.js:924 FHE_UI      | [FHE] hasValidGameId: true
game.js:929 FHE_UI      | [FHE] Cards already populated in showNextStepInGameSetup, skipping re-populate
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:980 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS.setStatus - from new to active
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 8085
GameLayer.js:1292 ENGINE      | GameLayer.showDrawStartingHand
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(15), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action DrawStartingHandAction {type: 'DrawStartingHandAction', ownerId: '-Ofum3S3l_5MupHTGsy0', mulliganIndices: Array(0), mulliganedHandCardsData: Array(0), newHandCardsData: Array(0), …}
game.js:560 UI          | GameLayout.showNextStepInGameSetup
game.js:1118 UI          | GameLayout.showActiveGame
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



2 MOVE ÖNE GİTTİKTEN SONRA KART KOYDUM "WINDBALDE ADEPT"
ŞİMDİ SPELL DENEYECEM AYNI ELDEYİM END TURN YAPMADIM HENÜZ S"UNSTONE BRACERS" İLE SPELL BASIYORUM SUAN
BASTIM BASILDI SORUN YOK

networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 132 to 177.
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 177 to 237.
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  8500
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 8500 w/ action PlayCardFromHandAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  8500
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  PlayCardFromHandAction 8573
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  ApplyModifierAction 8647
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 8500
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(3), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action PlayCardFromHandAction {type: 'PlayCardFromHandAction', ownerId: '-Ofum3S3l_5MupHTGsy0', targetPosition: {…}, cardOwnedByGameSession: false, indexOfCardInHand: 4, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5

networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  8718
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 8718 w/ action EndTurnAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  8718
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  EndTurnAction 8779
gameSession.js:1578 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS.p_endTurn -> turn count: 0
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  DrawCardAction 8790
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 8718
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  8792
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 8792 w/ action StartTurnAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  8792
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  StartTurnAction 8887
gameSession.js:1602 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextTurn
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 8792
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(2), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action EndTurnAction {type: 'EndTurnAction', ownerId: '-Ofum3S3l_5MupHTGsy0', index: 8779, timestamp: 1765937425403, subActionsOrderedByEventType: Array(1), …}
GameLayer.js:1700 ENGINE      | GameLayer.showEndTurn
GameLayer.js:1727 ENGINE      | GameLayer.afterShowEndTurn
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
application.js:2736 APPLICATIO  | App:onAfterShowEndTurn
game.js:411 FHE         | [DRAW] DrawCardAction detected for my player (count: 1)
fheGameSession.js:377 FHE_GAME    | === REVEAL DRAW CARD ===
fheGameSession.js:329 FHE_GAME    | Incrementing turn...
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action StartTurnAction {type: 'StartTurnAction', ownerId: 'ai', isAutomatic: true, index: 8887, timestamp: 1765937425410, …}
GameLayer.js:1742 ENGINE      | GameLayer.showStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
fheGameSession.js:340 FHE_GAME    | incrementTurn TX sent: 0x3e19606ef0071eddcf0921bcf6929daf48b2708cf46436c6679b6517279b05da
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
GameLayer.js:1860 ENGINE      | GameLayer.afterShowStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
fheGameSession.js:350 FHE_GAME    | Turn incremented to: 1
fheGameSession.js:386 FHE_GAME    | Got handle for new card
fheGameSession.js:624 FHE_GAME    | [DEBUG] Handle[0] type=string raw=0x284b7796b0be824ea36e55e376be241f18a85536bbff0000000000aa36a70200 converted=0x284b7796b0be824ea36e55e376be241f18a85536bbff0000000000aa36a70200
fheGameSession.js:628 FHE_GAME    | [DEBUG] All handleStrings: ['0x284b7796b0be824ea36e55e376be241f18a85536bbff0000000000aa36a70200']
fheGameSession.js:652 FHE_GAME    | [KMS] Calling publicDecrypt with handles: ['0x284b7796b0be824ea36e55e376be241f18a85536bbff0000000000aa36a70200']
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7

END TURNE BASTIM
DECRYPT BAŞLADI BANA KART ÇEKMEK İÇİN 3 KARTIM VAR SUAN YENİSİ GELECEK DECRYPT BİTİNCE ENEMTY TURNE GEÇECEK SONRA

KART REVEAL OLDU "HAILSTONE GOLEM" 4 KARTIM VAR SUAN ARTIK
VE AI OYUNCU DA HAREKTLERİNİ YAPTI TURN BANA GEÇTİ LOGLAR AŞAĞIDA 

networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7

Emitter.emit @ index.js:143
onPacket @ transport.js:106
onData @ transport.js:98
ws.onmessage @ websocket.js:77
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
fheGameSession.js:656 FHE_GAME    | [KMS] publicDecrypt response: {clearValues: {…}, abiEncodedClearValues: '0x0000000000000000000000000000000000000000000000000000000000000053', decryptionProof: '0x07f53bcffddc0438a3da41149fbaf8a2d02106c903bad522…fbd5ff5a91aaa5abee47cbdbeff3667e2f7432fad7de8241c'}
fheGameSession.js:662 FHE_GAME    | [KMS] Handle 0x284b7796b0be824ea36e55e376be241f18a85536bbff0000000000aa36a70200 -> clear value: 83n
fheGameSession.js:671 FHE_GAME    | [KMS] Decrypt success, clearIndices: [83]
fheGameSession.js:392 FHE_GAME    | Decrypted index: 83
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
fheGameSession.js:563 FHE_GAME    | revealDrawBatch TX sent: 0x437e2de89b54a089ee96961c945f56b2b872f50b8b122167e7c6556669971189
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
fheGameSession.js:570 FHE_GAME    | Reveal confirmed
fheGameSession.js:416 FHE_GAME    | === CARD DRAWN ===
fheGameSession.js:417 FHE_GAME    | Card ID: 10978
fheGameSession.js:418 FHE_GAME    | Hand size: 6
fheGameSession.js:419 FHE_GAME    | Deck remaining: 33
fheGameSession.js:428 FHE_GAME    | Server notified: fhe_card_drawn
fheGameSession.js:432 FHE_GAME    | Server response: {"success":true,"turn":1,"cardId":10978,"cardIndex":2060,"burned":false}
game.js:424 FHE         | [DRAW] FHE card drawn: 10978 index: 2060
game.js:952 FHE_UI      | [FHE] === _addFHECardToHand START ===
game.js:953 FHE_UI      | [FHE] Card ID: 10978 Server cardIndex: 2060
game.js:1000 FHE_UI      | [FHE] Using cardIndex: 2060 (from server: true )
game.js:1014 FHE_UI      | [FHE] Deck remaining: 33
game.js:1021 FHE_UI      | [FHE] Called bindCardNodeAtIndex for slot: 5
game.js:1024 FHE_UI      | [FHE] Added Hailstone Golem (ID: 10978, index: 2060) to slot 5
game.js:1025 FHE_UI      | [FHE] === _addFHECardToHand COMPLETE ===
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7

networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 7
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  9031
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 9031 w/ action MoveAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  9031
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  MoveAction 9038
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 9031
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action MoveAction {type: 'MoveAction', ownerId: 'ai', sourceIndex: 175, sourcePosition: {…}, targetIndex: 175, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  9081
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 9081 w/ action PlayCardFromHandAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  9081
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  PlayCardFromHandAction 9160
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  RemoveModifierAction 9224
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  BonusManaAction 9247
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  ApplyModifierAction 9249
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 9081
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(9), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action PlayCardFromHandAction {type: 'PlayCardFromHandAction', ownerId: 'ai', targetPosition: {…}, cardOwnedByGameSession: false, indexOfCardInHand: 0, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 9
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 9

networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  9329
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 9329 w/ action EndTurnAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  9329
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  EndTurnAction 9418
gameSession.js:1578 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS.p_endTurn -> turn count: 1
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  PlayCardAction 9514
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  ApplyModifierAction 9526
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  ApplyModifierAction 9623
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  ApplyModifierAction 9752
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  ApplyModifierAction 9804
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  DrawCardAction 9907
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  RemoveModifierAction 10000
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 9329
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  10001
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 10001 w/ action StartTurnAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  10001
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  StartTurnAction 10085
gameSession.js:1602 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextTurn
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 10001
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11

GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(15), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action EndTurnAction {type: 'EndTurnAction', ownerId: 'ai', index: 9418, subActionsOrderedByEventType: Array(1), timestamp: 1765937529652, …}
GameLayer.js:1700 ENGINE      | GameLayer.showEndTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11

GameLayer.js:1727 ENGINE      | GameLayer.afterShowEndTurn
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
application.js:2736 APPLICATIO  | App:onAfterShowEndTurn
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action StartTurnAction {type: 'StartTurnAction', ownerId: '-Ofum3S3l_5MupHTGsy0', isAutomatic: true, index: 10085, timestamp: 1765937529669, …}
GameLayer.js:1742 ENGINE      | GameLayer.showStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
GameLayer.js:1860 ENGINE      | GameLayer.afterShowStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11


"VALE HUNTERI" "BOARDDA OLAN WINDBLADE ADEPT" IN ONUNE KOYMAYI DENİYORUM SUAN
KOYDUM
3 KARTIM KALDI SUAN

networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
n
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  10154
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 10154 w/ action PlayCardFromHandAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  10154
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  PlayCardFromHandAction 10168
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 10154
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(2), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action PlayCardFromHandAction {type: 'PlayCardFromHandAction', ownerId: '-Ofum3S3l_5MupHTGsy0', targetPosition: {…}, cardOwnedByGameSession: false, indexOfCardInHand: 3, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 12
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 12



END TURN YAPIYORM

DECRYPT CAGIRILIYOR AŞAĞIDAKİ LOGLARDA BANA KART ÇEKMEK İÇİN ENEMY TURN GELECEK SONRA



networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11

networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  10154
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 10154 w/ action PlayCardFromHandAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  10154
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  PlayCardFromHandAction 10168
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 10154
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(2), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action PlayCardFromHandAction {type: 'PlayCardFromHandAction', ownerId: '-Ofum3S3l_5MupHTGsy0', targetPosition: {…}, cardOwnedByGameSession: false, indexOfCardInHand: 3, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 12
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 12

networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  10256
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 10256 w/ action EndTurnAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  10256
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  EndTurnAction 10278
gameSession.js:1578 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS.p_endTurn -> turn count: 2
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  DrawCardAction 10285
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 10256
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  10298
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 10298 w/ action StartTurnAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  10298
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  StartTurnAction 10368
gameSession.js:1602 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextTurn
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 10298
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(2), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action EndTurnAction {type: 'EndTurnAction', ownerId: '-Ofum3S3l_5MupHTGsy0', index: 10278, timestamp: 1765937616707, subActionsOrderedByEventType: Array(1), …}
GameLayer.js:1700 ENGINE      | GameLayer.showEndTurn
GameLayer.js:1727 ENGINE      | GameLayer.afterShowEndTurn
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
application.js:2736 APPLICATIO  | App:onAfterShowEndTurn
game.js:411 FHE         | [DRAW] DrawCardAction detected for my player (count: 1)
fheGameSession.js:377 FHE_GAME    | === REVEAL DRAW CARD ===
fheGameSession.js:329 FHE_GAME    | Incrementing turn...
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action StartTurnAction {type: 'StartTurnAction', ownerId: 'ai', isAutomatic: true, index: 10368, timestamp: 1765937616710, …}
GameLayer.js:1742 ENGINE      | GameLayer.showStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
fheGameSession.js:340 FHE_GAME    | incrementTurn TX sent: 0xdc4666de1765c89383a7c1ee39bfda8d0627075d9d57a7345d8fb40913c5a2d3
GameLayer.js:1860 ENGINE      | GameLayer.afterShowStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14

fheGameSession.js:350 FHE_GAME    | Turn incremented to: 2
fheGameSession.js:386 FHE_GAME    | Got handle for new card
fheGameSession.js:624 FHE_GAME    | [DEBUG] Handle[0] type=string raw=0x5c9c1946f06bc86d25c1d26ae61f5f7dd0b73110c3ff0000000000aa36a70200 converted=0x5c9c1946f06bc86d25c1d26ae61f5f7dd0b73110c3ff0000000000aa36a70200
fheGameSession.js:628 FHE_GAME    | [DEBUG] All handleStrings: ['0x5c9c1946f06bc86d25c1d26ae61f5f7dd0b73110c3ff0000000000aa36a70200']
fheGameSession.js:652 FHE_GAME    | [KMS] Calling publicDecrypt with handles: ['0x5c9c1946f06bc86d25c1d26ae61f5f7dd0b73110c3ff0000000000aa36a70200']
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14


DECRYPT BEKLİYORUZ 


networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
fheGameSession.js:656 FHE_GAME    | [KMS] publicDecrypt response: {clearValues: {…}, abiEncodedClearValues: '0x00000000000000000000000000000000000000000000000000000000000000fb', decryptionProof: '0x0750c9476133a2bb6c42c3ad2f3cbce4d22e38ff5c619610…6ed361f774bef339ea18174068c19663367381efafd35591b'}
fheGameSession.js:662 FHE_GAME    | [KMS] Handle 0x5c9c1946f06bc86d25c1d26ae61f5f7dd0b73110c3ff0000000000aa36a70200 -> clear value: 251n
fheGameSession.js:671 FHE_GAME    | [KMS] Decrypt success, clearIndices: [251]
fheGameSession.js:392 FHE_GAME    | Decrypted index: 251
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
fheGameSession.js:563 FHE_GAME    | revealDrawBatch TX sent: 0x6b06f1f376dbd4f63f88391b6446860900c0719143844470dd35d4915fdc2208
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
fheGameSession.js:570 FHE_GAME    | Reveal confirmed
fheGameSession.js:416 FHE_GAME    | === CARD DRAWN ===
fheGameSession.js:417 FHE_GAME    | Card ID: 19027
fheGameSession.js:418 FHE_GAME    | Hand size: 7
fheGameSession.js:419 FHE_GAME    | Deck remaining: 32
fheGameSession.js:428 FHE_GAME    | Server notified: fhe_card_drawn
fheGameSession.js:432 FHE_GAME    | Server response: {"success":true,"turn":2,"cardId":19027,"cardIndex":2879,"burned":false}
game.js:424 FHE         | [DRAW] FHE card drawn: 19027 index: 2879
game.js:952 FHE_UI      | [FHE] === _addFHECardToHand START ===
game.js:953 FHE_UI      | [FHE] Card ID: 19027 Server cardIndex: 2879
game.js:979 FHE_UI      | [FHE] Hand is full - card BURNED (ID: 19027)
game.js:983 FHE_UI      | [FHE] Deck remaining after burn: 32
game.js:987 FHE_UI      | [FHE] === _addFHECardToHand BURNED (hand full) ===
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14

networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 14
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  10492
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 10492 w/ action MoveAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  10492
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  MoveAction 10564
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 10492
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action MoveAction {type: 'MoveAction', ownerId: 'ai', sourceIndex: 175, sourcePosition: {…}, targetIndex: 175, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 15
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 15
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 15
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 15
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 15
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  10637
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 10637 w/ action AttackAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  10637
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  AttackAction 10685
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  AttackAction 10761
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  DieAction 10766
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  RemoveModifierAction 10807
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 10637
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(6), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action AttackAction {type: 'AttackAction', ownerId: 'ai', sourceIndex: 175, sourcePosition: {…}, targetIndex: 677, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 16
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 16
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 16
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 16
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 16
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._queueStep ->  10878
gameSession.js:1963 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startNextStep -> 10878 w/ action MoveAction
gameSession.js:1978 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._startStep ->  10878
gameSession.js:2041 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._executeActionForStep ->  MoveAction 10885
gameSession.js:2397 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-Oge2k6gsTxPvoUlRVCm] GS._endStep 10878
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action MoveAction {type: 'MoveAction', ownerId: 'ai', sourceIndex: 5196, sourcePosition: {…}, targetIndex: 5196, …}


BURASI BENİM NOTLARIM 
------------------------------------
DECRYPT OLDU AMA 3 KARTIM VAR HALA. BURAYI ANLAYAMADIM VE "HAIL STORM GOLEM" I BOARDA KOYUNCA PATLADI 
SANIRIM BURADA DECRYPTTEN ÖNCE 3 KARTIM VARKEN DECRYPT SONRASI YİNE 3 KARTIM OLMASI AKIŞI BOZDU. ASLINDA KARTIM 4 E CIKMALIYDI MI ?
EN SON BUYDU : fheGameSession.js:392 FHE_GAME    | Decrypted index: 251

""""""" fheGameSession.js:570 FHE_GAME    | Reveal confirmed
fheGameSession.js:416 FHE_GAME    | === CARD DRAWN ===
fheGameSession.js:417 FHE_GAME    | Card ID: 19027
fheGameSession.js:418 FHE_GAME    | Hand size: 7
fheGameSession.js:419 FHE_GAME    | Deck remaining: 32
fheGameSession.js:428 FHE_GAME    | Server notified: fhe_card_drawn
fheGameSession.js:432 FHE_GAME    | Server response: {"success":true,"turn":2,"cardId":19027,"cardIndex":2879,"burned":false}
game.js:424 FHE         | [DRAW] FHE card drawn: 19027 index: 2879
game.js:952 FHE_UI      | [FHE] === _addFHECardToHand START ===
game.js:953 FHE_UI      | [FHE] Card ID: 19027 Server cardIndex: 2879
game.js:979 FHE_UI      | [FHE] Hand is full - card BURNED (ID: 19027)
game.js:983 FHE_UI      | [FHE] Deck remaining after burn: 32
game.js:987 FHE_UI      | [FHE] === _addFHECardToHand BURNED (hand full) === """""""