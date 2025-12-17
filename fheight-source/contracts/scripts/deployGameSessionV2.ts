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

  console.log("\n========================================");
  console.log("UPDATE fhe_session.js & blockchain.coffee:");
  console.log(`GameSession: '${gameSessionAddress}'`);
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
