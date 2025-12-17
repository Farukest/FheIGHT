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
import { FHE, euint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract GameSession is ZamaEthereumConfig {

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

    // Draw indices - şifreli random değerler (FHE encrypted)
    // IMPORTANT: euint8[40] array type doesn't work with FHE!
    // Must use nested mapping: gameId => index => euint8
    mapping(uint256 => mapping(uint8 => euint8)) private drawIndices;

    // Revealed values - doğrulanmış clear indexler
    mapping(uint256 => uint8[]) public revealedValues;

    // Mock: Hangi indexler reveal edildi (production'da gerek yok)
    mapping(uint256 => mapping(uint8 => bool)) private isRevealed;

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
     * @dev 40 adet FHE.randEuint8() ile şifreli random index üretir
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

        // 40 adet şifreli random index üret (gerçek FHE)
        for (uint8 i = 0; i < DECK_SIZE; i++) {
            euint8 encryptedIndex = FHE.randEuint8();
            // KRITIK: Contract'ın bu değeri okuyabilmesi için izin ver
            FHE.allowThis(encryptedIndex);
            // Storage'a kaydet
            drawIndices[gameId][i] = encryptedIndex;
            // Public decrypt için izinli yap
            FHE.makePubliclyDecryptable(encryptedIndex);
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
     * @param abiEncodedClearValues ABI-encoded clear values
     * @param decryptionProof KMS decryption proof
     */
    function revealDrawBatch(
        uint256 gameId,
        uint8[] calldata clearIndices,
        bytes calldata abiEncodedClearValues,
        bytes calldata decryptionProof
    ) external onlyPlayer(gameId) gameActive(gameId) {
        uint8 count = uint8(clearIndices.length);
        uint8 startIdx = games[gameId].revealedCount;

        require(count > 0, "Empty indices");
        require(startIdx + count <= getAllowedReveals(gameId), "Exceeds allowed");
        require(startIdx + count <= DECK_SIZE, "Exceeds deck");

        // Build handle list and verify proof
        _verifyAndReveal(gameId, startIdx, count, clearIndices, abiEncodedClearValues, decryptionProof);

        games[gameId].revealedCount = startIdx + count;
        emit DrawRevealed(gameId, count, startIdx + count);
    }

    /**
     * @notice Internal function to verify proof and store reveals
     */
    function _verifyAndReveal(
        uint256 gameId,
        uint8 startIdx,
        uint8 count,
        uint8[] calldata clearIndices,
        bytes calldata abiEncodedClearValues,
        bytes calldata decryptionProof
    ) internal {
        bytes32[] memory cts = new bytes32[](count);
        for (uint8 i = 0; i < count; i++) {
            cts[i] = FHE.toBytes32(drawIndices[gameId][startIdx + i]);
        }

        // Verify KMS decryption proof - reverts if invalid
        FHE.checkSignatures(cts, abiEncodedClearValues, decryptionProof);

        // Mark as revealed and store values
        for (uint8 i = 0; i < count; i++) {
            isRevealed[gameId][startIdx + i] = true;
            revealedValues[gameId].push(clearIndices[i]);
        }
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
     * @return handles Şifreli euint8 handle'lar (bytes32 olarak)
     */
    function getDrawHandles(
        uint256 gameId,
        uint8 count
    ) external view returns (bytes32[] memory handles) {
        Game storage game = games[gameId];
        uint8 start = game.revealedCount;
        uint8 allowed = getAllowedReveals(gameId);

        require(start + count <= allowed, "Exceeds allowed reveals");
        require(start + count <= DECK_SIZE, "Exceeds deck");

        handles = new bytes32[](count);

        // FHE encrypted handle'ları bytes32 olarak dön
        for (uint8 i = 0; i < count; i++) {
            handles[i] = FHE.toBytes32(drawIndices[gameId][start + i]);
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
