import { ethers } from "hardhat";

async function main() {
  console.log("Deploying GameSession to Sepolia...");

  const GameSession = await ethers.getContractFactory("GameSession");
  const gameSession = await GameSession.deploy();
  await gameSession.waitForDeployment();

  const address = await gameSession.getAddress();
  console.log("GameSession deployed to:", address);
  console.log("\nUpdate this address in your client config!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
