/* ISS Service – talks to open-notify.org and wheretheiss.at (for SSL fallback) */

const OPEN_NOTIFY_BASE = 'http://api.open-notify.org';
const WHERE_THE_ISS_BASE = 'https://api.wheretheiss.at/v1/satellites/25544';
const GEOCODE_BASE = 'https://nominatim.openstreetmap.org';

export async function fetchISSPosition() {
  try {
    // Try Where the ISS At (Supports HTTPS/SSL)
    const response = await fetch(WHERE_THE_ISS_BASE);
    if (response.ok) {
      const data = await response.json();
      return {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
        timestamp: data.timestamp,
        speed: data.velocity // Optional: this API provides velocity!
      };
    }
  } catch (e) {
    console.warn('WhereTheISS failed, falling back to Open Notify');
  }

  // Fallback to Open Notify (HTTP only)
  const response = await fetch(`${OPEN_NOTIFY_BASE}/iss-now.json`);
  if (!response.ok) throw new Error('Failed to fetch ISS position');
  const data = await response.json();
  return {
    lat: parseFloat(data.iss_position.latitude),
    lng: parseFloat(data.iss_position.longitude),
    timestamp: data.timestamp,
  };
}

export async function fetchPeopleInSpace() {
  try {
    // Use a proxy for Open Notify if we are on HTTPS, otherwise direct
    const url = `${OPEN_NOTIFY_BASE}/astros.json`;
    const finalUrl = window.location.protocol === 'https:' 
      ? `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` 
      : url;

    const response = await fetch(finalUrl);
    if (!response.ok) throw new Error('Failed to fetch astronauts');
    const data = await response.json();
    return {
      number: data.number,
      people: data.people,
    };
  } catch (error) {
    console.error('Astronaut fetch error:', error);
    // Return mock data if all fails so the UI doesn't break
    return { number: 0, people: [] };
  }
}

export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `${GEOCODE_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!response.ok) return getOceanName(lat, lng);
    const data = await response.json();
    if (data.address) {
      const parts = [
        data.address.city || data.address.town || data.address.village || data.address.county,
        data.address.state,
        data.address.country,
      ].filter(Boolean);
      return parts.length ? parts.join(', ') : getOceanName(lat, lng);
    }
    return getOceanName(lat, lng);
  } catch {
    return getOceanName(lat, lng);
  }
}

function getOceanName(lat, lng) {
  if (lat > 60) return 'Arctic Ocean';
  if (lat < -60) return 'Southern Ocean';
  if (lng >= -80 && lng <= 20 && lat >= 0) return 'Atlantic Ocean (North)';
  if (lng >= -80 && lng <= 20 && lat < 0) return 'Atlantic Ocean (South)';
  if (lng > 20 && lng <= 147 && lat >= 0) return 'Indian Ocean / Asia';
  if (lng > 20 && lng <= 147 && lat < 0) return 'Indian Ocean';
  if ((lng > 147 || lng < -80) && lat >= 0) return 'Pacific Ocean (North)';
  if ((lng > 147 || lng < -80) && lat < 0) return 'Pacific Ocean (South)';
  return 'International Waters';
}

export function calculateSpeed(pos1, pos2, timeDiffSeconds) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(pos2.lat - pos1.lat);
  const dLon = toRad(pos2.lng - pos1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pos1.lat)) *
      Math.cos(toRad(pos2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const speedKmh = (distance / timeDiffSeconds) * 3600;
  return Math.abs(speedKmh);
}
