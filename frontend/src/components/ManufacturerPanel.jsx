import React, { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { CONTRACT_ABI } from '../config/abi';

export default function ManufacturerPanel({ signer, contractAddress }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [userWallet, setUserWallet] = useState(null);
  
  // Estado para transferencia
  const [transferringId, setTransferringId] = useState(null);
  const [transferAddress, setTransferAddress] = useState('');
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Cargar activos del usuario (MANUFACTURER)
  const loadManufacturerAssets = async () => {
    if (!signer || !contractAddress) return;
    try {
      setLoading(true);
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      const walletAddress = await signer.getAddress();
      setUserWallet(walletAddress);
      
      const assetIds = await contract.getUserAssets(walletAddress);
      const manufacturerAssets = [];
      
      for (const assetId of assetIds) {
        try {
          const asset = await contract.getAsset(assetId);
          manufacturerAssets.push({
            id: assetId.toString(),
            assetType: asset.assetType || 'Desconocido',
            description: asset.description || '',
            owner: asset.owner,
            active: asset.active
          });
        } catch (e) {
          // Skip si el asset no existe
        }
      }
      
      setAssets(manufacturerAssets);
    } catch (err) {
      console.warn('Error cargando activos:', err.message);
      setMessage('❌ Error al cargar activos');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Cargar activos locales en modo offline
  const loadOfflineAssets = () => {
    const savedAssets = localStorage.getItem('assets');
    if (savedAssets) {
      try {
        const allAssets = JSON.parse(savedAssets);
        setAssets(allAssets);
      } catch (e) {
        console.error('Error al cargar activos locales:', e);
      }
    }
  };

  // Detectar modo y cargar datos
  useEffect(() => {
    const workEnvironment = localStorage.getItem('workEnvironment');
    const offline = workEnvironment === 'offline';
    setIsOfflineMode(offline);
    
    if (!offline) {
      loadManufacturerAssets();
    } else {
      loadOfflineAssets();
    }
  }, [signer, contractAddress]);

  // Transferir activo
  const transferAsset = async () => {
    if (!transferringId || !transferAddress) {
      setMessage('❌ Completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      
      // Validar dirección
      if (!/^0x[a-fA-F0-9]{40}$/.test(transferAddress)) {
        setMessage('❌ Dirección inválida');
        return;
      }

      const tx = await contract.transferAsset(transferringId, transferAddress);
      await tx.wait();
      
      setMessage('✅ Activo transferido exitosamente');
      setTransferringId(null);
      setTransferAddress('');
      setTimeout(() => setMessage(''), 3000);
      
      // Recargar activos
      loadManufacturerAssets();
    } catch (err) {
      setMessage('❌ Error en transferencia: ' + (err.reason || err.message));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Desactivar activo
  const deactivateAsset = async (assetId) => {
    try {
      setLoading(true);
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      const tx = await contract.deactivateAsset(assetId);
      await tx.wait();
      
      setMessage('✅ Activo desactivado exitosamente');
      setTimeout(() => setMessage(''), 3000);
      
      // Recargar activos
      loadManufacturerAssets();
    } catch (err) {
      setMessage('❌ Error al desactivar: ' + (err.reason || err.message));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar activos
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchQuery === '' || 
      asset.assetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id.includes(searchQuery);
    
    const matchesStatus = filterStatus === '' || 
      (filterStatus === 'active' && asset.active) ||
      (filterStatus === 'inactive' && !asset.active);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="panel">
      <h2>🏭 Panel del Fabricante (Manufacturer)</h2>
      
      {message && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          borderRadius: '6px',
          backgroundColor: message.includes('❌') ? '#fee' : '#efe',
          color: message.includes('❌') ? '#c33' : '#3c3',
          border: `1px solid ${message.includes('❌') ? '#fcc' : '#cfc'}`
        }}>
          {message}
        </div>
      )}

      {loading && <p style={{ textAlign: 'center', color: '#666' }}>⏳ Cargando...</p>}

      {/* SECCIÓN: MIS ACTIVOS */}
      <div className="form-section">
        <h3>📦 Mis Activos</h3>
        
        {/* Búsqueda y filtros */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Buscar por tipo, descripción o ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">📊 Todos los estados</option>
            <option value="active">✅ Activos</option>
            <option value="inactive">❌ Inactivos</option>
          </select>
        </div>

        {/* Tabla de activos */}
        {filteredAssets.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            {assets.length === 0 ? 'No tienes activos registrados' : 'No hay activos que coincidan con tu búsqueda'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Tipo</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Descripción</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Estado</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr 
                    key={asset.id} 
                    style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: asset.active ? '#fff' : '#f9fafb' }}
                  >
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '11px' }}>
                      {asset.id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{asset.assetType}</td>
                    <td style={{ padding: '10px' }}>{asset.description || '-'}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {asset.active ? '✅ Activo' : '❌ Inactivo'}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {asset.active ? (
                        transferringId === asset.id ? (
                          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                            <input
                              type="text"
                              placeholder="0x..."
                              value={transferAddress}
                              onChange={(e) => setTransferAddress(e.target.value)}
                              style={{
                                width: '200px',
                                padding: '4px',
                                fontSize: '11px',
                                border: '1px solid #d1d5db',
                                borderRadius: '3px'
                              }}
                            />
                            <button
                              onClick={transferAsset}
                              disabled={loading}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1
                              }}
                            >
                              ✔️
                            </button>
                            <button
                              onClick={() => {
                                setTransferringId(null);
                                setTransferAddress('');
                              }}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                            <button
                              onClick={() => setTransferringId(asset.id)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                              title="Transferir activo a otro propietario"
                            >
                              📤
                            </button>
                            <button
                              onClick={() => deactivateAsset(asset.id)}
                              disabled={loading}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1
                              }}
                              title="Deshabilitar activo"
                            >
                              🛑
                            </button>
                          </div>
                        )
                      ) : (
                        <span style={{ fontSize: '12px', color: '#999' }}>
                          No disponible
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
          📌 Como Fabricante, solo puedes transferir tus activos a otros propietarios.
          Los activos inactivos no pueden ser transferidos.
        </p>
      </div>
    </div>
  );
}
