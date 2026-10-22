/**
 * USGS Earthquake Hazards Program Real-Time & Historical Ingestion Service
 * Ingests global seismic events from USGS NEIC GeoJSON feed
 * Normalizes to standard GeoPulse GeoJSON specification
 */

import { LRUCache } from 'lru-cache';

// In-memory cache for live USGS feed (15 minutes TTL)
const earthquakeCache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 15 // 15 mins
});

const USGS_M45_FEED = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';

/**
 * High-profile historical mega-earthquakes (2020-2026) for timeline playback
 */
export const HISTORICAL_EARTHQUAKES = [
  {
    type: 'Feature',
    id: 'usgs_turkey_syria_2023_main',
    geometry: {
      type: 'Point',
      coordinates: [37.032, 37.174, 10.0] // [lon, lat, depth_km]
    },
    properties: {
      id: 'usgs_turkey_syria_2023_main',
      title: 'M 7.8 - 26 km E of Nurdağı, Turkey (Kahramanmaraş)',
      category: 'earthquake',
      timestamp: new Date('2023-02-06T01:17:35Z').getTime(),
      dateStr: '2023-02-06',
      magnitude: 7.8,
      magnitudeUnit: 'MWW',
      depth_km: 10.0,
      tsunami: false,
      sig: 2910,
      anomaly_c: 0,
      severity: 'catastrophic',
      locationName: 'East Anatolian Fault Zone, Turkey',
      description: 'Devastating strike-slip earthquake causing surface ruptures over 300 km and profound regional structural collapse across southern Turkey and northern Syria.',
      sources: [{ id: 'USGS NEIC', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us6000jllz' }]
    }
  },
  {
    type: 'Feature',
    id: 'usgs_turkey_aftershock_2023',
    geometry: {
      type: 'Point',
      coordinates: [37.203, 38.024, 7.4]
    },
    properties: {
      id: 'usgs_turkey_aftershock_2023',
      title: 'M 7.5 - 4 km SSE of Ekinözü, Turkey',
      category: 'earthquake',
      timestamp: new Date('2023-02-06T10:24:49Z').getTime(),
      dateStr: '2023-02-06',
      magnitude: 7.5,
      magnitudeUnit: 'MWW',
      depth_km: 7.4,
      tsunami: false,
      sig: 2050,
      anomaly_c: 0,
      severity: 'catastrophic',
      locationName: 'Çardak Fault, Turkey',
      description: 'Second massive doublet earthquake triggered 9 hours later along the intersecting Çardak fault branch.',
      sources: [{ id: 'USGS NEIC', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us6000jlqa' }]
    }
  },
  {
    type: 'Feature',
    id: 'usgs_japan_noto_2024',
    geometry: {
      type: 'Point',
      coordinates: [137.242, 37.498, 10.0]
    },
    properties: {
      id: 'usgs_japan_noto_2024',
      title: 'M 7.5 - Noto Peninsula, Ishikawa, Japan',
      category: 'earthquake',
      timestamp: new Date('2024-01-01T07:10:09Z').getTime(),
      dateStr: '2024-01-01',
      magnitude: 7.5,
      magnitudeUnit: 'MWW',
      depth_km: 10.0,
      tsunami: true,
      sig: 2180,
      anomaly_c: 0,
      severity: 'catastrophic',
      locationName: 'Noto Peninsula, Japan Sea',
      description: 'Shallow reverse faulting on New Year\'s Day generating major tsunami warnings along the Sea of Japan coast and massive coastal uplift.',
      sources: [{ id: 'USGS NEIC', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us6000m0xl' }]
    }
  },
  {
    type: 'Feature',
    id: 'usgs_morocco_atlas_2023',
    geometry: {
      type: 'Point',
      coordinates: [-8.396, 31.058, 26.0]
    },
    properties: {
      id: 'usgs_morocco_atlas_2023',
      title: 'M 6.8 - 72 km SW of Marrakech, Morocco (High Atlas)',
      category: 'earthquake',
      timestamp: new Date('2023-09-08T22:11:01Z').getTime(),
      dateStr: '2023-09-08',
      magnitude: 6.8,
      magnitudeUnit: 'MWW',
      depth_km: 26.0,
      tsunami: false,
      sig: 1840,
      anomaly_c: 0,
      severity: 'catastrophic',
      locationName: 'High Atlas Mountains, Morocco',
      description: 'Rare intraplate oblique-reverse faulting in the High Atlas mountains, the deadliest seismic event in modern Moroccan history.',
      sources: [{ id: 'USGS NEIC', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us7000kufc' }]
    }
  },
  {
    type: 'Feature',
    id: 'usgs_taiwan_hualien_2024',
    geometry: {
      type: 'Point',
      coordinates: [121.562, 23.819, 34.8]
    },
    properties: {
      id: 'usgs_taiwan_hualien_2024',
      title: 'M 7.4 - 18 km SSW of Hualien City, Taiwan',
      category: 'earthquake',
      timestamp: new Date('2024-04-02T23:58:11Z').getTime(),
      dateStr: '2024-04-03',
      magnitude: 7.4,
      magnitudeUnit: 'MWW',
      depth_km: 34.8,
      tsunami: true,
      sig: 1690,
      anomaly_c: 0,
      severity: 'catastrophic',
      locationName: 'Ryukyu Subduction Trench, Taiwan',
      description: 'Strongest earthquake to strike Taiwan in 25 years along the Philippine Sea plate boundary.',
      sources: [{ id: 'USGS NEIC', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us7000m59d' }]
    }
  },
  {
    type: 'Feature',
    id: 'usgs_haiti_nippes_2021',
    geometry: {
      type: 'Point',
      coordinates: [-73.481, 18.431, 10.0]
    },
    properties: {
      id: 'usgs_haiti_nippes_2021',
      title: 'M 7.2 - 13 km SSE of Petit Trou de Nippes, Haiti',
      category: 'earthquake',
      timestamp: new Date('2021-08-14T12:29:08Z').getTime(),
      dateStr: '2021-08-14',
      magnitude: 7.2,
      magnitudeUnit: 'MWW',
      depth_km: 10.0,
      tsunami: false,
      sig: 1540,
      anomaly_c: 0,
      severity: 'catastrophic',
      locationName: 'Enriquillo-Plantain Garden Fault, Haiti',
      description: 'Devastating strike-slip event on the Tiburon Peninsula causing widespread damage followed by Tropical Depression Grace.',
      sources: [{ id: 'USGS NEIC', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us6000f65h' }]
    }
  },
  {
    type: 'Feature',
    id: 'usgs_greece_samos_2020',
    geometry: {
      type: 'Point',
      coordinates: [26.790, 37.918, 21.0]
    },
    properties: {
      id: 'usgs_greece_samos_2020',
      title: 'M 7.0 - 14 km NNE of Néon Karlovásion, Greece (Aegean Sea)',
      category: 'earthquake',
      timestamp: new Date('2020-10-30T11:51:26Z').getTime(),
      dateStr: '2020-10-30',
      magnitude: 7.0,
      magnitudeUnit: 'MWW',
      depth_km: 21.0,
      tsunami: true,
      sig: 1420,
      anomaly_c: 0,
      severity: 'catastrophic',
      locationName: 'Aegean Sea Extensional Rift',
      description: 'Normal faulting in the eastern Aegean triggering localized tsunami waves affecting Samos and İzmir province, Turkey.',
      sources: [{ id: 'USGS NEIC', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us7000c144' }]
    }
  },
  {
    type: 'Feature',
    id: 'usgs_alaska_peninsula_2021',
    geometry: {
      type: 'Point',
      coordinates: [-157.917, 55.364, 32.2]
    },
    properties: {
      id: 'usgs_alaska_peninsula_2021',
      title: 'M 8.2 - 104 km SE of Perryville, Alaska Megathrust',
      category: 'earthquake',
      timestamp: new Date('2021-07-29T06:15:49Z').getTime(),
      dateStr: '2021-07-29',
      magnitude: 8.2,
      magnitudeUnit: 'MWW',
      depth_km: 32.2,
      tsunami: true,
      sig: 1980,
      anomaly_c: 0,
      severity: 'catastrophic',
      locationName: 'Aleutian Subduction Megathrust, Alaska',
      description: 'The strongest earthquake to strike the United States since 1965 along the Aleutian Arc subduction zone.',
      sources: [{ id: 'USGS NEIC', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/ak0219neiszm' }]
    }
  }
];

/**
 * Normalizes raw USGS GeoJSON Feature to GeoPulse HazardFeature standard
 */
export function normalizeUsgsEarthquake(rawFeature) {
  if (!rawFeature || !rawFeature.properties || !rawFeature.geometry) return null;

  const props = rawFeature.properties;
  const geom = rawFeature.geometry;
  const coords = geom.coordinates;
  if (!coords || coords.length < 2) return null;

  const lon = coords[0];
  const lat = coords[1];
  const depth = coords[2] !== undefined ? +coords[2].toFixed(1) : 10.0;

  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;

  const mag = typeof props.mag === 'number' ? +props.mag.toFixed(1) : 4.5;
  const time = props.time || Date.now();
  const dateStr = new Date(time).toISOString().split('T')[0];
  const tsunami = Boolean(props.tsunami);
  const sig = props.sig || Math.round(mag * 100);

  let severity = 'moderate';
  if (mag >= 7.0 || tsunami || sig >= 650) {
    severity = 'catastrophic';
  } else if (mag >= 5.5 || sig >= 350) {
    severity = 'severe';
  }

  return {
    type: 'Feature',
    id: `usgs_${rawFeature.id || props.code || Math.random().toString(36).substring(2, 9)}`,
    geometry: {
      type: 'Point',
      coordinates: [lon, lat, depth]
    },
    properties: {
      id: `usgs_${rawFeature.id || props.code}`,
      title: props.title || `M ${mag} Earthquake`,
      category: 'earthquake',
      timestamp: time,
      dateStr,
      magnitude: mag,
      magnitudeUnit: (props.magType || 'M').toUpperCase(),
      depth_km: depth,
      tsunami,
      sig,
      anomaly_c: 0,
      severity,
      locationName: props.place || 'Seismic Event Zone',
      description: `USGS monitored seismic rupture at ${depth} km focal depth. PAGER impact significance: ${sig}/1000. Tsunami alert: ${tsunami ? 'WARNING ACTIVE' : 'NO TSUNAMI'}.`,
      sources: [{ id: 'USGS NEIC', url: props.url || 'https://earthquake.usgs.gov' }]
    }
  };
}

/**
 * Ingests live USGS M4.5+ earthquakes and combines with curated historical earthquakes
 */
export async function getEarthquakes() {
  const cached = earthquakeCache.get('usgs_earthquakes_merged');
  if (cached) return cached;

  let liveFeatures = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(USGS_M45_FEED, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.features)) {
        liveFeatures = data.features
          .map(normalizeUsgsEarthquake)
          .filter(Boolean);
        console.log(`[USGS Pipeline] Ingested ${liveFeatures.length} live M4.5+ seismic events`);
      }
    }
  } catch (err) {
    console.warn('[USGS Pipeline] Notice during live fetch, utilizing historical catalog:', err.message);
  }

  // Deduplicate and combine live features with curated historical landmark earthquakes
  const mergedMap = new Map();

  for (const eq of HISTORICAL_EARTHQUAKES) {
    mergedMap.set(eq.id, eq);
  }

  for (const eq of liveFeatures) {
    mergedMap.set(eq.id, eq);
  }

  const allEarthquakes = Array.from(mergedMap.values()).sort(
    (a, b) => a.properties.timestamp - b.properties.timestamp
  );

  earthquakeCache.set('usgs_earthquakes_merged', allEarthquakes);
  return allEarthquakes;
}
