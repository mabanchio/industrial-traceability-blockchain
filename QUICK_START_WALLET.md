# 🚀 Instrucciones de Prueba: Vinculación de Wallet

## 📌 Lo que he hecho

He mejorado significativamente el código de vinculación de wallet con:
- ✅ **Logging detallado** en consola para diagnosticar problemas
- ✅ **Mejor manejo de errores** con mensajes claros
- ✅ **Sincronización correcta** de localStorage (currentUser + allUsers)
- ✅ **Soporte para usuarios sin wallet** desde el inicio
- ✅ **Validación en cada paso** de la vinculación

---

## 🎯 Instrucciones Paso a Paso

### 1️⃣ **Abre una terminal en el proyecto**
```bash
cd /home/matias/Escritorio/TFM3
```

### 2️⃣ **Inicia Anvil (si no está corriendo)**
```bash
anvil
```
Deberías ver:
```
Listening on http://127.0.0.1:8545
```

### 3️⃣ **En otra terminal, inicia el frontend**
```bash
cd /home/matias/Escritorio/TFM3/frontend
npm run dev
```

### 4️⃣ **Abre el navegador**
Ve a: **http://localhost:3000**

### 5️⃣ **Abre la Consola del Navegador**
Presiona: **F12** o **Ctrl+Shift+I**
- Ve a la pestaña **Console**

### 6️⃣ **Inicia Sesión**
- Usuario: `admin`
- Contraseña: `admin123`
- O usa cualquier otro usuario registrado

### 7️⃣ **Navega a Mi Perfil**
- Haz clic en la pestaña **👤 Mi Perfil**

### 8️⃣ **Si no tienes wallet vinculada**
- Deberías ver: "⚠️ Sin wallet vinculada"
- Haz clic en: **🔗 Vincular Wallet**

### 9️⃣ **Haz clic en Conectar MetaMask**
- Botón: **🦊 Conectar MetaMask**
- **Mira la consola inmediatamente** para ver los logs

---

## 👀 Qué Ver en la Consola

### ✅ Si Funciona Correctamente:
```
=== INICIANDO VINCULACIÓN DE WALLET ===
window.ethereum disponible: true
currentUser: {username: 'admin', role: 'ADMIN', ...}
MetaMask detectado. Solicitando acceso a cuentas...
Cuentas obtenidas: Array(1) [ "0x742d..." ]
Wallet seleccionada (formateada): 0x742d35Cc6634C0532925a3b844Bc9e7595f42e1
updatedUser: {walletAddress: '0x742d...', username: 'admin', ...}
allUsers antes de actualizar: Array(1) [ {...} ]
Actualizando usuario admin con wallet 0x742d...
allUsers después de actualizar: Array(1) [ {...} ]
Wallet vinculada exitosamente
=== VINCULACIÓN COMPLETADA EXITOSAMENTE ===
```

Y en la UI deberías ver:
- ✅ Mensaje verde: "✅ Wallet vinculada correctamente"
- Se muestra la dirección: `0x742d...`

### ❌ Si Hay Error - Ejemplos:

**Error: "Rechazaste la solicitud"**
```
Error en eth_requestAccounts: Error: User rejected the request.
```
**Solución:** Intenta de nuevo y haz clic en "Conectar"

**Error: "MetaMask no está disponible"**
```
=== INICIANDO VINCULACIÓN DE WALLET ===
window.ethereum disponible: false
```
**Solución:** Instala MetaMask desde https://metamask.io

**Error: "No hay cuentas"**
```
Cuentas obtenidas: Array(0) []
```
**Solución:** Crea una cuenta en MetaMask

---

## 🔧 Diagnóstico Avanzado

Si algo no funciona, ejecuta esto en la consola:

```javascript
// Ver si MetaMask está instalado
console.log('MetaMask:', !!window.ethereum);

// Ver usuario actual
console.log('Current User:', JSON.parse(localStorage.getItem('currentUser')));

// Ver todos los usuarios
console.log('All Users:', JSON.parse(localStorage.getItem('allUsers')));

// Probar conexión manual
window.ethereum.request({method: 'eth_requestAccounts'})
  .then(acc => console.log('Cuentas:', acc))
  .catch(err => console.error('Error:', err));
```

---

## ⚠️ Requisitos Previos

✅ **DEBE estar corriendo:**
- Anvil en puerto 8545
- Frontend en puerto 3000
- MetaMask extensión instalada

✅ **MetaMask DEBE estar configurado:**
- Red: **Localhost 8545**
- URL: `http://localhost:8545`
- Chain ID: `31337`

✅ **DEBE haber al menos una cuenta en MetaMask**

---

## 🎬 Video Paso a Paso (Texto)

1. **Terminal 1:**
   ```bash
   cd /home/matias/Escritorio/TFM3 && anvil
   ```
   ✅ Ves: "Listening on http://127.0.0.1:8545"

2. **Terminal 2:**
   ```bash
   cd /home/matias/Escritorio/TFM3/frontend && npm run dev
   ```
   ✅ Ves: "VITE v6... ready in ... ms"

3. **Navegador:**
   - Abre http://localhost:3000
   - Presiona F12 (Consola)

4. **Login:**
   - Usuario: `admin`
   - Contraseña: `admin123`
   - Click: "Iniciar Sesión"

5. **Vinculación:**
   - Espera a que cargue la página
   - Ve a "👤 Mi Perfil"
   - Mira la consola
   - Click: "🔗 Vincular Wallet"
   - Click: "🦊 Conectar MetaMask"
   - **MIRA LA CONSOLA**
   - Verás popup de MetaMask (posiblemente detrás)
   - Busca icono 🦊 en la esquina superior derecha
   - Selecciona cuenta
   - Click: "Conectar"
   - **MIRA LA CONSOLA DE NUEVO**

6. **Resultado:**
   - En consola: `=== VINCULACIÓN COMPLETADA EXITOSAMENTE ===`
   - En UI: Verde "✅ Wallet vinculada correctamente"
   - Perfil muestra dirección wallet

---

## 💬 Si Aún Falla

**Copia de la consola:**
1. Haz clic derecho en la consola
2. Selecciona "Clear Console"
3. Intenta vincular de nuevo
4. Copia TODOS los mensajes que aparezcan
5. Comparte la salida exacta

**Información que necesito:**
- ¿Qué dice exactamente el error?
- ¿Se abre el popup de MetaMask?
- ¿Qué sale en la consola?
- ¿MetaMask está instalado?

---

## 📚 Archivos de Ayuda Disponibles

- **[CONSOLE_DIAGNOSTIC.js](CONSOLE_DIAGNOSTIC.js)** - Código para diagnosticar en consola
- **[METAMASK_TROUBLESHOOTING.md](METAMASK_TROUBLESHOOTING.md)** - Guía completa de solución de problemas
- **[WALLET_VINCULATION_GUIDE.md](WALLET_VINCULATION_GUIDE.md)** - Guía detallada de vinculación

---

**Última actualización:** 14 de enero de 2026
**Versión:** Mejorada con logging completo y manejo de errores
