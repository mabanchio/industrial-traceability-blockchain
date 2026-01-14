import React, { useState } from 'react';
import { ethers } from 'ethers';

export function Login({ onLoginSuccess }) {
  const [step, setStep] = useState('initial'); // initial, connecting, profile
  const [walletAddress, setWalletAddress] = useState('');
  const [username, setUsername] = useState('');
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      // Crear proveedor
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);

      setStep('profile');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al conectar MetaMask');
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('Por favor ingresa tu usuario');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const userData = {
        walletAddress,
        username,
        role: 'AUDITOR', // Por defecto, el usuario registra como AUDITOR hasta que se asigne su rol
        timestamp: new Date().toISOString(),
      };

      // Guardar en localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('walletAddress', walletAddress);

      // Notificar al componente principal
      onLoginSuccess(userData);

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setStep('initial');
    setWalletAddress('');
    setUsername('');
    setProvider(null);
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
            <p>Conecta tu billetera MetaMask para acceder al sistema</p>
            <button 
              onClick={connectMetaMask}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Conectando...' : '🦊 Conectar MetaMask'}
            </button>
          </div>
        )}

        {step === 'profile' && (
          <div className="login-step">
            <div className="wallet-display">
              <label>Dirección de Wallet:</label>
              <input 
                type="text" 
                value={walletAddress} 
                disabled 
                className="input-disabled"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Usuario (Nombre):</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu nombre de usuario"
                className="input-field"
              />
            </div>

            <div className="login-actions">
              <button 
                onClick={handleLogin}
                disabled={loading || !username.trim()}
                className="btn-primary"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
              <button 
                onClick={() => setStep('initial')}
                disabled={loading}
                className="btn-secondary"
              >
                Atrás
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="login-info">
          <p>💡 <strong>Nota:</strong> Tu wallet se vinculará a tu cuenta.</p>
          <p>El administrador deberá registrarte y asignarte un rol para operar en el sistema.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
