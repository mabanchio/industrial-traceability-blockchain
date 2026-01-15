/**
 * Test: Verificar que wallet se renderiza correctamente en perfil
 */

async function main() {
  console.log('🧪 TEST: Wallet Display en Perfil de Usuario');
  console.log('═════════════════════════════════════════════');

  const [deployer, user1] = await ethers.getSigners();
  
  console.log('\n📝 Desplegando contrato...');
  const TraceabilityManager = await ethers.getContractFactory('TraceabilityManager');
  const contract = await TraceabilityManager.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log('✅ Contrato desplegado en:', contractAddress);

  // Vincular usuario1
  console.log('\n📝 Vinculando usuario1 con wallet...');
  const tx1 = await contract.connect(user1).linkWalletToUser('usuario1', 'ASSET_CREATOR');
  await tx1.wait();
  console.log('✅ usuario1 vinculado con wallet:', user1.address);

  console.log('\n📋 PASO 1: Verificar que usuario1 tiene wallet vinculada');
  const userData = await contract.getUserByUsername('usuario1');
  console.log('✅ Datos en blockchain:');
  console.log('   Username:', userData.username);
  console.log('   Wallet:', userData.walletAddress);
  console.log('   Role:', userData.role);
  console.log('   Active:', userData.active);
  
  if (userData.walletAddress === ethers.ZeroAddress) {
    console.log('❌ ERROR: Wallet está en cero!');
    return;
  }

  console.log('\n📋 PASO 2: Simular localStorage con datos de usuario');
  const currentUser = {
    username: 'usuario1',
    walletAddress: userData.walletAddress,
    role: 'ASSET_CREATOR',
    active: true,
    registeredAt: Date.now()
  };
  console.log('✅ currentUser simulado:', JSON.stringify(currentUser, null, 2));

  console.log('\n📋 PASO 3: Simular loadUserDetails()');
  
  // Simular la lógica de loadUserDetails
  let blockchainData = null;
  try {
    blockchainData = await contract.getUserByUsername(currentUser.username);
    console.log('✅ blockchain query exitosa');
    console.log('   blockchainData.walletAddress:', blockchainData.walletAddress);
  } catch (err) {
    console.log('⚠️  No se pudo obtener blockchain data:', err.message);
  }

  // Calcular walletAddress como lo hace el código
  const walletAddress = blockchainData?.walletAddress || currentUser.walletAddress || null;
  
  const userDetails = {
    username: currentUser.username,
    walletAddress: walletAddress,
    role: currentUser.role,
    active: currentUser.active,
    registeredAt: new Date(currentUser.registeredAt).toLocaleDateString(),
    isOnchain: blockchainData ? true : false,
    isDevelopmentMode: !blockchainData,
    blockchainData: blockchainData,
  };

  console.log('✅ userDetails creado:');
  console.log('   walletAddress:', userDetails.walletAddress);
  console.log('   isOnchain:', userDetails.isOnchain);

  console.log('\n📋 PASO 4: Verificar condiciones de renderizado');
  
  const showWalletBinder = false; // Simulamos que no estamos en modo "enlazar wallet"
  
  console.log('\nCondición 1: !showWalletBinder && userDetails?.walletAddress');
  console.log('  !showWalletBinder =', !showWalletBinder);
  console.log('  userDetails?.walletAddress =', userDetails?.walletAddress);
  console.log('  Resultado =', !showWalletBinder && userDetails?.walletAddress);
  
  if (!showWalletBinder && userDetails?.walletAddress) {
    console.log('✅ CORRECTO: Debería mostrar WALLET');
    console.log('   - Dirección:', userDetails.walletAddress);
    console.log('   - Botón Copiar: ✓');
    console.log('   - Botón Desvinculación: ✓');
  } else {
    console.log('❌ ERROR: No se va a mostrar la wallet!');
  }

  console.log('\nCondición 2: !showWalletBinder && !userDetails?.walletAddress');
  console.log('  !showWalletBinder =', !showWalletBinder);
  console.log('  !userDetails?.walletAddress =', !userDetails?.walletAddress);
  console.log('  Resultado =', !showWalletBinder && !userDetails?.walletAddress);
  
  if (!showWalletBinder && !userDetails?.walletAddress) {
    console.log('⚠️  ADVERTENCIA: Mostraría opción "Vincular Wallet"');
  } else {
    console.log('✅ CORRECTO: No mostrará opción "Vincular Wallet"');
  }

  console.log('\n📋 PASO 5: Verificar que isOnchain indicator funciona');
  if (userDetails?.isOnchain) {
    console.log('✅ CORRECTO: Mostraría indicador "✅ Datos del blockchain"');
  } else {
    console.log('❌ ERROR: No mostraría indicador de blockchain');
  }

  console.log('\n═════════════════════════════════════════════');
  console.log('🎉 TEST COMPLETADO');
  console.log('✅ Si todos los valores son correctos, la wallet se mostrará en el perfil');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
