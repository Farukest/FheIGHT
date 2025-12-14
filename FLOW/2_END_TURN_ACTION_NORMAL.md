# END TURN ACTION - Normal Mod Akışı

## FLOWCHART

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           END TURN BUTONU                                    │
│                    game_bottom_bar.js:142                                    │
│         onClickSubmitTurn() → gameSession.submitExplicitAction()             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EndTurnAction._execute()                             │
│                         endTurnAction.js:28                                  │
│                                                                              │
│  Ne yapıyor: Sadece p_endTurn() çağırıyor, başka hiçbir şey yapmıyor        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         gameSession.p_endTurn()                              │
│                         gameSession.js:1576                                  │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. currentTurn.setEnded(true)  → Turu "bitti" olarak işaretle            │
│    2. turns.push(currentTurn)     → Tur stack'e ekle                        │
│    3. pushEvent(EVENTS.end_turn)  → Event yayınla                           │
│                                                                              │
│  ⚠️  HAND/DECK DEĞİŞMİYOR - Sadece tur state güncellemesi                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [ACTION QUEUE BOŞALANA KADAR BEKLE]                       │
│                                                                              │
│  Ne oluyor: Başka action'lar varsa önce onlar tamamlanır                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              gameSession._onExecuteQueueAction()                             │
│              gameSession.js:2173-2186                                        │
│                                                                              │
│  Kontrol: getCurrentTurn().getEnded() && !hasDrawnCardsForTurn ?            │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. hasDrawnCardsForTurn = true                                           │
│    2. deck.actionsDrawNewCards() çağır → DrawCardAction array'i al          │
│    3. Her DrawCardAction için executeAction() çağır                         │
│                                                                              │
│  🎯 FHE HOOK NOKTASI - Kart çekme burada tetikleniyor                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    deck.actionsDrawNewCards()                                │
│                    deck.js:271                                               │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. Kaç kart çekilecek hesapla (default: 1, modifier'lar değiştirebilir) │
│    2. Elde boş slot bul                                                     │
│    3. Her boş slot için DrawCardAction oluştur                              │
│    4. actions[] array'i döndür                                              │
│                                                                              │
│  ⚠️  HENÜZ KART ÇEKİLMİYOR - Sadece action oluşturuluyor                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DrawCardAction._execute()                                 │
│                    drawCardAction.js:28                                      │
│                    (extends PutCardInHandAction)                             │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. drawPile = deck.getDrawPile()  → Mevcut deste array'i                 │
│    2. Kart index'i belirle:                                                 │
│       - cardIndexFromDeck varsa → onu kullan (spell efekti vs.)            │
│       - Developer mode → son kart (deterministik)                           │
│       - Normal → random index                                               │
│    3. cardDataOrIndex = drawPile[index]                                     │
│    4. Deck boşsa → HurtingDamageAction (fatigue damage)                     │
│    5. super._execute() çağır (PutCardInHandAction)                          │
│                                                                              │
│  📍 Şu an FHE için: isAiPlayer değilse skip ediliyor (fheSkipped = true)    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PutCardInHandAction._execute()                            │
│                    putCardInHandAction.js:100                                │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. card = getCard()  → cardDataOrIndex'ten Card objesi oluştur          │
│    2. gameSession.applyCardToHand() çağır                                   │
│                                                                              │
│  ⚠️  Asıl iş applyCardToHand'de                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    gameSession.applyCardToHand()                             │
│                    gameSession.js:3338                                       │
│                                                                              │
│  Ne yapıyor:                                                                 │
│    1. _indexCardAsNeeded()                → Kartı indexle                   │
│    2. _removeCardFromCurrentLocation()    → Eski yerden çıkar (deck'ten)   │
│    3. deck.putCardIndexInHand()           → Hand'e ekle                     │
│    4. card.onApplyToHand() event          → Kart event'i tetikle           │
│                                                                              │
│  ✅ DECK VE HAND BURADA DEĞİŞİYOR                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│ _removeCardFromCurrentLocation()│  │ deck.putCardIndexInHand()       │
│ gameSession.js:3204             │  │ deck.js:332                     │
│                                 │  │                                 │
│ Ne yapıyor:                     │  │ Ne yapıyor:                     │
│   card.getIsLocatedInDeck() ?   │  │   İlk boş slot bul              │
│   → removeCardByIndexFromDeck() │  │   hand[slot] = cardIndex        │
│                                 │  │   flushCachedCardsInHand()      │
│         │                       │  │                                 │
│         ▼                       │  │ ✅ HAND DEĞİŞTİ                 │
│ deck.removeCardIndexFromDeck()  │  └─────────────────────────────────┘
│ deck.js:372                     │
│                                 │
│ Ne yapıyor:                     │
│   drawPile.splice(i, 1)         │
│   flushCachedCards()            │
│                                 │
│ ✅ DECK DEĞİŞTİ                 │
└─────────────────────────────────┘

```

---

## ÖZET TABLO

| Sıra | Dosya:Satır | Fonksiyon | Ne Yapıyor | Deck/Hand Değişir? |
|------|-------------|-----------|------------|-------------------|
| 1 | game_bottom_bar.js:142 | onClickSubmitTurn() | Butona tıklama, action gönder | ❌ |
| 2 | endTurnAction.js:28 | _execute() | p_endTurn() çağır | ❌ |
| 3 | gameSession.js:1576 | p_endTurn() | Tur state güncelle, event yayınla | ❌ |
| 4 | gameSession.js:2173 | _onExecuteQueueAction() | Kart çekme tetikle | ❌ |
| 5 | deck.js:271 | actionsDrawNewCards() | DrawCardAction oluştur | ❌ |
| 6 | drawCardAction.js:28 | _execute() | Hangi kart çekilecek belirle | ❌ |
| 7 | putCardInHandAction.js:100 | _execute() | applyCardToHand çağır | ❌ |
| 8 | gameSession.js:3338 | applyCardToHand() | Orchestration | ✅ |
| 9 | deck.js:372 | removeCardIndexFromDeck() | drawPile.splice() | ✅ DECK |
| 10 | deck.js:332 | putCardIndexInHand() | hand[slot] = cardIndex | ✅ HAND |

---

## VERİ YAPILARI

### deck.drawPile
```javascript
// Kart INDEX'lerinin array'i (Card objeleri DEĞİL)
drawPile = [42, 15, 78, 23, ...]  // cardIndex'ler

// Kart çekilince:
drawPile.splice(i, 1)  // i. index'i çıkar
```

### deck.hand
```javascript
// Sabit boyutlu array (6 slot), null = boş
hand = [42, null, 15, 78, null, 23]
hand.length = 6  // HER ZAMAN 6

// Kart eklenince:
hand[firstNullSlot] = cardIndex
```

### cardIndex vs cardId
```
cardIndex = GameSession içindeki unique ID (runtime)
cardId    = Kart tipi (örn: 10101 = SilverguardKnight)

gameSession.getCardByIndex(cardIndex) → Card objesi
card.getId() → cardId (10101)
```

---

## FHE ENTEGRASYON NOKTASI

**Şu anki durum:** `DrawCardAction._execute()` içinde FHE player için skip ediliyor

**Yapılması gereken:**
```
DrawCardAction._execute() tetiklendiğinde:
  1. Contract'tan deck[deckIndex] handle'ı oku (view call - gas yok)
  2. userDecrypt() ile kartı aç
  3. SDK deck/hand'e ekle (local)
  4. local deckIndex++
```

**Session Key ile TX:**
```
Eğer contract state güncellenecekse:
  - Session key ile drawCard() TX at (popup yok)
  - Contract: hand'e ekle, deckIndex++
  - Frontend: decrypt et, UI güncelle
```
