# 👥 Gestión de Usuarios y Roles - Guía de Administración

## 📋 Descripción General

El sistema TFM3 ahora incluye un completo sistema de gestión de usuarios con autenticación y control de acceso basado en roles (RBAC). Cada usuario está vinculado a una dirección de wallet Ethereum y tiene un rol asignado que determina sus permisos.

## 🔑 Conceptos Clave

### Usuario
- **Dirección de Wallet**: Identificador único del usuario en Ethereum
- **Nombre de Usuario**: Nombre para identificar al usuario en la interfaz
- **Rol**: Define qué funciones puede ejecutar (ver roles abajo)
- **Estado**: Activo o Inactivo

### Roles Disponibles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **ADMIN** | Administrador del sistema | - Registrar usuarios<br>- Asignar/cambiar roles<br>- Desactivar usuarios<br>- Acceso a todos los módulos |
| **CERTIFIER** | Certificador técnico | - Emitir certificaciones<br>- Renovar certificaciones<br>- Revocar certificaciones<br>- Ver dashboard |
| **ASSET_CREATOR** | Creador de activos | - Registrar activos<br>- Desactivar activos<br>- Ver estado de activos<br>- Ver dashboard |
| **MANUFACTURER** | Fabricante | - Registrar activos<br>- Emitir certificaciones<br>- Acceso completo a activos y certificaciones |
| **DISTRIBUTOR** | Distribuidor | - Ver activos y certificaciones<br>- Acceso de lectura al sistema |
| **AUDITOR** | Auditor | - Ver historial completo<br>- Verificar integridad de datos<br>- Generar reportes (rol por defecto) |

## 🚀 Flujo de Usuario

### 1. Registro e Ingreso (Usuario)

```
Usuario → Conecta MetaMask → Ingresa usuario → Aguarda registro del Admin
```

**Pasos:**
1. El usuario abre la aplicación
2. Hace clic en "🦊 Conectar MetaMask"
3. Confirma la conexión en MetaMask
4. Ingresa su nombre de usuario
5. Inicia sesión (se guarda localmente)
6. **Espera a que el administrador lo registre en el sistema**

### 2. Registro de Usuario (Administrador)

```
Admin → Panel de Administración → Registrar Nuevo Usuario
```

**Pasos:**
1. El administrador accede a "⚙️ Administración"
2. En "Registrar Nuevo Usuario", completa:
   - **Dirección de Wallet**: La wallet del usuario (0x...)
   - **Nombre de Usuario**: Nombre para identificar
   - **Rol**: Selecciona el rol apropiado
3. Hace clic en "✅ Registrar Usuario"
4. Se registra en la blockchain y en localStorage

### 3. Cambio de Rol (Administrador)

```
Admin → Panel de Administración → Gestionar Usuarios → Cambiar Rol
```

**Pasos:**
1. En "Gestionar Usuarios", busca el usuario
2. En la columna "Acciones", selecciona el nuevo rol
3. Automáticamente se actualiza el rol y los permisos

### 4. Desactivación de Usuario (Administrador)

```
Admin → Panel de Administración → Gestionar Usuarios → Desactivar
```

**Pasos:**
1. En "Gestionar Usuarios", busca el usuario
2. Hace clic en botón "Desactivar"
3. Confirma la acción
4. El usuario queda inactivo y sin permisos

## 💻 Interfaz de Usuario

### Pantalla de Login

```
┌─────────────────────────────────────┐
│  🔐 Gestión de Usuarios TFM3       │
│                                     │
│  Conecta tu billetera MetaMask      │
│  para acceder al sistema            │
│                                     │
│  [🦊 Conectar MetaMask]            │
│                                     │
│  💡 Nota: Tu wallet se vinculará   │
│     a tu cuenta. El administrador   │
│     deberá registrarte y asignarte  │
│     un rol para operar en sistema.  │
└─────────────────────────────────────┘
```

### Panel de Mi Perfil

```
┌─────────────────────────────────────┐
│  👤 Mi Perfil                       │
│                                     │
│  Nombre de Usuario: Juan Pérez      │
│  Rol Asignado: CERTIFIER            │
│  Estado: ✅ Activo                  │
│                                     │
│  Dirección de Wallet:               │
│  0x742d35Cc6634C0532925a3b844Bc...│
│  [📋 Copiar]                       │
│                                     │
│  Fecha de Registro: 14/01/2025      │
│                                     │
│  [🚪 Cerrar Sesión]                │
└─────────────────────────────────────┘
```

### Panel de Administración

```
┌─────────────────────────────────────┐
│  ⚙️ Panel de Administración         │
│                                     │
│  📝 Registrar Nuevo Usuario          │
│  ┌─────────────────────────────┐   │
│  │ Dirección de Wallet: [    ]│   │
│  │ Nombre de Usuario:  [    ]│   │
│  │ Rol:                [CERTIF] │   │
│  │         [✅ Registrar Usuario]  │
│  └─────────────────────────────┘   │
│                                     │
│  👥 Gestionar Usuarios              │
│  Filtrar por rol: [Todos      ▼]   │
│  ┌──────────────────────────────┐  │
│  │ Nombre │ Wallet │ Rol │ Acciones│
│  ├──────────────────────────────┤  │
│  │ Juan   │ 0x74.. │CERT│[DIST▼] │
│  │        │        │    │[Desact] │
│  └──────────────────────────────┘  │
│  Total usuarios activos: 1          │
└─────────────────────────────────────┘
```

## 📊 Estructura de Datos

### Smart Contract: User Struct

```solidity
struct User {
    address walletAddress;     // Dirección de Ethereum
    string username;            // Nombre de usuario
    string role;               // Rol asignado
    bool active;               // Estado activo/inactivo
    uint256 registeredAt;      // Timestamp de registro
}
```

### Almacenamiento Local (localStorage)

**currentUser:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc...",
  "username": "Juan Pérez",
  "role": "CERTIFIER",
  "timestamp": "2025-01-14T10:30:00Z"
}
```

## 🔒 Control de Acceso

### Validación en Frontend

Cada tab muestra solo según el rol:

```javascript
// Rol ASSET_CREATOR o MANUFACTURER
→ Ve pestaña "📦 Activos"

// Rol CERTIFIER o MANUFACTURER
→ Ve pestaña "✅ Certificaciones"

// Rol ADMIN
→ Ve pestaña "⚙️ Administración"
```

### Validación en Smart Contract

Las funciones están protegidas con `onlyRole()`:

```solidity
// Solo CERTIFIER
function issueCertificate(...) external onlyRole(CERTIFIER_ROLE)

// Solo ADMIN
function registerUser(...) external onlyRole(DEFAULT_ADMIN_ROLE)
```

## 📝 Eventos Blockchain

El sistema emite eventos para auditoría:

```solidity
event UserRegistered(address indexed walletAddress, string username, string role);
event RoleAssigned(address indexed walletAddress, string role);
event RoleRevoked(address indexed walletAddress, string role);
```

## 🔑 Cuentas Especiales

### Cuenta Administrador (Hardhat)

```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb476chadce4e649a3a23d8491c
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Este es el administrador principal del sistema.**

## ⚙️ Configuración Recomendada para Presentación

### Admin/Demostración
1. **Usuario Admin**
   - Wallet: Cuenta principal de Hardhat
   - Rol: Administrador
   - Función: Gestionar otros usuarios

### Usuarios Demo
2. **Usuario Certificador**
   - Nombre: Ana García
   - Rol: CERTIFIER
   - Función: Emitir certificaciones

3. **Usuario Fabricante**
   - Nombre: Carlos López
   - Rol: MANUFACTURER
   - Función: Crear activos y certificaciones

4. **Usuario Auditor**
   - Nombre: Diana Chen
   - Rol: AUDITOR
   - Función: Ver y verificar datos

## 🚨 Troubleshooting

### "Usuario no encontrado"
- Asegúrate de que la wallet está registrada por el admin
- Verifica que la dirección sea correcta

### "Permisos insuficientes"
- Comprueba tu rol asignado
- El admin debe asignarte el rol correcto

### MetaMask no conecta
- Verifica que MetaMask esté instalado
- Asegúrate de estar en la red correcta (Hardhat local)
- Recarga la página si es necesario

### Cambios no se reflejan
- Los cambios en blockchain pueden tardar
- Recarga la página después de registrar un usuario

## 📱 Datos de Prueba

Para pruebas rápidas, puedes usar estas wallets de Hardhat:

```
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 - Admin
0x70997970C51812e339D9B73b0245Ad59c36A8026 - User 1
0x3C44CdDdB6a900c2Dd649fa3bC0aa98b5E6F8A31 - User 2
0x90F79bf6EB2c4f870365E785982E1f101E93b906 - User 3
0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 - User 4
```

## 📞 Soporte

Para problemas con:
- **Registro de usuarios**: Revisa el Panel de Administración
- **Roles y permisos**: Consulta la tabla de roles
- **Transacciones blockchain**: Verifica el estado en la consola del navegador

---

**Última actualización:** 14 de enero de 2026
**Versión:** 2.0 (Con gestión de usuarios)
