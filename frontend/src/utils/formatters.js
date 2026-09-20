/**
 * Utility formatters for dates, area, numbers, and strings.
 */

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const formatArea = (hectares) => {
  if (hectares == null || isNaN(hectares)) return '0.00 ha';
  const val = Number(hectares);
  if (val >= 100) {
    const sqKm = (val / 100).toFixed(2);
    return `${val.toLocaleString()} ha (${sqKm} km²)`;
  }
  return `${val.toFixed(2)} ha`;
};

export const formatNumber = (val, decimals = 2) => {
  if (val == null || isNaN(val)) return '0.00';
  return Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
