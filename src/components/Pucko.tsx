'use client'

import Pucko from '@/lib/canvas/pucko';
import { useRef, useEffect, useState } from 'react';

const PuckoGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Initialize Pucko with the canvas and context
      const pucko = new Pucko(canvas);
      pucko.draw();
      pucko.addEventlisteners();

      return () => {
        pucko.removeEventlisteners();
      };
    }, []);

    return (
      <div>
        <canvas ref={canvasRef} width={390} height={844} />
      </div>
    );
}

export default PuckoGame;