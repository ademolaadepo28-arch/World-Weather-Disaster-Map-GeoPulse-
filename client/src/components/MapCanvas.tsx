import React, { useEffect, useRef, useCallback } from 'react';
import { Map, NavigationControl, type MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useGeoStore } from '../store/useGeoStore';
import type { HazardFeature } from '../types';

interface MapCanvasProps {
  onMapReady?: (map: Map) => void;
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
      // 1. Add Hazards GeoJSON Source
      map.addSource('hazards-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // 2. Add Cluster Circles
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

      // 3. Add Cluster Count Labels
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

      // 4. Add Glowing Outer Halos for Individual Hazard Events
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
            2,
            10,
            6,
            18,
            12,
            28
          ],
          'circle-color': [
            'match',
            ['get', 'category'],
            'wildfire',
            'rgba(255, 85, 0, 0.35)',
            'volcano',
            'rgba(255, 0, 85, 0.4)',
            'storm',
            'rgba(0, 229, 255, 0.35)',
            'anomaly',
            'rgba(192, 132, 252, 0.35)',
            'rgba(255, 255, 255, 0.2)'
          ],
          'circle-blur': 0.6
        }
      });

      // 5. Add Individual Core Hazard Points
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
            2,
            4.5,
            6,
            7.5,
            12,
            13
          ],
          'circle-color': [
            'match',
            ['get', 'category'],
            'wildfire',
            '#ff5500',
            'volcano',
            '#ff0055',
            'storm',
            '#00e5ff',
            'anomaly',
            '#c084fc',
            '#ffffff'
          ],
          'circle-stroke-width': 1.8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.95,
          'circle-opacity': 0.95
        }
      });

      // Interactive Click on Individual Hazard Point
      map.on('click', 'hazard-points', (e: MapLayerMouseEvent) => {
        if (!e.features || !e.features.length) return;
        const feat = e.features[0];
        const props = feat.properties as any;
        const geom = feat.geometry as any;

        const hazardFeature: HazardFeature = {
          type: 'Feature',
          id: props.id || feat.id?.toString() || 'unknown',
          geometry: {
            type: 'Point',
            coordinates: [geom.coordinates[0], geom.coordinates[1]]
          },
          properties: {
            ...props,
            timestamp: Number(props.timestamp),
            magnitude: props.magnitude ? Number(props.magnitude) : null,
            anomaly_c: props.anomaly_c ? Number(props.anomaly_c) : 0,
            trp_mw: props.trp_mw ? Number(props.trp_mw) : undefined
          }
        };

        selectHazard(hazardFeature);
      });

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
      map.on('mouseenter', 'hazard-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'hazard-points', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'hazard-clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'hazard-clusters', () => {
        map.getCanvas().style.cursor = '';
      });

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

    const source: any = map.getSource('hazards-source');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: allFeatures
      });
      triggerViewportQuery();
    }
  }, [allFeatures, triggerViewportQuery]);

  // Direct GPU WebGL Filter Execution (Section 4 Performance Model)
  // Direct GPU Filtering: The active date range updates layer filter expressions directly in WebGL memory
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const activeCategories: string[] = [];
    if (showWildfires) activeCategories.push('wildfire');
    if (showVolcanoes) activeCategories.push('volcano');
    if (showStorms) activeCategories.push('storm');
    if (showAnomalies) activeCategories.push('anomaly');

    // Build WebGL filter expression:
    // (timestamp <= currentTimestamp) AND (category in activeCategories) AND (severity >= minSeverity)
    const categoryFilter = ['match', ['get', 'category'], activeCategories, true, false];
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

    try {
      if (map.getLayer('hazard-points')) {
        map.setFilter('hazard-points', ['all', ['!', ['has', 'point_count']], combinedFilter] as any);
      }
      if (map.getLayer('hazard-halo')) {
        map.setFilter('hazard-halo', ['all', ['!', ['has', 'point_count']], combinedFilter] as any);
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
