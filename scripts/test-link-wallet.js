async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();
  
  console.log("Desplegando contrato...");
  const TraceabilityManager = await ethers.getContractFactory("TraceabilityManager");
  const contract = await TraceabilityManager.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("✅ Contrato desplegado en:", contractAddress);

  // Mostrar interfaz disponible
  const iface = contract.interface;
  console.log("\nFunciones disponibles:");
  iface.fragments.forEach(frag => {
    if (frag.type === 'function' && frag.name.includes('link')) {
      console.log("  -", frag.name);
    }
  });

  // Test 1: Vincular wallet de usuario 1
  console.log("\n📝 Test 1: Usuario 1 vinculando su wallet...");
  try {
    const tx1 = await contract.connect(user1).linkWalletToUser("usuario1", "ASSET_CREATOR");
    console.log("   TX enviada:", tx1.hash);
    const receipt = await tx1.wait();
    console.log("   Receipt status:", receipt.status);
    console.log("✅ Usuario 1 vinculado");

    // Verificar usuario 1
    const user1Data = await contract.getUser(user1.address);
    console.log("   - Wallet:", user1Data.walletAddress);
    console.log("   - Username:", user1Data.username);
    console.log("   - Role:", user1Data.role);
    console.log("   - Active:", user1Data.active);
  } catch (err) {
    console.log("❌ Error:", err.message);
    if (err.data) console.log("   Data:", err.data);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
