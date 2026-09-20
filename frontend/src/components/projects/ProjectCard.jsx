import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Trees, ArrowRight, Trash2 } from 'lucide-react';
import { formatDate, formatArea } from '../../utils/formatters';

export const ProjectCard = ({ project, onDelete }) => {
  const badgeColors = {
    'Carbon project': 'badge-green',
    'Biodiversity project': 'badge-blue',
    'Forest restoration': 'badge-amber',
    'Land rehabilitation': 'badge-green',
  };

  const badgeClass = badgeColors[project.project_type] || 'badge-blue';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <span className={`badge ${badgeClass}`}>{project.project_type}</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm(`Are you sure you want to delete project "${project.name}"?`)) {
                onDelete(project.id);
              }
            }}
            style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
            title="Delete Project"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          {project.name}
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description || 'No description provided.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} color="var(--color-accent)" />
            <span>{project.location_name || 'Location Unspecified'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Trees size={14} color="var(--color-accent)" />
            <span>{project.site_count} Site(s) • Total Area: {formatArea(project.total_area_ha)}</span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-light)' }}>
        <span>Created {formatDate(project.created_at)}</span>
        <Link
          to={`/projects/${project.id}`}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem' }}
        >
          <span>View Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
