import React, { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { CONTRACT_ABI } from '../config/abi';

export default function CertificateManager({ signer, contractAddress }) {
  // Tipos de certificados disponibles con descripciones
  const CERTIFICATE_TYPES = {
    'ISO-9001': {
      label: 'ISO 9001',
      description: 'Sistema de Gestión de Calidad. Establece los requisitos para que una organización demuestre su capacidad de proporcionar productos y servicios de forma consistente.'
    },
    'ISO-14001': {
      label: 'ISO 14001',
      description: 'Sistema de Gestión Ambiental. Ayuda a las organizaciones a mejorar el desempeño ambiental mediante la gestión sistemática de los aspectos ambientales.'
    },
    'ISO-27001': {
      label: 'ISO 27001',
      description: 'Sistema de Gestión de Seguridad de la Información. Especifica los requisitos para establecer, implementar y mantener un SGSI efectivo.'
    },
    'ISO-45001': {
      label: 'ISO 45001',
      description: 'Sistema de Gestión de Seguridad y Salud en el Trabajo. Proporciona un marco para gestionar los riesgos y oportunidades de la SST.'
    },
    'ISO-50001': {
      label: 'ISO 50001',
      description: 'Sistema de Gestión de Energía. Permite a las organizaciones establecer sistemas para mejorar el rendimiento energético.'
    },
    'SOC-2': {
      label: 'SOC 2',
      description: 'Informe de Controles de Servicio. Evalúa los controles internos de una organización relacionados con seguridad, disponibilidad e integridad.'
    },
    'GDPR': {
      label: 'GDPR',
      description: 'Regulación General de Protección de Datos. Certificación de cumplimiento con regulaciones de protección de datos personales en la UE.'
    },
    'HIPAA': {
      label: 'HIPAA',
      description: 'Ley de Portabilidad y Responsabilidad de Seguros de Salud. Protege la privacidad e integridad de la información sanitaria.'
    },
    'PCI-DSS': {
      label: 'PCI DSS',
      description: 'Estándar de Seguridad de Datos de la Industria de Tarjetas de Pago. Requisitos de seguridad para procesar tarjetas de crédito.'
    },
    'RoHS': {
      label: 'RoHS',
      description: 'Restricción de Sustancias Peligrosas. Directiva europea que restringe el uso de sustancias peligrosas en equipos eléctricos y electrónicos.'
    },
    'CE': {
      label: 'Marcado CE',
      description: 'Conformidad Europea. Indicador de que un producto cumple con la legislación de seguridad de la UE aplicable.'
    },
    'CUSTOM': {
      label: 'Certificado Personalizado',
      description: 'Tipo de certificado personalizado según las necesidades específicas de su organización.'
    }
  };

  const [assetId, setAssetId] = useState('');
  const [certType, setCertType] = useState('ISO-9001');
  const [daysValid, setDaysValid] = useState('365');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Estados para búsqueda de activos
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAssetDetails, setSelectedAssetDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [showAssetList, setShowAssetList] = useState(false);

  // Estados para búsqueda y listado de certificados
  const [allCertificates, setAllCertificates] = useState([]);
  const [searchCertQuery, setSearchCertQuery] = useState('');
  const [filterCertStatus, setFilterCertStatus] = useState('');
  const [showCertificatesList, setShowCertificatesList] = useState(true);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [expandedCertId, setExpandedCertId] = useState(null);

  // Cargar activos disponibles y certificados cuando monta el componente
  useEffect(() => {
    loadAvailableAssets();
    loadAllCertificates();
  }, []);

  // Filtrar activos cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAssets(availableAssets);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = availableAssets.filter(asset => 
        asset.id.toString().includes(query) ||
        (asset.assetType && asset.assetType.toLowerCase().includes(query)) ||
        (asset.description && asset.description.toLowerCase().includes(query))
      );
      setFilteredAssets(filtered);
    }
  }, [searchQuery, availableAssets]);

  const loadAvailableAssets = async () => {
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      const assets = [];
      
      for (let i = 1; i <= 100; i++) {
        try {
          const asset = await contract.getAsset(i);
          if (asset && asset.active) {
            assets.push({
              id: i,
              assetType: asset.assetType || 'Desconocido',
              description: asset.description || '',
              owner: asset.owner,
              active: asset.active
            });
          }
        } catch (e) {
          // Asset no existe, continuar
        }
      }
      
      setAvailableAssets(assets);
      setFilteredAssets(assets);
    } catch (err) {
      console.warn('Error cargando activos:', err.message);
    }
  };

  const loadAllCertificates = async () => {
    setCertificatesLoading(true);
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      const certs = [];
      
      // Buscar certificados iterando desde ID 1
      for (let i = 1; i <= 200; i++) {
        try {
          const cert = await contract.getCertificate(i);
          if (cert && cert.certId) {
            certs.push({
              certId: i,
              assetId: cert.assetId ? cert.assetId.toString() : 'N/A',
              certType: cert.certType || 'Desconocido',
              issuer: cert.issuer,
              issuedAt: cert.issuedAt ? Number(cert.issuedAt) : 0,
              expiresAt: cert.expiresAt ? Number(cert.expiresAt) : 0,
              revoked: cert.revoked || false
            });
          }
        } catch (e) {
          // Certificado no existe, continuar sin hacer nada
        }
      }
      
      // Actualizar state solo si hay cambios
      setAllCertificates(certs.sort((a, b) => b.certId - a.certId)); // Más recientes primero
    } catch (err) {
      console.warn('Error cargando certificados:', err.message);
      // No limpiar allCertificates en caso de error para mantener datos anteriores
    } finally {
      setCertificatesLoading(false);
    }
  };

  // Filtrar certificados según búsqueda y estado
  const getFilteredCertificates = () => {
    return allCertificates.filter(cert => {
      const statusMatch = !filterCertStatus || 
        (filterCertStatus === 'active' ? !cert.revoked : cert.revoked);
      const searchMatch = !searchCertQuery || 
        cert.certId.toString().includes(searchCertQuery) ||
        cert.assetId.toString().includes(searchCertQuery) ||
        cert.certType.toLowerCase().includes(searchCertQuery.toLowerCase());
      return statusMatch && searchMatch;
    });
  };

  const selectAsset = (asset) => {
    setAssetId(asset.id.toString());
    setSelectedAssetDetails(asset);
    setShowAssetList(false);
    setSearchQuery('');
  };

  const issueCertificate = async (e) => {
    e.preventDefault();
    if (!assetId || !daysValid) {
      alert('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + parseInt(daysValid) * 86400;

      const tx = await contract.issueCertificate(assetId, expiresAt, certType);
      const receipt = await tx.wait();
      const txHash = receipt?.hash || receipt?.transactionHash || tx?.hash || 'desconocido';
      setMessage(`✅ Certificado emitido. Tx: ${txHash.substring(0, 10)}...`);
      setAssetId('');
      setDaysValid('365');
      setSelectedAssetDetails(null);
      
      // Recargar lista de certificados después de 1 segundo
      setTimeout(() => {
        loadAllCertificates();
      }, 1000);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const revokeCertificateAction = async (certIdToRevoke) => {
    setLoading(true);
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      const tx = await contract.revokeCertificate(certIdToRevoke);
      await tx.wait();
      setMessage(`✅ Certificado ${certIdToRevoke} revocado`);
      
      // Recargar lista de certificados después de 1 segundo
      setTimeout(() => {
        loadAllCertificates();
      }, 1000);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>🔐 Gestión de Certificaciones</h2>

      <div className="form-section">
        <h3>📦 Emitir Certificación</h3>
        
        {/* BÚSQUEDA Y SELECCIÓN DE ACTIVO */}
        <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
          <label><strong>1. Selecciona un Activo</strong></label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Busca por ID, tipo o descripción..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAssetList(true);
              }}
              onFocus={() => setShowAssetList(true)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            
            {/* LISTA DE ACTIVOS FILTRADOS */}
            {showAssetList && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                border: '1px solid #ccc',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                backgroundColor: 'white',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => selectAsset(asset)}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: assetId === asset.id.toString() ? '#e3f2fd' : 'white'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = assetId === asset.id.toString() ? '#e3f2fd' : 'white'}
                    >
                      <strong>ID: {asset.id}</strong> - {asset.assetType}
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                        {asset.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', color: '#999' }}>
                    No hay activos disponibles
                  </div>
                )}
              </div>
            )}
            
            {/* DETALLES DEL ACTIVO SELECCIONADO */}
            {selectedAssetDetails && (
              <div style={{
                marginTop: '10px',
                padding: '12px',
                backgroundColor: '#e8f5e9',
                border: '1px solid #4caf50',
                borderRadius: '4px'
              }}>
                <strong>✅ Activo Seleccionado:</strong>
                <p style={{ margin: '5px 0' }}>ID: {selectedAssetDetails.id}</p>
                <p style={{ margin: '5px 0' }}>Tipo: {selectedAssetDetails.assetType}</p>
                <p style={{ margin: '5px 0' }}>Descripción: {selectedAssetDetails.description}</p>
              </div>
            )}
          </div>

          {/* FORM PARA EMITIR CERTIFICADO */}
          <form onSubmit={issueCertificate} style={{ marginTop: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ gridColumn: '1 / 4' }}>
                <label><strong>Tipo de Certificado</strong></label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }}
                >
                  <option value="ISO-9001">ISO 9001 - Sistema de Gestión de Calidad</option>
                  <option value="ISO-14001">ISO 14001 - Sistema de Gestión Ambiental</option>
                  <option value="ISO-27001">ISO 27001 - Sistema de Gestión de Seguridad de la Información</option>
                  <option value="ISO-45001">ISO 45001 - Sistema de Gestión de Seguridad y Salud en el Trabajo</option>
                  <option value="ISO-50001">ISO 50001 - Sistema de Gestión de Energía</option>
                  <option value="SOC-2">SOC 2 - Informe de Controles de Servicio</option>
                  <option value="GDPR">GDPR - Regulación General de Protección de Datos</option>
                  <option value="HIPAA">HIPAA - Ley de Portabilidad y Responsabilidad de Seguros de Salud</option>
                  <option value="PCI-DSS">PCI DSS - Estándar de Seguridad de Datos de la Industria de Tarjetas</option>
                  <option value="RoHS">RoHS - Restricción de Sustancias Peligrosas</option>
                  <option value="CE">Marcado CE - Conformidad Europea</option>
                  <option value="CUSTOM">Certificado Personalizado</option>
                </select>
                {CERTIFICATE_TYPES[certType] && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#f0f7ff',
                    border: '1px solid #3b82f6',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#1e40af',
                    lineHeight: '1.5'
                  }}>
                    <strong>ℹ️ {CERTIFICATE_TYPES[certType].label}:</strong>
                    <p style={{ margin: '5px 0 0 0' }}>{CERTIFICATE_TYPES[certType].description}</p>
                  </div>
                )}
              </div>
              <div>
                <label><strong>Válido por (días)</strong></label>
                <input
                  type="number"
                  value={daysValid}
                  onChange={(e) => setDaysValid(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !assetId}
                style={{
                  padding: '8px 16px',
                  backgroundColor: loading || !assetId ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading || !assetId ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  marginTop: '33px',
                  height: '36px'
                }}
              >
                {loading ? '⏳ Emitiendo...' : '✅ Emitir'}
              </button>
            </div>
          </form>
        </div>

        {message && (
          <p style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e9',
            color: message.includes('❌') ? '#c62828' : '#2e7d32',
            borderRadius: '4px'
          }}>
            {message}
          </p>
        )}
      </div>

      {/* LISTA DE CERTIFICADOS */}
      <div className="form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0 }}>📋 Certificados ({getFilteredCertificates().length})</h3>
          <button
            onClick={() => setShowCertificatesList(!showCertificatesList)}
            style={{
              padding: '8px 16px',
              backgroundColor: showCertificatesList ? '#3b82f6' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showCertificatesList ? '▼ Ocultar' : '▶ Mostrar'}
          </button>
        </div>

        {showCertificatesList && (
          <>
            {/* FILTROS Y BÚSQUEDA */}
            <div style={{ 
              marginBottom: '15px', 
              padding: '15px', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>🔍 Buscar:</label>
                  <input
                    type="text"
                    placeholder="Por ID, AssetID o tipo..."
                    value={searchCertQuery}
                    onChange={(e) => setSearchCertQuery(e.target.value)}
                    style={{
                      marginTop: '5px',
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>Estado:</label>
                  <select
                    value={filterCertStatus}
                    onChange={(e) => setFilterCertStatus(e.target.value)}
                    style={{
                      marginTop: '5px',
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">📊 Todos</option>
                    <option value="active">✅ Activos</option>
                    <option value="revoked">❌ Revocados</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setSearchCertQuery('');
                      setFilterCertStatus('');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✕ Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* CERTIFICADOS LOADING */}
            {certificatesLoading && (
              <div style={{
                padding: '20px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '4px',
                marginBottom: '15px',
                color: '#856404'
              }}>
                <p style={{ margin: 0 }}>⏳ Cargando certificados...</p>
              </div>
            )}

            {/* CERTIFICADOS VACÍO */}
            {!certificatesLoading && getFilteredCertificates().length === 0 && (
              <div style={{
                padding: '30px',
                textAlign: 'center',
                color: '#999'
              }}>
                <p>No hay certificados disponibles</p>
              </div>
            )}

            {/* TABLA DE CERTIFICADOS */}
            {!certificatesLoading && getFilteredCertificates().length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                  marginTop: '10px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>ID Cert</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Asset ID</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Activo</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Tipo</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Emitido</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Expira</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Estado</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredCertificates().map((cert) => {
                      const asset = availableAssets.find(a => a.id.toString() === cert.assetId);
                      return (
                        <tr key={cert.certId} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: cert.revoked ? '#fef2f2' : '#fff' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>{cert.certId}</td>
                          <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>{cert.assetId}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>
                            {asset ? asset.assetType : 'Desconocido'}
                            <br />
                            <span style={{ fontSize: '11px', color: '#666' }}>
                              {asset ? asset.description.substring(0, 40) + (asset.description.length > 40 ? '...' : '') : ''}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>{cert.certType}</td>
                          <td style={{ padding: '12px', fontSize: '12px' }}>
                            {new Date(cert.issuedAt * 1000).toLocaleDateString('es-ES')}
                          </td>
                          <td style={{ padding: '12px', fontSize: '12px', fontWeight: cert.revoked ? 'normal' : new Date(cert.expiresAt * 1000) < new Date() ? 'bold' : 'normal', color: cert.revoked ? '#999' : new Date(cert.expiresAt * 1000) < new Date() ? '#ef4444' : '#10b981' }}>
                            {new Date(cert.expiresAt * 1000).toLocaleDateString('es-ES')}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              backgroundColor: cert.revoked ? '#fee2e2' : '#d1fae5',
                              color: cert.revoked ? '#7f1d1d' : '#065f46'
                            }}>
                              {cert.revoked ? '❌ Revocado' : '✅ Activo'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {!cert.revoked && (
                              <button
                                onClick={() => revokeCertificateAction(cert.certId)}
                                disabled={loading}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: 'bold'
                                }}
                              >
                                🔓 Revocar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
