import React from 'react';

export default function MetricCard({ label, value, subtext, icon: Icon }) {
  // Smart Feature: Detect if the subtext is a warning (contains ⚠️)
  const isWarning = subtext && subtext.includes("⚠️");

  return (
    <div className="glass-panel gold-border fade-in" style={{
      padding: '24px', // Adjusted for cleaner spacing in the grid
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between',
      height: '100%', // Critical: Forces card to fill the grid cell
      boxSizing: 'border-box',
      background: 'linear-gradient(180deg, rgba(30,30,30,0.6) 0%, rgba(10,10,10,0.8) 100%)'
    }}>
      
      {/* Top Row: Label & Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ 
          fontSize: '0.75rem', 
          fontFamily: 'Manrope', 
          fontWeight: 700, 
          color: '#8a7e58', 
          textTransform: 'uppercase', 
          letterSpacing: '1.5px' 
        }}>
          {label}
        </span>
        {Icon && <Icon size={20} color="#d4af37" style={{ opacity: 0.8 }} />}
      </div>

      {/* Bottom Row: Value & Subtext */}
      <div style={{ marginTop: '20px' }}>
        <div className="gold-text" style={{ fontSize: '2.2rem', letterSpacing: '-0.02em', lineHeight: '1' }}>
          {value}
        </div>
        
        {subtext && (
          <div style={{ 
            fontSize: '0.8rem', 
            // If it's a warning, turn RED. Otherwise, stay GREY.
            color: isWarning ? '#c94646' : '#666', 
            marginTop: '8px', 
            fontFamily: 'JetBrains Mono',
            fontWeight: isWarning ? 'bold' : 'normal'
          }}>
            {subtext}
          </div>
        )}
      </div>
      
      {/* Decorative Gold Line at bottom */}
      <div style={{ 
        width: '100%', 
        height: '1px', 
        background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', 
        marginTop: '24px', 
        opacity: 0.3 
      }}></div>
    </div>
  );
}