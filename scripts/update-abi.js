/**
 * Script para actualizar el ABI del contrato en frontend/src/config/abi.js
 */

const fs = require('fs');
const path = require('path');

async function main() {
  console.log('📝 Actualizando ABI...');

  // Obtener el ABI del artefacto compilado
  const artifactPath = path.join(__dirname, '../artifacts/contracts/TraceabilityManager.sol/TraceabilityManager.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
  const CONTRACT_ABI = artifact.abi;

  // Ruta del archivo ABI en frontend
  const abiFilePath = path.join(__dirname, '../frontend/src/config/abi.js');

  // Crear el contenido del archivo
  const abiFileContent = `// Auto-generated ABI file - DO NOT EDIT MANUALLY
// Generated on: ${new Date().toISOString()}

export const CONTRACT_ABI = ${JSON.stringify(CONTRACT_ABI, null, 2)};
`;

  // Escribir el archivo
  fs.writeFileSync(abiFilePath, abiFileContent, 'utf-8');

  console.log('✅ ABI actualizado en:', abiFilePath);
  console.log('   Cantidad de funciones:', CONTRACT_ABI.filter(item => item.type === 'function').length);
  console.log('   Cantidad de eventos:', CONTRACT_ABI.filter(item => item.type === 'event').length);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error al actualizar ABI:', error);
    process.exit(1);
  });
