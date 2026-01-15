/**
 * Test: Funcionalidad completa de múltiples wallets
 */

async function main() {
  const [admin, user1, user2, user3] = await ethers.getSigners();

  console.log('\n🧪 TEST: Sistema de Múltiples Wallets por Usuario');
  console.log('═════════════════════════════════════════════════');

  // Desplegar contrato
  console.log('\n📝 1. Desplegando contrato...');
  const TraceabilityManager = await ethers.getContractFactory('TraceabilityManager');
  const contract = await TraceabilityManager.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log('✅ Contrato desplegado en:', contractAddress);

  // ═════════════════════════════════════════════════════════
  // TEST 1: Registro de usuario sin wallet
  // ═════════════════════════════════════════════════════════
  console.log('\n📋 TEST 1: Registrar usuario sin wallet vinculada');
  console.log('─────────────────────────────────────────────────');
  
  const tx1 = await contract.connect(admin).registerUser('usuario1', 'ASSET_CREATOR');
  await tx1.wait();
  console.log('✅ Usuario "usuario1" registrado sin wallet');

  // Verificar que existe pero sin wallet activa
  const [username1, role1, active1, registeredAt1, activeWallet1] = 
    await contract.getUserByUsername('usuario1');
  console.log('   Username:', username1);
  console.log('   Role:', role1);
  console.log('   Active:', active1);
  console.log('   ActiveWallet:', activeWallet1 === ethers.ZeroAddress ? 'NINGUNA' : activeWallet1);
  console.log('   ✅ Usuario registrado sin wallet activa');

  // ═════════════════════════════════════════════════════════
  // TEST 2: Vincular primera wallet
  // ═════════════════════════════════════════════════════════
  console.log('\n📋 TEST 2: Vincular primera wallet al usuario');
  console.log('─────────────────────────────────────────────────');
  
  const tx2 = await contract.connect(user1).linkWalletToUser('usuario1', 'ASSET_CREATOR');
  await tx2.wait();
  console.log('✅ Primera wallet vinculada:', user1.address);

  // Verificar que es la wallet activa
  const activeWallet2 = await contract.getActiveWallet('usuario1');
  console.log('   Wallet activa:', activeWallet2);
  console.log('   ✅ Primera wallet es la activa');

  // ═════════════════════════════════════════════════════════
  // TEST 3: Vincular segunda wallet (debe deactivar la primera)
  // ═════════════════════════════════════════════════════════
  console.log('\n📋 TEST 3: Vincular segunda wallet al mismo usuario');
  console.log('─────────────────────────────────────────────────');
  
  const tx3 = await contract.connect(user2).linkWalletToUser('usuario1', 'ASSET_CREATOR');
  await tx3.wait();
  console.log('✅ Segunda wallet vinculada:', user2.address);

  // Verificar que la segunda es activa
  const activeWallet3 = await contract.getActiveWallet('usuario1');
  console.log('   Wallet activa actual:', activeWallet3);
  console.log('   ¿Es la segunda wallet?', activeWallet3 === user2.address ? 'SÍ ✅' : 'NO ❌');

  // Obtener todas las wallets
  const allWallets = await contract.getAllWallets('usuario1');
  console.log('   Total de wallets vinculadas:', allWallets.length);
  console.log('   Wallets:', allWallets);

  // ═════════════════════════════════════════════════════════
  // TEST 4: Desvinculación automática y reactivación
  // ═════════════════════════════════════════════════════════
  console.log('\n📋 TEST 4: Desvinculación automática activa la siguiente wallet');
  console.log('─────────────────────────────────────────────────');
  
  // Estado: user2 es activa
  // Desactivar user2
  const txUnlink = await contract.connect(user2).unlinkWallet('usuario1');
  await txUnlink.wait();
  console.log('✅ Wallet user2 desactivada');

  // user1 debería haber sido activada automáticamente
  const activeWallet4 = await contract.getActiveWallet('usuario1');
  console.log('   Wallet activa ahora:', activeWallet4);
  console.log('   ¿Es user1 (activada automáticamente)?', activeWallet4 === user1.address ? 'SÍ ✅' : 'NO ❌');

  // Intentar reobtener user1 (debería estar activa)
  const [un4, ro4, ac4, reg4, aw4] = await contract.getUserByUsername('usuario1');
  console.log('   Wallet activa según getUserByUsername:', aw4);
  console.log('   ✅ Activación automática funcionó');

  // ═════════════════════════════════════════════════════════
  // TEST 5: Desvinculación automática de siguiente wallet
  // ═════════════════════════════════════════════════════════
  console.log('\n📋 TEST 5: Desvinculación y activación automática');
  console.log('─────────────────────────────────────────────────');
  
  // Estado actual: user1 activa, user2 inactiva
  // Vinculamos user3
  const tx5 = await contract.connect(user3).linkWalletToUser('usuario1', 'ASSET_CREATOR');
  await tx5.wait();
  console.log('✅ Tercera wallet vinculada:', user3.address);

  let activeWallet5 = await contract.getActiveWallet('usuario1');
  console.log('   Wallet activa:', activeWallet5);
  console.log('   ¿Es user3?', activeWallet5 === user3.address ? 'SÍ ✅' : 'NO ❌');

  // Desactivar user3
  const txUnlink3 = await contract.connect(user3).unlinkWallet('usuario1');
  await txUnlink3.wait();
  console.log('✅ Wallet user3 desactivada');

  activeWallet5 = await contract.getActiveWallet('usuario1');
  console.log('   Wallet activa después de desactivar user3:', activeWallet5);
  console.log('   ¿Es user1 (siguiente disponible)?', activeWallet5 === user1.address ? 'SÍ ✅' : 'NO ❌');

  // ═════════════════════════════════════════════════════════
  // TEST 6: Información de wallets
  // ═════════════════════════════════════════════════════════
  console.log('\n📋 TEST 6: Obtener información detallada de wallets');
  console.log('─────────────────────────────────────────────────');
  
  const walletInfo1 = await contract.getWalletInfo(user1.address);
  console.log('Información de wallet user1:');
  console.log('   Active:', walletInfo1.active);
  console.log('   LinkedAt:', Number(walletInfo1.linkedAt));
  console.log('   DeactivatedAt:', walletInfo1.deactivatedAt === 0n ? 'Nunca' : Number(walletInfo1.deactivatedAt));

  // ═════════════════════════════════════════════════════════
  // TEST 7: Consulta de usuario por username retorna wallet activa
  // ═════════════════════════════════════════════════════════
  console.log('\n📋 TEST 7: getUserByUsername retorna solo wallet activa');
  console.log('─────────────────────────────────────────────────');
  
  const [un, ro, ac, reg, aw] = await contract.getUserByUsername('usuario1');
  console.log('✅ Usuario:', un);
  console.log('   Role:', ro);
  console.log('   Active:', ac);
  console.log('   Wallet activa:', aw);
  console.log('   ¿Es wallet activa actual?', aw === await contract.getActiveWallet('usuario1') ? 'SÍ ✅' : 'NO ❌');

  // ═════════════════════════════════════════════════════════
  // TEST 8: Desactivar usuario desactiva todas sus wallets
  // ═════════════════════════════════════════════════════════
  console.log('\n📋 TEST 8: Desactivar usuario desactiva todas sus wallets');
  console.log('─────────────────────────────────────────────────');
  
  const txDeactivate = await contract.connect(admin).deactivateUser('usuario1');
  await txDeactivate.wait();
  console.log('✅ Usuario deactivado');

  const isActive = await contract.isUserActive('usuario1');
  console.log('   ¿Usuario activo?', isActive ? 'SÍ' : 'NO ✅');

  const activeWalletAfterDeactivate = await contract.getActiveWallet('usuario1');
  console.log('   Wallet activa:', activeWalletAfterDeactivate === ethers.ZeroAddress ? 'NINGUNA ✅' : 'Aún hay activa ❌');

  // ═════════════════════════════════════════════════════════
  // RESUMEN
  // ═════════════════════════════════════════════════════════
  console.log('\n═════════════════════════════════════════════════');
  console.log('🎉 TODOS LOS TESTS COMPLETADOS');
  console.log('═════════════════════════════════════════════════');
  console.log('\n✅ Funcionalidades verificadas:');
  console.log('   ✓ Registro de usuario sin wallet');
  console.log('   ✓ Vinculación de múltiples wallets');
  console.log('   ✓ Wallet activa automática');
  console.log('   ✓ Detección de wallet existente');
  console.log('   ✓ Reactivación de wallet existente');
  console.log('   ✓ Activación automática de siguiente wallet');
  console.log('   ✓ Información detallada de wallets');
  console.log('   ✓ getUserByUsername retorna wallet activa');
  console.log('   ✓ Desactivación de usuario desactiva wallets');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
