import React, { useState } from 'react';
import './SettingsPage.css';

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

<<<<<<< Updated upstream
  const addWorkout = (day: string) => {
    setWorkoutsByDay(prev => ({
      ...prev,
      [day]: [...prev[day], workoutOptions[0]], // default to first option
    }));
  };
=======
    // moves back to the dashboard (reloads the page for THREE,js to work right)
    function back() {
        // window reload necessary for the models to load back up as things are rn
        // cannot use navigate 
        window.location.href = "/Dashboard";
     }
    
     function deleteAccount() {
      // window reload necessary for the models to load back up as things are rn
      // cannot use navigate 
      window.location.href = "/Dashboard"; // ! ===CHANGEEE===
   }
>>>>>>> Stashed changes

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

  const handleDeleteAccount = () => {
    alert('Account deletion initiated.');
  };

  return (
    <div className="settings-container">
      <h2>Edit Weekly Routine</h2>
      <div className="workout-grid">
        <div className="grid-header">
          {weekdays.map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
        </div>
<<<<<<< Updated upstream
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
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <button
                        className="remove-btn"
                        onClick={() => removeWorkout(day, rowIndex)}
                      >
                        ✕
                      </button>
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
      <div className="delete-button-container">
        <button className="delete-button" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
=======
        <br></br>
        <button className="button" onClick={back}>Back</button>
        <br></br><br></br>
        <input type="button" className="neon-btn" value="Delete My Account" onClick={deleteAccount} />

      </motion.div>
    );
}
export default Settings;
>>>>>>> Stashed changes
