normal fhe olmayan modda oynuyorum hiçbir problem yok
ilk başta 5 kart var ( 2 tanesi replace edilebilir ister et ister etme )
sonra continue basıyorum kartlar aşağya oturuyor 6 slot var 
az önceki 5 tane kart ( 2 tanesi replace edilmiş veya edilmemiş ) 6 slota oturuyor 1 slot boş
end turn diyince her zaman bir slot doluyor ( full dolu değilse )
deckdeki rakam sürekli azalıyor slot doldukça

bu akışı 1_GAME_START_NORMAL.md 2_END_TURN_ACTION_NORMAL.md de takip edeceksin.

ilk başta decrypt ediyoruz 5 kartı.
continue diyoruz kartlar alta yerleşiyor
sonra end turn diyince yeni kart gelmiyor 

bizim FHE de session ile ilerleyerek. 


NORMAL AKIŞ - Başlangıç eli (5 kart):

1. 6 slot tanımı: app/common/config.js içinde CONFIG.MAX_HAND_SIZE = 6 olarak tanımlı.
2. 5 kartın yerleştirilmesi: DrawStartingHandAction çalıştığında, her kart için PutCardInHandAction tetikleniyor. Bu action deck.putCardIndexInHand(cardIndex) çağırıyor (deck.js line 332-347).
3. putCardIndexInHand fonksiyonu: deck.hand array'inde ilk boş slotu (null) buluyor ve kartı oraya koyuyor:
   for (let i = 0; i < CONFIG.MAX_HAND_SIZE; i++) {
   if (this.hand[i] == null) {
   this.hand[i] = cardIndex;
   indexOfCardInHand = i;
   break;
   }
   }

4. Sonuç:

- deck.hand = [cardIndex0, cardIndex1, cardIndex2, cardIndex3, cardIndex4, null]
- 5 kart dolu, 6. slot (index 5) boş



Normal Akış - 6. Slot Dolumu (End Turn)

OYUNCU END TURN BASILAR
│
▼
┌─────────────────────────────────────────────────────────┐
│ 1. EndTurnAction tetiklenir                             │
│    server/lib/create_single_player_game.coffee          │
│    -> GameSession.executeAction(endTurnAction)          │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 2. Turn değişir, StartTurnAction oluşur                 │
│    app/sdk/gameSession.js - executeAction()             │
│    -> Turn sayısı +1                                    │
│    -> Aktif oyuncu değişir                              │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 3. DrawCardAction sub-action olarak çalışır             │
│    app/sdk/actions/startTurnAction.js içinde            │
│    -> var drawCardAction = new DrawCardAction()         │
│    -> gameSession.executeAction(drawCardAction)         │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 4. DrawCardAction._execute() çalışır                    │
│    app/sdk/actions/drawCardAction.js:28-76              │
│                                                         │
│    const drawPile = deck.getDrawPile();                 │
│    index = randomIntegerForExecution(drawPile.length);  │
│    this.cardDataOrIndex = drawPile[index];              │
│                                                         │
│    -> Desteden random bir kart seçilir                  │
│    -> cardDataOrIndex = seçilen kartın index'i          │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 5. super._execute() çağrılır (PutCardInHandAction)      │
│    app/sdk/actions/putCardInHandAction.js               │
│                                                         │
│    -> gameSession.applyCardToHand()                     │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 6. applyCardToHand() çalışır                            │
│    app/sdk/gameSession.js                               │
│                                                         │
│    -> deck.putCardIndexInHand(cardIndex)                │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 7. deck.putCardIndexInHand(cardIndex) çalışır           │
│    app/sdk/cards/deck.js:332-347                        │
│                                                         │
│    for (var i = 0; i < this.hand.length; i++) {         │
│      if (this.hand[i] == null) {     // BOŞ SLOT BUL    │
│        this.hand[i] = cardIndex;     // KARTI YERLEŞTIR │
│        this._indexesInHand.push(cardIndex);             │
│        this._cachedCardsInHand = null;                  │
│        return true;                                     │
│      }                                                  │
│    }                                                    │
│                                                         │
│    -> hand[5] = cardIndex (6. slot dolar)               │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 8. UI GÜNCELLEME - GameLayer._showAction()             │
│    app/view/layers/game/GameLayer.js:3587-3649         │
│                                                         │
│    if (action instanceof SDK.PutCardInHandAction) {    │
│      ...                                                │
│      this.bottomDeckLayer.showDrawCard(action);        │
│    }                                                    │
│                                                         │
│    -> Action PutCardInHandAction ise                   │
│    -> bottomDeckLayer.showDrawCard(action) çağrılır    │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 9. bottomDeckLayer.showDrawCard(action) çalışır        │
│    app/view/layers/game/BottomDeckLayer.js:438-455     │
│                                                         │
│    const indexOfCardInHand = action.getIndexOfCardInHand();│
│    const cardNode = this.cardNodes[indexOfCardInHand]; │
│    if (cardNode instanceof BottomDeckCardNode) {       │
│      showDuration = cardNode.showDraw(indexOfCardInHand);│
│    }                                                    │
│                                                         │
│    -> Action'dan kart slotunu alır                     │
│    -> İlgili cardNode'u bulur                          │
│    -> cardNode.showDraw() ile UI'da kartı gösterir     │
└─────────────────────────────────────────────────────────┘

Özet: Normal akışta DrawCardAction → super._execute() → applyCardToHand() → deck.putCardIndexInHand() zinciri SDK'nın deck.hand array'ini güncelliyor.


================================================================================
Normal Akış - Kart Oynama (Board'a Koyma + Elden Eksilme)
================================================================================

OYUNCU ELDEN KART SEÇER VE BOARD'A SÜRÜKLER
│
▼
┌─────────────────────────────────────────────────────────┐
│ 10. PlayCardFromHandAction oluşturulur                  │
│     app/view/layers/game/GameLayer.js:6411-6418         │
│                                                         │
│     actionToExecute = new SDK.PlayCardFromHandAction(   │
│       gameSession, ownerId, x, y, handIndex             │
│     );                                                  │
│     SDK.GameSession.getInstance().submitExplicitAction( │
│       actionToExecute                                   │
│     );                                                  │
│                                                         │
│     -> Oyuncu kartı board'a sürüklediğinde              │
│     -> handIndex = eldeki slot indexi (0-5)             │
│     -> x, y = board koordinatları                       │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 11. UI'da kart unbind edilir (event-based)              │
│     app/view/layers/game/GameLayer.js:1107-1109         │
│                                                         │
│     } else if (myAction && (action instanceof           │
│       SDK.PlayCardFromHandAction || ...)) {             │
│       this.bottomDeckLayer.unbindCardNodeAtIndex(       │
│         action.getIndexOfCardInHand()                   │
│       );                                                │
│     }                                                   │
│                                                         │
│     -> _onGameEvent içinde action execute sonrası       │
│     -> Kart UI'dan kaldırılır                           │
│                                                         │
│     NOT: Line 6416-6418'deki "client prediction" kodu   │
│     sadece multiplayer (!getIsRunningAsAuthoritative)   │
│     modda çalışır. Single player'da bu event-based      │
│     unbind kullanılır.                                  │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 12. PlayCardFromHandAction._execute() çalışır           │
│     app/sdk/actions/playCardFromHandAction.js:87-111    │
│                                                         │
│     this.cardDataOrIndex = this.getOwner().getDeck()    │
│       .getCardIndexInHandAtIndex(this.indexOfCardInHand);│
│                                                         │
│     super._execute(); // PlayCardAction._execute()      │
│                                                         │
│     -> Eldeki kart index'ini alır                       │
│     -> Parent class'ın _execute()'unu çağırır           │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 13. PlayCardAction -> ApplyCardToBoardAction._execute() │
│     app/sdk/actions/applyCardToBoardAction.js:127-165   │
│                                                         │
│     this.isValidApplication = this.getGameSession()     │
│       .applyCardToBoard(card, x, y, cardDataOrIndex,    │
│         this);                                          │
│                                                         │
│     -> Kartı board'a uygula                             │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 14. gameSession.applyCardToBoard() çalışır              │
│     app/sdk/gameSession.js:3550-3644                    │
│                                                         │
│     // Kartı mevcut konumundan kaldır (ELDEN)           │
│     this._removeCardFromCurrentLocation(card, cardIndex,│
│       sourceAction);                                    │
│                                                         │
│     // Board'a ekle                                     │
│     this.board.addCard(card);                           │
│                                                         │
│     // Kartı board'a uygula                             │
│     card.onApplyToBoard(this.board, x, y, sourceAction);│
│                                                         │
│     -> Kart önce elden kaldırılır                       │
│     -> Sonra board'a eklenir                            │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 15. _removeCardFromCurrentLocation() çalışır            │
│     app/sdk/gameSession.js:3204-3242                    │
│                                                         │
│     if (card.getIsLocatedInHand()) {                    │
│       indexRemoved = this.removeCardByIndexFromHand(    │
│         owner.getDeck(), cardIndex, card, sourceAction  │
│       );                                                │
│     }                                                   │
│                                                         │
│     -> Kart elde ise removeCardByIndexFromHand çağrılır │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 16. removeCardByIndexFromHand() çalışır                 │
│     app/sdk/gameSession.js:3419-3446                    │
│                                                         │
│     indexOfCardInHand = deck.removeCardIndexFromHand(   │
│       cardIndex                                         │
│     );                                                  │
│                                                         │
│     if (indexOfCardInHand != null) {                    │
│       card.onRemoveFromHand(deck, sourceAction);        │
│     }                                                   │
│                                                         │
│     -> Deck'in removeCardIndexFromHand fonksiyonu       │
│     -> Kart elden kaldırıldı callback                   │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 17. deck.removeCardIndexFromHand() çalışır              │
│     app/sdk/cards/deck.js:396-410                       │
│                                                         │
│     for (let i = 0; i < this.hand.length; i++) {        │
│       var existingCardIndex = this.hand[i];             │
│       if (existingCardIndex === cardIndex) {            │
│         indexOfCard = i;                                │
│         this.hand[i] = null;  // SLOT BOSALTILDI        │
│         this.flushCachedCardsInHand();                  │
│         break;                                          │
│       }                                                 │
│     }                                                   │
│                                                         │
│     -> hand[slot] = null yaparak slotu boşaltır         │
│     -> Cache temizlenir                                 │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 18. UI GÜNCELLEME - GameLayer._showAction()             │
│     app/view/layers/game/GameLayer.js:1025-1029         │
│                                                         │
│     if (action instanceof SDK.PlayCardFromHandAction) { │
│       this.bottomDeckLayer.bindHand();                  │
│     }                                                   │
│                                                         │
│     -> Tüm el yeniden bind edilir                       │
│     -> Boşalan slot UI'da güncellenir                   │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ 19. Board UI güncellenir                                │
│     app/view/layers/game/GameLayer.js:3201-3210         │
│                                                         │
│     if (action instanceof SDK.PlayCardFromHandAction) { │
│       // Kartı göster ve delay ekle                     │
│       this.showPlayCard(action, animateDuration,        │
│         showDuration);                                  │
│     }                                                   │
│                                                         │
│     -> Kart board'da gösterilir                         │
│     -> Animasyon oynatılır                              │
└─────────────────────────────────────────────────────────┘

Özet: PlayCardFromHandAction → ApplyCardToBoardAction._execute() →
      applyCardToBoard() → _removeCardFromCurrentLocation() →
      removeCardByIndexFromHand() → deck.removeCardIndexFromHand()
      zinciri kartı elden kaldırıp board'a ekliyor.

EL DURUMU DEĞİŞİMİ:
Önce:  deck.hand = [card0, card1, card2, card3, card4, card5]
                           ^
                           Bu kart oynandı (index 1)
Sonra: deck.hand = [card0, null, card2, card3, card4, card5]
                           ^
                           Slot boşaldı (null)


