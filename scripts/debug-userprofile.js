#!/usr/bin/env node

import { ethers } from 'ethers';
import { CONTRACT_ABI } from '../frontend/src/config/abi.js';

// Estas son las MISMAS direcciones que UserProfile debería estar usando
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const RPC_URL = 'http://localhost:8545';
const ADMIN_USERNAME = 'admin';

async function testExactUserProfileLogic() {
  try {
    console.log('\n🧪 SIMULACIÓN EXACTA de lo que UserProfile hace\n');
    console.log('📋 Datos que UserProfile debería tener en localStorage:');
    console.log(`   workEnvironment: "hardhat"`);
    console.log(`   contractAddress: "${CONTRACT_ADDRESS}"`);
    console.log(`   rpcUrl: "${RPC_URL}"`);
    console.log(`   currentUser.username: "${ADMIN_USERNAME}"\n`);
    
    // SIMULACIÓN 1: Sin Metamask, con RPC
    console.log('🔄 SIMULACIÓN 1: Sin Metamask, usando RPC');
    console.log('   (lo que pasaría en desarrollo local)\n');
    
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      console.log('✅ Conectado a RPC:', RPC_URL);
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      console.log('✅ Contrato cargado:', CONTRACT_ADDRESS);
      
      console.log(`📞 Llamando: contract.getUserByUsername("${ADMIN_USERNAME}")`);
      const [username, role, active, registeredAt, activeWallet] = 
        await contract.getUserByUsername(ADMIN_USERNAME);
      
      console.log('\n✅ ÉXITO: Datos recibidos');
      console.log(`   username: ${username}`);
      console.log(`   role: ${role}`);
      console.log(`   active: ${active}`);
      console.log(`   registeredAt: ${new Date(Number(registeredAt) * 1000).toLocaleString()}`);
      console.log(`   activeWallet: ${activeWallet}`);
      
      if (activeWallet === ethers.ZeroAddress) {
        console.log('\n⚠️ PROBLEMA: activeWallet es ZeroAddress');
        console.log('   El admin NO tiene wallet vinculada');
      } else {
        console.log('\n✅ PERFECTO: wallet activa del admin');
        console.log(`   El UserProfile mostraría: ${activeWallet}`);
      }
      
    } catch (err) {
      console.error('\n❌ ERROR en Simulación 1:');
      console.error(`   Mensaje: ${err.message}`);
      console.error(`   Code: ${err.code}`);
      console.error(`\n   Posibles causas:`);
      console.error(`   1. Anvil no está corriendo en ${RPC_URL}`);
      console.error(`   2. El usuario "${ADMIN_USERNAME}" no existe en el contrato`);
      console.error(`   3. Dirección del contrato inválida: ${CONTRACT_ADDRESS}`);
    }
    
    // SIMULACIÓN 2: Verificar qué pasa con diferentes variantes de la dirección
    console.log('\n\n🔄 SIMULACIÓN 2: Verificar dirección del contrato');
    const variants = [
      '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Con checksum (actual)
      '0x5fbdb2315678afecb367f032d93f642f64180aa3', // Minúsculas
      '0x5FBDB2315678AFECB367F032D93F642F64180AA3', // Mayúsculas
    ];
    
    for (const addr of variants) {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(addr, CONTRACT_ABI, provider);
        const [username] = await contract.getUserByUsername(ADMIN_USERNAME);
        console.log(`✅ Dirección funciona: ${addr}`);
      } catch (err) {
        console.log(`❌ Dirección NO funciona: ${addr}`);
      }
    }
    
  } catch (err) {
    console.error('❌ Error fatal:', err);
  }
}

testExactUserProfileLogic().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
