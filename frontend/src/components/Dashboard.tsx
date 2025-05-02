import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StepProgressBar from "./StepProgressBar"; 
import { startCarousel, resetCarousel } from '../components/Carousel';
import { motion } from 'framer-motion';

const Dashboard = () => {

  type Achievement = {
    achievementId: string;
    progress: number;
  };

  const [user, setUser] = useState<{
    FirstName: string,
    LastName: string,
    level: number,
    xp: number,
    questComp: number,
    dailyQuests: number,
    achievements: Achievement[];
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        console.error("User not logged in.");
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(userData);
        if (!parsed._id) {
          console.error("User ID missing.");
          return;
        }
      } catch (e) {
        console.error("Failed to parse user data.");
        return;
      }

      try {
        const res = await fetch(`/api/getProfile?userId=${parsed._id}`);
        const data = await res.json();

        if (data?.error) {
          console.error("API Error:", data.error);
          return;
        }

        setUser(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchUserProfile();

    if (canvasRef.current) {
      startCarousel(canvasRef.current, navigate);
    }
  }, [navigate, location.key]);

  const handleLogout = () => {
    resetCarousel();
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    navigate("/");
  };

  return (
    <motion.div
      key={location.key}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ height: '100vh', width: '80vw', position: 'relative', overflow: 'hidden' }}>

        {/* Fixed Header */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '80px',
            backgroundColor: 'rgba(14, 1, 22, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: '20px',
            paddingLeft: '20px',
            zIndex: 20,
          }}
        >
          {/* User Info Left Side */}
          <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600 }}>
            {user ? (
              <div>
                <div>{`Welcome, ${user.FirstName} ${user.LastName}!`}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 400 }}>
                  Level: {user.level} | XP: {user.xp} | Quests Completed: {user.questComp}
                </div>
              </div>
            ) : (
              <div>Loading profile...</div>
            )}
          </div>

          {/* Logout Button */}
          <div
            onClick={handleLogout}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              backgroundColor: isHovered
                ? "rgba(255, 81, 0, 0.25)"
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
      position: 'relative', // ⬅️ Enable absolute positioning inside
    }}
  >
    {/* LEVEL BUBBLE */}
    {user && (
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          padding: '6px 16px',
          borderRadius: '20px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 10,
        }}
      >
        Level {user?.level ?? "n/a"} 
      </div>
    )}

    <StepProgressBar progress={user ? (user.xp % 100) / 100 : 0} />
  </div>
</div>

        {/* Canvas container */}
        <div ref={canvasRef} style={{ width: '100%', height: '100%', marginTop: '-40px' }} />
      </div>
    </motion.div>
  );
};

export default Dashboard;
