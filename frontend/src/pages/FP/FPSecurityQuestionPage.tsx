import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // if you're using React Router
import { motion } from 'framer-motion'; // to animate pages ooooooo
import securityQuestions from '../../data/securityQuestions'; // Local security question array

const FPSecurityQuestion = () => {
  const navigate = useNavigate(); // for redirecting
  let _ud: any = localStorage.getItem('user_data');
  let ud = JSON.parse(_ud);

  // pulls the question index stored during registration
  const SecQNum = ud?.SecQNum || 0;

  // maps the index to the actual question string
  const questionText = securityQuestions[SecQNum];

  const [SecQAns, setSecQAns] = useState(''); // user's typed answer

  // performs verification after clicking the reset password button
  async function SecurityQuestions() {
    const obj = {
      SecQNum,      // send question index
      SecQAns       // send answer in plain text
    };

    const js = JSON.stringify(obj);

    // send to backend for verification
    console.log("Submitting:", js); 

    // sends user (if they exist) to change their password
    window.location.href = '/ChangePassword';
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="fullscreen-background">
        <div className="login-stack">
          <h1 className="fitopia-title">🏋️‍♂️Fitopia🏃‍♂️</h1>
          <div className="neon-login-container">
            <h2 className="neon-title">Hi, {ud?.FirstName || 'User'}!</h2>

            <p className="neon-subtext">Answer your security question:</p>
            <p className="neon-subtext"><strong>{questionText}</strong></p><br />

            <input
              type="text"
              value={SecQAns}
              onChange={e => setSecQAns(e.target.value)}
              placeholder="Your Answer"
            /><br />

            <input
              type="button"
              id="FPUserButton"
              className="neon-btn"
              value="Reset Password"
              onClick={SecurityQuestions}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FPSecurityQuestion;
