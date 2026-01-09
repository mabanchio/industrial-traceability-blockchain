# 🔑 Claves Privadas de Hardhat - TFM3

## ⚠️ ADVERTENCIA CRÍTICA

**Estas claves son públicamente conocidas y solo para DESARROLLO LOCAL.**

- ❌ NUNCA usar en producción
- ❌ NUNCA usar en mainnet o testnets públicas
- ❌ NUNCA transferir fondos reales a estas cuentas
- ✅ Solo para desarrollo y testing local

---

## 📋 Cuentas de Hardhat (Red Local)

### CUENTA 0: Deployer/Owner (Admin)
```
Dirección:     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Clave Privada: ac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d4860fed8610d03b7c1c
Rol:           DEFAULT_ADMIN_ROLE
Saldo Inicial: 10,000 ETH (mock)
```

### CUENTA 1: Certificador (Certifier)
```
Dirección:     0x70997970C51812e339D9B73b0245ad39BeA34cAB
Clave Privada: 59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Rol:           CERTIFIER_ROLE
Saldo Inicial: 10,000 ETH (mock)
```

### CUENTA 2: Creador de Activos (Asset Creator)
```
Dirección:     0x3C44CdDdB6a900c6639BF7E247df19Fac95d563D
Clave Privada: 5de4111afa1a4b94908f83103db1snb6ac3002e0fc77bcb45423c3328de5eefd
Rol:           ASSET_CREATOR_ROLE
Saldo Inicial: 10,000 ETH (mock)
```

### CUENTA 3: Usuario Regular
```
Dirección:     0x8ba1f109551bD432803012645Ac136ddd64DBA72
Clave Privada: e2e7610ad0180f65bae896b0520b370145db310ca0e7ec6e9c3d4577d32be519
Rol:           Sin rol especial
Saldo Inicial: 10,000 ETH (mock)
```

### CUENTA 4: Usuario 2
```
Dirección:     0x976EA74026E726554dB657fA54763ab0C3da0126
Clave Privada: 0b6e3c119b129b26eec3ce4f27eeddcfd7564422f127a8ab17e5a01adeda3c23
Rol:           Sin rol especial
Saldo Inicial: 10,000 ETH (mock)
```

### CUENTA 5: Usuario 3
```
Dirección:     0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
Clave Privada: f214f2b2cd398c806f84e317254e0f0b801d0643303237609db8aaf1d9f3d4e7
Rol:           Sin rol especial
Saldo Inicial: 10,000 ETH (mock)
```

---

## 🔗 Configuración de Hardhat

### hardhat.config.js
```javascript
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: [
        {
          privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d4860fed8610d03b7c1c",
          balance: "10000000000000000000000"
        },
        // ... más cuentas
      ]
    }
  }
};
```

### Acceso en Scripts y Tests
```javascript
const [owner, certifier, assetCreator, user] = 
  await ethers.getSigners();

console.log(owner.address);        // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
console.log(certifier.address);    // 0x70997970C51812e339D9B73b0245ad39BeA34cAB
```

---

## 🦊 Conectar a MetaMask

### Paso 1: Abrir MetaMask
- Haz clic en el icono de MetaMask
- Selecciona "Importar Cuenta"

### Paso 2: Seleccionar Red Hardhat Local
Si no existe, crear una red personalizada:
- **Network Name:** Hardhat Local
- **RPC URL:** http://localhost:8545
- **Chain ID:** 31337
- **Currency Symbol:** ETH

### Paso 3: Importar Clave Privada
1. Copia la clave privada (SIN el prefijo "0x")
2. Ej: `ac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d4860fed8610d03b7c1c`
3. Pega en MetaMask
4. MetaMask calcula la dirección automáticamente

### Paso 4: Verificar Conexión
- Dirección debe coincidir con la tabla arriba
- Saldo debe mostrar ~10,000 ETH
- Red debe ser "Hardhat Local (31337)"

### Ejemplo: Importar Cuenta 0 (Owner)
```
1. Network: Hardhat Local (http://localhost:8545)
2. Clave Privada: ac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d4860fed8610d03b7c1c
3. Cuenta Importada: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
4. Saldo: 10,000.00 ETH
```

---

## 🧪 Prueba en Frontend

### Con Autenticación Completa:

1. Inicia servidor:
   ```bash
   cd frontend-demo
   node server.js
   ```

2. Abre http://localhost:3000
   
3. En pantalla de login:
   - Nombre: "Juan García"
   - Rol: "Certificador"
   - Conecta MetaMask (importa Cuenta 1)
   
4. MetaMask debe mostrar:
   ```
   Dirección: 0x70997970C51812e339D9B73b0245ad39BeA34cAB
   Red: Hardhat Local (31337)
   ```

5. Al hacer clic en "Iniciar Sesión":
   - Sistema vincula tu billetera
   - Acceso basado en rol del certificador

---

## 💡 Casos de Uso

### Caso 1: Registrar Activo
```
1. Login como Extractor (Cuenta 2)
2. Sistema asigna rol ASSET_CREATOR_ROLE
3. Puedes registrar activos
4. Transacciones firmadas con Cuenta 2
```

### Caso 2: Emitir Certificado
```
1. Login como Certificador (Cuenta 1)
2. Sistema asigna rol CERTIFIER_ROLE
3. Puedes emitir certificaciones
4. Transacciones firmadas con Cuenta 1
```

### Caso 3: Solo Lectura (Distribuidor)
```
1. Login como Distribuidor (Cuenta 3)
2. Sin rol especial en smart contract
3. Solo puede ver activos
4. No puede registrar ni certificar
```

---

## 🔄 Flujo Completo de Demostración

### Terminal 1: Iniciar Hardhat Node
```bash
npm run node
```
Verás:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts:
0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
1: 0x70997970C51812e339D9B73b0245ad39BeA34cAB
...
```

### Terminal 2: Iniciar Frontend
```bash
cd frontend-demo
node server.js
```

### Terminal 3: Abrir Navegador
```
http://localhost:3000
```

### Terminal 4: Usar MetaMask
1. Importa Cuenta 1 (Certificador)
2. Red: Hardhat Local
3. Saldo: 10,000 ETH

### Interactuar en Frontend
1. Login con MetaMask
2. Selecciona rol: Certificador
3. Conecta billetera (Cuenta 1)
4. ¡Empieza a auditar!

---

## 🔐 Seguridad en Producción

Si escalas a testnet o mainnet:

### ✅ USA
- Wallets de hardware (Ledger, Trezor)
- Mnemonics privadas en .env (nunca en git)
- Private keys generadas con ethers.Wallet.createRandom()

### ❌ NUNCA HAGAS
- Hardcodear claves privadas
- Usar claves públicamente conocidas
- Cometer claves privadas a git
- Compartir seedphrases

### Generador Seguro
```javascript
const newWallet = ethers.Wallet.createRandom();
console.log("Address:", newWallet.address);
console.log("Private Key:", newWallet.privateKey);
// Guarda SOLO en .env, NUNCA en código
```

---

## 📊 Tabla Resumen

| Cuenta | Dirección | Rol | Permisos |
|--------|-----------|-----|----------|
| 0 | 0xf39F... | ADMIN | Todas |
| 1 | 0x7099... | CERTIFIER | Certificaciones |
| 2 | 0x3C44... | ASSET_CREATOR | Registrar activos |
| 3 | 0x8ba1... | - | Solo lectura |
| 4 | 0x976E... | - | Solo lectura |
| 5 | 0x14dC... | - | Solo lectura |

---

## 📚 Referencias

- [Hardhat Documentation](https://hardhat.org/docs)
- [MetaMask Documentation](https://docs.metamask.io/)
- [ethers.js Signers](https://docs.ethers.org/v6/api/signer/)

---

**TFM3 - Trazabilidad Industrial con Blockchain** | 2026
