import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MarbleRandoms to Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  const MarbleRandoms = await ethers.getContractFactory("MarbleRandoms");
  const marbleRandoms = await MarbleRandoms.deploy();

  await marbleRandoms.waitForDeployment();

  const address = await marbleRandoms.getAddress();
  console.log("MarbleRandoms deployed to:", address);

  console.log("\nUpdate these files with new address:");
  console.log("1. fheight-source/app/ui/managers/inventory_manager.js");
  console.log("2. fheight-source/server/lib/fhe_marble_verifier.coffee");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
