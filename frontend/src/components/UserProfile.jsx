import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function UserProfile({ currentUser, contract, onLogout }) {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showWalletBinder, setShowWalletBinder] = useState(false);
  const [bindingLoading, setBindingLoading] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, [currentUser, contract]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar detalles del usuario actual
      if (currentUser) {
        const registeredAt = currentUser.registeredAt || currentUser.timestamp;
        
        // Intentar obtener datos del blockchain si está en modo blockchain
        const workEnvironment = localStorage.getItem('workEnvironment');
        const contractAddress = localStorage.getItem('contractAddress');
        let blockchainData = null;
        
        console.log('📱 loadUserDetails iniciada');
        console.log('   currentUser.username:', currentUser.username);
        console.log('   currentUser.role:', currentUser.role);
        console.log('   currentUser.walletAddress:', currentUser.walletAddress);
        console.log('   workEnvironment:', workEnvironment);
        console.log('   contractAddress:', contractAddress);
        console.log('   window.ethereum:', !!window.ethereum);
        
        if (workEnvironment !== 'offline' && contractAddress && window.ethereum) {
          try {
            console.log('🔗 Obteniendo datos del blockchain para:', currentUser.username);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const { CONTRACT_ABI } = await import('../config/abi.js');
            const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
            
            const [username, role, active, registeredAt, activeWallet] = 
              await contract.getUserByUsername(currentUser.username);
            
            blockchainData = {
              username,
              role,
              active,
              registeredAt: new Date(registeredAt * 1000).toISOString(),
              walletAddress: activeWallet === ethers.ZeroAddress ? null : activeWallet,
            };
            
            console.log('✅ Datos recuperados del blockchain:', blockchainData);
            console.log('   Wallet activa:', blockchainData.walletAddress);
          } catch (err) {
            console.warn('⚠️ No se pudo obtener datos del blockchain:', err.message);
            console.warn('   Error code:', err.code);
            blockchainData = null;
          }
        }
        
        // Usar datos del blockchain si están disponibles, si no, usar datos locales
        const walletAddress = blockchainData?.walletAddress || currentUser.walletAddress || null;
        
        console.log('💾 Configurando userDetails con:');
        console.log('   walletAddress (blockchain):', blockchainData?.walletAddress);
        console.log('   walletAddress (local):', currentUser.walletAddress);
        console.log('   walletAddress (final):', walletAddress);
        console.log('   isOnchain:', blockchainData ? true : false);
        
        setUserDetails({
          username: currentUser.username,
          walletAddress: walletAddress,
          role: currentUser.role,
          active: currentUser.active !== undefined ? currentUser.active : true,
          registeredAt: registeredAt ? new Date(registeredAt).toLocaleDateString() : new Date().toLocaleDateString(),
          isOnchain: blockchainData ? true : false,
          isDevelopmentMode: !blockchainData,
          blockchainData: blockchainData,
        });
      }

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al cargar perfil');
      console.error('❌ Error en loadUserDetails:', err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('walletAddress');
    onLogout();
  };

  const handleUnlinkWallet = async () => {
    if (!window.confirm('¿Desvinacular tu wallet? Podrás vincular una nueva después.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Desvincular en blockchain si está en modo blockchain
      const workEnvironment = localStorage.getItem('workEnvironment');
      const contractAddress = localStorage.getItem('contractAddress');
      
      if (workEnvironment !== 'offline' && contractAddress && window.ethereum) {
        try {
          console.log('📝 Desvinculando wallet en blockchain...');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const { CONTRACT_ABI } = await import('../config/abi.js');
          const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
          
          // Llamar a unlinkWallet en blockchain
          const tx = await contract.unlinkWallet(currentUser.username);
          console.log('⏳ Esperando confirmación...');
          const receipt = await tx.wait();
          console.log('✅ Wallet desvinculada en blockchain');
          console.log('   - TX Hash:', receipt.hash);
          setSuccess('✅ Wallet desvinculada de blockchain');
        } catch (err) {
          console.warn('⚠️ Error desvinculando en blockchain:', err.message);
          setError('Error al desvinacular en blockchain: ' + err.message);
          setLoading(false);
          return;
        }
      }

      // Actualizar usuario removiendo wallet localmente
      const updatedUser = { ...currentUser, walletAddress: null, needsWalletBinding: true };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.removeItem('walletAddress');

      setUserDetails({ ...userDetails, walletAddress: null, isOnchain: false });
      setShowWalletBinder(true);

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al desvinacular wallet');
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setBindingLoading(true);
      setError('');
      setSuccess('');

      console.log('=== OBTENIENDO CUENTAS DE METAMASK ===');
      console.log('usuario actual:', currentUser.username, 'rol:', currentUser.role);

      if (!window.ethereum) {
        const msg = 'MetaMask no está instalado. Instálalo desde https://metamask.io';
        setError(msg);
        console.error('❌', msg);
        setBindingLoading(false);
        return;
      }

      if (!window.ethereum.isMetaMask) {
        const msg = 'Por favor instala MetaMask: https://metamask.io';
        setError(msg);
        console.error('❌', msg);
        setBindingLoading(false);
        return;
      }

      console.log('✅ MetaMask detectado');
      console.log('⏳ Solicitando cuentas de MetaMask...');
      setError('⏳ Abriendo MetaMask para seleccionar cuenta...');
      
      let accounts;
      try {
        console.log('📢 Llamando window.ethereum.request({method: eth_requestAccounts})');
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        console.log('✅ Cuentas obtenidas:', accounts.length, 'cuentas');
        accounts.forEach((acc, idx) => console.log(`   [${idx}]:`, acc));
      } catch (requestErr) {
        console.error('❌ Error en eth_requestAccounts:', requestErr);
        console.error('   error.code:', requestErr.code);
        console.error('   error.message:', requestErr.message);
        
        if (requestErr.code === 4001) {
          setError('Rechazaste la solicitud de conexión a MetaMask');
        } else if (requestErr.code === -32002) {
          setError('MetaMask ya está procesando una solicitud. Por favor espera.');
        } else {
          setError(`Error: ${requestErr.message || 'No se pudo conectar a MetaMask'}`);
        }
        setBindingLoading(false);
        return;
      }

      if (!accounts || accounts.length === 0) {
        setError('No se pudo obtener ninguna cuenta de MetaMask.');
        setBindingLoading(false);
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

      console.log('✅ Cuentas formateadas:', formattedWallets.length);
      formattedWallets.forEach((w, idx) => console.log(`   [${idx}]:`, w));

      if (formattedWallets.length === 0) {
        setError('Error al procesar las cuentas de MetaMask.');
        setBindingLoading(false);
        return;
      }

      // Guardar cuentas disponibles
      setAvailableWallets(formattedWallets);
      setSelectedWalletIndex(0);
      setShowWalletSelector(true);
      setError('');
      setBindingLoading(false);

      console.log('=== SELECTOR DE CUENTAS LISTO ===');
    } catch (err) {
      console.error('Error en handleConnectWallet:', err);
      setError(`Error: ${err.message}`);
      setBindingLoading(false);
    }
  };

  const handleSelectWallet = async (walletAddress) => {
    try {
      setBindingLoading(true);
      setError('');

      console.log('🔗 Vinculando wallet:', walletAddress);

      const workEnvironment = localStorage.getItem('workEnvironment');
      const contractAddress = localStorage.getItem('contractAddress');
      
      // Si estamos en modo blockchain, PRIMERO ejecutar la transacción
      if (workEnvironment !== 'offline' && contractAddress && window.ethereum) {
        try {
          console.log('🔗 Ejecutando transacción en blockchain para vincular wallet');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          // Importar ABI dinámicamente
          const { CONTRACT_ABI } = await import('../config/abi.js');
          const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
          
          // Obtener el rol del usuario
          const blockchainRole = currentUser.role === 'ADMIN' ? 'ASSET_CREATOR' : currentUser.role;
          
          // IMPORTANTE: Ejecutar transacción ANTES de guardar localmente
          console.log('⏳ Esperando confirmación de MetaMask...');
          const tx = await contract.linkWalletToUser(
            currentUser.username,
            blockchainRole
          );
          
          console.log('⏳ Esperando confirmación de transacción...');
          await tx.wait();
          console.log('✅ Wallet vinculada exitosamente en blockchain');
          
        } catch (blockchainError) {
          // Si hay error en blockchain, NO guardar wallet localmente
          const errorMsg = blockchainError.message?.toLowerCase() || '';
          
          // Casos especiales donde la wallet SÍ se vinculó
          if (errorMsg.includes('wallet already active')) {
            console.log('ℹ️ Wallet ya está activa para este usuario');
          } else if (errorMsg.includes('user is inactive')) {
            console.warn('⚠️ El usuario está inactivo en blockchain');
          } else if (errorMsg.includes('user rejected') || errorMsg.includes('denied')) {
            // Usuario canceló en MetaMask
            setError('❌ Operación cancelada por el usuario');
            setBindingLoading(false);
            return; // SALIR SIN GUARDAR LA WALLET
          } else {
            // Otro error
            console.error('❌ Error en blockchain:', blockchainError.message);
            setError(`❌ Error al vincular en blockchain: ${blockchainError.message}`);
            setBindingLoading(false);
            return; // SALIR SIN GUARDAR LA WALLET
          }
        }
      }

      // AHORA sí guardar la wallet localmente (después de confirmar blockchain)
      console.log('💾 Guardando wallet en localStorage');
      
      const updatedUser = {
        ...currentUser,
        walletAddress: walletAddress,
        needsWalletBinding: false,
      };

      // Actualizar currentUser en localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem('walletAddress', walletAddress);

      // Actualizar en allUsers también
      const allUsersStr = localStorage.getItem('allUsers') || '[]';
      const allUsers = JSON.parse(allUsersStr);
      
      const updatedUsers = allUsers.map(u => {
        if (u.username === currentUser.username) {
          console.log(`✅ Actualizando usuario ${u.username} con wallet ${walletAddress}`);
          return { ...u, walletAddress: walletAddress };
        }
        return u;
      });
      
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      // Actualizar estado del componente
      setUserDetails({
        ...userDetails,
        walletAddress: walletAddress,
      });

      setShowWalletSelector(false);
      setAvailableWallets([]);
      setSuccess('✅ Wallet vinculada correctamente');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
      
      // Recargar detalles del usuario
      await loadUserDetails();
      
      console.log('=== ✅ VINCULACIÓN COMPLETADA ===');
      setBindingLoading(false);
      
    } catch (err) {
      console.error('Error:', err);
      setError(`Error: ${err.message}`);
      setBindingLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
        setError('Completa todos los campos');
        return;
      }

      if (passwordForm.new !== passwordForm.confirm) {
        setError('Las contraseñas nuevas no coinciden');
        return;
      }

      if (passwordForm.new.length < 4) {
        setError('La nueva contraseña debe tener al menos 4 caracteres');
        return;
      }

      setPasswordLoading(true);
      setError('');

      // Verificar contraseña actual
      const systemUsers = JSON.parse(localStorage.getItem('systemUsers') || '{}');
      if (!systemUsers[currentUser.username] || systemUsers[currentUser.username].password !== passwordForm.current) {
        setError('Contraseña actual incorrecta');
        setPasswordLoading(false);
        return;
      }

      // Actualizar contraseña en systemUsers
      systemUsers[currentUser.username].password = passwordForm.new;
      localStorage.setItem('systemUsers', JSON.stringify(systemUsers));

      // Actualizar en allUsers también
      const allUsersStr = localStorage.getItem('allUsers') || '[]';
      const allUsers = JSON.parse(allUsersStr);
      const updatedUsers = allUsers.map(u => {
        if (u.username === currentUser.username) {
          return { ...u, password: passwordForm.new };
        }
        return u;
      });
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      setSuccess('✅ Contraseña cambiada correctamente');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setShowPasswordChange(false);
      
      setTimeout(() => setSuccess(''), 3000);
      setPasswordLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError(`Error: ${err.message}`);
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="user-profile">
        <p>No hay datos de usuario disponibles</p>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-card">
        <h2>👤 Mi Perfil</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="profile-section">
          <h3>Información Personal</h3>
          <div className="profile-item">
            <label>Nombre de Usuario:</label>
            <p>{userDetails.username}</p>
          </div>

          <div className="profile-item">
            <label>Rol Asignado:</label>
            <p className={`badge role-${userDetails.role?.toLowerCase()}`}>
              {userDetails.role || 'Sin asignar'}
            </p>
          </div>

          <div className="profile-item">
            <label>Estado:</label>
            <p className={`badge ${userDetails.active ? 'badge-success' : 'badge-danger'}`}>
              {userDetails.active ? '✅ Activo' : '❌ Inactivo'}
            </p>
          </div>

          <div style={{ marginTop: '15px' }}>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="btn-info"
            >
              🔐 Cambiar Contraseña
            </button>
          </div>

          {showPasswordChange && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              backgroundColor: '#f3e8ff', 
              borderRadius: '8px', 
              borderLeft: '4px solid #a855f7' 
            }}>
              <h4 style={{ color: '#6b21a8', marginTop: '0' }}>Cambiar Contraseña</h4>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8' }}>
                  Contraseña Actual:
                </label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  placeholder="Ingresa tu contraseña actual"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d8b4fe',
                    boxSizing: 'border-box'
                  }}
                  disabled={passwordLoading}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8' }}>
                  Nueva Contraseña:
                </label>
                <input
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  placeholder="Ingresa tu nueva contraseña"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d8b4fe',
                    boxSizing: 'border-box'
                  }}
                  disabled={passwordLoading}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#6b21a8' }}>
                  Confirmar Contraseña:
                </label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="Confirma la nueva contraseña"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d8b4fe',
                    boxSizing: 'border-box'
                  }}
                  disabled={passwordLoading}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="btn-success"
                >
                  {passwordLoading ? '⏳ Cambiando...' : '✅ Guardar Cambios'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordForm({ current: '', new: '', confirm: '' });
                    setError('');
                  }}
                  disabled={passwordLoading}
                  className="btn-secondary"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h3>🔐 Información de Wallet</h3>
          
          {userDetails?.isOnchain && (
            <div style={{ padding: '10px', backgroundColor: '#d1fae5', borderRadius: '6px', borderLeft: '4px solid #10b981', marginBottom: '10px', fontSize: '12px', color: '#065f46' }}>
              ✅ Datos recuperados de la blockchain
            </div>
          )}
          
          {!showWalletBinder && userDetails?.walletAddress ? (
            <>
              <div className="profile-item">
                <label>Dirección de Wallet:</label>
                <div className="wallet-display">
                  <code>{userDetails?.walletAddress}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(userDetails?.walletAddress);
                      alert('Wallet copiada al portapapeles');
                    }}
                    className="btn-small"
                  >
                    📋 Copiar
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowWalletBinder(true)}
                  disabled={loading}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  🔄 Cambiar Wallet
                </button>
                <button
                  onClick={handleUnlinkWallet}
                  disabled={loading}
                  className="btn-warning"
                  style={{ flex: 1 }}
                >
                  🔓 Desvinacular
                </button>
              </div>
            </>
          ) : !showWalletBinder && !userDetails?.walletAddress ? (
            <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <p style={{ margin: '0 0 10px 0', color: '#78350f' }}>
                ⚠️ Sin wallet vinculada
              </p>
              <button
                onClick={() => setShowWalletBinder(true)}
                className="btn-primary"
              >
                🔗 Vincular Wallet
              </button>
            </div>
          ) : null}

          {showWalletBinder && !showWalletSelector && (
            <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
              <p style={{ margin: '0 0 10px 0', color: '#0c4a6e' }}>
                Conecta tu wallet de MetaMask:
              </p>
              <button
                onClick={handleConnectWallet}
                disabled={bindingLoading}
                className="btn-primary"
              >
                {bindingLoading ? '⏳ Conectando...' : '🦊 Conectar MetaMask'}
              </button>
            </div>
          )}

          {showWalletSelector && availableWallets.length > 0 && (
            <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
              <p style={{ margin: '0 0 15px 0', color: '#15803d', fontWeight: 'bold' }}>
                Selecciona la cuenta que deseas vincular:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {availableWallets.map((wallet, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectWallet(wallet)}
                    disabled={bindingLoading}
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
                      e.target.style.backgroundColor = selectedWalletIndex === availableWallets.indexOf(wallet) ? '#dcfce7' : '#f0fdf4';
                      e.target.style.borderColor = selectedWalletIndex === availableWallets.indexOf(wallet) ? '#22c55e' : '#bbf7d0';
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
                  setShowWalletBinder(true);
                }}
                disabled={bindingLoading}
                style={{ marginTop: '10px', padding: '8px 12px' }}
                className="btn-secondary"
              >
                ← Atrás
              </button>
            </div>
          )}

          <div className="profile-item">
            <label>Fecha de Registro:</label>
            <p>{userDetails.registeredAt}</p>
          </div>
        </div>

        {userDetails.isOnchain && !userDetails.isDevelopmentMode && (
          <div className="profile-section alert alert-info">
            ✅ Este perfil está sincronizado con la blockchain
          </div>
        )}

        {userDetails.isDevelopmentMode && (
          <div className="profile-section alert alert-info">
            ℹ️ Modo desarrollo - Perfil almacenado localmente
          </div>
        )}
      </div>

      <div className="profile-help">
        <h3>ℹ️ Información Importante</h3>
        <ul>
          <li>Tu wallet está vinculada a tu cuenta de usuario</li>
          <li>El rol determina qué acciones puedes realizar en el sistema</li>
          <li>Contacta al administrador si necesitas cambiar tu rol</li>
          <li>Mantén segura tu frase de recuperación de MetaMask</li>
        </ul>
      </div>
    </div>
  );
}
