async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();
  
  console.log('Desplegando contrato...');
  const TraceabilityManager = await ethers.getContractFactory('TraceabilityManager');
  const contract = await TraceabilityManager.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log('✅ Contrato desplegado en:', contractAddress);

  // Test 1: Vincular usuario 1
  console.log('\n📝 Test 1: Vincular usuario1 con wallet...');
  const tx1 = await contract.connect(user1).linkWalletToUser('usuario1', 'ASSET_CREATOR');
  await tx1.wait();
  console.log('✅ usuario1 vinculado');

  // Test 2: Buscar usuario por username
  console.log('\n📝 Test 2: Buscar usuario por username...');
  const walletAddr = await contract.getWalletByUsername('usuario1');
  console.log('   Wallet encontrada:', walletAddr);
  console.log('   Usuario1 wallet:', user1.address);
  console.log('   ✅ Coincide:', walletAddr.toLowerCase() === user1.address.toLowerCase());

  // Test 3: Obtener datos completos del usuario por username
  console.log('\n📝 Test 3: Obtener datos del usuario por username...');
  const userByUsername = await contract.getUserByUsername('usuario1');
  console.log('✅ Datos recuperados del blockchain:');
  console.log('   - Wallet:', userByUsername.walletAddress);
  console.log('   - Username:', userByUsername.username);
  console.log('   - Role:', userByUsername.role);
  console.log('   - Active:', userByUsername.active);

  // Test 4: Vincular usuario 2 y verificar
  console.log('\n📝 Test 4: Vincular usuario2 y verificar...');
  const tx2 = await contract.connect(user2).linkWalletToUser('usuario2', 'CERTIFIER');
  await tx2.wait();
  
  const userByUsername2 = await contract.getUserByUsername('usuario2');
  console.log('✅ usuario2 encontrado:');
  console.log('   - Wallet:', userByUsername2.walletAddress);
  console.log('   - Username:', userByUsername2.username);
  console.log('   - Role:', userByUsername2.role);

  // Test 5: Intentar obtener usuario inexistente
  console.log('\n📝 Test 5: Intentar obtener usuario inexistente...');
  try {
    await contract.getUserByUsername('usuarioInexistente');
    console.log('❌ Error: Debería haber fallado');
  } catch (error) {
    console.log('✅ Rechazado correctamente: Usuario no encontrado');
  }

  console.log('\n✅ Todos los tests completados exitosamente');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
