# GAME-FLOW - Oyun Akisi ve Single Player

## SINGLE PLAYER TETIKLEME ZINCIRI

```
UI: deck_select_single_player.js:200
  -> EventBus.trigger(EVENTS.start_single_player, ...)

application.js:1802 _startSinglePlayerGame()
  -> CONFIG.fheEnabled kontrol
     ├─> TRUE:  _startSinglePlayerGameFHE()
     └─> FALSE: Normal akis

API: POST /api/me/games/single_player
  -> server/routes/api/me/games.coffee:350

Server: server/lib/create_single_player_game.coffee
  -> GameSession.create()
  -> setIsDeveloperMode()
  -> GameSetup.setupNewSession()
```

---

## API REQUEST BODY

```javascript
{
  deck: [{id: cardId}, ...],      // 40 kart
  cardBackId: number,
  battleMapId: number,
  hasPremiumBattleMaps: boolean,
  ai_general_id: number,
  ai_difficulty: number|null,
  ai_num_random_cards: number|null,
  ai_username: string,
  isDeveloperMode: boolean,
  // FHE modu icin ek:
  fhe_enabled: true,
  fhe_game_id: gameId,
  fhe_contract_address: address,
  fhe_player_wallet: walletAddress
}
```

---

## DEVELOPER MODE

**Nerede ayarlanir:**
- Settings UI: `app/ui/views/item/settings_menu.js:401`
- Config: `app/common/config.js:1387` (default: false)

**Ne yapar:**
- `getAreDecksRandomized()` -> false doner
- Kart cekimi DETERMINISTIK olur (test icin)

---

## DECK RANDOMIZATION

`app/sdk/gameSetup.js:198-206`

```javascript
if (gameSession.getAreDecksRandomized()) {
  index = Math.floor(Math.random() * length);  // RANDOM
} else {
  index = playerCardsData.length - 1;          // DETERMINISTIK
}
```

---

## ONEMLI DOSYALAR

| Dosya | Satir | Aciklama |
|-------|-------|----------|
| deck_select_single_player.js | 200 | Event trigger |
| application.js | 1802 | _startSinglePlayerGame |
| application.js | 1897 | _startSinglePlayerGameFHE |
| server/validators/index.js | 81-91 | singlePlayerInput |
| games.coffee | 350-430 | POST handler |
| create_single_player_game.coffee | 157-162 | setIsDeveloperMode |
| gameSetup.js | 198-206 | Deck randomization |
| gameSession.js | 1060-1062 | getAreDecksRandomized |

---

## KONTROL LISTESI

Yeni parametre eklerken:
- [ ] Normal mod fonksiyonuna ekle (application.js)
- [ ] FHE mod fonksiyonuna ekle (application.js)
- [ ] Validator'a ekle (server/validators/index.js)
- [ ] Server route'a ekle (games.coffee)
- [ ] Game creation'a ekle (create_single_player_game.coffee)

---

## TURN YAPISI

```
OYUN BASI:
1. DrawStartingHandAction (5 kart - GIZLI)
2. Mulligan (3 kart degistir - GIZLI)

HER TUR:
START TURN:
  - Mana yenile (+1, max 9) - ACIK
  - Kart cek (1) - GIZLI

ACTION PHASE:
  - Kart oyna - GIZLI->ACIK
  - Birim hareket - ACIK
  - Saldir - ACIK
  - Replace - GIZLI

END TURN:
  - Sira degisir

OYUN SONU:
  - General HP <= 0
  - ResignAction
```

---

## FHE GIZLILIK

| Veri | Gorunurluk |
|------|------------|
| El kartlari | Sadece sahip gorebilir |
| Deste sirasi | Kimse goremez |
| Board birimleri | Herkes gorur |
| HP/ATK | Herkes gorur |
| Mana | Herkes gorur |
