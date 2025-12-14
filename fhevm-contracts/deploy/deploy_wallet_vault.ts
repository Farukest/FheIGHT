import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as fs from "fs";
import * as path from "path";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n========================================");
  console.log("WalletVault Deployment");
  console.log("========================================");
  console.log(`Deployer: ${deployer}`);
  console.log(`Network: ${hre.network.name}`);
  console.log("========================================\n");

  // Deploy WalletVault (FHE Session Wallet Key Storage)
  console.log("Deploying WalletVault (FHE Session Wallet Key Storage)...");
  const deployedWalletVault = await deploy("WalletVault", {
    from: deployer,
    log: true,
    args: [],
  });
  console.log(`WalletVault deployed at: ${deployedWalletVault.address}\n`);

  // Update the existing deployment JSON file
  const outputPath = path.join(__dirname, `../deployed-contracts-${hre.network.name}.json`);

  if (fs.existsSync(outputPath)) {
    const existingData = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    existingData.contracts.WalletVault = {
      address: deployedWalletVault.address,
      description: "FHE-encrypted session wallet private key storage"
    };
    existingData.timestamp = new Date().toISOString();
    fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2));
    console.log(`Updated deployment info at: ${outputPath}`);
  } else {
    // Create new file with just WalletVault
    const deploymentInfo = {
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      deployer: deployer,
      timestamp: new Date().toISOString(),
      contracts: {
        WalletVault: {
          address: deployedWalletVault.address,
          description: "FHE-encrypted session wallet private key storage"
        }
      }
    };
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Created deployment info at: ${outputPath}`);
  }

  console.log("\n========================================");
  console.log("WalletVault Deployment Complete!");
  console.log(`Address: ${deployedWalletVault.address}`);
  console.log("========================================\n");
};

export default func;
func.id = "deploy_wallet_vault";
func.tags = ["WalletVault"];
