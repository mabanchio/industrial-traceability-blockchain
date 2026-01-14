# 🚀 GUÍA RÁPIDA - ADMINISTRADOR DEL SISTEMA

## ¿Eres el Administrador? Sigue estos pasos:

### PASO 1: Iniciar la Blockchain Local

**Terminal 1:**
```bash
cd /home/matias/Escritorio/TFM3
npm run node
```

Espera a ver:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### PASO 2: Desplegar el Smart Contract

**Terminal 2:**
```bash
npm run deploy
```

Verás algo como:
```
✅ Contrato desplegado en: 0x5FbDB2315678afccb333f8a9c12e1f0d7a8f7cbc
```

**Nota:** Copia esta dirección, la necesitarás más tarde.

### PASO 3: Actualizar la Dirección del Contrato (Opcional)

En `frontend/src/App.jsx`, línea ~12:
```javascript
const CONTRACT_ADDRESS = '0x5FbDB2315678afccb333f8a9c12e1f0d7a8f7cbc'; // Tu dirección
```

### PASO 4: Iniciar el Frontend

**Terminal 3:**
```bash
./run-frontend.sh
```

Verás:
```
VITE v6.4.1  ready in 700 ms
Local:   http://127.0.0.1:3000/
```

### PASO 5: Acceder al Sistema

Abre tu navegador:
```
http://localhost:3000
```

---

## 🔐 Tu Acceso como Administrador

### Conectar MetaMask

1. Haz clic en **🦊 Conectar MetaMask**
2. En MetaMask, selecciona la red **Localhost 8545**
3. Importa la cuenta de admin de Hardhat:

**Dirección:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

**Clave privada:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb476chadce4e649a3a23d8491c`

### Ingresa tu Usuario

Nombre: `Admin` (o cualquier nombre que prefieras)

4. Haz clic en **Iniciar Sesión**

---

## 👥 Registrar los Primeros Usuarios

Ya estás en el sistema. Ahora:

1. Haz clic en la pestaña **⚙️ Administración**
2. En "📝 Registrar Nuevo Usuario", completa:

### Ejemplo 1: Certificador

- **Dirección de Wallet:** `0x70997970C51812e339D9B73b0245Ad59c36A8026`
- **Nombre de Usuario:** `Ana García`
- **Rol:** `CERTIFIER`
- Haz clic en **✅ Registrar Usuario**

### Ejemplo 2: Fabricante

- **Dirección de Wallet:** `0x3C44CdDdB6a900c2Dd649fa3bC0aa98b5E6F8A31`
- **Nombre de Usuario:** `Carlos López`
- **Rol:** `MANUFACTURER`
- Haz clic en **✅ Registrar Usuario**

### Ejemplo 3: Auditor

- **Dirección de Wallet:** `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- **Nombre de Usuario:** `Diana Chen`
- **Rol:** `AUDITOR`
- Haz clic en **✅ Registrar Usuario**

---

## 🎮 Probar el Sistema

### Como Administrador:

1. Accede a **⚙️ Administración**
2. En "👥 Gestionar Usuarios":
   - **Filtrar por rol**: Cambia el rol de un usuario
   - **Desactivar**: Quita el acceso a un usuario

### Como Usuario Regular:

Para probar como otro usuario:

1. Abre una pestaña privada (Ctrl+Shift+Delete)
2. Abre `http://localhost:3000`
3. Conecta con una wallet diferente (ej: Ana García)
4. Ingresa su nombre y accede
5. Verás solo las funciones de su rol

---

## 📊 Roles y Sus Permisos

| Rol | Qué puede hacer |
|-----|-----------------|
| **ADMIN** | Registrar usuarios, cambiar roles, todo |
| **CERTIFIER** | Emitir y revocar certificaciones |
| **ASSET_CREATOR** | Registrar activos |
| **MANUFACTURER** | Crear activos + certificaciones |
| **AUDITOR** | Ver todo (lectura) |
| **DISTRIBUTOR** | Ver activos (lectura) |

---

## 🔧 Si Algo No Funciona

### "Error al conectar MetaMask"
- ✅ Asegúrate de que Hardhat está corriendo (Terminal 1)
- ✅ MetaMask debe estar en red "Localhost 8545"
- ✅ Recarga la página (F5)

### "Usuario no aparece en tabla"
- ✅ Espera unos segundos a que se registre
- ✅ Recarga la página
- ✅ Verifica la consola del navegador (F12)

### "No puedo cambiar rol"
- ✅ Solo el ADMIN puede cambiar roles
- ✅ Asegúrate de estar logueado como admin
- ✅ Verifica que el usuario esté registrado

### "El smart contract no se despliega"
- ✅ Verifica que Hardhat node está corriendo
- ✅ Ejecuta: `npm run compile` primero
- ✅ Mira los errores en Terminal 2

---

## 🎯 Demostración Rápida (5 minutos)

**Tiempo 0:00** - Abre navegador en `http://localhost:3000`

**Tiempo 0:30** - Conecta MetaMask como Admin

**Tiempo 1:00** - Registra a "Ana García" como CERTIFIER

**Tiempo 2:00** - Registra a "Carlos López" como MANUFACTURER

**Tiempo 3:00** - Abre pestaña privada, conecta como Ana

**Tiempo 3:30** - Muestra que Ana solo ve "✅ Certificaciones"

**Tiempo 4:00** - Vuelve a admin, cambia rol de Ana a AUDITOR

**Tiempo 4:30** - Recarga como Ana, ahora solo ve "📊 Dashboard"

---

## 💡 Consejos Útiles

1. **Usa diferentes navegadores** para probar como diferentes usuarios
2. **Abre DevTools (F12)** para ver errores en consola
3. **Guarda las direcciones de wallet** que uses frecuentemente
4. **Recarga la página** después de cambios importantes
5. **Copia las direcciones** de wallet con el botón 📋 Copiar

---

## 📁 Archivos Importantes

```
TFM3/
├── frontend/src/
│   ├── App.jsx                          ← Lógica principal
│   ├── components/
│   │   ├── Login.jsx                    ← Login
│   │   ├── AdminPanel.jsx               ← Panel admin
│   │   └── UserProfile.jsx              ← Perfil usuario
│   └── App.css                          ← Estilos
├── contracts/
│   └── TraceabilityManager.sol          ← Smart contract
└── USER-MANAGEMENT.md                   ← Doc completa
```

---

## 🚨 Estado del Sistema

- ✅ **Smart Contract**: Compilado y funcional
- ✅ **Frontend**: Operativo en http://localhost:3000
- ✅ **MetaMask**: Integrado
- ✅ **Base de Datos**: Blockchain local (Hardhat)

---

## 🎓 Próximas Funcionalidades

Para futuras mejoras:
- [ ] Integración con base de datos (MongoDB/PostgreSQL)
- [ ] Panel de reportes y estadísticas
- [ ] Exportar usuarios a CSV
- [ ] 2FA (Autenticación de dos factores)
- [ ] Historial de cambios de roles

---

**¿Preguntas?** Consulta [USER-MANAGEMENT.md](./USER-MANAGEMENT.md)

---

**Última actualización:** 14 de enero de 2026
**Versión:** 2.0
