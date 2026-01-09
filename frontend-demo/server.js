#!/usr/bin/env node
/**
 * Servidor de demostración para TFM3
 * Sirve el frontend moderno con soporte CORS
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DEMO_DIR = __dirname;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Default to index-authenticated.html
  if (pathname === '/') {
    pathname = '/index-authenticated.html';
  }

  const filePath = path.join(DEMO_DIR, pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(DEMO_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Archivo no encontrado</h1>');
      } else {
        res.writeHead(500);
        res.end('Error interno del servidor');
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║              🌐 SERVIDOR DEMO - TFM3 INICIADO                      ║
╚════════════════════════════════════════════════════════════════════╝

📍 URL: http://localhost:${PORT}
🔗 Frontend: http://localhost:${PORT}/index.html

✅ Características disponibles:
   • Dashboard con estadísticas
   • Gestión de activos (registro, consulta)
   • Gestión de certificados (emisión, consulta, validación)
   • Prueba rápida automatizada
   • Interfaz moderna y responsive

⌨️  Presiona CTRL+C para detener el servidor

════════════════════════════════════════════════════════════════════
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`);
  } else {
    console.error('Error del servidor:', err);
  }
  process.exit(1);
});
