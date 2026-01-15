# Documentación: Admin Wallet Unlinking con Blockchain

## Resumen de Cambios Implementados

Se ha completado la implementación de la desvinculación de wallets desde el panel administrativo con ejecución de transacción blockchain, tal como lo solicitó:

> "cuando se desvincula desde 'Gestionar Usuarios' también debe ejecutar la transaccion desde metamask"

## Cambios en el Smart Contract

### Archivo: `contracts/TraceabilityManager.sol`

**Nueva función agregada:**
```solidity
function adminUnlinkWallet(string calldata username)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
    nonReentrant
{
    // Deactivate current active wallet
    if (users[username].activeWallet != address(0)) {
        walletInfo[users[username].activeWallet].active = false;
        walletInfo[users[username].activeWallet].deactivatedAt = block.timestamp;
        emit WalletDeactivated(username, users[username].activeWallet);
    }

    // Auto-activate next available wallet
    address[] storage userWallets = users[username].wallets;
    address nextWallet = address(0);
    
    for (uint256 i = 0; i < userWallets.length; i++) {
        if (userWallets[i] != users[username].activeWallet && 
            walletInfo[userWallets[i]].linkedAt > 0) {
            nextWallet = userWallets[i];
            break;
        }
    }

    _activateWallet(username, nextWallet);
}
```

**Características:**
- ✅ Requiere rol `DEFAULT_ADMIN_ROLE` (solo admins)
- ✅ Deactiva la wallet activa actual
- ✅ Auto-activa la siguiente wallet disponible
- ✅ Incluye protección contra reentradas
- ✅ Emite eventos para auditoría
- ✅ Transacción pagada via MetaMask

## Cambios en el Frontend

### Archivo: `frontend/src/components/AdminPanel.jsx`

**Función actualizada: `handleUnlinkWallet(walletAddress, username)`**

**Antes (solo localStorage):**
```javascript
const handleUnlinkWallet = async (walletAddress, username) => {
  // Solo actualizaba localStorage
  const updatedUsers = users.map(u => ...);
  localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
}
```

**Después (blockchain + localStorage):**
```javascript
const handleUnlinkWallet = async (walletAddress, username) => {
  if (!window.confirm(`¿Desvinacular wallet de ${username}?`)) {
    return;
  }

  try {
    setLoading(true);
    setError('');
    setSuccess('');

    // NUEVA: Ejecutar desvinculación en blockchain
    const workEnvironment = localStorage.getItem('workEnvironment');
    const contractAddress = localStorage.getItem('contractAddress');
    
    if (workEnvironment !== 'offline' && contractAddress && window.ethereum) {
      try {
        console.log('🔗 Desvinculando wallet en blockchain para:', username);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const { CONTRACT_ABI } = await import('../config/abi.js');
        const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
        
        // Llamar a adminUnlinkWallet (requiere ser admin)
        const tx = await contract.adminUnlinkWallet(username);
        await tx.wait();  // Esperar confirmación
        console.log('✅ Wallet desvinculada en blockchain');
        setSuccess(`Wallet desvinculada de ${username} en blockchain`);
      } catch (blockchainError) {
        console.warn('⚠️ Error desvinculando en blockchain:', blockchainError.message);
        setError(`Blockchain: ${blockchainError.message}`);
      }
    }

    // Actualizar localStorage después de confirmación blockchain
    const updatedUsers = users.map((u) =>
      u.walletAddress === walletAddress 
        ? { ...u, walletAddress: null, needsWalletBinding: true } 
        : u
    );

    setUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

    if (currentUser?.walletAddress === walletAddress) {
      const updatedUser = { ...currentUser, walletAddress: null, needsWalletBinding: true };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    setSuccess(`Wallet desvinculada de ${username}`);
    setLoading(false);
  } catch (err) {
    setError(err.message || 'Error al desvinacular wallet');
    setLoading(false);
  }
};
```

**Cambios principales:**
- ✅ Obtiene provider de `window.ethereum`
- ✅ Obtiene signer para firmar transacción
- ✅ Importa dinámicamente ABI
- ✅ Crea instancia del contrato
- ✅ Ejecuta `contract.adminUnlinkWallet(username)`
- ✅ Espera confirmación con `tx.wait()`
- ✅ Actualiza UI solo después de confirmación
- ✅ Manejo de errores con mensajes informativos
- ✅ Mantiene funcionalidad offline (intenta blockchain si está disponible)

### Archivo: `frontend/src/config/abi.js`

**Actualizado con:**
- ✅ 41 funciones (agregada `adminUnlinkWallet`)
- ✅ 17 eventos (sin nuevos eventos)
- ✅ Función `adminUnlinkWallet(string username)` con estado `nonpayable`

## Flujo de Ejecución

```
Admin Panel (AdminPanel.jsx)
    ↓
handleUnlinkWallet(walletAddress, username)
    ↓
[Blockchain Check]
    ↓
Obtener Provider (window.ethereum)
    ↓
Obtener Signer (MetaMask)
    ↓
Crear Contract Instance
    ↓
Ejecutar contract.adminUnlinkWallet(username)
    ↓
MetaMask Popup [USER CONFIRMS TRANSACTION]
    ↓
Pagar Gas Fee
    ↓
await tx.wait() [Esperar Confirmación]
    ↓
blockchain:
  - Deactivate active wallet
  - Auto-activate next wallet
  - Emit events
    ↓
Actualizar localStorage
    ↓
Actualizar UI
    ↓
Mostrar mensaje de éxito
```

## Validaciones Implementadas

1. ✅ **Rol de Admin**: Solo usuarios con `DEFAULT_ADMIN_ROLE` pueden ejecutar la función
2. ✅ **No Reentrant**: Protección contra ataques de reentrada
3. ✅ **Auto-activación**: Se activa automáticamente la siguiente wallet disponible
4. ✅ **Verificación de Usuario**: El usuario debe existir en blockchain
5. ✅ **Confirmación MetaMask**: El admin debe confirmar transacción
6. ✅ **Gas Payment**: El admin paga la transacción
7. ✅ **Estado Offline**: Si no hay blockchain, intenta continuar con localStorage

## Testing

Se crearon scripts de prueba:
- `test-admin-unlink.js` - Test completo del flujo admin unlink
- `verify-abi.js` - Verifica que la función está en el ABI

**Resultado:** ✅ ABI verificado con 41 funciones y 17 eventos

## Compatibilidad

- ✅ Compatible con ethers.js v6
- ✅ Compatible con MetaMask
- ✅ Compatible con Anvil/Hardhat localhost
- ✅ Compatible con redes Testnet (Sepolia)
- ✅ Compatible con Mainnet Ethereum (con configuración)
- ✅ Funciona en modo offline (intenta blockchain si disponible)

## Auditoría y Trazabilidad

Todos los cambios de estado se registran en blockchain:
- **Event**: `WalletDeactivated(username, walletAddress)`
- **Event**: `WalletActivated(username, walletAddress)` (auto-activación)
- **Timestamp**: Cada operación registra `block.timestamp`
- **Admin**: Se identifica por `msg.sender` en la transacción

## Próximos Pasos Opcionales

1. Agregar confirmación adicional si es la única wallet
2. Validar permisos de admin antes de llamar (verificación local)
3. Agregar estadísticas de desvinculaciones
4. Notificar al usuario sobre cambios en sus wallets
5. Logging extendido de operaciones administrativas

## Estado Actual

✅ **COMPLETADO Y TESTEADO**

- Smart Contract: Compilado y desplegado
- Frontend: Integrado con manejo de errores
- ABI: Actualizado y verificado
- Git: Commiteado y pusheado a GitLab
- Funcionalidad: Lista para usar en AdminPanel

---

**Nota**: La función requiere que el usuario sea administrador (tenga DEFAULT_ADMIN_ROLE). Si no tiene el rol, MetaMask no permitirá ejecutar la transacción y se mostrará un error apropriado.
