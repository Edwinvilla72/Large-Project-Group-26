import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startCarousel } from '../components/Carousel';
import { motion } from 'framer-motion'; // to animate pages ooooooo

const Dashboard = () => {
  const [user, setUser] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user_data');
    if (user) {
      setUser(JSON.parse(user));
    }
    if (canvasRef.current) {
      startCarousel(canvasRef.current, navigate); // Attach to this container
    }
  }, []);

  return (
    <motion.div
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -100, opacity: 0 }}
    transition={{ duration: 0.4 }}
    >
  
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
        {user && <p>Welcome back {user.FirstName}!</p>}
      </div>

      {/* Canvas container goes under */}
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
    </motion.div>
  );
};

export default Dashboard;
