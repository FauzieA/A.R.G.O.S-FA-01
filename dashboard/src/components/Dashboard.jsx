import React, { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { Wifi, Radio } from 'lucide-react';
import MetricCard from './MetricCard'; // (Optional if used elsewhere)
import CircularProgress from './CircularProgress';
import NavigationPanel from './NavigationPanel'; 
import HeartbeatGraph from './HeartbeatGraph';

export default function Dashboard() {
  const [data, setData] = useState({ status: "IDLE", distance: 0 });
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false); // MQTT Socket Status
  const [signalLost, setSignalLost] = useState(false); // Data Flow Status (Threshold)
  
  // --- GRAPH DATA STATE ---
  const [graphData, setGraphData] = useState(Array(40).fill(0));
  
  // --- THRESHOLD TIMER REF ---
  const lastPacketTimeRef = useRef(Date.now()); 

  useEffect(() => {
    // 1. CONNECT TO MQTT
    const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
    
    client.on('connect', () => {
      setConnected(true);
      addLog("System Initialized", "#d4af37");
      client.subscribe('CDE2243/Robot/Data');
    });

    client.on('message', (_, msg) => {
      try {
        const payload = JSON.parse(msg.toString());
        setData(payload);
        
        // ★ CRITICAL: Update the timestamp whenever data arrives
        lastPacketTimeRef.current = Date.now();
        
        if(payload.status.includes("STOP")) addLog(`Proximity Alert: ${payload.distance}cm`, "#c94646");
      } catch(e) {}
    });

    client.on('offline', () => setConnected(false));

    // 2. LIVE GRAPH INTERVAL (Runs every 100ms)
    const graphInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLast = now - lastPacketTimeRef.current;
      
      // ★ LOGIC: If silence > 2000ms, force Flatline (0)
      const isDead = timeSinceLast > 2000;
      setSignalLost(isDead); // Updates the Red/Gold color state

      setGraphData(prevData => {
        const newVal = isDead 
          ? 0  // Flatline if threshold exceeded
          : Math.floor(Math.random() * (45 - 20 + 1)) + 20; // Healthy Jitter if live

        // Scroll the array
        return [...prevData.slice(1), newVal];
      });
    }, 100);

    return () => {
      client.end();
      clearInterval(graphInterval);
    };
  }, []);

  const addLog = (msg, color) => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [{ time, msg, color }, ...prev].slice(0, 15));
  };

  const isDanger = data.distance < 20;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Header */}
      <header className="fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <div>
          {/* THE COMBINED NAME */}
          <h1 className="gold-text" style={{ fontSize: '2rem', margin: 0, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            A.R.G.O.S. 
            {/* The Initials "Stamp" */}
            <span style={{ 
              fontSize: '0.8rem', 
              color: '#8a7e58', 
              background: 'rgba(212, 175, 55, 0.1)', 
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '4px 10px', 
              borderRadius: '4px',
              fontFamily: 'JetBrains Mono',
              letterSpacing: '1px',
              verticalAlign: 'middle'
            }}>
              MODEL: FA-01
            </span>
          </h1>
          
          {/* THE ACRONYM DEFINITION */}
          <p style={{ margin: '8px 0 0', color: '#666', fontSize: '0.9rem', letterSpacing: '1px', fontFamily: 'JetBrains Mono' }}>
            Autonomous Robot Guidance & Obstacle Sensing
          </p>
        </div>
        
        {/* Connection Badge (Keep this as is) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderRadius: '50px', background: '#0a0a0a', border: '1px solid #333' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: !signalLost ? '#d4af37' : '#c94646', boxShadow: !signalLost ? '0 0 10px #d4af37' : 'none' }} />
          <span style={{ fontSize: '0.75rem', color: !signalLost ? '#d4af37' : '#c94646', fontWeight: 600, letterSpacing: '1px' }}>
            {!signalLost ? 'LINK ONLINE' : 'SIGNAL LOST'}
          </span>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="bento-grid fade-in">
        
        {/* 1. HERO GAUGE */}
        <div className="col-span-2 glass-panel gold-border" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '24px', left: '30px', fontSize: '0.8rem', color: '#8a7e58', letterSpacing: '2px', fontWeight: 700 }}>
            PROXIMITY SENSOR ARRAY
          </div>
          <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <CircularProgress value={data.distance} isDanger={isDanger} />
        </div>

        {/* 2. RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* A. NAVIGATION PANEL */}
          <div style={{ flex: 1.5 }}>
            <NavigationPanel status={data.status} />
          </div>
          
          {/* B. GRAPH CARD */}
          <div style={{ flex: 1 }}>
            {/* We pass 'signalLost' so the graph knows when to turn RED */}
            <HeartbeatGraph data={graphData} isOffline={signalLost} />
          </div>

        </div>

        {/* 3. TERMINAL */}
        <div className="col-span-3 glass-panel gold-border" style={{ padding: '30px', minHeight: '300px' }}>
          <div style={{ fontSize: '0.8rem', color: '#8a7e58', letterSpacing: '2px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Radio size={16} /> ONBOARD TERMINAL
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: '15px', paddingBottom: '10px', borderBottom: '1px solid #222' }}>
                <span style={{ color: '#444' }}>{log.time}</span>
                <span style={{ color: log.color || '#888' }}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}