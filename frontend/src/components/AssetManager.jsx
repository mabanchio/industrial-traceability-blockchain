import React, { useState } from 'react';
import { Contract } from 'ethers';
import { CONTRACT_ABI } from '../config/abi';

export default function AssetManager({ signer, contractAddress }) {
  const [assetType, setAssetType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [assetId, setAssetId] = useState('');
  const [asset, setAsset] = useState(null);

  const registerAsset = async (e) => {
    e.preventDefault();
    if (!assetType || !description) {
      alert('Por favor completa todos los campos');
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

  const getAsset = async (e) => {
    e.preventDefault();
    if (!assetId) {
      alert('Ingresa ID del activo');
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

  return (
    <div className="card">
      <h2>📦 Gestión de Activos Industriales</h2>

      <div className="form-section">
        <h3>Registrar Nuevo Activo</h3>
        <form onSubmit={registerAsset}>
          <input
            type="text"
            placeholder="Tipo de Activo (ej: Metal, Madera)"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Descripción (ej: Acero de alta calidad)"
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
        <h3>Consultar Activo</h3>
        <form onSubmit={getAsset}>
          <input
            type="number"
            placeholder="ID del Activo"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Consultando...' : 'Obtener'}
          </button>
        </form>
        {asset && (
          <div className="asset-display">
            <h4>Detalles del Activo:</h4>
            <p><strong>ID:</strong> {asset.assetId.toString()}</p>
            <p><strong>Propietario:</strong> {asset.owner}</p>
            <p><strong>Tipo:</strong> {asset.assetType}</p>
            <p><strong>Descripción:</strong> {asset.description}</p>
            <p><strong>Activo:</strong> {asset.active ? '✅ Sí' : '❌ No'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
