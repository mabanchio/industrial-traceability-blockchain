import React, { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { CONTRACT_ABI } from '../config/abi';

export default function AssetManager({ signer, contractAddress }) {
  const [assetType, setAssetType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [assetId, setAssetId] = useState('');
  const [asset, setAsset] = useState(null);
  const [assets, setAssets] = useState([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(true);
  
  // Filtros y búsqueda
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Edición
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Historial
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  // Detectar modo offline y recargar cuando cambia
  useEffect(() => {
    const workEnvironment = localStorage.getItem('workEnvironment');
    const offline = workEnvironment === 'offline';
    setIsOfflineMode(offline);
    
    // Mostrar advertencia si cambias de offline a blockchain
    if (!offline && assets.length > 0) {
      setMessage('⚠️ Cambiaste a red blockchain. Los activos offline locales no son visibles aquí.');
      setTimeout(() => setMessage(''), 4000);
      setAssets([]); // Limpiar activos locales
    } else if (offline) {
      loadAssets(); // Cargar activos si vuelves a offline
    }
  }, [localStorage.getItem('workEnvironment')]);

  // Cargar activos desde localStorage (SOLO en modo offline)
  const loadAssets = () => {
    const workEnvironment = localStorage.getItem('workEnvironment');
    
    // Si no estamos en offline, no cargar de localStorage
    if (workEnvironment !== 'offline') {
      setAssets([]);
      setHistory([]);
      return;
    }
    
    const savedAssets = localStorage.getItem('assets');
    const savedHistory = localStorage.getItem('assetHistory');
    if (savedAssets) {
      try {
        setAssets(JSON.parse(savedAssets));
      } catch (e) {
        setAssets([]);
      }
    } else {
      setAssets([]);
    }
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        setHistory([]);
      }
    }
  };

  // Guardar activos en localStorage
  const saveAssets = (updatedAssets) => {
    localStorage.setItem('assets', JSON.stringify(updatedAssets));
    setAssets(updatedAssets);
  };

  // Registrar en historial
  const addToHistory = (action, assetData) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      assetId: assetData.id,
      assetType: assetData.assetType,
      user: JSON.parse(localStorage.getItem('currentUser') || '{}').username || 'Unknown',
      details: `${action}: ${assetData.assetType}`
    };
    const updatedHistory = [newEntry, ...history];
    localStorage.setItem('assetHistory', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  // Modo Offline: Registrar activo
  const registerAssetOffline = (e) => {
    e.preventDefault();
    if (!assetType || !description) {
      setMessage('❌ Por favor completa todos los campos');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const newAsset = {
      id: Date.now().toString(),
      assetType,
      description,
      owner: currentUser.username || 'Unknown',
      ownerWallet: currentUser.walletAddress || 'Sin wallet',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedAssets = [...assets, newAsset];
    saveAssets(updatedAssets);
    addToHistory('REGISTRADO', newAsset);
    setMessage(`✅ Activo registrado correctamente (ID: ${newAsset.id.substring(0, 8)}...)`);
    setAssetType('');
    setDescription('');
    
    setTimeout(() => setMessage(''), 3000);
  };

  // Modo Blockchain: Registrar activo
  const registerAssetBlockchain = async (e) => {
    e.preventDefault();
    if (!assetType || !description) {
      setMessage('❌ Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      const tx = await contract.registerAsset(assetType, description);
      const receipt = await tx.wait();
      setMessage(`✅ Activo registrado. Tx: ${receipt.transactionHash}`);
      setAssetType('');
      setDescription('');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const registerAsset = isOfflineMode ? registerAssetOffline : registerAssetBlockchain;

  // Modo Offline: Obtener activo
  const getAssetOffline = (e) => {
    e.preventDefault();
    if (!assetId) {
      setMessage('❌ Ingresa ID del activo');
      return;
    }

    const foundAsset = assets.find(a => a.id === assetId);
    if (foundAsset) {
      setAsset(foundAsset);
      setMessage('');
    } else {
      setAsset(null);
      setMessage(`❌ Activo con ID ${assetId} no encontrado`);
    }
  };

  // Modo Blockchain: Obtener activo
  const getAssetBlockchain = async (e) => {
    e.preventDefault();
    if (!assetId) {
      setMessage('❌ Ingresa ID del activo');
      return;
    }

    setLoading(true);
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      const result = await contract.getAsset(assetId);
      setAsset(result);
      setMessage('');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setAsset(null);
    } finally {
      setLoading(false);
    }
  };

  const getAsset = isOfflineMode ? getAssetOffline : getAssetBlockchain;

  // Desactivar activo en modo offline
  const deactivateAssetOffline = (id) => {
    const updatedAssets = assets.map(a => 
      a.id === id ? { ...a, active: false, updatedAt: new Date().toISOString() } : a
    );
    saveAssets(updatedAssets);
    const asset = updatedAssets.find(a => a.id === id);
    addToHistory('DESACTIVADO', asset);
    setMessage('✅ Activo desactivado');
    setTimeout(() => setMessage(''), 2000);
  };

  // Reactivar activo en modo offline
  const reactivateAssetOffline = (id) => {
    const updatedAssets = assets.map(a => 
      a.id === id ? { ...a, active: true, updatedAt: new Date().toISOString() } : a
    );
    saveAssets(updatedAssets);
    const asset = updatedAssets.find(a => a.id === id);
    addToHistory('REACTIVADO', asset);
    setMessage('✅ Activo reactivado');
    setTimeout(() => setMessage(''), 2000);
  };

  // Editar activo
  const startEdit = (asset) => {
    setEditingId(asset.id);
    setEditType(asset.assetType);
    setEditDescription(asset.description);
  };

  const saveEdit = (id) => {
    const updatedAssets = assets.map(a => 
      a.id === id ? { ...a, assetType: editType, description: editDescription, updatedAt: new Date().toISOString() } : a
    );
    saveAssets(updatedAssets);
    const asset = updatedAssets.find(a => a.id === id);
    addToHistory('EDITADO', asset);
    setEditingId(null);
    setMessage('✅ Activo actualizado');
    setTimeout(() => setMessage(''), 2000);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // Eliminar activo
  const deleteAsset = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este activo?')) {
      const asset = assets.find(a => a.id === id);
      const updatedAssets = assets.filter(a => a.id !== id);
      saveAssets(updatedAssets);
      addToHistory('ELIMINADO', asset);
      setMessage('✅ Activo eliminado');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // Filtrar activos
  const getFilteredAssets = () => {
    return assets.filter(a => {
      const typeMatch = !filterType || a.assetType.toLowerCase().includes(filterType.toLowerCase());
      const statusMatch = !filterStatus || (filterStatus === 'active' ? a.active : !a.active);
      const searchMatch = !searchQuery || 
        a.assetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.includes(searchQuery);
      return typeMatch && statusMatch && searchMatch;
    });
  };

  // Exportar activos
  const exportAssets = (format) => {
    const dataToExport = getFilteredAssets();
    let content, filename, type;

    if (format === 'json') {
      content = JSON.stringify(dataToExport, null, 2);
      filename = `activos_${new Date().toISOString().split('T')[0]}.json`;
      type = 'application/json';
    } else if (format === 'csv') {
      const headers = ['ID', 'Tipo', 'Descripción', 'Propietario', 'Estado', 'Creado', 'Actualizado'];
      const rows = dataToExport.map(a => [
        a.id,
        a.assetType,
        a.description,
        a.owner,
        a.active ? 'Activo' : 'Inactivo',
        new Date(a.createdAt).toLocaleString(),
        new Date(a.updatedAt).toLocaleString()
      ]);
      content = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      filename = `activos_${new Date().toISOString().split('T')[0]}.csv`;
      type = 'text/csv';
    }

    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredAssets = getFilteredAssets();
  const assetTypes = [...new Set(assets.map(a => a.assetType))];

  return (
    <div className="card">
      <h2>📦 Gestión de Activos Industriales</h2>
      {isOfflineMode ? (
        <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px', marginBottom: '15px' }}>
          <p style={{ margin: '0', fontSize: '12px', color: '#78350f' }}>
            💾 <strong>Modo Offline:</strong> Los activos se guardan localmente en tu navegador
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px', padding: '10px', marginBottom: '15px' }}>
          <p style={{ margin: '0', fontSize: '12px', color: '#1e3a8a' }}>
            ⛓️ <strong>Modo Blockchain:</strong> Los activos se registran en la red configurada (datos locales offline no son visibles)
          </p>
        </div>
      )}

      <div className="form-section">
        <h3>📝 Registrar Nuevo Activo</h3>
        <form onSubmit={registerAsset}>
          <input
            type="text"
            placeholder="Tipo de Activo (ej: Metal, Madera, Electrónica)"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Descripción (ej: Acero de alta calidad, lote #1234)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Activo'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="form-section">
        <h3>🔍 Consultar Activo</h3>
        <form onSubmit={getAsset}>
          <input
            type="text"
            placeholder={isOfflineMode ? "ID del Activo (timestamp)" : "ID del Activo (número)"}
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Consultando...' : 'Obtener'}
          </button>
        </form>
        {asset && (
          <div className="asset-display" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px', marginTop: '10px' }}>
            <h4 style={{ marginTop: '0' }}>✅ Detalles del Activo:</h4>
            <p><strong>ID:</strong> {asset.id || asset.assetId?.toString()}</p>
            <p><strong>Propietario:</strong> {asset.owner || asset.ownerWallet}</p>
            <p><strong>Tipo:</strong> {asset.assetType}</p>
            <p><strong>Descripción:</strong> {asset.description}</p>
            <p><strong>Estado:</strong> {asset.active ? '✅ Activo' : '❌ Inactivo'}</p>
            {asset.createdAt && <p><strong>Creado:</strong> {new Date(asset.createdAt).toLocaleString()}</p>}
            {asset.ownerWallet && <p><strong>Wallet Propietario:</strong> {asset.ownerWallet}</p>}
          </div>
        )}
      </div>

      {isOfflineMode && (
        <div className="form-section">
          <h3>🔎 Filtros y Búsqueda</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '12px', color: '#666' }}>Búsqueda rápida:</label>
              <input
                type="text"
                placeholder="Buscar por tipo, descripción o ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ marginTop: '5px' }}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '8px 12px',
                backgroundColor: showFilters ? '#3b82f6' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {showFilters ? '▼ Ocultar filtros' : '▶ Mostrar filtros'}
            </button>
          </div>

          {showFilters && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#666' }}>Tipo de Activo:</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ marginTop: '5px', width: '100%' }}
                  >
                    <option value="">Todos los tipos</option>
                    {assetTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666' }}>Estado:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ marginTop: '5px', width: '100%' }}
                  >
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setFilterType('');
                      setFilterStatus('');
                      setSearchQuery('');
                    }}
                    style={{
                      marginTop: '21px',
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
              {filteredAssets.length !== assets.length && (
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
                  Mostrando {filteredAssets.length} de {assets.length} activos
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: '0' }}>📋 Listado de Activos ({filteredAssets.length})</h3>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => setShowAssetForm(!showAssetForm)}
              style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}
            >
              {showAssetForm ? '▼ Ocultar' : '▶ Mostrar'}
            </button>
            {isOfflineMode && (
              <>
                <button 
                  onClick={() => exportAssets('json')}
                  title="Exportar como JSON"
                  style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  📥 JSON
                </button>
                <button 
                  onClick={() => exportAssets('csv')}
                  title="Exportar como CSV"
                  style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  📥 CSV
                </button>
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  title="Ver historial de cambios"
                  style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  📜 Historial
                </button>
              </>
            )}
          </div>
        </div>
        
        {showAssetForm && (
          <>
            {filteredAssets.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                No hay activos registrados
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                  marginTop: '10px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Tipo</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Descripción</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Propietario</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Estado</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Creado</th>
                      {isOfflineMode && <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((a) => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: a.active ? '#fff' : '#f9fafb' }}>
                        {editingId === a.id ? (
                          <>
                            <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '11px' }}>
                              {a.id.substring(0, 8)}...
                            </td>
                            <td style={{ padding: '10px' }}>
                              <input
                                type="text"
                                value={editType}
                                onChange={(e) => setEditType(e.target.value)}
                                style={{ width: '100%', padding: '4px' }}
                              />
                            </td>
                            <td style={{ padding: '10px' }}>
                              <input
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                style={{ width: '100%', padding: '4px' }}
                              />
                            </td>
                            <td colSpan="3" style={{ padding: '10px', textAlign: 'center' }}>
                              <button
                                onClick={() => saveEdit(a.id)}
                                style={{ padding: '4px 8px', marginRight: '5px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                              >
                                💾 Guardar
                              </button>
                              <button
                                onClick={cancelEdit}
                                style={{ padding: '4px 8px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                              >
                                ✕ Cancelar
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '11px' }}>
                              {a.id.substring(0, 8)}...
                            </td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{a.assetType}</td>
                            <td style={{ padding: '10px' }}>{a.description}</td>
                            <td style={{ padding: '10px', fontSize: '12px' }}>{a.owner || a.owner}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              {a.active ? '✅ Activo' : '❌ Inactivo'}
                            </td>
                            <td style={{ padding: '10px', fontSize: '11px' }}>
                              {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            {isOfflineMode && (
                              <td style={{ padding: '10px', textAlign: 'center' }}>
                                <button
                                  onClick={() => startEdit(a)}
                                  style={{
                                    padding: '4px 6px',
                                    marginRight: '3px',
                                    fontSize: '11px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✏️
                                </button>
                                {a.active ? (
                                  <button 
                                    onClick={() => deactivateAssetOffline(a.id)}
                                    style={{
                                      padding: '4px 6px',
                                      marginRight: '3px',
                                      fontSize: '11px',
                                      backgroundColor: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      cursor: 'pointer'
                                    }}
                                    title="Desactivar activo"
                                  >
                                    🛑
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => reactivateAssetOffline(a.id)}
                                    style={{
                                      padding: '4px 6px',
                                      marginRight: '3px',
                                      fontSize: '11px',
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      cursor: 'pointer'
                                    }}
                                    title="Reactivar activo"
                                  >
                                    ♻️
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteAsset(a.id)}
                                  style={{
                                    padding: '4px 6px',
                                    fontSize: '11px',
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  🗑️
                                </button>
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showHistory && isOfflineMode && (
        <div className="form-section">
          <h3>📜 Historial de Cambios ({history.length})</h3>
          {history.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              No hay historial de cambios
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
                marginTop: '10px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Fecha/Hora</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Acción</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Activo</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Usuario</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px', fontSize: '11px' }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: entry.action === 'REGISTRADO' ? '#d1fae5' : entry.action === 'ELIMINADO' ? '#fee2e2' : '#fef3c7',
                          color: entry.action === 'REGISTRADO' ? '#065f46' : entry.action === 'ELIMINADO' ? '#7f1d1d' : '#78350f'
                        }}>
                          {entry.action}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontSize: '11px', fontFamily: 'monospace' }}>
                        {entry.assetType}
                      </td>
                      <td style={{ padding: '10px', fontSize: '11px' }}>{entry.user}</td>
                      <td style={{ padding: '10px', fontSize: '11px' }}>{entry.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
