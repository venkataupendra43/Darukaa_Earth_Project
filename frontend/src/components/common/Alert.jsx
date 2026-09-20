import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const styles = {
    error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', Icon: AlertCircle },
    success: { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46', Icon: CheckCircle2 },
    info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', Icon: Info },
  }[type];

  const { bg, border, text, Icon } = styles;

  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
        padding: '0.875rem 1.25rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.875rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Icon size={18} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
