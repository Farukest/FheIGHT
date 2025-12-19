application.js:2282 APPLICATIO  | App._joinGame {created_at: 1766150810169, deck_cards: Array(40), faction_id: 2, game_id: '-OgqmectWmKCTq-cj3Jy', game_type: 'friendly', …}
networkManager.js:65 SDK         | NetworkManager:connect -> gameId: -OgqmectWmKCTq-cj3Jy
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
application.js:2485 APPLICATIO  | App._startGameWithData {gameSetupData: {…}, status: 'new', cardsByIndex: {…}, modifiersByIndex: {…}, createdAt: 1766150810169, …}
application.js:2509 APPLICATIO  | App:_startGame new
application.js:2512 === _startGame DEV MODE STATUS ===
application.js:2513 CONFIG.DEV_MODE_ENABLED: false
application.js:2514 gameSession.getIsDeveloperMode(): false
application.js:2515 gameSession.getAreDecksRandomized(): true
application.js:2516 gameSession.isChallenge(): false
application.js:2517 ==================================
chat_manager.js:345 UI          | ChatManager::setStatus -> game
application.js:3935 APPLICATIO  | App._subscribeToGameNetworkEvents
games_manager.js:802 UI          | GamesManager::cancelMatchmaking -> wasLookingForGame? false
game.js:597 UI          | GameLayout.showNextStepInGameSetup
game.js:637 FHE_UI      | [FHE] showNextStepInGameSetup: FHE mode detected
fheGameSession.js:75 FHE_GAME    | Socket set for server notifications
game.js:646 FHE_UI      | [FHE] Socket set for server notifications
game.js:657 FHE_UI      | [FHE] >>> Sending fhe_game_created with data: {"gameId":"-OgqmectWmKCTq-cj3Jy","blockchainGameId":1766150798737,"network":"sepolia"}
game.js:658 FHE_UI      | [FHE] >>> Socket connected: true id: 0nKjf_5ZdpfllPFJAAAD
fheGameSession.js:101 FHE_GAME    | Server notified: fhe_game_created
game.js:660 FHE_UI      | [FHE] Sent fhe_game_created event to server (blockchainGameId: 1766150798737 )
game.js:756 UI          | GameLayout.showChooseHand
game.js:686 FHE_UI      | [FHE] Starting revealInitialHand for gameId: 1766150798737
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
bluebird.js:66 [Violation] 'setTimeout' handler took 91ms
vendor.js:24056 [Violation] 'requestAnimationFrame' handler took 51ms
vendor.js:23422 [Violation] 'load' handler took 249ms
vendor.js:24056 [Violation] 'requestAnimationFrame' handler took 52ms
GameLayer.js:257 ENGINE      | GameLayer.start
GameLayer.js:941 ENGINE      | GameLayer.onTransitionIn
GameLayer.js:257 ENGINE      | GameLayer.start
GameLayer.js:1224 ENGINE      | GameLayer.showChooseHand
fheGameSession.js:253 FHE_GAME    | ACL wait complete, proceeding...
fheGameSession.js:258 FHE_GAME    | Allowed reveals: 5
fheGameSession.js:268 FHE_GAME    | Got 5 handles
fheGameSession.js:668 FHE_GAME    | [DEBUG] Handle[0] type=string raw=0x20753f5de20a2eb3d0ce5b28683f371c4e95efc450ff0000000000aa36a70200 converted=0x20753f5de20a2eb3d0ce5b28683f371c4e95efc450ff0000000000aa36a70200
fheGameSession.js:668 FHE_GAME    | [DEBUG] Handle[1] type=string raw=0xa7b69c399fa71ad92fa6c87d4707e8a7d38e931bf6ff0000000000aa36a70200 converted=0xa7b69c399fa71ad92fa6c87d4707e8a7d38e931bf6ff0000000000aa36a70200
fheGameSession.js:668 FHE_GAME    | [DEBUG] Handle[2] type=string raw=0x248eb3617c7da37614614dd58cfc908b58df84d329ff0000000000aa36a70200 converted=0x248eb3617c7da37614614dd58cfc908b58df84d329ff0000000000aa36a70200
fheGameSession.js:668 FHE_GAME    | [DEBUG] Handle[3] type=string raw=0x1284bc355d60c48449283fc60be87b1966baa3f5f6ff0000000000aa36a70200 converted=0x1284bc355d60c48449283fc60be87b1966baa3f5f6ff0000000000aa36a70200
fheGameSession.js:668 FHE_GAME    | [DEBUG] Handle[4] type=string raw=0x136b8b5b26916796b5a6ff7621459cbe7ab155b0deff0000000000aa36a70200 converted=0x136b8b5b26916796b5a6ff7621459cbe7ab155b0deff0000000000aa36a70200
fheGameSession.js:672 FHE_GAME    | [DEBUG] All handleStrings: (5) ['0x20753f5de20a2eb3d0ce5b28683f371c4e95efc450ff0000000000aa36a70200', '0xa7b69c399fa71ad92fa6c87d4707e8a7d38e931bf6ff0000000000aa36a70200', '0x248eb3617c7da37614614dd58cfc908b58df84d329ff0000000000aa36a70200', '0x1284bc355d60c48449283fc60be87b1966baa3f5f6ff0000000000aa36a70200', '0x136b8b5b26916796b5a6ff7621459cbe7ab155b0deff0000000000aa36a70200']
fheGameSession.js:696 FHE_GAME    | [KMS] Calling publicDecrypt with handles: (5) ['0x20753f5de20a2eb3d0ce5b28683f371c4e95efc450ff0000000000aa36a70200', '0xa7b69c399fa71ad92fa6c87d4707e8a7d38e931bf6ff0000000000aa36a70200', '0x248eb3617c7da37614614dd58cfc908b58df84d329ff0000000000aa36a70200', '0x1284bc355d60c48449283fc60be87b1966baa3f5f6ff0000000000aa36a70200', '0x136b8b5b26916796b5a6ff7621459cbe7ab155b0deff0000000000aa36a70200']
fheGameSession.js:700 FHE_GAME    | [KMS] publicDecrypt response: {clearValues: {…}, abiEncodedClearValues: '0x000000000000000000000000000000000000000000000000…000000000000000000000000000000000000000000000005d', decryptionProof: '0x07a6b165eafbf1dcdf78ae5eac355fd08c3de83784aa02a9…8417bb08f573b4212cff9d1b2d8d1677a9da4c20ec1a6d21c'}
fheGameSession.js:706 FHE_GAME    | [KMS] Handle 0x20753f5de20a2eb3d0ce5b28683f371c4e95efc450ff0000000000aa36a70200 -> clear value: 154n
fheGameSession.js:706 FHE_GAME    | [KMS] Handle 0xa7b69c399fa71ad92fa6c87d4707e8a7d38e931bf6ff0000000000aa36a70200 -> clear value: 28n
fheGameSession.js:706 FHE_GAME    | [KMS] Handle 0x248eb3617c7da37614614dd58cfc908b58df84d329ff0000000000aa36a70200 -> clear value: 14n
fheGameSession.js:706 FHE_GAME    | [KMS] Handle 0x1284bc355d60c48449283fc60be87b1966baa3f5f6ff0000000000aa36a70200 -> clear value: 28n
fheGameSession.js:706 FHE_GAME    | [KMS] Handle 0x136b8b5b26916796b5a6ff7621459cbe7ab155b0deff0000000000aa36a70200 -> clear value: 93n
fheGameSession.js:715 FHE_GAME    | [KMS] Decrypt success, clearIndices: (5) [154, 28, 14, 28, 93]
fheGameSession.js:274 FHE_GAME    | Decrypted indices: (5) [154, 28, 14, 28, 93]
fheGameSession.js:589 FHE_GAME    | revealDrawBatch TX sent: 0xeae8048bda055451c022909a4f5f6419e291a8004dc14a4c5239ec8147a49ab0
fheGameSession.js:596 FHE_GAME    | Reveal confirmed
fheGameSession.js:290 FHE_GAME    | === INITIAL HAND READY ===
fheGameSession.js:291 FHE_GAME    | Hand: (5) [11044, 19036, 140, 11013, 11156]
fheGameSession.js:321 FHE_GAME    | Server notified: fhe_initial_hand_revealed
fheGameSession.js:298 FHE_GAME    | Server response: {"error":"Blockchain error: Cannot read properties of null (reading 'flushCachedAttribute')"}
fheGameSession.js:309 FHE_GAME    | Server error: Blockchain error: Cannot read properties of null (reading 'flushCachedAttribute')
(anonymous) @ fheGameSession.js:309
on @ index.js:63
Emitter.emit @ index.js:143
emitEvent @ socket.js:519
onevent @ socket.js:506
onpacket @ socket.js:474
Emitter.emit @ index.js:143
(anonymous) @ manager.js:240
Promise.then
(anonymous) @ websocket-constructor.browser.js:8
ondecoded @ manager.js:239
Emitter.emit @ index.js:143
add @ index.js:154
ondata @ manager.js:226
Emitter.emit @ index.js:143
onPacket @ socket.js:348
Emitter.emit @ index.js:143
onPacket @ transport.js:106
onData @ transport.js:98
ws.onmessage @ websocket.js:77
fheGameSession.js:332 FHE_GAME    | revealInitialHand failed: Error: Blockchain error: Cannot read properties of null (reading 'flushCachedAttribute')
at Socket.<anonymous> (fheGameSession.js:310:1)
at Socket.on (index.js:63:1)
at Emitter.emit (index.js:143:1)
at Socket.emitEvent (socket.js:519:1)
at Socket.onevent (socket.js:506:1)
at Socket.onpacket (socket.js:474:1)
at Emitter.emit (index.js:143:1)
at manager.js:240:1
(anonymous) @ fheGameSession.js:332
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
AsyncSettlePromises @ bluebird.js:122
Async.settlePromises @ bluebird.js:157
Promise2._queueSettlePromises @ bluebird.js:2828
Promise2._rejectUnchecked @ bluebird.js:2878
Promise2._reject @ bluebird.js:2747
Promise2._rejectCallback @ bluebird.js:2663
(anonymous) @ bluebird.js:2677
(anonymous) @ fheGameSession.js:310
on @ index.js:63
Emitter.emit @ index.js:143
emitEvent @ socket.js:519
onevent @ socket.js:506
onpacket @ socket.js:474
Emitter.emit @ index.js:143
(anonymous) @ manager.js:240
Promise.then
(anonymous) @ websocket-constructor.browser.js:8
ondecoded @ manager.js:239
Emitter.emit @ index.js:143
add @ index.js:154
ondata @ manager.js:226
Emitter.emit @ index.js:143
onPacket @ socket.js:348
Emitter.emit @ index.js:143
onPacket @ transport.js:106
onData @ transport.js:98
ws.onmessage @ websocket.js:77
game.js:730 FHE_UI      | [FHE] Decrypt failed: Error: Blockchain error: Cannot read properties of null (reading 'flushCachedAttribute')
at Socket.<anonymous> (fheGameSession.js:310:1)
at Socket.on (index.js:63:1)
at Emitter.emit (index.js:143:1)
at Socket.emitEvent (socket.js:519:1)
at Socket.onevent (socket.js:506:1)
at Socket.onpacket (socket.js:474:1)
at Emitter.emit (index.js:143:1)
at manager.js:240:1
(anonymous) @ game.js:730
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
AsyncSettlePromises @ bluebird.js:122
Async.settlePromises @ bluebird.js:157
Promise2._queueSettlePromises @ bluebird.js:2828
Promise2._rejectUnchecked @ bluebird.js:2878
Promise2._reject @ bluebird.js:2747
Promise2._rejectCallback @ bluebird.js:2663
(anonymous) @ bluebird.js:2677
(anonymous) @ fheGameSession.js:310
on @ index.js:63
Emitter.emit @ index.js:143
emitEvent @ socket.js:519
onevent @ socket.js:506
onpacket @ socket.js:474
Emitter.emit @ index.js:143
(anonymous) @ manager.js:240
Promise.then
(anonymous) @ websocket-constructor.browser.js:8
ondecoded @ manager.js:239
Emitter.emit @ index.js:143
add @ index.js:154
ondata @ manager.js:226
Emitter.emit @ index.js:143
onPacket @ socket.js:348
Emitter.emit @ index.js:143
onPacket @ transport.js:106
onData @ transport.js:98
ws.onmessage @ websocket.js:77
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2342 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgqmectWmKCTq-cj3Jy] GS._queueStep ->  10532
gameSession.js:1963 SDK         | [G:-OgqmectWmKCTq-cj3Jy] GS._startNextStep -> 10532 w/ action DrawStartingHandAction
gameSession.js:1978 SDK         | [G:-OgqmectWmKCTq-cj3Jy] GS._startStep ->  10532
gameSession.js:2041 SDK         | [G:-OgqmectWmKCTq-cj3Jy] GS._executeActionForStep ->  DrawStartingHandAction 10593
gameSession.js:2397 SDK         | [G:-OgqmectWmKCTq-cj3Jy] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgqmectWmKCTq-cj3Jy] GS._endStep 10532
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action DrawStartingHandAction {type: 'DrawStartingHandAction', ownerId: '-OgigZPqLhwiT8ILtaB9', mulliganIndices: Array(0), mulliganedHandCardsData: Array(0), newHandCardsData: Array(0), …}
game.js:839 FHE_UI      | [FHE] Retrying FHE decrypt...
fheGameSession.js:241 FHE_GAME    | === REVEAL INITIAL HAND ===
fheGameSession.js:245 FHE_GAME    | Waiting for ZAMA ACL indexing (10 seconds)...
fheGameSession.js:253 FHE_GAME    | ACL wait complete, proceeding...
fheGameSession.js:258 FHE_GAME    | Allowed reveals: 5
fheGameSession.js:332 FHE_GAME    | revealInitialHand failed: Error: call revert exception; VM Exception while processing transaction: reverted with reason string "Exceeds allowed reveals" [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="getDrawHandles(uint256,uint8)", data="0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000174578636565647320616c6c6f7765642072657665616c73000000000000000000", errorArgs=["Exceeds allowed reveals"], errorName="Error", errorSignature="Error(string)", reason="Exceeds allowed reveals", code=CALL_EXCEPTION, version=abi/5.7.0)
at Logger3.makeError (index.js:238:1)
at Logger3.throwError (index.js:247:1)
at Interface2.decodeFunctionResult (interface.js:388:1)
at Contract2.<anonymous> (index.js:395:1)
at step (index.js:48:1)
at Object.next (index.js:29:1)
at fulfilled (index.js:20:1)
(anonymous) @ fheGameSession.js:332
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
AsyncSettlePromises @ bluebird.js:122
Async.settlePromises @ bluebird.js:157
Promise2._queueSettlePromises @ bluebird.js:2828
Promise2._rejectUnchecked @ bluebird.js:2878
Promise2._reject @ bluebird.js:2747
Promise2._rejectCallback @ bluebird.js:2663
rejectFromThenable @ bluebird.js:4271
Promise.then
tryCatcher @ bluebird.js:4594
doThenable @ bluebird.js:4253
tryConvertToPromise @ bluebird.js:4231
Promise2._resolveCallback @ bluebird.js:2633
Promise2._settlePromiseFromHandler @ bluebird.js:2706
Promise2._settlePromiseAt @ bluebird.js:2772
Async._drainQueue @ bluebird.js:180
Async._drainQueues @ bluebird.js:185
Async.drainQueues @ bluebird.js:67
setTimeout
schedule @ bluebird.js:131
Async._queueTick @ bluebird.js:193
AsyncSettlePromises @ bluebird.js:122
Async.settlePromises @ bluebird.js:157
Promise2._queueSettlePromises @ bluebird.js:2828
Promise2._fulfillUnchecked @ bluebird.js:2843
Promise2._fulfill @ bluebird.js:2742
Promise2._resolveCallback @ bluebird.js:2634
resolveFromThenable @ bluebird.js:4265
Promise.then
tryCatcher @ bluebird.js:4594
doThenable @ bluebird.js:4253
tryConvertToPromise @ bluebird.js:4231
Promise2._resolveCallback @ bluebird.js:2633
Promise2._settlePromiseFromHandler @ bluebird.js:2706
Promise2._settlePromiseAt @ bluebird.js:2772
Promise2._settlePromises @ bluebird.js:2888
Async._drainQueue @ bluebird.js:175
Async._drainQueues @ bluebird.js:185
Async.drainQueues @ bluebird.js:67
setTimeout
schedule @ bluebird.js:131
Async._queueTick @ bluebird.js:193
AsyncSettlePromises @ bluebird.js:122
Async.settlePromises @ bluebird.js:157
Promise2._queueSettlePromises @ bluebird.js:2828
Promise2._fulfillUnchecked @ bluebird.js:2843
Promise2._fulfill @ bluebird.js:2742
Promise2._resolveCallback @ bluebird.js:2634
(anonymous) @ bluebird.js:2673
setTimeout
(anonymous) @ fheGameSession.js:248
tryCatcher @ bluebird.js:4594
Promise2._resolveFromResolver @ bluebird.js:2671
Promise2 @ bluebird.js:2259
(anonymous) @ fheGameSession.js:247
tryCatcher @ bluebird.js:4594
Promise2._resolveFromResolver @ bluebird.js:2671
Promise2 @ bluebird.js:2259
FHEGameSession.revealInitialHand @ fheGameSession.js:235
retryFHEDecrypt @ game.js:861
triggerEvents @ vendor.js:17928
trigger @ vendor.js:17869
Marionette.triggerMethod @ vendor.js:20002
triggerMethod @ vendor.js:21197
(anonymous) @ vendor.js:21176
executeBound @ vendor.js:16664
(anonymous) @ vendor.js:16696
(anonymous) @ vendor.js:15752
dispatch @ vendor.js:4435
elemData.handle @ vendor.js:4121
game.js:884 FHE_UI      | [FHE] Retry failed: Error: call revert exception; VM Exception while processing transaction: reverted with reason string "Exceeds allowed reveals" [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="getDrawHandles(uint256,uint8)", data="0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000174578636565647320616c6c6f7765642072657665616c73000000000000000000", errorArgs=["Exceeds allowed reveals"], errorName="Error", errorSignature="Error(string)", reason="Exceeds allowed reveals", code=CALL_EXCEPTION, version=abi/5.7.0)
at Logger3.makeError (index.js:238:1)
at Logger3.throwError (index.js:247:1)
at Interface2.decodeFunctionResult (interface.js:388:1)
at Contract2.<anonymous> (index.js:395:1)
at step (index.js:48:1)
at Object.next (index.js:29:1)
at fulfilled (index.js:20:1)
(anonymous) @ game.js:884
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
AsyncSettlePromises @ bluebird.js:122
Async.settlePromises @ bluebird.js:157
Promise2._queueSettlePromises @ bluebird.js:2828
Promise2._rejectUnchecked @ bluebird.js:2878
Promise2._reject @ bluebird.js:2747
Promise2._rejectCallback @ bluebird.js:2663
rejectFromThenable @ bluebird.js:4271
Promise.then
tryCatcher @ bluebird.js:4594
doThenable @ bluebird.js:4253
tryConvertToPromise @ bluebird.js:4231
Promise2._resolveCallback @ bluebird.js:2633
Promise2._settlePromiseFromHandler @ bluebird.js:2706
Promise2._settlePromiseAt @ bluebird.js:2772
Async._drainQueue @ bluebird.js:180
Async._drainQueues @ bluebird.js:185
Async.drainQueues @ bluebird.js:67
setTimeout
schedule @ bluebird.js:131
Async._queueTick @ bluebird.js:193
AsyncSettlePromises @ bluebird.js:122
Async.settlePromises @ bluebird.js:157
Promise2._queueSettlePromises @ bluebird.js:2828
Promise2._fulfillUnchecked @ bluebird.js:2843
Promise2._fulfill @ bluebird.js:2742
Promise2._resolveCallback @ bluebird.js:2634
resolveFromThenable @ bluebird.js:4265
Promise.then
tryCatcher @ bluebird.js:4594
doThenable @ bluebird.js:4253
tryConvertToPromise @ bluebird.js:4231
Promise2._resolveCallback @ bluebird.js:2633
Promise2._settlePromiseFromHandler @ bluebird.js:2706
Promise2._settlePromiseAt @ bluebird.js:2772
Promise2._settlePromises @ bluebird.js:2888
Async._drainQueue @ bluebird.js:175
Async._drainQueues @ bluebird.js:185
Async.drainQueues @ bluebird.js:67
setTimeout
schedule @ bluebird.js:131
Async._queueTick @ bluebird.js:193
AsyncSettlePromises @ bluebird.js:122
Async.settlePromises @ bluebird.js:157
Promise2._queueSettlePromises @ bluebird.js:2828
Promise2._fulfillUnchecked @ bluebird.js:2843
Promise2._fulfill @ bluebird.js:2742
Promise2._resolveCallback @ bluebird.js:2634
(anonymous) @ bluebird.js:2673
setTimeout
(anonymous) @ fheGameSession.js:248
tryCatcher @ bluebird.js:4594
Promise2._resolveFromResolver @ bluebird.js:2671
Promise2 @ bluebird.js:2259
(anonymous) @ fheGameSession.js:247
tryCatcher @ bluebird.js:4594
Promise2._resolveFromResolver @ bluebird.js:2671
Promise2 @ bluebird.js:2259
FHEGameSession.revealInitialHand @ fheGameSession.js:235
retryFHEDecrypt @ game.js:861
triggerEvents @ vendor.js:17928
trigger @ vendor.js:17869
Marionette.triggerMethod @ vendor.js:20002
triggerMethod @ vendor.js:21197
(anonymous) @ vendor.js:21176
executeBound @ vendor.js:16664
(anonymous) @ vendor.js:16696
(anonymous) @ vendor.js:15752
dispatch @ vendor.js:4435
elemData.handle @ vendor.js:4121
