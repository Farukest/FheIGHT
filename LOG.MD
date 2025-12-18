● Direkt window.ethereum kullanan dosyalar listesi:

| Dosya            | Satır    | Kullanım                                                  | Sorun                                     |
  |------------------|----------|-----------------------------------------------------------|-------------------------------------------|
| main_menu.js     | 759-760  | Debug log: window.ethereum, selectedAddress               | Log için OK ama Wallet.getState() yeterli |
| main_menu.js     | 778-779  | window.ethereum.request({ method: 'eth_accounts' })       | Wallet modülüne taşınmalı                 |
| settings_menu.js | 182-183  | Fallback: window.ethereum.selectedAddress                 | Wallet.getAddress() yeterli olmalı        |
| settings_menu.js | 191      | Debug log                                                 | Log için OK                               |
| fhe_session.js   | 577      | if (!window.ethereum) check                               | Wallet.isProviderAvailable() kullanmalı   |
| fhe_session.js   | 587, 889 | window.ethereum.request({ method: 'eth_accounts' })       | Wallet modülüne taşınmalı                 |
| fhe_session.js   | 596      | new window.ethers.providers.Web3Provider(window.ethereum) | Wallet.getProvider() kullanmalı           |

wallet.js - Bu modülün kendisi, direkt erişim doğru.

Özet:
- main_menu.js: 2 yerde düzeltme gerekli (debug log + eth_accounts)
- settings_menu.js: 1 yerde düzeltme gerekli (fallback gereksiz)
- fhe_session.js: 4 yerde düzeltme gerekli (provider ve account erişimi)

Düzeltmemi ister misin?