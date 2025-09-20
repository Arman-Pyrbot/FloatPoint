'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    VANTA: {
      WAVES: (options: {
        el: string;
        mouseControls: boolean;
        touchControls: boolean;
        gyroControls: boolean;
        minHeight: number;
        minWidth: number;
        scale: number;
        scaleMobile: number;
        shininess: number;
        waveHeight: number;
        waveSpeed: number;
        zoom: number;
      }) => { destroy: () => void };
    };
  }
}

export default function VantaBackground() {
  useEffect(() => {
    // Load Three.js
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
    threeScript.onload = () => {
      // Load Vanta.js after Three.js
      const vantaScript = document.createElement('script');
      vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.waves.min.js';
      vantaScript.onload = () => {
        // Initialize Vanta
        if (window.VANTA) {
          window.VANTA.WAVES({
            el: "#vanta-background",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            shininess: 104.00,
            waveHeight: 20.00,
            waveSpeed: 0.60,
            zoom: 0.65
          });
        }
      };
      document.head.appendChild(vantaScript);
    };
    document.head.appendChild(threeScript);

    // Cleanup function
    return () => {
      if (window.VANTA) {
        // Clean up Vanta instance if it exists
        const vantaElement = document.getElementById('vanta-background');
        if (vantaElement && (vantaElement as HTMLElement & { vantaInstance?: { destroy: () => void } }).vantaInstance) {
          (vantaElement as HTMLElement & { vantaInstance: { destroy: () => void } }).vantaInstance.destroy();
        }
      }
    };
  }, []);

  return <div id="vanta-background"></div>;
}