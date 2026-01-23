# 📖 Manual de Usuario - Plataforma de Trazabilidad Industrial

## 1. Introducción

Bienvenido a la **Plataforma de Trazabilidad Industrial con Certificaciones Blockchain**. Este manual te guiará paso a paso en cómo utilizar todas las funcionalidades del sistema.

### ¿Qué es esta plataforma?

Una aplicación descentralizada (DApp) que utiliza blockchain para:
- 📦 Registrar activos (productos, lotes) de forma inmutable
- ✅ Emitir y gestionar certificaciones digitales
- 🔍 Verificar la autenticidad y trazabilidad completa
- 👁️ Auditar toda la cadena de suministro

---

## 2. Requisitos del Sistema

### Antes de Empezar

Necesitas tener instalado:
- **Navegador**: Chrome, Firefox, Edge o Safari
- **MetaMask**: Extensión de navegador para gestionar tu billetera
- **Conexión a Internet**: Para interactuar con la blockchain

### Instalación de MetaMask

1. Ve a [metamask.io](https://metamask.io)
2. Descarga la extensión para tu navegador
3. Clic en "Instalar"
4. Sigue los pasos para crear tu billetera
5. **IMPORTANTE**: Guarda tu frase de recuperación en lugar seguro

---

## 3. Acceso Inicial

### Paso 1: Conectar MetaMask

1. Abre la aplicación en tu navegador
2. Haz clic en el botón **"🦊 Conectar MetaMask"**
3. MetaMask te pedirá permiso para conectar - haz clic en **"Conectar"**
4. Se mostrará tu dirección Ethereum

### Paso 2: Seleccionar Red Correcta

⚠️ **IMPORTANTE**: Debes estar en la red correcta

- **En producción**: Red Polygon o Ethereum Mainnet
- **En desarrollo**: Red local (Localhost 8545)

Si no estás en la red correcta:
1. En MetaMask, haz clic en el selector de red (arriba)
2. Selecciona la red adecuada o agrégala si no aparece
3. Espera a que se sincronice

### Paso 3: Obtener Fondos de Prueba (Testnet)

Si estás en testnet, necesitas fondos fake para pagar el gas:

1. Ve al [Faucet de Polygon Mumbai](https://faucet.polygon.technology/)
2. Pega tu dirección Ethereum
3. Espera a recibir MATIC de prueba (free tokens)
4. En pocos minutos verás los fondos en MetaMask

---

## 4. Login en la Plataforma

### Para Usuarios Existentes

1. Haz clic en **"Login"**
2. Ingresa tu **usuario** (ej: "admin", "aud", "man")
3. Ingresa tu **contraseña** (ej: "admin" para usuarios de demo)
4. Haz clic en **"Iniciar Sesión"**

### Si es tu Primer Acceso

El sistema tiene usuarios de demo preconfigurados:

| Usuario | Contraseña | Rol | Descripción |
|---------|-----------|-----|-------------|
| `admin` | `admin` | Admin | Acceso completo |
| `aud` | `admin` | Auditor | Ver reportes |
| `man` | `admin` | Fabricante | Registrar activos |
| `dis` | `admin` | Distribuidor | Transferir activos |
| `ass` | `admin` | Creador de Activos | Crear nuevos activos |
| `cer` | `admin` | Certificador | Emitir certificados |

---

## 5. Dashboard Principal

### Pantalla Inicial

Una vez logueado, verás:
- 📊 **Estadísticas**: Total de activos, certificados, usuarios
- 📋 **Acciones Rápidas**: Botones para las funciones principales
- 👥 **Tu Perfil**: Información de tu usuario y billetera

### Navegación

En la barra lateral encontrarás:
- 🏠 **Dashboard** - Inicio
- 📦 **Activos** - Gestión de productos/lotes
- ✅ **Certificados** - Emisión y verificación
- 👥 **Usuarios** - Gestión de usuarios (solo admin)
- 📊 **Reportes** - Análisis de datos
- ⚙️ **Configuración** - Ajustes personales

---

## 6. Funcionalidades por Rol

### 👨‍💼 Admin (Administrador)

**Acceso**: Todas las funcionalidades

**Principales tareas**:
1. **Gestionar usuarios**
   - Crear nuevos usuarios
   - Asignar roles
   - Desactivar usuarios
   - Resetear contraseñas

2. **Configurar sistema**
   - Parámetros globales
   - Permisos de roles
   - Auditoría de cambios

**Cómo acceder**:
- Login como `admin`
- Verás opción **"Panel Admin"**

---

### 📦 Creador de Activos (Asset Creator)

**Acceso**: Crear y gestionar activos

**Principales tareas**:

#### 1. Registrar Nuevo Activo

```
1. Click en "📦 Activos" → "Registrar Nuevo"
2. Completa el formulario:
   - Tipo de activo (ej: Electrónica, Alimentos)
   - Descripción
   - SKU o código identificador
3. Haz clic en "Guardar"
4. Confirma en MetaMask
5. Espera transacción (30-60 segundos)
6. ¡Activo registrado! 🎉
```

#### 2. Ver Mis Activos

```
1. Click en "📦 Activos"
2. Verás lista de todos tus activos registrados
3. Click en uno para ver detalles
4. Puedes ver: Propietario, Estado, Historial
```

#### 3. Desactivar Activo

```
1. En lista de activos, selecciona uno
2. Click en "Desactivar"
3. Confirma en MetaMask
4. El activo ya no puede transferirse
```

---

### 🏭 Fabricante (Manufacturer)

**Acceso**: Registrar y transferir activos

**Principales tareas**:

#### 1. Transferir Activo

```
1. Click en "📦 Activos"
2. Selecciona activo a transferir
3. Click en "Transferir"
4. Ingresa dirección del nuevo propietario
5. Confirma en MetaMask
6. ¡Transferencia completada!
```

#### 2. Ver Historial

```
1. En detalles del activo, ve a "Historial"
2. Verás todas las transferencias
3. Cada una tiene: Fecha, de quién, a quién, firma de blockchain
```

---

### 🚚 Distribuidor (Distributor)

**Acceso**: Transferir activos recibidos

**Principales tareas**:

#### 1. Recibir Activo

```
1. Espera a que te transfieran un activo
2. Aparecerá en tu lista con estado "Pendiente"
3. Click en "Aceptar Transferencia"
```

#### 2. Transferir a Siguiente Punto

```
1. Activo debe estar aceptado
2. Click en "Transferir"
3. Selecciona nuevo propietario (ej: Minorista)
4. Confirma en MetaMask
```

---

### ✅ Certificador (Certifier)

**Acceso**: Emitir y gestionar certificados

#### 1. Emitir Certificado

```
1. Click en "✅ Certificados" → "Emitir Nuevo"
2. Selecciona activo a certificar
3. Ingresa:
   - Tipo de certificado (Calidad, Seguridad, etc.)
   - Descripción
   - Fecha de expiración
4. Click en "Emitir"
5. Confirma en MetaMask
6. ¡Certificado emitido! ✅
```

#### 2. Renovar Certificado

```
1. En "✅ Certificados", busca uno por vencer
2. Click en "Renovar"
3. Ingresa nueva fecha de expiración
4. Confirma
```

#### 3. Revocar Certificado

```
1. Si un certificado es inválido:
2. Click en el certificado
3. Click en "Revocar"
4. Ingresa motivo
5. Confirma en MetaMask
```

---

### 👁️ Auditor (Auditor)

**Acceso**: Ver y auditar solo (sin modificar)

#### 1. Ver Activos Completos

```
1. Click en "📊 Reportes"
2. Verás listado de TODOS los activos del sistema
3. Puedes ver propietario, estado, historial completo
```

#### 2. Auditar Certificados

```
1. Click en "✅ Certificados"
2. Verás todos los certificados emitidos
3. Puedes verificar: Emisor, fecha, validez
4. Acceso a certificados revocados también
```

#### 3. Generar Reportes

```
1. Click en "📊 Reportes"
2. Selecciona tipo de reporte:
   - Activos por propietario
   - Certificados emitidos
   - Historial de transferencias
   - Auditoría completa
3. Descarga en PDF
```

---

## 7. Verificación en Blockchain

### Ver Transacción en Explorer

Después de cualquier acción (registrar, transferir, certificar):

1. Verás un **"Hash de Transacción"** (txHash)
2. Cópialo
3. Ve a [PolygonScan](https://mumbai.polygonscan.com/) (para Mumbai testnet)
4. Pega el hash en la barra de búsqueda
5. Verás:
   - Estado de la transacción (confirmada)
   - Gas gastado
   - Detalles técnicos
   - Eventos emitidos

### Verificar Contrato

Para ver el código del smart contract:

1. Ve a [PolygonScan](https://mumbai.polygonscan.com/)
2. Busca la dirección del contrato
3. Click en pestaña "Contract" (Contrato)
4. Puedes ver:
   - Código Solidity
   - ABI del contrato
   - Funciones disponibles

---

## 8. Casos de Uso Completos

### Caso 1: Registrar y Certificar un Producto

**Actores**: Fabricante + Certificador + Auditor

```
PASO 1: Fabricante registra producto
├─ Login como "man"
├─ Click "Registrar Nuevo Activo"
├─ Completa: Tipo=Electrónica, Desc=Laptop modelo XYZ
├─ Confirma en MetaMask
└─ Se obtiene txHash

PASO 2: Certificador emite certificado
├─ Login como "cer"
├─ Click "Emitir Certificado"
├─ Selecciona el producto registrado
├─ Tipo=Seguridad, Expira en 12 meses
├─ Confirma en MetaMask
└─ Certificado grabado en blockchain

PASO 3: Auditor verifica
├─ Login como "aud"
├─ Va a "Reportes"
├─ Busca el producto
├─ Ve historial: Registro + Certificación
├─ Verifica en blockchain explorer
└─ Todo listo para venta
```

### Caso 2: Transferencia en Cadena de Suministro

**Actores**: Fabricante → Distribuidor → Minorista → Cliente

```
PASO 1: Fabricante transfiere a Distribuidor
├─ Login como "man"
├─ Click "Transferir Activo"
├─ Selecciona distribuidor
├─ Confirma
└─ Espera confirmación

PASO 2: Distribuidor acepta y transfiere a Minorista
├─ Login como "dis"
├─ Ve activo "Pendiente"
├─ Click "Aceptar"
├─ Luego click "Transferir"
├─ Selecciona minorista
└─ Confirmado

PASO 3: Cliente final verifica
├─ (Acceso público, no necesita login)
├─ Ingresa código del producto
├─ Ve historial completo:
│  ├─ Quién lo fabricó
│  ├─ Certificaciones vigentes
│  ├─ Quiénes lo han tenido
│  └─ Todas las fechas
└─ Verifica autenticidad ✅
```

---

## 9. Solución de Problemas

### MetaMask no conecta

**Problema**: Botón "Conectar MetaMask" no responde

**Soluciones**:
1. Asegúrate de tener MetaMask instalado
2. Refresca la página (F5)
3. Cierra y abre MetaMask
4. Intenta en navegador incógnito

### Transacción se queda en "Pendiente"

**Problema**: La transacción no se confirma

**Soluciones**:
1. Espera 1-2 minutos (las transacciones pueden ser lentas)
2. Verifica que tienes fondos (revisa en MetaMask)
3. Si se queda mucho tiempo, haz clic en la transacción en MetaMask
4. Puedes hacer "Speed Up" (acelerar) pagando más gas

### "Insufficient Balance" (Fondos insuficientes)

**Problema**: No tienes MATIC para pagar el gas

**Soluciones**:
1. Ve al faucet y obtén más tokens de prueba
2. En testnet: [Polygon Faucet](https://faucet.polygon.technology/)
3. Espera a que se acredite (2-5 minutos)
4. Recarga la página

### No puedo ver mis activos

**Problema**: Mi lista de activos está vacía

**Soluciones**:
1. ¿Has registrado alguno? Necesitas crearlo primero
2. ¿Estás logueado con la cuenta correcta? Verifica en MetaMask
3. ¿La red es correcta? Revisa que sea la misma del contrato
4. Intenta refrescar la página

### Error: "Access Denied" o permiso rechazado

**Problema**: No puedes acceder a una función

**Soluciones**:
1. Tu rol no tiene permisos. Ej: Solo Certificador puede emitir certificados
2. Contacta con el admin para que te asigne el rol correcto
3. Si eres admin, verifica haber concedido los permisos

---

## 10. Mejores Prácticas de Seguridad

### ✅ HACER

- ✅ Guarda tu frase de recuperación de MetaMask en lugar seguro
- ✅ Usa contraseñas fuertes en la plataforma
- ✅ Verifica direcciones antes de transferir
- ✅ Guarda los txHash de operaciones importantes
- ✅ Usa la plataforma en conexión segura (HTTPS)

### ❌ NO HACER

- ❌ Nunca compartas tu clave privada con nadie
- ❌ No hagas clic en enlaces sospechosos
- ❌ No dejes MetaMask conectada en computadoras públicas
- ❌ No escribas contraseñas en navegadores no confiables
- ❌ No transfundas activos sin verificar datos

---

## 11. Contacto y Soporte

Para problemas técnicos o preguntas:

📧 **Email**: [soporte@trazabilidad.com]  
💬 **Chat**: Disponible en la plataforma  
📞 **Teléfono**: +34 XXX XXX XXX  

---

## 12. Glosario de Términos

| Término | Definición |
|---------|-----------|
| **Blockchain** | Base de datos descentralizada e inmutable |
| **Smart Contract** | Programa que se ejecuta en blockchain automáticamente |
| **Transacción** | Operación registrada en blockchain |
| **Gas** | Comisión para realizar transacciones |
| **MetaMask** | Billetera digital para interactuar con blockchain |
| **Activo** | Producto, lote o artículo a rastrear |
| **Certificado** | Validación o garantía digital de un activo |
| **Hash** | Identificador único de una transacción |
| **Rol** | Tipo de usuario con permisos específicos |
| **Explorer** | Herramienta para ver transacciones en blockchain |

---

**Versión**: 1.0  
**Última actualización**: 23 de enero de 2026  
**Mantener este documento actualizado con nuevas funcionalidades**
