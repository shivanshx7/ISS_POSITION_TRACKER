# SpaceWatch – Live ISS Tracker & News Dashboard

SpaceWatch is a real-time tracking and news aggregation dashboard designed to monitor Low Earth Orbit (LEO) telemetries—specifically the International Space Station (ISS)—alongside a curated global news feed. 

This project blends real-time geospatial data visualization, live telemetry analytics, and dynamic content filtering into a seamless, dark-themed user interface.

---

## 🚀 Features

### 1. Real-Time Orbit Tracking
* **Live ISS Position:** Tracks the current latitude, longitude, and absolute velocity ($27,600 \text{ km/h}$) of the ISS.
* **Geospatial Mapping:** Integrated Leaflet map rendering current paths over global terrain (e.g., *Atlantic Ocean (South)*).
* **Telemetry Stream:** Continuous metrics for Uplink status, Orbit Period ($92.8 \text{ min}$), Altitude ($408.4 \text{ km}$), and a Data Rate of $1.2 \text{ GB/s}$.

### 2. Live Demographics & Trends
* **Humans in Space Counter:** Displays the exact count of active crew members in orbit (currently tracking 12 humans across the ISS and TIANGONG space stations).
* **Velocity Trend Analytics:** Visual chart components mapping speed fluctuations and minor orbital adjustments over time.

### 3. Global News Feed & Aggregator
* **Multi-Category Sorting:** Quickly filter articles by *Top*, *Technology*, *Science*, *Health*, and *Sports*.
* **Flexible Organization:** Sort feeds dynamically by either *Date* or *News Source*.
* **Source Distribution Analytics:** Visual breakdown tracking where global updates are generating from (e.g., WSJ, Indian Express, Yahoo, etc.).

---

## 🛠️ Tech Stack

* **Frontend Library:** React.js (Vite environment)
* **Styling:** Tailwind CSS (Custom Dark Theme configuration)
* **Mapping UI:** Leaflet.js / React-Leaflet
* **Icons & Components:** Lucide React / Custom SVG Assets
* **State Management:** React Context API / Hooks for live telemetry data streams

---

<pre>
src/
├── components/
│   ├── Navbar.jsx          # Branding, network uptime status, user profile
│   ├── TelemetryCard.jsx   # Live updates for Altitude, Period, and Data Rates
│   ├── OrbitMap.jsx        # Leaflet integration for live tracking
│   ├── CrewList.jsx        # Registry of astronauts currently in space
│   └── NewsFeed.jsx        # Clean grid layout for news cards & filters
├── hooks/
│   └── useISSData.js       # Custom polling hook for telemetry and coordinates
├── App.jsx                 # Core dashboard layouts and grids
└── main.jsx                # DOM rendering entry point
</pre>
