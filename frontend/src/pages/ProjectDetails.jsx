import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { siteService } from '../services/siteService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SiteMap } from '../components/maps/SiteMap';
import { SiteCard } from '../components/sites/SiteCard';
import { AddSiteModal } from '../components/sites/AddSiteModal';
import { EmptyState } from '../components/common/EmptyState';
import { formatArea, formatDate } from '../utils/formatters';
import {
  ArrowLeft,
  Plus,
  MapPin,
  Trees,
  Maximize2,
  Layers,
  Trash2,
} from 'lucide-react';

export const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);

  const fetchProjectData = useCallback(async () => {
    try {
      const proj = await projectService.getProjectById(projectId);
      setProject(proj);
      const siteList = await siteService.getSitesByProject(projectId);
      setSites(siteList);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleAddSite = async (siteData) => {
    await siteService.createSite(projectId, siteData);
    fetchProjectData();
  };

  const handleDeleteSite = async (siteId) => {
    await siteService.deleteSite(siteId);
    fetchProjectData();
  };

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete project "${project.name}"?`)) {
      await projectService.deleteProject(projectId);
      navigate('/projects');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading project details & spatial geometries..." />;
  }

  if (!project) {
    return (
      <div className="page-container">
        <EmptyState
          title="Project not found"
          description="The requested environmental project does not exist."
          action={
            <Link to="/projects" className="btn btn-primary">
              Back to Projects
            </Link>
          }
        />
      </div>
    );
  }

  const totalAreaHa = sites.reduce((acc, s) => acc + (s.area || 0), 0);

  return (
    <div className="page-container">
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/projects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-green">{project.project_type}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created {formatDate(project.created_at)}</span>
          </div>
          <h2 className="page-title">{project.name}</h2>
          <p className="page-subtitle">{project.description || 'No description provided.'}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setIsAddSiteOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Geographical Site</span>
          </button>
          <button onClick={handleDeleteProject} className="btn btn-danger" title="Delete Project">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Project Metadata Stats */}
      <div className="grid-stats" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <MapPin size={24} color="var(--color-accent)" />
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>LOCATION</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)' }}>{project.location_name || 'Unspecified'}</h4>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <Trees size={24} color="var(--color-accent)" />
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SITES</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)' }}>{sites.length} Active Site(s)</h4>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <Maximize2 size={24} color="var(--color-accent)" />
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUMULATIVE AREA</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatArea(totalAreaHa)}</h4>
          </div>
        </div>
      </div>

      {/* Project Site Map */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Project Spatial Geometry Map
          </h3>
          <span className="badge badge-blue">WGS84 Coordinates</span>
        </div>
        <SiteMap sites={sites} height="400px" />
      </div>

      {/* Sites Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Project Sites ({sites.length})
          </h3>
          <button onClick={() => setIsAddSiteOpen(true)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Plus size={14} /> Add Site
          </button>
        </div>

        {sites.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No sites added to this project yet"
            description="Draw a polygon boundary on the map to add your first geographical site."
            action={
              <button onClick={() => setIsAddSiteOpen(true)} className="btn btn-primary">
                <Plus size={16} /> Draw Site Polygon
              </button>
            }
          />
        ) : (
          <div className="grid-cards">
            {sites.map((s) => (
              <SiteCard key={s.id} site={s} onDelete={handleDeleteSite} />
            ))}
          </div>
        )}
      </div>

      <AddSiteModal
        isOpen={isAddSiteOpen}
        onClose={() => setIsAddSiteOpen(false)}
        onAddSite={handleAddSite}
      />
    </div>
  );
};
