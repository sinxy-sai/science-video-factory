import React, {useEffect, useRef} from 'react';
import {useCurrentFrame} from 'remotion';

export const CanvasParticleField: React.FC<{seed?: number}> = ({seed = 7}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    for (let index = 0; index < 90; index += 1) {
      const x = (index * 83 + seed * 17) % width;
      const y = (index * 47 + seed * 11) % height;
      const drift = (frame * (index % 5 + 1)) % 48;
      context.fillStyle = `rgba(85, 183, 255, ${0.12 + (index % 4) * 0.06})`;
      context.beginPath();
      context.arc(x, (y + drift) % height, 2 + (index % 3), 0, Math.PI * 2);
      context.fill();
    }
  }, [frame, seed]);

  return <canvas ref={canvasRef} width={1200} height={520} style={{width: '100%', height: '100%'}} aria-hidden="true" />;
};
