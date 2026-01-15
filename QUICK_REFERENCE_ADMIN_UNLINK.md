# 🚀 Guía Rápida: Desvinculación de Wallets por Admin

## Requisitos Previos

- ✅ Contrato desplegado en blockchain
- ✅ Usuario con rol `DEFAULT_ADMIN_ROLE`
- ✅ MetaMask instalado y conectado
- ✅ Fondos suficientes para pagar gas

## Cómo Usar la Desvinculación Admin

### Paso 1: Acceder al Panel Administrativo

```
1. Iniciar sesión en la aplicación
2. Navegar a "Admin Panel" → "Gestionar Usuarios"
```

### Paso 2: Buscar Usuario

```
1. Ver lista de usuarios registrados
2. Buscar por rol si es necesario (filtro opcional)
3. Identificar el usuario del cual desear desvinauclar wallet
```

### Paso 3: Desactivar Wallet

```
1. Click en botón "Desvincular" junto al usuario
2. Confirmar en diálogo de confirmación: "¿Desvinacular wallet de [usuario]?"
3. MetaMask popup aparecerá automáticamente
```

### Paso 4: Confirmar en MetaMask

```
1. Revisar transacción en MetaMask
2. Ver monto de gas estimado
3. Click "Confirmar" para ejecutar
4. Esperar confirmación (1-2 minutos)
```

### Paso 5: Verificar Resultado

```
1. Interfaz se actualizará automáticamente
2. Mensaje de éxito: "Wallet desvinculada de [usuario]"
3. Siguiente wallet del usuario se activa automáticamente
```

## ¿Qué Ocurre en Blockchain?

Cuando se desvincula una wallet:

```
1. Wallet activa se marca como inactiva (active = false)
2. Se registra timestamp de desactivación
3. Se busca siguiente wallet disponible
4. Se activa automáticamente siguiente wallet
5. Se emiten eventos para auditoría
6. Historial inmutable en blockchain
```

## Casos de Uso

### Caso 1: Usuario con múltiples wallets
```
Usuario A tiene:
  - Wallet 1 (activa) ← Se desvincula
  - Wallet 2
  - Wallet 3

Resultado:
  - Wallet 1 → Inactiva
  - Wallet 2 → Se activa automáticamente
  - Usuario puede usar Wallet 2 inmediatamente
```

### Caso 2: Usuario con una sola wallet
```
Usuario B tiene:
  - Wallet única (activa) ← Se desvincula

Resultado:
  - Wallet → Inactiva
  - Usuario necesitará vincular nueva wallet para usar el sistema
  - Estado: "Requiere vinculación de wallet"
```

### Caso 3: Wallet que ya existe (duplicado)
```
Usuario C intenta vincular Wallet A (que ya usa)

Resultado:
  - NO se crea duplicado
  - Wallet A se reactiva si estaba inactiva
  - Se trata como reactivación, no como nuevo vinculación
```

## Errores Comunes y Soluciones

### Error: "No tienes permisos para ejecutar esta operación"

**Causa**: No eres admin
**Solución**: Solicitar que un admin ejecute la operación

### Error: "execution reverted"

**Causa**: Posibles causas:
- No tienes el rol requerido
- Usuario no existe en blockchain
- Fondos insuficientes para gas

**Solución**:
- Verificar permisos
- Verificar que usuario está registrado
- Tener suficientes ETH/fondos en wallet

### Error: MetaMask no aparece

**Causa**: MetaMask no está instalado o desconectado
**Solución**:
- Instalar MetaMask
- Conectar MetaMask a la red correcta (localhost, Sepolia, etc.)
- Refrescar página

### Error: "User not found in blockchain"

**Causa**: Usuario no existe en blockchain
**Solución**: 
- Verificar que el usuario está registrado
- Puede ser necesario reiniciar sesión

## Verificación Técnica

Para verificar que la función está correctamente implementada:

```bash
# En terminal del proyecto
cd /home/matias/Escritorio/TFM3

# Verificar función en ABI
npx hardhat run verify-abi.js

# Debería mostrar:
# ✅ Función adminUnlinkWallet encontrada en ABI
# ✅ Total de funciones: 41
# ✅ Total de eventos: 17
```

## Estructura de Eventos

Cuando se desvincula una wallet, se generan eventos para auditoría:

```solidity
event WalletDeactivated(
    string indexed username,
    address indexed walletAddress
);

event WalletActivated(
    string indexed username,
    address indexed walletAddress
);
```

## FAQ

**P: ¿Qué pasa si desvincularemos la última wallet del usuario?**
R: El usuario queda sin wallet activa y necesitará vincular una nueva para continuar usando el sistema.

**P: ¿Se puede deshacer una desvinculación?**
R: No directamente. Se puede vincular la misma wallet nuevamente o una wallet diferente.

**P: ¿Cuánto cuesta desvinacular una wallet?**
R: El costo depende del gas de la red (ETH en mainnet/testnet, no cuesta en localhost).

**P: ¿Quién paga el gas?**
R: El admin que ejecuta la transacción (desde su wallet conectada en MetaMask).

**P: ¿Se guarda en blockchain?**
R: Sí, todos los cambios se registran inmutablemente en blockchain.

**P: ¿Puede un usuario ver el historial de desvinculaciones?**
R: Sí, a través de eventos blockchain y auditoría. (Funcionalidad futura si se necesita interfaz).

## Recursos Adicionales

- **[ADMIN_UNLINK_IMPLEMENTATION.md](./ADMIN_UNLINK_IMPLEMENTATION.md)** - Documentación técnica detallada
- **[README.md](./README.md#-sistema-de-múltiples-wallets)** - Sistema de múltiples wallets
- **[QUICK-START.md](./QUICK-START.md)** - Guía de inicio rápido del proyecto

---

**Última actualización:** 15 de enero de 2026  
**Versión:** 1.0
