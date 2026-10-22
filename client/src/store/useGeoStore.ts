import { create } from 'zustand';
import type {
  HazardFeature,
  HazardSeverity,
  TimelineMetaResponse,
  AnomalyProfile,
  ClimateGridData,
  MapPreset
} from '../types';

export const MAP_PRESETS: MapPreset[] = [
  {
    id: 'tonga',
    name: 'Tonga Megavolcano Shockwave',
    description: 'Jan 2022 historic VEI-5.8 eruption with global atmospheric pressure shockwave.',
    center: [-175.38, -20.57],
    zoom: 4.5,
    targetDate: '2022-01-15',
    category: 'volcano'
  },
  {
    id: 'canada_fires',
    name: 'Canadian Boreal Megafire Outbreak',
    description: 'June 2023 pyrocumulonimbus fires producing apocalyptic orange skies over North America.',
    center: [-74.5, 49.8],
    zoom: 4,
    targetDate: '2023-06-06',
    category: 'wildfire'
  },
  {
    id: 'hurricane_otis',
    name: 'Hurricane Otis Rapid Intensification',
    description: 'Oct 2023 explosive 115mph intensification in 24 hours into Cat 5 directly hitting Acapulco.',
    center: [-99.9, 16.85],
    zoom: 6,
    targetDate: '2023-10-25',
    category: 'storm'
  },
  {
    id: 'pnw_heatdome',
    name: 'Pacific Northwest Omega Heat Dome',
    description: 'June 2021 Canadian record +49.6°C (+14.8°C anomaly) atmospheric blocking.',
    center: [-121.58, 50.23],
    zoom: 5,
    targetDate: '2021-06-29',
    category: 'anomaly'
  },
  {
    id: 'iceland_rift',
    name: 'Reykjanes Volcanic Rifting',
    description: 'Dec 2023 high-discharge fissure opening threatening the town of Grindavík.',
    center: [-22.41, 63.86],
    zoom: 7.5,
    targetDate: '2023-12-18',
    category: 'volcano'
  },
  {
    id: 'turkey_earthquake',
    name: 'Turkey–Syria Megathrust Strike-Slip',
    description: 'Feb 2023 catastrophic Mw 7.8 & 7.5 doublet rupturing 300+ km along East Anatolian Fault.',
    center: [37.1, 37.5],
    zoom: 6.2,
    targetDate: '2023-02-06',
    category: 'earthquake'
  },
  {
    id: 'global_all',
    name: 'Global Environmental Panorama',
    description: 'Worldwide perspective over 50,000 environmental telemetry nodes.',
    center: [0, 20],
    zoom: 1.8,
    targetDate: '2023-08-01'
  }
];

export type LayerToggleKey =
  | 'showWildfires'
  | 'showVolcanoes'
  | 'showStorms'
  | 'showAnomalies'
  | 'showEarthquakes'
  | 'showPlateBoundaries'
  | 'showWindField'
  | 'showThermalHeat'
  | 'showIsobars'
  | 'clusteringEnabled';

interface GeoState {
  // Clock state
  isPlaying: boolean;
  speed: number; // 1, 5, 30 days/sec
  currentTimestamp: number;
  minTimestamp: number;
  maxTimestamp: number;

  // Layer toggles
  showWildfires: boolean;
  showVolcanoes: boolean;
  showStorms: boolean;
  showAnomalies: boolean;
  showEarthquakes: boolean;
  showPlateBoundaries: boolean;
  showWindField: boolean;
  showThermalHeat: boolean;
  showIsobars: boolean;
  clusteringEnabled: boolean;

  // Filters
  minSeverity: HazardSeverity | 'all';
  searchQuery: string;
  selectedBbox: [number, number, number, number] | null;

  // Selected Hazard & Inspector
  selectedHazard: HazardFeature | null;
  anomalyProfile: AnomalyProfile | null;
  isLoadingProfile: boolean;

  // Telemetry & Performance
  fps: number;
  queryLatencyMs: number;
  totalIndexedCount: number;
  visiblePointsCount: number;
  workerActive: boolean;

  // Remote Data
  allFeatures: HazardFeature[];
  timelineMeta: TimelineMetaResponse | null;
  climateGrid: ClimateGridData | null;
  isLoadingData: boolean;
  activePresetId: string | null;

  // Actions
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  setTimestamp: (ts: number) => void;
  stepDays: (days: number) => void;
  toggleLayer: (layer: LayerToggleKey) => void;
  setSeverityFilter: (sev: HazardSeverity | 'all') => void;
  setSearchQuery: (q: string) => void;
  selectHazard: (feature: HazardFeature | null) => void;
  fetchAnomalyProfile: (lat: number, lon: number, start?: string, end?: string) => Promise<void>;
  setFps: (fps: number) => void;
  setQueryLatency: (ms: number) => void;
  setVisibleCount: (count: number) => void;
  setAllFeatures: (features: HazardFeature[]) => void;
  setTimelineMeta: (meta: TimelineMetaResponse) => void;
  setClimateGrid: (grid: ClimateGridData) => void;
  applyPreset: (presetId: string, jumpToMapCallback?: (center: [number, number], zoom: number) => void) => void;
  loadInitialData: () => Promise<void>;
}

const DEFAULT_START_TS = new Date(Date.UTC(2020, 0, 1)).getTime();
const DEFAULT_END_TS = new Date(Date.UTC(2025, 11, 31, 23, 59, 59, 999)).getTime();
const DEFAULT_CURRENT_TS = new Date(Date.UTC(2023, 6, 15, 23, 59, 59)).getTime(); // July 2023 midpoint

export const useGeoStore = create<GeoState>((set, get) => ({
  isPlaying: false,
  speed: 5, // default 5x days per second
  currentTimestamp: DEFAULT_CURRENT_TS,
  minTimestamp: DEFAULT_START_TS,
  maxTimestamp: DEFAULT_END_TS,

  showWildfires: true,
  showVolcanoes: true,
  showStorms: true,
  showAnomalies: true,
  showEarthquakes: true,
  showPlateBoundaries: true,
  showWindField: true,
  showThermalHeat: true,
  showIsobars: true,
  clusteringEnabled: true,

  minSeverity: 'all',
  searchQuery: '',
  selectedBbox: null,

  selectedHazard: null,
  anomalyProfile: null,
  isLoadingProfile: false,

  fps: 60,
  queryLatencyMs: 1.8,
  totalIndexedCount: 0,
  visiblePointsCount: 0,
  workerActive: true,

  allFeatures: [],
  timelineMeta: null,
  climateGrid: null,
  isLoadingData: true,
  activePresetId: null,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setSpeed: (speed) => set({ speed }),
  setTimestamp: (currentTimestamp) => {
    const { minTimestamp, maxTimestamp } = get();
    const clamped = Math.max(minTimestamp, Math.min(maxTimestamp, currentTimestamp));
    set({ currentTimestamp: clamped });
  },
  stepDays: (days) => {
    const { currentTimestamp, minTimestamp, maxTimestamp } = get();
    const deltaMs = days * 86400000;
    const next = Math.max(minTimestamp, Math.min(maxTimestamp, currentTimestamp + deltaMs));
    set({ currentTimestamp: next });
  },

  toggleLayer: (layer) => {
    set((state) => ({
      [layer]: !state[layer]
    }));
  },

  setSeverityFilter: (minSeverity) => set({ minSeverity }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  selectHazard: (feature) => {
    set({ selectedHazard: feature });
    if (feature) {
      const coords = feature.geometry.coordinates;
      const lon = coords[0];
      const lat = coords[1];
      const date = feature.properties.dateStr || '2023-01-01';
      // Fetch 60-day surrounding anomaly profile
      const start = new Date(new Date(date).getTime() - 30 * 86400000).toISOString().split('T')[0];
      const end = new Date(new Date(date).getTime() + 30 * 86400000).toISOString().split('T')[0];
      get().fetchAnomalyProfile(lat, lon, start, end);
    } else {
      set({ anomalyProfile: null });
    }
  },

  fetchAnomalyProfile: async (lat, lon, start, end) => {
    set({ isLoadingProfile: true });
    try {
      const s = start || '2023-01-01';
      const e = end || '2023-12-31';
      const res = await fetch(`/api/anomalies?lat=${lat}&lon=${lon}&start=${s}&end=${e}`);
      if (res.ok) {
        const data = await res.json();
        set({ anomalyProfile: data, isLoadingProfile: false });
      } else {
        set({ isLoadingProfile: false });
      }
    } catch (err) {
      console.warn('Failed to load anomaly profile:', err);
      set({ isLoadingProfile: false });
    }
  },

  setFps: (fps) => set({ fps }),
  setQueryLatency: (queryLatencyMs) => set({ queryLatencyMs }),
  setVisibleCount: (visiblePointsCount) => set({ visiblePointsCount }),
  setAllFeatures: (allFeatures) => set({ allFeatures, totalIndexedCount: allFeatures.length }),
  setTimelineMeta: (timelineMeta) => set({ timelineMeta }),
  setClimateGrid: (climateGrid) => set({ climateGrid }),

  applyPreset: (presetId, jumpToMapCallback) => {
    const preset = MAP_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    // Use end-of-day UTC timestamp so events occurring on targetDate are included in GPU filter
    const targetTs = new Date(`${preset.targetDate}T23:59:59.999Z`).getTime();
    set({
      activePresetId: preset.id,
      currentTimestamp: targetTs
    });

    if (preset.category) {
      // Ensure the relevant hazard layer is turned on
      if (preset.category === 'wildfire') set({ showWildfires: true });
      if (preset.category === 'volcano') set({ showVolcanoes: true });
      if (preset.category === 'storm') set({ showStorms: true });
      if (preset.category === 'anomaly') set({ showAnomalies: true });
      if (preset.category === 'earthquake') set({ showEarthquakes: true });
    }

    // Automatically select the corresponding landmark feature if found in allFeatures
    const matchingFeature = get().allFeatures.find((f) => {
      const matchDate = f.properties.dateStr === preset.targetDate;
      const matchCat = !preset.category || f.properties.category === preset.category;
      return matchDate && matchCat;
    });

    if (matchingFeature) {
      get().selectHazard(matchingFeature);
    }

    if (jumpToMapCallback) {
      jumpToMapCallback(preset.center, preset.zoom);
    }
  },

  loadInitialData: async () => {
    set({ isLoadingData: true });
    try {
      // 1. Fetch Hazards
      const hazardsPromise = fetch('/api/hazards?status=all&days=1000')
        .then((r) => r.json())
        .catch(() => ({ features: [] }));

      // 2. Fetch Timeline metadata histogram
      const metaPromise = fetch('/api/timeline-meta?year_start=2020&year_end=2025')
        .then((r) => r.json())
        .catch(() => null);

      // 3. Fetch Climate Grid
      const gridPromise = fetch('/api/climate-grid?date=2023-07-15')
        .then((r) => r.json())
        .catch(() => null);

      const [hazardsData, metaData, gridData] = await Promise.all([
        hazardsPromise,
        metaPromise,
        gridPromise
      ]);

      const features: HazardFeature[] = hazardsData.features || [];
      let minTs = DEFAULT_START_TS;
      let maxTs = DEFAULT_END_TS;

      if (features.length > 0) {
        let detectedMin = features[0].properties.timestamp;
        let detectedMax = features[0].properties.timestamp;
        for (let i = 1; i < features.length; i++) {
          const ts = features[i].properties.timestamp;
          if (ts < detectedMin) detectedMin = ts;
          if (ts > detectedMax) detectedMax = ts;
        }
        minTs = detectedMin;
        maxTs = detectedMax;
      }

      const clampedCurrent = Math.max(minTs, Math.min(maxTs, get().currentTimestamp));

      set({
        allFeatures: features,
        totalIndexedCount: features.length,
        minTimestamp: minTs,
        maxTimestamp: maxTs,
        currentTimestamp: clampedCurrent,
        timelineMeta: metaData,
        climateGrid: gridData,
        isLoadingData: false
      });
    } catch (err) {
      console.error('Failed to load initial GeoPulse data:', err);
      set({ isLoadingData: false });
    }
  }
}));
