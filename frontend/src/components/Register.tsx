import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import '../styles/theme.css';

// insert code here
function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    
    const navigate = useNavigate(); // for redirecting

    // performs registration after clicking the create an account button
    async function doRegister(event: any): Promise<void> {
        event.preventDefault();
      
        // if any fields are empty, error
        if (!firstName || !lastName || !username || !password || !passwordConfirm) {
            setMessage("Please fill in all fields.");
            setIsError(true);
            return;
        }

        // password confirmation check
        if (password !== passwordConfirm) {
            setMessage("Passwords do not match.");
            setIsError(true);
            return;
        }

        // if everything is correct, send user info to the database to add the user to it
        const obj = {
            FirstName: firstName,
            LastName: lastName,
            Login: username,
            Password: password
            // don't need to add confirm password
        };

        // convert to JSON
        const js = JSON.stringify(obj);

        try {
            // call register api
            const response = await fetch('api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: js
            });

            // check response
            const text = await response.text();
            const res = JSON.parse(text);

            // if any error exists, tell user and reject
            if (res.error && res.error.length > 0) {
                setMessage("API Error: " + res.error);
                setIsError(true);
            }
            // otherwise, tell user their account was created and send them to the login page
            else {
                setMessage("Account successfully created!");
                setIsError(false);

                setTimeout(() => {
                    navigate('/');
                }, 1500);     
            }
        } catch (error: any) {
            setMessage("Server error: " + error.toString());
            setIsError(true);
        }
    }

    // Button to return to login page
    function returnToLogin() {
        navigate('/');
    }

    return (
        <div className="fullscreen-background">
            <div className="login-stack">
                <h1 className="fitopia-title">🏋️‍♂️Fitopia🏃‍♂️</h1>
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="neon-login-container">
                        <h2 className="neon-title">Create Account</h2>

                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" />
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" />
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
                        <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="Confirm Password" />

                        <input type="button" className="neon-btn" value="Create an Account" onClick={doRegister} />
                        <input type="button" className="neon-btn secondary" value="Return to Login" onClick={returnToLogin} />

                        {message && (
                            <p className="login-msg" style={{ color: isError ? '#ff6b81' : '#66ffb3' }}>{message}</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Register;
