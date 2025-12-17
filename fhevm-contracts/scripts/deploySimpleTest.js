const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleTest to", hre.network.name);

  const SimpleTest = await hre.ethers.getContractFactory("SimpleTest");
  const simpleTest = await SimpleTest.deploy();
  await simpleTest.waitForDeployment();

  const address = await simpleTest.getAddress();
  console.log("SimpleTest deployed to:", address);

  return address;
}

main()
  .then((address) => {
    console.log("\nDone! Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
