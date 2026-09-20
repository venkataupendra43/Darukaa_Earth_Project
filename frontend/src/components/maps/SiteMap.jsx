import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { calculatePolygonCenter, calculatePolygonBounds } from '../../utils/geojson';
import { Info } from 'lucide-react';

export const SiteMap = ({ sites = [], selectedSite = null, height = '450px', interactive = true }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [tokenMissing, setTokenMissing] = useState(false);

  const token = import.meta.env.VITE_MAPBOX_TOKEN || '';

  useEffect(() => {
    if (!token || token.includes('demo_public_token')) {
      // Missing or placeholder token check
      setTokenMissing(true);
    }

    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = token;

      // Determine initial center
      let center = [-103.51, 20.645]; // Default Guadalajara / Jalisco Central Highlands
      if (sites.length > 0 && sites[0].geometry?.coordinates) {
        center = calculatePolygonCenter(sites[0].geometry.coordinates);
      }

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: center,
        zoom: 12,
        interactive: interactive,
      });

      map.current = mapInstance;

      mapInstance.on('load', () => {
        // Add sites sources and polygon layers
        sites.forEach((site) => {
          if (!site.geometry || !site.geometry.coordinates) return;

          const sourceId = `site-source-${site.id}`;
          const fillLayerId = `site-fill-${site.id}`;
          const lineLayerId = `site-line-${site.id}`;

          if (mapInstance.getSource(sourceId)) return;

          mapInstance.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: site.geometry,
              properties: {
                id: site.id,
                name: site.name,
                area: site.area,
              },
            },
          });

          // Fill Layer
          mapInstance.addLayer({
            id: fillLayerId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': selectedSite?.id === site.id ? '#10b981' : '#059669',
              'fill-opacity': selectedSite?.id === site.id ? 0.45 : 0.25,
            },
          });

          // Border Line Layer
          mapInstance.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': selectedSite?.id === site.id ? '#047857' : '#10b981',
              'line-width': selectedSite?.id === site.id ? 3 : 2,
            },
          });

          // Popup on click
          mapInstance.on('click', fillLayerId, (e) => {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(
                `<div style="padding: 4px;">
                  <strong style="color: #064e3b; font-size: 14px;">${site.name}</strong>
                  <p style="margin-top: 4px; font-size: 12px; color: #475569;">Area: ${site.area} ha</p>
                  <p style="font-size: 11px; color: #64748b;">Land Use: ${site.land_use_type || 'N/A'}</p>
                </div>`
              )
              .addTo(mapInstance);
          });
        });

        // Fit bounds if site selected or list available
        if (selectedSite && selectedSite.geometry?.coordinates) {
          const bounds = calculatePolygonBounds(selectedSite.geometry.coordinates);
          if (bounds) {
            mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 15 });
          }
        }
      });

      mapInstance.on('error', (e) => {
        if (e && e.error && e.error.status === 401) {
          setTokenMissing(true);
        }
      });
    } catch (err) {
      console.warn('Mapbox GL initialization note:', err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [sites, selectedSite, token, interactive]);

  return (
    <div className="map-wrapper" style={{ height }}>
      {tokenMissing && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            zIndex: 10,
            backgroundColor: 'rgba(254, 243, 199, 0.95)',
            border: '1px solid #f59e0b',
            color: '#92400e',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Info size={16} />
          <span>
            <strong>Mapbox Public Token Warning:</strong> Mapbox API token is missing or default. Add <code>VITE_MAPBOX_TOKEN</code> in <code>frontend/.env</code> to render high-resolution satellite tiles.
          </span>
        </div>
      )}

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
