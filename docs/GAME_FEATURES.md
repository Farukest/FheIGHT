# FHEIGHT Game Features

Complete guide to all gameplay features, social systems, and customization options in FHEIGHT.

---

## Table of Contents

1. [Play Modes](#play-modes)
   - [Multiplayer](#multiplayer)
   - [Singleplayer](#singleplayer)
2. [Social Features](#social-features)
3. [Collection](#collection)
4. [Watch](#watch)
5. [Quests](#quests)
6. [Codex](#codex)
7. [Settings](#settings)

---

## Play Modes

FHEIGHT offers diverse gameplay experiences for competitive players, casual gamers, and developers.

<!-- SCREENSHOT: play_modes_menu.png -->

### Multiplayer

Compete against real players with FHE-secured randomness ensuring fair matches.

#### Season Ladder

Ranked competitive mode with monthly seasons and rewards.

| Feature | Description |
|---------|-------------|
| Rank Tiers | Bronze → Silver → Gold → Diamond → Master → Grandmaster |
| Season Duration | Monthly reset with end-of-season rewards |
| Matchmaking | Skill-based matching using hidden MMR |
| FHE Security | All card draws encrypted until revealed |

<!-- SCREENSHOT: season_ladder.png -->

#### The Gauntlet

Draft mode where you build a deck from random card selections. The longer you last, the better the rewards.

| Feature | Description |
|---------|-------------|
| Entry | Requires Gauntlet ticket or gold |
| Draft Pool | Choose 1 of 3 cards, repeat 30 times |
| Win Rewards | Escalating rewards based on win count |
| Max Wins | 12 wins for maximum reward chest |

<!-- SCREENSHOT: gauntlet_draft.png -->

#### Friendly Challenge

Challenge friends to casual matches without rank impact.

| Feature | Description |
|---------|-------------|
| Invite System | Challenge from friends list or recent players |
| Custom Rules | Optional custom game settings |
| No Stakes | No rank gain/loss, pure practice |

<!-- SCREENSHOT: friendly_challenge.png -->

---

### Singleplayer

Practice and challenge yourself against AI opponents.

#### Practice Mode

Play against AI-controlled opponents to test decks and learn mechanics.

| Feature | Description |
|---------|-------------|
| AI Difficulty | Easy, Medium, Hard, Expert |
| FHE AI | AI decisions use on-chain encrypted randomness |
| Deck Testing | Safe environment to test new strategies |
| Faction Unlock | Defeat AI to unlock new factions |

<!-- SCREENSHOT: practice_mode.png -->

#### Solo Challenges

Story-driven challenges that teach game mechanics and reward completion.

| Feature | Description |
|---------|-------------|
| Tutorial Challenges | Learn basic and advanced mechanics |
| Puzzle Challenges | Solve specific board states |
| Rewards | Gold, cards, and cosmetics |

<!-- SCREENSHOT: solo_challenges.png -->

#### Secret Boss Fights

Time-limited and quest-based boss encounters with unique mechanics and exclusive rewards.

| Feature | Description |
|---------|-------------|
| Daily Bosses | Rotating daily boss with special rules |
| Event Bosses | Limited-time seasonal bosses |
| Quest Bosses | Unlock through quest completion |
| Exclusive Rewards | Boss-only card backs, emotes, cosmetics |

<!-- SCREENSHOT: boss_fight.png -->

#### Sandbox Mode

Play against yourself as both Player 1 and Player 2. Perfect for testing combos and deck interactions.

| Feature | Description |
|---------|-------------|
| Full Control | Control both sides of the board |
| No Timer | Unlimited turn time for testing |
| Deck Testing | Test card synergies without opponent |

<!-- SCREENSHOT: sandbox_mode.png -->

#### Developer Sandbox

Advanced testing mode for developers and content creators.

| Feature | Description |
|---------|-------------|
| Shuffle Free | Disable deck shuffling, cards draw in order |
| Mulligan Free | Skip mulligan phase |
| Card Spawning | Spawn any card directly to hand/board |
| Debug Info | Show hidden game state and values |
| Admin Only | Requires developer privileges |

<!-- SCREENSHOT: dev_sandbox.png -->

---

## Social Features

Connect with friends, chat in real-time, and review past matches.

<!-- SCREENSHOT: social_menu.png -->

### Friends System

| Feature | Description |
|---------|-------------|
| Friend List | View online/offline friends |
| Recent Players | See players from recent matches |
| Friend Invite | Send friend requests to any player |
| Search by Name | Find players by username |
| Remove Friend | Unfriend players from your list |

<!-- SCREENSHOT: friends_list.png -->

### Chat System

| Feature | Description |
|---------|-------------|
| Live Chat | Real-time messaging with friends |
| In-Game Emotes | Express yourself during matches |
| Do Not Disturb | Block chat and game invites |

<!-- SCREENSHOT: chat_window.png -->

### Player Profiles

View detailed statistics and history for any player.

| Section | Information |
|---------|-------------|
| Summary | Overall stats, current rank, win rate |
| Hero Progress | Level and experience for each hero |
| Monthly History | Rank progression charts by month |
| Game Types | Stats breakdown by game mode |

<!-- SCREENSHOT: player_profile.png -->

### Match Replay

Watch and analyze previous matches.

| Feature | Description |
|---------|-------------|
| Game History | Browse all past matches |
| Full Replay | Watch entire match playback |
| Speed Control | 0.5x, 1x, 2x, 4x playback speed |
| Turn Navigation | Jump to specific turns |
| Share Replay | Share replay links with friends |

<!-- SCREENSHOT: match_replay.png -->

---

## Collection

Build decks, craft cards, and manage your card collection.

<!-- SCREENSHOT: collection_overview.png -->

### Deck Builder

Create and manage custom decks with FHE-secured storage.

| Feature | Description |
|---------|-------------|
| FHE Secured Decks | Deck contents encrypted on-chain |
| Card Filters | Filter by faction, rarity, mana cost, type |
| Deck Slots | Multiple deck slots per faction |
| Import/Export | Share deck codes with friends |
| Hero Selection | 3 visual variants per hero |

<!-- SCREENSHOT: deck_builder.png -->

### Hero Skins

Each main hero has 3 different visual appearances to choose from.

| Variant | Unlock Method |
|---------|---------------|
| Default | Available from start |
| Alternate | Unlock through progression |
| Premium | Purchase or special events |

<!-- SCREENSHOT: hero_skins.png -->

### Craft & Disenchant

Convert cards to and from crafting currency.

| Action | Description |
|--------|-------------|
| Disenchant | Convert unwanted cards to Spirit |
| Craft | Create specific cards using Spirit |
| Mass Disenchant | Disenchant all duplicates at once |

**Spirit Values:**

| Rarity | Disenchant | Craft |
|--------|------------|-------|
| Common | 10 | 40 |
| Rare | 50 | 200 |
| Epic | 200 | 800 |
| Legendary | 900 | 3600 |
| Prismatic | 3x | 3x |

<!-- SCREENSHOT: craft_disenchant.png -->

### Mystery Crates

Open crates to receive random cards and rewards.

| Crate Type | Contents |
|------------|----------|
| Bronze Crate | 3 cards (Common+) |
| Silver Crate | 4 cards (Rare+ guaranteed) |
| Gold Crate | 5 cards (Epic+ guaranteed) |
| Diamond Crate | 5 cards (Legendary guaranteed) |

*Note: Mystery Crate opening uses FHE-secured randomness via MarbleRandoms contract.*

<!-- SCREENSHOT: mystery_crates.png -->

---

## Watch

Spectate live matches and learn from top players.

<!-- SCREENSHOT: watch_menu.png -->

### Live Streams

Watch high-ranked players in real-time.

| Feature | Description |
|---------|-------------|
| Live Matches | Spectate ongoing games |
| Rank Filter | Filter by player rank tier |
| Featured Streams | Highlighted top matches |
| Follow Players | Get notified when favorites play |

<!-- SCREENSHOT: live_streams.png -->

### Spectator Controls

| Control | Function |
|---------|----------|
| Player Perspective | Switch between P1/P2 view |
| Hidden Info | Toggle card visibility |
| Commentary | Enable/disable caster mode |

<!-- SCREENSHOT: spectator_view.png -->

---

## Quests

Complete objectives to earn rewards.

<!-- SCREENSHOT: quests_menu.png -->

### Daily Quests

| Quest Type | Example | Reward |
|------------|---------|--------|
| Win Games | Win 3 games with any faction | 50 Gold |
| Play Cards | Play 20 minions | 25 Gold |
| Deal Damage | Deal 100 damage to enemy heroes | 30 Gold |
| Faction Quest | Win 2 games as Lyonar | 60 Gold |

<!-- SCREENSHOT: daily_quests.png -->

### Daily Boss Challenges

Special daily encounters with unique rewards.

| Feature | Description |
|---------|-------------|
| Daily Reset | New boss available each day |
| Unique Rules | Boss-specific game modifiers |
| First Win Bonus | Extra rewards for first daily clear |
| Streak Bonus | Consecutive day completion rewards |

<!-- SCREENSHOT: daily_boss.png -->

### Game Templates

Pre-configured game setups for varied experiences.

| Template | Description |
|----------|-------------|
| Standard | Normal rules, standard decks |
| Draft | Build deck from random picks |
| Sealed | Open packs, build from pool |
| Brawl | Weekly rotating special rules |

<!-- SCREENSHOT: game_templates.png -->

### Battle Maps

Different battlefield environments with unique aesthetics.

| Map | Theme |
|-----|-------|
| Lyonar Sanctuary | Golden temples, divine light |
| Abyssian Depths | Dark caverns, shadow mist |
| Magmar Grounds | Volcanic terrain, lava flows |
| Vanar Peaks | Frozen mountains, ice crystals |
| Vetruvian Desert | Ancient ruins, sand storms |
| Songhai Gardens | Cherry blossoms, zen temples |

<!-- SCREENSHOT: battle_maps.png -->

---

## Codex

Explore the rich lore and history of the FHEIGHT universe.

<!-- SCREENSHOT: codex_menu.png -->

### Lore Timeline

43 story entries spanning the complete history of the world, organized by era.

| Era | Time Period | Entries |
|-----|-------------|---------|
| The Beginning | 0 AE | 5 entries |
| The First Age | 10,000 AE | 8 entries |
| The Age of Strife | 10,000 - 20,000 AE | 12 entries |
| The Sundering | 20,000 - 22,000 AE | 8 entries |
| The Modern Era | 22,000+ AE | 10 entries |

*AE = After Emergence*

<!-- SCREENSHOT: codex_timeline.png -->

### Unlock System

Lore entries unlock through gameplay progression.

| Unlock Method | Examples |
|---------------|----------|
| Story Completion | Complete solo challenge chapters |
| Achievement | Reach specific milestones |
| Boss Defeat | Defeat secret bosses |
| Faction Mastery | Level up faction to thresholds |
| Hidden | Discover through exploration |

<!-- SCREENSHOT: codex_unlock.png -->

### Voice Narration

Professional voice acting brings the lore to life.

| Feature | Description |
|---------|-------------|
| Full Narration | Every lore entry has voice audio |
| Background Play | Listen while browsing other menus |
| Auto-Continue | Automatically play next entry |
| Narrator Selection | Choose between narrator voices |

<!-- SCREENSHOT: codex_narration.png -->

---

## Settings

Customize every aspect of your FHEIGHT experience.

<!-- SCREENSHOT: settings_menu.png -->

### Visual Settings

| Setting | Options | Description |
|---------|---------|-------------|
| Viewport | Windowed / Fullscreen / Borderless | Display mode |
| Language | English, Chinese, Japanese, Korean, + more | Interface language |
| HiDPI Mode | On / Off | High resolution scaling |
| Lighting Quality | Low / Medium / High | Light effects detail |
| Shadow Quality | Low / Medium / High | Shadow rendering detail |
| Board Quality | Low / Medium / High | Game board texture quality |
| Bloom | On / Off | Glow effects on cards and abilities |

<!-- SCREENSHOT: visual_settings.png -->

### Game Settings

| Setting | Options | Description |
|---------|---------|-------------|
| Always Show Stats | On / Off | Permanently display card stats |
| Show Tips | On / Off | Display gameplay tips during match |
| Battle Log | On / Off | Show action history panel |
| Player Details | On / Off | Display opponent info during match |
| Sticky Targeting | On / Off | Lock targeting on hover |
| Dev Mode | On / Off | Developer debug features (admin only) |
| FHE Secure Mode | On / Off | Force FHE encryption (admin only) |

<!-- SCREENSHOT: game_settings.png -->

### Account Settings

| Setting | Description |
|---------|-------------|
| Do Not Disturb | Block all chat messages and game invites |
| Block Spectators | Prevent others from watching your games |
| Change Username | Update your display name (limited uses) |
| Redeem Code | Enter referral or gift codes for rewards |

<!-- SCREENSHOT: account_settings.png -->

### Audio Settings

| Setting | Range | Description |
|---------|-------|-------------|
| Master Volume | 0 - 100% | Overall game audio |
| Music Volume | 0 - 100% | Background music |
| Voice Volume | 0 - 100% | Character voices and narration |
| Effects Volume | 0 - 100% | Card and ability sound effects |

<!-- SCREENSHOT: audio_settings.png -->

---

## Feature Summary

| Category | Features |
|----------|----------|
| **Play Modes** | Season Ladder, Gauntlet, Friendly, Practice, Solo, Boss Fights, Sandbox, Dev Sandbox |
| **Social** | Friends, Chat, Profiles, Match Replay, Do Not Disturb |
| **Collection** | Deck Builder, Hero Skins, Craft/Disenchant, Mystery Crates |
| **Watch** | Live Streams, Rank Filtering, Spectator Mode |
| **Quests** | Daily Quests, Boss Challenges, Game Templates, Battle Maps |
| **Codex** | 43 Lore Entries, Voice Narration, Unlock Progression |
| **Settings** | Visual, Game, Account, Audio customization |

---

## FHE Integration Note

The following features utilize Fully Homomorphic Encryption for provably fair outcomes:

| Feature | FHE Usage |
|---------|-----------|
| Ranked Matches | Card draws encrypted via GameSession contract |
| Mystery Crates | Card pack results via MarbleRandoms contract |
| AI Opponents | AI decision seeds encrypted on-chain |
| Gauntlet Draft | Draft card selection encrypted |

For technical details on FHE implementation, see [FHEVM_INTEGRATION.md](./FHEVM_INTEGRATION.md).

---
