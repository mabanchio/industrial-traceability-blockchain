# 🔧 Solución de Problemas: Vinculación de Wallet en MetaMask

## ✅ Mejoras Realizadas

He mejorado significativamente el código para diagnosticar y resolver problemas de vinculación de wallet:

### 1. **Logging Detallado**
Ahora hay logs en consola que muestran exactamente dónde falla:
```
=== INICIANDO VINCULACIÓN DE WALLET ===
window.ethereum disponible: true
currentUser: {...}
MetaMask detectado. Solicitando acceso a cuentas...
Cuentas obtenidas: ['0x742d...']
Wallet seleccionada (formateada): 0x742d...
updatedUser: {...}
=== VINCULACIÓN COMPLETADA EXITOSAMENTE ===
```

### 2. **Mejor Manejo de Errores**
- Código 4001 = Usuario rechazó la conexión
- Otros errores se reportan con mensajes claros
- Cada paso tiene validación

### 3. **Sincronización Mejorada**
- Ahora actualiza **SIEMPRE** en `allUsers`
- Agrega usuarios que no existen aún
- Recarga detalles después de vincular

### 4. **Manejo de Casos Sin Wallet**
- El perfil se carga correctamente incluso sin wallet
- Se muestra el botón "🔗 Vincular Wallet" apropiadamente

---

## 🔍 Cómo Diagnosticar

### Paso 1: Abre la Consola
Presiona **F12** o **Ctrl+Shift+I** (Windows) / **Cmd+Option+I** (Mac)
- Ve a la pestaña **Console**

### Paso 2: Copia el Código de Diagnóstico
Abre el archivo [CONSOLE_DIAGNOSTIC.js](CONSOLE_DIAGNOSTIC.js) que he creado
- Copia TODO el código
- Pégalo en la consola y presiona Enter

### Paso 3: Revisa los Resultados
Deberías ver:
```
=== DIAGNÓSTICO DE METAMASK ===

1. ¿MetaMask instalado? true
2. ¿ethers disponible? true
3. Obteniendo cuentas de MetaMask...
   ✅ Cuentas actuales: ['0x...']
4. Datos en localStorage:
   currentUser: {...}
   allUsers: [...]
```

### Paso 4: Prueba Manual
En la consola, ejecuta:
```javascript
testMetaMask()
```

Deberías ver:
```
=== PRUEBA MANUAL DE CONEXIÓN ===
Solicitando acceso a MetaMask...
✅ Éxito! Cuentas: ['0x...']
✅ Wallet formateada: 0x...
```

---

## ⚠️ Resultados Esperados vs Problemas

### ✅ Funcionando Correctamente
- Se abre popup de MetaMask al hacer clic
- Aparece "Conectar" y opción de seleccionar cuenta
- Se muestra dirección de wallet en el perfil
- Consola muestra logs sin errores

### ❌ Problema: No Se Abre MetaMask
**Síntomas:**
- Botón "🦊 Conectar MetaMask" no abre nada
- Consola muestra: `window.ethereum disponible: false`

**Soluciones:**
1. Verifica que MetaMask esté instalado (icono 🦊 en la esquina)
2. Si no está, descárgalo desde https://metamask.io
3. Si está, haz clic en el icono para abrirlo y activarlo
4. Recarga la página (F5)
5. Intenta de nuevo

### ❌ Problema: Error "Rechazaste la Solicitud"
**Síntomas:**
- Aparece popup de MetaMask
- Haces clic en "Rechazar"
- Ves el error: "Rechazaste la solicitud de conexión"

**Solución:**
- Vuelve a intentar y haz clic en **"Conectar"** en el popup

### ❌ Problema: No Hay Cuentas en MetaMask
**Síntomas:**
- Popup abierto pero no puedes seleccionar cuenta
- Mensaje: "No tienes cuentas"

**Soluciones:**
1. Abre MetaMask (icono 🦊)
2. Si es la primera vez, crea una cuenta nueva
3. Si ya tienes cuenta, verifica que esté importada correctamente
4. Intenta de nuevo

### ❌ Problema: Error de Formateo de Wallet
**Síntomas:**
- Consola muestra: `Error al formatear dirección de wallet`

**Causa:** La dirección obtenida no es válida

**Solución:**
1. Asegúrate de que MetaMask está en red correcta (Localhost 8545)
2. Verifica que Anvil esté corriendo: `anvil` en terminal
3. Recarga la página
4. Intenta de nuevo

---

## 🧪 Proceso Completo de Prueba

### 1. **Inicia Anvil**
```bash
cd /home/matias/Escritorio/TFM3
anvil
```

### 2. **Inicia el Frontend**
```bash
cd /home/matias/Escritorio/TFM3/frontend
npm run dev
```
Abre: http://localhost:3000

### 3. **Inicia Sesión**
- Usuario: `admin` (o cualquier usuario registrado)
- Contraseña: `admin123` (o su contraseña)

### 4. **Abre la Consola** (F12 → Console)

### 5. **Ejecuta el Diagnóstico**
Pega el código de [CONSOLE_DIAGNOSTIC.js](CONSOLE_DIAGNOSTIC.js)

### 6. **Intenta Vincular Wallet**
- Ve a Mi Perfil (👤)
- Si no tienes wallet, haz clic en "🔗 Vincular Wallet"
- Haz clic en "🦊 Conectar MetaMask"
- Mira la consola para ver los logs

### 7. **Verifica los Resultados**
- ✅ Si ves "=== VINCULACIÓN COMPLETADA EXITOSAMENTE ===" → Éxito
- ❌ Si ves error, copia el mensaje y analiza

---

## 🔄 Mejoras Específicas del Código

### En UserProfile.jsx
```javascript
// ANTES: Solo cargaba si tenía wallet
if (currentUser && currentUser.walletAddress) { ... }

// AHORA: Carga siempre
if (currentUser) { 
  // Soporta usuarios sin wallet
  setUserDetails({ walletAddress: currentUser.walletAddress || null, ... })
}
```

### En handleConnectWallet
```javascript
// ANTES: Sin validación intermedia
const wallet = accounts[0];

// AHORA: Con validación en cada paso
const accounts = await window.ethereum.request({...}) // Con try-catch
const wallet = ethers.getAddress(accounts[0])         // Con try-catch
// Verifica que updatedUser sea correcto
// Actualiza SIEMPRE en allUsers
// Recarga componente después
```

### En localStorage
```javascript
// ANTES: Posible inconsistencia
// A veces no se actualizaba allUsers

// AHORA: Sincronización completa
localStorage.setItem('currentUser', JSON.stringify(updatedUser))
localStorage.setItem('walletAddress', wallet)
localStorage.setItem('allUsers', JSON.stringify(updatedUsers))
```

---

## 💡 Tip para Desarrollador

Si quieres ver EXACTAMENTE qué está pasando:

1. Abre DevTools (F12)
2. Ve a Consola
3. Ejecuta: `testMetaMask()` (función creada en diagnóstico)
4. Esto te mostrará paso a paso qué está fallando

---

## 📋 Checklist Final

- [ ] MetaMask está instalado y visible en navegador
- [ ] MetaMask tiene al menos una cuenta
- [ ] Localhost 8545 está configurado en MetaMask
- [ ] Anvil está corriendo
- [ ] Frontend está en http://localhost:3000
- [ ] Has iniciado sesión en la aplicación
- [ ] Abriste la consola (F12 → Console)
- [ ] Ejecutaste el código de diagnóstico
- [ ] Viste logs sin errores críticos
- [ ] Intentaste vincular wallet
- [ ] Viste "=== VINCULACIÓN COMPLETADA EXITOSAMENTE ===" en consola

Si TODOS los puntos están ✅, la wallet debería estar vinculada.

---

**Última actualización:** 14 de enero de 2026
**Mejoras:** Logging detallado, mejor manejo de errores, sincronización de localStorage
