import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Quest {
  title: string;
  rewardXP: number;
  completed: boolean;
}

function GymQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedData = localStorage.getItem("user_data");
    if (!storedData) return;
    const userId = JSON.parse(storedData)._id;
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`completed_${userId}_${today}`);
    if (saved) setCompletedToday(new Set(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    const fetchRoutine = async () => {
      const storedData = localStorage.getItem("user_data");
      if (!storedData) {
        console.error("No user data found in localStorage.");
        return;
      }
      const userId = JSON.parse(storedData)._id;
      const today = new Date().toLocaleString('en-US', { weekday: 'long' });

      try {
        const res = await fetch(`/api/routine/${userId}`);
        const data = await res.json();

        if (!res.ok) {
          console.error("Error fetching routine");
          return;
        }

        const workouts = data.routine[today] || [];
        const todayDate = new Date().toISOString().split("T")[0];
        const saved = localStorage.getItem(`completed_${userId}_${todayDate}`);
        const completedSet = saved ? new Set(JSON.parse(saved)) : new Set();

        const sets = 4;
        const reps = 10;

        const generatedQuests = workouts.map((w: string) => {
          const title = `Do ${sets} sets of ${reps} ${w}`;
          return {
            title,
            rewardXP: sets * reps,
            completed: completedSet.has(title)
          };
        });

        setQuests(generatedQuests);
      } catch (err) {
        console.error("Error loading quests:", err);
      }
    };

    fetchRoutine();
  }, []);

  const handleComplete = async (index: number) => {
    const storedData = localStorage.getItem("user_data");
    if (!storedData) return;
    const userId = JSON.parse(storedData)._id;
    const xp = quests[index].rewardXP;
    const questTitle = quests[index].title;
    const todayDate = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, xp })
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`✅ XP awarded! XP: ${data.xp}, Level: ${data.level}`);

        // Update completion state and persist
        const updatedCompleted = new Set(completedToday);
        updatedCompleted.add(questTitle);
        localStorage.setItem(`completed_${userId}_${todayDate}`, JSON.stringify([...updatedCompleted]));
        setCompletedToday(updatedCompleted);

        setQuests(prev =>
          prev.map((q, i) => (i === index ? { ...q, completed: true } : q))
        );
      } else {
        console.error("Error awarding XP:", data.error);
      }
    } catch (err) {
      console.error("Failed to complete quest:", err);
    }
  };

  function back() {
    window.location.href = "/Dashboard";
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="neon-login-container">
        <h1 className="neon-title">Gym Quests</h1>
        {quests.length === 0 ? (
          <p>No quests for today! Set your routine in Settings.</p>
        ) : (
          quests.map((q, idx) => (
            <div key={idx} className="quest-card">
              <p style={{ textDecoration: q.completed ? "line-through" : "none" }}>
                {q.title} - {q.rewardXP} XP
              </p>
              {!q.completed && (
                <button className="button" onClick={() => handleComplete(idx)}>Complete</button>
              )}
            </div>
          ))
        )}
        <br />
        <button className="button" onClick={back}>Back</button>
      </div>
    </motion.div>
  );
}

export default GymQuests;
