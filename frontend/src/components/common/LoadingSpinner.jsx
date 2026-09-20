import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ fullScreen = false, label = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)',
          gap: '1rem',
        }}
      >
        <Loader2 className="animate-spin" size={40} color="var(--color-accent)" />
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
      </div>
    );
  }

  return (
    <div className="spinner-center">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <Loader2 className="animate-spin" size={32} color="var(--color-accent)" />
        {label && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{label}</p>}
      </div>
    </div>
  );
};
