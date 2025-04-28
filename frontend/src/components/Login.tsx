import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/theme.css';

function Login() {
  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSetLoginName = (e: any) => setLoginName(e.target.value);
  const handleSetPassword = (e: any) => setPassword(e.target.value);

  // --- register button ---
  const RegisterButton = () => navigate('/register');

  // --- forgot password button ---
  const ForgotPassword = () => navigate('/ForgotPass');

  // --- Login button ---
  const doLogin = async (event: any) => {
    event.preventDefault();
    // JSON object containing user info
    const obj = { Login: loginName, Password: loginPassword };
    // converting our object into JSON
    const js = JSON.stringify(obj);

    // actions to perform upon clicking the "login" button
    try {
      // calls login API 
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: js
      });

      // stores message we get as a response (errors)
      const text = await response.text();

      // if there is an incorrect response from the server
      if (!response.ok) {
        const errRes = JSON.parse(text);
        setMessage(errRes.error || 'Login failed.');
        return;
      }

      // saves the error 
      const res = JSON.parse(text);

      // if either the user's username or password is incorrect
      if (!res._id || res._id <= 0) {
        setMessage('User/Password combination incorrect');
        return;
      }

      // if login was successful, set username, passwordm and user id to the returned values
      const user = {
        FirstName: res.FirstName,
        LastName: res.LastName,
        _id: res._id
      };


      localStorage.setItem('user_data', JSON.stringify(user));
      setMessage('');
      navigate('/Dashboard');

    // if there was no response from the server, let the user know
    } catch (error: any) {
      console.error('Login error:', error);
      setMessage('Server error. Please try again later.');
    }
  };

  // --- login page contents --- 
  return (
    <div className="fullscreen-background">
      <div className="login-stack">
        <h1 className="fitopia-title">🏋️‍♂️ Fitopia 🏃‍♂️</h1>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="neon-login-container">
            <h2 className="neon-title">LOGIN</h2>
            <form onSubmit={doLogin}>
            <input type="text" placeholder="Username" onChange={handleSetLoginName} />
            <input type="password" placeholder="Password" onChange={handleSetPassword} />
            <input type="submit" className="neon-btn" value="Login" onClick={doLogin} />
            </form>
            <input type="button" className="neon-btn secondary" value="Create an Account" onClick={RegisterButton} />
            <button className="forgot-link" onClick={ForgotPassword}>Forgot Password?</button>
            {message && <p className="login-msg">{message}</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
