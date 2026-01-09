const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TraceabilityManager", function () {
  let traceability;
  let owner, certifier, assetCreator, user;

  beforeEach(async function () {
    [owner, certifier, assetCreator, user] = await ethers.getSigners();

    const TraceabilityManager = await ethers.getContractFactory("TraceabilityManager");
    traceability = await TraceabilityManager.deploy();
    await traceability.waitForDeployment();

    // Grant roles
    const CERTIFIER_ROLE = await traceability.CERTIFIER_ROLE();
    const ASSET_CREATOR_ROLE = await traceability.ASSET_CREATOR_ROLE();

    await traceability.grantCertifierRole(certifier.address);
    await traceability.grantAssetCreatorRole(assetCreator.address);
  });

  describe("Asset Registration", function () {
    it("Should register an asset with correct data", async function () {
      const tx = await traceability
        .connect(assetCreator)
        .registerAsset("Metal", "High grade steel");

      const receipt = await tx.wait();
      const event = receipt.logs[0];

      expect(event).to.exist;

      const asset = await traceability.getAsset(1);
      expect(asset.assetId).to.equal(1);
      expect(asset.owner).to.equal(assetCreator.address);
      expect(asset.active).to.be.true;
      expect(asset.assetType).to.equal("Metal");
    });

    it("Should emit AssetRegistered event", async function () {
      await expect(
        traceability.connect(assetCreator).registerAsset("Wood", "Pine timber")
      )
        .to.emit(traceability, "AssetRegistered")
        .withArgs(1, assetCreator.address, "Wood");
    });

    it("Should revert if not ASSET_CREATOR_ROLE", async function () {
      await expect(
        traceability.connect(user).registerAsset("Metal", "Steel")
      ).to.be.revertedWithCustomError(traceability, "AccessControlUnauthorizedAccount");
    });

    it("Should increment asset counter correctly", async function () {
      await traceability.connect(assetCreator).registerAsset("Metal", "Steel");
      await traceability.connect(assetCreator).registerAsset("Wood", "Pine");

      const asset1 = await traceability.getAsset(1);
      const asset2 = await traceability.getAsset(2);

      expect(asset1.assetId).to.equal(1);
      expect(asset2.assetId).to.equal(2);
    });

    it("Should track assets by user", async function () {
      await traceability.connect(assetCreator).registerAsset("Metal", "Steel");
      await traceability.connect(assetCreator).registerAsset("Wood", "Pine");

      const userAssets = await traceability.getUserAssets(assetCreator.address);
      expect(userAssets.length).to.equal(2);
      expect(userAssets[0]).to.equal(1);
      expect(userAssets[1]).to.equal(2);
    });
  });

  describe("Asset Deactivation", function () {
    beforeEach(async function () {
      await traceability.connect(assetCreator).registerAsset("Metal", "Steel");
    });

    it("Should deactivate an asset", async function () {
      await traceability.connect(assetCreator).deactivateAsset(1);

      const asset = await traceability.getAsset(1);
      expect(asset.active).to.be.false;
    });

    it("Should emit AssetDeactivated event", async function () {
      await expect(traceability.connect(assetCreator).deactivateAsset(1))
        .to.emit(traceability, "AssetDeactivated")
        .withArgs(1);
    });

    it("Should revert if not asset owner", async function () {
      await expect(
        traceability.connect(user).deactivateAsset(1)
      ).to.be.revertedWith("Only owner");
    });

    it("Should revert if already inactive", async function () {
      await traceability.connect(assetCreator).deactivateAsset(1);

      await expect(
        traceability.connect(assetCreator).deactivateAsset(1)
      ).to.be.revertedWith("Already inactive");
    });
  });

  describe("Certificate Management", function () {
    beforeEach(async function () {
      await traceability.connect(assetCreator).registerAsset("Metal", "Steel");
    });

    it("Should issue a certificate", async function () {
      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 86400; // 1 day

      const tx = await traceability
        .connect(certifier)
        .issueCertificate(1, expiresAt, "ISO-9001");

      const receipt = await tx.wait();

      expect(receipt.logs.length).to.be.greaterThan(0);
    });

    it("Should emit CertificateIssued event", async function () {
      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 86400;

      await expect(
        traceability.connect(certifier).issueCertificate(1, expiresAt, "ISO-9001")
      )
        .to.emit(traceability, "CertificateIssued")
        .withArgs(1, 1, certifier.address, expiresAt);
    });

    it("Should revert if certificate issuer is not CERTIFIER_ROLE", async function () {
      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 86400;

      await expect(
        traceability.connect(user).issueCertificate(1, expiresAt, "ISO-9001")
      ).to.be.revertedWithCustomError(traceability, "AccessControlUnauthorizedAccount");
    });

    it("Should revert if asset is not active", async function () {
      await traceability.connect(assetCreator).deactivateAsset(1);

      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 86400;

      await expect(
        traceability.connect(certifier).issueCertificate(1, expiresAt, "ISO-9001")
      ).to.be.revertedWith("Asset not active");
    });

    it("Should revert if expiration is in the past", async function () {
      const pastTime = (await ethers.provider.getBlock("latest")).timestamp - 1000;

      await expect(
        traceability.connect(certifier).issueCertificate(1, pastTime, "ISO-9001")
      ).to.be.revertedWith("Invalid expiration");
    });

    it("Should get certificate correctly", async function () {
      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 86400;
      await traceability.connect(certifier).issueCertificate(1, expiresAt, "ISO-9001");

      const cert = await traceability.getCertificate(1);
      expect(cert.certId).to.equal(1);
      expect(cert.assetId).to.equal(1);
      expect(cert.issuer).to.equal(certifier.address);
      expect(cert.revoked).to.be.false;
      expect(cert.certType).to.equal("ISO-9001");
    });

    it("Should get certificates by asset", async function () {
      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 86400;

      await traceability.connect(certifier).issueCertificate(1, expiresAt, "ISO-9001");
      await traceability.connect(certifier).issueCertificate(1, expiresAt, "FSC");

      const certs = await traceability.getCertificatesByAsset(1);
      expect(certs.length).to.equal(2);
      expect(certs[0]).to.equal(1);
      expect(certs[1]).to.equal(2);
    });
  });

  describe("Certificate Renewal", function () {
    beforeEach(async function () {
      await traceability.connect(assetCreator).registerAsset("Metal", "Steel");

      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 86400;
      await traceability.connect(certifier).issueCertificate(1, expiresAt, "ISO-9001");
    });

    it("Should renew a certificate", async function () {
      const newExpiration = (await ethers.provider.getBlock("latest")).timestamp + 172800; // 2 days

      await traceability.connect(certifier).renewCertificate(1, newExpiration);

      const cert = await traceability.getCertificate(1);
      expect(cert.expiresAt).to.equal(newExpiration);
    });

    it("Should emit CertificateRenewed event", async function () {
      const newExpiration = (await ethers.provider.getBlock("latest")).timestamp + 172800;

      await expect(traceability.connect(certifier).renewCertificate(1, newExpiration))
        .to.emit(traceability, "CertificateRenewed")
        .withArgs(1, 1, newExpiration);
    });

    it("Should revert if certificate is revoked", async function () {
      await traceability.connect(certifier).revokeCertificate(1);

      const newExpiration = (await ethers.provider.getBlock("latest")).timestamp + 172800;

      await expect(
        traceability.connect(certifier).renewCertificate(1, newExpiration)
      ).to.be.revertedWith("Revoked certificate");
    });

    it("Should revert if new expiration is invalid", async function () {
      const pastTime = (await ethers.provider.getBlock("latest")).timestamp - 1000;

      await expect(
        traceability.connect(certifier).renewCertificate(1, pastTime)
      ).to.be.revertedWith("Invalid expiration");
    });
  });

  describe("Certificate Revocation", function () {
    beforeEach(async function () {
      await traceability.connect(assetCreator).registerAsset("Metal", "Steel");

      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 86400;
      await traceability.connect(certifier).issueCertificate(1, expiresAt, "ISO-9001");
    });

    it("Should revoke a certificate", async function () {
      await traceability.connect(certifier).revokeCertificate(1);

      const cert = await traceability.getCertificate(1);
      expect(cert.revoked).to.be.true;
    });

    it("Should emit CertificateRevoked event", async function () {
      await expect(traceability.connect(certifier).revokeCertificate(1))
        .to.emit(traceability, "CertificateRevoked")
        .withArgs(1);
    });

    it("Should revert if certificate is already revoked", async function () {
      await traceability.connect(certifier).revokeCertificate(1);

      await expect(
        traceability.connect(certifier).revokeCertificate(1)
      ).to.be.revertedWith("Already revoked");
    });

    it("Should revert if not certifier", async function () {
      await expect(
        traceability.connect(user).revokeCertificate(1)
      ).to.be.revertedWithCustomError(traceability, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Certificate Validity", function () {
    it("Should return true for valid certificate", async function () {
      await traceability.connect(assetCreator).registerAsset("Metal", "Steel");

      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 86400;
      await traceability.connect(certifier).issueCertificate(1, expiresAt, "ISO-9001");

      const isValid = await traceability.isCertificateValid(1);
      expect(isValid).to.be.true;
    });

    it("Should return false for revoked certificate", async function () {
      await traceability.connect(assetCreator).registerAsset("Metal", "Steel");

      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 86400;
      await traceability.connect(certifier).issueCertificate(1, expiresAt, "ISO-9001");

      await traceability.connect(certifier).revokeCertificate(1);

      const isValid = await traceability.isCertificateValid(1);
      expect(isValid).to.be.false;
    });

    it("Should return false for expired certificate", async function () {
      await traceability.connect(assetCreator).registerAsset("Metal", "Steel");

      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 1; // 1 second
      await traceability.connect(certifier).issueCertificate(1, expiresAt, "ISO-9001");

      // Mine a block to advance time
      await ethers.provider.send("evm_mine", []);

      const isValid = await traceability.isCertificateValid(1);
      expect(isValid).to.be.false;
    });
  });

  describe("Role Management", function () {
    it("Should grant CERTIFIER_ROLE", async function () {
      const CERTIFIER_ROLE = await traceability.CERTIFIER_ROLE();

      await traceability.grantCertifierRole(user.address);

      const hasRole = await traceability.hasRole(CERTIFIER_ROLE, user.address);
      expect(hasRole).to.be.true;
    });

    it("Should grant ASSET_CREATOR_ROLE", async function () {
      const ASSET_CREATOR_ROLE = await traceability.ASSET_CREATOR_ROLE();

      await traceability.grantAssetCreatorRole(user.address);

      const hasRole = await traceability.hasRole(ASSET_CREATOR_ROLE, user.address);
      expect(hasRole).to.be.true;
    });

    it("Should revoke CERTIFIER_ROLE", async function () {
      const CERTIFIER_ROLE = await traceability.CERTIFIER_ROLE();

      await traceability.revokeCertifierRole(certifier.address);

      const hasRole = await traceability.hasRole(CERTIFIER_ROLE, certifier.address);
      expect(hasRole).to.be.false;
    });

    it("Should revoke ASSET_CREATOR_ROLE", async function () {
      const ASSET_CREATOR_ROLE = await traceability.ASSET_CREATOR_ROLE();

      await traceability.revokeAssetCreatorRole(assetCreator.address);

      const hasRole = await traceability.hasRole(ASSET_CREATOR_ROLE, assetCreator.address);
      expect(hasRole).to.be.false;
    });

    it("Should revert if non-admin grants role", async function () {
      await expect(
        traceability.connect(user).grantCertifierRole(user.address)
      ).to.be.revertedWithCustomError(traceability, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should register multiple assets efficiently", async function () {
      const tx1 = await traceability.connect(assetCreator).registerAsset("Metal", "Steel");
      const receipt1 = await tx1.wait();

      const tx2 = await traceability.connect(assetCreator).registerAsset("Wood", "Pine");
      const receipt2 = await tx2.wait();

      expect(receipt1.gasUsed).to.be.lt(receipt2.gasUsed.add(100000)); // Similar gas usage
    });

    it("Should issue multiple certificates efficiently", async function () {
      await traceability.connect(assetCreator).registerAsset("Metal", "Steel");

      const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 86400;

      const tx1 = await traceability.connect(certifier).issueCertificate(1, expiresAt, "ISO-9001");
      const receipt1 = await tx1.wait();

      const tx2 = await traceability.connect(certifier).issueCertificate(1, expiresAt, "FSC");
      const receipt2 = await tx2.wait();

      expect(receipt1.gasUsed).to.be.lt(receipt2.gasUsed.add(100000)); // Similar gas usage
    });
  });
});
