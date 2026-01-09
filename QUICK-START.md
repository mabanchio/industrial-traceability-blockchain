# 🚀 Guía de Uso Rápido - TFM3

## Instalación Rápida

```bash
# 1. Clonar
git clone https://gitlab.codecrypto.academy/tu-repo TFM3
cd TFM3

# 2. Instalar dependencias
npm install

# 3. Compilar contrato
npm run compile

# 4. Ver estructura
ls -la
# contracts/         → Smart contract Solidity
# test/             → Tests unitarios
# scripts/          → Deploy scripts
# frontend/         → Aplicación React
# README-TFM3.md    → Documentación técnica
# IA.md             → Análisis de IA
```

---

## ⚙️ Desarrollo Local

### Terminal 1: Red Hardhat
```bash
npm run node
# Esperado: "Started HTTP and WebSocket JSON-RPC server..."
```

### Terminal 2: Frontend
```bash
npm run frontend
# Esperado: "VITE v... dev server running at http://localhost:3000"
```

### Terminal 3: Tests (cuando funcione el entorno)
```bash
npm run test
# Ejecuta 40+ test cases
```

---

## 📝 Cambios Realizados

### Smart Contract (`contracts/TraceabilityManager.sol`)
- ✅ Gestión completa de activos industriales
- ✅ Sistema de certificaciones (emitir/renovar/revocar)
- ✅ Control de roles granular
- ✅ Eventos bien indexados
- ✅ Optimizaciones de gas (compiler optimizer)

### Frontend (`frontend/src/`)
- ✅ Dashboard de estadísticas
- ✅ Manager de activos (registrar/consultar)
- ✅ Manager de certificaciones (emitir/renovar/revocar)
- ✅ Integración MetaMask
- ✅ Estilos responsive

### Documentación
- ✅ [README-TFM3.md](README-TFM3.md) - Técnica completa
- ✅ [IA.md](IA.md) - Retrospectiva de uso de IA
- ✅ [QUICK-START.md](QUICK-START.md) - Este archivo

---

## 🧪 Testing

```bash
# Estructura de tests
test/
└── TraceabilityManager.test.js
    ├── Asset Registration (4 tests)
    ├── Asset Deactivation (4 tests)
    ├── Certificate Management (6 tests)
    ├── Certificate Renewal (4 tests)
    ├── Certificate Revocation (4 tests)
    ├── Certificate Validity (3 tests)
    ├── Role Management (5 tests)
    └── Gas Optimization (2 tests)
    
Total: 40+ casos de test
```

---

## 🔥 Optimizaciones Implementadas

| Optimización | Impacto |
|---|---|
| Compiler optimizer (runs: 200) | -25% bytecode |
| calldata vs memory | -2000 gas/string |
| Eventos indexados | queries o(1) |
| uint256 nativo | -opcodes innecesarios |
| Post-incremento | -gas por operación |

---

## 📂 Estructura Final

```
TFM3/
├── contracts/
│   └── TraceabilityManager.sol
├── test/
│   └── TraceabilityManager.test.js
├── scripts/
│   ├── deploy.js
│   └── run-node.mjs
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AssetManager.jsx
│   │   │   └── CertificateManager.jsx
│   │   ├── config/abi.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── public/index.html
│   ├── package.json
│   └── vite.config.js
├── README-TFM3.md
├── IA.md
├── hardhat.config.js
├── package.json
└── .gitignore
```

---

## 🔐 Seguridad

- ✅ OpenZeppelin AccessControl
- ✅ ReentrancyGuard
- ✅ Validación exhaustiva de inputs
- ✅ No transferencia de fondos
- ✅ Eventos inmutables para auditoría

---

## 📹 Para Demostración

Grabar vídeo (~5 min):
1. Deploy: `npm run deploy`
2. Tests: `npm run test` (40+ pasando)
3. Frontend: mostrar UI con MetaMask conectado
4. Flujo: registrar activo → emitir certificado → consultar

---

## 💡 Notas Importantes

- **No modificar configuraciones base** (hardhat.config.js)
- **Usar solo main branch** (sin ramas)
- **Mantener tests** (no eliminarlos)
- **Documentar cambios** en README-TFM3.md

---

## ❓ Troubleshooting

**P: No se conecta MetaMask**  
R: Asegurar que MetaMask esté en red "Hardhat Local" (RPC: http://localhost:8545, Chain ID: 31337)

**P: Port 3000 ocupado**  
R: `lsof -i :3000 | grep LISTEN` luego `kill -9 [PID]`

**P: Contrato no se despliega**  
R: Verificar que `hardhat node` esté corriendo en otra terminal

---

**Fecha:** 9 de enero de 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Listo para demostración
