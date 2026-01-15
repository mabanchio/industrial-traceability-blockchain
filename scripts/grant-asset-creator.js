const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [deployer] = await hre.ethers.getSigners();
  
  console.log(`Granting ASSET_CREATOR role to ${deployer.address}...`);
  
  const TraceabilityManager = await hre.ethers.getContractFactory("TraceabilityManager");
  const contract = TraceabilityManager.attach(CONTRACT_ADDRESS);
  
  // Register user first
  const username = "test_creator";
  const role = "ASSET_CREATOR";
  
  try {
    const tx = await contract.registerUser(deployer.address, username, role);
    await tx.wait();
    console.log(`✅ User ${username} registered as ${role}`);
  } catch (error) {
    console.log(`ℹ️ User might already exist: ${error.message}`);
  }
  
  console.log(`✅ Ready to register assets!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
