import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = process.env.HARDHAT_NETWORK || "hardhat";

  console.log("\n========================================");
  console.log("WalletVault Deployment Script");
  console.log("========================================");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: ${network}`);
  console.log("========================================\n");

  // Deploy WalletVault
  console.log("Deploying WalletVault...");
  const WalletVault = await ethers.getContractFactory("WalletVault");
  const walletVault = await WalletVault.deploy();
  await walletVault.waitForDeployment();

  const walletVaultAddress = await walletVault.getAddress();
  console.log(`WalletVault deployed at: ${walletVaultAddress}\n`);

  // Update deployment JSON
  const outputPath = path.join(__dirname, `../deployed-contracts-${network}.json`);

  if (fs.existsSync(outputPath)) {
    const existingData = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    existingData.contracts.WalletVault = {
      address: walletVaultAddress,
      description: "FHE-encrypted session wallet private key storage"
    };
    existingData.timestamp = new Date().toISOString();
    fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2));
    console.log(`Updated deployment info at: ${outputPath}`);
  } else {
    console.log("No existing deployment file found. Creating new one...");
    const deploymentInfo = {
      network: network,
      timestamp: new Date().toISOString(),
      contracts: {
        WalletVault: {
          address: walletVaultAddress,
          description: "FHE-encrypted session wallet private key storage"
        }
      }
    };
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Created deployment info at: ${outputPath}`);
  }

  console.log("\n========================================");
  console.log("WalletVault Deployment Complete!");
  console.log(`Address: ${walletVaultAddress}`);
  console.log("========================================\n");

  // Verify on Etherscan (if supported)
  if (network === "sepolia") {
    console.log("Waiting for block confirmations before verification...");
    await walletVault.deploymentTransaction()?.wait(5);

    try {
      await (await import("hardhat")).run("verify:verify", {
        address: walletVaultAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error: any) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
