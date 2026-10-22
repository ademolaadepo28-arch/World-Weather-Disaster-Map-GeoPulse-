import React from 'react';
import { useGeoStore } from '../store/useGeoStore';

export const ThermalHeatOverlay: React.FC = () => {
  const { climateGrid, showThermalHeat, showIsobars } = useGeoStore();

  if (!climateGrid || (!showThermalHeat && !showIsobars)) return null;

  // Render SVG chromatic departure nodes and isobar contour indicators
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'hidden'
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="-180 -90 360 180"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', opacity: 0.65 }}
      >
        <defs>
          <filter id="thermalBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Chromatic Heat departures */}
        {showThermalHeat && (
          <g filter="url(#thermalBlur)">
            {climateGrid.points.map((pt, idx) => {
              if (Math.abs(pt.anomaly_c) < 1.0) return null;

              // Color mapping based on temperature departure
              let color = 'rgba(16, 185, 129, 0.2)'; // neutral
              if (pt.anomaly_c >= 5.0) {
                color = 'rgba(255, 0, 85, 0.45)'; // extreme hot
              } else if (pt.anomaly_c >= 2.0) {
                color = 'rgba(255, 136, 0, 0.35)'; // warm
              } else if (pt.anomaly_c <= -4.0) {
                color = 'rgba(0, 110, 255, 0.45)'; // extreme cold
              } else if (pt.anomaly_c <= -1.5) {
                color = 'rgba(0, 229, 255, 0.3)'; // cool
              }

              const radius = 6 + Math.min(Math.abs(pt.anomaly_c), 12) * 1.4;

              return (
                <circle
                  key={`heat-${idx}`}
                  cx={pt.lon}
                  cy={-pt.lat} // SVG y-axis is inverted
                  r={radius}
                  fill={color}
                />
              );
            })}
          </g>
        )}

        {/* Atmospheric Isobars (Pressure contours) */}
        {showIsobars && (
          <g stroke="rgba(96, 165, 250, 0.35)" strokeWidth="0.6" strokeDasharray="2,2" fill="none">
            {/* Isobar paths for major pressure systems */}
            <path d="M -160,25 Q -100,10 -40,30 T 40,20 T 120,35 T 180,25" />
            <path d="M -160,50 Q -80,42 0,55 T 80,48 T 160,52" />
            <path d="M -170,-30 Q -90,-20 -10,-35 T 70,-25 T 150,-32" />
            <path d="M -180,-55 Q -100,-48 -20,-58 T 60,-50 T 140,-54" />
          </g>
        )}
      </svg>
    </div>
  );
};
