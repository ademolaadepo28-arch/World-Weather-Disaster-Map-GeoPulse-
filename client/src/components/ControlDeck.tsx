import React, { useState } from 'react';
import {
  Layers,
  Flame,
  Mountain,
  Zap,
  TrendingUp,
  Wind,
  Thermometer,
  Compass,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sliders,
  Globe
} from 'lucide-react';
import { useGeoStore, MAP_PRESETS } from '../store/useGeoStore';

interface ControlDeckProps {
  onFlyToPreset?: (center: [number, number], zoom: number) => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({ onFlyToPreset }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    showWildfires,
    showVolcanoes,
    showStorms,
    showAnomalies,
    showWindField,
    showThermalHeat,
    showIsobars,
    clusteringEnabled,
    minSeverity,
    activePresetId,
    allFeatures,
    toggleLayer,
    setSeverityFilter,
    applyPreset
  } = useGeoStore();

  // Category counts
  const counts = {
    wildfire: allFeatures.filter((f) => f.properties.category === 'wildfire').length,
    volcano: allFeatures.filter((f) => f.properties.category === 'volcano').length,
    storm: allFeatures.filter((f) => f.properties.category === 'storm').length,
    anomaly: allFeatures.filter((f) => f.properties.category === 'anomaly').length
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 64,
        left: 20,
        width: 310,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxHeight: 'calc(100vh - 180px)',
        pointerEvents: 'auto'
      }}
    >
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Header */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isCollapsed ? 'none' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
            userSelect: 'none',
            background: 'rgba(15, 23, 42, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={16} color="#00e5ff" />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>
              GEOPULSE CONTROL DECK
            </span>
          </div>
          <button className="btn-gis btn-icon" style={{ width: 24, height: 24 }}>
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {/* Collapsible Body */}
        {!isCollapsed && (
          <div
            style={{
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 240px)'
            }}
          >
            {/* 1. Environmental Hazard Layers */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Sliders size={12} />
                <span>Hazard Layers</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Wildfires */}
                <div
                  onClick={() => toggleLayer('showWildfires')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: showWildfires ? 'rgba(255, 85, 0, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${showWildfires ? 'rgba(255, 85, 0, 0.4)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Flame size={15} color="#ff5500" />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Wildfires</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {counts.wildfire}
                    </span>
                    {showWildfires ? <Eye size={14} color="#ff5500" /> : <EyeOff size={14} color="#64748b" />}
                  </div>
                </div>

                {/* Volcanoes */}
                <div
                  onClick={() => toggleLayer('showVolcanoes')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: showVolcanoes ? 'rgba(255, 0, 85, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${showVolcanoes ? 'rgba(255, 0, 85, 0.4)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mountain size={15} color="#ff0055" />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Volcanoes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {counts.volcano}
                    </span>
                    {showVolcanoes ? <Eye size={14} color="#ff0055" /> : <EyeOff size={14} color="#64748b" />}
                  </div>
                </div>

                {/* Severe Storms */}
                <div
                  onClick={() => toggleLayer('showStorms')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: showStorms ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${showStorms ? 'rgba(0, 229, 255, 0.4)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={15} color="#00e5ff" />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Severe Storms</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {counts.storm}
                    </span>
                    {showStorms ? <Eye size={14} color="#00e5ff" /> : <EyeOff size={14} color="#64748b" />}
                  </div>
                </div>

                {/* Climate Anomalies */}
                <div
                  onClick={() => toggleLayer('showAnomalies')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: showAnomalies ? 'rgba(192, 132, 252, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${showAnomalies ? 'rgba(192, 132, 252, 0.4)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={15} color="#c084fc" />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Climate Anomalies</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {counts.anomaly}
                    </span>
                    {showAnomalies ? <Eye size={14} color="#c084fc" /> : <EyeOff size={14} color="#64748b" />}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Overlays & Atmospheric Circulation */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Compass size={12} />
                <span>Atmospheric Overlays</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  onClick={() => toggleLayer('showWindField')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: showWindField ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${showWindField ? 'rgba(56, 189, 248, 0.4)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Wind size={15} color="#38bdf8" />
                    <span style={{ fontSize: 13 }}>Wind Vector Streamlines</span>
                  </div>
                  {showWindField ? <Eye size={14} color="#38bdf8" /> : <EyeOff size={14} color="#64748b" />}
                </div>

                <div
                  onClick={() => toggleLayer('showThermalHeat')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: showThermalHeat ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${showThermalHeat ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Thermometer size={15} color="#f59e0b" />
                    <span style={{ fontSize: 13 }}>Thermal Heat Anomaly</span>
                  </div>
                  {showThermalHeat ? <Eye size={14} color="#f59e0b" /> : <EyeOff size={14} color="#64748b" />}
                </div>

                <div
                  onClick={() => toggleLayer('showIsobars')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: showIsobars ? 'rgba(96, 165, 250, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${showIsobars ? 'rgba(96, 165, 250, 0.4)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Globe size={15} color="#60a5fa" />
                    <span style={{ fontSize: 13 }}>Isobar Pressure Contours</span>
                  </div>
                  {showIsobars ? <Eye size={14} color="#60a5fa" /> : <EyeOff size={14} color="#64748b" />}
                </div>

                <div
                  onClick={() => toggleLayer('clusteringEnabled')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: clusteringEnabled ? 'rgba(192, 132, 252, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${clusteringEnabled ? 'rgba(192, 132, 252, 0.4)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={15} color="#c084fc" />
                    <span style={{ fontSize: 13 }}>Supercluster Aggregation</span>
                  </div>
                  {clusteringEnabled ? <Eye size={14} color="#c084fc" /> : <EyeOff size={14} color="#64748b" />}
                </div>
              </div>
            </div>

            {/* 3. Severity Filter Selector */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Filter size={12} />
                <span>Severity Threshold</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                {(['all', 'severe', 'catastrophic'] as const).map((sev) => (
                  <button
                    key={`sev-${sev}`}
                    onClick={() => setSeverityFilter(sev)}
                    className={`btn-gis ${minSeverity === sev ? 'active' : ''}`}
                    style={{
                      justifyContent: 'center',
                      fontSize: 11,
                      textTransform: 'capitalize',
                      padding: '5px 4px'
                    }}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Strategic Map Presets */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <MapPin size={12} />
                <span>Historical Keyframe Presets</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {MAP_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset.id, onFlyToPreset)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: activePresetId === preset.id ? 'rgba(0, 229, 255, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${activePresetId === preset.id ? 'var(--color-storm)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{preset.name}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-storm)'
                        }}
                      >
                        {preset.targetDate}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3, lineHeight: 1.3 }}>
                      {preset.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
