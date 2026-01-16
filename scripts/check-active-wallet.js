#!/usr/bin/env node

import { ethers } from 'ethers';
import { CONTRACT_ABI } from '../frontend/src/config/abi.js';

// Configuración
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const RPC_URL = 'http://localhost:8545';
const ADMIN_USERNAME = 'admin';

async function main() {
  try {
    console.log('\n🔍 Verificando wallet activa del usuario...\n');
    
    // Crear proveedor
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log(`✅ Conectado a: ${RPC_URL}`);
    console.log(`✅ ABI cargado correctamente`);
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    console.log(`✅ Contrato cargado: ${CONTRACT_ADDRESS}`);
    console.log(`📊 Función a probar: getUserByUsername("${ADMIN_USERNAME}")\n`);
    
    // Llamar a getUserByUsername
    try {
      const result = await contract.getUserByUsername(ADMIN_USERNAME);
      console.log('📤 Resultado de getUserByUsername:');
      console.log('   [0] username:', result[0]);
      console.log('   [1] role:', result[1]);
      console.log('   [2] active:', result[2]);
      console.log('   [3] registeredAt:', result[3]);
      console.log('   [4] activeWallet:', result[4]);
      console.log('   [5] exists:', result[5] !== undefined ? 'Sí, hay un 6to parámetro' : 'No');
      
      console.log('\n✅ getActiveWallet directamente:');
      const activeWallet = await contract.getActiveWallet(ADMIN_USERNAME);
      console.log('   activeWallet:', activeWallet);
      
      console.log('\n✅ getAllWallets:');
      const allWallets = await contract.getAllWallets(ADMIN_USERNAME);
      console.log('   allWallets:', allWallets);
      console.log('   cantidad:', allWallets.length);
      
      // Comparar
      console.log('\n📋 Comparación:');
      const isZeroAddress = result[4] === ethers.ZeroAddress;
      console.log('   result[4] es ZeroAddress:', isZeroAddress);
      console.log('   result[4] === activeWallet:', result[4] === activeWallet);
      
      if (result[4] === ethers.ZeroAddress) {
        console.log('\n❌ PROBLEMA: activeWallet es ZeroAddress');
        console.log('   Esto significa que NO hay wallet vinculada en el contrato');
        console.log('   Aunque haya wallets en getAllWallets, ninguna está activa');
      } else if (result[4]) {
        console.log('\n✅ CORRECTO: activeWallet es válida');
        console.log('   La wallet activa está correctamente vinculada');
      }
      
    } catch (err) {
      console.error('❌ Error al llamar getUserByUsername:', err.message);
      console.error('   Code:', err.code);
      if (err.code === 'CALL_EXCEPTION') {
        console.error('   Verificar:');
        console.error('   1. ¿Existe el usuario "' + ADMIN_USERNAME + '"?');
        console.error('   2. ¿El usuario está activo?');
        console.error('   3. ¿La dirección del contrato es correcta?');
      }
    }
    
  } catch (err) {
    console.error('❌ Error fatal:', err);
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
