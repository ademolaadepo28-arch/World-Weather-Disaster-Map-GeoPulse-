import React from 'react';
import {
  Globe,
  Activity,
  Cpu,
  Layers,
  RefreshCw
} from 'lucide-react';
import { useGeoStore } from '../store/useGeoStore';

export const TopNav: React.FC = () => {
  const {
    fps,
    queryLatencyMs,
    totalIndexedCount,
    visiblePointsCount,
    isLoadingData,
    loadInitialData
  } = useGeoStore();

  return (
    <header
      style={{
        position: 'absolute',
        top: 14,
        left: 20,
        right: 20,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none'
      }}
    >
      {/* Left: Brand Identity */}
      <div
        className="glass-panel"
        style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          pointerEvents: 'auto'
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="live-beacon beacon-online" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: '0.04em',
                fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(90deg, #ffffff, #00e5ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Globe size={18} color="#00e5ff" />
              GeoPulse
            </h1>
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(0, 229, 255, 0.15)',
                color: '#00e5ff',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}
            >
              MVP v1.0
            </span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}
          >
            Historical Climate Anomalies, Wildfires &amp; Volcanic Geospatial Engine
          </div>
        </div>
      </div>

      {/* Right: Real-time Performance HUD & Telemetry Metrics */}
      <div
        className="glass-panel"
        style={{
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          pointerEvents: 'auto'
        }}
      >
        {/* Live FPS Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={14} color={fps >= 55 ? '#10b981' : '#f59e0b'} />
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase' }}>RENDER</div>
            <div
              style={{
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: fps >= 55 ? '#10b981' : '#f59e0b'
              }}
            >
              {fps} FPS
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />

        {/* Spatial Query Latency (Flatbush/Supercluster Worker) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cpu size={14} color="#00e5ff" />
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase' }}>INDEX LATENCY</div>
            <div
              style={{
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: '#00e5ff'
              }}
            >
              {queryLatencyMs} ms
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />

        {/* Total Concurrent Points Handled */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={14} color="#c084fc" />
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase' }}>POINTS (INDEXED / VIEW)</div>
            <div
              style={{
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: '#c084fc'
              }}
            >
              {totalIndexedCount.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({visiblePointsCount.toLocaleString()})</span>
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />

        {/* Refresh / Ingest Button */}
        <button
          onClick={loadInitialData}
          className="btn-gis btn-icon"
          style={{ width: 28, height: 28 }}
          title="Refresh NASA EONET & Climate feeds"
          disabled={isLoadingData}
        >
          <RefreshCw size={13} className={isLoadingData ? 'spin-slow' : ''} />
        </button>
      </div>
    </header>
  );
};
