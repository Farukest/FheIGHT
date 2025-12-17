const hre = require("hardhat");

async function main() {
  console.log("Deploying UserDecryptSingleValue to", hre.network.name);

  const Contract = await hre.ethers.getContractFactory("UserDecryptSingleValue");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("UserDecryptSingleValue deployed to:", address);

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
