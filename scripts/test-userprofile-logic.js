#!/usr/bin/env node

import { ethers } from 'ethers';
import { CONTRACT_ABI } from '../frontend/src/config/abi.js';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const ADMIN_USERNAME = 'admin';

async function testUserProfileLogic() {
  try {
    console.log('\n🧪 Simulando loadUserDetails de UserProfile\n');
    
    // Simular las variables que UserProfile tiene
    const workEnvironment = 'hardhat';  // Simulando que el usuario configuró Hardhat Local
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const rpcUrl = 'http://localhost:8545';  // Lo que guardaría AdminPanel
    const currentUser = { username: 'admin', role: 'ADMIN' };
    
    console.log('📋 Variables simuladas:');
    console.log(`   workEnvironment: ${workEnvironment}`);
    console.log(`   contractAddress: ${contractAddress}`);
    console.log(`   rpcUrl: ${rpcUrl}`);
    console.log(`   currentUser.username: ${currentUser.username}`);
    console.log(`\n🔄 Lógica de UserProfile:\n`);
    
    let blockchainData = null;
    
    if (workEnvironment !== 'offline' && contractAddress) {
      console.log('✅ workEnvironment !== "offline" ✓');
      console.log('✅ contractAddress exists ✓');
      
      try {
        console.log('\n🔗 Intentando conectar al blockchain:');
        
        let provider;
        if (typeof window !== 'undefined' && window.ethereum) {
          console.log('   ✓ Usando window.ethereum (Metamask)');
          provider = new ethers.BrowserProvider(window.ethereum);
        } else if (rpcUrl) {
          console.log('   ✓ Usando RPC del localStorage:', rpcUrl);
          provider = new ethers.JsonRpcProvider(rpcUrl);
        } else {
          console.log('   ✓ Usando RPC por defecto: http://localhost:8545');
          provider = new ethers.JsonRpcProvider('http://localhost:8545');
        }
        
        console.log('\n📦 Creando instancia del contrato...');
        const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
        
        console.log(`\n📞 Llamando: contract.getUserByUsername("${currentUser.username}")\n`);
        const [username, role, active, registeredAt, activeWallet] = 
          await contract.getUserByUsername(currentUser.username);
        
        console.log('✅ Respuesta recibida:');
        console.log(`   username: ${username}`);
        console.log(`   role: ${role}`);
        console.log(`   active: ${active}`);
        console.log(`   registeredAt: ${new Date(Number(registeredAt) * 1000).toLocaleString()}`);
        console.log(`   activeWallet: ${activeWallet}`);
        
        blockchainData = {
          username,
          role,
          active,
          registeredAt: new Date(Number(registeredAt) * 1000).toISOString(),
          walletAddress: activeWallet === ethers.ZeroAddress ? null : activeWallet,
        };
        
        console.log('\n✅ blockchainData creado:');
        console.log(JSON.stringify(blockchainData, null, 2));
        
      } catch (err) {
        console.error('❌ Error al obtener datos del blockchain:', err.message);
        blockchainData = null;
      }
    }
    
    // Usar datos del blockchain si están disponibles
    const walletAddress = blockchainData?.walletAddress || currentUser.walletAddress || null;
    
    console.log('\n📊 Resultado final:');
    console.log(`   walletAddress: ${walletAddress}`);
    console.log(`   isOnchain: ${blockchainData ? 'true' : 'false'}`);
    
    if (walletAddress) {
      console.log('\n✅ SUCCESS: UserProfile mostraría la wallet activa del usuario');
    } else {
      console.log('\n❌ PROBLEM: UserProfile NO tendría wallet para mostrar');
    }
    
  } catch (err) {
    console.error('❌ Error fatal:', err);
  }
}

testUserProfileLogic().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
