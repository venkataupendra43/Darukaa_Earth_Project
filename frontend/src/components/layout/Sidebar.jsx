import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderTree, ShieldCheck } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderTree },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ padding: '0 0.75rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--color-accent-light)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-surface-secondary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
          <ShieldCheck size={14} />
          <span>PostGIS Active</span>
        </div>
        <span>SRID 4326 WGS84 Geodesic Polygon System</span>
      </div>
    </aside>
  );
};
