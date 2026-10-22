export type HazardCategory = 'wildfire' | 'volcano' | 'storm' | 'anomaly' | 'earthquake';

export type HazardSeverity = 'low' | 'moderate' | 'severe' | 'catastrophic';

export interface HazardProperties {
  id: string;
  eventId?: string;
  title: string;
  category: HazardCategory;
  timestamp: number; // UTC millisecond epoch
  dateStr: string; // YYYY-MM-DD
  magnitude: number | null;
  magnitudeUnit?: string;
  anomaly_c: number; // Surface temperature variance vs 30-year normal
  trp_mw?: number; // Thermal Radiative Power in Megawatts
  depth_km?: number; // Focal hypocenter depth in km (earthquakes)
  tsunami?: boolean; // Tsunami alert indicator (earthquakes)
  sig?: number; // PAGER impact significance score (earthquakes)
  severity: HazardSeverity;
  description?: string;
  sources?: Array<{ id: string; url: string }>;
  locationName?: string;
  closed?: boolean;
}

export interface HazardFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point' | 'MultiPoint';
    coordinates: [number, number] | [number, number, number]; // [lon, lat] or [lon, lat, depth]
  };
  properties: HazardProperties;
}

export interface HazardCollection {
  type: 'FeatureCollection';
  metadata?: {
    generatedAt: string;
    count: number;
    timeSpan: {
      min: number;
      max: number;
    };
  };
  features: HazardFeature[];
}

export interface HistogramBucket {
  label: string;
  year: number;
  month: number;
  startTs: number;
  endTs: number;
  total: number;
  normalizedDensity: number;
  categories: {
    wildfire: number;
    volcano: number;
    storm: number;
    anomaly: number;
    earthquake?: number;
  };
  peakAnomaly: number;
  topEvents?: Array<{ id: string; title: string; category: string }>;
}

export interface TimelineMetaResponse {
  yearStart: number;
  yearEnd: number;
  bucketResolution: string;
  bucketCount: number;
  maxDensity: number;
  totalEvents: number;
  histogram: HistogramBucket[];
}

export interface AnomalyPoint {
  date: string;
  timestamp: number;
  temperature_c: number;
  baseline_c: number;
  anomaly_c: number;
  pressure_hpa?: number;
}

export interface AnomalyProfile {
  location: { lat: number; lon: number };
  startDate: string;
  endDate: string;
  sampleCount: number;
  meanAnomaly_c: number;
  maxAnomaly_c: number;
  minAnomaly_c: number;
  series: AnomalyPoint[];
}

export interface ClimateGridPoint {
  lat: number;
  lon: number;
  temperature_c: number;
  baseline_c: number;
  anomaly_c: number;
  pressure_hpa: number;
}

export interface ClimateGridData {
  date: string;
  timestamp: number;
  latStep: number;
  lonStep: number;
  pointCount: number;
  points: ClimateGridPoint[];
}

export interface MapPreset {
  id: string;
  name: string;
  description: string;
  center: [number, number]; // [lon, lat]
  zoom: number;
  targetDate: string;
  category?: HazardCategory;
}
