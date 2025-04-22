import React, { useState } from 'react';
import '../styles/Settings.css';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const muscleGroups: Record<string, string[]> = {
  Chest: [
    'Bench Press',
    'Incline Bench Press',
    'Decline Bench Press',
    'Dumbbell Chest Press',
    'Push-Ups',
    'Cable Crossover',
    'Chest Fly (Machine)',
    'Dips (Chest Focus)',
    'Guillotine Press',
    'Landmine Press',
    'Pec Deck Machine',
    'Resistance Band Fly'
  ],
  Shoulders: [
    'Shoulder Press',
    'Arnold Press',
    'Lateral Raises',
    'Front Raises',
    'Rear Delt Fly',
    'Overhead Dumbbell Press',
    'Upright Rows',
    'Shrugs',
    'Z Press',
    'Dumbbell Cuban Rotation',
    'Cable Lateral Raises'
  ],
  Triceps: [
    'Tricep Dips',
    'Tricep Pushdowns',
    'Overhead Tricep Extension',
    'Close-Grip Bench Press',
    'Skull Crushers',
    'Cable Kickbacks',
    'Diamond Push-Ups',
    'Reverse Grip Pushdowns',
    'Dumbbell Kickbacks',
    'Lying Dumbbell Extensions',
    'Single-Arm Overhead Extension'
  ],
  Back: [
    'Pull Ups',
    'Chin-Ups',
    'Lat Pulldowns',
    'Seated Cable Rows',
    'Bent-over Rows',
    'T-Bar Rows',
    'Deadlifts',
    'Face Pulls',
    'Meadow Rows',
    'Rack Pulls',
    'Straight Arm Pulldown',
    'Renegade Rows'
  ],
  Biceps: [
    'Bicep Curls',
    'Hammer Curls',
    'Concentration Curls',
    'Preacher Curls',
    'EZ Bar Curls',
    'Incline Dumbbell Curls',
    'Cable Curls',
    'Spider Curls',
    'Zottman Curls',
    'Bayesian Cable Curls',
    'Reverse Curls'
  ],
  Legs: [
    'Back Squats',
    'Front Squats',
    'Leg Press',
    'Lunges',
    'Goblet Squats',
    'Leg Extensions',
    'Hamstring Curls',
    'Bulgarian Split Squats',
    'Calf Raises',
    'Step-Ups',
    'Romanian Deadlifts',
    'Glute Bridges',
    'Sissy Squats',
    'Walking Lunges'
  ],
  Core: [
    'Planks',
    'Sit-Ups',
    'Russian Twists',
    'Hanging Leg Raises',
    'Crunches',
    'Bicycle Kicks',
    'Cable Woodchoppers',
    'Ab Wheel Rollouts',
    'Mountain Climbers',
    'V-Ups',
    'Flutter Kicks',
    'Toe Touches',
    'Dead Bug',
    'Side Plank with Reach'
  ],
  Cardio: [
    'Running (Treadmill or Outdoor)',
    'Jump Rope',
    'Cycling',
    'Rowing Machine',
    'High Knees',
    'Burpees',
    'Jumping Jacks',
    'Stair Climbers',
    'Shadowboxing',
    'Mountain Climbers',
    'Battle Ropes',
    'Elliptical Trainer',
    'Jump Squats'
  ],
  Full_Body: [
    'Burpees',
    'Kettlebell Swings',
    'Clean and Press',
    'Thrusters',
    'Snatches',
    'Deadlifts',
    'Farmer’s Walk',
    'Battle Ropes',
    'Wall Balls',
    'Man Makers',
    'Sandbag Shouldering',
    'Bear Crawls',
    'Sled Push/Pull'
  ]
};



const groupOptions = Object.keys(muscleGroups);

const SettingsPage: React.FC = () => {
  const [workoutsByDay, setWorkoutsByDay] = useState<{ [day: string]: string[] }>(
    weekdays.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
  );

  const [muscleGroupByDay, setMuscleGroupByDay] = useState<{ [day: string]: string }>(
    weekdays.reduce((acc, day) => ({ ...acc, [day]: groupOptions[0] }), {})
  );

  const [deleteInput, setDeleteInput] = useState(''); // for delete confirmation

  // Adds the first exercise of selected group to the list (defaulted)
  const addWorkout = (day: string) => {
    const group = muscleGroupByDay[day];
    const options = muscleGroups[group] || [];
    if (options.length === 0) return;
    setWorkoutsByDay(prev => ({
      ...prev,
      [day]: [...prev[day], options[0]],
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

  const updateMuscleGroup = (day: string, group: string) => {
    setMuscleGroupByDay(prev => ({ ...prev, [day]: group }));
    setWorkoutsByDay(prev => ({ ...prev, [day]: [] }));
  };

  // Save routine button logic
  const handleSaveRoutine = async () => {
    const storedData = localStorage.getItem("user_data");
    if (!storedData) {
      console.error("No user data found in localStorage.");
      return;
    }
    const userId = JSON.parse(storedData)._id;

    try {
      const res = await fetch('/api/routine', {
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

  // Delete account logic - requires typing 'delete' and uses secret key
  const handleDeleteAccount = async () => {
    const storedData = localStorage.getItem("user_data");
    const userId = storedData ? JSON.parse(storedData)._id : null;

    if (!userId) {
      alert("User session not found. Please log in again.");
      return;
    }

    if (deleteInput.trim().toLowerCase() !== "delete") {
      alert("Please type 'delete' exactly to confirm account deletion.");
      return;
    }

    try {
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          verification_key: "GERBERDAGOAT4331"
        })
      });

      if (res.ok) {
        alert("Account successfully deleted.");
        localStorage.clear();
        window.location.href = "/";
      } else {
        const data = await res.json();
        alert("Deletion failed: " + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Server error. Try again later.");
    }
  };

  function back() {
    window.location.href = "/Dashboard";
  }

  return (
    <div className="settings-container">
      <h2>Edit Weekly Routine</h2>

      <div className="routine-grid">
        {weekdays.map((day, colIndex) => {
          const group = muscleGroupByDay[day];
          const options = muscleGroups[group] || [];

          return (
            <div key={day} className="routine-column">
              <div className="day-title">{day}</div>

              <select
                className="group-dropdown"
                value={group}
                onChange={(e) => updateMuscleGroup(day, e.target.value)}
              >
                {groupOptions.map((groupOpt) => (
                  <option key={groupOpt} value={groupOpt}>{groupOpt}</option>
                ))}
              </select>
              <div className='workout-scroll'>
                {[...Array(5)].map((_, rowIndex) => (
                  <div key={rowIndex} className="workout-cell">
                    {workoutsByDay[day][rowIndex] !== undefined ? (
                      <div className="workout-row">
                        <select
                          value={workoutsByDay[day][rowIndex]}
                          onChange={(e) => updateWorkout(day, rowIndex, e.target.value)}
                        >
                          {options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <button onClick={() => removeWorkout(day, rowIndex)}>✕</button>
                      </div>
                    ) : rowIndex === workoutsByDay[day].length ? (
                      <button className="add-btn" onClick={() => addWorkout(day)}>+ Add</button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="buttons-row">
        <button className="save-button" onClick={handleSaveRoutine}>Save Routine</button>
        <button className="delete-button" onClick={handleDeleteAccount}>Delete Account</button>
        <button className="button" onClick={back}>Back</button>
      </div>

      <div className="delete-verification">
        <p style={{ marginTop: "20px" }}>Type <strong>delete</strong> to confirm account deletion:</p>
        <input
          type="text"
          value={deleteInput}
          onChange={e => setDeleteInput(e.target.value)}
          placeholder="Type delete here"
        />
      </div>
    </div>
  );
};

export default SettingsPage;