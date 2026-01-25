const { ethers } = require('ethers');

async function checkRole() {
  const contractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
  const walletAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  const rpcUrl = 'http://localhost:8545';
  
  const abi = [
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
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    const ASSET_CREATOR_ROLE = await contract.ASSET_CREATOR_ROLE();
    console.log('ASSET_CREATOR_ROLE:', ASSET_CREATOR_ROLE);
    
    const hasRole = await contract.hasRole(ASSET_CREATOR_ROLE, walletAddress);
    
    console.log('\n🔍 VERIFICACIÓN DE ROL:');
    console.log('  Wallet: ' + walletAddress);
    console.log('  ¿Tiene ASSET_CREATOR_ROLE?:', hasRole);
    
    if (!hasRole) {
      console.log('\n❌ PROBLEMA CONFIRMADO:');
      console.log('  La wallet está vinculada pero NO tiene el rol asignado');
      console.log('  Esto causa que no pueda registrar assets');
    } else {
      console.log('\n✅ Todo OK: La wallet tiene el rol');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkRole();
