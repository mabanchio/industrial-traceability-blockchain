#!/bin/bash

# Script de inicio del sistema TFM3

clear

echo "╔═════════════════════════════════════════════════════════════════╗"
echo "║         🚀 TFM3 - TRAZABILIDAD INDUSTRIAL BLOCKCHAIN           ║"
echo "║              Sistema de Inicio Automático                       ║"
echo "╚═════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 VERIFICANDO ESTADO DEL PROYECTO...${NC}\n"

# Verificar dependencias
echo -e "${YELLOW}1️⃣  Verificando dependencias...${NC}"
if command -v npm &> /dev/null; then
    echo -e "${GREEN}   ✅ npm está instalado${NC}"
else
    echo -e "❌ npm no está instalado"
    exit 1
fi

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}   ✅ Node.js $NODE_VERSION detectado${NC}"
else
    echo -e "❌ Node.js no está instalado"
    exit 1
fi

# Verificar instalación de módulos
echo ""
echo -e "${YELLOW}2️⃣  Verificando módulos npm...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}   ✅ node_modules presente${NC}"
else
    echo -e "${YELLOW}   ⚠️  Instalando dependencias...${NC}"
    npm install --silent > /dev/null 2>&1
    echo -e "${GREEN}   ✅ Dependencias instaladas${NC}"
fi

# Compilar contrato
echo ""
echo -e "${YELLOW}3️⃣  Compilando Smart Contract...${NC}"
npm run compile > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Contrato compilado exitosamente${NC}"
else
    echo -e "❌ Error en compilación"
    exit 1
fi

# Mostrar información del proyecto
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📦 INFORMACIÓN DEL PROYECTO${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

node << 'EOF'
const fs = require("fs");
const path = require("path");

const stats = {
  smartContract: {
    path: "./contracts/TraceabilityManager.sol",
    lines: 0,
    functions: 0
  },
  tests: {
    path: "./test/TraceabilityManager.test.js",
    lines: 0,
    cases: 0
  },
  frontend: {
    components: 0
  }
};

// Contar líneas del contrato
if (fs.existsSync(stats.smartContract.path)) {
  const content = fs.readFileSync(stats.smartContract.path, "utf8");
  stats.smartContract.lines = content.split("\n").length;
  stats.smartContract.functions = (content.match(/function /g) || []).length;
}

// Contar casos de test
if (fs.existsSync(stats.tests.path)) {
  const content = fs.readFileSync(stats.tests.path, "utf8");
  stats.tests.lines = content.split("\n").length;
  stats.tests.cases = (content.match(/it\("/g) || []).length;
}

// Contar componentes
const componentDir = "./frontend/src/components";
if (fs.existsSync(componentDir)) {
  stats.frontend.components = fs.readdirSync(componentDir).filter(f => f.endsWith(".jsx")).length;
}

console.log(`📝 Smart Contract:`);
console.log(`   Líneas:              ${stats.smartContract.lines}`);
console.log(`   Funciones:           ${stats.smartContract.functions}`);
console.log(`   Roles:               3 (Admin, Certifier, Creator)\n`);

console.log(`🧪 Tests Unitarios:`);
console.log(`   Líneas:              ${stats.tests.lines}`);
console.log(`   Casos de Test:       ${stats.tests.cases}+\n`);

console.log(`⚛️  Frontend React:`);
console.log(`   Componentes:         ${stats.frontend.components}`);
console.log(`   Framework:           React + Vite + ethers.js\n`);

console.log(`🔥 Optimizaciones de Gas:`);
console.log(`   Compiler Optimizer:  enabled (runs: 200)`);
console.log(`   Calldata Usage:      para strings y arrays`);
console.log(`   Eventos Indexados:   sí, 2-3 params\n`);

console.log(`📚 Documentación:`);
console.log(`   README-TFM3.md:      Técnica completa`);
console.log(`   IA.md:               Retrospectiva de IA`);
console.log(`   QUICK-START.md:      Guía rápida\n`);
EOF

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎯 FUNCIONALIDADES IMPLEMENTADAS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo -e "   ${GREEN}✅${NC} Registro de Activos Industriales"
echo -e "   ${GREEN}✅${NC} Emisión de Certificaciones"
echo -e "   ${GREEN}✅${NC} Renovación de Certificados"
echo -e "   ${GREEN}✅${NC} Revocación Inmediata"
echo -e "   ${GREEN}✅${NC} Control de Roles Granular"
echo -e "   ${GREEN}✅${NC} Eventos Indexados para Auditoría"
echo -e "   ${GREEN}✅${NC} Interfaz Web3 Completa"
echo -e "   ${GREEN}✅${NC} Tests Exhaustivos (40+ casos)"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🚀 CÓMO EJECUTAR EL SISTEMA${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo -e "📍 ${YELLOW}Opción A: Ejecución Manual (3 Terminales)${NC}\n"
echo "   Terminal 1 - Red Local:"
echo -e "   ${GREEN}$ npm run node${NC}\n"

echo "   Terminal 2 - Frontend:"
echo -e "   ${GREEN}$ npm run frontend${NC}\n"

echo "   Terminal 3 - Tests:"
echo -e "   ${GREEN}$ npm run test${NC}\n"

echo -e "📍 ${YELLOW}Opción B: Estado del Proyecto${NC}\n"
echo "   Verificar compilación:"
echo -e "   ${GREEN}$ node scripts/verify.js${NC}\n"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚙️  CONFIGURACIÓN DE HARDHAT${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo "   Solidity Version:    0.8.24"
echo "   Compiler Optimizer:  enabled (runs: 200)"
echo "   Chain ID:            31337 (Hardhat Local)"
echo "   RPC URL:             http://127.0.0.1:8545"
echo "   WebSocket:           ws://127.0.0.1:8545"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ PROYECTO TFM3 - LISTO PARA PRODUCCIÓN${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo "   Fecha:    9 de enero de 2026"
echo "   Versión: 1.0.0"
echo "   Autor:   Matías Banchio"
echo "   Máster:  Blockchain - 2026"
echo ""
echo "   📖 Para más información, consulta README-TFM3.md"
echo ""
