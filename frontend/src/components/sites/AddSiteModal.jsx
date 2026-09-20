import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { MapDrawControl } from '../maps/MapDrawControl';

export const AddSiteModal = ({ isOpen, onClose, onAddSite }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    land_use_type: 'Degraded Forestland',
  });
  const [geometry, setGeometry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const landUseOptions = [
    'Degraded Forestland',
    'Riparian Wetland',
    'Coastal Mangrove',
    'Regenerative Agricultural Plot',
    'Hardwood Savanna',
    'Other Ecosystem',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Site name is required.');
      return;
    }
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
      setError('Please draw a polygon boundary on the map or pick a sample polygon.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAddSite({
        ...formData,
        geometry,
      });
      setFormData({
        name: '',
        description: '',
        land_use_type: 'Degraded Forestland',
      });
      setGeometry(null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create site polygon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Geographical Site & Draw Boundary">
      <form onSubmit={handleSubmit}>
        <Alert type="error" message={error} onClose={() => setError('')} />

        <div className="form-group">
          <label className="form-label">Site Name *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Sector Alpha (North Ridge)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Land Use Classification</label>
          <select
            className="form-select"
            value={formData.land_use_type}
            onChange={(e) => setFormData({ ...formData, land_use_type: e.target.value })}
          >
            {landUseOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Site Description</label>
          <input
            type="text"
            className="form-input"
            placeholder="Specific terrain or monitoring notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Mapbox Polygon Drawing Component */}
        <div style={{ marginBottom: '1.25rem' }}>
          <MapDrawControl onPolygonChange={setGeometry} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving & Validating Geometry...' : 'Save Site & Calculate Area'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
