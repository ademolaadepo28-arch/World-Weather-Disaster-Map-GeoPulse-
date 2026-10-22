import Supercluster from 'supercluster';
import Flatbush from 'flatbush';
import type { HazardFeature, HazardCategory, HazardSeverity } from '../types';

let superclusterInstance: any = null;
let flatbushIndex: Flatbush | null = null;
let indexedFeatures: HazardFeature[] = [];

// Listen for messages from the main thread
self.onmessage = (e: MessageEvent) => {
  const { type, payload, messageId } = e.data;

  switch (type) {
    case 'INIT_INDEX': {
      const startTime = performance.now();
      const features: HazardFeature[] = payload.features || [];
      indexedFeatures = features;

      // 1. Initialize Flatbush static 2D spatial index for fast bbox queries
      if (features.length > 0) {
        flatbushIndex = new Flatbush(features.length);
        for (let i = 0; i < features.length; i++) {
          const [lon, lat] = features[i].geometry.coordinates;
          // Point bounding box
          flatbushIndex.add(lon, lat, lon, lat);
        }
        flatbushIndex.finish();
      } else {
        flatbushIndex = null;
      }

      // 2. Initialize Supercluster hierarchical spatial clustering
      superclusterInstance = new Supercluster({
        radius: 45,
        maxZoom: 16,
        minPoints: 2
      });

      // Supercluster loads GeoJSON Features
      superclusterInstance.load(features);

      const latencyMs = +(performance.now() - startTime).toFixed(2);

      self.postMessage({
        type: 'INIT_INDEX_DONE',
        messageId,
        payload: {
          count: features.length,
          latencyMs
        }
      });
      break;
    }

    case 'QUERY_VIEWPORT': {
      const startTime = performance.now();
      const {
        bbox, // [minLon, minLat, maxLon, maxLat]
        zoom,
        maxTimestamp,
        categories,
        minSeverity,
        useClustering = true
      } = payload;

      let results: any[] = [];

      if (!bbox || bbox.length !== 4) {
        self.postMessage({
          type: 'QUERY_VIEWPORT_DONE',
          messageId,
          payload: { results: [], latencyMs: 0 }
        });
        return;
      }

      // Clamp bbox to WGS84 boundaries
      const clampedBbox: [number, number, number, number] = [
        Math.max(-180, bbox[0]),
        Math.max(-85, bbox[1]),
        Math.min(180, bbox[2]),
        Math.min(85, bbox[3])
      ];

      const activeCategories = new Set<HazardCategory>(categories || ['wildfire', 'volcano', 'storm', 'anomaly', 'earthquake']);

      const severityRank: Record<HazardSeverity, number> = {
        low: 1,
        moderate: 2,
        severe: 3,
        catastrophic: 4
      };
      const minRank = minSeverity && minSeverity !== 'all' ? (severityRank[minSeverity as HazardSeverity] || 1) : 1;

      if (useClustering && superclusterInstance) {
        // Hierarchical Supercluster query
        const intZoom = Math.max(0, Math.min(16, Math.floor(zoom || 2)));
        const rawClusters = superclusterInstance.getClusters(clampedBbox, intZoom);

        // Filter clusters and leaf features by timestamp and categories
        results = rawClusters.filter((item: any) => {
          if (item.properties.cluster) {
            return true;
          }
          // Single feature check
          const props = item.properties;
          if (maxTimestamp && props.timestamp > maxTimestamp) return false;
          if (!activeCategories.has(props.category)) return false;
          if (severityRank[props.severity as HazardSeverity] < minRank) return false;
          return true;
        });
      } else if (flatbushIndex) {
        // Fast static Flatbush bbox search (<=4ms)
        const indices = flatbushIndex.search(
          clampedBbox[0],
          clampedBbox[1],
          clampedBbox[2],
          clampedBbox[3]
        );

        for (let i = 0; i < indices.length; i++) {
          const feat = indexedFeatures[indices[i]];
          if (!feat) continue;

          const props = feat.properties;
          if (maxTimestamp && props.timestamp > maxTimestamp) continue;
          if (!activeCategories.has(props.category)) continue;
          if (severityRank[props.severity as HazardSeverity] < minRank) continue;

          results.push(feat);
        }
      }

      const latencyMs = +(performance.now() - startTime).toFixed(2);

      self.postMessage({
        type: 'QUERY_VIEWPORT_DONE',
        messageId,
        payload: {
          results,
          count: results.length,
          latencyMs
        }
      });
      break;
    }

    default:
      console.warn('[SpatialWorker] Unknown message type:', type);
  }
};
