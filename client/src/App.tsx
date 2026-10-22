import React, { useEffect, useRef, useCallback } from 'react';
import type { Map as MapInstance } from 'maplibre-gl';
import { useGeoStore } from './store/useGeoStore';
import { MapCanvas } from './components/MapCanvas';
import { WindParticleCanvas } from './components/WindParticleCanvas';
import { ThermalHeatOverlay } from './components/ThermalHeatOverlay';
import { TopNav } from './components/TopNav';
import { ControlDeck } from './components/ControlDeck';
import { TimelineScrubber } from './components/TimelineScrubber';
import { HazardInspector } from './components/HazardInspector';

export const App: React.FC = () => {
  const mapRef = useRef<MapInstance | null>(null);
  const loadInitialData = useGeoStore((s) => s.loadInitialData);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleMapReady = useCallback((map: MapInstance) => {
    mapRef.current = map;
  }, []);

  const handleFlyToPreset = useCallback((center: [number, number], zoom: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center,
        zoom,
        essential: true,
        duration: 1800
      });
    }
  }, []);

  return (
    <main
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#070a11'
      }}
    >
      {/* 1. Base WebGL Map Canvas */}
      <MapCanvas onMapReady={handleMapReady} />

      {/* 2. Chromatic Temperature Anomaly & Isobars Overlay */}
      <ThermalHeatOverlay />

      {/* 3. Fluid Dynamic Atmospheric Wind Particle Canvas */}
      <WindParticleCanvas />

      {/* 4. Scanline Tactical Grid Overlay */}
      <div className="scanline-grid" />

      {/* 5. Top Navigation & Performance HUD */}
      <TopNav />

      {/* 6. Left GIS Control Deck */}
      <ControlDeck onFlyToPreset={handleFlyToPreset} />

      {/* 7. Bottom Dynamic Temporal Playback Scrubber */}
      <TimelineScrubber />

      {/* 8. Right Slide-Over Hazard Inspector */}
      <HazardInspector />
    </main>
  );
};

export default App;
