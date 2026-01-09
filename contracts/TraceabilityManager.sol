// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TraceabilityManager is AccessControl, ReentrancyGuard {
    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");
    bytes32 public constant ASSET_CREATOR_ROLE = keccak256("ASSET_CREATOR_ROLE");

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

    event AssetRegistered(uint256 indexed assetId, address indexed owner, string assetType);
    event AssetDeactivated(uint256 indexed assetId);
    event CertificateIssued(uint256 indexed certId, uint256 indexed assetId, address indexed issuer, uint256 expiresAt);
    event CertificateRenewed(uint256 indexed certId, uint256 indexed assetId, uint256 newExpiration);
    event CertificateRevoked(uint256 indexed certId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CERTIFIER_ROLE, msg.sender);
        _grantRole(ASSET_CREATOR_ROLE, msg.sender);
        assetCounter = 1;
        certCounter = 1;
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
