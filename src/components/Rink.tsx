'use client'

import HockeyRink from '@/lib/canvas/drawRink';
import drawRink from '@/lib/canvas/drawRink';
import { useRef, useEffect } from 'react';

const Rink = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const context = canvas.getContext('2d');
    if(!context) return;
    const rink = new HockeyRink(context, canvas);
    rink.drawRink();
    rink.addEventListeners();
    rink.startPowerAnimation();

    return () => {
      rink.removeEventListeners();
    }
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width={390} height={844}/>
    </div>
  );
}

export default Rink;