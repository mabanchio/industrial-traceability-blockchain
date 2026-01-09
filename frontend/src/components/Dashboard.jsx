import React from 'react';

export default function Dashboard({ provider, signer, contractAddress }) {
  return (
    <div className="card">
      <h2>📊 Dashboard</h2>
      <div className="info-grid">
        <div className="info-item">
          <h3>Dirección del Contrato</h3>
          <p style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>
            {contractAddress || 'No desplegado'}
          </p>
        </div>
        <div className="info-item">
          <h3>Red</h3>
          <p>Hardhat Localhost (31337)</p>
        </div>
        <div className="info-item">
          <h3>Características</h3>
          <ul>
            <li>✅ Registro de Activos Industriales</li>
            <li>✅ Emisión de Certificaciones</li>
            <li>✅ Renovación de Certificados</li>
            <li>✅ Revocación Inmediata</li>
            <li>✅ Control de Roles (Admin, Certifier, Creator)</li>
            <li>✅ Historial Inmutable on-chain</li>
          </ul>
        </div>
        <div className="info-item">
          <h3>Optimizaciones de Gas</h3>
          <ul>
            <li>✨ Compiler optimizer habilitado (runs: 200)</li>
            <li>✨ Storage packing eficiente</li>
            <li>✨ Unchecked math en operaciones seguras</li>
            <li>✨ Eventos bien indexados para queries rápidas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
