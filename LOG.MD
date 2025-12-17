fheGameSession.js:253 FHE_GAME    | ACL wait complete, proceeding...
fheGameSession.js:258 FHE_GAME    | Allowed reveals: 5
fheGameSession.js:268 FHE_GAME    | Got 5 handles
fheGameSession.js:650 FHE_GAME    | [DEBUG] Handle[0] type=string raw=0xb6e7578daa243110918db7b18e61cbc4a2be9de13cff0000000000aa36a70200 converted=0xb6e7578daa243110918db7b18e61cbc4a2be9de13cff0000000000aa36a70200
fheGameSession.js:650 FHE_GAME    | [DEBUG] Handle[1] type=string raw=0x3ed807b5739bf00a6cd35921ba1de966200c91dd78ff0000000000aa36a70200 converted=0x3ed807b5739bf00a6cd35921ba1de966200c91dd78ff0000000000aa36a70200
fheGameSession.js:650 FHE_GAME    | [DEBUG] Handle[2] type=string raw=0xc60c40949358d6643f8c06ddfcbc17c77a4ab79295ff0000000000aa36a70200 converted=0xc60c40949358d6643f8c06ddfcbc17c77a4ab79295ff0000000000aa36a70200
fheGameSession.js:650 FHE_GAME    | [DEBUG] Handle[3] type=string raw=0xe9187c82f87fb6a83398360d27fbb92aae518febecff0000000000aa36a70200 converted=0xe9187c82f87fb6a83398360d27fbb92aae518febecff0000000000aa36a70200
fheGameSession.js:650 FHE_GAME    | [DEBUG] Handle[4] type=string raw=0x724e47e19539bf0a730a9d13ce766e30156a9f5d8bff0000000000aa36a70200 converted=0x724e47e19539bf0a730a9d13ce766e30156a9f5d8bff0000000000aa36a70200
fheGameSession.js:654 FHE_GAME    | [DEBUG] All handleStrings: (5) ['0xb6e7578daa243110918db7b18e61cbc4a2be9de13cff0000000000aa36a70200', '0x3ed807b5739bf00a6cd35921ba1de966200c91dd78ff0000000000aa36a70200', '0xc60c40949358d6643f8c06ddfcbc17c77a4ab79295ff0000000000aa36a70200', '0xe9187c82f87fb6a83398360d27fbb92aae518febecff0000000000aa36a70200', '0x724e47e19539bf0a730a9d13ce766e30156a9f5d8bff0000000000aa36a70200']
fheGameSession.js:678 FHE_GAME    | [KMS] Calling publicDecrypt with handles: (5) ['0xb6e7578daa243110918db7b18e61cbc4a2be9de13cff0000000000aa36a70200', '0x3ed807b5739bf00a6cd35921ba1de966200c91dd78ff0000000000aa36a70200', '0xc60c40949358d6643f8c06ddfcbc17c77a4ab79295ff0000000000aa36a70200', '0xe9187c82f87fb6a83398360d27fbb92aae518febecff0000000000aa36a70200', '0x724e47e19539bf0a730a9d13ce766e30156a9f5d8bff0000000000aa36a70200']
fheGameSession.js:682 FHE_GAME    | [KMS] publicDecrypt response: {clearValues: {…}, abiEncodedClearValues: '0x000000000000000000000000000000000000000000000000…000000000000000000000000000000000000000000000004b', decryptionProof: '0x07e12b5d256e28e374c5848d3de044726465f4ed0ccb5681…b4fbc3a69703b4652e6fdd55adccc4363bcce1a0ec751b61c'}
fheGameSession.js:688 FHE_GAME    | [KMS] Handle 0xb6e7578daa243110918db7b18e61cbc4a2be9de13cff0000000000aa36a70200 -> clear value: 226n
fheGameSession.js:688 FHE_GAME    | [KMS] Handle 0x3ed807b5739bf00a6cd35921ba1de966200c91dd78ff0000000000aa36a70200 -> clear value: 94n
fheGameSession.js:688 FHE_GAME    | [KMS] Handle 0xc60c40949358d6643f8c06ddfcbc17c77a4ab79295ff0000000000aa36a70200 -> clear value: 59n
fheGameSession.js:688 FHE_GAME    | [KMS] Handle 0xe9187c82f87fb6a83398360d27fbb92aae518febecff0000000000aa36a70200 -> clear value: 203n
fheGameSession.js:688 FHE_GAME    | [KMS] Handle 0x724e47e19539bf0a730a9d13ce766e30156a9f5d8bff0000000000aa36a70200 -> clear value: 75n
fheGameSession.js:697 FHE_GAME    | [KMS] Decrypt success, clearIndices: (5) [226, 94, 59, 203, 75]
fheGameSession.js:274 FHE_GAME    | Decrypted indices: (5) [226, 94, 59, 203, 75]
fheGameSession.js:589 FHE_GAME    | revealDrawBatch TX sent: 0x722a88f326a0354c981e0b2af52caf73a278ea0e6fe180ad590571d0f6d7e9cb
fheGameSession.js:596 FHE_GAME    | Reveal confirmed
fheGameSession.js:290 FHE_GAME    | === INITIAL HAND READY ===
fheGameSession.js:291 FHE_GAME    | Hand: (5) [19034, 10978, 19027, 10012, 20066]
fheGameSession.js:321 FHE_GAME    | Server notified: fhe_initial_hand_revealed
fheGameSession.js:298 FHE_GAME    | Server response: {"success":true,"verified":true,"revealedCount":5,"cardIndices":[5439,3807,4619,5076,2402]}
fheGameSession.js:300 FHE_GAME    | Server cardIndices: (5) [5439, 3807, 4619, 5076, 2402]
game.js:659 FHE_UI      | [FHE] Hand revealed - cardIds: (5) [19034, 10978, 19027, 10012, 20066]
game.js:660 FHE_UI      | [FHE] Hand revealed - serverCardIndices: (5) [5439, 3807, 4619, 5076, 2402]
game.js:664 FHE_UI      | [FHE] Remaining deck size: 34
game.js:1045 FHE_UI      | [FHE] === _populateFHEHand START ===
game.js:1046 FHE_UI      | [FHE] FHE Card IDs: (5) [19034, 10978, 19027, 10012, 20066]
game.js:1047 FHE_UI      | [FHE] Server cardIndices: (5) [5439, 3807, 4619, 5076, 2402]
game.js:1048 FHE_UI      | [FHE] Card count: 5
game.js:1062 FHE_UI      | [FHE] Current deck hand (should be empty): (6) [null, null, null, null, null, null]
game.js:1063 FHE_UI      | [FHE] fheEnabled on gameSession: true
game.js:1087 FHE_UI      | [FHE] Using SERVER cardIndex: 5439
game.js:1100 FHE_UI      | [FHE] Slot 0: Young Flamewing (ID: 19034, index: 5439)
game.js:1087 FHE_UI      | [FHE] Using SERVER cardIndex: 3807
game.js:1100 FHE_UI      | [FHE] Slot 1: Hailstone Golem (ID: 10978, index: 3807)
game.js:1087 FHE_UI      | [FHE] Using SERVER cardIndex: 4619
game.js:1100 FHE_UI      | [FHE] Slot 2: Primus Shieldmaster (ID: 19027, index: 4619)
game.js:1087 FHE_UI      | [FHE] Using SERVER cardIndex: 5076
game.js:1100 FHE_UI      | [FHE] Slot 3: Saberspine Tiger (ID: 10012, index: 5076)
game.js:1087 FHE_UI      | [FHE] Using SERVER cardIndex: 2402
game.js:1100 FHE_UI      | [FHE] Slot 4: True Strike (ID: 20066, index: 2402)
game.js:1110 FHE_UI      | [FHE] Set FHE deck remaining from blockchain: 34
game.js:1112 FHE_UI      | [FHE] === POPULATE COMPLETE ===
game.js:1113 FHE_UI      | [FHE] Added 5 FHE cards to empty deck
game.js:1117 FHE_UI      | [FHE] Verified hand after populate:
game.js:1120 FHE_UI      | [FHE]   [0] Young Flamewing (ID: 19034)
game.js:1120 FHE_UI      | [FHE]   [1] Hailstone Golem (ID: 10978)
game.js:1120 FHE_UI      | [FHE]   [2] Primus Shieldmaster (ID: 19027)
game.js:1120 FHE_UI      | [FHE]   [3] Saberspine Tiger (ID: 10012)
game.js:1120 FHE_UI      | [FHE]   [4] True Strike (ID: 20066)
game.js:670 FHE_UI      | [FHE] Attempting to hide decrypt state...
game.js:671 FHE_UI      | [FHE] gameLayer exists: true
game.js:672 FHE_UI      | [FHE] bottomDeckLayer exists: true
game.js:674 FHE_UI      | [FHE] Calling hideFHEDecryptState()
GameLayer.js:1224 ENGINE      | GameLayer.showChooseHand
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 1
game.js:812 FHE_UI      | === showSubmitChosenHand FHE CHECK ===
game.js:813 FHE_UI      | [FHE] mulliganIndices: []
game.js:814 FHE_UI      | [FHE] fheEnabled: true
game.js:815 FHE_UI      | [FHE] isDeveloperMode: false
game.js:819 FHE_UI      | [FHE] FHE MODE detected
game.js:827 FHE_UI      | [FHE] isSinglePlayerGame: true
game.js:828 FHE_UI      | [FHE] fheGameSession.gameId: 1765942203719
game.js:832 FHE_UI      | [FHE] SINGLE PLAYER - Skipping contract completeMulligan (already in InProgress state)
game.js:886 UI          | GameLayout.showSubmitChosenHand -> [] submitted? true
GameLayer.js:1276 ENGINE      | GameLayer.showSubmitChosenHand
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._queueStep ->  7258
gameSession.js:1963 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextStep -> 7258 w/ action DrawStartingHandAction
gameSession.js:1978 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startStep ->  7258
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  DrawStartingHandAction 7293
game.js:907 UI          | GameLayout.onDrawStartingHand []
game.js:915 FHE_UI      | === onDrawStartingHand FHE CHECK ===
game.js:916 FHE_UI      | [FHE] fheEnabled: true
game.js:917 FHE_UI      | [FHE] isDeveloperMode: false
game.js:920 FHE_UI      | [FHE] FHE MODE ACTIVE
game.js:930 FHE_UI      | [FHE] isSinglePlayerGame: true
game.js:931 FHE_UI      | [FHE] fheGameSession.gameId: 1765942203719
game.js:932 FHE_UI      | [FHE] hasValidGameId: true
game.js:937 FHE_UI      | [FHE] Cards already populated in showNextStepInGameSetup, skipping re-populate
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:980 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS.setStatus - from new to active
gameSession.js:2476 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._endStep 7258
GameLayer.js:1292 ENGINE      | GameLayer.showDrawStartingHand
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(17), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action DrawStartingHandAction {type: 'DrawStartingHandAction', ownerId: '-Ofum3S3l_5MupHTGsy0', mulliganIndices: Array(0), mulliganedHandCardsData: Array(0), newHandCardsData: Array(0), …}
game.js:564 UI          | GameLayout.showNextStepInGameSetup
game.js:1135 UI          | GameLayout.showActiveGame
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
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 2
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._queueStep ->  7331
gameSession.js:1963 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextStep -> 7331 w/ action PlayCardFromHandAction
gameSession.js:1978 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startStep ->  7331
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  PlayCardFromHandAction 7353
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._endStep 7331
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 3
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(3), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action PlayCardFromHandAction {type: 'PlayCardFromHandAction', ownerId: 'ai', targetPosition: {…}, cardOwnedByGameSession: false, indexOfCardInHand: 0, …}
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
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._queueStep ->  7392
gameSession.js:1963 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextStep -> 7392 w/ action MoveAction
gameSession.js:1978 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startStep ->  7392
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  MoveAction 7437
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._endStep 7392
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action MoveAction {type: 'MoveAction', ownerId: 'ai', sourceIndex: 58, sourcePosition: {…}, targetIndex: 58, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 4
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._queueStep ->  7444
gameSession.js:1963 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextStep -> 7444 w/ action EndTurnAction
gameSession.js:1978 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startStep ->  7444
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  EndTurnAction 7487
gameSession.js:1578 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS.p_endTurn -> turn count: 0
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  DrawCardAction 7578
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._endStep 7444
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._queueStep ->  7601
gameSession.js:1963 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextStep -> 7601 w/ action StartTurnAction
gameSession.js:1978 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startStep ->  7601
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  StartTurnAction 7657
gameSession.js:1602 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextTurn
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._endStep 7601
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(2), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action EndTurnAction {type: 'EndTurnAction', ownerId: 'ai', index: 7487, timestamp: 1765942302156, subActionsOrderedByEventType: Array(1), …}
GameLayer.js:1700 ENGINE      | GameLayer.showEndTurn
GameLayer.js:1727 ENGINE      | GameLayer.afterShowEndTurn
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
application.js:2736 APPLICATIO  | App:onAfterShowEndTurn
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action StartTurnAction {type: 'StartTurnAction', ownerId: '-Ofum3S3l_5MupHTGsy0', isAutomatic: true, index: 7657, timestamp: 1765942302165, …}
GameLayer.js:1742 ENGINE      | GameLayer.showStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
GameLayer.js:1860 ENGINE      | GameLayer.afterShowStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6


networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 6
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._queueStep ->  7704
gameSession.js:1963 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextStep -> 7704 w/ action EndTurnAction
gameSession.js:1978 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startStep ->  7704
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  EndTurnAction 7749
gameSession.js:1578 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS.p_endTurn -> turn count: 1
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  DrawCardAction 7845
drawCardAction.js:39 SDK         | [FHE] DrawCardAction: Skipping for FHE player (deck from blockchain)
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._endStep 7704
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._queueStep ->  7935
gameSession.js:1963 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextStep -> 7935 w/ action StartTurnAction
gameSession.js:1978 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startStep ->  7935
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  StartTurnAction 7976
gameSession.js:1602 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextTurn
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._endStep 7935
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(2), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action EndTurnAction {type: 'EndTurnAction', ownerId: '-Ofum3S3l_5MupHTGsy0', index: 7749, timestamp: 1765942331237, subActionsOrderedByEventType: Array(1), …}
GameLayer.js:1700 ENGINE      | GameLayer.showEndTurn
GameLayer.js:1727 ENGINE      | GameLayer.afterShowEndTurn
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
application.js:2736 APPLICATIO  | App:onAfterShowEndTurn
game.js:415 FHE         | [DRAW] DrawCardAction detected for my player (count: 1)
fheGameSession.js:403 FHE_GAME    | === REVEAL DRAW CARD ===
fheGameSession.js:355 FHE_GAME    | Incrementing turn...
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action StartTurnAction {type: 'StartTurnAction', ownerId: 'ai', isAutomatic: true, index: 7976, timestamp: 1765942331243, …}
GameLayer.js:1742 ENGINE      | GameLayer.showStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
fheGameSession.js:366 FHE_GAME    | incrementTurn TX sent: 0x74076b7da414f3e04916ea96a745d6857ab7f1cfd57c67ea7fc0066933b1d317
GameLayer.js:1860 ENGINE      | GameLayer.afterShowStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
fheGameSession.js:376 FHE_GAME    | Turn incremented to: 1
fheGameSession.js:412 FHE_GAME    | Got handle for new card
fheGameSession.js:650 FHE_GAME    | [DEBUG] Handle[0] type=string raw=0x665a76d402ca2320467fc0603b2c5930f9e58d78b1ff0000000000aa36a70200 converted=0x665a76d402ca2320467fc0603b2c5930f9e58d78b1ff0000000000aa36a70200
fheGameSession.js:654 FHE_GAME    | [DEBUG] All handleStrings: ['0x665a76d402ca2320467fc0603b2c5930f9e58d78b1ff0000000000aa36a70200']
fheGameSession.js:678 FHE_GAME    | [KMS] Calling publicDecrypt with handles: ['0x665a76d402ca2320467fc0603b2c5930f9e58d78b1ff0000000000aa36a70200']
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8



fheGameSession.js:589 FHE_GAME    | revealDrawBatch TX sent: 0xc26570a28913ab07d776949ca7640059b2a18bf73032882b0eb4815f3aa2a63c
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
vendor.js:24369 cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from 73 to 98.
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
fheGameSession.js:596 FHE_GAME    | Reveal confirmed
fheGameSession.js:442 FHE_GAME    | === CARD DRAWN ===
fheGameSession.js:443 FHE_GAME    | Card ID: 11031
fheGameSession.js:444 FHE_GAME    | Hand size: 6
fheGameSession.js:445 FHE_GAME    | Deck remaining: 33
fheGameSession.js:454 FHE_GAME    | Server notified: fhe_card_drawn
fheGameSession.js:458 FHE_GAME    | Server response: {"success":true,"turn":1,"cardId":11031,"cardIndex":5864,"burned":false}
game.js:428 FHE         | [DRAW] FHE card drawn: 11031 index: 5864
game.js:960 FHE_UI      | [FHE] === _addFHECardToHand START ===
game.js:961 FHE_UI      | [FHE] Card ID: 11031 Server cardIndex: 5864
game.js:1008 FHE_UI      | [FHE] Using cardIndex: 5864 (from server: true )
game.js:1022 FHE_UI      | [FHE] Deck remaining: 33
game.js:1029 FHE_UI      | [FHE] Called bindCardNodeAtIndex for slot: 5
game.js:1032 FHE_UI      | [FHE] Added Necroseer (ID: 11031, index: 5864) to slot 5
game.js:1033 FHE_UI      | [FHE] === _addFHECardToHand COMPLETE ===
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_select; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_hover; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 8
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._queueStep ->  8091
gameSession.js:1963 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextStep -> 8091 w/ action MoveAction
gameSession.js:1978 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startStep ->  8091
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  MoveAction 8179
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._endStep 8091
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action MoveAction {type: 'MoveAction', ownerId: 'ai', sourceIndex: 58, sourcePosition: {…}, targetIndex: 58, …}
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 9
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 9
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 9
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 9
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 9
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> network_game_mouse_clear; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> step; step count undefined
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._queueStep ->  8261
gameSession.js:1963 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextStep -> 8261 w/ action EndTurnAction
gameSession.js:1978 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startStep ->  8261
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  EndTurnAction 8361
gameSession.js:1578 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS.p_endTurn -> turn count: 2
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  DrawCardAction 8384
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._endStep 8261
application.js:2331 APPLICATIO  | App._onNetworkGameEvent -> step {type: 'step', step: {…}}
gameSession.js:1945 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._queueStep ->  8458
gameSession.js:1963 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextStep -> 8458 w/ action StartTurnAction
gameSession.js:1978 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startStep ->  8458
gameSession.js:2041 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._executeActionForStep ->  StartTurnAction 8459
gameSession.js:1602 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._startNextTurn
gameSession.js:2397 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GameSession.p_resolveStep
gameSession.js:2476 SDK         | [G:-OgeLw9GyUqFOPOdmrwP] GS._endStep 8458
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(2), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action EndTurnAction {type: 'EndTurnAction', ownerId: 'ai', index: 8361, timestamp: 1765942381686, subActionsOrderedByEventType: Array(1), …}
GameLayer.js:1700 ENGINE      | GameLayer.showEndTurn
GameLayer.js:1727 ENGINE      | GameLayer.afterShowEndTurn
GameLayer.js:1417 ENGINE      | GameLayer.resetActiveState
application.js:2736 APPLICATIO  | App:onAfterShowEndTurn
GameLayer.js:2180 ENGINE      |  -> showNextStep interface SdkStepInterface {_sdkStep: Step, actionsEndingGame: null, actionInterfaceSequence: Array(1), hasShownHandFullForPlayerIds: Array(0), hasShownOutOfCardsForPlayerIds: Array(0), …} with action StartTurnAction {type: 'StartTurnAction', ownerId: '-Ofum3S3l_5MupHTGsy0', isAutomatic: true, index: 8459, timestamp: 1765942381691, …}
GameLayer.js:1742 ENGINE      | GameLayer.showStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
GameLayer.js:1860 ENGINE      | GameLayer.afterShowStartTurn
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
networkManager.js:184 IO          | NetworkManager::IO:network_game_event -> turn_time; step count 11
