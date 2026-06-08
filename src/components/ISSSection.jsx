import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Users, RefreshCw, Activity } from 'lucide-react';
import { fetchISSPosition, fetchPeopleInSpace, reverseGeocode, calculateSpeed } from '../services/issService';
import toast from 'react-hot-toast';
import ChartsSection from './ChartsSection';

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

const ISSSection = ({ onDataUpdate, issHistory, newsArticles }) => {
  const [position, setPosition] = useState({ lat: 0, lng: 0 });
  const [path, setPath] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [locationName, setLocationName] = useState('Fetching...');
  const [astronauts, setAstronauts] = useState({ number: 0, people: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastFetchTime = useRef(null);

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const newPos = await fetchISSPosition();
      const now = Date.now();
      
      if (path.length > 0 && lastFetchTime.current) {
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
        speed: speed || 27600,
        peopleCount: astronauts.number,
        people: astronauts.people,
        positionCount: path.length + 1,
        lastUpdated: new Date().toLocaleTimeString()
      });

      if (isManual) toast.success('ISS Orbit Synced');
    } catch (error) {
      console.error(error);
      if (isManual) toast.error('Failed to update ISS position');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Left Column: Map, Telemetry Cards, and Charts */}
      <div className="left-column">
        {/* Real-time Tracking Map & Telemetry Cards */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div className="section-title">
              <div className="icon-circle" style={{ background: 'var(--gradient-primary)' }}>
                <Navigation size={15} color="white" style={{ transform: 'rotate(45deg)' }} />
              </div>
              Real-time Orbit Tracking
            </div>
            <button className={`btn-icon ${refreshing ? 'spinning' : ''}`} onClick={() => fetchData(true)} title="Sync Orbit Telemetry">
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Leaflet Map Wrapper */}
          <div style={{ 
            height: '420px', 
            borderRadius: 'var(--radius-lg)', 
            overflow: 'hidden', 
            border: '1px solid var(--border-color)', 
            position: 'relative' 
          }}>
            {loading ? (
              <div className="skeleton" style={{ width: '100%', height: '100%' }}></div>
            ) : (
              <MapContainer center={[position.lat, position.lng]} zoom={3} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <ChangeView center={[position.lat, position.lng]} />
                <Polyline positions={path.map(p => [p.lat, p.lng])} color="var(--accent-cyan)" weight={3} opacity={0.7} />
                <Marker position={[position.lat, position.lng]} icon={issIcon}>
                  <Tooltip permanent direction="top" offset={[0, -20]}>
                    ISS Current Position
                  </Tooltip>
                </Marker>
              </MapContainer>
            )}
          </div>

          {/* Telemetry Cards Grid */}
          <div className="telemetry-grid">
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
              <div className="stat-value">
                {speed > 0 ? speed.toLocaleString(undefined, {maximumFractionDigits: 0}) : '27,600'} <span>km/h</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Current Location</div>
              <div className="stat-value" style={{ 
                fontSize: '15px', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                fontFamily: 'var(--font-body)'
              }} title={locationName}>
                {locationName}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section integrated underneath Telemetry Cards */}
        <ChartsSection issHistory={issHistory} newsArticles={newsArticles} />
      </div>

      {/* Right Column: Crew sidebar & Telemetry widget */}
      <div className="right-column">
        {/* Crew in Orbit card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div className="section-title">
              <div className="icon-circle" style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <Users size={15} color="var(--accent-purple)" />
              </div>
              Crew in Orbit
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '12px 0 20px', borderBottom: '1px solid var(--border-color)' }}>
             <div style={{ 
               fontSize: '56px', 
               fontWeight: 800, 
               color: 'var(--accent-purple)', 
               fontFamily: 'var(--font-heading)', 
               lineHeight: '1',
               marginBottom: '6px',
               textShadow: '0 0 20px rgba(168, 85, 247, 0.2)'
             }}>
               {astronauts.number || '0'}
             </div>
             <div className="stat-label">Humans in space right now</div>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            maxHeight: '230px', 
            overflowY: 'auto', 
            paddingRight: '4px' 
          }}>
            {astronauts.people.map((person, i) => (
              <div key={i} className="card" style={{ 
                padding: '10px 14px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'rgba(15, 15, 20, 0.3)',
                borderColor: 'var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{person.name}</span>
                <span className={`badge ${person.craft.toUpperCase() === 'ISS' ? 'badge-purple' : 'badge-cyan'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                  {person.craft}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry Status card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div className="section-title">
              <div className="icon-circle" style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Activity size={15} color="var(--accent-green)" />
              </div>
              Telemetry Status
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
               <span className="stat-label">Uplink</span>
               <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                 <span className="pulse-dot"></span>
                 Connected
               </span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
               <span className="stat-label">Data Rate</span>
               <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>1.2 GB/s</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
               <span className="stat-label">Altitude</span>
               <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>408.4 km</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span className="stat-label">Orbit Period</span>
               <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>92.8 min</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ISSSection;
