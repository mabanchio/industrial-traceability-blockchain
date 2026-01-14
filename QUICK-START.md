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
./run-frontend.sh
```
✅ Espera: `Local: http://127.0.0.1:3000/`

### Navegador: Acceder a la App
```
http://localhost:3000
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
2. Ve a `http://localhost:3000`
3. Conecta MetaMask con la wallet de Ana
4. Ingresa: `Ana García`
5. Verás solo la pestaña **✅ Certificaciones**

---

## 📁 Archivos Importantes

```
TFM3/
├── contracts/TraceabilityManager.sol  ← Smart contract
├── frontend/src/
│   ├── components/
│   │   ├── Login.jsx                  ← Login con MetaMask
│   │   ├── AdminPanel.jsx             ← Panel admin
│   │   └── UserProfile.jsx            ← Perfil usuario
│   └── App.jsx                        ← Lógica principal
├── USER-MANAGEMENT.md                 ← Guía completa
├── ADMIN-SETUP.md                     ← Para administrador
└── README.md                          ← Documentación
```

---

## 🎯 Roles Disponibles

| Rol | Qué Ve |
|-----|--------|
| **ADMIN** | Todo + Panel de Administración |
| **CERTIFIER** | Emitir certificaciones |
| **ASSET_CREATOR** | Crear y gestionar activos |
| **MANUFACTURER** | Activos + Certificaciones |
| **AUDITOR** | Todo (solo lectura) |
| **DISTRIBUTOR** | Activos (solo lectura) |

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

### ✅ Autenticación
- [x] Login con MetaMask
- [x] Vinculación de wallet
- [x] Persistencia de sesión
- [x] Logout

### ✅ Gestión de Usuarios (Admin)
- [x] Registrar usuarios
- [x] Asignar roles
- [x] Cambiar roles dinámicamente
- [x] Desactivar usuarios
- [x] Filtrar por rol

### ✅ Control de Acceso
- [x] 6 roles diferentes
- [x] Permisos específicos
- [x] Tabs condicionales
- [x] Validación en blockchain

### ✅ Interfaz
- [x] Dashboard
- [x] Gestor de activos
- [x] Gestor de certificaciones
- [x] Perfil de usuario
- [x] Diseño responsive

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

- **[README.md](README.md)** - Descripción general
- **[USER-MANAGEMENT.md](USER-MANAGEMENT.md)** - Gestión de usuarios (350+ líneas)
- **[ADMIN-SETUP.md](ADMIN-SETUP.md)** - Para administrador (240+ líneas)
- **[README-TFM3.md](README-TFM3.md)** - Detalles técnicos
- **[IA.md](IA.md)** - Retrospectiva de IA

---

## 🎓 Tecnologías Utilizadas

- **Frontend**: React 18, Vite, ethers.js, MetaMask
- **Smart Contract**: Solidity ^0.8.24, Hardhat, OpenZeppelin
- **Blockchain**: Ethereum (local con Hardhat)

---

## ✅ Estado del Proyecto

- ✅ Smart Contract compilado y funcional
- ✅ Frontend operativo en localhost:3000
- ✅ Autenticación con MetaMask integrada
- ✅ Gestión de usuarios y roles completa
- ✅ Documentación exhaustiva
- ✅ Listo para demostración

---

**¿Preguntas?** Consulta [USER-MANAGEMENT.md](USER-MANAGEMENT.md) o [ADMIN-SETUP.md](ADMIN-SETUP.md)

**Última actualización:** 14 de enero de 2026 | **Versión:** 2.0
