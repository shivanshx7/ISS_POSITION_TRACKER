/* ISS Service – talks to wheretheiss.at (HTTPS) and open-notify (HTTP fallback for local) */

const WHERE_THE_ISS_BASE = 'https://api.wheretheiss.at/v1/satellites/25544';
const OPEN_NOTIFY_BASE = 'http://api.open-notify.org';
const GEOCODE_BASE = 'https://nominatim.openstreetmap.org';

export async function fetchISSPosition() {
  // Always try the HTTPS-compatible API first
  try {
    const response = await fetch(WHERE_THE_ISS_BASE);
    if (response.ok) {
      const data = await response.json();
      return {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
        timestamp: data.timestamp,
        speed: data.velocity 
      };
    }
  } catch (e) {
    console.warn('WheretheISS failed:', e);
  }

  // Only use Open Notify on HTTP or Localhost
  if (window.location.protocol === 'http:' || window.location.hostname === 'localhost') {
    try {
      const response = await fetch(`${OPEN_NOTIFY_BASE}/iss-now.json`);
      if (response.ok) {
        const data = await response.json();
        return {
          lat: parseFloat(data.iss_position.latitude),
          lng: parseFloat(data.iss_position.longitude),
          timestamp: data.timestamp,
        };
      }
    } catch (e) {
      console.warn('Open Notify failed:', e);
    }
  }

  throw new Error('All ISS tracking services failed. Please check your connection or try again later.');
}

export async function fetchPeopleInSpace() {
  try {
    // Open Notify astros is HTTP only. Use proxy for HTTPS.
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
    return { number: 0, people: [] };
  }
}

export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `${GEOCODE_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`,
      { 
        headers: { 
          'Accept-Language': 'en',
          'User-Agent': 'SpaceWatch-Dashboard-Project' // Nominatim requires a User-Agent
        } 
      }
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
      Math.cos(toRad(pos1.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const speedKmh = (distance / timeDiffSeconds) * 3600;
  return Math.abs(speedKmh);
}
