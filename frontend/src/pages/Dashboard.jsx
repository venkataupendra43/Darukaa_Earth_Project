import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { siteService } from '../services/siteService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SiteMap } from '../components/maps/SiteMap';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { formatArea } from '../utils/formatters';
import {
  FolderTree,
  Trees,
  Maximize2,
  Activity,
  Plus,
  ArrowRight,
} from 'lucide-react';

export const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const projList = await projectService.getProjects();
      setProjects(projList);

      // Fetch sites across all projects for overview map
      const sitePromises = projList.map((p) => siteService.getSitesByProject(p.id));
      const sitesNested = await Promise.all(sitePromises);
      const combinedSites = sitesNested.flat();
      setAllSites(combinedSites);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateProject = async (formData) => {
    await projectService.createProject(formData);
    fetchDashboardData();
  };

  const handleDeleteProject = async (id) => {
    await projectService.deleteProject(id);
    fetchDashboardData();
  };

  if (loading) {
    return <LoadingSpinner label="Loading environmental dashboard..." />;
  }

  const totalProjects = projects.length;
  const totalSites = allSites.length;
  const totalAreaHa = allSites.reduce((acc, s) => acc + (s.area || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Executive Environmental Dashboard</h2>
          <p className="page-subtitle">
            Geospatial carbon sequestration & biodiversity project metrics overview
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid-stats">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-primary)' }}>
            <FolderTree size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PROJECTS</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-primary)' }}>{totalProjects}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#dbeafe', color: '#1e40af' }}>
            <Trees size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>MONITORED SITES</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-primary)' }}>{totalSites}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#fef3c7', color: '#92400e' }}>
            <Maximize2 size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL GEODESIC AREA</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatArea(totalAreaHa)}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#f1f5f9', color: 'var(--color-accent)' }}>
            <Activity size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>POSTGIS ENGINE</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>SRID 4326 Active</h3>
          </div>
        </div>
      </div>

      {/* Geospatial Site Overview Map */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Geospatial Site Polygon Overview Map
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Interactive satellite visualization of active project polygon boundaries
            </p>
          </div>
          <span className="badge badge-green">Live PostGIS Geometries</span>
        </div>

        <SiteMap sites={allSites} height="420px" />
      </div>

      {/* Recent Projects Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Environmental Projects
          </h3>
          <Link to="/projects" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <span>View All Projects</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <FolderTree size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h4>No environmental projects found</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              Create your first project or seed initial sample data.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus size={16} /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid-cards">
            {projects.slice(0, 3).map((p) => (
              <ProjectCard key={p.id} project={p} onDelete={handleDeleteProject} />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};
