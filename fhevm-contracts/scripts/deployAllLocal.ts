import { ethers } from "hardhat";

/**
 * Deploy all FHEIGHT contracts to local Hardhat network
 * Updates fhe_session.js with new addresses after deployment
 */
async function main() {
  console.log("Deploying all contracts to Hardhat local network...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Track deployed addresses
  const addresses: Record<string, string> = {};

  // 1. Deploy GameGold (ERC-20)
  console.log("1. Deploying GameGold...");
  const GameGold = await ethers.getContractFactory("GameGold");
  const gameGold = await GameGold.deploy();
  await gameGold.waitForDeployment();
  addresses.GameGold = await gameGold.getAddress();
  console.log("   GameGold deployed to:", addresses.GameGold);

  // 2. Deploy CardNFT (ERC-721)
  console.log("2. Deploying CardNFT...");
  const CardNFT = await ethers.getContractFactory("CardNFT");
  const cardNFT = await CardNFT.deploy();
  await cardNFT.waitForDeployment();
  addresses.CardNFT = await cardNFT.getAddress();
  console.log("   CardNFT deployed to:", addresses.CardNFT);

  // 3. Deploy CardRegistry
  console.log("3. Deploying CardRegistry...");
  const CardRegistry = await ethers.getContractFactory("CardRegistry");
  const cardRegistry = await CardRegistry.deploy();
  await cardRegistry.waitForDeployment();
  addresses.CardRegistry = await cardRegistry.getAddress();
  console.log("   CardRegistry deployed to:", addresses.CardRegistry);

  // 4. Deploy GameSession (FHE)
  console.log("4. Deploying GameSession...");
  const GameSession = await ethers.getContractFactory("GameSession");
  const gameSession = await GameSession.deploy();
  await gameSession.waitForDeployment();
  addresses.GameSession = await gameSession.getAddress();
  console.log("   GameSession deployed to:", addresses.GameSession);

  // 5. Deploy WalletVault (FHE)
  console.log("5. Deploying WalletVault...");
  const WalletVault = await ethers.getContractFactory("WalletVault");
  const walletVault = await WalletVault.deploy();
  await walletVault.waitForDeployment();
  addresses.WalletVault = await walletVault.getAddress();
  console.log("   WalletVault deployed to:", addresses.WalletVault);

  // 6. Deploy MarbleRandoms (FHE)
  console.log("6. Deploying MarbleRandoms...");
  const MarbleRandoms = await ethers.getContractFactory("MarbleRandoms");
  const marbleRandoms = await MarbleRandoms.deploy();
  await marbleRandoms.waitForDeployment();
  addresses.MarbleRandoms = await marbleRandoms.getAddress();
  console.log("   MarbleRandoms deployed to:", addresses.MarbleRandoms);

  // Print summary
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE - Hardhat Local");
  console.log("========================================\n");
  console.log("Update fhe_session.js with these addresses:\n");
  console.log("hardhat: {");
  console.log(`  GameGold: '${addresses.GameGold}',`);
  console.log(`  CardNFT: '${addresses.CardNFT}',`);
  console.log(`  CardRegistry: '${addresses.CardRegistry}',`);
  console.log(`  GameSession: '${addresses.GameSession}',`);
  console.log(`  WalletVault: '${addresses.WalletVault}',`);
  console.log(`  MarbleRandoms: '${addresses.MarbleRandoms}'`);
  console.log("}");
  console.log("\n========================================\n");

  return addresses;
}

main()
  .then((addresses) => {
    console.log("All contracts deployed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
