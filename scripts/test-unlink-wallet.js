async function main() {
  const [deployer, user1] = await ethers.getSigners();
  
  console.log('Desplegando contrato...');
  const TraceabilityManager = await ethers.getContractFactory('TraceabilityManager');
  const contract = await TraceabilityManager.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log('✅ Contrato desplegado en:', contractAddress);

  // Test 1: Vincular usuario
  console.log('\n📝 Test 1: Vincular usuario1...');
  const tx1 = await contract.connect(user1).linkWalletToUser('usuario1', 'ASSET_CREATOR');
  await tx1.wait();
  console.log('✅ usuario1 vinculado');

  // Verificar datos
  const userData1 = await contract.getUserByUsername('usuario1');
  console.log('   - Wallet:', userData1.walletAddress);
  console.log('   - Username:', userData1.username);
  console.log('   - Active:', userData1.active);

  // Test 2: Obtener wallet por username
  console.log('\n📝 Test 2: Obtener wallet por username...');
  const wallet = await contract.getWalletByUsername('usuario1');
  console.log('   - Wallet encontrada:', wallet);
  console.log('   ✅ Coincide con wallet del usuario:', wallet.toLowerCase() === user1.address.toLowerCase());

  // Test 3: Desvincularse
  console.log('\n📝 Test 3: Desvincular wallet...');
  const tx2 = await contract.connect(user1).unlinkWallet('usuario1');
  const receipt = await tx2.wait();
  console.log('✅ Wallet desvinculada');
  console.log('   - TX Hash:', receipt.hash);

  // Test 4: Verificar que usuario ya no existe (fue eliminado)
  console.log('\n📝 Test 4: Verificar que usuario fue removido...');
  try {
    const walletAfter = await contract.getWalletByUsername('usuario1');
    if (walletAfter === '0x0000000000000000000000000000000000000000') {
      console.log('✅ Usuario correctamente desvinculado (wallet = address(0))');
    }
  } catch (err) {
    console.log('✅ Usuario no encontrado (esperado)');
  }

  // Test 5: Intentar obtener usuario desvinculado
  console.log('\n📝 Test 5: Intentar obtener usuario desvinculado...');
  try {
    await contract.getUserByUsername('usuario1');
    console.log('❌ Error: debería haber fallado');
  } catch (error) {
    console.log('✅ Usuario no encontrado (esperado)');
  }

  console.log('\n✅ Todos los tests de desvinculación completados');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
