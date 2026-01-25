const { ethers } = require('ethers');
const fs = require('fs');

async function queryUser() {
  const contractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
  const rpcUrl = 'http://localhost:8545';
  
  // Leer ABI
  const abiPath = './frontend/src/config/abi.js';
  let abi = [];
  
  try {
    // Intentar cargar desde abi.js
    const content = fs.readFileSync(abiPath, 'utf8');
    const match = content.match(/export const CONTRACT_ABI = (\[[\s\S]*?\]);/);
    if (match) {
      abi = JSON.parse(match[1]);
    }
  } catch (e) {
    console.log('No se pudo cargar ABI desde archivo, usando ABI mínimo');
    abi = [
      {
        "inputs": [{"internalType": "string", "name": "username", "type": "string"}],
        "name": "getUserByUsername",
        "outputs": [
          {"internalType": "string", "name": "", "type": "string"},
          {"internalType": "string", "name": "", "type": "string"},
          {"internalType": "bool", "name": "", "type": "bool"},
          {"internalType": "uint256", "name": "", "type": "uint256"},
          {"internalType": "address", "name": "", "type": "address"},
          {"internalType": "address[]", "name": "", "type": "address[]"}
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "ASSET_CREATOR_ROLE",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "bytes32", "name": "role", "type": "bytes32"},
          {"internalType": "address", "name": "account", "type": "address"}
        ],
        "name": "hasRole",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
  }
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    console.log('🔍 Consultando usuario "ass" en blockchain...\n');
    
    const userInfo = await contract.getUserByUsername('ass');
    
    console.log('📋 DATOS DEL USUARIO "ass":');
    console.log('  Username:', userInfo[0]);
    console.log('  Role:', userInfo[1]);
    console.log('  Active:', userInfo[2]);
    console.log('  Registered At:', new Date(Number(userInfo[3]) * 1000).toISOString());
    console.log('  Active Wallet:', userInfo[4]);
    console.log('  Wallets Array:', userInfo[5]);
    
    // Verificar si tiene el rol ASSET_CREATOR
    const ASSET_CREATOR_ROLE = await contract.ASSET_CREATOR_ROLE();
    console.log('\n🔐 VERIFICACIÓN DE ROLES:');
    console.log('  ASSET_CREATOR_ROLE:', ASSET_CREATOR_ROLE);
    
    if (userInfo[4] && userInfo[4] !== ethers.ZeroAddress) {
      const hasRole = await contract.hasRole(ASSET_CREATOR_ROLE, userInfo[4]);
      console.log('  ¿Active Wallet (' + userInfo[4] + ') tiene ASSET_CREATOR_ROLE?:', hasRole);
      
      if (!hasRole) {
        console.log('\n❌ PROBLEMA ENCONTRADO:');
        console.log('  - La wallet está vinculada al usuario');
        console.log('  - PERO no tiene el rol ASSET_CREATOR asignado');
        console.log('  - Por eso no puede registrar assets');
      }
    } else {
      console.log('  ⚠️ No hay wallet activa vinculada a "ass"');
      console.log('  - El usuario "ass" nunca vinculó su wallet');
    }
    
  } catch (err) {
    console.error('❌ Error consultando blockchain:', err.message);
  }
}

queryUser();
