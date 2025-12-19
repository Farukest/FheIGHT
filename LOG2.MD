networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2342 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgoEvuekhLNBdI2Trhn] GS._queueStep ->  12608
gameSession.js:1963 SDK         | [G:-OgoEvuekhLNBdI2Trhn] GS._startNextStep -> 12608 w/ action EndTurnAction
gameSession.js:1978 SDK         | [G:-OgoEvuekhLNBdI2Trhn] GS._startStep ->  12608
gameSession.js:2041 SDK         | [G:-OgoEvuekhLNBdI2Trhn] GS._executeActionForStep ->  EndTurnAction 12623
gameSession.js:1578 SDK         | [G:-OgoEvuekhLNBdI2Trhn] GS.p_endTurn -> turn count: 0
gameSession.js:2397 SDK         | [G:-OgoEvuekhLNBdI2Trhn] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-OgoEvuekhLNBdI2Trhn] GS._executeActionForStep ->  DrawCardAction 12640
drawCardAction.js:46 SDK         | [FHE] DrawCardAction: Skipping for FHE player (deck from blockchain), fheEnabled: true playerSetupData.fhe_enabled: true
gameSession.js:2397 SDK         | [G:-OgoEvuekhLNBdI2Trhn] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgoEvuekhLNBdI2Trhn] GS._endStep 12608
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(2), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action EndTurnAction {type: 'EndTurnAction', ownerId: '-Ofum3S3l_5MupHTGsy0', index: 12623, timestamp: 1766108203139, subActionsOrderedByEventType: Array(1), …}
GameLayer.js:1700 ENGINE      | GameLayer.showEndTurn
GameLayer.js:1727 ENGINE      | GameLayer.afterShowEndTurn
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
application.js:2747 APPLICATIO  | App:onAfterShowEndTurn
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
application.js:2382  APPLICATIO  | App._onNetworkGameEvent -> seems like game session is behind server step count
App._onNetworkGameEvent @ application.js:2382
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
application.js:2382  APPLICATIO  | App._onNetworkGameEvent -> seems like game session is behind server step count
App._onNetworkGameEvent @ application.js:2382
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
application.js:2382  APPLICATIO  | App._onNetworkGameEvent -> seems like game session is behind server step count
App._onNetworkGameEvent @ application.js:2382
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
application.js:2382  APPLICATIO  | App._onNetworkGameEvent -> seems like game session is behind server step count
App._onNetworkGameEvent @ application.js:2382
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
application.js:2382  APPLICATIO  | App._onNetworkGameEvent -> seems like game session is behind server step count
App._onNetworkGameEvent @ application.js:2382
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
application.js:2382  APPLICATIO  | App._onNetworkGameEvent -> seems like game session is behind server step count
App._onNetworkGameEvent @ application.js:2382
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
application.js:2382  APPLICATIO  | App._onNetworkGameEvent -> seems like game session is behind server step count
App._onNetworkGameEvent @ application.js:2382
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
application.js:2382  APPLICATIO  | App._onNetworkGameEvent -> seems like game session is behind server step count
App._onNetworkGameEvent @ application.js:2382
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
application.js:2382  APPLICATIO  | App._onNetworkGameEvent -> seems like game session is behind server step count
App._onNetworkGameEvent @ application.js:2382
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
application.js:2382  APPLICATIO  | App._onNetworkGameEvent -> seems like game session is behind server step count
App._onNetworkGameEvent @ application.js:2382
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
networkManager.js:186 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 5
application.js:2382  APPLICATIO  | App._onNetworkGameEvent -> seems like game session is behind server step count
App._onNetworkGameEvent @ application.js:2382
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
application.js:1537 APPLICATIO  | App._error Your current match appears to be out of sync. To avoid any issues, please select CONTINUE and reconnect to your match.
application.js:575 APPLICATIO  | App:main
application.js:2762 APPLICATIO  | App.cleanupGame
application.js:2777 APPLICATIO  | App.cleanupGameEvents
application.js:3921 APPLICATIO  | App._unsubscribeFromGameLocalEvents
application.js:3944 APPLICATIO  | App._unsubscribeFromGameNetworkEvents
GameLayer.js:278 ENGINE      | GameLayer.terminate
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
gameSession.js:516 SDK         | [G:-OgoEvuekhLNBdI2Trhn] GS.terminate
networkManager.js:295 SDK         | NetworkManager:disconnect
networkManager.js:245 io client disconnect
networkManager.js:246  IO          | NetworkManager::IO:disconnect -> DISCONNECT
(anonymous) @ networkManager.js:246
Emitter.emit @ index.js:143
onclose @ socket.js:451
disconnect @ socket.js:641
disconnect @ networkManager.js:303
(anonymous) @ application.js:590
tryCatcher @ bluebird.js:4594
Promise2._settlePromiseFromHandler @ bluebird.js:2698
Promise2._settlePromiseAt @ bluebird.js:2772
Promise2._settlePromiseAtPostResolution @ bluebird.js:2436
Async._drainQueue @ bluebird.js:180
Async._drainQueues @ bluebird.js:185
Async.drainQueues @ bluebird.js:67
setTimeout
schedule @ bluebird.js:131
Async._queueTick @ bluebird.js:193
AsyncInvoke @ bluebird.js:117
Async.invoke @ bluebird.js:147
Promise2._then @ bluebird.js:2427
Promise2.then @ bluebird.js:2304
App.main @ application.js:574
App._error @ application.js:1549
App._onNetworkGameEvent @ application.js:2390
triggerEvents @ eventbus.js:156
trigger @ eventbus.js:89
(anonymous) @ networkManager.js:189
(anonymous) @ underscore-umd.js:1086
setTimeout
(anonymous) @ underscore-umd.js:1085
(anonymous) @ underscore-umd.js:76
executeBound @ underscore-umd.js:986
bound @ underscore-umd.js:1006
(anonymous) @ networkManager.js:189
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
chat_manager.js:345 UI          | ChatManager::setStatus -> loading
application.js:650 UI          | Last active game was on  Fri Dec 19 2025 04:35:51 GMT+0300 (GMT+03:00) with data Backbone.Model {cid: 'c3525', attributes: {…}, collection: constructor, _changing: false, _previousAttributes: {…}, …}
application.js:1731 APPLICATIO  | App._resumeGame {created_at: 1766108151465, deck_cards: Array(46), faction_id: 2, game_id: '-OgoEvuekhLNBdI2Trhn', game_type: 'ranked', …}
chat_manager.js:345 UI          | ChatManager::setStatus -> game
chat_manager.js:345 UI          | ChatManager::setStatus -> loading
GameLayer.js:278 ENGINE      | GameLayer.terminate
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
GameLayer.js:278 ENGINE      | GameLayer.terminate
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
chat_manager.js:345 UI          | ChatManager::setStatus -> game
MatchmakingLayer.js:123 ENGINE      | MatchmakingLayer.showVsForGame 2 4 false 0.35
FX.js:422 ENGINE      | FX.reset
vendor.js:23422 [Violation] 'load' handler took 150ms
vendor.js:23422 [Violation] 'load' handler took 181ms
