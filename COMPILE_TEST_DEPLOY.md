# Compilación, Testing y Deployment - Guía Completa

## 📦 Compilación del Contrato

### Comando
```bash
npm run compile
```

### Equivalente (sin script)
```bash
npx hardhat compile
```

### ¿Qué hace?
1. Compila el código Solidity en [contracts/](contracts/) (especialmente [contracts/TraceabilityManager.sol](contracts/TraceabilityManager.sol))
2. Genera los artefactos en `artifacts/` con:
   - Bytecode compilado
   - ABI (Application Binary Interface)
   - Información de debugging

### Output esperado
```
Compiling 1 file with 0.8.24
TraceabilityManager.sol compiled successfully

Generated TypeChain types successfully
```

### Dependencias
- Solidity ^0.8.24 (especificado en [contracts/TraceabilityManager.sol](contracts/TraceabilityManager.sol))
- OpenZeppelin Contracts v5.4.0 (para AccessControl, ReentrancyGuard, etc.)

---

## 🧪 Testing

### Opción 1: Tests con Hardhat (JavaScript/Mocha)

#### Comando
```bash
npm run test
```

**Nota**: Hay un error de "Bus error" conocido en algunas configuraciones. Usa Forge como alternativa.

### Opción 2: Tests con Forge (Solidity) ⭐ RECOMENDADO

#### Instalación
```bash
# Instalar forge-std library
forge install foundry-rs/forge-std

# La configuración ya está en foundry.toml
```

#### Comando
```bash
forge test
```

#### Output esperado (10/10 tests passing)
```
Ran 10 tests for test/TraceabilityManager.t.sol:TraceabilityManagerTest
[PASS] test_assetCounterIncrementsCorrectly() (gas: 418205)
[PASS] test_deactivateAsset() (gas: 168923)
[PASS] test_deactivateAssetWithoutOwnershipShouldFail() (gas: 162408)
[PASS] test_issueCertificate() (gas: 360511)
[PASS] test_linkWalletToUser() (gas: 329536)
[PASS] test_registerAsset() (gas: 168877)
[PASS] test_registerAssetWithoutRoleShouldFail() (gas: 15337)
[PASS] test_registerUser() (gas: 168231)
[PASS] test_registerUserTwiceShouldFail() (gas: 161644)
[PASS] test_revokeCertificate() (gas: 362346)

Suite result: ok. 10 passed; 0 failed; 0 skipped
```

### Tests Disponibles con Forge

**Archivo**: [test/TraceabilityManager.t.sol](test/TraceabilityManager.t.sol)

**Tests implementados**:
1. ✅ **User Registration**
   - `test_registerUser()` - Registrar usuario correctamente
   - `test_registerUserTwiceShouldFail()` - No permitir duplicados

2. ✅ **Asset Registration**
   - `test_registerAsset()` - Registrar asset con datos correctos
   - `test_registerAssetWithoutRoleShouldFail()` - Solo ASSET_CREATOR puede registrar
   - `test_assetCounterIncrementsCorrectly()` - IDs auto-incrementan correctamente

3. ✅ **Asset Deactivation**
   - `test_deactivateAsset()` - Desactivar asset por propietario
   - `test_deactivateAssetWithoutOwnershipShouldFail()` - Solo propietario puede desactivar

4. ✅ **Wallet Linking**
   - `test_linkWalletToUser()` - Vincular wallet a usuario

5. ✅ **Certificates**
   - `test_issueCertificate()` - Emitir certificado correctamente
   - `test_revokeCertificate()` - Revocar certificado

### Ejecutar tests específicos

```bash
# Con Forge
forge test --match "test_registerAsset"
forge test -vvv                          # Con máxima verbosidad
forge test --watch                       # Watch mode para desarrollo
forge test --fuzz                        # Fuzzing tests (si existen)
```

### Diferencias: Hardhat vs Forge

| Aspecto | Hardhat | Forge |
|---------|---------|-------|
| Lenguaje | JavaScript/Mocha | Solidity |
| Compilador | Solidity 0.8.24 | Solc 0.8.33 |
| Velocidad | Lenta | Muy rápida |
| Gas Reports | ✅ Sí | ✅ Sí |
| Estado actual | ❌ Bus error | ✅ Funcionando |

---

## 🚀 Deployment del Contrato

### Comando
```bash
npm run deploy
```

### Equivalente (sin script)
```bash
npx hardhat run scripts/deploy.js
```

### ¿Dónde está el script?
[scripts/deploy.js](scripts/deploy.js) - Script de deployment

### ¿Qué hace el script?
El script típicamente:

1. **Obtiene signers** (cuentas que pueden firmar transacciones)
   ```javascript
   const [deployer] = await ethers.getSigners();
   ```

2. **Despliega el contrato**
   ```javascript
   const TraceabilityManager = await ethers.getContractFactory('TraceabilityManager');
   const contract = await TraceabilityManager.deploy();
   await contract.waitForDeployment();
   ```

3. **Guarda la dirección en localStorage** (para el frontend)
   ```javascript
   const contractAddress = await contract.getAddress();
   console.log('Contrato desplegado en:', contractAddress);
   ```

### Deployment a diferentes redes

#### Red Local (Hardhat Node)
```bash
# Terminal 1: Inicia el nodo
npm run node

# Terminal 2: Despliega en el nodo local
npm run deploy
```

**Red**: http://localhost:8545
**Chain ID**: 31337

#### Red Testnet (ej: Sepolia)
Requiere configurar en [hardhat.config.js](hardhat.config.js):
```javascript
networks: {
  sepolia: {
    url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    accounts: [PRIVATE_KEY],
  }
}
```

Luego:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Output esperado del deployment
```
TraceabilityManager deployed to: 0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9

✅ Contrato desplegado exitosamente
```

---

## 🔄 Flujo Completo: Compilar → Test → Deploy

### Paso a paso

#### 1. **Compilar**
```bash
npm run compile
```
**Output**: Genera artefactos en `artifacts/`

#### 2. **Ejecutar tests**
```bash
npm run test
```
**Output**: Todos los tests deben pasar ✔

#### 3. **Iniciar blockchain local** (en terminal separada)
```bash
npm run node
```
**Output**:
```
started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts:
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
(1) 0x70997970C51812e339D9B73b0245EFC292d00000
...
```

#### 4. **Desplegar** (en terminal diferente)
```bash
npm run deploy
```
**Output**:
```
TraceabilityManager deployed to: 0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9
```

#### 5. **Iniciar frontend** (en terminal diferente)
```bash
cd frontend && npm run dev
```
**Output**:
```
VITE v6.4.1  ready in 1234 ms

➜  Local:   http://localhost:5173/
```

#### 6. **Abrir en navegador**
```
http://localhost:5173
```

---

## 📋 Configuración de Hardhat

El archivo [hardhat.config.js](hardhat.config.js) especifica:

```javascript
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      // Red local integrada
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};
```

---

## 🔍 Verificar Compilación

### Artefactos generados
```bash
ls artifacts/contracts/
```

Debería mostrar:
```
TraceabilityManager.sol/
├── TraceabilityManager.json    (ABI + Bytecode)
└── ...
```

### Ver ABI del contrato
```bash
cat artifacts/contracts/TraceabilityManager.sol/TraceabilityManager.json | jq .abi
```

---

## 🐛 Debugging y Troubleshooting

### Error: "Cannot find module 'hardhat'"
```bash
npm install
```

### Error: "Compilation failed"
```bash
# Limpiar cache
rm -rf artifacts/ cache/

# Recompilar
npm run compile
```

### Error: "Network request failed"
```bash
# Verifica que el nodo esté corriendo
npm run node

# O especifica red diferente
npx hardhat run scripts/deploy.js --network hardhat
```

### Ver detalles de transacción
Después de deploy, el hash de transacción está en los logs. Puedes consultarlo:
```javascript
const receipt = await tx.wait();
console.log('Transaction hash:', receipt.transactionHash);
```

---

## 📊 Información del Contrato

**Ubicación**: [contracts/TraceabilityManager.sol](contracts/TraceabilityManager.sol)

**Estadísticas**:
- Líneas: 597
- Funciones: 41
- Eventos: 17
- Versión Solidity: ^0.8.24

**Dependencias**:
- OpenZeppelin AccessControl
- OpenZeppelin ReentrancyGuard
- OpenZeppelin Ownable (si aplica)

---

## 🎯 Comandos Rápidos

```bash
# Compilar
npm run compile

# Test
npm run test

# Deploy en local
npm run node &
npm run deploy

# Frontend
cd frontend && npm run dev

# Todo junto (3 terminales)
# Terminal 1:
npm run node

# Terminal 2:
npm run deploy

# Terminal 3:
cd frontend && npm run dev
```

---

## 📝 Scripts Disponibles

```bash
npm run test      # Ejecutar tests con Mocha
npm run compile   # Compilar contratos Solidity
npm run deploy    # Desplegar contrato en red configurada
npm run node      # Iniciar nodo Hardhat local
npm run frontend  # Instalar e iniciar frontend
```

---

## ✅ Checklist de Deployment

- [ ] Compilar: `npm run compile`
- [ ] Tests pasan: `npm run test`
- [ ] Nodo local corre: `npm run node`
- [ ] Desplegar: `npm run deploy`
- [ ] Dirección del contrato guardada
- [ ] Frontend obtiene dirección correcta
- [ ] Frontend conecta a contrato
- [ ] Pruebas en navegador funcionan
