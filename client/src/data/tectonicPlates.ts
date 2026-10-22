/**
 * Major Global Tectonic Plate Boundaries GeoJSON FeatureCollection
 * Depicts convergent subduction trenches, divergent mid-ocean ridges, and transform fault zones
 */

export const TECTONIC_PLATES_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // 1. Pacific Ring of Fire - Western Subduction Rim (Aleutians -> Kurils -> Japan -> Izu-Bonin -> Mariana)
    {
      type: 'Feature',
      properties: { name: 'Pacific Rim - Northwest Subduction Megathrust', type: 'convergent', color: '#f59e0b' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-165, 54], [-175, 52], [180, 51.5], [170, 52], [160, 53], [150, 48],
          [145, 44], [142, 38], [140, 34], [142, 28], [145, 20], [144, 12],
          [140, 5], [135, -1], [142, -5], [150, -8], [158, -10], [165, -15],
          [170, -20], [175, -25], [178, -35], [176, -42]
        ]
      }
    },
    // 2. Pacific Ring of Fire - Eastern Subduction Rim (Cascadia -> San Andreas -> Middle America -> Peru-Chile Trench)
    {
      type: 'Feature',
      properties: { name: 'Cascadia Subduction Zone', type: 'convergent', color: '#f59e0b' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-128, 51], [-127, 48], [-125.5, 44], [-124.5, 40.5]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'San Andreas Fault System', type: 'transform', color: '#ef4444' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-124.5, 40.5], [-123, 38], [-121.5, 36], [-119.5, 34.8], [-117.5, 33.5], [-115, 31.8], [-112, 28]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Middle America Trench', type: 'convergent', color: '#f59e0b' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-106, 20], [-102, 17.5], [-97, 15], [-93, 14], [-88, 12], [-83, 8.5]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Peru-Chile Megathrust Subduction Trench', type: 'convergent', color: '#f59e0b' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-81, 2], [-81, -5], [-78, -12], [-74, -18], [-71, -25], [-72, -35], [-74, -45], [-75, -52]
        ]
      }
    },
    // 3. Mid-Atlantic Ridge (Divergent spreading center)
    {
      type: 'Feature',
      properties: { name: 'Mid-Atlantic Spreading Ridge', type: 'divergent', color: '#00e5ff' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-19, 80], [-10, 75], [-18, 70], [-21, 65], [-29, 60], [-35, 50],
          [-43, 40], [-35, 30], [-42, 20], [-38, 10], [-25, 0], [-15, -10],
          [-13, -20], [-14, -30], [-15, -40], [-18, -50], [-15, -55]
        ]
      }
    },
    // 4. Alpine-Himalayan Orogenic Collision Belt (African/Arabian/Indian -> Eurasian)
    {
      type: 'Feature',
      properties: { name: 'Alpine-Himalayan Seismic Belt', type: 'convergent', color: '#f59e0b' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-5, 36], [5, 37], [14, 38], [22, 38], [28, 38], [36, 37],
          [44, 38], [52, 35], [60, 32], [68, 30], [75, 34], [85, 29],
          [95, 28], [98, 24], [96, 18], [94, 10], [98, 3], [105, -5], [115, -8], [125, -8]
        ]
      }
    },
    // 5. East Anatolian & North Anatolian Fault Zones
    {
      type: 'Feature',
      properties: { name: 'North & East Anatolian Faults', type: 'transform', color: '#ef4444' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [26, 40.5], [30, 40.7], [35, 40.2], [39, 39.5], [41, 39.2],
          [39, 39.5], [37.5, 38.2], [36.5, 37.0], [35.8, 36.2]
        ]
      }
    },
    // 6. East African Rift System
    {
      type: 'Feature',
      properties: { name: 'East African Continental Rift', type: 'divergent', color: '#00e5ff' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [43, 12], [41, 8], [37, 3], [36, -2], [34, -7], [34, -15], [35, -20]
        ]
      }
    }
  ]
};
