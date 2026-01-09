import React, { useState } from 'react';
import { Contract } from 'ethers';
import { CONTRACT_ABI } from '../config/abi';

export default function CertificateManager({ signer, contractAddress }) {
  const [assetId, setAssetId] = useState('');
  const [certType, setCertType] = useState('ISO-9001');
  const [daysValid, setDaysValid] = useState('365');
  const [certId, setCertId] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      setMessage(`✅ Certificado emitido. Tx: ${receipt.transactionHash}`);
      setAssetId('');
      setDaysValid('365');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCertificate = async (e) => {
    e.preventDefault();
    if (!certId) {
      alert('Ingresa ID del certificado');
      return;
    }

    setLoading(true);
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      const result = await contract.getCertificate(certId);
      setCertificate(result);
      setMessage('');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  const revokeCertificate = async () => {
    if (!certId) return;
    setLoading(true);
    try {
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      const tx = await contract.revokeCertificate(certId);
      await tx.wait();
      setMessage(`✅ Certificado revocado`);
      setCertificate(null);
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
        <h3>Emitir Certificación</h3>
        <form onSubmit={issueCertificate}>
          <input
            type="number"
            placeholder="ID del Activo"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            disabled={loading}
          />
          <select value={certType} onChange={(e) => setCertType(e.target.value)} disabled={loading}>
            <option>ISO-9001</option>
            <option>ISO-14001</option>
            <option>FSC</option>
            <option>EUDR</option>
            <option>Custom</option>
          </select>
          <input
            type="number"
            placeholder="Validez (días)"
            value={daysValid}
            onChange={(e) => setDaysValid(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Emitiendo...' : 'Emitir Certificado'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="form-section">
        <h3>Consultar Certificado</h3>
        <form onSubmit={getCertificate}>
          <input
            type="number"
            placeholder="ID del Certificado"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Obtener'}
          </button>
        </form>
        {certificate && (
          <div className="cert-display">
            <h4>Detalles del Certificado:</h4>
            <p><strong>ID:</strong> {certificate.certId.toString()}</p>
            <p><strong>Activo ID:</strong> {certificate.assetId.toString()}</p>
            <p><strong>Tipo:</strong> {certificate.certType}</p>
            <p><strong>Emisor:</strong> {certificate.issuer}</p>
            <p><strong>Emitido:</strong> {new Date(certificate.issuedAt * 1000).toLocaleDateString()}</p>
            <p><strong>Expira:</strong> {new Date(certificate.expiresAt * 1000).toLocaleDateString()}</p>
            <p><strong>Revocado:</strong> {certificate.revoked ? '❌ Sí' : '✅ No'}</p>
            {!certificate.revoked && (
              <button onClick={revokeCertificate} disabled={loading} style={{ marginTop: '10px' }}>
                Revocar Certificado
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
