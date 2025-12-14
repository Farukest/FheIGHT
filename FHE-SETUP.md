# FHE-SETUP - SDK Yukleme ve Dikkat Edilmesi Gerekenler

## !!!!! KRITIK: IKI HTML DOSYASI VAR !!!!!

HTML degisikligi yaptiginda **HER IKI DOSYAYI DA GUNCELLE:**

| Dosya | Kullanim |
|-------|----------|
| `fheight-source/index.html` | Development (`npm run dev`) |
| `fheight-source/dist/src/index.html` | **Production (`npm run api`)** - BU SERVE EDILIYOR! |

**HATA:** Sadece `index.html`'e script ekleyip `dist/src/index.html`'i unutursan production'da calismaz!

---

## GEREKLI CDN SCRIPTLERI

Her iki HTML dosyasinda `<head>` icinde olmali:

```html
<!-- Ethers.js for FHE/Web3 integration -->
<script src="/app/vendor/ethers-5.7.2.umd.min.js"></script>

<!-- FHEVM Relayer SDK for real FHE encryption -->
<script src="https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs"></script>
```

---

## SDK KULLANIMI

**DIKKAT:** SDK global olarak `window.relayerSDK` ismiyle yukleniyor (window.fhevm DEGIL!)

```javascript
// Dogru:
var sdk = window.relayerSDK;
await sdk.initSDK();
var instance = await sdk.createInstance(config);

// Yanlis:
var sdk = window.fhevm; // CALISMAZ!
```

---

## YAYGN HATALAR VE COZUMLERI

| Hata | Sebep | Cozum |
|------|-------|-------|
| `window.relayerSDK undefined` | dist/src/index.html'de script yok | Scripti ekle |
| `ethers undefined` | ethers.js yuklenmedi | Scripti ekle |
| `FHEVM SDK not loaded` | Script yanlis yerde | `<head>` icinde olmali |
| `kms.testnet.zama.ai YOK` | Yanlis endpoint | SDK otomatik relayer kullanir |

---

## SESSION KEY vs DECRYPT KEYPAIR

**IKI FARKLI KAVRAM - KARISTIRMA!**

| | Decrypt Keypair (Zama) | TX Session Key (Bizim) |
|---|---|---|
| Olusturma | `fhevmInstance.generateKeypair()` | `ethers.Wallet.createRandom()` |
| Amac | KMS'ten decrypt almak | TX imzalama (popup yok) |
| Contract'a gider mi? | HAYIR | EVET |

---

## FHEVM INSTANCE OLUSTURMA

```javascript
// fhe_session.js veya benzeri dosyada
var sdk = window.relayerSDK;
await sdk.initSDK();

var instance = await sdk.createInstance({
    chainId: 11155111,  // Sepolia
    relayerUrl: 'https://relayer.testnet.zama.org'
});
```

---

## DEPLOY SONRASI ADRES GUNCELLEME

1. Deploy JSON otomatik guncellenir:
   - `fhevm-contracts/deployed-contracts-sepolia.json`

2. **fhe_session.js MANUEL guncellenmeli:**
   - `fheight-source/app/common/fhe_session.js`
   - `DEPLOYED_CONTRACTS.sepolia` objesi

---

## NETWORK KONFIGURASYONU

```javascript
// Sepolia
chainId: '0xaa36a7'  // 11155111
rpcUrls: ['https://rpc.sepolia.org']

// Hardhat Local
chainId: '0x7a69'    // 31337
rpcUrls: ['http://127.0.0.1:8545']
```
