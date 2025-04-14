import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ForgotPass = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  function SecurityQuestions() {
    const obj = { username: username };
    const js = JSON.stringify(obj);

    alert(`If username was found in DB, send them to security questions. If not, show error.`);
    navigate('/FPSecurityQuestion');
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="neon-login-container">
        <h1 className="neon-title">Forgot your password?</h1>
        <p className="neon-subtext">Enter your username</p>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="button"
          className="neon-btn"
          value="Reset Password"
          onClick={SecurityQuestions}
        />
      </div>
    </motion.div>
  );
};

export default ForgotPass;
