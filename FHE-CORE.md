# FHE-CORE - ZAMA FHEVM Protokol Referansi

## SIFRELI VERI TIPLERI

```solidity
// Unsigned: ebool, euint8, euint16, euint32, euint64, euint128, euint256
// Signed: eint8, eint16, eint32, eint64, eint128, eint256
// Address: eaddress
// External: externalEuint8, externalEuint32, ...
```

---

## TEMEL OPERASYONLAR

### Aritmetik
```solidity
FHE.add(a, b)   FHE.sub(a, b)   FHE.mul(a, b)   FHE.div(a, b)
FHE.rem(a, b)   FHE.neg(a)      FHE.min(a, b)   FHE.max(a, b)
```

### Karsilastirma (ebool doner)
```solidity
FHE.eq(a, b)   FHE.ne(a, b)   FHE.lt(a, b)
FHE.gt(a, b)   FHE.le(a, b)   FHE.ge(a, b)
```

### Secim
```solidity
FHE.select(condition, ifTrue, ifFalse)  // condition ? ifTrue : ifFalse
```

### Random
```solidity
FHE.randEbool()
FHE.randEuint8()
FHE.randEuint8(upperBound)  // 0 ile upperBound-1 arasi
```

---

## ACL (Erisim Kontrolu)

```solidity
FHE.allow(handle, address)         // Kalici erisim
FHE.allowThis(handle)              // Contract'a erisim
FHE.makePubliclyDecryptable(handle) // Public decrypt icin
```

**KRITIK:** User decrypt icin HEM `allowThis()` HEM `allow(user)` GEREKLI!

---

## INPUT HANDLING

### Contract
```solidity
function myFunc(externalEuint32 input, bytes calldata proof) external {
    euint32 value = FHE.fromExternal(input, proof);
    FHE.allowThis(value);
    FHE.allow(value, msg.sender);
}
```

### Frontend
```typescript
const input = fhevm.createEncryptedInput(contractAddress, userAddress);
input.add32(12345);
const encrypted = await input.encrypt();
await contract.myFunc(encrypted.handles[0], encrypted.inputProof);
```

---

## USER DECRYPT (Gizli Veri Okuma)

- TX YOK, Gas YOK
- Sadece izinli user gorebilir
- El kartlari, gizli bilgiler icin

```typescript
const clearValue = await fhevm.userDecryptEuint(
    FhevmType.euint32,
    handle,
    contractAddress,
    userSigner
);
```

---

## PUBLIC DECRYPT (Acik Veri Yapma)

- TX VAR, Gas VAR
- Herkes gorebilir
- Kart oynama, board'a koyma icin

### Contract
```solidity
FHE.makePubliclyDecryptable(handle);

function recordResult(bytes calldata clearValue, bytes calldata proof) {
    bytes32[] memory cts = new bytes32[](1);
    cts[0] = FHE.toBytes32(handle);
    FHE.checkSignatures(cts, clearValue, proof);
    // Artik clear value kullanilabilir
}
```

### Frontend
```typescript
const result = await fhevm.publicDecrypt([handle]);
await contract.recordResult(result.abiEncodedClearValues, result.decryptionProof);
```

---

## SEPOLIA ADRESLERI

```
ACL_CONTRACT:    0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D
KMS_VERIFIER:    0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A
INPUT_VERIFIER:  0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0
FHEVM_EXECUTOR:  0x92C920834Ec8941d2C77D188936E1f7A6f49c127
RELAYER_URL:     https://relayer.testnet.zama.org
```

---

## DEPLOY EDILEN CONTRACTLAR (Sepolia)

```
GameGold:     0xdB1274A736812A28b782879128f237f35fed7B81
CardNFT:      0xD200776dE5A8472382F5b8b902a676E2117d7A31
SpiritOrb:    0xD0C7a512BAEaCe7a52E9BEe47A1B13868A0345B3
CardRegistry: 0xf9EB68605c1df066fC944c28770fFF8476ADE8fc
GameSession:  0x64A19A560643Cf39BA3FbbcF405F3545f6E813CB
WalletVault:  0x053E51a173b863E6495Dd1AeDCB0F9766e03f4A0
```

**Deploy sonrasi `fhe_session.js` guncellemeyi UNUTMA!**

---

## HARDHAT KOMUTLARI

```bash
npx hardhat compile
npx hardhat test --network hardhat    # Mock (hizli)
npx hardhat test --network sepolia    # Gercek FHE
npx hardhat deploy --network sepolia
```
