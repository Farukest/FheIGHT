FHE_GAME    | Decrypted indices: (5) [213, 143, 220, 184, 243]
fheGameSession.js:589 FHE_GAME    | revealDrawBatch TX sent: 0x687f0b630b32f155e8b811b273de08fbc30b678a9b31fc40e1c2ea0bbae1df0f
fheGameSession.js:596 FHE_GAME    | Reveal confirmed
fheGameSession.js:290 FHE_GAME    | === INITIAL HAND READY ===
fheGameSession.js:291 FHE_GAME    | Hand: (5) [11107, 11013, 11044, 108, 11044]
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
ws.onmessage @ websocket.js:77Understand this error
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
ws.onmessage @ websocket.js:77Understand this error
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
ws.onmessage @ websocket.js:77Understand this error
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