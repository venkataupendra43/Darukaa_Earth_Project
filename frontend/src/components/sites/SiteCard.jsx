import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize2, Trash2, ArrowRight } from 'lucide-react';
import { formatArea, formatDate } from '../../utils/formatters';

export const SiteCard = ({ site, onDelete }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <span className="badge badge-green">{site.land_use_type || 'Unspecified Land Use'}</span>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete site "${site.name}"?`)) {
                onDelete(site.id);
              }
            }}
            style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
            title="Delete Site"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
          {site.name}
        </h4>

        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {site.description || 'No site description.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '1rem' }}>
          <Maximize2 size={16} />
          <span>Calculated Area: {formatArea(site.area)}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Added {formatDate(site.created_at)}</span>
        <Link
          to={`/sites/${site.id}`}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', gap: '0.3rem' }}
        >
          <span>Analytics</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
