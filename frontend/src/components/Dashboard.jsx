import React, { useState, useEffect } from 'react';

export default function Dashboard({ provider, signer, contractAddress, blockchainStatus, workEnvironment }) {
  const [configContractAddress, setConfigContractAddress] = useState('');
  const [configNetworkName, setConfigNetworkName] = useState('');
  const [rpcUrl, setRpcUrl] = useState('');

  useEffect(() => {
    // Cargar configuración desde localStorage
    const savedContractAddress = localStorage.getItem('contractAddress') || contractAddress || 'No configurado';
    const savedNetworkName = localStorage.getItem('networkName') || 'Hardhat Localhost';
    const savedRpcUrl = localStorage.getItem('rpcUrl') || '';
    
    setConfigContractAddress(savedContractAddress);
    setConfigNetworkName(savedNetworkName);
    setRpcUrl(savedRpcUrl);
  }, [contractAddress]);

  const getEnvironmentColor = () => {
    const colors = {
      'offline': '#ef4444',
      'hardhat': '#f97316',
      'sepolia': '#3b82f6',
      'mainnet': '#8b5cf6',
      'custom': '#06b6d4',
    };
    return colors[workEnvironment] || '#6b7280';
  };

  const getEnvironmentName = () => {
    const names = {
      'offline': 'Modo Offline (Sin Blockchain)',
      'hardhat': 'Hardhat Local',
      'sepolia': 'Sepolia Testnet',
      'mainnet': 'Ethereum Mainnet',
      'custom': 'Red Privada Personalizada',
    };
    return names[workEnvironment] || 'Desconocido';
  };

  const getEnvironmentDescription = () => {
    const descriptions = {
      'offline': 'El sistema opera sin conexión a blockchain. Los datos se guardan localmente. Ideal para desarrollo y pruebas.',
      'hardhat': 'Conectado a Hardhat local en localhost:8545. Perfecta para desarrollo y testing con blockchain local.',
      'sepolia': 'Conectado a Sepolia Testnet. Red pública de prueba de Ethereum. Útil para pruebas antes de mainnet.',
      'mainnet': 'Conectado a Ethereum Mainnet. Red principal. Transacciones utilizan ETH real.',
      'custom': 'Conectado a una red privada personalizada. Configuración específica para enterprise.',
    };
    return descriptions[workEnvironment] || 'Modo desconocido';
  };

  return (
    <div className="card">
      <h2>📊 Dashboard</h2>
      <div className="info-grid">
        {/* Tarjeta destacada de Entorno */}
        <div style={{
          gridColumn: '1 / -1',
          backgroundColor: getEnvironmentColor() + '10',
          borderLeft: `5px solid ${getEnvironmentColor()}`,
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '10px'
        }}>
          <h3 style={{ color: getEnvironmentColor(), marginTop: '0' }}>🌐 Entorno de Trabajo Actual</h3>
          <p style={{ fontWeight: 'bold', color: getEnvironmentColor(), fontSize: '18px', margin: '10px 0' }}>
            {blockchainStatus}
          </p>
          <p style={{ fontSize: '14px', color: '#333', marginBottom: '5px', fontWeight: '500' }}>
            {getEnvironmentName()}
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>
            {getEnvironmentDescription()}
          </p>
          
          {workEnvironment !== 'offline' && (
            <div style={{ marginTop: '10px', fontSize: '12px', fontFamily: 'monospace', color: '#444', backgroundColor: '#fff', padding: '8px', borderRadius: '4px', wordBreak: 'break-all' }}>
              {rpcUrl && <p style={{ margin: '0' }}>RPC: {rpcUrl}</p>}
            </div>
          )}

          {workEnvironment === 'offline' && (
            <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '4px', borderLeft: '3px solid #f59e0b' }}>
              <p style={{ fontSize: '12px', color: '#78350f', margin: '0' }}>
                ⚠️ En modo offline, los datos se guardan solo localmente. No hay interacción con blockchain.
              </p>
            </div>
          )}
        </div>
        
        {/* Información de Contrato */}
        <div className="info-item">
          <h3>⛓️ Dirección del Contrato</h3>
          <p style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '4px' }}>
            {configContractAddress || 'No desplegado'}
          </p>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
            {configContractAddress && configContractAddress !== 'No configurado' ? '✅ Configurado' : '⚠️ No configurado'}
          </p>
        </div>

        {/* Información de Red */}
        <div className="info-item">
          <h3>🔗 Red Blockchain</h3>
          <p style={{ fontWeight: 'bold', color: '#0284c7', fontSize: '14px' }}>
            {getEnvironmentName()}
          </p>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
            {workEnvironment === 'offline' ? '📴 Sin conexión' : `✅ ${getEnvironmentName()}`}
          </p>
        </div>

        {/* Estado de Configuración */}
        <div className="info-item" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e' }}>
          <h3>✅ Estado de Configuración</h3>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '12px' }}>
            <li>{workEnvironment ? '✅' : '❌'} Entorno configurado</li>
            <li>{configContractAddress && configContractAddress !== 'No configurado' ? '✅' : '❌'} Contrato configurado</li>
            <li>{configNetworkName ? '✅' : '❌'} Red configurada</li>
          </ul>
          <p style={{ fontSize: '11px', color: '#15803d', marginTop: '8px', marginBottom: '0' }}>
            {workEnvironment === 'offline' || !configContractAddress || configContractAddress === 'No configurado' 
              ? '⚠️ Algunas configuraciones incompletas' 
              : '✅ Sistema completamente configurado'}
          </p>
        </div>

        {/* Características */}
        <div className="info-item">
          <h3>🎯 Características del Sistema</h3>
          <ul>
            <li>✅ Registro de Activos Industriales</li>
            <li>✅ Emisión de Certificaciones</li>
            <li>✅ Renovación de Certificados</li>
            <li>✅ Revocación Inmediata</li>
            <li>✅ Control de Roles (Admin, Certifier, Creator)</li>
            <li>✅ Historial Inmutable on-chain</li>
          </ul>
        </div>

        {/* Optimizaciones */}
        <div className="info-item">
          <h3>⚡ Optimizaciones de Gas</h3>
          <ul>
            <li>✨ Compiler optimizer habilitado (runs: 200)</li>
            <li>✨ Storage packing eficiente</li>
            <li>✨ Unchecked math en operaciones seguras</li>
            <li>✨ Eventos bien indexados para queries rápidas</li>
          </ul>
        </div>

        <div className="info-item" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
          <h3>⚙️ Configuración del Sistema</h3>
          <p style={{ fontSize: '12px', margin: '5px 0' }}>
            <strong>Estado de Configuración:</strong>
          </p>
          <ul style={{ fontSize: '12px', margin: '5px 0', paddingLeft: '20px' }}>
            <li>
              {workEnvironment !== 'offline' ? '✅' : '❌'} Entorno configurado
            </li>
            <li>
              {configContractAddress && configContractAddress !== 'No configurado' ? '✅' : '❌'} Contrato configurado
            </li>
            <li>
              {configNetworkName ? '✅' : '❌'} Red configurada
            </li>
          </ul>
          <p style={{ fontSize: '11px', color: '#78350f', marginTop: '10px', marginBottom: '0' }}>
            📋 El administrador puede configurar estos valores en el Panel de Administración
          </p>
        </div>
      </div>
    </div>
  );
}
