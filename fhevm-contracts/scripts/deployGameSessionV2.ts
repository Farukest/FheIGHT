import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying GameSession V2 (FLOW.MD) with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  console.log("\nDeploying GameSession...");
  const GameSession = await ethers.getContractFactory("GameSession");
  const gameSession = await GameSession.deploy();
  await gameSession.waitForDeployment();

  const gameSessionAddress = await gameSession.getAddress();
  console.log("GameSession deployed to:", gameSessionAddress);

  // Verify constants
  const deckSize = await gameSession.DECK_SIZE();
  const initialHandSize = await gameSession.INITIAL_HAND_SIZE();
  console.log("\nContract constants:");
  console.log("  DECK_SIZE:", deckSize.toString());
  console.log("  INITIAL_HAND_SIZE:", initialHandSize.toString());

  console.log("\n========================================");
  console.log("UPDATE these files with new address:");
  console.log("----------------------------------------");
  console.log("fheight-source/app/common/fhe_session.js:");
  console.log(`  GameSession: '${gameSessionAddress}'`);
  console.log("");
  console.log("fheight-source/server/lib/blockchain.coffee:");
  console.log(`  sepolia: '${gameSessionAddress}'`);
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
