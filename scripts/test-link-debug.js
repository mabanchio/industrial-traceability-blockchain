async function main() {
  const [deployer, user1] = await ethers.getSigners();
  
  console.log("Desplegando contrato...");
  const TraceabilityManager = await ethers.getContractFactory("TraceabilityManager");
  const contract = await TraceabilityManager.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("✅ Contrato desplegado en:", contractAddress);

  console.log("\n📝 Verificaciones previas:");
  console.log("   - user1.address:", user1.address);
  
  // Verificar si el usuario ya existe
  try {
    const existingUser = await contract.getUser(user1.address);
    console.log("   ❌ Usuario ya existe:", existingUser);
  } catch (err) {
    console.log("   ✅ Usuario no existe (esperado)");
  }

  // Intentar vincular
  console.log("\n📝 Intentando vincular wallet...");
  try {
    const tx = await contract.connect(user1).linkWalletToUser("usuario1", "ASSET_CREATOR");
    console.log("   TX enviada:", tx.hash);
    const receipt = await tx.wait();
    console.log("   Receipt:", receipt);
  } catch (err) {
    console.log("   Error:", err.message);
    // Intentar hacer una llamada estática para obtener más info
    console.log("\n📝 Haciendo llamada estática para debug...");
    try {
      await contract.connect(user1).linkWalletToUser.staticCall("usuario1", "ASSET_CREATOR");
    } catch (staticErr) {
      console.log("   Error estático:", staticErr.message);
      if (staticErr.reason) console.log("   Razón:", staticErr.reason);
      if (staticErr.revert) console.log("   Revert:", staticErr.revert);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error fatal:", error);
    process.exit(1);
  });
