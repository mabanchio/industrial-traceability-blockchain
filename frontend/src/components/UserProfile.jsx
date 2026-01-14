import React, { useState, useEffect } from 'react';

export function UserProfile({ currentUser, contract, onLogout }) {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserDetails();
  }, [currentUser, contract]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      setError('');

      if (currentUser && currentUser.walletAddress) {
        try {
          // Intentar obtener de la blockchain
          if (contract) {
            const user = await contract.getUser(currentUser.walletAddress);
            setUserDetails({
              username: user.username || currentUser.username,
              walletAddress: user.walletAddress,
              role: user.role || currentUser.role,
              active: user.active,
              registeredAt: new Date(Number(user.registeredAt) * 1000).toLocaleDateString(),
              isOnchain: true,
            });
          } else {
            // Si no hay contrato, usar datos locales
            setUserDetails({
              ...currentUser,
              isOnchain: false,
            });
          }
        } catch (err) {
          // Si hay error, usar datos locales
          setUserDetails({
            ...currentUser,
            isOnchain: false,
          });
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al cargar perfil');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('walletAddress');
    onLogout();
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
        </div>

        <div className="profile-section">
          <h3>🔐 Información de Wallet</h3>
          <div className="profile-item">
            <label>Dirección de Wallet:</label>
            <div className="wallet-display">
              <code>{userDetails.walletAddress}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(userDetails.walletAddress);
                  alert('Wallet copiada al portapapeles');
                }}
                className="btn-small"
              >
                📋 Copiar
              </button>
            </div>
          </div>

          <div className="profile-item">
            <label>Fecha de Registro:</label>
            <p>{userDetails.registeredAt}</p>
          </div>
        </div>

        {userDetails.isOnchain && (
          <div className="profile-section alert alert-info">
            ✅ Este perfil está sincronizado con la blockchain
          </div>
        )}

        {!userDetails.isOnchain && (
          <div className="profile-section alert alert-warning">
            ⚠️ Este perfil aún no se ha registrado en la blockchain.
            El administrador debe completar tu registro.
          </div>
        )}

        <div className="profile-actions">
          <button onClick={handleLogout} className="btn-danger">
            🚪 Cerrar Sesión
          </button>
        </div>
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

export default UserProfile;
