  ---
AŞAMA 1: Oyun Oluşturma

1. CLIENT: "Single Player Başlat" butonuna basar

2. SERVER: Game session oluşturur
   → gameId = uuid()
   → playerDeck = database'den 40 kartlık deste
   → Deck sırasını hafızada tutar

3. SERVER → CLIENT:
   → gameId
   → playerDeck (sıralı liste)
   → "Oyunu contract'ta oluştur"

4. CLIENT: Deck bilgisini SAKLAR (kendi hesaplaması için)

5. CLIENT → CONTRACT: createSinglePlayerGame(gameId)
   → 1 TX (session wallet)

6. CONTRACT:
   → game.player = msg.sender
   → 40 adet FHE.randEuint8() üretir
   → drawIndices[0..39] = [enc(r0), enc(r1), ..., enc(r39)]
   → revealedCount = 0
   → currentTurn = 0
   → emit GameCreated(gameId)

   [40 şifreli random üretildi - kimse bilmiyor]

  ---
AŞAMA 2: İlk El (5 Kart)

7. CLIENT: getAllowedReveals(gameId) → 5
   → 5 kart çekme hakkı var

8. CLIENT: getDrawHandles(gameId, 5)
   → [handle[0], handle[1], handle[2], handle[3], handle[4]]

9. CLIENT: SDK.publicDecrypt([h0, h1, h2, h3, h4])
   → KMS decrypt eder
   → clearIndices = [17, 3, 29, 8, 12]
   → proof = KMS imzası

10. CLIENT: clearIndices'i SAKLAR

11. CLIENT → CONTRACT: revealDrawBatch(gameId, [17, 3, 29, 8, 12], proof)
    → 1 TX
    → FHE.checkSignatures() ✓
    → revealedValues = [17, 3, 29, 8, 12]
    → revealedCount = 5
    → emit DrawRevealed(gameId, 5)

12. CLIENT: Kendi kartlarını hesaplar
    ┌─────────────────────────────────────────────────────┐
    │ var myDeck = [...];  // adım 4'te sakladığı        │
    │ var remaining = [...myDeck];                        │
    │ var myHand = [];                                    │
    │                                                     │
    │ clearIndices.forEach(function(idx) {               │
    │     var pos = idx % remaining.length;               │
    │     myHand.push(remaining[pos]);                    │
    │     remaining.splice(pos, 1);                       │
    │ });                                                 │
    │                                                     │
    │ this.myHand = myHand;           // 5 kart          │
    │ this.remainingDeck = remaining;  // 35 kart        │
    └─────────────────────────────────────────────────────┘

13. CLIENT: UI'da myHand kartlarını gösterir

14. CLIENT → SERVER: "Reveal tamamlandı"

15. SERVER: getVerifiedDrawOrder(gameId) çağırır (VIEW)
    → [17, 3, 29, 8, 12]

16. SERVER: Kendi hesaplar (game state için)
    → Aynı algoritma ile serverHand hesaplar
    → game.playerHand = serverHand
    → game.remainingDeck = remaining (35 kart)

17. SERVER → CLIENT: "Oyun başladı, senin turn'ün"

  ---
AŞAMA 3: Oyun Döngüsü (Normal Gameplay)

18. CLIENT: Hamle yapar
    → Kart oynar
    → Minion hareket ettirir
    → Saldırı yapar

19. CLIENT → SERVER: Action gönderir
    → "PlayCardAction: kartX, pozisyon Y"

20. SERVER: Validate eder
    → Kart elde var mı? (kendi hesabıyla kontrol)
    → Mana yeterli mi?
    → Pozisyon valid mi?

21. SERVER: Action işler
    → Game state günceller
    → AI response hesaplar (varsa)

22. SERVER → CLIENT: Action sonucu
    → State güncellemesi

23. CLIENT: UI günceller

24. (Adım 18-23 tekrar - turn boyunca)

  ---
AŞAMA 4: Turn Sonu + Kart Çekme

25. CLIENT: "End Turn" butonuna basar

26. CLIENT → SERVER: EndTurnAction

27. SERVER: Player turn'ünü bitirir
    → AI turn'ünü oynar
    → AI hamlelerini client'a gönderir

28. SERVER → CLIENT:
    → AI hamle sonuçları
    → "Turn bitti, kart çek"

29. CLIENT → CONTRACT: incrementTurn(gameId)
    → 1 TX

30. CONTRACT:
    ┌─────────────────────────────────────────────────────┐
    │ function incrementTurn(gameId) {                    │
    │     require(msg.sender == game.player);             │
    │                                                     │
    │     // Mevcut reveal'lar tamamlanmış olmalı        │
    │     uint8 allowed = getAllowedReveals(gameId);      │
    │     require(revealedCount == allowed, "Reveal!");   │
    │                                                     │
    │     currentTurn++;                                  │
    │     emit TurnIncremented(gameId, currentTurn);      │
    │ }                                                   │
    └─────────────────────────────────────────────────────┘
    → currentTurn = 1
    → allowedReveals = 5 + 1 = 6

31. CLIENT: getDrawHandles(gameId, 1)
    → revealedCount=5, allowed=6 → 5 < 6 ✓
    → [handle[5]]

32. CLIENT: SDK.publicDecrypt([handle[5]])
    → clearIndex = 22
    → proof

33. CLIENT: clearIndex'i SAKLAR

34. CLIENT → CONTRACT: revealDrawBatch(gameId, [22], proof)
    → 1 TX
    → verify ✓
    → revealedValues.push(22)
    → revealedCount = 6
    → emit DrawRevealed(gameId, 1)

35. CLIENT: Çektiği kartı hesaplar
    ┌─────────────────────────────────────────────────────┐
    │ var idx = 22;                                       │
    │ var pos = idx % this.remainingDeck.length;          │
    │ var drawnCard = this.remainingDeck[pos];            │
    │ this.remainingDeck.splice(pos, 1);                  │
    │ this.myHand.push(drawnCard);                        │
    └─────────────────────────────────────────────────────┘

36. CLIENT: UI'da yeni kartı ele ekler

37. CLIENT → SERVER: "Kart çekme tamamlandı"

38. SERVER: getVerifiedDrawOrder(gameId) (VIEW)
    → [..., 22] → son index

39. SERVER: Kartı hesaplar
    → game.playerHand.push(drawnCard)
    → game.remainingDeck günceller

40. SERVER: Yeni turn başlatır
    → Adım 18'e dön (CLIENT turn)

  ---
AŞAMA 5: Sonraki Turnlar

Her turn için adım 25-40 tekrarlanır:

Turn 2: incrementTurn → allowedReveals=7 → reveal 1 kart
Turn 3: incrementTurn → allowedReveals=8 → reveal 1 kart
Turn 4: incrementTurn → allowedReveals=9 → reveal 1 kart
...

  ---
AŞAMA 6: Oyun Sonu

41. Bitiş koşulu oluşur
    → General HP = 0
    → Surrender
    → Deck + el boş

42. SERVER: Oyunu sonlandırır
    → Kazanan belirlenir
    → Sonuç database'e kaydedilir

43. SERVER → CLIENT: Sonuç

44. CLIENT: GG ekranı gösterir

  ---
TX ÖZETİ

| Adım | İşlem                    | Kim    | TX  |
  |------|--------------------------|--------|-----|
| 5    | createSinglePlayerGame   | CLIENT | 1   |
| 11   | revealDrawBatch (5 kart) | CLIENT | 1   |
| 29   | incrementTurn            | CLIENT | 1   |
| 34   | revealDrawBatch (1 kart) | CLIENT | 1   |
| ...  | her turn 2 TX            | CLIENT | 2   |

10 Turn Oyun:
= 1 (create) + 1 (ilk el) + 10×2 (increment + reveal)
= 22 TX

Hepsi CLIENT'tan. Server 0 TX.

  ---
VIEW CALL ÖZETİ

| Fonksiyon            | Kim Çağırır   |
  |----------------------|---------------|
| getAllowedReveals    | Client        |
| getDrawHandles       | Client        |
| getVerifiedDrawOrder | Server        |
| getRevealedCount     | Client/Server |

  ---
GÜVENLİK ÖZETİ

┌─────────────────────────────────────────────────────────────┐
│ RANDOM         │ FHE.rand() - manipüle edilemez            │
├────────────────┼────────────────────────────────────────────┤
│ DECRYPT        │ Sadece KMS yapabilir                      │
├────────────────┼────────────────────────────────────────────┤
│ PROOF          │ Sahte index gönderilemiyor                │
├────────────────┼────────────────────────────────────────────┤
│ INCREMENT      │ Reveal tamamlanmadan artırılamıyor        │
├────────────────┼────────────────────────────────────────────┤
│ CLIENT         │ Kendi hesaplıyor, server'a güvenmiyor     │
├────────────────┼────────────────────────────────────────────┤
│ SERVER         │ Contract'tan okuyor, client'a güvenmiyor  │
├────────────────┼────────────────────────────────────────────┤
│ SERVER TX      │ YOK - Sadece VIEW call                    │
└────────────────┴────────────────────────────────────────────┘

  ---
CONTRACT FONKSİYONLARI

// TX (Client çağırır)
createSinglePlayerGame(gameId)      // 40 FHE.rand üret
incrementTurn(gameId)               // Turn artır (reveal sonrası)
revealDrawBatch(gameId, indices, proof)  // Batch reveal

// VIEW (Herkes çağırabilir)
getAllowedReveals(gameId) → uint8
getDrawHandles(gameId, count) → euint8[]
getVerifiedDrawOrder(gameId) → uint8[]
getRevealedCount(gameId) → uint8
getCurrentTurn(gameId) → uint8