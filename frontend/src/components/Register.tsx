import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import '../styles/theme.css';
import securityQuestions from '../data/securityQuestions'; // security questions array

function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [Login, setLogin] = useState('');
    const [Password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [SecQNum, setSecQNum] = useState(0);
    const [SecQAns, setSecQAns] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const navigate = useNavigate(); // for redirecting

    async function doRegister(event: any): Promise<void> {
        event.preventDefault();

        // basic form checks (now includes form validation for security answer)
        if (!firstName || !lastName || !Login || !Password || !passwordConfirm || SecQAns.trim() === '') {
            setMessage("Please fill in all fields.");
            setIsError(true);
            return;
        }

        if (Password !== passwordConfirm) {
            setMessage("Passwords do not match.");
            setIsError(true);
            return;
        }

        //  registration payload so it can be sent to backend
        const obj = {
            FirstName: firstName,
            LastName: lastName,
            Login,
            Password,
            SecQNum,
            SecQAns // plain text b/c backend will hash
        };

        const js = JSON.stringify(obj);

        try {
            const response = await fetch('api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: js
            });

            const text = await response.text();
            const res = JSON.parse(text);

            if (res.error && res.error.length > 0) {
                setMessage("API Error: " + res.error);
                setIsError(true);
            } else {
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
                        <input type="text" value={Login} onChange={e => setLogin(e.target.value)} placeholder="Username" />
                        <input type="password" value={Password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
                        <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="Confirm Password" />

                        {/* Security Question Dropdown */}
                        <select value={SecQNum} onChange={e => setSecQNum(Number(e.target.value))}>
                            {securityQuestions.map((question, index) => (
                                <option key={index} value={index}>{question}</option>
                            ))}
                        </select>

                        {/* Answer Input */}
                        <input type="text" value={SecQAns} onChange={e => setSecQAns(e.target.value)} placeholder="Your Answer" />

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
