// ===== Settings.tsx =====
import React, { useState } from 'react';
import '../styles/Settings.css';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const workoutOptions = [
  'Bench Press',
  'Shoulder Press',
  'Tricep Dips',
  'Pull Ups',
  'Bent-over Rows',
  'Bicep Curls',
  'Back Squats',
  'Weighted Lunges',
  'Calf Raises',
];

const SettingsPage: React.FC = () => {
  const [workoutsByDay, setWorkoutsByDay] = useState<{ [day: string]: string[] }>(
    weekdays.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
  );

  const addWorkout = (day: string) => {
    setWorkoutsByDay(prev => ({
      ...prev,
      [day]: [...prev[day], workoutOptions[0]],
    }));
  };

  const removeWorkout = (day: string, index: number) => {
    setWorkoutsByDay(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const updateWorkout = (day: string, index: number, value: string) => {
    const updated = [...workoutsByDay[day]];
    updated[index] = value;
    setWorkoutsByDay(prev => ({
      ...prev,
      [day]: updated,
    }));
  };

  const handleSaveRoutine = async () => {
    const storedData = localStorage.getItem("user_data");
    if (!storedData) {
      console.error("No user data found in localStorage.");
      return;
    }
    const userId = JSON.parse(storedData)._id;

    try {
      const res = await fetch('http://localhost:3000/api/routine', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, routine: workoutsByDay })
      });

      const data = await res.json();
      if (res.ok) alert("Routine saved!");
      else console.error(data.message);
    } catch (err) {
      console.error("Failed to save routine:", err);
    }
  };

  const handleDeleteAccount = () => {
    alert('Account deletion initiated.');
  };

  function back() {
    window.location.href = "/Dashboard";
  }

  return (
    <div className="settings-container">
      <h2>Edit Weekly Routine</h2>
      <div className="workout-grid">
        <div className="grid-header">
          {weekdays.map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
        </div>
        <div className="grid-body">
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid-row">
              {weekdays.map(day => (
                <div key={day} className="grid-cell">
                  {workoutsByDay[day][rowIndex] !== undefined ? (
                    <div className="workout-row">
                      <select
                        value={workoutsByDay[day][rowIndex]}
                        onChange={e => updateWorkout(day, rowIndex, e.target.value)}
                      >
                        {workoutOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <button className="remove-btn" onClick={() => removeWorkout(day, rowIndex)}>✕</button>
                    </div>
                  ) : rowIndex === workoutsByDay[day].length ? (
                    <button className="add-btn" onClick={() => addWorkout(day)}>+ Add</button>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div><button className="save-button" onClick={handleSaveRoutine}>Save Routine</button></div>
      <div className="delete-button-container">
        <button className="delete-button" onClick={handleDeleteAccount}>Delete Account</button>
      </div>
      <br />
      <button className="button" onClick={back}>Back</button>
    </div>
  );
};

export default SettingsPage;