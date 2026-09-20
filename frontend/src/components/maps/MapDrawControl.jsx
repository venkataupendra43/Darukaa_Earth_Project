import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Pencil, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const MapDrawControl = ({ onPolygonChange, initialGeometry = null }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const drawRef = useRef(null);
  const [polygonDrawn, setPolygonDrawn] = useState(false);
  const [useFallbackInputs, setUseFallbackInputs] = useState(false);
  const [coordText, setCoordText] = useState('');

  const token = import.meta.env.VITE_MAPBOX_TOKEN || '';

  // Standard sample coordinates for quick selection
  const samplePolygons = [
    {
      name: 'North Ridge Sector (-103.52, 20.65)',
      coords: [
        [-103.52, 20.65],
        [-103.51, 20.65],
        [-103.51, 20.64],
        [-103.52, 20.64],
        [-103.52, 20.65],
      ],
    },
    {
      name: 'Riparian Buffer Zone (-103.505, 20.645)',
      coords: [
        [-103.505, 20.645],
        [-103.495, 20.645],
        [-103.498, 20.638],
        [-103.508, 20.638],
        [-103.505, 20.645],
      ],
    },
    {
      name: 'Coastal Mangrove Sanctuary (-105.22, 20.71)',
      coords: [
        [-105.22, 20.71],
        [-105.21, 20.71],
        [-105.21, 20.7],
        [-105.22, 20.7],
        [-105.22, 20.71],
      ],
    },
  ];

  const updateGeoJSON = (geojson) => {
    setPolygonDrawn(true);
    onPolygonChange(geojson);
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = token;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-103.51, 20.645],
        zoom: 12,
      });

      map.current = mapInstance;

      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: 'draw_polygon',
      });

      drawRef.current = draw;
      mapInstance.addControl(draw, 'top-left');

      const handleDrawEvent = () => {
        const data = draw.getAll();
        if (data.features.length > 0) {
          const feature = data.features[data.features.length - 1];
          updateGeoJSON(feature.geometry);
        } else {
          setPolygonDrawn(false);
          onPolygonChange(null);
        }
      };

      mapInstance.on('draw.create', handleDrawEvent);
      mapInstance.on('draw.update', handleDrawEvent);
      mapInstance.on('draw.delete', handleDrawEvent);

      if (initialGeometry) {
        mapInstance.on('load', () => {
          draw.add({
            type: 'Feature',
            geometry: initialGeometry,
          });
          setPolygonDrawn(true);
        });
      }
    } catch (err) {
      console.warn('Mapbox Draw init notice, using fallback mode:', err);
      setUseFallbackInputs(true);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [token]);

  const handleSelectSample = (sample) => {
    const geojson = {
      type: 'Polygon',
      coordinates: [sample.coords],
    };

    if (drawRef.current) {
      drawRef.current.deleteAll();
      drawRef.current.add({
        type: 'Feature',
        geometry: geojson,
      });
    }

    setCoordText(JSON.stringify(sample.coords, null, 2));
    updateGeoJSON(geojson);
  };

  const handleClearDraw = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
    }
    setPolygonDrawn(false);
    setCoordText('');
    onPolygonChange(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
          Site Polygon Geometry (WGS84)
        </span>
        {polygonDrawn ? (
          <span className="badge badge-green" style={{ gap: '4px' }}>
            <CheckCircle2 size={12} /> Polygon Captured
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Click polygon button on map or pick sample to set coordinates
          </span>
        )}
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="map-wrapper" style={{ height: '350px' }}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Quick Sample Selector & Control Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface-secondary)',
          padding: '0.875rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            marginBottom: '0.5rem',
          }}
        >
          <Sparkles size={14} />
          <span>Quick Sample Polygons (Click to test polygon validation):</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {samplePolygons.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              {sample.name}
            </button>
          ))}

          {polygonDrawn && (
            <button
              type="button"
              onClick={handleClearDraw}
              className="btn btn-danger"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', marginLeft: 'auto' }}
            >
              <Trash2 size={12} /> Clear Polygon
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
