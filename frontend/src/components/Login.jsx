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
        const [user_username, role, active, registeredAt, activeWallet] = 
          await contract.getUserByUsername(username);
        
        if (active) {
          console.log('✅ Usuario encontrado en blockchain:', {
            username: user_username,
            role,
            active,
            activeWallet,
          });
          console.log('   - Wallet activa:', activeWallet === ethers.ZeroAddress ? 'NINGUNA' : activeWallet);
          console.log('   - Role:', role);
          
          return {
            username: user_username,
            role,
            active,
            walletAddress: activeWallet === ethers.ZeroAddress ? null : activeWallet,
            registeredAt: new Date(registeredAt * 1000).toISOString(),
          };
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

    setLoading(true);
    setError('');
    
    const workEnvironment = localStorage.getItem('workEnvironment');
    const contractAddress = localStorage.getItem('contractAddress');

    // Primero: Intentar verificar en blockchain si está disponible
    if (workEnvironment !== 'offline' && contractAddress && window.ethereum) {
      try {
        console.log('🔗 Verificando usuario en blockchain:', username);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const { CONTRACT_ABI } = await import('../config/abi.js');
        const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
        
        // Verificar si usuario existe en blockchain
        try {
          console.log('   Buscando usuario:', username);
          const userResult = await contract.getUserByUsername(username);
          console.log('   Resultado de getUserByUsername:', userResult);
          
          const [user_username, role, active, registeredAt, activeWallet] = userResult;
          console.log('   ✅ Usuario encontrado:');
          console.log('     - Username:', user_username);
          console.log('     - Role:', role);
          console.log('     - Active:', active);
          console.log('     - RegisteredAt:', registeredAt?.toString());
          console.log('     - ActiveWallet:', activeWallet);
          
          // Usuario existe en blockchain, verificar contraseña
          console.log('🔐 Verificando contraseña en blockchain...');
          
          try {
            const passwordValid = await contract.verifyPassword(username, password);
            console.log('   verifyPassword resultado:', passwordValid);
            
            if (!passwordValid) {
              console.warn('❌ Contraseña incorrecta en blockchain');
              setLoading(false);
              setError('Usuario o contraseña incorrectos');
              return;
            }
          } catch (verifyErr) {
            console.error('❌ Error en verifyPassword:', verifyErr.message);
            console.error('   Detalles:', verifyErr);
            setLoading(false);
            setError('Error verificando contraseña: ' + verifyErr.message);
            return;
          }
          
          // Contraseña válida en blockchain
          console.log('✅ Contraseña válida en blockchain');
          const blockchainUser = {
            username: user_username,
            role,
            active,
            walletAddress: activeWallet === ethers.ZeroAddress ? null : activeWallet,
            registeredAt: new Date(Number(registeredAt) * 1000).toISOString(),
          };
          
          // Usuario existe en blockchain con contraseña válida
          if (blockchainUser.walletAddress && blockchainUser.walletAddress !== ethers.ZeroAddress) {
            // Usuario existe en blockchain CON wallet activa
            console.log('✅ Usuario en blockchain con wallet activa');
            const userData = {
              username: user_username,
              role: blockchainUser.role,
              active: true,
              walletAddress: blockchainUser.walletAddress,
              registeredAt: blockchainUser.registeredAt,
              isMetaMaskUser: true,
            };
            
            // Sincronizar a allUsers también
            let allUsersStr = localStorage.getItem('allUsers') || '[]';
            let allUsers = JSON.parse(allUsersStr);
            const userIndex = allUsers.findIndex(u => u.username === username);
            if (userIndex === -1) {
              allUsers.push({
                username: user_username,
                role: blockchainUser.role,
                active: blockchainUser.active,
                walletAddress: blockchainUser.walletAddress,
                registeredAt: blockchainUser.registeredAt,
              });
              localStorage.setItem('allUsers', JSON.stringify(allUsers));
              console.log('   ✅ Sincronizado a allUsers');
            }
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('walletAddress', blockchainUser.walletAddress);
            
            console.log('✅ Login exitoso');
            onLoginSuccess(userData);
            setLoading(false);
            return;
          } else {
            // Usuario existe en blockchain pero SIN wallet activa
            console.log('⚠️ Usuario en blockchain pero sin wallet activa');
            
            // Sincronizar a allUsers
            let allUsersStr = localStorage.getItem('allUsers') || '[]';
            let allUsers = JSON.parse(allUsersStr);
            const userIndex = allUsers.findIndex(u => u.username === username);
            if (userIndex === -1) {
              allUsers.push({
                username: user_username,
                role: blockchainUser.role,
                active: blockchainUser.active,
                walletAddress: null,
                registeredAt: blockchainUser.registeredAt,
              });
              localStorage.setItem('allUsers', JSON.stringify(allUsers));
              console.log('   ✅ Sincronizado a allUsers');
            }
            
            setAuthenticatedUser({
              loginUser: username,
              displayName: username,
              role: blockchainUser.role,
              registeredInBlockchain: true,
            });
            setStep('wallet');
            setLoading(false);
            
            // Conectar MetaMask automáticamente
            try {
              const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
              });
              
              if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setSelectedWalletIndex(0);
                setAvailableWallets(accounts);
                setShowWalletSelector(accounts.length > 1);
              }
            } catch (err) {
              console.warn('⚠️ Error conectando MetaMask:', err.message);
            }
            
            return;
          }
        } catch (userNotFoundErr) {
          console.log('⚠️ Usuario no encontrado en blockchain o está inactivo');
          console.log('   Error:', userNotFoundErr.message);
          console.log('   Intentando con localStorage...');
        }
      } catch (blockchainError) {
        console.warn('⚠️ Error verificando en blockchain:', blockchainError.message);
        console.log('   Continuando con verificación en localStorage...');
      }
    }

    // Fallback: Validar credenciales contra usuarios del sistema (localStorage)
    const systemUsers = getSystemUsers();
    const user = systemUsers[username];
    if (!user || user.password !== password) {
      setLoading(false);
      setError('Usuario o contraseña incorrectos');
      return;
    }
    
    // Contraseña válida en localStorage
    console.log('✅ Contraseña válida en localStorage');
    
    // Obtener usuario de allUsers
    let allUsersStr = localStorage.getItem('allUsers') || '[]';
    let allUsers = JSON.parse(allUsersStr);
    let registeredUser = allUsers.find(u => u.username === username);
    
    // Si el usuario no existe en allUsers, agregarlo
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
    
    // Login exitoso - crear userData
    const userData = {
      username: registeredUser.username,
      role: registeredUser.role,
      active: registeredUser.active,
      walletAddress: registeredUser.walletAddress || null,
      registeredAt: registeredUser.registeredAt,
      isMetaMaskUser: registeredUser.walletAddress ? true : false,
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    if (registeredUser.walletAddress) {
      localStorage.setItem('walletAddress', registeredUser.walletAddress);
    }
    
    onLoginSuccess(userData);
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
            // Manejar diferentes casos de error
            const errorMsg = error.message.toLowerCase();
            if (errorMsg.includes('wallet already active')) {
              console.log('ℹ️ Wallet ya está activa para este usuario');
            } else if (errorMsg.includes('user is inactive')) {
              console.warn('⚠️ El usuario está inactivo en blockchain');
            } else {
              console.warn('⚠️ Error vinculando wallet:', error.message);
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

  // Función para listar usuarios en blockchain (debug)
  const listBlockchainUsers = async () => {
    try {
      const workEnvironment = localStorage.getItem('workEnvironment');
      const contractAddress = localStorage.getItem('contractAddress');
      
      if (workEnvironment === 'offline' || !contractAddress || !window.ethereum) {
        alert('Modo offline o sin blockchain configurado');
        return;
      }
      
      console.log('📋 Listando usuarios en blockchain...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const { CONTRACT_ABI } = await import('../config/abi.js');
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      
      const usernames = await contract.getAllUsernames();
      console.log('✅ Usuarios encontrados:', usernames);
      
      alert('Usuarios en blockchain:\n' + usernames.join('\n'));
    } catch (err) {
      console.error('❌ Error listando usuarios:', err);
      alert('Error: ' + err.message);
    }
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

            <button 
              onClick={listBlockchainUsers}
              style={{ 
                marginTop: '10px', 
                padding: '10px 15px', 
                fontSize: '12px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              🔍 Ver usuarios en blockchain (debug)
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
