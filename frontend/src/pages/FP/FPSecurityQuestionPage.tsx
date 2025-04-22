import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // if you're using React Router
import { motion } from 'framer-motion'; // to animate pages ooooooo
import securityQuestions from '../../data/securityQuestions'; // local array of questions

const FPSecurityQuestion = () => {
  const navigate = useNavigate(); // for redirecting

  // get user data from localStorage
  let _ud: any = localStorage.getItem('user_data');
  let ud = JSON.parse(_ud);

  const userId = ud?.userId;
  const username = ud?.username;
  const SecQNum = ud?.SecQNum || 0;
  const questionText = securityQuestions[SecQNum];

  const [SecQAns, setSecQAns] = useState('');

  // sends user (if they exist) to change their password
  async function verifyAnswer() {
    const obj = { userId, SecQAns }; // sending userId and the typed answer
    const js = JSON.stringify(obj);

    try {
      // call new verification endpoint
      const response = await fetch('/api/security-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: js
      });

      const data = await response.json();

      // if answer is incorrect 
      if (!response.ok || !data.userId || !data.SecQAns) {
        alert("Incorrect answer. Please try again.");
        return;
      }

      // store oldPassword and userId 
      localStorage.setItem('user_data', JSON.stringify({
        ...ud,
        oldPassword: data.oldPassword,
        userId: data.userId
      }));

      navigate('/ChangePassword');
    } catch (err) {
      console.error('Verification error:', err);
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
            <h2 className="neon-title">Hi, {ud?.FirstName || 'User'}!</h2>

            {/* display the user's security question */}
            <p className="neon-subtext">Answer your security question:</p>
            <p className="neon-subtext"><strong>{questionText}</strong></p><br />

            {/* answer input field */}
            <input
              type="text"
              value={SecQAns}
              onChange={e => setSecQAns(e.target.value)}
              placeholder="Your Answer"
            /><br />

            {/* on submit, verify the answer via API */}
            <input
              type="button"
              id="FPUserButton"
              className="neon-btn"
              value="Reset Password"
              onClick={verifyAnswer}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default FPSecurityQuestion;
