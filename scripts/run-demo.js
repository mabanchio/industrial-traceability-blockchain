#!/usr/bin/env node
/**
 * Demo interactivo del sistema TFM3
 * Prueba funcionalidad sin requerer hardhat node
 */

const hre = require("hardhat");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                   🚀 DEMO INTERACTIVO - TFM3                             ║
║          Trazabilidad Industrial con Blockchain en Ethereum              ║
╚══════════════════════════════════════════════════════════════════════════╝
  `);

  try {
    console.log("📦 Compilando contrato...");
    await hre.run("compile", { quiet: true });
    console.log("✅ Compilación exitosa\n");

    console.log("🔧 Desplegando TraceabilityManager...");
    const [deployer, certifier, assetCreator, user] =
      await hre.ethers.getSigners();

    const TraceabilityManager = await hre.ethers.getContractFactory(
      "TraceabilityManager"
    );
    const contract = await TraceabilityManager.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log(`✅ Contrato desplegado en: ${contractAddress}\n`);

    // Setup roles
    console.log("🔐 Configurando roles...");
    const CERTIFIER_ROLE =
      "0x1d2d5b86fef17fb3d0afc27bad1ad63dd5e18f5a0e8dc5b8c5c1d5d9e5e5e5e5";
    const ASSET_CREATOR_ROLE =
      "0x2d2d5b86fef17fb3d0afc27bad1ad63dd5e18f5a0e8dc5b8c5c1d5d9e5e5e5e5";

    await contract.grantCertifierRole(await certifier.getAddress());
    await contract.grantAssetCreatorRole(await assetCreator.getAddress());
    console.log("✅ Roles configurados\n");

    // Menu interactivo
    let running = true;

    while (running) {
      console.log(`
════════════════════════════════════════════════════════
OPCIONES DISPONIBLES:
════════════════════════════════════════════════════════
1. Registrar nuevo activo
2. Consultar activo
3. Emitir certificado
4. Consultar certificado
5. Renovar certificado
6. Revocar certificado
7. Ver validez de certificado
8. Salir
════════════════════════════════════════════════════════
      `);

      const option = await question("Selecciona una opción (1-8): ");

      switch (option) {
        case "1": {
          const assetType = await question("Tipo de activo: ");
          const description = await question("Descripción: ");

          const tx = await contract
            .connect(assetCreator)
            .registerAsset(assetType, description);
          const receipt = await tx.wait();

          console.log(`\n✅ Activo registrado`);
          console.log(`   Hash: ${tx.hash}`);
          console.log(`   Gas usado: ${receipt.gasUsed.toString()}\n`);
          break;
        }

        case "2": {
          const assetId = await question("ID del activo: ");
          const asset = await contract.assets(assetId);

          console.log(`\n📊 Detalles del Activo #${assetId}:`);
          console.log(`   Propietario: ${asset.owner}`);
          console.log(`   Tipo: ${asset.assetType}`);
          console.log(`   Descripción: ${asset.description}`);
          console.log(`   Activo: ${asset.active ? "Sí" : "No"}\n`);
          break;
        }

        case "3": {
          const assetId = await question("ID del activo para certificación: ");
          const daysValid = await question("Días válido (ej: 365): ");
          const certType = await question("Tipo de certificado: ");

          const expiresAt = Math.floor(Date.now() / 1000) + daysValid * 86400;

          const tx = await contract
            .connect(certifier)
            .issueCertificate(assetId, expiresAt, certType);
          const receipt = await tx.wait();

          console.log(`\n✅ Certificado emitido`);
          console.log(`   Hash: ${tx.hash}`);
          console.log(`   Gas usado: ${receipt.gasUsed.toString()}`);
          console.log(`   Válido hasta: ${new Date(expiresAt * 1000).toLocaleDateString()}\n`);
          break;
        }

        case "4": {
          const certId = await question("ID del certificado: ");
          const cert = await contract.certificates(certId);

          console.log(`\n📋 Detalles del Certificado #${certId}:`);
          console.log(`   Asset ID: ${cert.assetId}`);
          console.log(`   Tipo: ${cert.certType}`);
          console.log(`   Emisor: ${cert.issuer}`);
          console.log(`   Emitido: ${new Date(cert.issuedAt * 1000).toLocaleDateString()}`);
          console.log(`   Expira: ${new Date(cert.expiresAt * 1000).toLocaleDateString()}`);
          console.log(`   Revocado: ${cert.revoked ? "Sí" : "No"}\n`);
          break;
        }

        case "5": {
          const certId = await question("ID del certificado a renovar: ");
          const daysValid = await question("Nuevos días válido: ");

          const newExpiration =
            Math.floor(Date.now() / 1000) + daysValid * 86400;

          const tx = await contract
            .connect(certifier)
            .renewCertificate(certId, newExpiration);
          const receipt = await tx.wait();

          console.log(`\n✅ Certificado renovado`);
          console.log(`   Hash: ${tx.hash}`);
          console.log(`   Gas usado: ${receipt.gasUsed.toString()}\n`);
          break;
        }

        case "6": {
          const certId = await question("ID del certificado a revocar: ");

          const tx = await contract
            .connect(certifier)
            .revokeCertificate(certId);
          const receipt = await tx.wait();

          console.log(`\n✅ Certificado revocado`);
          console.log(`   Hash: ${tx.hash}`);
          console.log(`   Gas usado: ${receipt.gasUsed.toString()}\n`);
          break;
        }

        case "7": {
          const certId = await question(
            "ID del certificado a validar: "
          );
          const isValid = await contract.isCertificateValid(certId);

          console.log(
            `\n✅ Certificado #${certId} es ${isValid ? "VÁLIDO ✓" : "INVÁLIDO ✗"}\n`
          );
          break;
        }

        case "8": {
          running = false;
          console.log("\n👋 ¡Hasta luego!\n");
          break;
        }

        default:
          console.log("\n❌ Opción inválida\n");
      }
    }

    rl.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    rl.close();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
