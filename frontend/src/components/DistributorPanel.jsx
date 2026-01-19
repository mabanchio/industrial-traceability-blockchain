import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function DistributorPanel({ provider, signer, contractAddress, currentUser }) {
  const [activeTab, setActiveTab] = useState('assets');
  const [assets, setAssets] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchAsset, setSearchAsset] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reportData, setReportData] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDistributorData();
  }, []);

  const loadDistributorData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!signer || !contractAddress) {
        setError('Configuración incompleta. Por favor, verifica la conexión.');
        setLoading(false);
        return;
      }

      const { CONTRACT_ABI } = await import('../config/abi.js');
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      // Obtener activos del usuario distribuidor
      const signerAddress = await signer.getAddress();
      const userAssets = await contract.getUserAssets(signerAddress);

      // Obtener detalles de cada activo
      const assetsData = [];
      const certificatesMap = {};

      for (const assetId of userAssets) {
        try {
          const asset = await contract.getAsset(assetId);
          assetsData.push({
            assetId: Number(assetId),
            ...asset,
            owner: asset.owner,
            active: asset.active,
            assetType: asset.assetType,
            description: asset.description,
          });

          // Obtener certificados para este activo
          const certs = await contract.getCertificatesByAsset(assetId);
          const certificatesForAsset = [];

          for (const certId of certs) {
            try {
              const cert = await contract.getCertificate(certId);
              const isValid = await contract.isCertificateValid(certId);
              certificatesForAsset.push({
                certId: Number(certId),
                assetId: Number(assetId),
                issuedAt: new Date(Number(cert.issuedAt) * 1000),
                expiresAt: new Date(Number(cert.expiresAt) * 1000),
                issuer: cert.issuer,
                revoked: cert.revoked,
                certType: cert.certType,
                isValid: isValid,
              });
            } catch (certErr) {
              console.warn(`Error cargando certificado ${certId}:`, certErr.message);
            }
          }

          certificatesMap[Number(assetId)] = certificatesForAsset;
        } catch (assetErr) {
          console.warn(`Error cargando activo ${assetId}:`, assetErr.message);
        }
      }

      setAssets(assetsData);
      setCertificates(certificatesMap);
      setSuccess('✅ Datos cargados correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(`Error al cargar datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getAssetStatusColor = (active) => {
    return active ? '#10b981' : '#ef4444';
  };

  const getCertificateStatusColor = (isValid) => {
    return isValid ? '#10b981' : '#ef4444';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.assetType.toLowerCase().includes(searchAsset.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchAsset.toLowerCase()) ||
      asset.assetId.toString().includes(searchAsset);
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && asset.active) ||
      (filterStatus === 'inactive' && !asset.active);

    return matchesSearch && matchesStatus;
  });

  const generateReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      distributor: currentUser?.username,
      totalAssets: assets.length,
      activeAssets: assets.filter(a => a.active).length,
      inactiveAssets: assets.filter(a => !a.active).length,
      totalCertificates: Object.values(certificates).reduce((sum, certs) => sum + certs.length, 0),
      validCertificates: Object.values(certificates).reduce((sum, certs) => sum + certs.filter(c => c.isValid).length, 0),
      expiredCertificates: Object.values(certificates).reduce((sum, certs) => sum + certs.filter(c => !c.isValid && !c.revoked).length, 0),
      revokedCertificates: Object.values(certificates).reduce((sum, certs) => sum + certs.filter(c => c.revoked).length, 0),
      assets: assets.map(a => ({
        assetId: a.assetId,
        type: a.assetType,
        description: a.description,
        active: a.active,
        certificates: certificates[a.assetId] ? certificates[a.assetId].length : 0,
        validCerts: certificates[a.assetId] ? certificates[a.assetId].filter(c => c.isValid).length : 0,
      })),
    };

    setReportData(report);
    return report;
  };

  const downloadReport = () => {
    const report = reportData || generateReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `reporte-distribuidor-${new Date().getTime()}.json`;
    link.click();
  };

  const handleRefresh = async () => {
    setError('');
    setSuccess('');
    await loadDistributorData();
  };

  return (
    <div className="card">
      <h2>📦 Panel del Distribuidor</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Distribuidor: <strong>{currentUser?.username}</strong> | Gestiona y audita tus activos y certificaciones
      </p>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '4px', marginBottom: '15px', borderLeft: '4px solid #ef4444' }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '4px', marginBottom: '15px', borderLeft: '4px solid #22c55e' }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          style={{ 
            padding: '8px 16px',
            backgroundColor: loading ? '#ccc' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
        <button
          className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          📦 Mis Activos
        </button>
        <button
          className={`tab ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          ✅ Certificaciones
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📊 Reportes
        </button>
      </div>

      {/* TAB: MIS ACTIVOS */}
      {activeTab === 'assets' && (
        <div>
          <h3>📦 Mis Activos</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="🔍 Buscar por tipo, descripción o ID..."
              value={searchAsset}
              onChange={(e) => setSearchAsset(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '15px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: '15px',
            textAlign: 'center'
          }}>
            <div>
              <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>TOTAL ACTIVOS</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {assets.length}
              </p>
            </div>
            <div>
              <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>ACTIVOS</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {assets.filter(a => a.active).length}
              </p>
            </div>
            <div>
              <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>INACTIVOS</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                {assets.filter(a => !a.active).length}
              </p>
            </div>
            <div>
              <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>CERTIFICADOS</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                {Object.values(certificates).reduce((sum, certs) => sum + certs.length, 0)}
              </p>
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
              {assets.length === 0 ? '📦 No tienes activos registrados' : '🔍 No se encontraron activos que coincidan con tu búsqueda'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Tipo</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Descripción</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Certificados</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                      #{asset.assetId}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: '#e0e7ff', padding: '4px 8px', borderRadius: '3px', fontSize: '12px' }}>
                        {asset.assetType}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {asset.description}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ 
                        backgroundColor: asset.active ? '#dcfce7' : '#fee2e2',
                        color: asset.active ? '#166534' : '#991b1b',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {asset.active ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#3b82f6' }}>
                      {certificates[asset.assetId]?.length || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB: CERTIFICACIONES */}
      {activeTab === 'certificates' && (
        <div>
          <h3>✅ Certificaciones</h3>
          
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '15px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: '15px',
            textAlign: 'center'
          }}>
            <div>
              <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>TOTAL CERTIFICADOS</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {Object.values(certificates).reduce((sum, certs) => sum + certs.length, 0)}
              </p>
            </div>
            <div>
              <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>VÁLIDOS</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {Object.values(certificates).reduce((sum, certs) => sum + certs.filter(c => c.isValid).length, 0)}
              </p>
            </div>
            <div>
              <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>EXPIRADOS</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {Object.values(certificates).reduce((sum, certs) => sum + certs.filter(c => !c.isValid && !c.revoked).length, 0)}
              </p>
            </div>
            <div>
              <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>REVOCADOS</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                {Object.values(certificates).reduce((sum, certs) => sum + certs.filter(c => c.revoked).length, 0)}
              </p>
            </div>
          </div>

          {assets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
              📦 No tienes activos con certificaciones
            </div>
          ) : (
            assets.map((asset) => (
              certificates[asset.assetId]?.length > 0 && (
                <div key={asset.assetId} style={{ marginBottom: '20px', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#f3f4f6', padding: '12px', borderBottom: '1px solid #d1d5db' }}>
                    <h4 style={{ margin: '0' }}>
                      Activo #{asset.assetId} - {asset.assetType}
                    </h4>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                      {asset.description}
                    </p>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #d1d5db' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>ID Cert.</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Tipo</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Emitido</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>Expira</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates[asset.assetId].map((cert, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '11px' }}>#{cert.certId}</td>
                          <td style={{ padding: '10px', fontSize: '12px' }}>{cert.certType}</td>
                          <td style={{ padding: '10px', fontSize: '11px' }}>{formatDate(cert.issuedAt)}</td>
                          <td style={{ padding: '10px', fontSize: '11px' }}>{formatDate(cert.expiresAt)}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            {cert.revoked ? (
                              <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '12px' }}>🚫 Revocado</span>
                            ) : cert.isValid ? (
                              <span style={{ color: '#10b981', fontWeight: '600', fontSize: '12px' }}>✅ Válido</span>
                            ) : (
                              <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '12px' }}>⏰ Expirado</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ))
          )}
        </div>
      )}

      {/* TAB: REPORTES */}
      {activeTab === 'reports' && (
        <div>
          <h3>📊 Reportes</h3>
          
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => generateReport()}
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              📋 Generar Reporte
            </button>
            {reportData && (
              <button 
                onClick={downloadReport}
                style={{ 
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ⬇️ Descargar JSON
              </button>
            )}
          </div>

          {reportData && (
            <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
              <h4>📊 Resumen del Reporte</h4>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Generado: {new Date(reportData.generatedAt).toLocaleString('es-ES')}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                  <p style={{ margin: '0', color: '#666', fontSize: '12px', fontWeight: '600' }}>TOTAL ACTIVOS</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                    {reportData.totalAssets}
                  </p>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                  <p style={{ margin: '0', color: '#666', fontSize: '12px', fontWeight: '600' }}>TOTAL CERTIFICADOS</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
                    {reportData.totalCertificates}
                  </p>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                  <p style={{ margin: '0', color: '#666', fontSize: '12px', fontWeight: '600' }}>CERTIFICADOS VÁLIDOS</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                    {reportData.validCertificates}
                  </p>
                </div>
              </div>

              <div style={{ 
                backgroundColor: '#fff', 
                padding: '15px', 
                borderRadius: '4px', 
                border: '1px solid #d1d5db',
                fontSize: '12px'
              }}>
                <p style={{ margin: '0', fontWeight: '600', marginBottom: '10px' }}>📈 Estadísticas Detalladas</p>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                  <li>Activos Activos: {reportData.activeAssets}</li>
                  <li>Activos Inactivos: {reportData.inactiveAssets}</li>
                  <li>Certificados Válidos: {reportData.validCertificates}</li>
                  <li>Certificados Expirados: {reportData.expiredCertificates}</li>
                  <li>Certificados Revocados: {reportData.revokedCertificates}</li>
                </ul>
              </div>

              <div style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto', backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                <p style={{ margin: '0', fontWeight: '600', marginBottom: '10px', fontSize: '12px' }}>📋 Detalle de Activos</p>
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #d1d5db' }}>
                      <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>ID</th>
                      <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600' }}>Tipo</th>
                      <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                      <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600' }}>Certs</th>
                      <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600' }}>Válidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.assets.map((a, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px' }}>#{a.assetId}</td>
                        <td style={{ padding: '8px' }}>{a.type}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={{ fontSize: '10px' }}>
                            {a.active ? '✅' : '❌'}
                          </span>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{a.certificates}</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#10b981', fontWeight: '600' }}>
                          {a.validCerts}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
