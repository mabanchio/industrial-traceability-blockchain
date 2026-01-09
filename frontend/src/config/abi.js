export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "assetId", "type": "uint256"},
      {"indexed": true, "name": "owner", "type": "address"},
      {"indexed": false, "name": "assetType", "type": "string"}
    ],
    "name": "AssetRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "assetId", "type": "uint256"}],
    "name": "AssetDeactivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "certId", "type": "uint256"},
      {"indexed": true, "name": "assetId", "type": "uint256"},
      {"indexed": true, "name": "issuer", "type": "address"},
      {"indexed": false, "name": "expiresAt", "type": "uint256"}
    ],
    "name": "CertificateIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "certId", "type": "uint256"},
      {"indexed": true, "name": "assetId", "type": "uint256"},
      {"indexed": false, "name": "newExpiration", "type": "uint256"}
    ],
    "name": "CertificateRenewed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "certId", "type": "uint256"}],
    "name": "CertificateRevoked",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "string", "name": "assetType", "type": "string"}, {"internalType": "string", "name": "description", "type": "string"}],
    "name": "registerAsset",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "assetId", "type": "uint256"}],
    "name": "deactivateAsset",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "assetId", "type": "uint256"},
      {"internalType": "uint256", "name": "expiresAt", "type": "uint256"},
      {"internalType": "string", "name": "certType", "type": "string"}
    ],
    "name": "issueCertificate",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "assetId", "type": "uint256"}],
    "name": "getAsset",
    "outputs": [{"components": [
      {"internalType": "uint256", "name": "assetId", "type": "uint256"},
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "bool", "name": "active", "type": "bool"},
      {"internalType": "string", "name": "assetType", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"}
    ], "internalType": "struct TraceabilityManager.Asset", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "certId", "type": "uint256"}],
    "name": "getCertificate",
    "outputs": [{"components": [
      {"internalType": "uint256", "name": "certId", "type": "uint256"},
      {"internalType": "uint256", "name": "assetId", "type": "uint256"},
      {"internalType": "uint256", "name": "issuedAt", "type": "uint256"},
      {"internalType": "uint256", "name": "expiresAt", "type": "uint256"},
      {"internalType": "address", "name": "issuer", "type": "address"},
      {"internalType": "bool", "name": "revoked", "type": "bool"},
      {"internalType": "string", "name": "certType", "type": "string"}
    ], "internalType": "struct TraceabilityManager.Certificate", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  }
];
