// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TraceabilityManager is AccessControl, ReentrancyGuard {
    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");
    bytes32 public constant ASSET_CREATOR_ROLE = keccak256("ASSET_CREATOR_ROLE");

    struct User {
        address walletAddress;
        string username;
        string role;
        bool active;
        uint256 registeredAt;
    }

    struct Asset {
        uint256 assetId;
        address owner;
        bool active;
        string assetType;
        string description;
    }

    struct Certificate {
        uint256 certId;
        uint256 assetId;
        uint256 issuedAt;
        uint256 expiresAt;
        address issuer;
        bool revoked;
        string certType;
    }

    uint256 private assetCounter;
    uint256 private certCounter;

    mapping(uint256 => Asset) private assets;
    mapping(uint256 => Certificate) private certificates;
    mapping(uint256 => uint256[]) private assetCertificates;
    mapping(address => uint256[]) private userAssets;
    mapping(address => User) private users;
    mapping(string => address[]) private roleUsers;
    mapping(string => address) private usernameToWallet; // Mapeo username -> wallet para búsqueda rápida

    event AssetRegistered(uint256 indexed assetId, address indexed owner, string assetType);
    event AssetDeactivated(uint256 indexed assetId);
    event CertificateIssued(uint256 indexed certId, uint256 indexed assetId, address indexed issuer, uint256 expiresAt);
    event CertificateRenewed(uint256 indexed certId, uint256 indexed assetId, uint256 newExpiration);
    event CertificateRevoked(uint256 indexed certId);
    event UserRegistered(address indexed walletAddress, string username, string role);
    event UserWalletLinked(address indexed walletAddress, string username, string role);
    event RoleAssigned(address indexed walletAddress, string role);
    event RoleRevoked(address indexed walletAddress, string role);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CERTIFIER_ROLE, msg.sender);
        _grantRole(ASSET_CREATOR_ROLE, msg.sender);
        assetCounter = 1;
        certCounter = 1;
    }

    // ═══════════════════════════════════════════════════════════════
    // USER MANAGEMENT FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function registerUser(
        address walletAddress,
        string calldata username,
        string calldata role
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(walletAddress != address(0), "Invalid wallet");
        require(bytes(username).length > 0, "Invalid username");
        require(!users[walletAddress].active, "User already registered");
        require(
            keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("CERTIFIER")) ||
            keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("ASSET_CREATOR")) ||
            keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("AUDITOR")) ||
            keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("MANUFACTURER")) ||
            keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("DISTRIBUTOR")),
            "Invalid role"
        );

        users[walletAddress] = User({
            walletAddress: walletAddress,
            username: username,
            role: role,
            active: true,
            registeredAt: block.timestamp
        });

        roleUsers[role].push(walletAddress);
        usernameToWallet[username] = walletAddress; // Agregar mapeo username -> wallet

        // Assign roles based on the role string
        if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("CERTIFIER"))) {
            grantRole(CERTIFIER_ROLE, walletAddress);
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("ASSET_CREATOR"))) {
            grantRole(ASSET_CREATOR_ROLE, walletAddress);
        }

        emit UserRegistered(walletAddress, username, role);
    }

    // Permite a usuarios vincularse a sí mismos con una wallet
    function linkWalletToUser(
        string calldata username,
        string calldata role
    ) external {
        require(msg.sender != address(0), "Invalid wallet");
        require(bytes(username).length > 0, "Invalid username");
        require(!users[msg.sender].active, "Wallet already linked");
        require(
            keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("CERTIFIER")) ||
            keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("ASSET_CREATOR")) ||
            keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("AUDITOR")) ||
            keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("MANUFACTURER")) ||
            keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("DISTRIBUTOR")),
            "Invalid role"
        );

        users[msg.sender] = User({
            walletAddress: msg.sender,
            username: username,
            role: role,
            active: true,
            registeredAt: block.timestamp
        });

        roleUsers[role].push(msg.sender);
        usernameToWallet[username] = msg.sender; // Agregar mapeo username -> wallet

        // Assign roles based on the role string using _grantRole (no permission required)
        if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("CERTIFIER"))) {
            _grantRole(CERTIFIER_ROLE, msg.sender);
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("ASSET_CREATOR"))) {
            _grantRole(ASSET_CREATOR_ROLE, msg.sender);
        }

        emit UserWalletLinked(msg.sender, username, role);
    }

    function assignRole(address walletAddress, string calldata newRole)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(users[walletAddress].active, "User not found");
        require(bytes(newRole).length > 0, "Invalid role");

        string memory oldRole = users[walletAddress].role;
        users[walletAddress].role = newRole;

        // Update smart contract roles
        if (keccak256(abi.encodePacked(oldRole)) == keccak256(abi.encodePacked("CERTIFIER"))) {
            revokeRole(CERTIFIER_ROLE, walletAddress);
        } else if (keccak256(abi.encodePacked(oldRole)) == keccak256(abi.encodePacked("ASSET_CREATOR"))) {
            revokeRole(ASSET_CREATOR_ROLE, walletAddress);
        }

        if (keccak256(abi.encodePacked(newRole)) == keccak256(abi.encodePacked("CERTIFIER"))) {
            grantRole(CERTIFIER_ROLE, walletAddress);
        } else if (keccak256(abi.encodePacked(newRole)) == keccak256(abi.encodePacked("ASSET_CREATOR"))) {
            grantRole(ASSET_CREATOR_ROLE, walletAddress);
        }

        emit RoleAssigned(walletAddress, newRole);
    }

    function deactivateUser(address walletAddress)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(users[walletAddress].active, "User not found");

        User storage user = users[walletAddress];
        user.active = false;

        // Revoke smart contract roles
        if (hasRole(CERTIFIER_ROLE, walletAddress)) {
            revokeRole(CERTIFIER_ROLE, walletAddress);
        }
        if (hasRole(ASSET_CREATOR_ROLE, walletAddress)) {
            revokeRole(ASSET_CREATOR_ROLE, walletAddress);
        }

        emit RoleRevoked(walletAddress, user.role);
    }

    function getUser(address walletAddress) external view returns (User memory) {
        require(users[walletAddress].active, "User not found");
        return users[walletAddress];
    }

    function getUsersByRole(string calldata role) external view returns (address[] memory) {
        return roleUsers[role];
    }

    function isUserActive(address walletAddress) external view returns (bool) {
        return users[walletAddress].active;
    }

    function getUserRole(address walletAddress) external view returns (string memory) {
        require(users[walletAddress].active, "User not found");
        return users[walletAddress].role;
    }

    function getWalletByUsername(string calldata username) external view returns (address) {
        return usernameToWallet[username];
    }

    function getUserByUsername(string calldata username) external view returns (User memory) {
        address wallet = usernameToWallet[username];
        require(wallet != address(0), "User not found");
        require(users[wallet].active, "User not active");
        return users[wallet];
    }

    function registerAsset(
        string calldata assetType,
        string calldata description
    ) external onlyRole(ASSET_CREATOR_ROLE) returns (uint256) {
        uint256 assetId = assetCounter++;

        assets[assetId] = Asset({
            assetId: assetId,
            owner: msg.sender,
            active: true,
            assetType: assetType,
            description: description
        });

        userAssets[msg.sender].push(assetId);

        emit AssetRegistered(assetId, msg.sender, assetType);
        return assetId;
    }

    function deactivateAsset(uint256 assetId) external {
        Asset storage asset = assets[assetId];
        require(asset.owner == msg.sender, "Only owner");
        require(asset.active, "Already inactive");

        asset.active = false;
        emit AssetDeactivated(assetId);
    }

    function issueCertificate(
        uint256 assetId,
        uint256 expiresAt,
        string calldata certType
    ) external onlyRole(CERTIFIER_ROLE) returns (uint256) {
        require(assets[assetId].active, "Asset not active");
        require(expiresAt > block.timestamp, "Invalid expiration");

        uint256 certId = certCounter++;

        certificates[certId] = Certificate({
            certId: certId,
            assetId: assetId,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            issuer: msg.sender,
            revoked: false,
            certType: certType
        });

        assetCertificates[assetId].push(certId);

        emit CertificateIssued(certId, assetId, msg.sender, expiresAt);
        return certId;
    }

    function renewCertificate(uint256 certId, uint256 newExpiration)
        external
        onlyRole(CERTIFIER_ROLE)
    {
        Certificate storage cert = certificates[certId];
        require(!cert.revoked, "Revoked certificate");
        require(newExpiration > block.timestamp, "Invalid expiration");

        cert.expiresAt = newExpiration;
        emit CertificateRenewed(certId, cert.assetId, newExpiration);
    }

    function revokeCertificate(uint256 certId) external onlyRole(CERTIFIER_ROLE) {
        Certificate storage cert = certificates[certId];
        require(!cert.revoked, "Already revoked");

        cert.revoked = true;
        emit CertificateRevoked(certId);
    }

    function getAsset(uint256 assetId) external view returns (Asset memory) {
        require(assets[assetId].owner != address(0), "Asset not found");
        return assets[assetId];
    }

    function getCertificate(uint256 certId) external view returns (Certificate memory) {
        require(certificates[certId].issuer != address(0), "Certificate not found");
        return certificates[certId];
    }

    function getCertificatesByAsset(uint256 assetId) external view returns (uint256[] memory) {
        return assetCertificates[assetId];
    }

    function getUserAssets(address user) external view returns (uint256[] memory) {
        return userAssets[user];
    }

    function isCertificateValid(uint256 certId) external view returns (bool) {
        Certificate storage cert = certificates[certId];
        return !cert.revoked && cert.expiresAt > block.timestamp;
    }

    function grantCertifierRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(CERTIFIER_ROLE, account);
    }

    function grantAssetCreatorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ASSET_CREATOR_ROLE, account);
    }

    function revokeCertifierRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(CERTIFIER_ROLE, account);
    }

    function revokeAssetCreatorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ASSET_CREATOR_ROLE, account);
    }
}
