import { getHazards } from '../server/nasaEonet.js';

export default async function handler(req, res) {
  try {
    const { status = 'all', days = 365, bbox, category } = req.query;
    const data = await getHazards({
      status,
      days: Number(days) || 365,
      bbox: bbox || null,
      category: category || null
    });
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/geo+json');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
