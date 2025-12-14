# Zama FHEVM Development Memory

This document synthesizes key information from the Zama FHEVM documentation for quick reference.

## 1. Core Concepts

The Zama Protocol enables confidential smart contracts using Fully Homomorphic Encryption (FHE).

*   **FHEVM**: The core technology, extending the EVM to work with encrypted data types.
*   **Encrypted Types**: Solidity types with an `e` prefix (e.g., `euint8`, `ebool`). Operations on these are done via the `FHE` library (e.g., `FHE.add`, `FHE.eq`).
*   **Host Contracts**: Trusted on-chain contracts that manage ACLs and emit events for off-chain computation.
*   **Coprocessor**: An off-chain decentralized service that performs the heavy FHE computations.
*   **Gateway**: An Arbitrum rollup that orchestrates the protocol, validates inputs, and manages consensus.
*   **KMS (Key Management Service)**: A decentralized MPC network for FHE key generation and secure decryption.

## 2. Setting up a Local Development Environment

Development is done using Hardhat with a specialized template.

1.  **Prerequisites**: Install an even-numbered LTS version of Node.js (e.g., v18, v20).
2.  **Project Setup**:
    *   Create a new repository from the [FHEVM Hardhat template](https://github.com/zama-ai/fhevm-hardhat-template).
    *   Clone the new repository locally.
    *   Run `npm install` to install dependencies.
3.  **Configuration**:
    *   The `fhevm-hardhat-template` comes with a `hardhat.config.ts` pre-configured for local development and the Sepolia testnet.
    *   For testnet deployment, set `MNEMONIC` and `INFURA_API_KEY` using `npx hardhat vars set <KEY>`.

## 3. Writing Confidential Smart Contracts

*   **Inheritance**: Contracts must inherit from `ZamaEthereumConfig` to get the necessary FHEVM configuration.
    ```solidity
    import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

    contract MyConfidentialContract is ZamaEthereumConfig {
        // ...
    }
    ```
*   **Encrypted State**: Use `euint` types for confidential state variables.
    ```solidity
    euint32 private _confidentialCounter;
    ```
*   **Encrypted Inputs**: Functions taking confidential inputs from users must accept an `externalEuintXX` type and a `bytes calldata inputProof`. The proof is used to verify the input's integrity.
    ```solidity
    function increment(externalEuint32 encryptedValue, bytes calldata inputProof) external {
        // ...
    }
    ```
*   **Input Validation**: Use `FHE.fromExternal()` to validate the ZK-proof and convert the external encrypted type to a usable in-contract encrypted type.
    ```solidity
    euint32 value = FHE.fromExternal(encryptedValue, inputProof);
    ```
*   **FHE Operations**: Use the `FHE` library for all operations on encrypted data.
    ```solidity
    _confidentialCounter = FHE.add(_confidentialCounter, value);
    ```
*   **Conditional Logic**: Standard `if/else` does not work on `ebool`. Use `FHE.select` for branching.
    ```solidity
    ebool isGreater = FHE.gt(a, b);
    euint8 max = FHE.select(isGreater, a, b);
    ```
*   **Access Control (ACL)**: To decrypt a value off-chain, permissions must be granted.
    *   `FHE.allow(handle, userAddress)`: Grants permanent access to a user.
    *   `FHE.allowThis(handle)`: Grants permanent access to the contract itself.
    *   For a user to decrypt a value, both the user and the contract must have permission.
    ```solidity
    FHE.allowThis(_confidentialCounter);
    FHE.allow(_confidentialCounter, msg.sender);
    ```

## 4. Testing Confidential Contracts

*   **Hardhat Plugin**: The `@fhevm/hardhat-plugin` extends Hardhat's environment with an `fhevm` object.
*   **Encrypting Inputs**: Use `fhevm.createEncryptedInput()` to prepare inputs for your tests.
    ```typescript
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, userSigner.address)
      .add32(plaintextValue)
      .encrypt();

    await contract.connect(userSigner).myFunction(encryptedInput.handles[0], encryptedInput.inputProof);
    ```
*   **Decrypting Outputs**: Use `fhevm.userDecryptEuint()` to decrypt results for assertions. The contract must have granted permission to the `userSigner`.
    ```typescript
    const encryptedResult = await contract.getResult();
    const clearResult = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedResult,
      contractAddress,
      userSigner,
    );
    expect(clearResult).to.equal(expectedValue);
    ```

## 5. Public Decryption Workflow

When a contract needs a plaintext value for its logic, it must use an asynchronous 3-step process.

1.  **On-Chain Request**: The contract calls `FHE.makePubliclyDecryptable(handle)` on the ciphertext it needs to decrypt. This emits an event.
2.  **Off-Chain Decryption**: A client (or relayer) listening for this event calls the `relayer-sdk`'s `publicDecrypt([handle])` function. This returns the cleartext value and a `decryptionProof`.
3.  **On-Chain Verification**: The client calls another function on the contract, passing the cleartext value and the `decryptionProof`. The contract uses `FHE.checkSignatures(handles, abiEncodedCleartexts, proof)` to verify the proof's authenticity before using the cleartext value.

## 6. Local Deployment

Based on the project structure and documentation, deploying to a local Hardhat network involves these steps:

1.  **Start a Hardhat Node**:
    ```bash
    npx hardhat node
    ```
2.  **Run the deployment script**: The `fhevm-contracts` directory contains deployment scripts in `deploy/`. Hardhat's deploy plugin runs these scripts. You need to specify the `localhost` network.
    ```bash
    npx hardhat deploy --network localhost
    ```
    *(Note: The exact script might vary, but `npx hardhat deploy` is the standard command for the `hardhat-deploy` plugin.)*
