/**
 * GeoPulse Express API Server
 * Full-stack GIS Engineering MVP Gateway
 */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { getHazards } from './nasaEonet.js';
import { getAnomaliesForLocation, getGlobalClimateGrid } from './openMeteo.js';
import { HISTORICAL_HAZARD_EVENTS } from './historicalData.js';
import { getEarthquakes, HISTORICAL_EARTHQUAKES } from './usgsEarthquakes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable Brotli/Gzip compression on GeoJSON API routes as specified in Delivery Plan
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 1024 // Compress responses above 1KB
}));

app.use(cors());
app.use(express.json());

// API Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[GeoPulse API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    engine: 'GeoPulse GIS Engine v1.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/hazards (and alias /api/events)
 * Parameters: status ('all'|'open'|'closed'), days (integer), bbox (minLon,minLat,maxLon,maxLat), category
 * Response: GeoJSON FeatureCollection with Cache-Control: s-maxage=3600
 */
async function handleHazardsRequest(req, res) {
  try {
    const { status = 'all', days = 365, bbox, category } = req.query;

    const [eonetData, earthquakes] = await Promise.all([
      getHazards({
        status,
        days: Number(days) || 365,
        bbox: bbox || null,
        category: category && category !== 'earthquake' ? category : null
      }),
      (!category || category === 'all' || category === 'earthquake')
        ? getEarthquakes()
        : Promise.resolve([])
    ]);

    let mergedFeatures = [];
    if (!category || category === 'all') {
      mergedFeatures = [...(eonetData.features || []), ...earthquakes];
    } else if (category === 'earthquake') {
      mergedFeatures = earthquakes;
    } else {
      mergedFeatures = eonetData.features || [];
    }

    const responseData = {
      type: 'FeatureCollection',
      metadata: {
        ...(eonetData.metadata || {}),
        count: mergedFeatures.length,
        earthquakesCount: earthquakes.length
      },
      features: mergedFeatures
    };

    // Set Edge Cache Control header as specified in spec
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/geo+json');
    res.json(responseData);
  } catch (error) {
    console.error('Error handling hazards request:', error);
    res.status(500).json({ error: 'Failed to ingest hazard data', details: error.message });
  }
}

app.get('/api/hazards', handleHazardsRequest);
app.get('/api/events', handleHazardsRequest);

/**
 * GET /api/anomalies
 * Parameters: lat (float), lon (float), start (YYYY-MM-DD), end (YYYY-MM-DD)
 * Response: Array of daily temp deltas vs 30-year baseline mean
 */
app.get('/api/anomalies', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const { start, end } = req.query;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Missing or invalid lat/lon parameters' });
    }

    const result = await getAnomaliesForLocation({ lat, lon, start, end });
    res.setHeader('Cache-Control', 'public, s-maxage=7200, max-age=1800');
    res.json(result);
  } catch (error) {
    console.error('Error handling anomalies request:', error);
    res.status(500).json({ error: 'Failed to compute climate anomalies', details: error.message });
  }
});

/**
 * GET /api/timeline-meta
 * Parameters: year_start, year_end
 * Response: Keyframe density indexes for timeline scrubber histogram
 */
app.get('/api/timeline-meta', (req, res) => {
  try {
    const yearStart = parseInt(req.query.year_start) || 2020;
    const yearEnd = parseInt(req.query.year_end) || 2025;

    // Build monthly histogram buckets across target time span
    const buckets = [];
    for (let y = yearStart; y <= yearEnd; y++) {
      for (let m = 0; m < 12; m++) {
        const startTs = Date.UTC(y, m, 1);
        const endTs = Date.UTC(y, m + 1, 0, 23, 59, 59);
        const label = `${y}-${String(m + 1).padStart(2, '0')}`;

        buckets.push({
          label,
          year: y,
          month: m + 1,
          startTs,
          endTs,
          total: 0,
          categories: {
            wildfire: 0,
            volcano: 0,
            storm: 0,
            anomaly: 0,
            earthquake: 0
          },
          peakAnomaly: 0,
          topEvents: []
        });
      }
    }

    // Index all historical events into histogram buckets
    const allCatalogEvents = [...HISTORICAL_HAZARD_EVENTS, ...HISTORICAL_EARTHQUAKES];
    for (const evt of allCatalogEvents) {
      const ts = evt.properties.timestamp;
      const bucket = buckets.find(b => ts >= b.startTs && ts <= b.endTs);
      if (bucket) {
        bucket.total++;
        const cat = evt.properties.category || 'anomaly';
        bucket.categories[cat] = (bucket.categories[cat] || 0) + 1;
        if (Math.abs(evt.properties.anomaly_c || 0) > Math.abs(bucket.peakAnomaly)) {
          bucket.peakAnomaly = evt.properties.anomaly_c;
        }
        if (bucket.topEvents.length < 3 && evt.properties.severity === 'catastrophic') {
          bucket.topEvents.push({
            id: evt.id,
            title: evt.properties.title,
            category: evt.properties.category
          });
        }
      }
    }

    const maxCount = Math.max(...buckets.map(b => b.total), 1);

    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=600');
    res.json({
      yearStart,
      yearEnd,
      bucketResolution: 'month',
      bucketCount: buckets.length,
      maxDensity: maxCount,
      totalEvents: allCatalogEvents.length,
      histogram: buckets.map(b => ({
        ...b,
        normalizedDensity: +(b.total / maxCount).toFixed(3)
      }))
    });
  } catch (error) {
    console.error('Error handling timeline-meta request:', error);
    res.status(500).json({ error: 'Failed to compute timeline metadata', details: error.message });
  }
});

/**
 * GET /api/climate-grid
 * Generates dynamic vector grid isobars and chromatic heat layers
 */
app.get('/api/climate-grid', (req, res) => {
  try {
    const { date } = req.query;
    const gridData = getGlobalClimateGrid(date || '2023-07-15');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=600');
    res.json(gridData);
  } catch (error) {
    console.error('Error handling climate-grid request:', error);
    res.status(500).json({ error: 'Failed to compute climate grid', details: error.message });
  }
});

// Serve frontend static build if built (client/dist)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>GeoPulse GIS Server</title></head>
          <body style="font-family:sans-serif;background:#0d1117;color:#c9d1d9;padding:2rem;">
            <h1>GeoPulse GIS Gateway API is Active</h1>
            <p>API endpoints ready: <code>/api/hazards</code>, <code>/api/anomalies</code>, <code>/api/timeline-meta</code>, <code>/api/climate-grid</code></p>
            <p>Run <code>npm run dev:client</code> to launch the Vite WebGL interface.</p>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`[GeoPulse] GIS Gateway server listening on port ${PORT}`);
  console.log(`[GeoPulse] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[GeoPulse] Hazards feed: http://localhost:${PORT}/api/hazards`);
});
