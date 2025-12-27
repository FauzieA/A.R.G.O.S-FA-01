import React from 'react';

export default function CircularProgress({ value, max = 100, isDanger }) {
  const radius = 100; // Bigger gauge
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, max) / max) * circumference;

  return (
    <div style={{ position: 'relative', width: '260px', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* 1. The SVG Gauge */}
      <svg width="260" height="260" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bf953f" />
            <stop offset="50%" stopColor="#fcf6ba" />
            <stop offset="100%" stopColor="#b38728" />
          </linearGradient>
        </defs>

        {/* Track (Dark Grey) */}
        <circle cx="130" cy="130" r={radius} stroke="#1a1a1a" strokeWidth="12" fill="transparent" />
        
        {/* Progress Fill (Gold or Red) */}
        <circle
          cx="130" cy="130" r={radius}
          stroke={isDanger ? '#c94646' : 'url(#goldGrad)'}
          strokeWidth="12" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>

      {/* 2. Center Text */}
      <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '4rem', fontFamily: 'Manrope', fontWeight: 800, color: '#e0e0e0', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#8a7e58', letterSpacing: '2px', marginTop: '5px' }}>
          CM
        </div>
        
        {/* Warning Label */}
        {isDanger && (
          <div style={{ 
            marginTop: '10px', padding: '4px 12px', background: 'rgba(201, 70, 70, 0.2)', 
            border: '1px solid #c94646', borderRadius: '4px', color: '#c94646', fontSize: '0.7rem', fontWeight: 'bold' 
          }}>
            OBSTACLE
          </div>
        )}
      </div>
    </div>
  );
}