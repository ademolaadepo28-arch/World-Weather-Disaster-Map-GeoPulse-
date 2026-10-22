import { getAnomaliesForLocation } from '../server/openMeteo.js';

export default async function handler(req, res) {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const { start, end } = req.query;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Missing or invalid lat/lon parameters' });
    }

    const result = await getAnomaliesForLocation({ lat, lon, start, end });
    res.setHeader('Cache-Control', 'public, s-maxage=7200, max-age=1800');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
