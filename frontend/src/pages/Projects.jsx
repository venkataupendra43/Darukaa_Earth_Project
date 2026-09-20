import React, { useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { EmptyState } from '../components/common/EmptyState';
import { Plus, Search, Filter, FolderTree } from 'lucide-react';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (formData) => {
    await projectService.createProject(formData);
    fetchProjects();
  };

  const handleDeleteProject = async (id) => {
    await projectService.deleteProject(id);
    fetchProjects();
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.location_name && p.location_name.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'All' || p.project_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <LoadingSpinner label="Loading project catalog..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Environmental Projects</h2>
          <p className="page-subtitle">
            Manage carbon, biodiversity, forest restoration, and land rehabilitation initiatives
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search projects by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ minWidth: '180px' }}
          >
            <option value="All">All Project Types</option>
            <option value="Carbon project">Carbon project</option>
            <option value="Biodiversity project">Biodiversity project</option>
            <option value="Forest restoration">Forest restoration</option>
            <option value="Land rehabilitation">Land rehabilitation</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No matching projects found"
          description={search ? 'Try adjusting your search query or filter.' : 'Create your first environmental project to get started.'}
          action={
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus size={16} /> Create Project
            </button>
          }
        />
      ) : (
        <div className="grid-cards">
          {filteredProjects.map((p) => (
            <ProjectCard key={p.id} project={p} onDelete={handleDeleteProject} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};
