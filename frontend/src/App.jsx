import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import AssetManager from './components/AssetManager';
import CertificateManager from './components/CertificateManager';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [networkOk, setNetworkOk] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    initializeWeb3();
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

        const network = await provider.getNetwork();
        console.log('Connected to network:', network);
        setNetworkOk(true);
      } catch (err) {
        console.error('Web3 initialization failed:', err);
        alert('Por favor, instala MetaMask');
      }
    } else {
      alert('MetaMask no detectado. Instálalo para continuar.');
    }
  };

  if (!networkOk || !account) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>🔗 TFM3 - Trazabilidad Industrial</h1>
        <p>Conectando a MetaMask...</p>
        <button onClick={initializeWeb3}>Conectar MetaMask</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📦 Trazabilidad Industrial con Blockchain</h1>
        <div className="header-info">
          <p>Cuenta: {account.slice(0, 10)}...{account.slice(-8)}</p>
        </div>
      </header>

      <nav className="nav-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          Activos
        </button>
        <button 
          className={`tab ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          Certificaciones
        </button>
      </nav>

      <main className="container">
        {activeTab === 'dashboard' && <Dashboard provider={provider} signer={signer} contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS} />}
        {activeTab === 'assets' && <AssetManager signer={signer} contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS} />}
        {activeTab === 'certificates' && <CertificateManager signer={signer} contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS} />}
      </main>

      <footer className="footer">
        <p>TFM3 - Máster en Blockchain · 2025</p>
      </footer>
    </div>
  );
}
