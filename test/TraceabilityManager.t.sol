// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/TraceabilityManager.sol";

contract TraceabilityManagerTest is Test {
    TraceabilityManager traceability;
    address owner;
    address certifier;
    address assetCreator;
    address user1;
    address user2;
    address user3;

    function setUp() public {
        traceability = new TraceabilityManager();
        
        owner = address(this);
        certifier = address(0x1);
        assetCreator = address(0x2);
        user1 = address(0x3);
        user2 = address(0x4);
        user3 = address(0x5);

        traceability.grantCertifierRole(certifier);
        traceability.grantAssetCreatorRole(assetCreator);
    }

    // ═══════════════════════════════════════════════════════════════
    // USER REGISTRATION TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_registerUser() public {
        traceability.registerUser("testuser", "AUDITOR");
        (string memory username, string memory role, bool active, , address wallet) = traceability.getUserByUsername("testuser");
        
        assertEq(username, "testuser");
        assertEq(role, "AUDITOR");
        assertTrue(active);
        assertEq(wallet, address(0));
    }

    function test_registerUserTwiceShouldFail() public {
        traceability.registerUser("duplicateuser", "AUDITOR");
        vm.expectRevert("User already exists");
        traceability.registerUser("duplicateuser", "AUDITOR");
    }

    function test_registerUserInvalidRole() public {
        vm.expectRevert("Invalid role");
        traceability.registerUser("testuser", "INVALID_ROLE");
    }

    function test_registerUserWithoutAdminShouldFail() public {
        vm.prank(user1);
        vm.expectRevert();
        traceability.registerUser("testuser", "AUDITOR");
    }

    function test_registerMultipleUsers() public {
        traceability.registerUser("user1", "AUDITOR");
        traceability.registerUser("user2", "CERTIFIER");
        traceability.registerUser("user3", "ASSET_CREATOR");

        (, , bool active1, , ) = traceability.getUserByUsername("user1");
        (, , bool active2, , ) = traceability.getUserByUsername("user2");
        (, , bool active3, , ) = traceability.getUserByUsername("user3");

        assertTrue(active1);
        assertTrue(active2);
        assertTrue(active3);
    }

    function test_deactivateUser() public {
        traceability.registerUser("user1", "AUDITOR");
        traceability.deactivateUser("user1");

        vm.expectRevert("User is inactive");
        traceability.getUserByUsername("user1");
    }

    function test_deactivateUserWithoutAdminShouldFail() public {
        traceability.registerUser("user1", "AUDITOR");

        vm.prank(user1);
        vm.expectRevert();
        traceability.deactivateUser("user1");
    }

    // ═══════════════════════════════════════════════════════════════
    // USER QUERY TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_getUserRole() public {
        traceability.registerUser("testuser", "CERTIFIER");
        string memory role = traceability.getUserRole("testuser");
        assertEq(role, "CERTIFIER");
    }

    function test_getUserDetails() public {
        traceability.registerUser("testuser", "AUDITOR");
        TraceabilityManager.User memory user = traceability.getUserDetails("testuser");
        
        assertEq(user.username, "testuser");
        assertEq(user.role, "AUDITOR");
        assertTrue(user.active);
    }

    function test_getUsersByRole() public {
        traceability.registerUser("user1", "AUDITOR");
        traceability.registerUser("user2", "AUDITOR");
        traceability.registerUser("user3", "CERTIFIER");

        address[] memory auditors = traceability.getUsersByRole("AUDITOR");
        assertGt(auditors.length, 0);
    }

    function test_getUsernameByWallet() public {
        vm.prank(user1);
        traceability.linkWalletToUser("walletuser", "AUDITOR");

        string memory username = traceability.getUsernameByWallet(user1);
        assertEq(username, "walletuser");
    }

    function test_getUser() public {
        vm.prank(user1);
        traceability.linkWalletToUser("walletuser", "AUDITOR");

        TraceabilityManager.User memory user = traceability.getUser(user1);
        assertEq(user.username, "walletuser");
        assertTrue(user.active);
    }

    // ═══════════════════════════════════════════════════════════════
    // WALLET LINKING TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_linkWalletToNewUser() public {
        vm.prank(user1);
        traceability.linkWalletToUser("walletuser", "ASSET_CREATOR");

        (string memory username, , bool active, , address wallet) = traceability.getUserByUsername("walletuser");
        assertEq(username, "walletuser");
        assertTrue(active);
        assertEq(wallet, user1);
    }

    function test_linkMultipleWalletsToUser() public {
        vm.prank(user1);
        traceability.linkWalletToUser("multiuser", "AUDITOR");

        vm.prank(user2);
        traceability.linkWalletToUser("multiuser", "AUDITOR");

        address[] memory wallets = traceability.getAllWallets("multiuser");
        assertEq(wallets.length, 2);
    }

    function test_getActiveWallet() public {
        vm.prank(user1);
        traceability.linkWalletToUser("walletuser", "AUDITOR");

        address activeWallet = traceability.getActiveWallet("walletuser");
        assertEq(activeWallet, user1);
    }

    function test_getAllWallets() public {
        vm.prank(user1);
        traceability.linkWalletToUser("multiuser", "AUDITOR");

        vm.prank(user2);
        traceability.linkWalletToUser("multiuser", "AUDITOR");

        vm.prank(user3);
        traceability.linkWalletToUser("multiuser", "AUDITOR");

        address[] memory wallets = traceability.getAllWallets("multiuser");
        assertEq(wallets.length, 3);
    }

    function test_getWalletInfo() public {
        vm.prank(user1);
        traceability.linkWalletToUser("walletuser", "AUDITOR");

        TraceabilityManager.WalletInfo memory info = traceability.getWalletInfo(user1);
        assertEq(info.walletAddress, user1);
        assertTrue(info.active);
    }

    function test_unlinkWallet() public {
        vm.prank(user1);
        traceability.linkWalletToUser("walletuser", "AUDITOR");

        vm.prank(user1);
        traceability.unlinkWallet("walletuser");

        TraceabilityManager.WalletInfo memory info = traceability.getWalletInfo(user1);
        assertFalse(info.active);
    }

    // ═══════════════════════════════════════════════════════════════
    // ASSET REGISTRATION TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_registerAsset() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "High grade steel");

        TraceabilityManager.Asset memory asset = traceability.getAsset(1);
        
        assertEq(asset.assetId, 1);
        assertEq(asset.owner, assetCreator);
        assertTrue(asset.active);
        assertEq(asset.assetType, "Metal");
        assertEq(asset.description, "High grade steel");
    }

    function test_registerAssetWithoutRoleShouldFail() public {
        vm.prank(user1);
        vm.expectRevert();
        traceability.registerAsset("Metal", "Steel");
    }

    function test_assetIdAutoIncrement() public {
        vm.startPrank(assetCreator);
        
        traceability.registerAsset("Metal", "Steel");
        traceability.registerAsset("Wood", "Pine");
        traceability.registerAsset("Plastic", "HDPE");

        vm.stopPrank();

        TraceabilityManager.Asset memory a1 = traceability.getAsset(1);
        TraceabilityManager.Asset memory a2 = traceability.getAsset(2);
        TraceabilityManager.Asset memory a3 = traceability.getAsset(3);

        assertEq(a1.assetId, 1);
        assertEq(a2.assetId, 2);
        assertEq(a3.assetId, 3);
    }

    function test_deactivateAsset() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        vm.prank(assetCreator);
        traceability.deactivateAsset(1);

        TraceabilityManager.Asset memory asset = traceability.getAsset(1);
        assertFalse(asset.active);
    }

    function test_deactivateAssetWithoutOwnership() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        vm.prank(user1);
        vm.expectRevert("Only owner");
        traceability.deactivateAsset(1);
    }

    function test_getUserAssets() public {
        vm.startPrank(assetCreator);
        
        traceability.registerAsset("Metal", "Steel");
        traceability.registerAsset("Wood", "Pine");
        traceability.registerAsset("Plastic", "HDPE");

        vm.stopPrank();

        uint256[] memory assets = traceability.getUserAssets(assetCreator);
        assertEq(assets.length, 3);
    }

    function test_invalidAssetId() public {
        vm.expectRevert("Asset not found");
        traceability.getAsset(9999);
    }

    // ═══════════════════════════════════════════════════════════════
    // CERTIFICATE TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_issueCertificate() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        uint256 expiresAt = block.timestamp + 365 days;
        vm.prank(certifier);
        uint256 certId = traceability.issueCertificate(1, expiresAt, "QUALITY");

        TraceabilityManager.Certificate memory cert = traceability.getCertificate(certId);
        
        assertEq(cert.certId, certId);
        assertEq(cert.assetId, 1);
        assertEq(cert.expiresAt, expiresAt);
        assertEq(cert.issuer, certifier);
        assertFalse(cert.revoked);
        assertEq(cert.certType, "QUALITY");
    }

    function test_issueCertificateWithoutRole() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        uint256 expiresAt = block.timestamp + 365 days;
        vm.prank(user1);
        vm.expectRevert();
        traceability.issueCertificate(1, expiresAt, "QUALITY");
    }

    function test_revokeCertificate() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        uint256 expiresAt = block.timestamp + 365 days;
        vm.prank(certifier);
        uint256 certId = traceability.issueCertificate(1, expiresAt, "QUALITY");

        vm.prank(certifier);
        traceability.revokeCertificate(certId);

        TraceabilityManager.Certificate memory cert = traceability.getCertificate(certId);
        assertTrue(cert.revoked);
    }

    function test_getCertificatesByAsset() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        uint256 expiresAt = block.timestamp + 365 days;
        vm.startPrank(certifier);
        
        traceability.issueCertificate(1, expiresAt, "QUALITY");
        traceability.issueCertificate(1, expiresAt, "SAFETY");
        traceability.issueCertificate(1, expiresAt, "COMPLIANCE");

        vm.stopPrank();

        uint256[] memory certIds = traceability.getCertificatesByAsset(1);
        assertEq(certIds.length, 3);
    }

    function test_invalidCertificateId() public {
        vm.expectRevert("Certificate not found");
        traceability.getCertificate(9999);
    }

    function test_multipleCertificateTypes() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        uint256 expiresAt = block.timestamp + 365 days;

        vm.startPrank(certifier);
        uint256 cert1 = traceability.issueCertificate(1, expiresAt, "QUALITY");
        uint256 cert2 = traceability.issueCertificate(1, expiresAt, "SAFETY");
        vm.stopPrank();

        TraceabilityManager.Certificate memory c1 = traceability.getCertificate(cert1);
        TraceabilityManager.Certificate memory c2 = traceability.getCertificate(cert2);

        assertEq(c1.certType, "QUALITY");
        assertEq(c2.certType, "SAFETY");
    }

    // ═══════════════════════════════════════════════════════════════
    // ROLE MANAGEMENT TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_grantCertifierRole() public {
        address newCertifier = address(0x10);
        traceability.grantCertifierRole(newCertifier);

        bytes32 CERTIFIER_ROLE = traceability.CERTIFIER_ROLE();
        assertTrue(traceability.hasRole(CERTIFIER_ROLE, newCertifier));
    }

    function test_grantAssetCreatorRole() public {
        address newCreator = address(0x11);
        traceability.grantAssetCreatorRole(newCreator);

        bytes32 ASSET_CREATOR_ROLE = traceability.ASSET_CREATOR_ROLE();
        assertTrue(traceability.hasRole(ASSET_CREATOR_ROLE, newCreator));
    }

    function test_revokeCertifierRole() public {
        traceability.revokeCertifierRole(certifier);

        bytes32 CERTIFIER_ROLE = traceability.CERTIFIER_ROLE();
        assertFalse(traceability.hasRole(CERTIFIER_ROLE, certifier));
    }

    function test_revokeAssetCreatorRole() public {
        traceability.revokeAssetCreatorRole(assetCreator);

        bytes32 ASSET_CREATOR_ROLE = traceability.ASSET_CREATOR_ROLE();
        assertFalse(traceability.hasRole(ASSET_CREATOR_ROLE, assetCreator));
    }

    function test_revokedCertifierCannotIssueCertificate() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        traceability.revokeCertifierRole(certifier);

        uint256 expiresAt = block.timestamp + 365 days;
        vm.prank(certifier);
        vm.expectRevert();
        traceability.issueCertificate(1, expiresAt, "QUALITY");
    }

    // ═══════════════════════════════════════════════════════════════
    // EDGE CASES AND SECURITY TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_registerMultipleAssets() public {
        vm.startPrank(assetCreator);
        
        for (uint256 i = 0; i < 10; i++) {
            traceability.registerAsset("Type", "Description");
        }
        
        vm.stopPrank();

        uint256[] memory assets = traceability.getUserAssets(assetCreator);
        assertEq(assets.length, 10);
    }

    function test_registerMultipleWallets() public {
        vm.prank(user1);
        traceability.linkWalletToUser("user", "AUDITOR");

        vm.prank(user2);
        traceability.linkWalletToUser("user", "AUDITOR");

        vm.prank(user3);
        traceability.linkWalletToUser("user", "AUDITOR");

        address[] memory wallets = traceability.getAllWallets("user");
        assertEq(wallets.length, 3);
    }

    function test_certificateExpirationTime() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        uint256 expiresAt = block.timestamp + 730 days;
        vm.prank(certifier);
        uint256 certId = traceability.issueCertificate(1, expiresAt, "QUALITY");

        TraceabilityManager.Certificate memory cert = traceability.getCertificate(certId);
        assertEq(cert.expiresAt, expiresAt);
    }

    function test_assetOwnershipInheritance() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        TraceabilityManager.Asset memory asset = traceability.getAsset(1);
        assertEq(asset.owner, assetCreator);
    }

    function test_walletInfoTracking() public {
        vm.prank(user1);
        traceability.linkWalletToUser("testuser", "AUDITOR");

        TraceabilityManager.WalletInfo memory info = traceability.getWalletInfo(user1);
        assertEq(info.walletAddress, user1);
        assertTrue(info.active);
    }

    // ═══════════════════════════════════════════════════════════════
    // GAS OPTIMIZATION TESTS
    // ═══════════════════════════════════════════════════════════════

    function test_bulkAssetRegistration() public {
        vm.startPrank(assetCreator);
        for (uint256 i = 0; i < 20; i++) {
            traceability.registerAsset("Type", "Desc");
        }
        vm.stopPrank();

        uint256[] memory assets = traceability.getUserAssets(assetCreator);
        assertEq(assets.length, 20);
    }

    function test_bulkCertificateIssuance() public {
        vm.prank(assetCreator);
        traceability.registerAsset("Metal", "Steel");

        uint256 expiresAt = block.timestamp + 365 days;
        vm.startPrank(certifier);
        
        for (uint256 i = 0; i < 5; i++) {
            traceability.issueCertificate(1, expiresAt, "QUALITY");
        }
        
        vm.stopPrank();

        uint256[] memory certs = traceability.getCertificatesByAsset(1);
        assertEq(certs.length, 5);
    }
}
