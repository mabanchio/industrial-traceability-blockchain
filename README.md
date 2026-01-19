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
│   └── TraceabilityManager.sol         # Smart contract (700 líneas, 41 métodos)
├── test/
│   └── TraceabilityManager.t.sol       # Tests en Solidity (Foundry)
├── frontend/                            # Aplicación React + Vite
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AssetManager.jsx
│   │   │   ├── CertificateManager.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── AuditorPanel.jsx
│   │   │   ├── DistributorPanel.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Alert.jsx
│   │   └── config/
│   │       └── abi.js
│   ├── vite.config.js
│   └── package.json
├── scripts/
│   ├── deploy.js
│   ├── setup-users.js
│   └── otros scripts de utilidad
├── hardhat.config.js
├── foundry.toml
├── package.json
├── QUICK-START.md                      # Guía rápida
└── run-frontend.sh                     # Script para iniciar frontend
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
- **Dashboard**: Panel de información del sistema y estado de la red
- **Login**: Autenticación con validación blockchain y registro de usuarios
- **UserProfile**: Gestión de perfil de usuario y vinculación de múltiples wallets
- **AdminPanel**: Panel administrativo para gestión de usuarios, roles y desvinculación de wallets
- **AuditorPanel**: Panel de auditoría con vista de activos, certificados y generación de reportes
- **DistributorPanel**: Panel para distribuidores con visualización de activos, certificados y reportes
- **AssetManager**: Registro y gestión de activos industriales
- **CertificateManager**: Emisión, renovación y revocación de certificaciones
- **Alert**: Componente de alertas reutilizable

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

## � Panel de Distribuidor (Nuevo)

Implementación de panel completo para el rol DISTRIBUTOR:

- **Mis Activos**: Visualización filtrable de todos los activos del distribuidor
- **Certificaciones**: Vista de certificados con estado (válido/expirado/revocado)
- **Reportes**: Generación y descarga de reportes en JSON con estadísticas completas

**Características:**
- ✅ Búsqueda y filtrado en tiempo real
- ✅ Estadísticas resumidas
- ✅ Exportación de reportes
- ✅ Interfaz responsiva

## 📚 Documentación Adicional

- **[QUICK-START.md](./QUICK-START.md)** - Guía rápida de inicio paso a paso

## 🤖 Uso de Inteligencia Artificial

Este proyecto fue desarrollado con asistencia de IA (Claude). El desarrollo combinó:
- Smart contract optimizado en Solidity
- Frontend interactivo con React
- Integración blockchain con ethers.js
- Gestión de múltiples wallets y roles RBAC

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|------------|
| `npm run compile` | Compilar smart contract con Hardhat |
| `npm test` | Ejecutar tests con Hardhat |
| `npm run node` | Iniciar nodo Hardhat local (localhost:8545) |
| `npm run deploy` | Desplegar contrato en nodo local |
| `npm run frontend` | Instalar deps y ejecutar frontend (http://localhost:5173) |
| `./run-frontend.sh` | Script alternativo para iniciar frontend |

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
    uint256 assetId;          // ID único auto-incremental
    address owner;            // Propietario del activo
    bool active;              // Estado: activo/inactivo
    string assetType;         // Tipo de activo
    string description;       // Descripción detallada
}
```

### Certificate
```solidity
struct Certificate {
    uint256 certId;           // ID único auto-incremental
    uint256 assetId;          // ID del activo certificado
    uint256 issuedAt;         // Timestamp de emisión
    uint256 expiresAt;        // Timestamp de expiración
    address issuer;           // Dirección del certificador
    bool revoked;             // Estado: revocado o no
    string certType;          // Tipo de certificación
}
```

## 📜 Licencia

MIT License

## 👤 Autor

Trabajo Final de Máster en Blockchain

---

**Última actualización:** 19 de enero de 2026  
**Versión:** 3.0 - Limpieza y Distribuidor  
**Estado:** ✅ Producción
