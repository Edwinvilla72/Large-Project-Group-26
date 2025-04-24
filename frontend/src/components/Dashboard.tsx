import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepProgressBar from "./StepProgressBar"; 
import { startCarousel } from '../components/Carousel';
import { motion } from 'framer-motion'; // to animate pages ooooooo

const Dashboard = () => {
  const [user, setUser] = useState<{ FirstName: string, LastName: string, _id: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user_data');
    if (user) {
      setUser(JSON.parse(user));
    }
    if (canvasRef.current) {
      startCarousel(canvasRef.current, navigate); // Attach to this container
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token"); // or whatever you store
    localStorage.removeItem("user");
    navigate("/"); // redirect to login page
  };

  return (
    <motion.div
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -100, opacity: 0 }}
    transition={{ duration: 0.4 }}
    >
  
    <div style={{ height: '100vh', width: '80vw', position: 'relative', overflow: 'hidden' }}>
    <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '80px', // Adjust height as needed
          backgroundColor: 'rgba(14, 1, 22, 0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingRight: '20px',
          zIndex: 20, // Ensure it's above other content
        }}
      >
        {/* Logout Button */}
        <div
          onClick={handleLogout}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            backgroundColor: isHovered
              ? "rgba(255, 81, 0, 0.25)" // brighter on hover
              : "rgba(255, 81, 0, 0.14)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            fontFamily: "'Poppins', sans-serif",
            color: "white",
            border: isHovered
              ? "1.5px solid rgba(255, 255, 255, 0.8)"
              : "1.5px solid rgba(255, 106, 255, 0.7)",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            boxShadow: isHovered
              ? "0 0 12px rgba(255, 255, 255, 0.3)"
              : "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          Logout
        </div>
      </div>
      {/* Text content positioned on top */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 10, // 👈 make sure it's high enough
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0px 0px 10px rgba(0,0,0,0.7)',
        pointerEvents: 'none' // so canvas still gets mouse events
      }}>
        {user?.FirstName && <p>Welcome back {user.FirstName}!</p>}
      </div>
 {/* XP Progress Bar */}
        <div
          style={{
            position: 'absolute',
            top: '140px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 9,
            padding: '0 20px',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '12px 24px',
              backdropFilter: 'blur(5px)',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',

              width: '100%',
            }}
          >
            <StepProgressBar />
          </div>
        </div>

      {/* Canvas container goes under */}
      <div ref={canvasRef} style={{ width: '100%', height: '100%', marginTop: '-40px' }} /> 
      </div>
    </motion.div>
  );
};

export default Dashboard;
