import React from 'react';

export default function HeartbeatGraph({ data, isOffline }) {
  // 1. Configuration
  const width = 100;
  const height = 50;
  const maxVal = 100; // Y-axis ceiling

  // 2. Generate the SVG Path
  // We map the array of numbers to X,Y coordinates
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (Math.min(val, maxVal) / maxVal) * height;
    return `${x},${y}`;
  }).join(' ');

  // 3. Dynamic Styles
  const strokeColor = isOffline ? '#c94646' : '#d4af37'; // Red if offline, Gold if online
  const fillColor = isOffline ? 'rgba(201, 70, 70, 0.1)' : 'rgba(212, 175, 55, 0.1)';

  return (
    <div className="glass-panel gold-border fade-in" style={{
      padding: '20px',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      borderColor: isOffline ? '#c94646' : 'rgba(212, 175, 55, 0.3)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.7rem', fontFamily: 'Manrope', fontWeight: 700, color: isOffline ? '#c94646' : '#8a7e58', letterSpacing: '1.5px' }}>
          LIVE SIGNAL MONITOR
        </span>
        <span style={{ fontSize: '0.7rem', color: isOffline ? '#c94646' : '#d4af37', fontFamily: 'JetBrains Mono' }}>
          {isOffline ? "NO CARRIER" : `${data[data.length - 1]} ms`}
        </span>
      </div>

      {/* The Graph */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }} preserveAspectRatio="none">
          
          {/* Fill Gradient Area */}
          <path 
            d={`M 0,${height} ${points} L ${width},${height} Z`} 
            fill={fillColor} 
            stroke="none" 
          />
          
          {/* The Line */}
          <polyline 
            points={points} 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Grid Lines (Background Decoration) */}
        <div style={{ position: 'absolute', top: '25%', width: '100%', height: '1px', background: '#333', opacity: 0.3 }}></div>
        <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: '#333', opacity: 0.3 }}></div>
        <div style={{ position: 'absolute', top: '75%', width: '100%', height: '1px', background: '#333', opacity: 0.3 }}></div>
      </div>
    </div>
  );
}