// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint256, externalEuint256} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title WalletVault - FHE-encrypted Session Wallet Storage
/// @notice Stores encrypted private keys that only the owner can decrypt via userDecrypt
/// @dev Uses FHE to encrypt session wallet private keys on-chain
contract WalletVault is ZamaEthereumConfig {

    // ============ State Variables ============

    /// @notice Encrypted private keys mapped by owner address
    mapping(address => euint256) private encryptedKeys;

    /// @notice Track if user has stored a key
    mapping(address => bool) public hasKey;

    /// @notice Session wallet addresses (public, derived from private key)
    mapping(address => address) public sessionWalletAddress;

    // ============ Events ============

    event KeyStored(address indexed owner, address indexed sessionWallet);
    event KeyCleared(address indexed owner);

    // ============ Functions ============

    /// @notice Store encrypted session wallet private key
    /// @param encKey The FHE-encrypted private key (256 bits)
    /// @param inputProof The proof for the encrypted input
    /// @param sessionWallet The public address of the session wallet
    function storeKey(
        externalEuint256 encKey,
        bytes calldata inputProof,
        address sessionWallet
    ) external {
        require(sessionWallet != address(0), "Invalid session wallet");

        // Convert external input to internal encrypted type
        euint256 key = FHE.fromExternal(encKey, inputProof);

        // Store the encrypted key
        encryptedKeys[msg.sender] = key;
        hasKey[msg.sender] = true;
        sessionWalletAddress[msg.sender] = sessionWallet;

        // ACL: Allow contract to access (required for storage)
        FHE.allowThis(key);

        // ACL: Allow owner to decrypt via userDecrypt
        FHE.allow(key, msg.sender);

        emit KeyStored(msg.sender, sessionWallet);
    }

    /// @notice Get encrypted key handle for userDecrypt
    /// @return The encrypted key handle (only owner can decrypt)
    function getEncryptedKey() external view returns (euint256) {
        require(hasKey[msg.sender], "No key stored");
        return encryptedKeys[msg.sender];
    }

    /// @notice Check if caller has a stored key
    /// @return True if caller has a key stored
    function hasStoredKey() external view returns (bool) {
        return hasKey[msg.sender];
    }

    /// @notice Get session wallet address for an owner
    /// @param owner The owner address
    /// @return The session wallet address
    function getSessionWallet(address owner) external view returns (address) {
        return sessionWalletAddress[owner];
    }

    /// @notice Clear stored key (for wallet reset)
    function clearKey() external {
        require(hasKey[msg.sender], "No key stored");

        // Clear the storage - set to uninitialized state
        // Note: euint256 cannot be deleted, so we just mark hasKey as false
        hasKey[msg.sender] = false;
        delete sessionWalletAddress[msg.sender];

        emit KeyCleared(msg.sender);
    }

    /// @notice Update session wallet (generate new key)
    /// @param encKey The new FHE-encrypted private key
    /// @param inputProof The proof for the encrypted input
    /// @param newSessionWallet The new public address
    function updateKey(
        externalEuint256 encKey,
        bytes calldata inputProof,
        address newSessionWallet
    ) external {
        require(newSessionWallet != address(0), "Invalid session wallet");

        // Convert and store new key
        euint256 key = FHE.fromExternal(encKey, inputProof);
        encryptedKeys[msg.sender] = key;
        hasKey[msg.sender] = true;
        sessionWalletAddress[msg.sender] = newSessionWallet;

        // ACL permissions
        FHE.allowThis(key);
        FHE.allow(key, msg.sender);

        emit KeyStored(msg.sender, newSessionWallet);
    }
}
