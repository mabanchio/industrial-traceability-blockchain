const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LinkWalletToUser Function", function () {
  let traceabilityManager;
  let adminAccount;
  let userAccount;
  let otherAccount;

  beforeEach(async function () {
    // Obtener cuentas
    [adminAccount, userAccount, otherAccount] = await ethers.getSigners();

    // Desplegar contrato
    const TraceabilityManager = await ethers.getContractFactory("TraceabilityManager");
    traceabilityManager = await TraceabilityManager.deploy();
    await traceabilityManager.waitForDeployment();
  });

  describe("linkWalletToUser", function () {
    it("Debe permitir a un usuario vincularse a sí mismo con una wallet", async function () {
      const username = "testuser";
      const role = "ASSET_CREATOR";

      // Obtener la dirección del usuario (msg.sender será userAccount)
      const userAddress = userAccount.address;

      // Conectar como userAccount y vincular su wallet
      const tx = await traceabilityManager
        .connect(userAccount)
        .linkWalletToUser(username, role);

      // Esperar confirmación
      await tx.wait();

      // Verificar que el usuario fue registrado
      const user = await traceabilityManager.getUser(userAddress);
      expect(user.walletAddress).to.equal(userAddress);
      expect(user.username).to.equal(username);
      expect(user.role).to.equal(role);
      expect(user.active).to.be.true;
    });

    it("Debe asignar el rol ASSET_CREATOR cuando se vincule", async function () {
      const username = "assetcreator";
      const role = "ASSET_CREATOR";

      // Vincular wallet
      await traceabilityManager
        .connect(userAccount)
        .linkWalletToUser(username, role);

      // Verificar que tiene el rol
      const hasRole = await traceabilityManager.hasRole(
        await traceabilityManager.ASSET_CREATOR_ROLE(),
        userAccount.address
      );
      expect(hasRole).to.be.true;
    });

    it("Debe rechazar si la wallet ya está vinculada", async function () {
      const username = "testuser";
      const role = "ASSET_CREATOR";

      // Primera vinculación
      await traceabilityManager
        .connect(userAccount)
        .linkWalletToUser(username, role);

      // Segunda vinculación con la misma wallet debe fallar
      try {
        await traceabilityManager
          .connect(userAccount)
          .linkWalletToUser("otheruser", "CERTIFIER");
        expect.fail("Debería haber rechazado la segunda vinculación");
      } catch (error) {
        expect(error.message).to.include("Wallet already linked");
      }
    });

    it("Debe rechazar roles inválidos", async function () {
      const username = "testuser";
      const invalidRole = "INVALID_ROLE";

      try {
        await traceabilityManager
          .connect(userAccount)
          .linkWalletToUser(username, invalidRole);
        expect.fail("Debería haber rechazado el rol inválido");
      } catch (error) {
        expect(error.message).to.include("Invalid role");
      }
    });

    it("Debe emitir el evento UserWalletLinked", async function () {
      const username = "testuser";
      const role = "ASSET_CREATOR";

      const tx = await traceabilityManager
        .connect(userAccount)
        .linkWalletToUser(username, role);

      // Esperar y verificar evento
      const receipt = await tx.wait();
      const event = receipt.logs
        .map(log => {
          try {
            return traceabilityManager.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find(event => event && event.name === "UserWalletLinked");

      expect(event).to.not.be.null;
      expect(event.args.walletAddress).to.equal(userAccount.address);
      expect(event.args.username).to.equal(username);
      expect(event.args.role).to.equal(role);
    });

    it("Debe permitir a múltiples usuarios vincularse", async function () {
      // Usuario 1
      await traceabilityManager
        .connect(userAccount)
        .linkWalletToUser("user1", "ASSET_CREATOR");

      // Usuario 2
      await traceabilityManager
        .connect(otherAccount)
        .linkWalletToUser("user2", "CERTIFIER");

      // Verificar usuario 1
      const user1 = await traceabilityManager.getUser(userAccount.address);
      expect(user1.username).to.equal("user1");

      // Verificar usuario 2
      const user2 = await traceabilityManager.getUser(otherAccount.address);
      expect(user2.username).to.equal("user2");
    });
  });
});
