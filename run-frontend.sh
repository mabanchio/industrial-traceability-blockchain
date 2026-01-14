#!/bin/bash
# Script para desplegar el frontend TFM3
# Uso: ./run-frontend.sh

cd "$(dirname "$0")" || exit 1

echo "╔═════════════════════════════════════════════════════╗"
echo "║  🚀 INICIANDO FRONTEND TFM3                         ║"
echo "╚═════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: frontend/package.json no encontrado"
    echo "Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Matar procesos anteriores si existen
echo "🛑 Terminando procesos anteriores..."
pkill -f "vite" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 1

echo "📦 Verificando dependencias..."
if [ ! -d "frontend/node_modules" ]; then
    echo "⏳ Instalando dependencias (primera vez)..."
    npm --prefix frontend install --legacy-peer-deps
else
    echo "✅ Dependencias ya instaladas"
fi

echo ""
echo "🚀 Iniciando servidor de desarrollo..."
echo ""
echo "═════════════════════════════════════════════════════"
echo "🌐 Frontend disponible en: http://localhost:3000"
echo "═════════════════════════════════════════════════════"
echo ""
echo "Presiona CTRL+C para detener el servidor"
echo ""

# Ejecutar desde la raíz del proyecto
npm --prefix frontend run dev
