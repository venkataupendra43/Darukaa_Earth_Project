import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { siteService } from '../services/siteService';
import { analyticsService } from '../services/analyticsService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SiteMap } from '../components/maps/SiteMap';
import { MetricChart } from '../components/charts/MetricChart';
import { ComparisonChart } from '../components/charts/ComparisonChart';
import { AddMetricModal } from '../components/sites/AddMetricModal';
import { EmptyState } from '../components/common/EmptyState';
import { formatArea, formatDate, formatDateTime, formatNumber } from '../utils/formatters';
import {
  ArrowLeft,
  Plus,
} from 'lucide-react';

export const SiteDetails = () => {
  const { siteId } = useParams();

  const [site, setSite] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  const fetchSiteData = useCallback(async () => {
    try {
      const siteData = await siteService.getSiteById(siteId);
      setSite(siteData);

      const analyticsData = await analyticsService.getSiteAnalytics(siteId);
      setAnalytics(analyticsData);

      if (analyticsData.summaries && analyticsData.summaries.length > 0) {
        setSelectedMetric(analyticsData.summaries[0].metric_name);
      }
    } catch (err) {
      console.error('Failed to fetch site analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchSiteData();
  }, [fetchSiteData]);

  const handleAddMetric = async (metricData) => {
    await siteService.addSiteMetric(siteId, metricData);
    fetchSiteData();
  };

  if (loading) {
    return <LoadingSpinner label="Loading site polygon & environmental analytics..." />;
  }

  if (!site) {
    return (
      <div className="page-container">
        <EmptyState
          title="Site not found"
          description="The requested geographical site does not exist."
          action={
            <Link to="/projects" className="btn btn-primary">
              Back to Projects
            </Link>
          }
        />
      </div>
    );
  }

  const activeSummary = analytics?.summaries?.find((s) => s.metric_name === selectedMetric);
  const activeTimeSeries = analytics?.time_series?.filter((m) => m.metric_name === selectedMetric) || [];

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to={`/projects/${site.project_id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to Project
        </Link>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-green">{site.land_use_type || 'Land Use Unspecified'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recorded {formatDate(site.created_at)}</span>
          </div>
          <h2 className="page-title">{site.name}</h2>
          <p className="page-subtitle">{site.description || 'No specific site description provided.'}</p>
        </div>

        <button onClick={() => setIsAddMetricOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Record Measurement</span>
        </button>
      </div>

      {/* Metadata & Map Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Site Details Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>
              Spatial Properties
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>GEODESIC SURFACE AREA</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                  {formatArea(site.area)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>LAND USE CLASSIFICATION</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {site.land_use_type || 'Unclassified'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>COORDINATE SYSTEM</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  PostGIS SRID 4326 (WGS84 Ellipsoid)
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.875rem' }}>
              Metric Summary Statistics
            </h3>
            {analytics?.summaries?.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No environmental observations logged yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analytics.summaries.map((sum) => (
                  <div
                    key={sum.metric_name}
                    onClick={() => setSelectedMetric(sum.metric_name)}
                    style={{
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: selectedMetric === sum.metric_name ? 'var(--color-accent-light)' : 'var(--bg-surface-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ fontWeight: selectedMetric === sum.metric_name ? 700 : 500, color: 'var(--color-primary)' }}>
                      {sum.metric_name}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
                      {formatNumber(sum.latest_value)} {sum.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Individual Site Map */}
        <div className="card" style={{ padding: '1rem' }}>
          <SiteMap sites={[site]} selectedSite={site} height="420px" />
        </div>
      </div>

      {/* Analytics Charting Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Historical Environmental Performance Trend
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Time-series observations for {selectedMetric || 'environmental metrics'}
            </p>
          </div>

          {analytics?.summaries && analytics.summaries.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Metric:</span>
              <select
                className="form-select"
                value={selectedMetric || ''}
                onChange={(e) => setSelectedMetric(e.target.value)}
                style={{ width: 'auto' }}
              >
                {analytics.summaries.map((s) => (
                  <option key={s.metric_name} value={s.metric_name}>
                    {s.metric_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeSummary && (
          <div className="grid-stats" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MIN VALUE</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeSummary.min_value} {activeSummary.unit}</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MEAN VALUE</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeSummary.mean_value} {activeSummary.unit}</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MAX VALUE</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeSummary.max_value} {activeSummary.unit}</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DATA POINTS</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>{activeSummary.data_points}</div>
            </div>
          </div>
        )}

        <MetricChart
          metricName={selectedMetric || ''}
          unit={activeSummary ? activeSummary.unit : ''}
          dataPoints={activeTimeSeries}
        />
      </div>

      {/* Cross-Metric Comparison */}
      {analytics?.summaries && analytics.summaries.length > 1 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>
            Latest Environmental Observations Comparison
          </h3>
          <ComparisonChart summaries={analytics.summaries} />
        </div>
      )}

      {/* Historical Observations Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>
          Recorded Observation Log ({analytics?.time_series?.length || 0})
        </h3>

        {analytics?.time_series?.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No recorded measurements.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Metric</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Value</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Recorded Date</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {analytics.time_series.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>{item.metric_name}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--color-accent)' }}>{item.metric_value} {item.unit}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{formatDateTime(item.recorded_at)}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{item.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddMetricModal
        isOpen={isAddMetricOpen}
        onClose={() => setIsAddMetricOpen(false)}
        onAddMetric={handleAddMetric}
      />
    </div>
  );
};
