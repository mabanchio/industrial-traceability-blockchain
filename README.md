# 🔗 Plataforma de Trazabilidad Industrial con Certificaciones Blockchain

## 📋 Descripción

Plataforma descentralizada (DApp) que implementa un sistema de trazabilidad industrial con certificaciones técnicas en Ethereum. Permite el registro on-chain de activos, emisión, renovación y revocación de certificaciones, con historial inmutable y auditable mediante smart contracts optimizados en gas.

## 🎯 Problema que Resuelve

La industria manufacturera enfrenta desafíos en:
- **Verificación de autenticidad** de activos y certificaciones
- **Trazabilidad opaca** en la cadena de suministro
- **Certificaciones falsificables** o difíciles de verificar
- **Falta de auditoría inmutable** del historial de cambios

Esta plataforma proporciona una solución blockchain que garantiza autenticidad, inmutabilidad y transparencia en toda la cadena de valor.

## 💻 Tecnologías Utilizadas

### Blockchain & Smart Contracts
- **Ethereum**: Red principal (testnet compatible)
- **Solidity**: ^0.8.24 - Lenguaje de smart contracts
- **Hardhat**: Framework de desarrollo y testing
- **OpenZeppelin**: Librerías de seguridad (AccessControl, ReentrancyGuard)

### Frontend
- **React**: 18.3.1 - Interfaz de usuario
- **Vite**: 6.4.1 - Build tool y dev server
- **ethers.js**: v6 - Librería Web3
- **MetaMask**: Integración de billetera

### Testing & Desarrollo
- **Mocha/Chai**: Framework de testing
- **Node.js**: v18+
- **npm**: Gestor de dependencias

## 🏗️ Estructura del Proyecto

```
TFM3/
├── contracts/
│   └── TraceabilityManager.sol         # Smart contract (164 líneas)
├── test/
│   └── TraceabilityManager.test.js     # Tests (375 líneas, 40+ casos)
├── frontend/                            # Aplicación React + Vite
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AssetManager.jsx
│   │   │   └── CertificateManager.jsx
│   │   └── config/
│   │       └── abi.js
│   ├── index.html
│   └── package.json
├── docs/                                # Documentación
├── hardhat.config.js
├── package.json
├── IA.md                               # Retrospectiva de IA
├── QUICK-START.md                      # Guía rápida
├── README-TFM3.md                      # Detalles técnicos
└── run-frontend.sh                     # Script de deploy

```

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js v18+ y npm
- MetaMask instalado en el navegador

### 1. Instalación

```bash
# Instalar dependencias del proyecto
npm install

# Instalar dependencias del frontend
npm --prefix frontend install
```

### 2. Compilar Smart Contract

```bash
npm run compile
```

### 3. Ejecutar Tests

```bash
npm test
```

### 4. Iniciar Hardhat Node (Terminal 1)

```bash
npm run node
```

### 5. Desplegar Smart Contract (Terminal 2)

```bash
npm run deploy
```

### 6. Ejecutar Frontend (Terminal 3)

```bash
npm --prefix frontend run dev
```

Accede a **http://localhost:3000**

## 📊 Características Principales

### Smart Contract (TraceabilityManager.sol)

#### Funcionalidades

1. **Gestión de Usuarios y Wallets** (Nuevo)
   - Registrar usuarios en blockchain sin wallet inicial
   - Vincular múltiples wallets a cada usuario
   - Solo una wallet activa por usuario
   - Auto-activación de siguiente wallet al desvincular
   - Detección de wallets duplicadas (reactivación si existe)
   - Desvinculación admin desde panel administrativo

2. **Gestión de Activos**
   - Registrar nuevos activos en blockchain
   - Desactivar activos existentes

3. **Gestión de Certificaciones**
   - Emitir nuevas certificaciones
   - Renovar certificaciones existentes
   - Revocar certificaciones
   - Verificar validez de certificaciones

4. **Control de Acceso**
   - 6 roles RBAC: Extractor, Processor, Manufacturer, Distributor, Certifier, Auditor
   - Gestión dinámica de permisos

#### Optimizaciones de Gas

- **Reducción de gas**: ~26-30%
- **Técnicas aplicadas**:
  - Compilador optimizer (200 ejecuciones)
  - Parámetros en calldata
  - Operadores post-incremento optimizados
  - Event indexing para auditoría eficiente

**Estadísticas:**
- Bytecode: ~6KB
- Métodos: 41 (incluyendo nuevas funciones de wallets)
- Eventos: 17 (incluyendo eventos de wallets)

### Frontend

#### Componentes React
- Dashboard
- AssetManager
- CertificateManager
- Login (con validación blockchain)
- UserProfile (con gestión de wallets)
- AdminPanel (con desvinculación blockchain)

#### Funcionalidades

- ✅ Conexión automática a MetaMask
- ✅ Registro de usuarios en blockchain
- ✅ Vinculación/desvinculación de múltiples wallets
- ✅ Panel administrativo para gestión de usuarios
- ✅ Desvinculación de wallets por admin vía blockchain
- ✅ Visualización de activos registrados
- ✅ Creación y gestión de certificaciones
- ✅ Historial inmutable de transacciones
- ✅ Interfaz responsiva y moderna

## � Sistema de Múltiples Wallets

### Características

- **Múltiples wallets por usuario**: Cada usuario puede vincular varias wallets a su cuenta
- **Una wallet activa**: Solo una wallet está activa en cada momento
- **Auto-activación**: Al desvincular la wallet activa, se activa automáticamente la siguiente
- **Detección de duplicados**: Si se vincula una wallet previamente asociada, se reactiva
- **Desvinculación admin**: Los administradores pueden desvincular wallets desde el panel
- **Blockchain verificado**: Todas las operaciones se registran en blockchain

### Flujo de Registro

```
Usuario intenta iniciar sesión
    ↓
¿Usuario existe en blockchain?
    ├─ NO → Registrar usuario + vincular wallet actual
    ├─ SÍ + wallet activa → Login directo
    └─ SÍ + sin wallet → Solicitar vinculación de wallet
```

### Estructura de Datos

```solidity
struct User {
    string username;
    string role;
    bool active;
    uint256 registeredAt;
    address activeWallet;     // Wallet activa actual
    address[] wallets;         // Array de todas las wallets
}

struct WalletInfo {
    address walletAddress;
    bool active;
    uint256 linkedAt;
    uint256 deactivatedAt;
}
```

### Operaciones de Wallet

#### Usuario: Vincular nueva wallet
- Usuario va a UserProfile
- Conecta MetaMask con nueva wallet
- Confirma transacción
- Si wallet es nueva → se activa como wallet activa
- Si wallet existe → se reactiva sin crear duplicado

#### Usuario: Desactivar wallet
- Usuario va a UserProfile
- Click en desvincular
- Confirma transacción en MetaMask
- Wallet actual se desactiva
- Siguiente wallet disponible se activa automáticamente

#### Admin: Desactivar wallet de usuario
- Admin va a AdminPanel → Gestionar Usuarios
- Click en desvincular wallet
- Confirma transacción en MetaMask
- Ejecuta `adminUnlinkWallet()` en blockchain
- Wallet se desactiva
- Siguiente wallet se activa automáticamente

## �🔒 Control de Acceso (RBAC)

Sistema de 6 roles con permisos específicos:

| Rol | Descripción |
|-----|-------------|
| **Extractor** | Extrae y registra materias primas |
| **Processor** | Procesa materias primas |
| **Manufacturer** | Manufactura productos finales |
| **Distributor** | Distribuye productos |
| **Certifier** | Emite y verifica certificaciones |
| **Auditor** | Audita y verifica integridad |

## 📈 Tests

**Cobertura: 40+ casos de prueba**

```bash
npm test
```

Pruebas incluidas:
- ✅ Registro y desactivación de activos
- ✅ Emisión y renovación de certificaciones
- ✅ Revocación y validez de certificaciones
- ✅ Control de roles y permisos
- ✅ Optimizaciones de gas
- ✅ Validaciones de entrada

## 📚 Documentación Adicional

- **[QUICK-START.md](./QUICK-START.md)** - Guía rápida de inicio
- **[README-TFM3.md](./README-TFM3.md)** - Detalles técnicos y arquitectura
- **[ADMIN_UNLINK_IMPLEMENTATION.md](./ADMIN_UNLINK_IMPLEMENTATION.md)** - Detalles de desvinculación admin via blockchain
- **[IA.md](./IA.md)** - Retrospectiva de uso de Inteligencia Artificial

## 🤖 Uso de Inteligencia Artificial

Este proyecto fue desarrollado con asistencia de IA. Consulta [IA.md](./IA.md) para:
- Herramientas de IA utilizadas
- Tiempo consumido (smart contract vs frontend)
- Análisis de errores comunes
- Referencias a sesiones de chat

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|------------|
| `npm run compile` | Compilar smart contract |
| `npm test` | Ejecutar tests |
| `npm run node` | Iniciar nodo Hardhat local |
| `npm run deploy` | Desplegar contrato |
| `npm run verify` | Verificar proyecto |
| `./run-frontend.sh` | Iniciar frontend |
| `npx hardhat run test-multiple-wallets.js` | Test sistema múltiples wallets |
| `npx hardhat run test-admin-unlink.js` | Test desvinculación admin |

## 🔗 Estructuras de Datos del Smart Contract

### User (Nuevo)
```solidity
struct User {
    string username;
    string role;
    bool active;
    uint256 registeredAt;
    address activeWallet;
    address[] wallets;
}
```

### WalletInfo (Nuevo)
```solidity
struct WalletInfo {
    address walletAddress;
    bool active;
    uint256 linkedAt;
    uint256 deactivatedAt;
}
```

### Asset
```solidity
struct Asset {
    uint256 id;
    address owner;
    string description;
    uint256 registrationDate;
    bool active;
}
```

### Certificate
```solidity
struct Certificate {
    uint256 id;
    uint256 assetId;
    string certificationName;
    address issuer;
    uint256 issueDate;
    uint256 expirationDate;
    bool revoked;
}
```

## 📜 Licencia

MIT License

## 👤 Autor

Trabajo Final de Máster en Blockchain

---

**Última actualización:** 15 de enero de 2026  
**Versión:** 2.0 - Sistema de Múltiples Wallets  
**Estado:** ✅ Producción
