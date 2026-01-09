#!/usr/bin/env node
import { ethers } from "ethers";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start local Hardhat node
const hardhat = spawn("npx", ["hardhat", "node"], {
  cwd: __dirname,
  stdio: "inherit"
});

// Wait for node to start
await new Promise(resolve => setTimeout(resolve, 3000));

try {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const [signer] = await provider.listAccounts();
  
  console.log("\n✅ Hardhat node started successfully!");
  console.log(`Signer: ${signer}`);
  
  // Keep running
  await new Promise(resolve => hardhat.on("exit", resolve));
} catch (error) {
  console.error("❌ Error:", error.message);
  hardhat.kill();
  process.exit(1);
}
