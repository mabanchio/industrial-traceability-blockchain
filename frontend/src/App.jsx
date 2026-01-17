import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, getAddress } from 'ethers';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import AssetManager from './components/AssetManager';
import CertificateManager from './components/CertificateManager';
import Dashboard from './components/Dashboard';
import AuditorPanel from './components/AuditorPanel';
import { CONTRACT_ABI } from './config/abi';
import './App.css';

const DEFAULT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [blockchainConnected, setBlockchainConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workEnvironment, setWorkEnvironment] = useState('offline');
  const [blockchainStatus, setBlockchainStatus] = useState('Offline');

  // Verificar sesión existente y cargar configuración
  useEffect(() => {
    // Cargar entorno de trabajo
    const savedEnvironment = localStorage.getItem('workEnvironment') || 'offline';
    setWorkEnvironment(savedEnvironment);
    updateBlockchainStatus(savedEnvironment);

    // Cargar dirección del contrato desde localStorage
    try {
      let savedContractAddress = localStorage.getItem('contractAddress') || DEFAULT_CONTRACT_ADDRESS;
      
      // Intentar normalizar con checksum, si falla usar tal como está
      try {
        savedContractAddress = getAddress(savedContractAddress);
      } catch (checksumErr) {
        // Si hay error de checksum, convertir a minúsculas (dirección válida pero sin checksum correcto)
        if (ethers.isAddress(savedContractAddress)) {
          savedContractAddress = savedContractAddress.toLowerCase();
        } else {
          throw new Error('Dirección de contrato inválida');
        }
      }
      
      setContractAddress(savedContractAddress);
      
      // NO restaurar automáticamente - solo verificar que currentUser sea válido si existe
      const savedUser = localStorage.getItem('currentUser');
      
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          // Validar que el usuario tenga propiedades necesarias
          if (user.username && user.role) {
            setCurrentUser(user);
            // Todos los usuarios ven el dashboard al loguearse
            setActiveTab('dashboard');
            
            // Intentar conectar a blockchain si el usuario usó MetaMask
            if (user.isMetaMaskUser) {
              initializeWeb3(savedContractAddress);
            } else {
              setIsLoading(false);
            }
          } else {
            // Usuario inválido, limpiar
            localStorage.removeItem('currentUser');
            localStorage.removeItem('walletAddress');
            setIsLoading(false);
          }
        } catch (parseErr) {
          // Error parseando JSON, limpiar
          console.warn('Error parseando currentUser:', parseErr);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('walletAddress');
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error cargando configuración:', err.message);
      setContractAddress(DEFAULT_CONTRACT_ADDRESS.toLowerCase());
      setIsLoading(false);
    }
  }, []);

  // Escuchar cambios en la configuración del contrato
  // Limpiar usuarios cuando cambia a modo blockchain
  useEffect(() => {
    const handleWorkEnvironmentChange = (e) => {
      if (e.key === 'workEnvironment' && e.newValue) {
        const newEnvironment = e.newValue;
        
        // Si cambias a blockchain (no offline), limpiar usuarios excepto admin
        if (newEnvironment !== 'offline') {
          console.log('🔄 Cambiando a blockchain: limpiando usuarios locales...');
          
          try {
            // Obtener usuario actual
            const currentUserStr = localStorage.getItem('currentUser');
            const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
            
            // Si el usuario actual es admin, mantenerlo
            if (currentUser && currentUser.role === 'ADMIN') {
              console.log('✅ Admin mantenido, requiriendo vinculación de wallet para otros usuarios');
              // El admin continúa, pero otros usuarios necesitarán vincular wallet
            } else {
              // Si no es admin, limpiar la sesión
              localStorage.removeItem('currentUser');
              localStorage.removeItem('walletAddress');
              setCurrentUser(null);
              setActiveTab('login');
              console.log('⚠️ Sesión limpiada - requiere re-login con wallet vinculada');
            }
            
            // Limpiar lista de usuarios (no se necesita en blockchain)
            localStorage.removeItem('allUsers');
            
          } catch (error) {
            console.error('Error limpiando usuarios:', error);
          }
        }
        
        setWorkEnvironment(newEnvironment);
        updateBlockchainStatus(newEnvironment);
      }
    };

    window.addEventListener('storage', handleWorkEnvironmentChange);
    return () => window.removeEventListener('storage', handleWorkEnvironmentChange);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'contractAddress' && e.newValue) {
        try {
          let address = e.newValue;
          
          // Intentar normalizar, si falla usar minúsculas
          try {
            address = getAddress(address);
          } catch (checksumErr) {
            if (ethers.isAddress(address)) {
              address = address.toLowerCase();
            } else {
              throw new Error('Dirección inválida');
            }
          }
          
          console.log('Configuración de contrato actualizada:', address);
          setContractAddress(address);
          // Reinicializar contrato si hay signer
          if (signer) {
            initializeWeb3(address);
          }
        } catch (err) {
          console.error('Error procesando dirección del contrato:', err.message);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [signer]);

  const updateBlockchainStatus = (environment) => {
    const statusMap = {
      'offline': '❌ Offline',
      'hardhat': '✅ Hardhat Local',
      'sepolia': '🔵 Sepolia Testnet',
      'mainnet': '💜 Ethereum Mainnet',
      'custom': '🔧 Red Privada',
    };
    setBlockchainStatus(statusMap[environment] || 'Desconocido');
  };

  const initializeWeb3 = async (contractAddr = contractAddress) => {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        setProvider(provider);

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        const signer = await provider.getSigner();
        setSigner(signer);

        // Inicializar contrato con la dirección configurada
        try {
          const contractInstance = new Contract(contractAddr, CONTRACT_ABI, signer);
          setContract(contractInstance);
          setBlockchainConnected(true);
          console.log('✅ Blockchain conectado con contrato:', contractAddr);
        } catch (err) {
          console.warn('⚠️ Contrato no disponible:', err.message);
          setBlockchainConnected(false);
        }
      } catch (err) {
        console.warn('⚠️ Web3 no disponible, continuando sin blockchain:', err.message);
        setBlockchainConnected(false);
      }
    } else {
      console.warn('⚠️ MetaMask no disponible');
      setBlockchainConnected(false);
    }
    setIsLoading(false);
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    
    // Intentar conectar si usó MetaMask
    if (userData.isMetaMaskUser) {
      initializeWeb3();
    } else {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Cerrando sesión...');
    // Limpiar estado de React
    setCurrentUser(null);
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setBlockchainConnected(false);
    setActiveTab('profile');
    
    // Limpiar localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('walletAddress');
    
    console.log('✅ Sesión cerrada');
  };

  // Pantalla de login
  if (!currentUser || isLoading) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Verificar si es administrador
  const isAdmin = currentUser?.role === 'ADMIN' || account === currentUser?.walletAddress;

  return (
    <div className="app">

      <header className="header">
        <h1>📦 Trazabilidad Industrial con Blockchain</h1>
        <div className="header-info">
          <p>Usuario: <strong>{currentUser?.username}</strong></p>
          <p>Rol: <span className={`badge role-${currentUser?.role?.toLowerCase()}`}>{currentUser?.role}</span></p>
          <p>Wallet: {currentUser?.walletAddress?.slice(0, 10)}...{currentUser?.walletAddress?.slice(-8)}</p>
          <p style={{ 
            color: workEnvironment === 'offline' ? '#ef4444' : '#10b981',
            fontWeight: 'bold'
          }}>
            {blockchainStatus}
          </p>
          <button onClick={handleLogout} className="btn-danger" title="Cerrar sesión">
            🚪 Logout
          </button>
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
        {currentUser?.role === 'AUDITOR' && (
          <button 
            className={`tab ${activeTab === 'auditor' ? 'active' : ''}`}
            onClick={() => setActiveTab('auditor')}
          >
            🔍 Auditoría
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
        {activeTab === 'dashboard' && <Dashboard provider={provider} signer={signer} contractAddress={contractAddress} blockchainStatus={blockchainStatus} workEnvironment={workEnvironment} />}
        {activeTab === 'assets' && <AssetManager signer={signer} contractAddress={contractAddress} />}
        {activeTab === 'certificates' && <CertificateManager signer={signer} contractAddress={contractAddress} />}
        {activeTab === 'auditor' && <AuditorPanel provider={provider} signer={signer} contractAddress={contractAddress} currentUser={currentUser} />}
      </main>

      <footer className="footer">
        <p>TFM3 - Máster en Blockchain · 2026</p>
      </footer>
    </div>
  );
}
