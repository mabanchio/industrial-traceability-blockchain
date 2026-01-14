// Pegue este código en la consola del navegador (F12 → Console) para diagnosticar MetaMask

console.log('=== DIAGNÓSTICO DE METAMASK ===\n');

// 1. Verificar si MetaMask está disponible
console.log('1. ¿MetaMask instalado?', !!window.ethereum);
console.log('   window.ethereum:', window.ethereum);

// 2. Verificar ethers.js
console.log('\n2. ¿ethers disponible?', !!ethers);
if (ethers) {
  console.log('   ethers version:', ethers.version);
}

// 3. Intentar obtener cuentas
if (window.ethereum) {
  console.log('\n3. Obteniendo cuentas de MetaMask...');
  window.ethereum.request({ method: 'eth_accounts' })
    .then(accounts => {
      console.log('   ✅ Cuentas actuales:', accounts);
      if (accounts.length === 0) {
        console.log('   ⚠️ No hay cuentas conectadas aún');
      }
    })
    .catch(err => console.error('   ❌ Error:', err));
} else {
  console.log('\n3. ❌ MetaMask no disponible, no se pueden obtener cuentas');
}

// 4. Verificar localStorage
console.log('\n4. Datos en localStorage:');
const currentUser = localStorage.getItem('currentUser');
const allUsers = localStorage.getItem('allUsers');
console.log('   currentUser:', currentUser ? JSON.parse(currentUser) : 'vacío');
console.log('   allUsers:', allUsers ? JSON.parse(allUsers) : 'vacío');

// 5. Función para probar solicitud manual
window.testMetaMask = async function() {
  try {
    console.log('\n=== PRUEBA MANUAL DE CONEXIÓN ===');
    console.log('Solicitando acceso a MetaMask...');
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    console.log('✅ Éxito! Cuentas:', accounts);
    if (accounts.length > 0) {
      const formatted = ethers.getAddress(accounts[0]);
      console.log('✅ Wallet formateada:', formatted);
      return formatted;
    }
  } catch (err) {
    console.error('❌ Error:', err.code, err.message);
  }
};

console.log('\n💡 Tip: Para probar la conexión, ejecuta: testMetaMask()');
console.log('=== FIN DEL DIAGNÓSTICO ===\n');
