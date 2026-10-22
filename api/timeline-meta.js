import { HISTORICAL_HAZARD_EVENTS } from '../server/historicalData.js';

export default async function handler(req, res) {
  try {
    const yearStart = parseInt(req.query.year_start) || 2020;
    const yearEnd = parseInt(req.query.year_end) || 2025;

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
          categories: { wildfire: 0, volcano: 0, storm: 0, anomaly: 0 },
          peakAnomaly: 0,
          topEvents: []
        });
      }
    }

    for (const evt of HISTORICAL_HAZARD_EVENTS) {
      const ts = evt.properties.timestamp;
      const bucket = buckets.find(b => ts >= b.startTs && ts <= b.endTs);
      if (bucket) {
        bucket.total++;
        const cat = evt.properties.category || 'anomaly';
        bucket.categories[cat] = (bucket.categories[cat] || 0) + 1;
        if (Math.abs(evt.properties.anomaly_c || 0) > Math.abs(bucket.peakAnomaly)) {
          bucket.peakAnomaly = evt.properties.anomaly_c;
        }
      }
    }

    const maxCount = Math.max(...buckets.map(b => b.total), 1);

    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=600');
    res.status(200).json({
      yearStart,
      yearEnd,
      bucketResolution: 'month',
      bucketCount: buckets.length,
      maxDensity: maxCount,
      totalEvents: HISTORICAL_HAZARD_EVENTS.length,
      histogram: buckets.map(b => ({
        ...b,
        normalizedDensity: +(b.total / maxCount).toFixed(3)
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
