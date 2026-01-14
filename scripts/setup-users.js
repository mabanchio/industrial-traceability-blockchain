// Script para registrar usuarios demo en el sistema
// Uso: npx hardhat run scripts/setup-users.js --network localhost

const hre = require("hardhat");

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afccb333f8a9c12e1f0d7a8f7cbc";

// Wallets de Hardhat para pruebas
const DEMO_USERS = [
  {
    address: "0x70997970C51812e339D9B73b0245Ad59c36A8026",
    username: "Ana García",
    role: "CERTIFIER"
  },
  {
    address: "0x3C44CdDdB6a900c2Dd649fa3bC0aa98b5E6F8A31",
    username: "Carlos López",
    role: "MANUFACTURER"
  },
  {
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    username: "Diana Chen",
    role: "AUDITOR"
  },
  {
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    username: "Eduardo Martín",
    role: "ASSET_CREATOR"
  },
  {
    address: "0x1CBd3B2770909D4e10f157cABC84C7264073C9Ec",
    username: "Francisca Ruiz",
    role: "DISTRIBUTOR"
  }
];

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  📝 CONFIGURACIÓN DE USUARIOS DEMO - TFM3");
  console.log("═══════════════════════════════════════════════════════════\n");

  try {
    // Obtener el contrato
    const TraceabilityManager = await hre.ethers.getContractFactory("TraceabilityManager");
    const contract = TraceabilityManager.attach(CONTRACT_ADDRESS);

    // Obtener signatario (debe ser admin)
    const [admin] = await hre.ethers.getSigners();
    console.log(`✅ Admin conectado: ${admin.address}\n`);

    console.log("📋 Registrando usuarios demo...\n");

    let registered = 0;

    for (const user of DEMO_USERS) {
      try {
        console.log(`  📝 Registrando: ${user.username}`);
        console.log(`     Wallet: ${user.address}`);
        console.log(`     Rol: ${user.role}`);

        const tx = await contract.registerUser(
          user.address,
          user.username,
          user.role
        );

        await tx.wait();

        console.log(`     ✅ Registrado exitosamente\n`);
        registered++;
      } catch (err) {
        console.log(`     ❌ Error: ${err.message}\n`);
      }
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log(`  ✅ CONFIGURACIÓN COMPLETADA`);
    console.log(`  ${registered}/${DEMO_USERS.length} usuarios registrados`);
    console.log("═══════════════════════════════════════════════════════════\n");

    console.log("🔑 INFORMACIÓN DE ACCESO PARA PRUEBAS:\n");
    console.log("Admin (Hardhat):");
    console.log(`  Wallet: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`);
    console.log(`  Rol: ADMIN\n`);

    console.log("Usuarios Creados:");
    DEMO_USERS.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username}`);
      console.log(`     Wallet: ${user.address}`);
      console.log(`     Rol: ${user.role}\n`);
    });

    console.log("Próximos pasos:");
    console.log("1. Inicia el frontend: npm --prefix frontend run dev");
    console.log("2. Conecta con MetaMask usando una de las wallets de demo");
    console.log("3. El administrador puede cambiar roles en el Panel de Administración\n");

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
