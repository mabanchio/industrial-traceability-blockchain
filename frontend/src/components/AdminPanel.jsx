import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function AdminPanel({ contract, provider, currentUser }) {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', walletAddress: '', role: 'AUDITOR' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [showConfigSection, setShowConfigSection] = useState(false);
  const [workEnvironment, setWorkEnvironment] = useState('offline');
  const [rpcUrl, setRpcUrl] = useState('');
  const [showEnvironmentConfig, setShowEnvironmentConfig] = useState(false);

  const roles = ['CERTIFIER', 'ASSET_CREATOR', 'AUDITOR', 'MANUFACTURER', 'DISTRIBUTOR'];
  
  const environments = [
    { id: 'offline', name: 'Modo Offline (Sin Blockchain)', color: '#ef4444' },
    { id: 'hardhat', name: 'Hardhat Local (localhost:8545)', color: '#f97316', defaultRpc: 'http://localhost:8545' },
    { id: 'sepolia', name: 'Red Sepolia Testnet', color: '#3b82f6', defaultRpc: 'https://sepolia.infura.io/v3/' },
    { id: 'mainnet', name: 'Ethereum Mainnet', color: '#8b5cf6', defaultRpc: 'https://mainnet.infura.io/v3/' },
    { id: 'custom', name: 'Red Privada Personalizada', color: '#06b6d4' },
  ];

  // Cargar usuarios y configuración de la blockchain (simulado con almacenamiento local)
  useEffect(() => {
    loadUsers();
    loadConfig();
  }, []);

  const loadUsers = () => {
    try {
      const savedUsers = localStorage.getItem('allUsers');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  const loadConfig = () => {
    try {
      const savedContractAddress = localStorage.getItem('contractAddress') || '';
      const savedNetworkName = localStorage.getItem('networkName') || '';
      const savedEnvironment = localStorage.getItem('workEnvironment') || 'offline';
      const savedRpcUrl = localStorage.getItem('rpcUrl') || '';
      
      setContractAddress(savedContractAddress);
      setNetworkName(savedNetworkName);
      setWorkEnvironment(savedEnvironment);
      setRpcUrl(savedRpcUrl);
    } catch (err) {
      console.error('Error cargando configuración:', err);
    }
  };

  const handleSaveEnvironment = async () => {
    try {
      setLoading(true);
      setError('');

      // Si es red privada, validar RPC URL
      if (workEnvironment === 'custom') {
        if (!rpcUrl.trim()) {
          setError('La URL del RPC no puede estar vacía para red privada');
          setLoading(false);
          return;
        }
        // Validar que sea una URL válida
        try {
          new URL(rpcUrl);
        } catch (err) {
          setError('La URL del RPC no es válida');
          setLoading(false);
          return;
        }
      }

      // Guardar configuración de ambiente
      localStorage.setItem('workEnvironment', workEnvironment);
      if (workEnvironment === 'custom' && rpcUrl.trim()) {
        localStorage.setItem('rpcUrl', rpcUrl);
      } else if (workEnvironment !== 'offline') {
        // Guardar RPC por defecto para redes conocidas
        const env = environments.find(e => e.id === workEnvironment);
        if (env?.defaultRpc) {
          localStorage.setItem('rpcUrl', env.defaultRpc);
        }
      }

      setSuccess('Entorno de trabajo configurado correctamente');
      setTimeout(() => setSuccess(''), 3000);
      
      // Recargar la página para aplicar cambios
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al guardar entorno');
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      if (!contractAddress.trim()) {
        setError('La dirección del contrato no puede estar vacía');
        return;
      }

      // Validar que sea una dirección de Ethereum válida
      if (!ethers.isAddress(contractAddress)) {
        setError('Dirección de contrato inválida');
        return;
      }

      setLoading(true);
      setError('');

      // Intentar normalizar con checksum, si falla usar minúsculas
      let finalAddress = contractAddress;
      try {
        finalAddress = ethers.getAddress(contractAddress);
      } catch (checksumErr) {
        // Si hay error de checksum, usar minúsculas
        finalAddress = contractAddress.toLowerCase();
      }

      // Guardar configuración en localStorage
      localStorage.setItem('contractAddress', finalAddress);
      localStorage.setItem('networkName', networkName || 'Hardhat Localhost');

      // Actualizar estado con dirección guardada
      setContractAddress(finalAddress);

      setSuccess('Configuración guardada correctamente');
      setTimeout(() => setSuccess(''), 3000);
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al guardar configuración');
      setLoading(false);
    }
  };

  const handleRegisterUser = async () => {
    if (!newUser.username.trim() || !newUser.password.trim()) {
      setError('Completa usuario y contraseña');
      return;
    }

    // Validar que el usuario no exista
    const systemUsers = JSON.parse(localStorage.getItem('systemUsers') || '{}');
    if (systemUsers[newUser.username]) {
      setError('Este usuario ya existe');
      return;
    }

    // Wallet es opcional al crear
    if (newUser.walletAddress && !ethers.isAddress(newUser.walletAddress)) {
      setError('Dirección de wallet inválida');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Si hay contrato blockchain disponible, usar la blockchain
      const workEnvironment = localStorage.getItem('workEnvironment');
      const contractAddress = localStorage.getItem('contractAddress');
      
      if (workEnvironment !== 'offline' && contractAddress && window.ethereum) {
        try {
          console.log('🔗 Registrando usuario en blockchain:', newUser.username);
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const { CONTRACT_ABI } = await import('../config/abi.js');
          const blockchainContract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
          
          // Llamar a registerUser con username y role (sin wallet)
          const tx = await blockchainContract.registerUser(newUser.username, newUser.role);
          await tx.wait();
          console.log('✅ Usuario registrado en blockchain');
          setSuccess(`Usuario ${newUser.username} registrado en blockchain`);
        } catch (blockchainError) {
          console.warn('⚠️ Error registrando en blockchain:', blockchainError.message);
          setError(`Blockchain: ${blockchainError.message}`);
        }
      }

      // Siempre guardar localmente - evitar duplicados
      const userExists = users.some(u => u.username === newUser.username);
      if (userExists) {
        setError('Este usuario ya existe en la lista local');
        setLoading(false);
        return;
      }

      const updatedUsers = [
        ...users,
        {
          walletAddress: newUser.walletAddress || null,
          username: newUser.username,
          password: newUser.password, // Guardar contraseña
          role: newUser.role,
          active: true,
          registeredAt: new Date().toISOString(),
        },
      ];

      setUsers(updatedUsers);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      // Guardar usuarios en el almacén de credenciales del sistema
      const systemUsers = JSON.parse(localStorage.getItem('systemUsers') || '{}');
      systemUsers[newUser.username] = { password: newUser.password, role: newUser.role, username: newUser.username };
      localStorage.setItem('systemUsers', JSON.stringify(systemUsers));

      setSuccess(`Usuario ${newUser.username} registrado correctamente con rol ${newUser.role}`);
      setNewUser({ username: '', password: '', walletAddress: '', role: 'AUDITOR' });
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
      setLoading(false);
    }
  };

  const handleAssignRole = async (username, newRole) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Si hay contrato blockchain disponible, usar la blockchain
      if (contract) {
        const user = users.find(u => u.username === username);
        if (user?.walletAddress) {
          const tx = await contract.assignRole(user.walletAddress, newRole);
          await tx.wait();
        }
      }

      // Actualizar localmente
      const updatedUsers = users.map((u) =>
        u.username === username ? { ...u, role: newRole } : u
      );

      setUsers(updatedUsers);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      // Actualizar en systemUsers también
      const systemUsers = JSON.parse(localStorage.getItem('systemUsers') || '{}');
      if (systemUsers[username]) {
        systemUsers[username].role = newRole;
        localStorage.setItem('systemUsers', JSON.stringify(systemUsers));
      }

      setSuccess(`Rol actualizado a ${newRole}`);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al asignar rol');
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (username) => {
    if (!window.confirm('¿Desactivar este usuario? No podrá operar en el sistema.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Si hay contrato blockchain disponible, usar la blockchain
      if (contract) {
        const user = users.find(u => u.username === username);
        if (user?.walletAddress) {
          const tx = await contract.deactivateUser(user.walletAddress);
          await tx.wait();
        }
      }

      // Actualizar localmente
      const updatedUsers = users.map((u) =>
        u.username === username ? { ...u, active: false } : u
      );

      setUsers(updatedUsers);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      setSuccess('Usuario desactivado');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al desactivar usuario');
      setLoading(false);
    }
  };

  const handleActivateUser = async (username) => {
    if (!window.confirm('¿Activar este usuario? Podrá operar en el sistema.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Si hay contrato blockchain disponible, usar la blockchain
      if (contract) {
        const user = users.find(u => u.username === username);
        if (user?.walletAddress) {
          const tx = await contract.registerUser(user.walletAddress, user.username, user.role);
          await tx.wait();
        }
      }

      // Actualizar localmente
      const updatedUsers = users.map((u) =>
        u.username === username ? { ...u, active: true } : u
      );

      setUsers(updatedUsers);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      setSuccess('Usuario activado');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al activar usuario');
      setLoading(false);
    }
  };

  const handleUnlinkWallet = async (walletAddress, username) => {
    if (!window.confirm(`¿Desvinacular wallet de ${username}? Podrá vincular una nueva después.`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Ejecutar desvinculación en blockchain si está disponible
      const workEnvironment = localStorage.getItem('workEnvironment');
      const contractAddress = localStorage.getItem('contractAddress');
      
      if (workEnvironment !== 'offline' && contractAddress && window.ethereum) {
        try {
          console.log('🔗 Desvinculando wallet en blockchain para:', username);
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const { CONTRACT_ABI } = await import('../config/abi.js');
          const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
          
          // Llamar a adminUnlinkWallet (requiere ser admin)
          const tx = await contract.adminUnlinkWallet(username);
          await tx.wait();
          console.log('✅ Wallet desvinculada en blockchain');
          setSuccess(`Wallet desvinculada de ${username} en blockchain`);
        } catch (blockchainError) {
          console.warn('⚠️ Error desvinculando en blockchain:', blockchainError.message);
          // Continuar con actualización local aunque falle blockchain
          setError(`Blockchain: ${blockchainError.message}`);
        }
      }

      // Actualizar usuario removiendo wallet
      const updatedUsers = users.map((u) =>
        u.walletAddress === walletAddress 
          ? { ...u, walletAddress: null, needsWalletBinding: true } 
          : u
      );

      setUsers(updatedUsers);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      // Si es el usuario actual, actualizar localStorage
      if (currentUser?.walletAddress === walletAddress) {
        const updatedUser = { ...currentUser, walletAddress: null, needsWalletBinding: true };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      setSuccess(`Wallet desvinculada de ${username}`);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al desvinacular wallet');
      setLoading(false);
    }
  };

  const filteredUsers = searchRole 
    ? users.filter((u) => u.role === searchRole)
    : users;

  if (currentUser?.role !== 'ADMIN' && !currentUser?.isAdmin) {
    return (
      <div className="admin-panel">
        <div className="alert alert-warning">
          ⚠️ No tienes permisos para acceder al Panel de Administración.
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>⚙️ Panel de Administración</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Sección: Configuración del Entorno de Trabajo */}
      <section className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>🌐 Entorno de Trabajo</h3>
          <button
            onClick={() => setShowEnvironmentConfig(!showEnvironmentConfig)}
            className="btn-info btn-small"
          >
            {showEnvironmentConfig ? '▼ Ocultar' : '▶ Mostrar'}
          </button>
        </div>

        {showEnvironmentConfig && (
          <div className="admin-form">
            <div className="form-group">
              <label>Modo de Operación:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                {environments.map(env => (
                  <button
                    key={env.id}
                    onClick={() => {
                      setWorkEnvironment(env.id);
                      if (env.defaultRpc && env.id !== 'custom') {
                        setRpcUrl(env.defaultRpc);
                      }
                    }}
                    style={{
                      padding: '12px',
                      backgroundColor: workEnvironment === env.id ? env.color : '#f3f4f6',
                      color: workEnvironment === env.id ? 'white' : '#1f2937',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: workEnvironment === env.id ? 'bold' : 'normal',
                      transition: 'all 0.2s',
                    }}
                    disabled={loading}
                  >
                    {env.name}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                El modo Offline permite usar la aplicación sin conexión a blockchain. 
                Hardhat Local es para desarrollo local. Sepolia y Mainnet son redes públicas.
              </p>
            </div>

            {workEnvironment === 'custom' && (
              <div className="form-group">
                <label htmlFor="customRpc">URL del RPC (Red Privada):</label>
                <input
                  id="customRpc"
                  type="text"
                  value={rpcUrl}
                  onChange={(e) => setRpcUrl(e.target.value)}
                  placeholder="http://localhost:8545 o https://tu-nodo.com"
                  className="input-field"
                  disabled={loading}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Ej: http://localhost:8545 (red local) o https://tu-proveedor-rpc.com/v3/tu-key
                </p>
              </div>
            )}

            {workEnvironment !== 'offline' && (
              <div style={{ padding: '10px', backgroundColor: '#eff6ff', borderRadius: '4px', marginBottom: '10px' }}>
                <p style={{ fontSize: '12px', color: '#0c4a6e', margin: '0' }}>
                  <strong>Nota:</strong> Para redes públicas (Sepolia, Mainnet) es recomendable usar tu propia clave API de Infura, Alchemy u otro proveedor.
                </p>
              </div>
            )}

            <button
              onClick={handleSaveEnvironment}
              disabled={loading}
              className="btn-success"
            >
              {loading ? '⏳ Guardando...' : '💾 Guardar Entorno'}
            </button>

            {workEnvironment && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '4px', borderLeft: '4px solid #22c55e' }}>
                <strong>Entorno Actual:</strong>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  {environments.find(e => e.id === workEnvironment)?.name}
                </p>
                {rpcUrl && workEnvironment !== 'offline' && (
                  <p style={{ margin: '5px 0', fontSize: '12px', fontFamily: 'monospace' }}>
                    RPC: {rpcUrl}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Sección: Configuración del Contrato y Red */}
      <section className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>⛓️ Configuración de Blockchain</h3>
          <button
            onClick={() => setShowConfigSection(!showConfigSection)}
            className="btn-info btn-small"
          >
            {showConfigSection ? '▼ Ocultar' : '▶ Mostrar'}
          </button>
        </div>

        {showConfigSection && (
          <div className="admin-form">
            <div className="form-group">
              <label htmlFor="contractAddress">Dirección del Contrato:</label>
              <input
                id="contractAddress"
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                className="input-field"
                disabled={loading}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Ej: 0x5FbDB2315678afccb333f8a9c12e1f0d7a8f7cbc
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="networkName">Nombre de la Red:</label>
              <input
                id="networkName"
                type="text"
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
                placeholder="Hardhat Localhost"
                className="input-field"
                disabled={loading}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Ej: Hardhat Localhost, Sepolia, Mainnet, etc.
              </p>
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={loading}
              className="btn-success"
            >
              {loading ? '⏳ Guardando...' : '💾 Guardar Configuración'}
            </button>

            {contractAddress && networkName && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '4px', borderLeft: '4px solid #0284c7' }}>
                <strong>Configuración Actual:</strong>
                <p style={{ margin: '5px 0', fontSize: '12px', fontFamily: 'monospace' }}>
                  Contrato: {contractAddress}
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  Red: {networkName}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Sección: Registrar Nuevo Usuario */}
      <section className="admin-section">
        <h3>📝 Registrar Nuevo Usuario</h3>
        <div className="admin-form">
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario:</label>
            <input
              id="username"
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="walletAddress">Dirección de Wallet (Opcional):</label>
            <input
              id="walletAddress"
              type="text"
              value={newUser.walletAddress}
              onChange={(e) => setNewUser({ ...newUser, walletAddress: e.target.value })}
              placeholder="0x..."
              className="input-field"
            />
            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '5px' }}>
              El usuario podrá vincular su wallet después si no la proporcionas ahora
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol:</label>
            <select
              id="role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="input-field"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRegisterUser}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Registrando...' : '✅ Registrar Usuario'}
          </button>
        </div>
      </section>

      {/* Sección: Gestionar Usuarios */}
      <section className="admin-section">
        <h3>👥 Gestionar Usuarios</h3>

        <div className="filter-section">
          <label htmlFor="filterRole">Filtrar por rol:</label>
          <select
            id="filterRole"
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
            className="input-field"
          >
            <option value="">Todos</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="users-table">
          {filteredUsers.length === 0 ? (
            <p className="no-users">No hay usuarios registrados</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Wallet</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.username} style={{ opacity: !user.active ? 0.6 : 1 }}>
                    <td>{user.username}</td>
                    <td className="wallet-cell">
                      {user.walletAddress ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span title={user.walletAddress}>
                            ✅ {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(user.walletAddress);
                              alert('Wallet copiada al portapapeles');
                            }}
                            className="btn-small"
                            title="Copiar wallet"
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                          >
                            📋
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>❌ Sin vincular</span>
                      )}
                    </td>
                    <td className={`role-cell role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: user.active ? '#d1fae5' : '#fee2e2',
                        color: user.active ? '#065f46' : '#991b1b'
                      }}>
                        {user.active ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td>{new Date(user.registeredAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <select
                        value={user.role}
                        onChange={(e) => handleAssignRole(user.username, e.target.value)}
                        disabled={loading || !user.active}
                        className="input-field role-select"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      {user.walletAddress && (
                        <button
                          onClick={() => handleUnlinkWallet(user.walletAddress, user.username)}
                          disabled={loading}
                          className="btn-warning btn-small"
                          title="Desvinacular wallet"
                        >
                          🔓 Desvinc.
                        </button>
                      )}
                      {user.active ? (
                        <button
                          onClick={() => handleDeactivateUser(user.username)}
                          disabled={loading}
                          className="btn-danger btn-small"
                        >
                          🔒 Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.username)}
                          disabled={loading}
                          className="btn-success btn-small"
                        >
                          ✅ Activar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="info-text">
          Total de usuarios: <strong>{filteredUsers.length}</strong> (Activos: <strong>{filteredUsers.filter(u => u.active).length}</strong>)
        </p>
      </section>
    </div>
  );
}
