/**
 * Test: Verificar que wallet se recupera y muestra correctamente
 */

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  
  console.log('Desplegando contrato...');
  const TraceabilityManager = await ethers.getContractFactory('TraceabilityManager');
  const contract = await TraceabilityManager.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log('✅ Contrato desplegado en:', contractAddress);

  // Vincular usuario
  console.log('\n📝 Vinculando usuario1...');
  const tx1 = await contract.connect(user1).linkWalletToUser('usuario1', 'ASSET_CREATOR');
  await tx1.wait();
  console.log('✅ usuario1 vinculado con wallet:', user1.address);

  // Simular obtención de datos al loguearse
  console.log('\n📝 Simulando login - obteniendo datos de usuario...');
  const blockchainUser = await contract.getUserByUsername('usuario1');
  console.log('✅ Datos recuperados del blockchain:');
  console.log('   - Wallet:', blockchainUser.walletAddress);
  console.log('   - Username:', blockchainUser.username);
  console.log('   - Role:', blockchainUser.role);
  console.log('   - Active:', blockchainUser.active);

  // Simular localStorage (como lo hace el frontend)
  console.log('\n📝 Simulando almacenamiento en localStorage...');
  const userData = {
    username: 'usuario1',
    role: 'ASSET_CREATOR',
    active: true,
    walletAddress: blockchainUser.walletAddress,
    registeredAt: new Date().toISOString(),
    isMetaMaskUser: true,
  };
  console.log('   - currentUser será:', JSON.stringify(userData, null, 2));

  // Simular carga de perfil
  console.log('\n📝 Simulando carga de perfil...');
  const walletFromStorage = userData.walletAddress || null;
  console.log('   - Wallet en currentUser:', walletFromStorage);
  
  if (walletFromStorage) {
    console.log('✅ LA WALLET DEBE MOSTRARSE EN EL PERFIL');
  } else {
    console.log('❌ LA WALLET NO SE MOSTRARÍA');
  }

  // Simular desvinculación
  console.log('\n📝 Simulando desvinculación...');
  const tx2 = await contract.connect(user1).unlinkWallet('usuario1');
  const receipt = await tx2.wait();
  console.log('✅ Wallet desvinculada en blockchain');
  console.log('   - TX Hash:', receipt.hash);

  // Verificar que usuario ya no está
  console.log('\n📝 Verificando estado después de desvinculación...');
  try {
    const walletAfter = await contract.getWalletByUsername('usuario1');
    console.log('   - Wallet después:', walletAfter);
  } catch (err) {
    console.log('✅ Usuario correctamente eliminado del blockchain');
  }

  console.log('\n✅ Test completado');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
