# 🔐 Sistema de Autenticación y Control de Acceso - TFM3

## Resumen

El sistema TFM3 implementa un **modelo de autenticación basado en MetaMask** con **control de acceso por roles (RBAC)**. Esto asegura que solo usuarios autenticados y con permisos específicos puedan interactuar con funciones del sistema.

---

## 🔑 Flujo de Autenticación

### 1. **Login Inicial**
```
Usuario → Ingresa nombre/empresa → Selecciona rol → Conecta MetaMask
                                                           ↓
                                              Se valida la billetera
                                                           ↓
                                          Acceso al sistema otorgado
```

### 2. **Validación de MetaMask**
- El usuario debe tener MetaMask instalado
- Se solicita conexión a la billetera (`eth_requestAccounts`)
- La dirección de la billetera se vincula a la sesión del usuario
- Se almacena la dirección para transacciones blockchain

### 3. **Asignación de Roles**
El usuario selecciona su rol en el sistema (6 opciones):
- 🏗️ **Extractor**: Registra materias primas
- ⚙️ **Procesador**: Transforma en componentes
- 🏭 **Fabricante**: Ensambla productos
- 🚚 **Distribuidor**: Distribuye finales
- ✅ **Certificador**: Audita y emite certificados
- 🔍 **Auditor**: Inspecciona el sistema

---

## 👥 Roles y Permisos

### Tabla de Permisos por Rol

| Rol | Registrar Activos | Emitir Certificados | Ver Activos | Ver Certificados | Gestionar Roles |
|-----|---|---|---|---|---|
| **Extractor** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Procesador** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Fabricante** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Distribuidor** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Certificador** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Auditor** | ❌ | ❌ | ✅ | ✅ | ❌ |

### Implementación Técnica

```javascript
const rolePermissions = {
  extractor: {
    name: '🏗️ Extractor',
    permissions: ['registerAsset', 'viewAssets'],
    description: 'Registra materias primas y recursos naturales'
  },
  processor: {
    name: '⚙️ Procesador',
    permissions: ['registerAsset', 'viewAssets'],
    description: 'Transforma materias primas en componentes'
  },
  // ... más roles
};
```

---

## 🔗 Integración MetaMask

### Conectar Billetera

```javascript
async function connectMetaMask() {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  // accounts[0] = dirección de la billetera
}
```

**Qué sucede:**
1. Se abre modal de MetaMask
2. Usuario aprueba conexión
3. Se obtiene la dirección de la billetera
4. Se vincula a la sesión del usuario

### Información de Conexión Mostrada

```
Billetera: 0x742d35Cc6634C0532925a3b844Bc0cD226CfD30F
Red: Ethereum (Hardhat Local - Chain ID: 31337)
Rol: ✅ Certificador
Permisos: ['issueCertificate', 'revokeCertificate', 'viewAssets']
```

---

## 🛡️ Control de Acceso (RBAC)

### Validación en Frontend

```javascript
function updateAccessControl() {
  const canRegisterAsset = currentUser.permissions.includes('registerAsset');
  
  if (!canRegisterAsset) {
    document.getElementById('restrictedAssets').style.display = 'block';
    document.getElementById('registerAssetBtn').disabled = true;
  }
}
```

### Validación en Smart Contract (en producción)

```solidity
function registerAsset(string calldata assetType, string calldata description) 
  public 
  onlyRole(ASSET_CREATOR_ROLE) 
  returns (uint256) 
{
  // Solo usuarios con rol ASSET_CREATOR_ROLE pueden registrar activos
}
```

---

## 📋 Sesión de Usuario

### Datos Almacenados

```javascript
currentUser = {
  username: "Juan García",        // Nombre ingresado en login
  role: "certifier",               // Rol seleccionado
  address: "0x742d35Cc6634...",   // Dirección MetaMask
  permissions: ['issueCertificate', 'revokeCertificate', 'viewAssets'],
  roleInfo: { name: "✅ Certificador", ... }
}
```

### Información Mostrada en Header

```
┌─────────────────────────────────────────┐
│  Usuario: Juan García                   │
│  Rol: ✅ Certificador                   │
│  Billetera: 0x742d35Cc6634C0...         │
│  [Cerrar Sesión]                        │
└─────────────────────────────────────────┘
```

---

## 🚀 Operaciones por Rol

### Extractor (Registra Materias Primas)

**Permitido:**
- ✅ Registrar activo de tipo "materia_prima"
- ✅ Ver sus activos registrados

**Prohibido:**
- ❌ Emitir certificaciones
- ❌ Gestionar otros usuarios

**Ejemplo de Operación:**
```
1. Ingresa nombre: "Minería Central del Cobre"
2. Selecciona rol: "Extractor"
3. Conecta MetaMask
4. En dashboard, registra mineral de cobre
5. Sistema crea Asset ID #1234 en blockchain
6. Vinculado a dirección MetaMask: 0x742d35Cc6634...
```

### Certificador (Emite Certificados)

**Permitido:**
- ✅ Emitir certificaciones (ISO 9001, FSC, etc.)
- ✅ Renovar certificados válidos
- ✅ Revocar certificados
- ✅ Ver todos los activos y certificados

**Prohibido:**
- ❌ Registrar activos
- ❌ Eliminar activos de otros usuarios

**Ejemplo de Operación:**
```
1. Ingresa nombre: "DNV - Auditoría Industrial"
2. Selecciona rol: "Certificador"
3. Conecta MetaMask
4. En dashboard, emite ISO 14001 para Asset #1234
5. Establece validez: 365 días
6. Sistema crea Cert ID #5678 en blockchain
7. Evento `CertificateIssued` registra auditoría
```

---

## 🔄 Logout y Sesión

### Cerrar Sesión

```javascript
function logout() {
  currentUser = null;
  window.connectedAddress = null;
  // Regresa a pantalla de login
}
```

**Efecto:**
- ✅ Limpia datos del usuario en memoria
- ✅ Cierra sesión
- ✅ Vuelve a pantalla de login
- ✅ Desconecta MetaMask (opcional en navegador)

---

## 🔒 Seguridad

### Medidas Implementadas

1. **Validación en Tiempo Real**
   - Botones deshabilitados si faltan permisos
   - Mensajes de error para operaciones no autorizadas

2. **Vinculación a Billetera**
   - Cada acción se vincula a dirección MetaMask
   - Permite auditoría completa de quién hizo qué

3. **Separación de Funciones**
   - Cada rol solo ve sus funcionalidades permitidas
   - Interfaz se adapta dinámicamente

4. **Control en Smart Contract**
   - En producción, smart contract valida roles
   - OpenZeppelin AccessControl en backend

### Limitaciones Actuales

⚠️ **Frontend Demo:**
- Validación local (no requiere Hardhat node)
- Para producción, integrar con smart contract real

✅ **Smart Contract Disponible:**
- Ya implementa OpenZeppelin AccessControl
- 3 roles: ADMIN, CERTIFIER, ASSET_CREATOR

---

## 📡 Integración con Smart Contract

### Flujo Completo (Producción)

```
1. Usuario login en frontend con MetaMask
2. Frontend obtiene: username, role, address
3. Llamada a smart contract: `registerAsset(...)`
4. Smart contract valida: `onlyRole(ASSET_CREATOR_ROLE)`
5. Si OK: Asset registrado on-chain
6. Si FAIL: Transacción rechazada
7. Frontend muestra resultado
```

### Funciones Protegidas en Smart Contract

```solidity
// Solo creadores de activos
function registerAsset(...) 
  onlyRole(ASSET_CREATOR_ROLE) {}

// Solo certificadores
function issueCertificate(...) 
  onlyRole(CERTIFIER_ROLE) {}

// Solo admin
function grantCertifierRole(...) 
  onlyRole(DEFAULT_ADMIN_ROLE) {}
```

---

## 🧪 Prueba del Sistema

### Escenario 1: Extractor Registra Materia Prima

```
1. Login:
   - Nombre: "Minas del Sur"
   - Rol: Extractor
   - MetaMask: Conectado
   
2. Dashboard muestra:
   - ✅ Registrar Activos
   - ❌ Emitir Certificaciones (deshabilitado)
   - ✅ Ver Activos
   
3. Registra mineral:
   - Tipo: "materia_prima"
   - Descripción: "Litio grado industrial"
   - Asset #1 creado
```

### Escenario 2: Certificador Audita

```
1. Login:
   - Nombre: "DNV Certification"
   - Rol: Certificador
   - MetaMask: Conectado
   
2. Dashboard muestra:
   - ❌ Registrar Activos (deshabilitado)
   - ✅ Emitir Certificaciones
   - ✅ Ver Activos
   
3. Emite ISO 9001:
   - Asset ID: 1
   - Tipo: "ISO 9001"
   - Vencimiento: 365 días
   - Cert #1 creado
```

---

## 📊 Estadísticas de Rol

Cada usuario ve en el dashboard:

```
┌─────────────────────────────────┐
│  INFORMACIÓN DEL SISTEMA        │
├─────────────────────────────────┤
│  Rol Actual: ✅ Certificador    │
│  Permisos: 3                     │
│  • issueCertificate              │
│  • revokeCertificate             │
│  • viewAssets                    │
│                                  │
│  Descripción:                    │
│  "Audita y emite certificaciones"│
└─────────────────────────────────┘
```

---

## 🎯 Siguientes Pasos

Para integración completa con blockchain:

1. **Deploy Smart Contract**
   ```bash
   npx hardhat run scripts/deploy.js --network hardhat
   ```

2. **Conectar ABI en Frontend**
   ```javascript
   import { CONTRACT_ABI } from './config/abi.js';
   const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
   ```

3. **Enviar Transacciones**
   ```javascript
   const tx = await contract.connect(signer).registerAsset(
     assetType, 
     description
   );
   ```

4. **Validar en Smart Contract**
   - Smart contract verifica rol automáticamente
   - OpenZeppelin AccessControl maneja validación

---

## ✅ Resumen

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Login** | ✅ Implementado | Nombre + Rol + MetaMask |
| **MetaMask** | ✅ Integrado | Conexión y validación de billetera |
| **Roles** | ✅ 6 Disponibles | Extractor, Procesador, Fabricante, Distribuidor, Certificador, Auditor |
| **Permisos** | ✅ Asignados | Control granular por rol |
| **Interfaz** | ✅ Dinámica | Se adapta a permisos del usuario |
| **Smart Contract** | ✅ Listo | OpenZeppelin AccessControl implementado |
| **Auditoría** | ✅ Habilitada | Todas las acciones vinculadas a dirección MetaMask |

---

**TFM3 - Trazabilidad Industrial con Blockchain** | 2026
