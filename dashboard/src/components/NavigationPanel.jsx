import React from 'react';
import { Navigation, Disc, Moon } from 'lucide-react'; // Added 'Moon' icon for Sleep

export default function NavigationPanel({ status }) {
  // Determine Rotation & Active Sensors based on Status
  let rotation = 0;
  let activeSensor = -1; // Default: No sensors active
  let label = "SYSTEM IDLE";
  let isSleep = false;

  // --- LOGIC MAPPING ---
  if (status.includes("SLEEP")) {
    isSleep = true;
    label = "SLEEP MODE (LOW PWR)";
    activeSensor = -1; // All sensors off
  } 
  else if (status.includes("LEFT")) {
    rotation = -45;
    activeSensor = status.includes("SHARP") ? 0 : 1;
    label = "CORRECTING LEFT";
  } 
  else if (status.includes("RIGHT")) {
    rotation = 45;
    activeSensor = status.includes("SHARP") ? 4 : 3;
    label = "CORRECTING RIGHT";
  } 
  else if (status.includes("FWD")) {
    rotation = 0;
    activeSensor = 2; // Center sensor
    label = "TRACKING LINE";
  }

  // Visual Styles for Sleep Mode
  const primaryColor = isSleep ? '#444' : '#d4af37'; // Grey vs Gold
  const opacity = isSleep ? 0.3 : 1;

  return (
    <div className="glass-panel gold-border fade-in" style={{
      padding: '24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', boxSizing: 'border-box', position: 'relative',
      // Dim the whole panel if sleeping
      borderColor: isSleep ? '#333' : 'rgba(212, 175, 55, 0.3)'
    }}>
      <div style={{ position: 'absolute', top: '20px', left: '24px', fontSize: '0.75rem', color: isSleep ? '#666' : '#8a7e58', letterSpacing: '2px', fontWeight: 700, display: 'flex', gap: '8px' }}>
        {isSleep ? <Moon size={16} /> : <Navigation size={16} />} 
        {isSleep ? "STANDBY" : "NAV & TRACKING"}
      </div>

      {/* --- 1. THE COMPASS (STEERING) --- */}
      <div style={{ 
        marginTop: '20px',
        width: '120px', height: '120px', 
        border: `1px solid ${isSleep ? '#333' : 'rgba(212, 175, 55, 0.2)'}`, 
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isSleep ? 'none' : 'inset 0 0 20px rgba(0,0,0,0.5)',
        position: 'relative',
        opacity: opacity
      }}>
        {/* Static Tick Marks */}
        <div style={{ position: 'absolute', top: '5px', width: '2px', height: '10px', background: '#333' }}></div>
        <div style={{ position: 'absolute', bottom: '5px', width: '2px', height: '10px', background: '#333' }}></div>
        <div style={{ position: 'absolute', left: '5px', width: '10px', height: '2px', background: '#333' }}></div>
        <div style={{ position: 'absolute', right: '5px', width: '10px', height: '2px', background: '#333' }}></div>

        {/* The Rotating Arrow */}
        <div style={{ 
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', 
          transform: `rotate(${rotation}deg)` 
        }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2" fill={isSleep ? "transparent" : "rgba(212, 175, 55, 0.2)"} />
          </svg>
        </div>
      </div>

      <div style={{ marginTop: '15px', fontSize: '0.8rem', color: primaryColor, letterSpacing: '1px', fontWeight: 600 }}>
        {label}
      </div>

      {/* --- 2. THE SENSOR ARRAY --- */}
      <div style={{ marginTop: '25px', display: 'flex', gap: '8px', alignItems: 'center', opacity: opacity }}>
        <span style={{ fontSize: '0.6rem', color: '#444', marginRight: '5px' }}>L</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            width: '24px', height: '8px', borderRadius: '2px',
            background: i === activeSensor ? '#d4af37' : '#1a1a1a', 
            boxShadow: i === activeSensor ? '0 0 10px #d4af37' : 'none',
            border: '1px solid #333',
            transition: 'all 0.2s ease'
          }} />
        ))}
        <span style={{ fontSize: '0.6rem', color: '#444', marginLeft: '5px' }}>R</span>
      </div>
      
      {/* REAL (Simulated) Hardware Status */}
      <div style={{ marginTop: '15px', borderTop: '1px solid #222', paddingTop: '10px', width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.65rem', color: '#555', fontFamily: 'JetBrains Mono' }}>
        
        {/* GPS ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
           <span>GPS MODULE:</span>
           {/* If status includes 'SLEEP', show PAUSED. Else show FIXED. */}
           <span style={{ color: isSleep ? '#555' : '#488f5d' }}>
             {isSleep ? "STANDBY" : "FIXED [3.14, 101.68]"}
           </span>
        </div>

        {/* CAMERA ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
           <span>VIDEO FEED:</span>
           <span style={{ color: isSleep ? '#555' : '#c94646' }}>
             {isSleep ? "OFF" : "REC ● 1080p"}
           </span>
        </div>

      </div>
      
    </div>
  );
}