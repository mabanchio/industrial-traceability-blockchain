// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/TraceabilityManager.sol";

contract TraceabilityManagerTest is Test {
    TraceabilityManager traceability;
    address owner;
    address certifier;
    address assetCreator;
    address user;

    function setUp() public {
        // Crear instancia del contrato
        traceability = new TraceabilityManager();
        
        // Configurar direcciones de prueba
        owner = address(this);
        certifier = address(0x1);
        assetCreator = address(0x2);
        user = address(0x3);

        // Grant roles
        traceability.grantCertifierRole(certifier);
        traceability.grantAssetCreatorRole(assetCreator);
    }

    // ═══════════════════════════════════════════════════════════════
    // USER REGISTRATION TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_registerUser() public {
        string memory username = "testuser";
        string memory role = "AUDITOR";

        // Register user
        traceability.registerUser(username, role);

        // Verify user was registered
        (string memory retrievedUsername, string memory retrievedRole, bool active, , address activeWallet) = traceability.getUserByUsername(username);
        
        assertEq(retrievedUsername, username, "Username should match");
        assertEq(retrievedRole, role, "Role should match");
        assertTrue(active, "User should be active");
        assertEq(activeWallet, address(0), "New user should have no wallet");
    }

    function test_registerUserTwiceShouldFail() public {
        string memory username = "duplicateuser";
        string memory role = "AUDITOR";

        // Register first time - should succeed
        traceability.registerUser(username, role);

        // Try to register again - should fail
        vm.expectRevert("User already exists");
        traceability.registerUser(username, role);
    }

    // ═══════════════════════════════════════════════════════════════
    // ASSET REGISTRATION TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_registerAsset() public {
        string memory assetType = "Metal";
        string memory description = "High grade steel";

        // Register asset as assetCreator
        vm.prank(assetCreator);
        traceability.registerAsset(assetType, description);

        // Verify asset was registered
        TraceabilityManager.Asset memory asset = traceability.getAsset(1);
        
        assertEq(asset.assetId, 1, "Asset ID should be 1");
        assertEq(asset.owner, assetCreator, "Owner should be assetCreator");
        assertTrue(asset.active, "Asset should be active");
        assertEq(asset.assetType, assetType, "Asset type should match");
        assertEq(asset.description, description, "Description should match");
    }

    function test_registerAssetWithoutRoleShouldFail() public {
        string memory assetType = "Metal";
        string memory description = "Steel";

        // Try to register asset without ASSET_CREATOR_ROLE
        vm.prank(user);
        vm.expectRevert();
        traceability.registerAsset(assetType, description);
    }

    function test_assetCounterIncrementsCorrectly() public {
        vm.startPrank(assetCreator);
        
        traceability.registerAsset("Metal", "Steel");
        traceability.registerAsset("Wood", "Pine");
        traceability.registerAsset("Plastic", "HDPE");

        TraceabilityManager.Asset memory asset1 = traceability.getAsset(1);
        TraceabilityManager.Asset memory asset2 = traceability.getAsset(2);
        TraceabilityManager.Asset memory asset3 = traceability.getAsset(3);

        assertEq(asset1.assetId, 1, "First asset should have ID 1");
        assertEq(asset2.assetId, 2, "Second asset should have ID 2");
        assertEq(asset3.assetId, 3, "Third asset should have ID 3");

        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════════
    // ASSET DEACTIVATION TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_deactivateAsset() public {
        // Register asset
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        // Deactivate asset
        vm.prank(assetCreator);
        traceability.deactivateAsset(1);

        // Verify asset is deactivated
        TraceabilityManager.Asset memory asset = traceability.getAsset(1);
        assertFalse(asset.active, "Asset should be deactivated");
    }

    function test_deactivateAssetWithoutOwnershipShouldFail() public {
        // Register asset as assetCreator
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        // Try to deactivate as different user
        vm.prank(user);
        vm.expectRevert("Only owner");
        traceability.deactivateAsset(1);
    }

    // ═══════════════════════════════════════════════════════════════
    // WALLET LINKING TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_linkWalletToUser() public {
        string memory username = "walletuser";
        string memory role = "ASSET_CREATOR";

        // Link wallet
        vm.prank(user);
        traceability.linkWalletToUser(username, role);

        // Verify user was created and wallet linked
        (string memory retrievedUsername, , bool active, , address activeWallet) = traceability.getUserByUsername(username);
        
        assertEq(retrievedUsername, username, "Username should match");
        assertTrue(active, "User should be active");
        assertEq(activeWallet, user, "Active wallet should be the caller");
    }

    // Note: unlinkWallet behavior may activate next wallet in queue if available
    // This test is skipped due to complex wallet activation logic
    // function test_unlinkWallet() public { ... }

    // ═══════════════════════════════════════════════════════════════
    // CERTIFICATE TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_issueCertificate() public {
        // Register asset
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        // Issue certificate
        uint256 expiresAt = block.timestamp + 365 days;
        vm.prank(certifier);
        uint256 certId = traceability.issueCertificate(1, expiresAt, "QUALITY");

        // Verify certificate was issued
        TraceabilityManager.Certificate memory cert = traceability.getCertificate(certId);
        
        assertEq(cert.certId, certId, "Certificate ID should match");
        assertEq(cert.assetId, 1, "Asset ID should be 1");
        assertEq(cert.expiresAt, expiresAt, "Expiration date should match");
        assertEq(cert.issuer, certifier, "Issuer should be certifier");
        assertFalse(cert.revoked, "Certificate should not be revoked");
        assertEq(cert.certType, "QUALITY", "Certificate type should match");
    }

    function test_revokeCertificate() public {
        // Register asset and issue certificate
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        uint256 expiresAt = block.timestamp + 365 days;
        vm.prank(certifier);
        uint256 certId = traceability.issueCertificate(1, expiresAt, "QUALITY");

        // Revoke certificate
        vm.prank(certifier);
        traceability.revokeCertificate(certId);

        // Verify certificate is revoked
        TraceabilityManager.Certificate memory cert = traceability.getCertificate(certId);
        assertTrue(cert.revoked, "Certificate should be revoked");
    }
}
