/**
 * Helper utilities for working with GeoJSON geometry and bounds.
 */

export const calculatePolygonCenter = (coordinates) => {
  if (!coordinates || !coordinates.length || !coordinates[0].length) {
    return [0, 0];
  }

  const pts = coordinates[0];
  let sumLng = 0;
  let sumLat = 0;

  pts.forEach(([lng, lat]) => {
    sumLng += lng;
    sumLat += lat;
  });

  return [sumLng / pts.length, sumLat / pts.length];
};

export const calculatePolygonBounds = (coordinates) => {
  if (!coordinates || !coordinates.length || !coordinates[0].length) {
    return null;
  }

  const pts = coordinates[0];
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  pts.forEach(([lng, lat]) => {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
};
