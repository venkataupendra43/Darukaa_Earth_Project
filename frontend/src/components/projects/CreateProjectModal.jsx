import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';

export const CreateProjectModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type: 'Carbon project',
    location_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const projectTypes = [
    'Carbon project',
    'Biodiversity project',
    'Forest restoration',
    'Land rehabilitation',
    'Other',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onCreate(formData);
      setFormData({
        name: '',
        description: '',
        project_type: 'Carbon project',
        location_name: '',
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Environmental Project">
      <form onSubmit={handleSubmit}>
        <Alert type="error" message={error} onClose={() => setError('')} />

        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Green Horizon Restoration"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Project Type *</label>
          <select
            className="form-select"
            value={formData.project_type}
            onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
          >
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Location Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Central Highlands Reserve, Jalisco"
            value={formData.location_name}
            onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Brief overview of project goals and environmental targets..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
