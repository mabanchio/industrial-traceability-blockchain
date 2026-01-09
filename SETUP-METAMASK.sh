#!/bin/bash
# Setup rápido: Configurar Hardhat Local en MetaMask
# Este script proporciona instrucciones para conectar MetaMask

clear

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     🦊 GUÍA RÁPIDA: CONECTAR METAMASK A HARDHAT LOCAL                   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

PASO 1: Abre MetaMask en tu navegador
────────────────────────────────────────────────────────────────────────────
  • Haz clic en el icono de MetaMask (fox)
  • Si no lo tienes instalado: https://metamask.io


PASO 2: Agregar Nueva Red
────────────────────────────────────────────────────────────────────────────
  1. Click en selector de red (arriba de MetaMask)
  2. Selecciona "Agregar red"
  3. Ingresa los datos:
     • Network Name:    Hardhat Local
     • RPC URL:         http://localhost:8545
     • Chain ID:        31337
     • Currency Symbol: ETH
  4. Click en "Guardar"


PASO 3: Importar Primera Cuenta (Owner/Admin)
────────────────────────────────────────────────────────────────────────────
  1. En MetaMask, click en tu icono de perfil
  2. Selecciona "Importar cuenta"
  3. Elige "Importar usando clave privada"
  4. Copia esta clave (SIN el 0x):
  
     ➜ ac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d4860fed8610d03b7c1c
  
  5. Click en "Importar"
  6. La dirección debe ser: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  7. Verifica que el saldo es ~10,000 ETH


PASO 4: Importar Cuenta Certificador (Opcional)
────────────────────────────────────────────────────────────────────────────
  Repite el proceso con esta clave:
  
     ➜ 59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
  
  La dirección debe ser: 0x70997970C51812e339D9B73b0245ad39BeA34cAB


PASO 5: Verificar Conexión
────────────────────────────────────────────────────────────────────────────
  En MetaMask deberías ver:
  
  ┌────────────────────────────────────────────┐
  │ Hardhat Local (31337)                      │
  │                                             │
  │ Cuenta 0                                   │
  │ 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb...  │
  │ 10,000.00 ETH                              │
  └────────────────────────────────────────────┘


PASO 6: Conectar al Frontend
────────────────────────────────────────────────────────────────────────────
  1. Abre http://localhost:3000 en tu navegador
  2. En pantalla de login, haz click en "🦊 Conectar MetaMask"
  3. MetaMask solicitará permisos
  4. Aprueba la conexión
  5. Verás tu dirección en el campo


PASO 7: Iniciar Sesión en TFM3
────────────────────────────────────────────────────────────────────────────
  1. Completa el nombre/empresa
  2. Selecciona tu rol:
     • 🏗️  Extractor        (registra materias primas)
     • ⚙️  Procesador       (transforma componentes)
     • 🏭 Fabricante        (ensambla productos)
     • 🚚 Distribuidor      (distribuye finales)
     • ✅ Certificador      (audita y certifica)
     • 🔍 Auditor           (inspecciona)
  3. Haz click en "Iniciar Sesión"


═════════════════════════════════════════════════════════════════════════════


🚀 COMENZAR EL SISTEMA COMPLETO
────────────────────────────────────────────────────────────────────────────

Abre TRES terminales:


TERMINAL 1 - Hardhat Node (Red local)
────────────────────────────────────────────────────────────────────────────
  $ cd /home/matias/Escritorio/TFM3
  $ npm run node
  
  Verás:
  ✓ Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/


TERMINAL 2 - Frontend Server
────────────────────────────────────────────────────────────────────────────
  $ cd /home/matias/Escritorio/TFM3/frontend-demo
  $ node server.js
  
  Verás:
  ✓ Servidor iniciado en http://localhost:3000


TERMINAL 3 - Navegador
────────────────────────────────────────────────────────────────────────────
  $ Abre http://localhost:3000
  
  Verás:
  ✓ Pantalla de login con autenticación MetaMask


═════════════════════════════════════════════════════════════════════════════


🧪 PROBAR EL SISTEMA
────────────────────────────────────────────────────────────────────────────

ESCENARIO 1: Registrar Activo como Extractor
───────────────────────────────────────────
  1. Login:
     - Nombre: "Minas del Sur"
     - Rol: Extractor
     - MetaMask: Conectado
  
  2. En Dashboard → Activos:
     - Tipo: "materia_prima"
     - Descripción: "Litio grado industrial"
     - Click en "Registrar Activo"
  
  3. Resultado:
     ✅ Asset ID #1 creado
     ✅ Vinculado a tu billetera
     ✅ Gas usado: ~45,000


ESCENARIO 2: Emitir Certificado como Certificador
─────────────────────────────────────────────────
  1. Login:
     - Nombre: "DNV Certification"
     - Rol: Certificador
     - MetaMask: Conectado
  
  2. En Dashboard → Certificaciones:
     - Asset ID: 1
     - Tipo: "ISO 9001"
     - Días válido: 365
     - Click en "Emitir Certificación"
  
  3. Resultado:
     ✅ Cert ID #1 creado
     ✅ Vinculado a Asset #1
     ✅ Gas usado: ~95,000


═════════════════════════════════════════════════════════════════════════════


⚠️  SOLUCIÓN DE PROBLEMAS
────────────────────────────────────────────────────────────────────────────

P: "MetaMask no se conecta"
R: 
  • Verifica que el Hardhat node esté corriendo
  • Asegúrate de que la red es "Hardhat Local"
  • Recarga la página (F5)

P: "Red no encontrada"
R:
  • Ve a Configuración → Redes en MetaMask
  • Agrega la red Hardhat Local manualmente:
    - RPC: http://localhost:8545
    - Chain ID: 31337

P: "Saldo muestra 0 ETH"
R:
  • Asegúrate de haber importado la clave correcta
  • El saldo solo aparece cuando Hardhat node está activo
  • Prueba actualizar MetaMask (clic en el icono)

P: "Frontend no carga"
R:
  • Verifica que Node.js server esté corriendo: node server.js
  • Abre http://localhost:3000 (no localhost:3001 u otro puerto)
  • Revisa la consola del navegador (F12) para errores


═════════════════════════════════════════════════════════════════════════════


📚 DOCUMENTACIÓN COMPLETA
────────────────────────────────────────────────────────────────────────────

  • AUTENTICACION.md      → Control de acceso y roles
  • CLAVES-PRIVADAS.md    → Claves privadas de todas las cuentas
  • README-TFM3.md        → Documentación técnica completa
  • QUICK-START.md        → Guía rápida de instalación


═════════════════════════════════════════════════════════════════════════════


✅ LISTO!
────────────────────────────────────────────────────────────────────────────

Ahora tienes un sistema completo de trazabilidad industrial con:
  • ✅ Autenticación via MetaMask
  • ✅ Control de acceso basado en roles (RBAC)
  • ✅ Smart contract optimizado para gas
  • ✅ Frontend Web3 moderno
  • ✅ 6 roles diferentes con permisos específicos

¡Comienza a probar el sistema! 🚀

═════════════════════════════════════════════════════════════════════════════

EOF

echo ""
echo "Para más información, abre: AUTENTICACION.md"
echo "Claves privadas en: CLAVES-PRIVADAS.md"
echo ""
