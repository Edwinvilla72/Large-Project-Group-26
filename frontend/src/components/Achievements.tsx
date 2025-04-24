import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // to animate pages ooooooo
import Dashboard from './Dashboard';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type Achievement = {
  _id: string;
  title: string;
  description: string;
  requirement: number;
};

type UserAchievement = {
  achievementId: string;
  progress: number;
};

function Achievements() {
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const back = () => {
    window.location.href = "/Dashboard";
  };

  useEffect(() => {
    const fetchAchievements = async () => {
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        setError("No user data found. Please log in.");
        setLoading(false);
        return;
      }

      const { _id } = JSON.parse(userData);

      try {
        const allRes = await fetch('/api/getAllAchievements');
        const userRes = await fetch(`/api/getUserAchievements?userId=${_id}`);

        const allData = await allRes.json();
        const userData = await userRes.json();

        setAllAchievements(allData.achievements || []);
        setUserAchievements(userData.achievements || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError("Failed to load achievements.");
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const getProgress = (id: string) => {
    const userAch = userAchievements.find(a => a.achievementId === id);
    return userAch?.progress ?? 0;
  };

  const isComplete = (id: string, requirement: number) => {
    const prog = getProgress(id);
    return prog >= requirement;
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
        ) : (
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {allAchievements.map((ach) => (
              <li key={ach._id} style={{ marginBottom: '15px', opacity: isComplete(ach._id, ach.requirement) ? 0.6 : 1 }}>
                <strong style={{ textDecoration: isComplete(ach._id, ach.requirement) ? 'line-through' : 'none' }}>
                  {ach.title}
                </strong><br />
                {ach.description}<br />
                Progress: {getProgress(ach._id)}/{ach.requirement}
              </li>
            ))}
          </ul>
        )}

        <br />
        <button className="button" onClick={back}>Back</button>
      </div>
    </motion.div>
  );
}

export default Achievements;
