import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function AdminPanel({ contract, provider, currentUser }) {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ wallet: '', username: '', role: 'AUDITOR' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchRole, setSearchRole] = useState('');

  const roles = ['CERTIFIER', 'ASSET_CREATOR', 'AUDITOR', 'MANUFACTURER', 'DISTRIBUTOR'];

  // Cargar usuarios de la blockchain (simulado con almacenamiento local)
  useEffect(() => {
    loadUsers();
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

  const handleRegisterUser = async () => {
    if (!newUser.wallet.trim() || !newUser.username.trim()) {
      setError('Completa todos los campos');
      return;
    }

    // Validar dirección Ethereum
    if (!ethers.isAddress(newUser.wallet)) {
      setError('Dirección de wallet inválida');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Llamar función del smart contract
      const tx = await contract.registerUser(
        newUser.wallet,
        newUser.username,
        newUser.role
      );

      await tx.wait();

      // Guardar localmente
      const updatedUsers = [
        ...users,
        {
          walletAddress: newUser.wallet,
          username: newUser.username,
          role: newUser.role,
          active: true,
          registeredAt: new Date().toISOString(),
        },
      ];

      setUsers(updatedUsers);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      setSuccess(`Usuario ${newUser.username} registrado correctamente con rol ${newUser.role}`);
      setNewUser({ wallet: '', username: '', role: 'AUDITOR' });
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
      setLoading(false);
    }
  };

  const handleAssignRole = async (walletAddress, newRole) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Llamar función del smart contract
      const tx = await contract.assignRole(walletAddress, newRole);
      await tx.wait();

      // Actualizar localmente
      const updatedUsers = users.map((u) =>
        u.walletAddress === walletAddress ? { ...u, role: newRole } : u
      );

      setUsers(updatedUsers);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      setSuccess(`Rol actualizado a ${newRole}`);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al asignar rol');
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (walletAddress) => {
    if (!window.confirm('¿Desactivar este usuario? No podrá operar en el sistema.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Llamar función del smart contract
      const tx = await contract.deactivateUser(walletAddress);
      await tx.wait();

      // Actualizar localmente
      const updatedUsers = users.map((u) =>
        u.walletAddress === walletAddress ? { ...u, active: false } : u
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

  const filteredUsers = searchRole 
    ? users.filter((u) => u.role === searchRole && u.active)
    : users.filter((u) => u.active);

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

      {/* Sección: Registrar Nuevo Usuario */}
      <section className="admin-section">
        <h3>📝 Registrar Nuevo Usuario</h3>
        <div className="admin-form">
          <div className="form-group">
            <label htmlFor="wallet">Dirección de Wallet:</label>
            <input
              id="wallet"
              type="text"
              value={newUser.wallet}
              onChange={(e) => setNewUser({ ...newUser, wallet: e.target.value })}
              placeholder="0x..."
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario:</label>
            <input
              id="username"
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Ej: Juan Pérez"
              className="input-field"
            />
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
                  <th>Rol Actual</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.walletAddress}>
                    <td>{user.username}</td>
                    <td className="wallet-cell">
                      {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                    </td>
                    <td className={`role-cell role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </td>
                    <td>{new Date(user.registeredAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <select
                        value={user.role}
                        onChange={(e) => handleAssignRole(user.walletAddress, e.target.value)}
                        disabled={loading}
                        className="input-field role-select"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDeactivateUser(user.walletAddress)}
                        disabled={loading}
                        className="btn-danger btn-small"
                      >
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="info-text">
          Total de usuarios activos: <strong>{filteredUsers.length}</strong>
        </p>
      </section>
    </div>
  );
}
