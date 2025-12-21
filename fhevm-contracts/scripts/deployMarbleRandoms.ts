import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying MarbleRandoms with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  console.log("\nDeploying MarbleRandoms (no constructor args)...");
  const MarbleRandoms = await ethers.getContractFactory("MarbleRandoms");
  const marbleRandoms = await MarbleRandoms.deploy();
  await marbleRandoms.waitForDeployment();

  const marbleRandomsAddress = await marbleRandoms.getAddress();
  console.log("MarbleRandoms deployed to:", marbleRandomsAddress);

  console.log("\n========================================");
  console.log("UPDATE fhe_session.js with:");
  console.log(`MarbleRandoms: '${marbleRandomsAddress}'`);
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
