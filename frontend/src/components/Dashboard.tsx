import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startCarousel } from '../components/Carousel';


const Dashboard = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (canvasRef.current) {
      startCarousel(canvasRef.current, navigate); // Attach to this container
    }
  }, []);

  return (
    <div style={{ height: '100vh', width: '80vw', position: 'relative', overflow: 'hidden' }}>
      {/* Text content positioned on top */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 10, // 👈 make sure it's high enough
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0px 0px 10px rgba(0,0,0,0.7)',
        pointerEvents: 'none' // so canvas still gets mouse events
      }}>
        Welcome back!
      </div>

      {/* Canvas container goes under */}
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Dashboard;
