// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GameSession
 * @notice FHE-based card draw randomness for FHEIGHT single player
 * @dev Contract sadece random index üretimi ve reveal işlemlerini yönetir.
 *      Oyun mantığı (board, hand, mana) server tarafında tutulur.
 *
 * FLOW:
 * 1. createSinglePlayerGame() - 40 FHE.rand() üretir
 * 2. getDrawHandles() - Client şifreli handle'ları alır
 * 3. Client SDK.publicDecrypt() ile KMS'den decrypt eder
 * 4. revealDrawBatch() - Client clear indices + proof gönderir
 * 5. Server getVerifiedDrawOrder() ile doğrulanmış indexleri okur
 */

// ============ FHE IMPORTS ============
// Production için:
// import "fhevm/lib/TFHE.sol";
// import "fhevm/gateway/GatewayCaller.sol";

// Local test için mock types kullanıyoruz
// Production'da bu bölüm silinecek

contract GameSession {

    // ============ CONSTANTS ============
    uint8 public constant DECK_SIZE = 40;
    uint8 public constant INITIAL_HAND_SIZE = 5;

    // ============ STRUCTS ============
    struct Game {
        address player;
        uint8 currentTurn;
        uint8 revealedCount;
        bool isActive;
        uint256 createdAt;
    }

    // ============ STORAGE ============

    // Games mapping
    mapping(uint256 => Game) public games;

    // Draw indices - şifreli random değerler
    // Production: mapping(uint256 => euint8[DECK_SIZE]) private drawIndices;
    mapping(uint256 => uint8[40]) private drawIndices;

    // Revealed values - doğrulanmış clear indexler
    mapping(uint256 => uint8[]) public revealedValues;

    // Mock: Hangi indexler reveal edildi (production'da gerek yok)
    mapping(uint256 => bool[40]) private isRevealed;

    // ============ EVENTS ============
    event GameCreated(uint256 indexed gameId, address indexed player);
    event TurnIncremented(uint256 indexed gameId, uint8 newTurn);
    event DrawRevealed(uint256 indexed gameId, uint8 count, uint8 totalRevealed);
    event GameEnded(uint256 indexed gameId);

    // ============ MODIFIERS ============
    modifier onlyPlayer(uint256 gameId) {
        require(msg.sender == games[gameId].player, "Not player");
        _;
    }

    modifier gameActive(uint256 gameId) {
        require(games[gameId].isActive, "Game not active");
        _;
    }

    // ============ MAIN FUNCTIONS ============

    /**
     * @notice Yeni single player oyun oluştur
     * @dev 40 adet FHE.rand() ile şifreli random index üretir
     * @param gameId Server tarafından üretilen unique game ID
     */
    function createSinglePlayerGame(uint256 gameId) external {
        require(games[gameId].player == address(0), "Game exists");

        games[gameId] = Game({
            player: msg.sender,
            currentTurn: 0,
            revealedCount: 0,
            isActive: true,
            createdAt: block.timestamp
        });

        // 40 adet şifreli random index üret
        // Production'da: drawIndices[gameId][i] = TFHE.randEuint8();
        for (uint8 i = 0; i < DECK_SIZE; i++) {
            // Mock: pseudorandom for testing
            drawIndices[gameId][i] = uint8(uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                gameId,
                i,
                msg.sender
            ))) % 256);
        }

        emit GameCreated(gameId, msg.sender);
    }

    /**
     * @notice Turn'ü artır (kart çekmeden önce çağrılmalı)
     * @dev Sadece mevcut reveal'lar tamamlandıysa artırılabilir
     * @param gameId Game ID
     */
    function incrementTurn(uint256 gameId) external onlyPlayer(gameId) gameActive(gameId) {
        Game storage game = games[gameId];

        // Mevcut turn için gerekli reveal'lar tamamlanmış olmalı
        uint8 allowed = getAllowedReveals(gameId);
        require(game.revealedCount == allowed, "Complete reveals first");

        game.currentTurn++;

        emit TurnIncremented(gameId, game.currentTurn);
    }

    /**
     * @notice Batch reveal - birden fazla index'i tek TX'te doğrula
     * @dev Client decrypt sonrası clear indices + proof gönderir
     * @param gameId Game ID
     * @param clearIndices Decrypt edilmiş index değerleri
     * @param proof KMS imzası (production'da kullanılacak)
     */
    function revealDrawBatch(
        uint256 gameId,
        uint8[] calldata clearIndices,
        bytes calldata proof
    ) external onlyPlayer(gameId) gameActive(gameId) {
        Game storage game = games[gameId];
        uint8 count = uint8(clearIndices.length);

        require(count > 0, "Empty indices");
        require(game.revealedCount + count <= getAllowedReveals(gameId), "Exceeds allowed");
        require(game.revealedCount + count <= DECK_SIZE, "Exceeds deck");

        // Production'da her index için proof doğrulaması:
        // for (uint8 i = 0; i < count; i++) {
        //     uint8 idx = game.revealedCount + i;
        //     TFHE.checkSignatures(drawIndices[gameId][idx], clearIndices[i], proof);
        // }

        // Mock: Basit doğrulama (production'da KMS proof kullanılacak)
        for (uint8 i = 0; i < count; i++) {
            uint8 idx = game.revealedCount + i;

            // Mock check: değer aralık içinde mi
            require(clearIndices[i] < 256, "Invalid index value");

            // Mock: Gerçek değerle eşleşiyor mu (test için)
            // Production'da bu kontrol KMS proof ile yapılır
            require(drawIndices[gameId][idx] == clearIndices[i], "Proof mismatch");

            isRevealed[gameId][idx] = true;
        }

        // Revealed values'a ekle
        for (uint8 i = 0; i < count; i++) {
            revealedValues[gameId].push(clearIndices[i]);
        }

        game.revealedCount += count;

        emit DrawRevealed(gameId, count, game.revealedCount);
    }

    /**
     * @notice Oyunu sonlandır
     * @param gameId Game ID
     */
    function endGame(uint256 gameId) external onlyPlayer(gameId) {
        games[gameId].isActive = false;
        emit GameEnded(gameId);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Kaç kart reveal edilebilir (turn'e göre)
     * @dev Turn 0: 5 (ilk el), Turn 1+: 5 + turn
     * @param gameId Game ID
     * @return allowed İzin verilen toplam reveal sayısı
     */
    function getAllowedReveals(uint256 gameId) public view returns (uint8) {
        uint8 turn = games[gameId].currentTurn;
        // Turn 0: 5 kart (ilk el)
        // Turn 1: 6 kart (5 + 1)
        // Turn 2: 7 kart (5 + 2)
        // ...
        uint8 allowed = INITIAL_HAND_SIZE + turn;
        return allowed > DECK_SIZE ? DECK_SIZE : allowed;
    }

    /**
     * @notice Sıradaki decrypt edilecek handle'ları al
     * @dev Client bu handle'ları SDK.publicDecrypt'e gönderir
     * @param gameId Game ID
     * @param count Kaç handle isteniyor
     * @return handles Şifreli handle'lar (mock'ta uint8)
     */
    function getDrawHandles(
        uint256 gameId,
        uint8 count
    ) external view returns (uint8[] memory handles) {
        Game storage game = games[gameId];
        uint8 start = game.revealedCount;
        uint8 allowed = getAllowedReveals(gameId);

        require(start + count <= allowed, "Exceeds allowed reveals");
        require(start + count <= DECK_SIZE, "Exceeds deck");

        handles = new uint8[](count);

        // Production'da euint8 handle döner, client bunu KMS'e gönderir
        // Mock'ta direkt değeri dönüyoruz (test için)
        for (uint8 i = 0; i < count; i++) {
            handles[i] = drawIndices[gameId][start + i];
        }

        return handles;
    }

    /**
     * @notice Doğrulanmış tüm draw index'lerini al
     * @dev Server bu fonksiyonu çağırarak kartları hesaplar
     * @param gameId Game ID
     * @return indices Tüm revealed index'ler
     */
    function getVerifiedDrawOrder(uint256 gameId) external view returns (uint8[] memory) {
        return revealedValues[gameId];
    }

    /**
     * @notice Kaç kart reveal edilmiş
     * @param gameId Game ID
     * @return count Revealed count
     */
    function getRevealedCount(uint256 gameId) external view returns (uint8) {
        return games[gameId].revealedCount;
    }

    /**
     * @notice Mevcut turn numarası
     * @param gameId Game ID
     * @return turn Current turn
     */
    function getCurrentTurn(uint256 gameId) external view returns (uint8) {
        return games[gameId].currentTurn;
    }

    /**
     * @notice Oyun aktif mi
     * @param gameId Game ID
     * @return active Is game active
     */
    function isGameActive(uint256 gameId) external view returns (bool) {
        return games[gameId].isActive;
    }

    /**
     * @notice Oyun bilgilerini al
     * @param gameId Game ID
     * @return player Oyuncu adresi
     * @return currentTurn Mevcut turn
     * @return revealedCount Reveal edilmiş kart sayısı
     * @return allowedReveals İzin verilen reveal sayısı
     * @return isActive Oyun aktif mi
     */
    function getGameInfo(uint256 gameId) external view returns (
        address player,
        uint8 currentTurn,
        uint8 revealedCount,
        uint8 allowedReveals,
        bool isActive
    ) {
        Game storage game = games[gameId];
        return (
            game.player,
            game.currentTurn,
            game.revealedCount,
            getAllowedReveals(gameId),
            game.isActive
        );
    }

    /**
     * @notice Belirli bir index reveal edilmiş mi (debug için)
     * @param gameId Game ID
     * @param index Index numarası
     * @return revealed Is revealed
     */
    function isIndexRevealed(uint256 gameId, uint8 index) external view returns (bool) {
        require(index < DECK_SIZE, "Invalid index");
        return isRevealed[gameId][index];
    }
}
