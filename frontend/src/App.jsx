import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import AssetManager from './components/AssetManager';
import CertificateManager from './components/CertificateManager';
import Dashboard from './components/Dashboard';
import { ABI } from './config/abi';
import './App.css';

const CONTRACT_ADDRESS = '0x5FbDB2315678afccb333f8a9c12e1f0d7a8f7cbc'; // Actualiza con tu dirección

export default function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [networkOk, setNetworkOk] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión existente
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedWallet = localStorage.getItem('walletAddress');
    
    if (savedUser && savedWallet) {
      setCurrentUser(JSON.parse(savedUser));
      initializeWeb3();
    } else {
      setIsLoading(false);
    }
  }, []);

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        setProvider(provider);

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        const signer = await provider.getSigner();
        setSigner(signer);

        // Inicializar contrato
        const contractInstance = new Contract(CONTRACT_ADDRESS, ABI, signer);
        setContract(contractInstance);

        const network = await provider.getNetwork();
        console.log('Connected to network:', network);
        setNetworkOk(true);
      } catch (err) {
        console.error('Web3 initialization failed:', err);
      }
    } else {
      alert('MetaMask no detectado. Instálalo para continuar.');
    }
    setIsLoading(false);
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    initializeWeb3();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setNetworkOk(false);
    setActiveTab('profile');
  };

  // Pantalla de login
  if (!currentUser || isLoading) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Pantalla de carga Web3
  if (!networkOk || !account) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>🔗 TFM3 - Trazabilidad Industrial</h1>
        <p>Conectando a MetaMask...</p>
        <button onClick={initializeWeb3}>Conectar MetaMask</button>
      </div>
    );
  }

  // Verificar si es administrador (basado en acceso al contrato o localStorage)
  const isAdmin = currentUser?.role === 'ADMIN' || account === currentUser?.walletAddress;

  return (
    <div className="app">
      <header className="header">
        <h1>📦 Trazabilidad Industrial con Blockchain</h1>
        <div className="header-info">
          <p>Usuario: <strong>{currentUser?.username}</strong></p>
          <p>Rol: <span className={`badge role-${currentUser?.role?.toLowerCase()}`}>{currentUser?.role}</span></p>
          <p>Wallet: {account?.slice(0, 10)}...{account?.slice(-8)}</p>
        </div>
      </header>

      <nav className="nav-tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Mi Perfil
        </button>
        {isAdmin && (
          <button 
            className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            ⚙️ Administración
          </button>
        )}
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        {(currentUser?.role === 'ASSET_CREATOR' || currentUser?.role === 'MANUFACTURER') && (
          <button 
            className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            📦 Activos
          </button>
        )}
        {(currentUser?.role === 'CERTIFIER' || currentUser?.role === 'MANUFACTURER') && (
          <button 
            className={`tab ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            ✅ Certificaciones
          </button>
        )}
      </nav>

      <main className="container">
        {activeTab === 'profile' && (
          <UserProfile currentUser={currentUser} contract={contract} onLogout={handleLogout} />
        )}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel contract={contract} provider={provider} currentUser={currentUser} />
        )}
        {activeTab === 'dashboard' && <Dashboard provider={provider} signer={signer} contractAddress={CONTRACT_ADDRESS} />}
        {activeTab === 'assets' && <AssetManager signer={signer} contractAddress={CONTRACT_ADDRESS} />}
        {activeTab === 'certificates' && <CertificateManager signer={signer} contractAddress={CONTRACT_ADDRESS} />}
      </main>

      <footer className="footer">
        <p>TFM3 - Máster en Blockchain · 2025</p>
      </footer>
    </div>
  );
}
