# SERVER START - Build ve Sunucu Baslatma

## HIZLI BASLATMA

```bash
# 1. Redis (EN ONCE)
docker start redis-fheight
# yoksa: docker run -d --name redis-fheight -p 6379:6379 redis:alpine

# 2. API Server (Port 3000)
cd fheight-source && node -r dotenv/config ./bin/api

# 3. Dev Server (Port 3001)
cd fheight-source && npm run dev

# 4. Single Player (Port 8000)
cd fheight-source && node -r dotenv/config ./bin/single_player
```

---

## PORTLAR

| Servis | Port | Aciklama |
|--------|------|----------|
| Redis | 6379 | Cache - diger servislere gerekli |
| API Server | 3000 | Backend REST API |
| Dev Server | 3001 | Frontend (bu URL'yi ac) |
| Single Player | 8000 | Socket.io oyun sunucusu |

---

## BUILD KOMUTLARI

```bash
cd fheight-source
npx gulp js      # JavaScript rebuild
npx gulp css     # CSS rebuild
npx gulp         # Full rebuild (js + css + assets)
```

---

## HATA COZUMLERI

| Hata | Cozum |
|------|-------|
| `ECONNREFUSED 127.0.0.1:6379` | Redis calismiyor - `docker start redis-fheight` |
| `socket.io ERR_CONNECTION_REFUSED 8000` | Single Player server calismiyor |
| `Firebase initialization error` | `.env` dosyasi eksik - `node -r dotenv/config` kullan |
| `Cannot GET /` on 3000 | Normal - API server REST, UI icin 3001 kullan |
| `window.relayerSDK undefined` | dist/src/index.html'de script eksik (FHE-SETUP.md'ye bak) |
| `ethers undefined` | dist/src/index.html'de ethers script eksik |

---

## .env DOSYASI

```
FIREBASE_URL=https://zama-e9173-default-rtdb.firebaseio.com/
FIREBASE_PROJECT_ID=zama-e9173
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@zama-e9173.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_LEGACY_TOKEN=...
POSTGRES_CONNECTION=pg://fheight:fheight@localhost:5432/fheight
REDIS_HOST=localhost
```

**ONEMLI:** Sunucuyu `node -r dotenv/config ./bin/api` ile baslat (cross-env ile degil!)

---

## REDIS KONTROL

```bash
# Calisiyormu?
docker ps | grep redis

# Yoksa baslat
docker start redis-fheight

# Hic yoksa olustur
docker run -d --name redis-fheight -p 6379:6379 redis:alpine
```
