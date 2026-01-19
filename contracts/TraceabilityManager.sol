// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TraceabilityManager is AccessControl, ReentrancyGuard {
    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");
    bytes32 public constant ASSET_CREATOR_ROLE = keccak256("ASSET_CREATOR_ROLE");

    // ═══════════════════════════════════════════════════════════════
    // STRUCTS FOR NEW WALLET MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    struct WalletInfo {
        address walletAddress;
        bool active;  // true si es la wallet activa
        uint256 linkedAt;
        uint256 deactivatedAt;  // 0 si sigue activa
    }

    struct User {
        string username;
        string role;
        bool active;  // Usuario activo/inactivo en el sistema
        uint256 registeredAt;
        address activeWallet;  // Referencia rápida a la wallet activa
        address[] wallets;  // Array de todas las wallets del usuario
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

    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════

    uint256 private assetCounter;
    uint256 private certCounter;

    mapping(uint256 => Asset) private assets;
    mapping(uint256 => Certificate) private certificates;
    mapping(uint256 => uint256[]) private assetCertificates;
    mapping(address => uint256[]) private userAssets;

    // User data structure: username => User
    mapping(string => User) private users;
    
    // Array para trackear todos los usernames registrados
    string[] private allUsernames;
    
    // Quick lookup: wallet address => username
    mapping(address => string) private walletToUsername;
    
    // Wallet details: walletAddress => WalletInfo
    mapping(address => WalletInfo) private walletInfo;
    
    // Contraseñas hasheadas: username => keccak256(password)
    mapping(string => bytes32) private passwordHashes;
    
    mapping(string => address[]) private roleUsers;

    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════

    event UserRegistered(string indexed username, string role, uint256 timestamp);
    event UserDeactivated(string indexed username, uint256 timestamp);
    event UserActivated(string indexed username, uint256 timestamp);
    
    event WalletLinked(string indexed username, address indexed walletAddress, bool isActive, uint256 timestamp);
    event WalletUnlinked(string indexed username, address indexed walletAddress, uint256 timestamp);
    event WalletActivated(string indexed username, address indexed walletAddress, uint256 timestamp);
    event WalletDeactivated(string indexed username, address indexed walletAddress, uint256 timestamp);
    
    event AssetRegistered(uint256 indexed assetId, address indexed owner, string assetType);
    event AssetDeactivated(uint256 indexed assetId);
    event CertificateIssued(uint256 indexed certId, uint256 indexed assetId, address indexed issuer, uint256 expiresAt);
    event CertificateRenewed(uint256 indexed certId, uint256 indexed assetId, uint256 newExpiration);
    event CertificateRevoked(uint256 indexed certId);
    event RoleAssigned(string indexed username, string role);
    event RoleRevoked(string indexed username, string role);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CERTIFIER_ROLE, msg.sender);
        _grantRole(ASSET_CREATOR_ROLE, msg.sender);
        assetCounter = 1;
        certCounter = 1;
        
        // Crear usuario admin automáticamente
        string memory adminUsername = "admin";
        users[adminUsername] = User({
            username: adminUsername,
            role: "ADMIN",
            active: true,
            registeredAt: block.timestamp,
            activeWallet: address(0),
            wallets: new address[](0)
        });
        
        allUsernames.push(adminUsername);
        passwordHashes[adminUsername] = keccak256(abi.encodePacked("admin"));
        
        emit UserRegistered(adminUsername, "ADMIN", block.timestamp);
    }

    // ═══════════════════════════════════════════════════════════════
    // USER REGISTRATION FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Registra un nuevo usuario en el blockchain
     */
    function registerUser(
        string calldata username,
        string calldata role
    ) external {
        require(bytes(username).length > 0, "Invalid username");
        require(users[username].registeredAt == 0, "User already exists");
        require(_isValidRole(role), "Invalid role");

        // Crear usuario sin wallet vinculada
        users[username] = User({
            username: username,
            role: role,
            active: true,
            registeredAt: block.timestamp,
            activeWallet: address(0),
            wallets: new address[](0)
        });

        roleUsers[role].push(msg.sender);
        allUsernames.push(username);
        emit UserRegistered(username, role, block.timestamp);
    }

    /**
     * Vincula una wallet a un usuario
     * El usuario paga el gas de la transacción
     * Si la wallet ya estaba vinculada, solo se activa
     */
    function linkWalletToUser(
        string calldata username,
        string calldata role
    ) external nonReentrant {
        require(bytes(username).length > 0, "Invalid username");
        require(msg.sender != address(0), "Invalid wallet");
        require(_isValidRole(role), "Invalid role");

        User storage user = users[username];

        // Si es primer registro, crear usuario
        if (user.registeredAt == 0) {
            user = users[username];
            user.username = username;
            user.role = role;
            user.active = true;
            user.registeredAt = block.timestamp;
            user.activeWallet = address(0);
            roleUsers[role].push(msg.sender);
            allUsernames.push(username);
            emit UserRegistered(username, role, block.timestamp);
        }

        require(user.active, "User is inactive");

        // Verificar si esta wallet ya estaba vinculada al usuario
        bool walletExists = false;
        for (uint256 i = 0; i < user.wallets.length; i++) {
            if (user.wallets[i] == msg.sender) {
                walletExists = true;
                break;
            }
        }

        if (walletExists) {
            // La wallet ya existía
            // Si ya es activa, no hay nada que hacer
            if (walletInfo[msg.sender].active) {
                revert("Wallet already active");
            }
            // Si no es activa, activarla
            _activateWallet(username, msg.sender);
        } else {
            // Wallet nueva: agregarla
            _addNewWallet(username, msg.sender, role);
        }
    }

    /**
     * Desactiva una wallet del usuario
     * No la elimina, solo la marca como inactiva
     * Si hay otras wallets, activa la siguiente
     * El usuario paga el gas
     */
    function unlinkWallet(string calldata username) external nonReentrant {
        require(bytes(username).length > 0, "Invalid username");
        
        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");
        require(user.active, "User is inactive");
        require(user.activeWallet == msg.sender, "Wallet not active for this user");

        _deactivateWallet(username, msg.sender);
        
        // Resetear activeWallet después de desvinculación
        user.activeWallet = address(0);

        // Activar la siguiente wallet si existe
        for (uint256 i = 0; i < user.wallets.length; i++) {
            if (user.wallets[i] != msg.sender && walletInfo[user.wallets[i]].linkedAt > 0) {
                _activateWallet(username, user.wallets[i]);
                break;
            }
        }
    }

    /**
     * Admin puede desvinacular la wallet activa de un usuario
     * Desactiva wallet y auto-activa la siguiente si existe
     */
    function adminUnlinkWallet(string calldata username) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        nonReentrant 
    {
        require(bytes(username).length > 0, "Invalid username");
        
        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");
        require(user.active, "User is inactive");
        require(user.activeWallet != address(0), "No active wallet to unlink");

        address walletToUnlink = user.activeWallet;
        _deactivateWallet(username, walletToUnlink);

        // Activar la siguiente wallet si existe
        for (uint256 i = 0; i < user.wallets.length; i++) {
            if (user.wallets[i] != walletToUnlink && walletInfo[user.wallets[i]].linkedAt > 0) {
                _activateWallet(username, user.wallets[i]);
                break;
            }
        }
    }

    /**
     * Cambia el role de un usuario
     */
    function assignRole(
        string calldata username,
        string calldata newRole
    ) external {
        require(bytes(username).length > 0, "Invalid username");
        require(_isValidRole(newRole), "Invalid role");

        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");

        user.role = newRole;

        emit RoleAssigned(username, newRole);
    }

    /**
     * Desactiva un usuario (mantiene sus datos pero lo bloquea)
     */
    function deactivateUser(string calldata username) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(bytes(username).length > 0, "Invalid username");
        
        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");
        require(user.active, "User already inactive");

        user.active = false;

        // Deactivar todas las wallets
        for (uint256 i = 0; i < user.wallets.length; i++) {
            if (walletInfo[user.wallets[i]].active) {
                walletInfo[user.wallets[i]].active = false;
                walletInfo[user.wallets[i]].deactivatedAt = block.timestamp;
            }
        }
        user.activeWallet = address(0);

        emit UserDeactivated(username, block.timestamp);
    }

    /**
     * Activa un usuario
     */
    function activateUser(string calldata username) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(bytes(username).length > 0, "Invalid username");
        
        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");
        require(!user.active, "User already active");

        user.active = true;
        emit UserActivated(username, block.timestamp);
    }

    /**
     * Establece la contraseña de un usuario (solo admin)
     * La contraseña se almacena como hash keccak256
     */
    /**
     * Establece la contraseña para un usuario (solo ADMIN)
     */
    function setPassword(string calldata username, string calldata newPassword) 
        external 

    {
        require(bytes(username).length > 0, "Invalid username");
        require(bytes(newPassword).length >= 4, "Password too short");
        
        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");
        
        passwordHashes[username] = keccak256(abi.encodePacked(newPassword));
    }

    /**
     * Cambia la contraseña del usuario actual
     * El usuario debe saber su contraseña actual
     */
    function changePassword(string calldata username, string calldata currentPassword, string calldata newPassword) 
        external 
    {
        require(bytes(username).length > 0, "Invalid username");
        require(bytes(newPassword).length >= 4, "Password too short");
        require(bytes(currentPassword).length > 0, "Current password required");
        
        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");
        
        // Verificar contraseña actual
        require(
            passwordHashes[username] == keccak256(abi.encodePacked(currentPassword)),
            "Incorrect current password"
        );
        
        // Actualizar a nueva contraseña
        passwordHashes[username] = keccak256(abi.encodePacked(newPassword));
    }

    /**
     * Verifica si una contraseña es correcta para un usuario
     */
    function verifyPassword(string calldata username, string calldata password) 
        external 
        view 
        returns (bool) 
    {
        return passwordHashes[username] == keccak256(abi.encodePacked(password));
    }

    // ═══════════════════════════════════════════════════════════════
    // INTERNAL HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function _addNewWallet(
        string calldata username,
        address walletAddress,
        string calldata role
    ) internal {
        User storage user = users[username];

        // Desactivar wallet anterior si existe
        if (user.activeWallet != address(0)) {
            walletInfo[user.activeWallet].active = false;
            walletInfo[user.activeWallet].deactivatedAt = block.timestamp;
            emit WalletDeactivated(username, user.activeWallet, block.timestamp);
        }

        // Agregar nueva wallet
        user.wallets.push(walletAddress);
        walletInfo[walletAddress] = WalletInfo({
            walletAddress: walletAddress,
            active: true,
            linkedAt: block.timestamp,
            deactivatedAt: 0
        });

        user.activeWallet = walletAddress;
        walletToUsername[walletAddress] = username;

        // Asignar roles si es necesario
        if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("CERTIFIER"))) {
            _grantRole(CERTIFIER_ROLE, walletAddress);
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("ASSET_CREATOR"))) {
            _grantRole(ASSET_CREATOR_ROLE, walletAddress);
        }

        emit WalletLinked(username, walletAddress, true, block.timestamp);
    }

    function _activateWallet(string calldata username, address walletAddress) internal {
        User storage user = users[username];
        require(walletInfo[walletAddress].linkedAt > 0, "Wallet not previously linked");

        // Desactivar wallet anterior si existe
        if (user.activeWallet != address(0) && user.activeWallet != walletAddress) {
            walletInfo[user.activeWallet].active = false;
            walletInfo[user.activeWallet].deactivatedAt = block.timestamp;
            emit WalletDeactivated(username, user.activeWallet, block.timestamp);
        }

        // Activar esta wallet
        walletInfo[walletAddress].active = true;
        walletInfo[walletAddress].deactivatedAt = 0;
        user.activeWallet = walletAddress;

        emit WalletActivated(username, walletAddress, block.timestamp);
    }

    function _deactivateWallet(string calldata username, address walletAddress) internal {
        walletInfo[walletAddress].active = false;
        walletInfo[walletAddress].deactivatedAt = block.timestamp;
        emit WalletUnlinked(username, walletAddress, block.timestamp);
    }

    function _isValidRole(string calldata role) internal pure returns (bool) {
        return keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("ADMIN")) ||
               keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("CERTIFIER")) ||
               keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("ASSET_CREATOR")) ||
               keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("AUDITOR")) ||
               keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("MANUFACTURER")) ||
               keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("DISTRIBUTOR"));
    }

    // ═══════════════════════════════════════════════════════════════
    // GETTER FUNCTIONS - USER & WALLET INFO
    // ═══════════════════════════════════════════════════════════════

    /**
     * Obtiene la wallet activa de un usuario
     */
    function getActiveWallet(string calldata username) external view returns (address) {
        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");
        return user.activeWallet;
    }

    /**
     * Obtiene todas las wallets de un usuario
     */
    function getAllWallets(string calldata username) external view returns (address[] memory) {
        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");
        return user.wallets;
    }

    /**
     * Obtiene la información de una wallet específica
     */
    function getWalletInfo(address walletAddress) external view returns (WalletInfo memory) {
        require(walletInfo[walletAddress].linkedAt > 0, "Wallet not found");
        return walletInfo[walletAddress];
    }

    /**
     * Obtiene información del usuario - RETORNA SOLO LA WALLET ACTIVA
     */
    function getUserByUsername(string calldata username) external view returns (
        string memory _username,
        string memory role,
        bool _active,
        uint256 registeredAt,
        address activeWallet
    ) {
        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");
        require(user.active, "User is inactive");

        return (
            user.username,
            user.role,
            user.active,
            user.registeredAt,
            user.activeWallet
        );
    }

    /**
     * Obtiene datos completos del usuario (admin only)
     */
    function getUserDetails(string calldata username) 
        external 
        view 
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (User memory) 
    {
        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");
        return user;
    }

    /**
     * Verifica si un usuario existe
     */
    function userExists(string calldata username) external view returns (bool) {
        return users[username].registeredAt != 0;
    }

    /**
     * Verifica si un usuario está activo
     */
    function isUserActive(string calldata username) external view returns (bool) {
        return users[username].active;
    }

    /**
     * Obtiene el role de un usuario
     */
    function getUserRole(string calldata username) external view returns (string memory) {
        User storage user = users[username];
        require(user.registeredAt != 0, "User not found");
        return user.role;
    }

    /**
     * Obtiene el username asociado a una wallet
     */
    function getUsernameByWallet(address walletAddress) external view returns (string memory) {
        string memory username = walletToUsername[walletAddress];
        require(bytes(username).length > 0, "Wallet not associated with any user");
        return username;
    }

    /**
     * Obtiene usuarios por rol
     */
    function getUsersByRole(string calldata role) external view returns (address[] memory) {
        return roleUsers[role];
    }

    function getUser(address walletAddress) external view returns (User memory) {
        string memory username = walletToUsername[walletAddress];
        require(bytes(username).length > 0, "Wallet not found");
        return users[username];
    }

    /**
     * Obtiene la lista de todos los usernames registrados
     */
    function getAllUsernames() external view returns (string[] memory) {
        return allUsernames;
    }

    /**
     * Obtiene todos los usuarios con sus datos completos
     * NOTA: Esta función puede ser costosa en gas si hay muchos usuarios
     */
    function getAllUsers() external view returns (User[] memory) {
        User[] memory result = new User[](allUsernames.length);
        
        for (uint256 i = 0; i < allUsernames.length; i++) {
            result[i] = users[allUsernames[i]];
        }
        
        return result;
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
