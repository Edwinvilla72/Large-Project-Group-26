import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

type Achievement = {
  _id: string;
  Title: string;
  Description: string;
  xp: number;
  requirement: number;
  type: string;
};

type UserAchievement = {
  achievementId: string;
  progress: number;
};

function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProgress, setUserProgress] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        setError('No user data found. Please log in.');
        setLoading(false);
        return;
      }

      const { _id } = JSON.parse(userData);

      try {
        const allRes = await fetch('/api/getAllAchievements');
        const userRes = await fetch(`/api/getUserAchievements?userId=${_id}`);

        const allData = await allRes.json();
        const userData = await userRes.json();

        // Log and dynamically handle both raw array or object structure
        console.log(" allAchievements:", allData);
        console.log(" userProgress:", userData);

        const allAchievements = Array.isArray(allData) ? allData : allData.achievements;
        const userAchievements = Array.isArray(userData) ? userData : userData.achievements;

        setAchievements(allAchievements || []);
        setUserProgress(userAchievements || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError("Failed to load achievements.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProgress = (id: string): number => {
    const match = userProgress.find((a) => a.achievementId === id);
    return match?.progress ?? 0;
  };

  const back = () => {
    window.location.href = "/Dashboard";
  };

  return (
      <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.4 }}
      >
        <div className="neon-login-container">
          <h1 className="neon-title">Achievements</h1>

          {loading ? (
              <p>Loading...</p>
          ) : error ? (
              <p className="error-msg">{error}</p>
          ) : achievements.length > 0 ? (
              <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                {achievements.map((ach) => {
                  const progress = getProgress(ach._id);
                  return (
                      <li key={ach._id} style={{ marginBottom: '15px' }}>
                        <strong>{ach.Title}</strong><br />
                        {ach.Description && <em>{ach.Description}</em>}<br />
                      </li>
                  );
                })}
              </ul>
          ) : (
              <p>No achievements available.</p>
          )}

          <br />
          <button className="button" onClick={back}>Back</button>
        </div>
      </motion.div>
  );
}

export default Achievements;
