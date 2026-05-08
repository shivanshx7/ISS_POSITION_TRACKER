import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Users, RefreshCw, Activity } from 'lucide-react';
import { fetchISSPosition, fetchPeopleInSpace, reverseGeocode, calculateSpeed } from '../services/issService';
import toast from 'react-hot-toast';

// Custom ISS Icon
const issIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3233/3233514.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Helper to auto-center map
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

const ISSSection = ({ onDataUpdate }) => {
  const [position, setPosition] = useState({ lat: 0, lng: 0 });
  const [path, setPath] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [locationName, setLocationName] = useState('Fetching...');
  const [astronauts, setAstronauts] = useState({ number: 0, people: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastFetchTime = useRef(Date.now());

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const newPos = await fetchISSPosition();
      const now = Date.now();
      
      if (path.length > 0) {
        const lastPos = path[path.length - 1];
        const timeDiff = (now - lastFetchTime.current) / 1000;
        if (timeDiff > 0) {
          const newSpeed = calculateSpeed(lastPos, newPos, timeDiff);
          if (newSpeed > 0 && newSpeed < 30000) { // Filter outliers
             setSpeed(newSpeed);
          }
        }
      }

      setPosition(newPos);
      setPath(prev => {
        const newPath = [...prev, newPos].slice(-15);
        return newPath;
      });
      lastFetchTime.current = now;

      // Update location name
      const name = await reverseGeocode(newPos.lat, newPos.lng);
      setLocationName(name);

      // Fetch People (only once or manually)
      if (loading || isManual) {
        const peopleData = await fetchPeopleInSpace();
        setAstronauts(peopleData);
      }

      // Send data to parent for AI context
      onDataUpdate({
        ...newPos,
        location: name,
        speed: speed,
        peopleCount: astronauts.number,
        people: astronauts.people,
        positionCount: path.length + 1,
        lastUpdated: new Date().toLocaleTimeString()
      });

      if (isManual) toast.success('ISS Position Updated');
    } catch (error) {
      console.error(error);
      if (isManual) toast.error('Failed to update ISS position');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 15000);
    return () => clearInterval(interval);
  }, [path.length]);

  return (
    <div className="section-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', margin: '20px' }}>
      <div className="glass-card" style={{ padding: '20px', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        <div className="section-header">
          <div className="section-title">
            <div className="icon-circle" style={{ background: 'var(--gradient-secondary)' }}>
              <Navigation size={18} color="white" />
            </div>
            Real-time Orbit Tracking
          </div>
          <button className={`btn-icon ${refreshing ? 'spinning' : ''}`} onClick={() => fetchData(true)}>
            <RefreshCw size={18} />
          </button>
        </div>

        <div style={{ flex: 1, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
          {loading ? (
            <div className="skeleton" style={{ width: '100%', height: '100%' }}></div>
          ) : (
            <MapContainer center={[position.lat, position.lng]} zoom={3} style={{ height: '400px', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <ChangeView center={[position.lat, position.lng]} />
              <Polyline positions={path.map(p => [p.lat, p.lng])} color="var(--accent-blue)" weight={2} opacity={0.6} />
              <Marker position={[position.lat, position.lng]} icon={issIcon}>
                <Tooltip permanent direction="top" offset={[0, -20]}>
                  ISS Current Location
                </Tooltip>
              </Marker>
            </MapContainer>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <div className="stat-card">
            <div className="stat-label">Latitude</div>
            <div className="stat-value">{position.lat.toFixed(4)}°</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Longitude</div>
            <div className="stat-value">{position.lng.toFixed(4)}°</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Velocity</div>
            <div className="stat-value">{speed > 0 ? speed.toFixed(0) : '27,600'} <span style={{ fontSize: '14px' }}>km/h</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Location</div>
            <div className="stat-value" style={{ fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{locationName}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="section-title" style={{ fontSize: '18px', marginBottom: '15px' }}>
            <Users size={18} color="var(--accent-purple)" />
            Crew in Orbit
          </div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
             <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--accent-purple)' }}>{astronauts.number}</div>
             <div className="stat-label">People currently in space</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {astronauts.people.map((person, i) => (
              <div key={i} className="card" style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{person.name}</span>
                <span className="badge badge-purple">{person.craft}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', flex: 1 }}>
          <div className="section-title" style={{ fontSize: '18px', marginBottom: '15px' }}>
            <Activity size={18} color="var(--accent-green)" />
            Telemetry Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span className="stat-label">Uplink</span>
               <span className="badge badge-green">Connected</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span className="stat-label">Data Rate</span>
               <span style={{ fontSize: '12px', fontWeight: 600 }}>1.2 GB/s</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span className="stat-label">Altitude</span>
               <span style={{ fontSize: '12px', fontWeight: 600 }}>408 km</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span className="stat-label">Positions tracked</span>
               <span style={{ fontSize: '12px', fontWeight: 600 }}>{path.length}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ISSSection;
