const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contract = await ethers.getContractAt("TraceabilityManager", contractAddress);
  
  const adminWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  
  console.log("\n=== Consultando Billeteras ===\n");
  
  try {
    // Obtener username del admin
    const username = await contract.getUsernameByWallet(adminWallet);
    console.log("✓ Username del admin:", username);
    
    // Obtener wallet activa
    const activeWallet = await contract.getActiveWallet(username);
    console.log("✓ Wallet activa:", activeWallet);
    
    // Obtener todas las wallets
    const allWallets = await contract.getAllWallets(username);
    console.log("✓ Todas las wallets:", allWallets);
    
    // Info de cada wallet
    for (const wallet of allWallets) {
      const info = await contract.getWalletInfo(wallet);
      console.log(`\n  Wallet: ${wallet}`);
      console.log(`  - Activa: ${info.active}`);
      console.log(`  - Linked at: ${new Date(info.linkedAt * 1000n).toLocaleString()}`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main().catch(console.error);
