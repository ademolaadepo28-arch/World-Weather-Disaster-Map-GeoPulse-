import { getGlobalClimateGrid } from '../server/openMeteo.js';

export default async function handler(req, res) {
  try {
    const { date } = req.query;
    const gridData = getGlobalClimateGrid(date || '2023-07-15');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=600');
    res.status(200).json(gridData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
