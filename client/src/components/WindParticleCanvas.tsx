import React, { useEffect, useRef } from 'react';
import { useGeoStore } from '../store/useGeoStore';

interface Particle {
  x: number;
  y: number;
  speed: number;
  age: number;
  maxAge: number;
}

export const WindParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const showWindField = useGeoStore((s) => s.showWindField);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!showWindField) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const PARTICLE_COUNT = 900;
    const particles: Particle[] = [];

    const initParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.8 + Math.random() * 1.6,
      age: Math.floor(Math.random() * 80),
      maxAge: 70 + Math.floor(Math.random() * 60)
    });

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(initParticle());
    }

    let time = 0;

    const render = () => {
      time += 0.015;

      // Semi-transparent fade layer to leave fluid trails
      ctx.fillStyle = 'rgba(7, 10, 17, 0.12)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1.2;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const oldX = p.x;
        const oldY = p.y;

        // Global circulation mathematical wind model
        // Normalized latitude from 0 (North) to 1 (South)
        const normY = p.y / height;
        // Equator ~ 0.5. Mid-latitudes: 0.2-0.4 (North) and 0.6-0.8 (South)
        let vx = 0;
        let vy = Math.sin(time + p.x * 0.005) * 0.4;

        if (normY > 0.42 && normY < 0.58) {
          // Trade Winds (blow East to West)
          vx = -2.2 * p.speed;
        } else if ((normY >= 0.22 && normY <= 0.42) || (normY >= 0.58 && normY <= 0.78)) {
          // Mid-latitude Prevailing Westerlies (blow West to East with jet-stream meanders)
          const jetMeander = Math.sin(time * 0.5 + (p.x / width) * 4 * Math.PI) * 1.5;
          vx = (2.6 + jetMeander * 0.4) * p.speed;
          vy += jetMeander * 0.3;
        } else {
          // Polar Easterlies
          vx = -1.4 * p.speed;
        }

        p.x += vx;
        p.y += vy;
        p.age++;

        // Reset dead or off-screen particles
        if (p.age > p.maxAge || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          particles[i] = initParticle();
          continue;
        }

        // Draw particle trail with dynamic opacity
        const progress = p.age / p.maxAge;
        const alpha = Math.sin(progress * Math.PI) * 0.6;

        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(oldX, oldY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [showWindField]);

  if (!showWindField) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
        opacity: 0.85
      }}
    />
  );
};
