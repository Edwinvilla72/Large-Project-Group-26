import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

type Quest = {
  _id: string;
  Title: string;
  Description: string;
  xp: number;
  requirement: number;
  type: string;
  completed: boolean; // 👈 server-side tracking
};

function DailyQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const navigate = useNavigate();

  const calculateTimeLeft = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${hours.toString().padStart(2, '0')}h ${minutes
      .toString()
      .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchQuests = async () => {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      setError('No user data found. Please log in.');
      setLoading(false);
      return;
    }

    const { _id } = JSON.parse(userData);

    try {
      const response = await fetch('/api/getDailyQuests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: _id })
      });

      const raw = await response.text();
      if (!response.ok) {
        const errRes = JSON.parse(raw);
        setError(errRes.error || 'Failed to fetch daily quests');
        setLoading(false);
        return;
      }

      const data = JSON.parse(raw);
      setQuests(data.dailyQuests || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Error fetching quests. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const completeQuest = async (quest: Quest) => {
    const userData = localStorage.getItem('user_data');
    const { _id } = userData ? JSON.parse(userData) : {};

    try {
      const res = await fetch('https://merntest.fitgame.space/api/quests/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: _id, xp: quest.xp })
      });

      const data = await res.json();
      if (res.ok) {
        await fetchQuests(); // 🔄 refresh updated list
      } else {
        alert(data.error || 'Failed to complete quest.');
      }
    } catch (err) {
      console.error("Quest completion failed:", err);
    }
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
        <h1 className="neon-title">Daily Quests</h1>

        <p style={{ marginTop: '10px', fontSize: '1.1rem', fontWeight: 'bold' }}>
          Time Left: {timeLeft}
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-msg">{error}</p>
        ) : quests.length > 0 ? (
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {quests.map((quest) => (
              <li key={quest._id} style={{ marginBottom: '15px', opacity: quest.completed ? 0.6 : 1 }}>
                <strong style={{ textDecoration: quest.completed ? 'line-through' : 'none' }}>
                  {quest.Title || 'Unnamed Quest'}
                </strong><br />
                {quest.Description && <em>{quest.Description}</em>}<br />
                XP: {quest.xp} | Requirement: {quest.requirement}<br />

                {!quest.completed && (
                  <button
                    onClick={() => completeQuest(quest)}
                    className="button"
                    style={{ marginTop: '6px', fontSize: '0.8rem' }}
                  >
                    Complete
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No daily quests assigned.</p>
        )}

        <br />
        <button className="button" onClick={back}>Back</button>
      </div>
    </motion.div>
  );
}

export default DailyQuests;
