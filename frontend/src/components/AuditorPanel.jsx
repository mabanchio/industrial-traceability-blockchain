import React, { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { CONTRACT_ABI } from '../config/abi';

export default function AuditorPanel({ provider, signer, contractAddress, currentUser }) {
  const [activeTab, setActiveTab] = useState('assets');
  const [assets, setAssets] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Búsqueda y filtros
  const [searchAssetId, setSearchAssetId] = useState('');
  const [filterAssetType, setFilterAssetType] = useState('');
  const [filterAssetStatus, setFilterAssetStatus] = useState('');
  
  const [searchCertId, setSearchCertId] = useState('');
  const [filterCertType, setFilterCertType] = useState('');
  const [filterCertStatus, setFilterCertStatus] = useState('');
  
  const [filterUserRole, setFilterUserRole] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  
  // Detalle expandido
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [assetCerts, setAssetCerts] = useState([]);
  
  // Reportes
  const [reportData, setReportData] = useState(null);

  const roles = ['ADMIN', 'CERTIFIER', 'ASSET_CREATOR', 'AUDITOR', 'MANUFACTURER', 'DISTRIBUTOR'];
  const assetTypes = ['Materia Prima', 'Componente', 'Producto Intermedio', 'Producto Final', 'Desecho', 'Otro'];
  const certificateTypes = ['ISO-9001', 'ISO-14001', 'FSC', 'EUDR', 'RoHS', 'CE', 'Custom'];
  const statuses = ['Activo', 'Inactivo', 'Revocado', 'Expirado'];

  // Cargar todos los activos
  const loadAssets = async () => {
    if (!provider || !contractAddress) return;
    setLoading(true);
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, provider);
      const allAssets = [];
      const processedAssetIds = new Set(); // Rastrear IDs únicos
      
      // Obtener todos los usuarios para luego sus activos
      const allUsers = await contract.getAllUsers();
      
      for (const user of allUsers) {
        try {
          const userAssets = await contract.getUserAssets(user.activeWallet);
          for (const assetId of userAssets) {
            const assetIdNum = Number(assetId);
            // Solo procesar si no lo hemos visto antes
            if (!processedAssetIds.has(assetIdNum)) {
              processedAssetIds.add(assetIdNum);
              const asset = await contract.getAsset(assetId);
              allAssets.push({
                id: assetIdNum,
                assetType: asset.assetType || 'Desconocido',
                description: asset.description || '',
                status: asset.status || 'Activo',
                owner: user.username,
                ...asset
              });
            }
          }
        } catch (e) {
          console.log(`No se pudieron cargar activos del usuario ${user.username}`);
        }
      }
      
      setAssets(allAssets);
      setMessage(`✅ Se cargaron ${allAssets.length} activos únicos`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ Error al cargar activos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar todos los certificados
  const loadCertificates = async () => {
    if (!provider || !contractAddress) return;
    setLoading(true);
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, provider);
      const allCerts = [];
      const processedAssetIds = new Set(); // Rastrear IDs únicos
      const processedCertIds = new Set(); // Rastrear certificados únicos
      
      // Cargar certificados de todos los activos
      const allUsers = await contract.getAllUsers();
      
      for (const user of allUsers) {
        try {
          const userAssets = await contract.getUserAssets(user.activeWallet);
          for (const assetId of userAssets) {
            const assetIdNum = Number(assetId);
            // Solo procesar si no lo hemos visto antes
            if (!processedAssetIds.has(assetIdNum)) {
              processedAssetIds.add(assetIdNum);
              try {
                const certIds = await contract.getCertificatesByAsset(assetId);
                for (const certId of certIds) {
                  const certIdNum = Number(certId);
                  // Solo procesar certificado si no lo hemos visto
                  if (!processedCertIds.has(certIdNum)) {
                    processedCertIds.add(certIdNum);
                    const cert = await contract.getCertificate(certId);
                    allCerts.push({
                      ...cert,
                      id: certIdNum,
                      assetId: assetIdNum,
                      certType: cert.certType || 'Desconocido',
                      expiresAt: cert.expiresAt || 0,
                      revoked: cert.revoked || false,
                    });
                  }
                }
              } catch (e) {
                console.log(`No se pudieron cargar certificados del activo ${assetIdNum}`);
              }
            }
          }
        } catch (e) {
          // Sin activos para este usuario
        }
      }
      
      setCertificates(allCerts);
      console.log('Certificados cargados:', allCerts.map(c => ({ id: c.id, certType: c.certType, revoked: c.revoked })));
      setMessage(`✅ Se cargaron ${allCerts.length} certificados`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ Error al cargar certificados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar todos los usuarios
  const loadUsers = async () => {
    if (!provider || !contractAddress) return;
    setLoading(true);
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, provider);
      const allUsers = await contract.getAllUsers();
      
      const usersFormatted = allUsers.map(user => ({
        username: user.username,
        role: user.role,
        activeWallet: user.activeWallet,
        registeredAt: Number(user.registeredAt),
        active: Boolean(user.active)
      }));
      
      setUsers(usersFormatted);
      setMessage(`✅ Se cargaron ${usersFormatted.length} usuarios`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ Error al cargar usuarios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Ver certificados de un activo
  const viewAssetCertificates = async (assetId) => {
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, provider);
      const certIds = await contract.getCertificatesByAsset(assetId);
      
      const certs = [];
      for (const certId of certIds) {
        const cert = await contract.getCertificate(certId);
        certs.push({
          id: Number(certId),
          ...cert
        });
      }
      
      setAssetCerts(certs);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  // Generar reporte
  const generateReport = async () => {
    setLoading(true);
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, provider);
      
      const totalAssets = assets.length;
      const totalUsers = users.length;
      
      const assetsByStatus = {
        Activo: assets.filter(a => a.status === 'Activo').length,
        Inactivo: assets.filter(a => a.status === 'Inactivo').length,
        Revocado: assets.filter(a => a.status === 'Revocado').length,
      };
      
      const now = Math.floor(Date.now() / 1000);
      const totalCerts = certificates.length; // Total de certificados generados
      const revokedCerts = certificates.filter(c => c.revoked === true).length;
      const expiredCerts = certificates.filter(c => Number(c.expiresAt) < now && c.revoked !== true).length;
      const activeCerts = totalCerts - revokedCerts - expiredCerts; // Total menos revocados y expirados
      
      // Obtener todos los tipos de certificado que existen en los datos
      const actualCertTypes = new Set(certificates.map(c => c.certType));
      const allCertTypes = Array.from(actualCertTypes);
      
      const certsByType = {};
      allCertTypes.forEach(type => {
        if (type) {
          certsByType[type] = {
            total: certificates.filter(c => c.certType === type).length,
            activos: certificates.filter(c => c.certType === type && Number(c.expiresAt) >= now && c.revoked !== true).length,
            revocados: certificates.filter(c => c.certType === type && c.revoked === true).length,
            expirados: certificates.filter(c => c.certType === type && Number(c.expiresAt) < now && c.revoked !== true).length
          };
        }
      });
      
      const usersByRole = {};
      roles.forEach(role => {
        usersByRole[role] = users.filter(u => u.role === role).length;
      });
      
      setReportData({
        generatedAt: new Date().toLocaleString('es-ES'),
        totalAssets,
        totalCerts,
        totalUsers,
        assetsByStatus,
        certsByType,
        usersByRole,
        revokedCerts,
        expiredCerts,
        activeCerts
      });
      
      setMessage('✅ Reporte generado exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Descargar reporte como JSON
  const downloadReport = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-auditoria-${new Date().getTime()}.json`;
    link.click();
  };

  // Filtrar activos
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchAssetId || asset.id.toString().includes(searchAssetId);
    const matchesType = !filterAssetType || asset.assetType === filterAssetType;
    const matchesStatus = !filterAssetStatus || asset.status === filterAssetStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Filtrar certificados
  const filteredCerts = certificates.filter(cert => {
    const matchesSearch = !searchCertId || cert.id.toString().includes(searchCertId);
    const matchesType = !filterCertType || cert.certType === filterCertType;
    const now = Math.floor(Date.now() / 1000);
    const isExpired = Number(cert.expiresAt) < now;
    const matchesStatus = !filterCertStatus || 
      (filterCertStatus === 'Expirado' && isExpired) ||
      (filterCertStatus === 'Activo' && !isExpired && cert.status === 'Activo') ||
      (filterCertStatus === 'Revocado' && cert.status === 'Revocado');
    return matchesSearch && matchesType && matchesStatus;
  });

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchUsername || user.username.toLowerCase().includes(searchUsername.toLowerCase());
    const matchesRole = !filterUserRole || user.role === filterUserRole;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    loadAssets();
    loadCertificates();
    loadUsers();
  }, [provider, contractAddress]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const ms = typeof timestamp === 'bigint' ? Number(timestamp) * 1000 : timestamp * 1000;
      return new Date(ms).toLocaleString('es-ES');
    } catch (e) {
      return '-';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Activo': '#22c55e',
      'Inactivo': '#6b7280',
      'Revocado': '#ef4444',
      'Expirado': '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="card">
      <h2>🔍 Panel de Auditoría</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Auditor: <strong>{currentUser?.username}</strong> | Consulta y audita todos los datos del sistema</p>

      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2',
          color: message.includes('✅') ? '#166534' : '#7f1d1d',
          borderRadius: '4px',
          border: `1px solid ${message.includes('✅') ? '#86efac' : '#fca5a5'}`
        }}>
          {message}
        </div>
      )}

      <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setActiveTab('assets'); loadAssets(); }}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'assets' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'assets' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📦 Activos ({assets.length})
        </button>
        <button
          onClick={() => { setActiveTab('certificates'); loadCertificates(); }}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'certificates' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'certificates' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ✅ Certificados ({certificates.length})
        </button>
        <button
          onClick={() => { setActiveTab('users'); loadUsers(); }}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'users' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'users' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          👥 Usuarios ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'reports' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'reports' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📊 Reportes
        </button>
      </nav>

      {/* TAB: ACTIVOS */}
      {activeTab === 'assets' && (
        <div>
          <h3>📦 Auditoría de Activos</h3>
          
          {/* Filtros */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <input
              type="number"
              placeholder="🔍 Buscar por ID"
              value={searchAssetId}
              onChange={(e) => setSearchAssetId(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
            <select
              value={filterAssetType}
              onChange={(e) => setFilterAssetType(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="">Todos los tipos</option>
              {assetTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select
              value={filterAssetStatus}
              onChange={(e) => setFilterAssetStatus(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="">Todos los estados</option>
              {statuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>

          {/* Tabla de Activos */}
          {filteredAssets.length > 0 ? (
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
                    <th style={{ padding: '10px', textAlign: 'left' }}>Propietario</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Fecha Registro</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px' }}><strong>{asset.id}</strong></td>
                      <td style={{ padding: '10px' }}>{asset.assetType}</td>
                      <td style={{ padding: '10px' }}>{asset.description ? asset.description.substring(0, 40) + (asset.description.length > 40 ? '...' : '') : '-'}</td>
                      <td style={{ padding: '10px' }}>{asset.owner}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          backgroundColor: getStatusColor(asset.status) + '20',
                          color: getStatusColor(asset.status),
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold'
                        }}>
                          {asset.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>{formatDate(asset.registeredAt)}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            viewAssetCertificates(asset.id);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              {loading ? (
                <>
                  <p style={{ fontSize: '18px', marginBottom: '10px' }}>⏳ Cargando activos...</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>Por favor espera mientras se cargan los datos del sistema</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '16px', marginBottom: '10px' }}>📦 No hay activos para mostrar</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>No se encontraron activos con los criterios de búsqueda</p>
                </>
              )}
            </div>
          )}

          {/* Modal de Detalles */}
          {selectedAsset && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
                width: '90%'
              }}>
                <h3>📦 Detalles del Activo #{selectedAsset.id}</h3>
                <div style={{ marginBottom: '20px' }}>
                  <p><strong>Tipo:</strong> {selectedAsset.assetType}</p>
                  <p><strong>Descripción:</strong> {selectedAsset.description}</p>
                  <p><strong>Propietario:</strong> {selectedAsset.owner}</p>
                  <p><strong>Estado:</strong> <span style={{ color: getStatusColor(selectedAsset.status), fontWeight: 'bold' }}>{selectedAsset.status}</span></p>
                  <p><strong>Registrado:</strong> {formatDate(selectedAsset.registeredAt)}</p>
                </div>

                <h4>Certificaciones ({assetCerts.length})</h4>
                {assetCerts.length > 0 ? (
                  <div style={{ marginBottom: '20px' }}>
                    {assetCerts.map((cert, idx) => (
                      <div key={idx} style={{
                        padding: '10px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}>
                        <p><strong>Cert #{cert.id}</strong> - {cert.certType}</p>
                        <p style={{ fontSize: '12px', color: '#666' }}>Vencimiento: {formatDate(cert.expiresAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280' }}>Sin certificaciones</p>
                )}

                <button
                  onClick={() => setSelectedAsset(null)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: CERTIFICADOS */}
      {activeTab === 'certificates' && (
        <div>
          <h3>✅ Auditoría de Certificados</h3>
          
          {/* Filtros */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <input
              type="number"
              placeholder="🔍 Buscar por ID"
              value={searchCertId}
              onChange={(e) => setSearchCertId(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
            <select
              value={filterCertType}
              onChange={(e) => setFilterCertType(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="">Todos los tipos</option>
              {certificateTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select
              value={filterCertStatus}
              onChange={(e) => setFilterCertStatus(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Expirado">Expirado</option>
              <option value="Revocado">Revocado</option>
            </select>
          </div>

          {/* Tabla de Certificados */}
          {filteredCerts.length > 0 ? (
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
                    <th style={{ padding: '10px', textAlign: 'left' }}>Activo ID</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Vencimiento</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Expedición</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCerts.map((cert, idx) => {
                    const now = Math.floor(Date.now() / 1000);
                    const isExpired = Number(cert.expiresAt) < now;
                    const status = isExpired ? 'Expirado' : (cert.status === 'Revocado' ? 'Revocado' : 'Activo');
                    
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '10px' }}><strong>{cert.id}</strong></td>
                        <td style={{ padding: '10px' }}>{cert.certType}</td>
                        <td style={{ padding: '10px' }}>{cert.assetId}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            backgroundColor: getStatusColor(status) + '20',
                            color: getStatusColor(status),
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>{formatDate(cert.expiresAt)}</td>
                        <td style={{ padding: '10px' }}>{formatDate(cert.issuedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              {loading ? (
                <>
                  <p style={{ fontSize: '18px', marginBottom: '10px' }}>⏳ Cargando certificados...</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>Por favor espera mientras se cargan los datos del sistema</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '16px', marginBottom: '10px' }}>✅ No hay certificados para mostrar</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>No se encontraron certificados con los criterios de búsqueda</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: USUARIOS */}
      {activeTab === 'users' && (
        <div>
          <h3>👥 Auditoría de Usuarios</h3>
          
          {/* Filtros */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <input
              type="text"
              placeholder="🔍 Buscar por usuario"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
            <select
              value={filterUserRole}
              onChange={(e) => setFilterUserRole(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="">Todos los roles</option>
              {roles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>

          {/* Tabla de Usuarios */}
          {filteredUsers.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Usuario</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Rol</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Wallet</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Registrado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px' }}><strong>{user.username}</strong></td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          backgroundColor: '#3b82f6' + '20',
                          color: '#3b82f6',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '11px'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {user.activeWallet && user.activeWallet !== '0x0000000000000000000000000000000000000000' ? user.activeWallet : 'Sin vinculación'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          backgroundColor: user.active ? '#22c55e20' : '#ef444420',
                          color: user.active ? '#22c55e' : '#ef4444',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold'
                        }}>
                          {user.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>{formatDate(user.registeredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              {loading ? (
                <>
                  <p style={{ fontSize: '18px', marginBottom: '10px' }}>⏳ Cargando usuarios...</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>Por favor espera mientras se cargan los datos del sistema</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '16px', marginBottom: '10px' }}>👥 No hay usuarios para mostrar</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>No se encontraron usuarios con los criterios de búsqueda</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: REPORTES */}
      {activeTab === 'reports' && (
        <div>
          <h3>📊 Reportes de Auditoría</h3>
          
          <button
            onClick={generateReport}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}
          >
            {loading ? '⏳ Generando...' : '📊 Generar Reporte General'}
          </button>

          {reportData && (
            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #22c55e'
            }}>
              <h4>📋 Reporte de Auditoría del Sistema</h4>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Generado: {reportData.generatedAt}</p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px',
                marginBottom: '20px',
                marginTop: '15px'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', margin: '0' }}>{reportData.totalUsers}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '5px 0 0 0' }}>Usuarios del Sistema</p>
                </div>
                <div style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4', margin: '0' }}>{reportData.totalCerts}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '5px 0 0 0' }}>Certificados Totales</p>
                </div>
                <div style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: '0' }}>{reportData.activeCerts}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '5px 0 0 0' }}>Certificados Activos</p>
                </div>
                <div style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', margin: '0' }}>{reportData.revokedCerts}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '5px 0 0 0' }}>Certificados Revocados</p>
                </div>
                <div style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', margin: '0' }}>{reportData.expiredCerts}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '5px 0 0 0' }}>Certificados Expirados</p>
                </div>
                <div style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', margin: '0' }}>{reportData.totalAssets}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '5px 0 0 0' }}>Activos Totales</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h5 style={{ marginTop: 0 }}>Certificados por Estado</h5>
                  <p style={{ fontSize: '12px', margin: '8px 0' }}>
                    <strong style={{ color: '#10b981' }}>✓ Activos:</strong> {reportData.activeCerts}
                  </p>
                  <p style={{ fontSize: '12px', margin: '8px 0' }}>
                    <strong style={{ color: '#dc2626' }}>✕ Revocados:</strong> {reportData.revokedCerts}
                  </p>
                  <p style={{ fontSize: '12px', margin: '8px 0' }}>
                    <strong style={{ color: '#f59e0b' }}>⏱ Expirados:</strong> {reportData.expiredCerts}
                  </p>
                  <p style={{ fontSize: '12px', margin: '12px 0 0 0', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                    <strong>Total:</strong> {reportData.totalCerts}
                  </p>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h5 style={{ marginTop: 0 }}>Certificados por Tipo y Estado</h5>
                  {Object.entries(reportData.certsByType).filter(([, data]) => data.total > 0).length > 0 ? (
                    Object.entries(reportData.certsByType).filter(([, data]) => data.total > 0).map(([type, data]) => (
                      <div key={type} style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                        <strong style={{ fontSize: '13px' }}>{type}</strong>
                        <div style={{ fontSize: '12px', marginLeft: '10px', marginTop: '4px' }}>
                          <p style={{ margin: '2px 0', color: '#10b981' }}>✓ Activos: {data.activos}</p>
                          <p style={{ margin: '2px 0', color: '#dc2626' }}>✕ Revocados: {data.revocados}</p>
                          <p style={{ margin: '2px 0', color: '#f59e0b' }}>⏱ Expirados: {data.expirados}</p>
                          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '11px' }}>Total: {data.total}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>Sin certificados registrados</p>
                  )}
                </div>

                <div style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h5 style={{ marginTop: 0 }}>Usuarios por Rol</h5>
                  {Object.entries(reportData.usersByRole).filter(([, count]) => count > 0).map(([role, count]) => (
                    <p key={role} style={{ fontSize: '12px', margin: '8px 0' }}>
                      <strong>{role}:</strong> {count}
                    </p>
                  ))}
                </div>
              </div>

              <button
                onClick={downloadReport}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ⬇️ Descargar Reporte (JSON)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
