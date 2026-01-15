import React, { useState } from 'react';
import { ethers } from 'ethers';

// Usuarios predefinidos en el sistema
const SYSTEM_USERS = {
  'admin': { password: 'admin', role: 'ADMIN', username: 'Administrador' },
};

function getSystemUsers() {
  const predefined = SYSTEM_USERS;
  const created = JSON.parse(localStorage.getItem('systemUsers') || '{}');
  return { ...predefined, ...created };
}

export default function Login({ onLoginSuccess }) {
  const [step, setStep] = useState('initial'); // initial, wallet
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);

  const connectMetaMask = async () => {
    try {
      setLoading(true);
      setError('');

      if (!window.ethereum) {
        setError('MetaMask no está instalado');
        setLoading(false);
        return;
      }

      // Solicitar acceso a las cuentas
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const account = accounts[0];
      setWalletAddress(account);
      setUseMetaMask(true);
      setStep('profile');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al conectar MetaMask');
      setLoading(false);
    }
  };

  // Verificar usuario en blockchain y recuperar wallet
  const checkUserInBlockchain = async (username) => {
    try {
      const workEnvironment = localStorage.getItem('workEnvironment');
      const contractAddress = localStorage.getItem('contractAddress');
      
      // Si es offline, no verificar en blockchain
      if (workEnvironment === 'offline' || !contractAddress || !window.ethereum) {
        console.log('Modo offline o sin blockchain');
        return null;
      }
      
      console.log('Verificando usuario en blockchain por username:', username);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const { CONTRACT_ABI } = await import('../config/abi.js');
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      
      // Buscar usuario por username en blockchain
      try {
        const user = await contract.getUserByUsername(username);
        if (user && user.active) {
          console.log('✅ Usuario encontrado en blockchain:', user);
          console.log('   - Wallet vinculada:', user.walletAddress);
          console.log('   - Role:', user.role);
          return user;
        }
      } catch (e) {
        console.log('Usuario no encontrado en blockchain:', e.message);
        return null;
      }
      
      return null;
    } catch (error) {
      console.warn('Error verificando en blockchain:', error.message);
      return null;
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Completa usuario y contraseña');
      return;
    }

    // Validar credenciales contra usuarios del sistema
    const systemUsers = getSystemUsers();
    const user = systemUsers[username];
    if (!user || user.password !== password) {
      setError('Usuario o contraseña incorrectos');
      return;
    }

    setLoading(true);
    setError('');
    
    // Obtener usuario de allUsers (si existe) o crear desde systemUsers
    let allUsersStr = localStorage.getItem('allUsers') || '[]';
    let allUsers = JSON.parse(allUsersStr);
    
    let registeredUser = allUsers.find(u => u.username === username);
    
    console.log('=== LOGIN ===');
    console.log('Usuario desde systemUsers:', user);
    console.log('Usuario desde allUsers:', registeredUser);
    
    const workEnvironment = localStorage.getItem('workEnvironment');
    
    // En blockchain: verificar si usuario existe con wallet vinculada
    if (workEnvironment !== 'offline') {
      // El admin NO necesita wallet para usar el sistema
      if (username === 'admin') {
        console.log('✅ Admin puede loguearse sin wallet');
        const userData = {
          username: username,
          role: user.role,
          active: true,
          walletAddress: null,  // Admin no necesita wallet
          registeredAt: new Date().toISOString(),
          isMetaMaskUser: false,
          isAdmin: true,
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        onLoginSuccess(userData);
        setLoading(false);
        return;
      }
      
      console.log('Verificando en blockchain...');
      const blockchainUser = await checkUserInBlockchain(username);
      
      if (blockchainUser) {
        // Usuario existe en blockchain con wallet
        console.log('✅ Usuario existe en blockchain con wallet');
        const userData = {
          username: username,
          role: user.role,
          active: true,
          walletAddress: blockchainUser.walletAddress,
          registeredAt: new Date().toISOString(),
          isMetaMaskUser: true,
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('walletAddress', blockchainUser.walletAddress);
        
        onLoginSuccess(userData);
        setLoading(false);
        return;
      } else {
        // Usuario NO existe en blockchain, requiere wallet
        console.log('Usuario no en blockchain, requiere seleccionar wallet');
        setAuthenticatedUser({
          loginUser: username,
          displayName: user.username || username,
          role: user.role,
        });
        setStep('wallet');
        setLoading(false);
        
        // Conectar MetaMask automáticamente
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
          
          if (accounts && accounts.length > 0) {
            setAvailableWallets(accounts);
            setShowWalletSelector(accounts.length > 1);
            if (accounts.length === 1) {
              // Si solo hay una wallet, seleccionarla automáticamente
              await handleSelectWalletLogin(accounts[0], username, user.role);
            }
          }
        } catch (err) {
          setError('No se pudo conectar MetaMask');
          setLoading(false);
        }
        
        return;
      }
    }
    
    // FLUJO OFFLINE (original)
    // Si el usuario no existe en allUsers, agregarlo (fue creado en systemUsers por AdminPanel pero falta en allUsers)
    if (!registeredUser) {
      console.log('Usuario no en allUsers, agregando...');
      registeredUser = {
        username: username,
        role: user.role,
        active: true,
        walletAddress: null,
        registeredAt: new Date().toISOString(),
      };
      allUsers.push(registeredUser);
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
    }
    
    // Si tiene wallet vinculada, login directo
    if (registeredUser.walletAddress) {
      console.log('Login directo - usuario con wallet');
      const userData = {
        username: registeredUser.username,
        role: registeredUser.role,
        active: registeredUser.active,
        walletAddress: registeredUser.walletAddress,
        registeredAt: registeredUser.registeredAt,
        isMetaMaskUser: true,
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('walletAddress', registeredUser.walletAddress);
      
      onLoginSuccess(userData);
      setLoading(false);
      return;
    }
    
    // Si no tiene wallet, pedir vinculación
    console.log('Pidiendo vinculación de wallet...');
    setAuthenticatedUser({
      loginUser: username,
      displayName: user.username || username,
      role: user.role,
    });
    
    setStep('wallet');
    setLoading(false);
  };

  const connectWalletMetaMask = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('=== OBTENIENDO CUENTAS DE METAMASK (LOGIN) ===');

      if (!window.ethereum) {
        const msg = 'MetaMask no está instalado. Instálalo desde https://metamask.io';
        setError(msg);
        console.error(msg);
        setLoading(false);
        return;
      }

      if (!window.ethereum.isMetaMask) {
        const msg = 'Por favor instala MetaMask: https://metamask.io';
        setError(msg);
        console.error(msg);
        setLoading(false);
        return;
      }

      console.log('Solicitando cuentas de MetaMask...');
      setError('⏳ Abriendo MetaMask para seleccionar cuenta...');
      
      let accounts;
      try {
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        console.log('✅ Cuentas obtenidas:', accounts);
      } catch (requestErr) {
        console.error('❌ Error:', requestErr);
        
        if (requestErr.code === 4001) {
          setError('Rechazaste la solicitud de conexión a MetaMask');
        } else if (requestErr.code === -32002) {
          setError('MetaMask ya está procesando una solicitud. Por favor espera.');
        } else {
          setError(`Error: ${requestErr.message || 'No se pudo conectar a MetaMask'}`);
        }
        setLoading(false);
        return;
      }

      if (!accounts || accounts.length === 0) {
        setError('No se pudo obtener ninguna cuenta de MetaMask.');
        setLoading(false);
        return;
      }

      // Formatear todas las cuentas
      const formattedWallets = accounts.map(acc => {
        try {
          return ethers.getAddress(acc);
        } catch (err) {
          console.error('Error al formatear:', acc, err);
          return null;
        }
      }).filter(w => w !== null);

      console.log('Cuentas formateadas:', formattedWallets);

      if (formattedWallets.length === 0) {
        setError('Error al procesar las cuentas de MetaMask.');
        setLoading(false);
        return;
      }

      // Guardar cuentas disponibles
      setAvailableWallets(formattedWallets);
      setSelectedWalletIndex(0);
      setShowWalletSelector(true);
      setError('');
      setLoading(false);

      console.log('=== SELECTOR DE CUENTAS LISTO (LOGIN) ===');
    } catch (err) {
      console.error('Error:', err);
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const handleSelectWalletLogin = async (walletAddress, username = null, role = null) => {
    try {
      setLoading(true);
      setError('');

      const user = username || authenticatedUser.loginUser;
      const userRole = role || authenticatedUser.role;

      console.log('=== VINCULANDO WALLET EN LOGIN ===');
      console.log('walletAddress:', walletAddress);
      console.log('username:', user);
      console.log('role:', userRole);

      // Obtener datos actuales
      let allUsersStr = localStorage.getItem('allUsers') || '[]';
      let allUsers = JSON.parse(allUsersStr);
      
      // Buscar usuario por username
      let userIndex = allUsers.findIndex(u => u.username === user);
      
      console.log('Usuario encontrado en índice:', userIndex);
      console.log('allUsers antes:', allUsers);

      // Si existe, actualizar; si no existe, crear nuevo
      if (userIndex >= 0) {
        // Actualizar usuario existente
        allUsers[userIndex].walletAddress = walletAddress;
        console.log('Usuario actualizado con wallet');
      } else {
        // Crear nuevo usuario (caso: usuario registrado en systemUsers pero no en allUsers)
        const newUser = {
          username: user,
          role: userRole,
          active: true,
          walletAddress: walletAddress,
          registeredAt: new Date().toISOString(),
        };
        allUsers.push(newUser);
        console.log('Usuario nuevo creado en allUsers');
      }
      
      console.log('allUsers después:', allUsers);

      // Guardar sin duplicados
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
      
      // Crear userData para currentUser
      const userData = {
        username: user,
        role: userRole,
        active: true,
        walletAddress: walletAddress,
        registeredAt: allUsers[userIndex >= 0 ? userIndex : allUsers.length - 1]?.registeredAt || new Date().toISOString(),
        isMetaMaskUser: true,
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('walletAddress', walletAddress);

      console.log('Datos guardados, userData:', userData);
      
      // Registrar en blockchain
      const workEnvironment = localStorage.getItem('workEnvironment');
      const contractAddress = localStorage.getItem('contractAddress');
      
      if (workEnvironment !== 'offline' && contractAddress && window.ethereum) {
        try {
          console.log('Registrando usuario en blockchain...');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const { CONTRACT_ABI } = await import('../config/abi.js');
          const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
          
          // Vincular wallet a usuario usando linkWalletToUser (sin necesidad de ser admin)
          try {
            const blockchainRole = userRole === 'ADMIN' ? 'ASSET_CREATOR' : userRole;
            console.log('📝 Ejecutando linkWalletToUser con:');
            console.log('  - Username:', user);
            console.log('  - Role:', blockchainRole);
            console.log('  - Wallet del usuario (msg.sender):', await signer.getAddress());
            
            const tx = await contract.linkWalletToUser(
              user,
              blockchainRole
            );
            
            console.log('⏳ Esperando confirmación de transacción...');
            const receipt = await tx.wait();
            console.log('✅ Wallet vinculada a usuario en blockchain');
            console.log('   - TX Hash:', receipt.hash);
            console.log('   - Gas usado:', receipt.gasUsed.toString());
          } catch (error) {
            // Ignorar errores de usuario ya existente
            if (error.message.includes('Wallet already linked') || error.message.includes('already')) {
              console.log('ℹ️ Wallet ya está vinculada al usuario en blockchain');
            } else {
              console.warn('⚠️ Error vinculando wallet en blockchain:', error.message);
            }
          }
        } catch (error) {
          console.warn('⚠️ No se pudo vincular wallet en blockchain:', error.message);
        }
      }
      
      console.log('=== LOGIN CON METAMASK COMPLETADO ===');

      onLoginSuccess(userData);
      setLoading(false);
      
    } catch (err) {
      console.error('Error:', err);
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('initial');
    setWalletAddress('');
    setUsername('');
    setPassword('');
    setAuthenticatedUser(null);
    setError('');
  };

  const handleLogout = () => {
    setStep('initial');
    setWalletAddress('');
    setUsername('');
    setError('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('walletAddress');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔐 Gestión de Usuarios TFM3</h1>

        {step === 'initial' && (
          <div className="login-step">
            <p style={{ marginBottom: '20px', color: '#374151' }}>Inicia sesión con tus credenciales:</p>
            
            <div className="form-group">
              <label htmlFor="login-username">Usuario:</label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Contraseña:</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button 
              onClick={handleLogin}
              disabled={loading || !username.trim() || !password.trim()}
              className="btn-primary"
            >
              {loading ? 'Validando...' : '✅ Siguiente'}
            </button>
          </div>
        )}

        {step === 'wallet' && authenticatedUser && (
          <div className="login-step">
            <div style={{ backgroundColor: '#eff6ff', borderRadius: '8px', padding: '15px', marginBottom: '20px', borderLeft: '4px solid #0284c7' }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#0c4a6e' }}>
                ✅ Bienvenido <strong>{authenticatedUser.displayName}</strong>
              </p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#075985' }}>
                Rol: <strong>{authenticatedUser.role}</strong>
              </p>
            </div>

            <p style={{ marginBottom: '20px', color: '#374151', fontSize: '14px' }}>
              Vincula tu wallet de MetaMask para acceder al sistema:
            </p>

            {!showWalletSelector && (
              <div className="login-actions">
                <button 
                  onClick={connectWalletMetaMask}
                  disabled={loading}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loading ? '⏳ Conectando...' : '🦊 Conectar MetaMask'}
                </button>
                <button 
                  onClick={handleBack}
                  disabled={loading}
                  className="btn-secondary"
                >
                  ← Atrás
                </button>
              </div>
            )}

            {showWalletSelector && availableWallets.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 15px 0', color: '#15803d', fontWeight: 'bold', fontSize: '14px' }}>
                  Selecciona la cuenta que deseas usar:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                  {availableWallets.map((wallet, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectWalletLogin(wallet)}
                      disabled={loading}
                      style={{
                        padding: '12px',
                        backgroundColor: selectedWalletIndex === index ? '#dcfce7' : '#f0fdf4',
                        border: selectedWalletIndex === index ? '2px solid #22c55e' : '1px solid #bbf7d0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#15803d',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#dcfce7';
                        e.target.style.borderColor = '#22c55e';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = selectedWalletIndex === index ? '#dcfce7' : '#f0fdf4';
                        e.target.style.borderColor = selectedWalletIndex === index ? '#22c55e' : '#bbf7d0';
                      }}
                    >
                      {selectedWalletIndex === index ? '✅ ' : '  '} 
                      {wallet}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setShowWalletSelector(false);
                    setAvailableWallets([]);
                  }}
                  disabled={loading}
                  style={{ marginTop: '10px', width: '100%', padding: '8px 12px' }}
                  className="btn-secondary"
                >
                  ← Atrás
                </button>
              </div>
            )}

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <p style={{ fontSize: '12px', color: '#78350f', margin: '0' }}>
                💡 <strong>¿No tienes MetaMask?</strong> Instálalo desde <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" style={{ color: '#d97706', textDecoration: 'underline' }}>metamask.io</a>
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="login-info">
          <p>🔒 <strong>Seguridad:</strong> Tu wallet es tu identidad única en el sistema. Asegúrate de ingresar la dirección correcta.</p>
        </div>
      </div>
    </div>
  );
}
