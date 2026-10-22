import React from 'react';
import {
  X,
  Flame,
  Mountain,
  Zap,
  TrendingUp,
  MapPin,
  Calendar,
  Activity,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useGeoStore } from '../store/useGeoStore';
import type { HazardCategory } from '../types';

export const HazardInspector: React.FC = () => {
  const { selectedHazard, selectHazard, anomalyProfile, isLoadingProfile } = useGeoStore();

  if (!selectedHazard) return null;

  const props = selectedHazard.properties;
  const [lon, lat] = selectedHazard.geometry.coordinates;

  const getCategoryIcon = (cat: HazardCategory) => {
    switch (cat) {
      case 'wildfire':
        return <Flame size={18} color="#ff5500" />;
      case 'volcano':
        return <Mountain size={18} color="#ff0055" />;
      case 'storm':
        return <Zap size={18} color="#00e5ff" />;
      case 'earthquake':
        return <Activity size={18} color="#f59e0b" />;
      default:
        return <TrendingUp size={18} color="#c084fc" />;
    }
  };

  const getBadgeClass = (cat: HazardCategory) => {
    switch (cat) {
      case 'wildfire':
        return 'cat-wildfire';
      case 'volcano':
        return 'cat-volcano';
      case 'storm':
        return 'cat-storm';
      case 'earthquake':
        return 'cat-earthquake';
      default:
        return 'cat-anomaly';
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 64,
        right: 20,
        width: 380,
        maxWidth: 'calc(100vw - 40px)',
        zIndex: 11,
        pointerEvents: 'auto',
        maxHeight: 'calc(100vh - 180px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'rgba(10, 15, 27, 0.94)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.75), 0 0 24px rgba(0, 229, 255, 0.2)'
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.7)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {getCategoryIcon(props.category)}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span className={`cat-badge ${getBadgeClass(props.category)}`}>
                  {props.category}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: props.severity === 'catastrophic' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: props.severity === 'catastrophic' ? '#ef4444' : '#f59e0b',
                    border: `1px solid ${props.severity === 'catastrophic' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
                  }}
                >
                  {props.severity}
                </span>
              </div>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: '#ffffff'
                }}
              >
                {props.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => selectHazard(null)}
            className="btn-gis btn-icon"
            style={{ width: 28, height: 28 }}
            aria-label="Close detail inspector"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto'
          }}
        >
          {/* Spatial & Temporal Meta */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              fontSize: 12
            }}
          >
            <div
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Calendar size={14} color="#00e5ff" />
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>UTC TIMESTAMP</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{props.dateStr}</div>
              </div>
            </div>

            <div
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <MapPin size={14} color="#00e5ff" />
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>COORDINATES</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {lat.toFixed(2)}°, {lon.toFixed(2)}°
                </div>
              </div>
            </div>
          </div>

          {/* Environmental & Seismic Metrics */}
          {props.category === 'earthquake' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8
              }}
            >
              {/* Depth */}
              <div
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>FOCAL DEPTH</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                  {props.depth_km !== undefined ? `${props.depth_km} km` : '10.0 km'}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>
                  {props.depth_km && props.depth_km > 70 ? 'Mantle / Wadati' : 'Crustal Hypocenter'}
                </div>
              </div>

              {/* Magnitude */}
              <div
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 229, 255, 0.08)',
                  border: '1px solid rgba(0, 229, 255, 0.25)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>MAGNITUDE</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  {props.magnitude ? `M ${props.magnitude}` : 'N/A'}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{props.magnitudeUnit || 'MWW'} Scale</div>
              </div>

              {/* Tsunami Alert */}
              <div
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: props.tsunami ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                  border: `1px solid ${props.tsunami ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.25)'}`,
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>TSUNAMI</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: props.tsunami ? '#ef4444' : '#10b981',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {props.tsunami ? 'WARNING' : 'NONE'}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Alert Status</div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8
              }}
            >
              {/* TRP */}
              <div
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 85, 0, 0.08)',
                  border: '1px solid rgba(255, 85, 0, 0.25)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>THERMAL POWER</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ff7733', fontFamily: 'var(--font-mono)' }}>
                  {props.trp_mw ? `${props.trp_mw.toLocaleString()} MW` : 'N/A'}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Radiative Flux</div>
              </div>

              {/* Magnitude */}
              <div
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 229, 255, 0.08)',
                  border: '1px solid rgba(0, 229, 255, 0.25)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>MAGNITUDE</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  {props.magnitude ? `${props.magnitude} ${props.magnitudeUnit || ''}` : 'N/A'}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Calibrated Metric</div>
              </div>

              {/* Anomaly Delta */}
              <div
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(192, 132, 252, 0.08)',
                  border: '1px solid rgba(192, 132, 252, 0.25)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>ERA5 ANOMALY</div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: props.anomaly_c >= 0 ? '#f43f5e' : '#38bdf8',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {props.anomaly_c >= 0 ? `+${props.anomaly_c}` : props.anomaly_c}°C
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>vs 30-Yr Normal</div>
              </div>
            </div>
          )}

          {/* Description */}
          {props.description && (
            <div
              style={{
                fontSize: 12,
                lineHeight: 1.5,
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {props.description}
            </div>
          )}

          {/* SVG Micro-Chart: ERA5 30-Year Climate Departure Profile */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} color="#00e5ff" />
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  Open-Meteo ERA5 30-Yr Climate Reanalysis
                </span>
              </div>
              {isLoadingProfile && <Loader2 size={13} className="spin-slow" color="#00e5ff" />}
            </div>

            {anomalyProfile && anomalyProfile.series && anomalyProfile.series.length > 0 ? (
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
                {/* SVG Line / Bar Micro-Chart */}
                <div style={{ width: '100%', height: 110 }}>
                  <svg width="100%" height="100%" viewBox="0 0 320 100" preserveAspectRatio="none">
                    {/* Zero Anomaly Baseline */}
                    <line x1="0" y1="50" x2="320" y2="50" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Bars / Points for daily departure */}
                    {anomalyProfile.series.map((pt, i) => {
                      const count = anomalyProfile.series.length;
                      const x = (i / count) * 320;
                      const barWidth = Math.max(2, 320 / count - 1);
                      // scale anomaly (-10°C to +10°C) onto y 0-100 where 50 is 0°C
                      const clampedAnom = Math.max(-10, Math.min(10, pt.anomaly_c));
                      const yDelta = (clampedAnom / 10) * 45;
                      const y = 50 - yDelta;
                      const height = Math.max(2, Math.abs(yDelta));
                      const isPositive = pt.anomaly_c >= 0;

                      return (
                        <rect
                          key={`pt-${i}`}
                          x={x}
                          y={isPositive ? y : 50}
                          width={barWidth}
                          height={height}
                          fill={isPositive ? '#ff4d00' : '#00e5ff'}
                          opacity={0.75}
                        />
                      );
                    })}
                  </svg>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 10,
                    color: 'var(--text-dim)',
                    marginTop: 4,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <span>{anomalyProfile.startDate}</span>
                  <span style={{ color: '#00e5ff' }}>
                    Mean Anomaly: {anomalyProfile.meanAnomaly_c > 0 ? `+${anomalyProfile.meanAnomaly_c}` : anomalyProfile.meanAnomaly_c}°C
                  </span>
                  <span>{anomalyProfile.endDate}</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  padding: '12px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {isLoadingProfile ? 'Ingesting reanalysis matrix...' : 'Ready for anomaly telemetry query'}
              </div>
            )}
          </div>

          {/* Sources and External Links */}
          {props.sources && props.sources.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-dim)' }}>
              <ExternalLink size={12} />
              <span>Source:</span>
              <a
                href={props.sources[0].url}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#00e5ff', textDecoration: 'none' }}
              >
                {props.sources[0].id || 'NASA EONET v3'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
