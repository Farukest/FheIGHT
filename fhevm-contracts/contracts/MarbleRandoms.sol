// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MarbleRandoms
 * @notice FHE-based random generation for FHEIGHT Morphic Marbles (Booster Packs)
 * @dev Contract generates 15 encrypted random values for 5-card marble opening:
 *      - 5x rarity randoms (determines Common/Rare/Epic/Legendary)
 *      - 5x index randoms (selects card from rarity pool)
 *      - 5x prismatic randoms (determines if card is prismatic/shiny)
 *
 * FLOW:
 * 1. drawRandoms(marbleId) - Generate 15 FHE.rand values
 * 2. getRandomHandles(marbleId) - Client gets encrypted handles
 * 3. Client SDK.publicDecrypt() - KMS decrypts values
 * 4. revealRandoms(marbleId, clearValues, proof) - Client submits decrypted values
 * 5. Server getVerifiedRandoms() - Reads verified values, calculates cards
 *
 * Card Pool (from SDK):
 * - Server provides card pools per rarity
 * - Client and Server use same algorithm to calculate final cards
 * - No manipulation possible - randoms are FHE-generated
 */

// ============ FHE IMPORTS ============
import { FHE, euint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MarbleRandoms is ZamaEthereumConfig {

    // ============ CONSTANTS ============
    uint8 public constant CARDS_PER_MARBLE = 5;
    uint8 public constant RANDOMS_PER_CARD = 3; // rarity, index, prismatic
    uint8 public constant TOTAL_RANDOMS = 15;   // 5 * 3

    // ============ STRUCTS ============
    struct MarbleSession {
        address owner;
        uint8 cardSetId;
        bool isDrawn;
        bool isRevealed;
        uint256 createdAt;
    }

    struct RevealedValues {
        uint8[5] rarity;
        uint8[5] index;
        uint8[5] prismatic;
    }

    // ============ STORAGE ============

    // Marble sessions
    mapping(bytes32 => MarbleSession) public marbles;

    // Encrypted randoms - using nested mapping (euint8[15] doesn't work with FHE)
    // Layout: 0-4 = rarity, 5-9 = index, 10-14 = prismatic
    mapping(bytes32 => mapping(uint8 => euint8)) private encryptedRandoms;

    // Revealed (decrypted) values
    mapping(bytes32 => RevealedValues) private revealedValues;

    // ============ EVENTS ============
    event RandomsGenerated(bytes32 indexed marbleId, address indexed owner, uint8 cardSetId);
    event RandomsRevealed(
        bytes32 indexed marbleId,
        uint8[5] rarity,
        uint8[5] index,
        uint8[5] prismatic
    );

    // ============ MODIFIERS ============
    modifier onlyOwner(bytes32 marbleId) {
        require(msg.sender == marbles[marbleId].owner, "Not owner");
        _;
    }

    // ============ MAIN FUNCTIONS ============

    /**
     * @notice Generate 15 encrypted randoms for marble opening
     * @dev Called when user wants to open a marble
     * @param marbleId Unique marble ID (from server)
     * @param cardSetId Card set ID (Core=1, Shimzar=2, etc.)
     */
    function drawRandoms(bytes32 marbleId, uint8 cardSetId) external {
        require(marbles[marbleId].owner == address(0), "Marble already drawn");

        marbles[marbleId] = MarbleSession({
            owner: msg.sender,
            cardSetId: cardSetId,
            isDrawn: true,
            isRevealed: false,
            createdAt: block.timestamp
        });

        // Generate 15 encrypted randoms (5 cards x 3 randoms each)
        for (uint8 i = 0; i < TOTAL_RANDOMS; i++) {
            euint8 encryptedRand = FHE.randEuint8();
            // Contract needs access to verify later
            FHE.allowThis(encryptedRand);
            // Store encrypted value
            encryptedRandoms[marbleId][i] = encryptedRand;
            // Make publicly decryptable for client SDK
            FHE.makePubliclyDecryptable(encryptedRand);
        }

        emit RandomsGenerated(marbleId, msg.sender, cardSetId);
    }

    /**
     * @notice Reveal decrypted random values with KMS proof
     * @dev Client decrypts with SDK, then submits values + proof
     * @param marbleId Marble ID
     * @param clearValues Decrypted values (15 uint8s)
     * @param abiEncodedClearValues ABI-encoded clear values from SDK
     * @param decryptionProof KMS decryption proof
     */
    function revealRandoms(
        bytes32 marbleId,
        uint8[15] calldata clearValues,
        bytes calldata abiEncodedClearValues,
        bytes calldata decryptionProof
    ) external onlyOwner(marbleId) {
        MarbleSession storage session = marbles[marbleId];
        require(session.isDrawn, "Not drawn");
        require(!session.isRevealed, "Already revealed");

        // Build handle list for verification
        bytes32[] memory cts = new bytes32[](TOTAL_RANDOMS);
        for (uint8 i = 0; i < TOTAL_RANDOMS; i++) {
            cts[i] = FHE.toBytes32(encryptedRandoms[marbleId][i]);
        }

        // Verify KMS decryption proof - reverts if invalid
        FHE.checkSignatures(cts, abiEncodedClearValues, decryptionProof);

        // Store revealed values in structured format
        RevealedValues storage revealed = revealedValues[marbleId];
        for (uint8 i = 0; i < CARDS_PER_MARBLE; i++) {
            revealed.rarity[i] = clearValues[i];           // 0-4
            revealed.index[i] = clearValues[i + 5];        // 5-9
            revealed.prismatic[i] = clearValues[i + 10];   // 10-14
        }

        session.isRevealed = true;

        emit RandomsRevealed(
            marbleId,
            revealed.rarity,
            revealed.index,
            revealed.prismatic
        );
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get encrypted handles for client to decrypt
     * @dev Client uses these with SDK.publicDecrypt()
     *      NOTE: No owner check - handles are publicly decryptable anyway
     *      View functions can't reliably check msg.sender with RPC providers
     * @param marbleId Marble ID
     * @return handles Array of 15 encrypted handles
     */
    function getRandomHandles(bytes32 marbleId) external view returns (bytes32[15] memory handles) {
        require(marbles[marbleId].isDrawn, "Not drawn");
        // NOTE: Removed owner check - msg.sender unreliable in view calls via RPC
        // Security is maintained because:
        // 1. Only owner can call revealRandoms (has onlyOwner modifier)
        // 2. Handles are makePubliclyDecryptable anyway

        for (uint8 i = 0; i < TOTAL_RANDOMS; i++) {
            handles[i] = FHE.toBytes32(encryptedRandoms[marbleId][i]);
        }

        return handles;
    }

    /**
     * @notice Get verified random values (after reveal)
     * @dev Server uses this to calculate final cards
     * @param marbleId Marble ID
     * @return rarity 5 rarity values (0-255)
     * @return index 5 index values (0-255)
     * @return prismatic 5 prismatic values (0-255)
     */
    function getVerifiedRandoms(bytes32 marbleId) external view returns (
        uint8[5] memory rarity,
        uint8[5] memory index,
        uint8[5] memory prismatic
    ) {
        require(marbles[marbleId].isRevealed, "Not revealed");

        RevealedValues storage revealed = revealedValues[marbleId];
        return (revealed.rarity, revealed.index, revealed.prismatic);
    }

    /**
     * @notice Check if marble is drawn
     * @param marbleId Marble ID
     * @return isDrawn True if drawn
     */
    function isMarbleDrawn(bytes32 marbleId) external view returns (bool) {
        return marbles[marbleId].isDrawn;
    }

    /**
     * @notice Check if marble is revealed
     * @param marbleId Marble ID
     * @return isRevealed True if revealed
     */
    function isMarbleRevealed(bytes32 marbleId) external view returns (bool) {
        return marbles[marbleId].isRevealed;
    }

    /**
     * @notice Get marble session info
     * @param marbleId Marble ID
     * @return owner Owner address
     * @return cardSetId Card set ID
     * @return isDrawn Is drawn
     * @return isRevealed Is revealed
     * @return createdAt Creation timestamp
     */
    function getMarbleInfo(bytes32 marbleId) external view returns (
        address owner,
        uint8 cardSetId,
        bool isDrawn,
        bool isRevealed,
        uint256 createdAt
    ) {
        MarbleSession storage session = marbles[marbleId];
        return (
            session.owner,
            session.cardSetId,
            session.isDrawn,
            session.isRevealed,
            session.createdAt
        );
    }
}
