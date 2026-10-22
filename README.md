# World Weather & Disaster Map (GeoPulse)

> **Full-Stack GIS Engineering MVP**  
> Historical Climate Anomalies, Wildfires & Volcanic Activity Geospatial Engine  
> Ingestion & Normalization: NASA EONET v3 & Open-Meteo ERA5 Reanalysis  
> Spatial Engine: Supercluster + Flatbush (Offloaded Web Worker)  
> Vector Render Canvas: WebGL direct GPU filtering with MapLibre GL  

---

## 1. System Scope & Core Architecture

The **GeoPulse Engine** is a high-performance geographic information system (GIS) designed to ingest, normalize, and visualize global environmental anomalies and extreme natural hazards over interactive historical timelines. The architecture pairs an Express proxy/aggregator layer with a client-side WebGL vector rendering pipeline capable of 60 FPS timeline playback across tens of thousands of coordinate points.

### Spatial Data & Runtime Ingestion Pipeline
```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│         Data Ingestion          │ ───▶  │      Express Aggregator API     │
│    NASA EONET + Open-Meteo      │       │     LRU Cache + GeoJSON Norm    │
└─────────────────────────────────┘       └─────────────────────────────────┘
                                                           │
                                                           ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│        WebGL Render Canvas      │ ◀───  │       Client Spatial Index      │
│     Mapbox/MapLibre GL Scrub    │       │     Flatbush + Supercluster     │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

---

## 2. Subsystem Functional Breakdown

### A. Natural Hazards Engine (EONET)
- **Source**: NASA Earth Observatory Natural Event Tracker (`EONET v3`).
- **Processing**: Parsing multi-temporal geometric events (points, clusters, and swarms).
- **Taxonomy**: Standardized categorical taxonomy (`wildfire`, `volcano`, `storm`, `anomaly`) with severity index, magnitude, and Thermal Radiative Power (TRP).

### B. Climate Anomalies (Open-Meteo)
- **Source**: Open-Meteo Historical Weather & Climate Reanalysis API.
- **Interpolation**: Computes baseline delta ($T_{current} - T_{baseline}$) against 1991–2020 ERA5 climatological averages.
- **Overlays**: Generates dynamic vector grid isobars and chromatic heat layers.

### C. Dynamic Temporal Playback
- **Clock Logic**: Continuous frame interpolation and clock logic running inside `requestAnimationFrame` with a delta timestamp accumulator.
- **Controls**: Play, Pause, Step (-30d, -1d, +1d, +30d), and Speed Presets (`1x`, `5x`, `30x` days/second).
- **Direct GPU Filtering**: The active date range updates layer filter expressions directly in WebGL memory (`['<=', ['get', 'timestamp'], currentTimestamp]`) to avoid DOM and React reconciliation stalls.
- **Density Scrubber**: Interactive histogram displaying monthly historical hazard frequencies and anomaly spikes.

### D. Spatial Indexing & Clustering
- **Supercluster**: Fast 2D hierarchical spatial clustering offloaded to a dedicated Web Worker to prevent UI thread lock.
- **Flatbush**: Static 2D spatial index for rapid bounding-box (bbox) queries during pan and zoom yielding results within $\le 4\text{ ms}$.
- **Cluster Decay**: Dynamic cluster radius calculation governed by current zoom level ($z0 - z16$).

---

## 3. Ingestion Pipeline & Data Schemas

The Express middleware normalizes external responses into an immutable, unified GeoJSON `FeatureCollection` format:

| Attribute | Type | Origin Source | Description & Normalization Notes |
| :--- | :--- | :--- | :--- |
| `id` | `String` | NASA / Open-Meteo | Unique composite hash (e.g., `eonet_5124_2024`). |
| `geometry` | `Point \| MultiPoint` | EONET Events | WGS84 EPSG:4326 standardized coordinates `[lon, lat]`. |
| `category` | `Enum String` | EONET Categories | Standardized to `wildfire`, `volcano`, `storm`, `anomaly`. |
| `timestamp` | `Unix Epoch (ms)` | ISO-8601 Strings | UTC millisecond integer used by the temporal scrubber index. |
| `magnitude` | `Float \| Null` | EONET / Calculation | Calibrated thermal area (acres), Richter scale, or wind speed (mph/kts). |
| `anomaly_c` | `Float (±15.0)` | Open-Meteo ERA5 | Surface temperature variance relative to 30-year climatological normal. |

---

## 4. Performance Benchmarks

- **60 FPS**: Timeline animation target maintained via `requestAnimationFrame` and direct WebGL memory filter updates.
- **< 4 ms**: Spatial query latency offloaded to the Supercluster/Flatbush Web Worker.
- **> 50,000**: Concurrent environmental telemetry nodes supported.

---

## 5. API Endpoints & Contract Matrix

| Endpoint Route | Method | Parameters | Response Schema / Cache Strategy |
| :--- | :--- | :--- | :--- |
| `/api/hazards` | `GET` | `status`, `days`, `bbox`, `category` | GeoJSON `FeatureCollection`; `Cache-Control: s-maxage=3600`. |
| `/api/anomalies` | `GET` | `lat`, `lon`, `start`, `end` | Array of daily temp deltas vs 30-year baseline mean with SVG chart data. |
| `/api/timeline-meta` | `GET` | `year_start`, `year_end` | Keyframe density indexes for timeline scrubber histogram. |
| `/api/climate-grid` | `GET` | `date` | Dynamic vector grid isobars and chromatic heat coordinates. |
| `/api/health` | `GET` | None | Engine status, uptime, and timestamp. |

---

## 6. Monorepo Project Structure

```
├── api/                        # Vercel Serverless Function Handlers
│   ├── anomalies.js
│   ├── climate-grid.js
│   ├── hazards.js
│   └── timeline-meta.js
├── client/                     # Frontend (React 19 + TypeScript + Vite)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ControlDeck.tsx       # Layers, Filters, & Preset bookmarks
│   │   │   ├── HazardInspector.tsx   # Slide-over telemetry & ERA5 micro-chart
│   │   │   ├── MapCanvas.tsx         # WebGL MapLibre GL vector canvas
│   │   │   ├── ThermalHeatOverlay.tsx# Chromatic heat & isobar vectors
│   │   │   ├── TimelineScrubber.tsx  # Dynamic temporal playback & histogram
│   │   │   ├── TopNav.tsx            # Header & Real-Time Performance HUD
│   │   │   └── WindParticleCanvas.tsx# Fluid atmospheric particle streamlines
│   │   ├── store/
│   │   │   └── useGeoStore.ts        # Zustand global state store
│   │   ├── types/
│   │   │   └── index.ts              # Core GIS data contracts & types
│   │   ├── workers/
│   │   │   └── spatialWorker.ts      # Supercluster & Flatbush Web Worker
│   │   ├── App.tsx
│   │   ├── index.css                 # Dark Glassmorphism GIS Design System
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                     # Backend Gateway (Node.js Express)
│   ├── historicalData.js       # Curated 2020-2026 hazard catalogue & swarms
│   ├── index.js                # Express Server, Brotli/Gzip, LRU cache
│   ├── nasaEonet.js            # NASA EONET v3 ingestion & normalizer
│   ├── openMeteo.js            # ERA5 30-year reanalysis baseline calculator
│   └── package.json
├── package.json                # Root orchestration
├── vercel.json                 # Vercel deployment configuration
└── README.md
```

---

## 7. Quickstart & Deployment

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node `v22.22.1`)
- npm `v9+`

### Installation
```bash
# Install all client and server dependencies
npm run install:all
```

### Development Mode
```bash
# Start backend Express server (port 3001)
npm run dev:server

# In a separate terminal, start Vite client dev server (port 5173)
npm run dev:client
```

### Production Build & Standalone Run
```bash
# Build the client production bundle
npm run build

# Start the unified production server (serves both API & WebGL App on port 3001)
npm start
```
Visit `http://localhost:3001` in your browser.

### Vercel Deployment
The repository is turnkey configured for Vercel Monorepo Serverless deployment:
- API routes are exported under `/api/*`
- Client static build outputs to `client/dist` via `vercel.json`
- Configure `VITE_MAPBOX_TOKEN` (optional) in Vercel project environment variables if custom Mapbox vector tiles are desired.
