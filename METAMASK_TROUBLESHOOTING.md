# Guía de Resolución: Problemas de Vinculación de Wallet en MetaMask

## 🔍 Diagnóstico

Si la wallet no se vincula y no se abre el selector de MetaMask, sigue estos pasos:

### 1. **Verifica que MetaMask esté instalado**
- Abre Chrome/Firefox y busca el icono de MetaMask (🦊) en la parte superior derecha
- Si no está instalado, descárgalo desde [https://metamask.io](https://metamask.io)

### 2. **Verifica que MetaMask esté conectado a Anvil (localhost:8545)**
- Haz clic en el icono de MetaMask 🦊
- Abre los ajustes (engranaje)
- Ve a Networks → Locahost 8545 (o añádela si no existe)
- Asegúrate de que está seleccionada como red activa
- Si no existe, crea una:
  - Network Name: `Localhost 8545`
  - RPC URL: `http://localhost:8545`
  - Chain ID: `31337`
  - Currency Symbol: `ETH`

### 3. **Abre la Consola del Navegador**
- Presiona `F12` o `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Ve a la pestaña **Console**

### 4. **Intenta vincular la wallet**
- En la aplicación, navega a "Mi Perfil" (👤)
- Haz clic en "🔗 Vincular Wallet" (si aún no tienes una vinculada)
- Haz clic en "🦊 Conectar MetaMask"
- **Observa la consola** para ver los mensajes de log

### 5. **Revisa los mensajes de log**

Deberías ver algo como:
```
Abriendo MetaMask para vinculación...
Cuentas obtenidas: ['0x742d...']
Wallet vinculada: 0x742d...
Wallet vinculada exitosamente
```

## ❌ Problemas Comunes y Soluciones

### **Problema: "MetaMask no está instalado"**
**Causa:** MetaMask no está instalado en el navegador
**Solución:** Descarga desde https://metamask.io e instálalo

### **Problema: No se abre la ventana de MetaMask**
**Causa:** MetaMask puede estar deshabilitado o bloqueado
**Solución:**
1. Haz clic en el icono de MetaMask 🦊 para activarlo
2. Si aún no aparece, intenta:
   - Cerrar y abrir el navegador
   - Desinstalar y reinstalar MetaMask
   - Usar un navegador diferente

### **Problema: "Rechazaste la conexión a MetaMask"**
**Causa:** Hiciste clic en "Rechazar" en el popup de MetaMask
**Solución:** Vuelve a intentar y haz clic en "Conectar" en el popup

### **Problema: El contador de cuentas muestra 0**
**Causa:** MetaMask no tiene cuentas creadas
**Solución:**
1. Abre MetaMask 🦊
2. Si es nuevo, crea una cuenta siguiendo el proceso de creación
3. Anota la frase de recuperación en lugar seguro
4. Vuelve a intentar vincular

### **Problema: "Error al vincular wallet"**
**Causa:** Puede ser un error de red o de MetaMask
**Solución:**
1. Recarga la página (`F5` o `Cmd+R`)
2. Asegúrate de que Anvil está corriendo: `anvil` en terminal
3. Revisa que MetaMask esté en la red correcta (Localhost 8545)
4. Verifica los logs en la consola (`F12` → Console)

## 🧪 Prueba Manual (Desarrollo)

Para probar directamente desde la consola:

```javascript
// 1. Verifica que window.ethereum existe
console.log('window.ethereum:', window.ethereum);

// 2. Intenta obtener cuentas
window.ethereum.request({ method: 'eth_requestAccounts' })
  .then(accounts => console.log('Cuentas:', accounts))
  .catch(err => console.error('Error:', err));

// 3. Verifica que ethers.js está disponible
console.log('ethers:', ethers);

// 4. Prueba getAddress
const wallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f42e1';
console.log('Wallet formateada:', ethers.getAddress(wallet));
```

## 📋 Checklist de Resolución

- [ ] MetaMask está instalado
- [ ] MetaMask está habilitado (icono visible)
- [ ] MetaMask tiene al menos una cuenta
- [ ] Localhost 8545 está configurado en MetaMask
- [ ] Localhost 8545 está seleccionado como red activa
- [ ] Anvil está corriendo (`anvil` en terminal)
- [ ] La consola del navegador (`F12`) no muestra errores críticos
- [ ] `window.ethereum` existe (verifiable en consola)
- [ ] El botón "🦊 Conectar MetaMask" se hace clic
- [ ] El popup de MetaMask aparece
- [ ] Se selecciona la cuenta
- [ ] Se hace clic en "Conectar" en el popup

## 💡 Si Aún No Funciona

1. **Abre la consola** (`F12` → Console)
2. **Copia todos los mensajes de error**
3. **Verifica que veas estos logs al conectar:**
   ```
   Abriendo MetaMask para vinculación...
   Cuentas obtenidas: [...]
   Wallet vinculada: 0x...
   ```

4. Si ves errores diferentes, comparte:
   - El error exacto de la consola
   - El código de error (si existe)
   - Qué paso falló (¿se abrió MetaMask? ¿se seleccionó la cuenta?)

## 🔄 Flujo Esperado

1. **Usuario hace clic en "🔗 Vincular Wallet"**
   ↓
2. **Se muestra botón "🦊 Conectar MetaMask"**
   ↓
3. **Usuario hace clic en "🦊 Conectar MetaMask"**
   ↓
4. **Se abre ventana popup de MetaMask**
   ↓
5. **Usuario selecciona cuenta (si hay múltiples)**
   ↓
6. **Usuario hace clic en "Conectar"**
   ↓
7. **Popup se cierra**
   ↓
8. **Aparece mensaje "✅ Wallet vinculada correctamente"**
   ↓
9. **Se muestra dirección de wallet en el perfil**

## 🛠️ Reinicio Completo (Nuclear Option)

Si nada funciona:

1. **Desinstala MetaMask**
2. **Limpia datos de navegador:**
   - Chrome: Ctrl+Shift+Del → All time → Clear data
   - Firefox: Ctrl+Shift+Delete → All → Clear Now
3. **Reinicia el navegador**
4. **Instala MetaMask nuevamente**
5. **Crea una nueva cuenta**
6. **Configura Localhost 8545**
7. **Intenta de nuevo**

---

**Última actualización:** 14 de enero de 2026
**Estado:** Mejorado con mejor manejo de errores y logging
