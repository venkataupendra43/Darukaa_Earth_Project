import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';

export const AddMetricModal = ({ isOpen, onClose, onAddMetric }) => {
  const [formData, setFormData] = useState({
    metric_name: 'Soil Organic Carbon',
    metric_value: '',
    unit: '%',
    source: 'Field Sensor / Observation',
    recorded_at: new Date().toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const standardMetrics = [
    { name: 'Soil Organic Carbon', unit: '%' },
    { name: 'Soil pH', unit: 'pH scale' },
    { name: 'Soil Moisture', unit: '%' },
    { name: 'Biodiversity Index', unit: 'Score (0-100)' },
    { name: 'Species Richness', unit: 'Species count' },
    { name: 'Vegetation Coverage', unit: '%' },
    { name: 'Temperature', unit: '°C' },
    { name: 'Rainfall', unit: 'mm' },
  ];

  const handleMetricSelect = (e) => {
    const selectedName = e.target.value;
    const found = standardMetrics.find((m) => m.name === selectedName);
    setFormData({
      ...formData,
      metric_name: selectedName,
      unit: found ? found.unit : '%',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.metric_value === '' || isNaN(formData.metric_value)) {
      setError('Please provide a valid numerical metric value.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAddMetric({
        ...formData,
        metric_value: parseFloat(formData.metric_value),
        recorded_at: new Date(formData.recorded_at).toISOString(),
      });
      setFormData({
        metric_name: 'Soil Organic Carbon',
        metric_value: '',
        unit: '%',
        source: 'Field Sensor / Observation',
        recorded_at: new Date().toISOString().slice(0, 16),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record metric measurement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Environmental Observation">
      <form onSubmit={handleSubmit}>
        <Alert type="error" message={error} onClose={() => setError('')} />

        <div className="form-group">
          <label className="form-label">Metric Category *</label>
          <select
            className="form-select"
            value={formData.metric_name}
            onChange={handleMetricSelect}
          >
            {standardMetrics.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name} ({m.unit})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Observation Value *</label>
            <input
              type="number"
              step="any"
              className="form-input"
              placeholder="e.g. 3.4"
              value={formData.metric_value}
              onChange={(e) => setFormData({ ...formData, metric_value: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit *</label>
            <input
              type="text"
              className="form-input"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Observation Timestamp</label>
          <input
            type="datetime-local"
            className="form-input"
            value={formData.recorded_at}
            onChange={(e) => setFormData({ ...formData, recorded_at: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Data Source</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Sentinel-2 Satellite / Field Core Sample"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Recording...' : 'Record Measurement'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
