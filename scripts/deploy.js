const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying TraceabilityManager...");

  const TraceabilityManager = await ethers.getContractFactory("TraceabilityManager");
  const contract = await TraceabilityManager.deploy();

  await contract.waitForDeployment();

  console.log("TraceabilityManager deployed to:", await contract.getAddress());
  return contract;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
