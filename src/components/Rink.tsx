'use client'

import ShootThePuck from '@/lib/canvas/game';
import { useRef, useEffect, useState } from 'react';

const Rink = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const context = canvas.getContext('2d');
    if(!context) return;
    const rink = new ShootThePuck(context, canvas);
    rink.draw();
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