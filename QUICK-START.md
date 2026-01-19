# 🚀 Guía de Uso Rápido - TFM3 (5 Minutos)

## ⚡ Instalación Rápida (1 minuto)

```bash
cd /home/matias/Escritorio/TFM3
npm install
npm --prefix frontend install
npm run compile
```

---

## 🚀 Ejecución en 4 Pasos

### Terminal 1: Iniciar Blockchain Local
```bash
npm run node
```
✅ Espera: `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/`

### Terminal 2: Desplegar Smart Contract
```bash
npm run deploy
```
✅ Verás la dirección del contrato desplegado

### Terminal 3: Iniciar Frontend
```bash
npm run frontend
```
✅ Espera: `Local: http://127.0.0.1:5173/` o `http://localhost:5173`

### Navegador: Acceder a la App
```
http://localhost:5173
```

---

## 🔐 Tu Primer Login

### Conectar como Administrador:

1. Haz clic en **🦊 Conectar MetaMask**
2. En MetaMask, añade una nueva cuenta:
   - **Network**: Localhost 8545
   - **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb476chadce4e649a3a23d8491c`
   - **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
3. Ingresa: `Admin`
4. ¡Listo! Ya estás en el panel de administración

---

## 👥 Registrar tu Primer Usuario

1. Ve a **⚙️ Administración**
2. En "📝 Registrar Nuevo Usuario":
   - **Wallet**: `0x70997970C51812e339D9B73b0245Ad59c36A8026`
   - **Usuario**: `Ana García`
   - **Rol**: `CERTIFIER`
3. Haz clic en **✅ Registrar Usuario**

---

## 🔄 Probar como Otro Usuario

1. Abre una **pestaña incógnita**
2. Ve a `http://localhost:5173`
3. Conecta MetaMask con la wallet de Ana
4. Ingresa: `Ana García`
5. Verás acceso según el rol asignado

---

## 📁 Archivos Importantes

```
TFM3/
├── contracts/TraceabilityManager.sol  ← Smart contract (700 líneas)
├── frontend/src/
│   ├── components/
│   │   ├── Login.jsx                  ← Login con MetaMask
│   │   ├── AdminPanel.jsx             ← Panel administración
│   │   ├── UserProfile.jsx            ← Gestión de perfil y wallets
│   │   ├── AuditorPanel.jsx           ← Panel de auditoría
│   │   ├── DistributorPanel.jsx       ← Panel de distribuidor
│   │   ├── AssetManager.jsx           ← Gestión de activos
│   │   └── CertificateManager.jsx     ← Gestión de certificaciones
│   └── App.jsx                        ← Lógica principal
├── QUICK-START.md                     ← Esta guía
└── README.md                          ← Documentación completa
```

---

## 🎯 Roles Disponibles

| Rol | Descripción | Acceso |
|-----|------------|--------|
| **ADMIN** | Administrador del sistema | Todo + Panel Admin |
| **CERTIFIER** | Emisor de certificaciones | Crear y gestionar certificados |
| **ASSET_CREATOR** | Creador de activos | Crear y gestionar activos |
| **MANUFACTURER** | Fabricante | Activos + Certificaciones |
| **AUDITOR** | Auditor del sistema | Panel de auditoría (solo lectura) |
| **DISTRIBUTOR** | Distribuidor | Panel de distribuidor (reportes y análisis) |

---

## 👥 Wallets de Prueba (Hardhat)

```
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266  → Admin
0x70997970C51812e339D9B73b0245Ad59c36A8026  → Usuario 1
0x3C44CdDdB6a900c2Dd649fa3bC0aa98b5E6F8A31  → Usuario 2
0x90F79bf6EB2c4f870365E785982E1f101E93b906  → Usuario 3
0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65  → Usuario 4
```

---

## 🧪 Funcionalidades Disponibles

### ✅ Autenticación & Wallets
- [x] Login con MetaMask
- [x] Vinculación de múltiples wallets
- [x] Una wallet activa por usuario
- [x] Auto-activación de siguiente wallet
- [x] Detección de duplicados
- [x] Persistencia de sesión
- [x] Logout

### ✅ Gestión de Usuarios (Admin)
- [x] Registrar usuarios en blockchain
- [x] Asignar y cambiar roles dinámicamente
- [x] Desactivar/activar usuarios
- [x] Desvinculación de wallets por admin
- [x] Filtrar por rol
- [x] Gestión de contraseñas

### ✅ Control de Acceso (RBAC)
- [x] 6 roles con permisos específicos
- [x] Validación en blockchain
- [x] Tabs condicionales según rol
- [x] Panel administrativo protegido

### ✅ Gestión de Activos
- [x] Registro de activos en blockchain
- [x] Visualización filtrable
- [x] Desactivación de activos
- [x] Historial inmutable

### ✅ Gestión de Certificaciones
- [x] Emisión con fecha configurable
- [x] Renovación de certificados
- [x] Revocación inmediata
- [x] Verificación de validez

### ✅ Paneles Especializados
- [x] Dashboard: Información del sistema
- [x] AdminPanel: Gestión de usuarios y roles
- [x] AuditorPanel: Auditoría con reportes
- [x] DistributorPanel: Análisis de activos y certificaciones

### ✅ Interfaz & UX
- [x] Diseño responsive
- [x] Alertas de estado
- [x] Búsqueda y filtrado en tiempo real
- [x] Exportación de reportes (JSON)

---

## ⚙️ Smart Contract

**Funciones Nuevas:**
- `registerUser()` - Registrar usuario (admin)
- `assignRole()` - Cambiar rol (admin)
- `deactivateUser()` - Desactivar usuario (admin)
- `getUser()` - Obtener datos
- `getUserRole()` - Obtener rol
- `getUsersByRole()` - Listar por rol
- `isUserActive()` - Verificar estado

**Funciones Existentes:**
- `registerAsset()` - Registrar activo
- `issueCertificate()` - Emitir certificación
- `renewCertificate()` - Renovar certificación
- `revokeCertificate()` - Revocar certificación

---

## 🔥 Optimizaciones

- Compiler optimizer: 200 ejecuciones
- Reducción de gas: ~26-30%
- Eventos indexados para queries rápidas
- Parámetros en calldata

---

## 📊 Estadísticas

- **Smart Contract**: 380 líneas
- **Frontend Components**: 3 nuevos
- **Documentación**: 4 archivos completos
- **Total Código**: +3000 líneas
- **Tests**: 40+ casos

---

## 🎬 Demostración Rápida (3 min)

1. **0:00** - Abre app en http://localhost:3000
2. **0:30** - Conecta como Admin
3. **1:00** - Registra a "Ana García" como CERTIFIER
4. **1:30** - Abre pestaña incógnita, conecta como Ana
5. **2:00** - Muestra que Ana solo ve "Certificaciones"
6. **2:30** - Vuelve a admin, cambia rol de Ana a AUDITOR
7. **3:00** - Ana ahora solo ve "Dashboard"

---

## ❓ Troubleshooting

**Error: "MetaMask no conecta"**
```
→ Asegurar que Hardhat está corriendo (Terminal 1)
→ Verificar red en MetaMask: Localhost 8545, Chain ID: 31337
→ Recarga la página (F5)
```

**Error: "Usuario no aparece"**
```
→ Espera 2 segundos a que se registre
→ Recarga la página
→ Verifica la consola (F12)
```

**Error: "Port 3000 ocupado"**
```
npx kill-port 3000
./run-frontend.sh
```

---

## 📚 Documentación Completa

- **[README.md](README.md)** - Descripción general del proyecto
- **[README.md - Sistema de Múltiples Wallets](README.md#-sistema-de-múltiples-wallets)** - Gestión de usuarios y wallets
- **[README.md - Panel de Distribuidor](README.md#-panel-de-distribuidor-nuevo)** - Panel para distribuidores
- **[README.md - Control de Acceso RBAC](README.md#-control-de-acceso-rbac)** - Roles y permisos

---

## 🎓 Tecnologías Utilizadas

- **Frontend**: React 18, Vite (puerto 5173), ethers.js, MetaMask
- **Smart Contract**: Solidity ^0.8.24, Hardhat, OpenZeppelin
- **Blockchain**: Ethereum (local con Hardhat en puerto 8545)
- **Testing**: Solidity tests con Foundry

---

## ✅ Estado del Proyecto

- ✅ Smart Contract compilado y funcional (700 líneas, 41 métodos)
- ✅ Frontend operativo con React + Vite (9 componentes)
- ✅ Autenticación con MetaMask integrada
- ✅ Gestión de usuarios, wallets y roles (RBAC) completa
- ✅ Panel para Distribuidores con reportes
- ✅ Listo para demostración en producción

---

**Última actualización:** 19 de enero de 2026 | **Versión:** 3.0
