import React, { useEffect, useRef, useCallback } from 'react';
import { Map, NavigationControl, type MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useGeoStore } from '../store/useGeoStore';
import { TECTONIC_PLATES_GEOJSON } from '../data/tectonicPlates';
import type { HazardFeature } from '../types';

interface MapCanvasProps {
  onMapReady?: (map: Map) => void;
}

// Generate realistic meteorological isobar contours based on planetary atmospheric cells
function generateIsobarsGeoJSON(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  const pressureLevels = [
    { hpa: 992, lats: [62, -62], label: '992 hPa Subpolar Low' },
    { hpa: 1004, lats: [50, -50], label: '1004 hPa Frontal Trough' },
    { hpa: 1012, lats: [38, -38], label: '1012 hPa Normal' },
    { hpa: 1022, lats: [28, -28], label: '1022 hPa Subtropical High' },
    { hpa: 1026, lats: [18, -18], label: '1026 hPa Thermal Ridge' },
    { hpa: 1014, lats: [2], label: '1014 hPa Intertropical Convergence Zone' }
  ];

  pressureLevels.forEach(({ hpa, lats, label }) => {
    lats.forEach((baseLat) => {
      const coords: [number, number][] = [];
      for (let lon = -180; lon <= 180; lon += 4) {
        // Rossby wave harmonic oscillations
        const wave = Math.sin((lon * Math.PI) / 60) * 5.5 + Math.cos((lon * Math.PI) / 30) * 2.8;
        coords.push([lon, Math.max(-85, Math.min(85, baseLat + wave))]);
      }
      features.push({
        type: 'Feature',
        properties: { pressure: hpa, label },
        geometry: {
          type: 'LineString',
          coordinates: coords
        }
      });
    });
  });

  return { type: 'FeatureCollection', features };
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ onMapReady }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const {
    allFeatures,
    currentTimestamp,
    showWildfires,
    showVolcanoes,
    showStorms,
    showAnomalies,
    showEarthquakes,
    showPlateBoundaries,
    showThermalHeat,
    showIsobars,
    clusteringEnabled,
    minSeverity,
    selectHazard,
    setQueryLatency,
    setVisibleCount
  } = useGeoStore();

  // Initialize Web Worker for spatial indexing (Flatbush + Supercluster)
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/spatialWorker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'QUERY_VIEWPORT_DONE') {
          if (payload.latencyMs !== undefined) {
            setQueryLatency(payload.latencyMs);
          }
          if (payload.count !== undefined) {
            setVisibleCount(payload.count);
          }
        }
      };
    } catch (err) {
      console.warn('[MapCanvas] Could not instantiate dedicated Web Worker:', err);
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, [setQueryLatency, setVisibleCount]);

  // Push features to Worker index whenever loaded
  useEffect(() => {
    if (workerRef.current && allFeatures.length > 0) {
      workerRef.current.postMessage({
        type: 'INIT_INDEX',
        payload: { features: allFeatures }
      });
    }
  }, [allFeatures]);

  // Query worker on viewport movement
  const triggerViewportQuery = useCallback(() => {
    const map = mapInstanceRef.current;
    const worker = workerRef.current;
    if (!map || !worker) return;

    const bounds = map.getBounds();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];
    const zoom = map.getZoom();

    const activeCategories = [];
    if (showWildfires) activeCategories.push('wildfire');
    if (showVolcanoes) activeCategories.push('volcano');
    if (showStorms) activeCategories.push('storm');
    if (showAnomalies) activeCategories.push('anomaly');
    if (showEarthquakes) activeCategories.push('earthquake');

    worker.postMessage({
      type: 'QUERY_VIEWPORT',
      payload: {
        bbox,
        zoom,
        maxTimestamp: currentTimestamp,
        categories: activeCategories,
        minSeverity,
        useClustering: clusteringEnabled
      }
    });
  }, [
    currentTimestamp,
    showWildfires,
    showVolcanoes,
    showStorms,
    showAnomalies,
    showEarthquakes,
    minSeverity,
    clusteringEnabled
  ]);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = new Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap, © CARTO'
          }
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: [15, 25],
      zoom: 2.2,
      maxZoom: 16,
      minZoom: 1.2,
      attributionControl: false
    });

    map.addControl(new NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      // 1. Clustered Hazards GeoJSON Source
      map.addSource('hazards-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
        clusterProperties: {
          minTimestamp: ['min', ['get', 'timestamp']]
        }
      });

      // 2. Unclustered Raw Hazards GeoJSON Source
      map.addSource('hazards-raw-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        cluster: false
      });

      // 3. Meteorological Isobars GeoJSON Source
      map.addSource('isobars-source', {
        type: 'geojson',
        data: generateIsobarsGeoJSON()
      });

      // 4. Global Tectonic Plate Boundaries GeoJSON Source
      map.addSource('tectonic-plates-source', {
        type: 'geojson',
        data: TECTONIC_PLATES_GEOJSON
      });

      // 5. Tectonic Plates Glowing Halo Layer
      map.addLayer({
        id: 'tectonic-plates-glow',
        type: 'line',
        source: 'tectonic-plates-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4,
          'line-opacity': 0.35,
          'line-blur': 1.5
        }
      });

      // 6. Tectonic Plates Core Dashed Fault Lines
      map.addLayer({
        id: 'tectonic-plates-core',
        type: 'line',
        source: 'tectonic-plates-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 1.6,
          'line-dasharray': [4, 2],
          'line-opacity': 0.8
        }
      });

      // 7. Native WebGL Heatmap Layer (for Thermal Heat Anomaly)
      map.addLayer({
        id: 'hazard-heatmap',
        type: 'heatmap',
        source: 'hazards-raw-source',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['abs', ['coalesce', ['get', 'anomaly_c'], 1]],
            0, 0.1,
            5, 0.6,
            12, 1.0
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1.2,
            6, 2.5,
            10, 4.0
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.2, 'rgba(0, 229, 255, 0.25)',
            0.4, 'rgba(16, 185, 129, 0.45)',
            0.6, 'rgba(255, 200, 0, 0.65)',
            0.8, 'rgba(255, 85, 0, 0.8)',
            1.0, 'rgba(255, 0, 85, 0.95)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 8,
            4, 18,
            8, 36
          ],
          'heatmap-opacity': 0.75
        }
      });

      // 8. Isobar Pressure Contour Lines
      map.addLayer({
        id: 'isobar-lines',
        type: 'line',
        source: 'isobars-source',
        paint: {
          'line-color': '#60a5fa',
          'line-width': 1.2,
          'line-dasharray': [3, 2],
          'line-opacity': 0.55
        }
      });

      // 9. Isobar Pressure Labels
      map.addLayer({
        id: 'isobar-labels',
        type: 'symbol',
        source: 'isobars-source',
        layout: {
          'text-field': '{label}',
          'symbol-placement': 'line',
          'text-size': 10,
          'text-font': ['Open Sans Bold']
        },
        paint: {
          'text-color': '#93c5fd',
          'text-halo-color': '#070a11',
          'text-halo-width': 1.5
        }
      });

      // 10. Add Cluster Circles
      map.addLayer({
        id: 'hazard-clusters',
        type: 'circle',
        source: 'hazards-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#ff5500',
            15,
            '#ff0055',
            45,
            '#00e5ff',
            100,
            '#c084fc'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            16,
            15,
            22,
            45,
            28,
            100,
            36
          ],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.6
        }
      });

      // 11. Add Cluster Count Labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'hazards-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // 12. Glowing Halos (Clustered Source)
      map.addLayer({
        id: 'hazard-halo',
        type: 'circle',
        source: 'hazards-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            2, 10,
            6, 18,
            12, 28
          ],
          'circle-color': [
            'match',
            ['get', 'category'],
            'wildfire', 'rgba(255, 85, 0, 0.35)',
            'volcano', 'rgba(255, 0, 85, 0.4)',
            'storm', 'rgba(0, 229, 255, 0.35)',
            'anomaly', 'rgba(192, 132, 252, 0.35)',
            'earthquake', 'rgba(245, 158, 11, 0.4)',
            'rgba(255, 255, 255, 0.2)'
          ],
          'circle-blur': 0.6
        }
      });

      // 13. Individual Core Points (Clustered Source)
      map.addLayer({
        id: 'hazard-points',
        type: 'circle',
        source: 'hazards-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            2, 4.5,
            6, 7.5,
            12, 13
          ],
          'circle-color': [
            'match',
            ['get', 'category'],
            'wildfire', '#ff5500',
            'volcano', '#ff0055',
            'storm', '#00e5ff',
            'anomaly', '#c084fc',
            'earthquake', '#f59e0b',
            '#ffffff'
          ],
          'circle-stroke-width': 1.8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.95,
          'circle-opacity': 0.95
        }
      });

      // 14. Glowing Halos (Raw Unclustered Source)
      map.addLayer({
        id: 'hazard-halo-raw',
        type: 'circle',
        source: 'hazards-raw-source',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            2, 10,
            6, 18,
            12, 28
          ],
          'circle-color': [
            'match',
            ['get', 'category'],
            'wildfire', 'rgba(255, 85, 0, 0.35)',
            'volcano', 'rgba(255, 0, 85, 0.4)',
            'storm', 'rgba(0, 229, 255, 0.35)',
            'anomaly', 'rgba(192, 132, 252, 0.35)',
            'earthquake', 'rgba(245, 158, 11, 0.4)',
            'rgba(255, 255, 255, 0.2)'
          ],
          'circle-blur': 0.6
        }
      });

      // 15. Individual Core Points (Raw Unclustered Source)
      map.addLayer({
        id: 'hazard-points-raw',
        type: 'circle',
        source: 'hazards-raw-source',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            2, 4.5,
            6, 7.5,
            12, 13
          ],
          'circle-color': [
            'match',
            ['get', 'category'],
            'wildfire', '#ff5500',
            'volcano', '#ff0055',
            'storm', '#00e5ff',
            'anomaly', '#c084fc',
            'earthquake', '#f59e0b',
            '#ffffff'
          ],
          'circle-stroke-width': 1.8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.95,
          'circle-opacity': 0.95
        }
      });

      // Common Click Handler on Individual Hazard Point
      const handlePointClick = (e: MapLayerMouseEvent) => {
        if (!e.features || !e.features.length) return;
        const feat = e.features[0];
        const props = feat.properties as any;
        const geom = feat.geometry as any;

        const coords = geom.coordinates;
        const hazardFeature: HazardFeature = {
          type: 'Feature',
          id: props.id || feat.id?.toString() || 'unknown',
          geometry: {
            type: 'Point',
            coordinates: [coords[0], coords[1]]
          },
          properties: {
            ...props,
            timestamp: Number(props.timestamp),
            magnitude: props.magnitude ? Number(props.magnitude) : null,
            anomaly_c: props.anomaly_c ? Number(props.anomaly_c) : 0,
            trp_mw: props.trp_mw ? Number(props.trp_mw) : undefined,
            depth_km: props.depth_km ? Number(props.depth_km) : undefined,
            tsunami: props.tsunami === true || props.tsunami === 'true',
            sig: props.sig ? Number(props.sig) : undefined
          }
        };

        selectHazard(hazardFeature);
      };

      map.on('click', 'hazard-points', handlePointClick);
      map.on('click', 'hazard-points-raw', handlePointClick);

      // Interactive Click on Cluster -> Zoom In
      map.on('click', 'hazard-clusters', (e: MapLayerMouseEvent) => {
        if (!e.features || !e.features.length) return;
        const clusterId = e.features[0].properties?.cluster_id;
        const source: any = map.getSource('hazards-source');
        if (source && clusterId !== undefined) {
          source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return;
            const geom = e.features![0].geometry as any;
            map.easeTo({
              center: geom.coordinates,
              zoom: Math.min(zoom + 0.5, 14),
              duration: 600
            });
          });
        }
      });

      // Cursor Pointers
      const setPointer = () => { map.getCanvas().style.cursor = 'pointer'; };
      const resetPointer = () => { map.getCanvas().style.cursor = ''; };

      map.on('mouseenter', 'hazard-points', setPointer);
      map.on('mouseleave', 'hazard-points', resetPointer);
      map.on('mouseenter', 'hazard-points-raw', setPointer);
      map.on('mouseleave', 'hazard-points-raw', resetPointer);
      map.on('mouseenter', 'hazard-clusters', setPointer);
      map.on('mouseleave', 'hazard-clusters', resetPointer);

      map.on('moveend', () => {
        triggerViewportQuery();
      });

      mapInstanceRef.current = map;
      if (onMapReady) onMapReady(map);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [selectHazard, triggerViewportQuery, onMapReady]);

  // Update GeoJSON source data when allFeatures change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const sourceClustered: any = map.getSource('hazards-source');
    const sourceRaw: any = map.getSource('hazards-raw-source');

    if (sourceClustered) {
      sourceClustered.setData({
        type: 'FeatureCollection',
        features: allFeatures
      });
    }

    if (sourceRaw) {
      sourceRaw.setData({
        type: 'FeatureCollection',
        features: allFeatures
      });
    }

    triggerViewportQuery();
  }, [allFeatures, triggerViewportQuery]);

  // Direct GPU WebGL Filter Execution & Layer Visibility Management
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const activeCategories: string[] = [];
    if (showWildfires) activeCategories.push('wildfire');
    if (showVolcanoes) activeCategories.push('volcano');
    if (showStorms) activeCategories.push('storm');
    if (showAnomalies) activeCategories.push('anomaly');
    if (showEarthquakes) activeCategories.push('earthquake');

    // Build WebGL filter expression:
    // Safe category filter handling empty array gracefully
    const categoryFilter = activeCategories.length > 0
      ? ['in', ['get', 'category'], ['literal', activeCategories]]
      : ['==', 1, 0];

    const timeFilter = ['<=', ['get', 'timestamp'], currentTimestamp];

    let combinedFilter: any[];
    if (minSeverity === 'catastrophic') {
      combinedFilter = ['all', timeFilter, categoryFilter, ['==', ['get', 'severity'], 'catastrophic']];
    } else if (minSeverity === 'severe') {
      combinedFilter = [
        'all',
        timeFilter,
        categoryFilter,
        ['in', ['get', 'severity'], ['literal', ['severe', 'catastrophic']]]
      ];
    } else {
      combinedFilter = ['all', timeFilter, categoryFilter];
    }

    const clusterFilter = ['all', ['has', 'point_count'], ['<=', ['get', 'minTimestamp'], currentTimestamp]];

    try {
      // 1. Update filter expressions in WebGL memory
      if (map.getLayer('hazard-points')) {
        map.setFilter('hazard-points', ['all', ['!', ['has', 'point_count']], combinedFilter] as any);
      }
      if (map.getLayer('hazard-halo')) {
        map.setFilter('hazard-halo', ['all', ['!', ['has', 'point_count']], combinedFilter] as any);
      }
      if (map.getLayer('hazard-points-raw')) {
        map.setFilter('hazard-points-raw', combinedFilter as any);
      }
      if (map.getLayer('hazard-halo-raw')) {
        map.setFilter('hazard-halo-raw', combinedFilter as any);
      }
      if (map.getLayer('hazard-clusters')) {
        map.setFilter('hazard-clusters', clusterFilter as any);
      }
      if (map.getLayer('cluster-count')) {
        map.setFilter('cluster-count', clusterFilter as any);
      }
      if (map.getLayer('hazard-heatmap')) {
        map.setFilter('hazard-heatmap', combinedFilter as any);
      }

      // 2. Dynamic Layer Visibility Management
      const clusteredVis = clusteringEnabled ? 'visible' : 'none';
      const rawVis = clusteringEnabled ? 'none' : 'visible';
      const heatVis = showThermalHeat ? 'visible' : 'none';
      const isobarsVis = showIsobars ? 'visible' : 'none';
      const platesVis = showPlateBoundaries ? 'visible' : 'none';

      if (map.getLayer('hazard-clusters')) {
        map.setLayoutProperty('hazard-clusters', 'visibility', clusteredVis);
      }
      if (map.getLayer('cluster-count')) {
        map.setLayoutProperty('cluster-count', 'visibility', clusteredVis);
      }
      if (map.getLayer('hazard-points')) {
        map.setLayoutProperty('hazard-points', 'visibility', clusteredVis);
      }
      if (map.getLayer('hazard-halo')) {
        map.setLayoutProperty('hazard-halo', 'visibility', clusteredVis);
      }
      if (map.getLayer('hazard-points-raw')) {
        map.setLayoutProperty('hazard-points-raw', 'visibility', rawVis);
      }
      if (map.getLayer('hazard-halo-raw')) {
        map.setLayoutProperty('hazard-halo-raw', 'visibility', rawVis);
      }
      if (map.getLayer('hazard-heatmap')) {
        map.setLayoutProperty('hazard-heatmap', 'visibility', heatVis);
      }
      if (map.getLayer('isobar-lines')) {
        map.setLayoutProperty('isobar-lines', 'visibility', isobarsVis);
      }
      if (map.getLayer('isobar-labels')) {
        map.setLayoutProperty('isobar-labels', 'visibility', isobarsVis);
      }
      if (map.getLayer('tectonic-plates-glow')) {
        map.setLayoutProperty('tectonic-plates-glow', 'visibility', platesVis);
      }
      if (map.getLayer('tectonic-plates-core')) {
        map.setLayoutProperty('tectonic-plates-core', 'visibility', platesVis);
      }
    } catch {
      // Ignore initial render race condition
    }

    triggerViewportQuery();
  }, [
    currentTimestamp,
    showWildfires,
    showVolcanoes,
    showStorms,
    showAnomalies,
    showEarthquakes,
    showPlateBoundaries,
    showThermalHeat,
    showIsobars,
    clusteringEnabled,
    minSeverity,
    triggerViewportQuery
  ]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#070a11',
        zIndex: 1
      }}
    />
  );
};
