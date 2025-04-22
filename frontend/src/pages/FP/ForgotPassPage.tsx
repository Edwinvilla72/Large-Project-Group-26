import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import "../../styles/theme.css";

const ForgotPass = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  // Called when user clicks "Reset Password"
  async function SecurityQuestions() {

    try {
      const response = await fetch(`/api/get-security-question?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  

      const data = await response.json();

      // If username not found or invalid response
      if (!response.ok || data.SecQNum === undefined || !data.id) {
        alert("Username not found or invalid.");
        return;
      }

      // Save username, security question index, and userId to localStorage
      localStorage.setItem('user_data', JSON.stringify({
        username: username,
        FirstName: data.FirstName,
        SecQNum: data.SecQNum,
        userId: data.id
      }));

      // redirect to FPSecurityQuestionPage
      navigate('/FPSecurityQuestion');
    } catch (err) {
      console.error("Error:", err);
      alert("Server error. Try again later.");
    }
  }

  return (
    <div className="fullscreen-background">
      <div className="login-stack">
        <h1 className="fitopia-title">🏋️‍♂️Fitopia🏃‍♂️</h1>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="neon-login-container">
            <h2 className="neon-title">Forgot your password?</h2>
            <p className="neon-subtext">Enter your username</p>

            {/* Username input */}
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
            />

            {/* Reset button that triggers API call */}
            <input
              type="button"
              className="neon-btn"
              value="Reset Password"
              onClick={SecurityQuestions}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPass;