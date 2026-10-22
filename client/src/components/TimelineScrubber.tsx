import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock
} from 'lucide-react';
import { useGeoStore } from '../store/useGeoStore';

export const TimelineScrubber: React.FC = () => {
  const {
    isPlaying,
    speed,
    currentTimestamp,
    minTimestamp,
    maxTimestamp,
    timelineMeta,
    allFeatures,
    togglePlay,
    setSpeed,
    setTimestamp,
    stepDays,
    setFps
  } = useGeoStore();

  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());

  // Continuous frame interpolation and clock logic inside requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      // FPS measurement
      frameCountRef.current++;
      if (now - fpsTimerRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        fpsTimerRef.current = now;
      }

      if (isPlaying) {
        const deltaMs = now - lastFrameTimeRef.current;
        // speed is in "days per real-time second"
        // 1 day = 86400000 ms
        const daysAdvanced = (deltaMs / 1000) * speed;
        const timeAdvancedMs = daysAdvanced * 86400000;

        const nextTs = currentTimestamp + timeAdvancedMs;
        if (nextTs >= maxTimestamp) {
          setTimestamp(minTimestamp); // loop back
        } else {
          setTimestamp(nextTs);
        }
      }

      lastFrameTimeRef.current = now;
      animId = requestAnimationFrame(tick);
    };

    lastFrameTimeRef.current = performance.now();
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed, currentTimestamp, minTimestamp, maxTimestamp, setTimestamp, setFps]);

  // Spacebar toggle playback shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        stepDays(-1);
      } else if (e.code === 'ArrowRight') {
        stepDays(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stepDays]);

  const totalDuration = maxTimestamp - minTimestamp || 1;
  const progressRatio = Math.max(0, Math.min(1, (currentTimestamp - minTimestamp) / totalDuration));

  const currentDateObj = new Date(currentTimestamp);
  const formattedDate = currentDateObj.toUTCString().slice(5, 16).toUpperCase();
  const yearStr = currentDateObj.getUTCFullYear();

  // Active hazard count up to current cursor date
  const activeEventsCount = allFeatures.filter((f) => f.properties.timestamp <= currentTimestamp).length;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: 1040,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}
    >
      {/* Main Glassmorphic Playback Deck */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          background: 'rgba(10, 15, 27, 0.88)'
        }}
      >
        {/* Top Histogram Bar & Density Distribution */}
        {timelineMeta && timelineMeta.histogram && (
          <div style={{ position: 'relative', width: '100%', height: 38, marginBottom: 2 }}>
            <svg
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              style={{ overflow: 'visible', cursor: 'pointer' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickRatio = (e.clientX - rect.left) / rect.width;
                const newTs = minTimestamp + clickRatio * totalDuration;
                setTimestamp(newTs);
              }}
            >
              {timelineMeta.histogram.map((bucket, i) => {
                const x = (i / timelineMeta.histogram.length) * 100;
                const barWidth = 100 / timelineMeta.histogram.length;
                const barHeight = Math.max(2, bucket.normalizedDensity * 32);
                const y = 36 - barHeight;

                const isPast = bucket.endTs <= currentTimestamp;

                return (
                  <g key={`hist-${i}`}>
                    {/* Background bar */}
                    <rect
                      x={`${x}%`}
                      y={y}
                      width={`${barWidth * 0.85}%`}
                      height={barHeight}
                      rx={1}
                      fill={isPast ? 'rgba(0, 229, 255, 0.65)' : 'rgba(255, 255, 255, 0.15)'}
                      style={{ transition: 'fill 0.15s ease' }}
                    />
                  </g>
                );
              })}

              {/* Current Cursor Line */}
              <line
                x1={`${progressRatio * 100}%`}
                y1={0}
                x2={`${progressRatio * 100}%`}
                y2={38}
                stroke="#00e5ff"
                strokeWidth={2}
                strokeDasharray="2,2"
              />
            </svg>

            {/* Subtle year labels across histogram */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                color: 'var(--text-dim)',
                marginTop: 2,
                fontFamily: 'var(--font-mono)'
              }}
            >
              <span>2020</span>
              <span>2021</span>
              <span>2022</span>
              <span>2023</span>
              <span>2024</span>
              <span>2025</span>
            </div>
          </div>
        )}

        {/* Temporal Scrubber Slider */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min={minTimestamp}
            max={maxTimestamp}
            value={currentTimestamp}
            onChange={(e) => setTimestamp(Number(e.target.value))}
            className="timeline-slider-input"
          />
        </div>

        {/* Bottom Playback Controls, UTC HUD, and Speed Deck */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          {/* Left: Play/Pause and Step Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => stepDays(-30)}
              className="btn-gis btn-icon"
              title="Rewind 30 Days"
              aria-label="Rewind 30 Days"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => stepDays(-1)}
              className="btn-gis btn-icon"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={togglePlay}
              className={`btn-gis ${isPlaying ? 'active' : ''}`}
              style={{
                padding: '6px 16px',
                fontWeight: 600,
                background: isPlaying ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                borderColor: isPlaying ? 'var(--color-storm)' : 'rgba(255, 255, 255, 0.15)'
              }}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => stepDays(1)}
              className="btn-gis btn-icon"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => stepDays(30)}
              className="btn-gis btn-icon"
              title="Forward 30 Days"
              aria-label="Forward 30 Days"
            >
              <ChevronsRight size={16} />
            </button>
            <button
              onClick={() => setTimestamp(minTimestamp)}
              className="btn-gis btn-icon"
              title="Reset Timeline to 2020"
              aria-label="Reset Timeline"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Center: High-Tech UTC Clock Readout */}
          <div
            className="glass-pill"
            style={{
              padding: '6px 14px',
              border: '1px solid var(--border-glow)',
              background: 'rgba(0, 229, 255, 0.08)'
            }}
          >
            <Clock size={14} color="#00e5ff" />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
                color: '#ffffff'
              }}
            >
              {formattedDate} {yearStr}
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              UTC
            </span>
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                padding: '2px 6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-storm)'
              }}
            >
              {activeEventsCount.toLocaleString()} HAZARDS ACCUMULATED
            </span>
          </div>

          {/* Right: Playback Speed Toggles (1x, 5x, 30x days/sec) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                marginRight: 4,
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              Rate:
            </span>
            {[1, 5, 30].map((rate) => (
              <button
                key={`speed-${rate}`}
                onClick={() => setSpeed(rate)}
                className={`btn-gis ${speed === rate ? 'active' : ''}`}
                style={{
                  padding: '4px 9px',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600
                }}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
