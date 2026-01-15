async function main() {
  const [deployer, user1] = await ethers.getSigners();
  
  console.log("Desplegando contrato...");
  const TraceabilityManager = await ethers.getContractFactory("TraceabilityManager");
  const contract = await TraceabilityManager.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("✅ Contrato desplegado en:", contractAddress);

  // Obtener datos de codificación
  const iface = contract.interface;
  const encodedData = iface.encodeFunctionData("linkWalletToUser", ["usuario1", "ASSET_CREATOR"]);
  console.log("\n📝 Datos codificados para linkWalletToUser:");
  console.log("   Data:", encodedData);
  
  // Intentar enviar la transacción manualmente
  console.log("\n📝 Enviando transacción manualmente...");
  const tx = {
    to: contractAddress,
    data: encodedData,
  };
  
  const sentTx = await user1.sendTransaction(tx);
  console.log("   TX enviada:", sentTx.hash);
  
  try {
    const receipt = await sentTx.wait();
    console.log("   Receipt status:", receipt.status);
    if (receipt.status === 1) {
      console.log("✅ Transacción exitosa");
      
      // Verificar usuario
      const userData = await contract.getUser(user1.address);
      console.log("\n✅ Usuario en blockchain:");
      console.log("   - Wallet:", userData.walletAddress);
      console.log("   - Username:", userData.username);
      console.log("   - Role:", userData.role);
    } else {
      console.log("❌ Transacción fallida (status 0)");
    }
  } catch (err) {
    console.log("❌ Error:", err.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error fatal:", error);
    process.exit(1);
  });
