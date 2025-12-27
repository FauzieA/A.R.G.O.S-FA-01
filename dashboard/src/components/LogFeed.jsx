import React from 'react';

export default function LogFeed({ logs }) {
  return (
    <div className="fade-in" style={{ 
      background: 'var(--bg-panel)', 
      borderRadius: '16px', 
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Activity</h3>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '12px', display: 'flex', gap: '12px', color: log.color, opacity: 0.9 }}>
            <span style={{ color: 'var(--text-secondary)', minWidth: '70px' }}>{log.time}</span>
            <span>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}