import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // if you're using React Router
import { motion } from 'framer-motion'; // to animate pages ooooooo

const ChangePassword = () => {
    const navigate = useNavigate(); // for redirecting
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // called when the user clicks to reset their password
    async function SecurityQuestions() {
        // check for empty fields and mismatched passwords
        if (!newPassword || !confirmNewPassword) {
            alert('Please fill in both fields.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            alert('Passwords do not match.');
            return;
        }

        // extract required info from localStorage
        const userId = ud?.userId;
        const oldPass = ud?.oldPass;

        if (!userId || !oldPass) {
            alert('Session expired or missing data. Please restart the reset process.');
            navigate('/ForgotPass');
            return;
        }

        const obj = {
            oldPass,
            newPass: newPassword,
            userId
        };

        const js = JSON.stringify(obj);

        try {
            const response = await fetch('/api/password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: js
            });

            const text = await response.text();

            if (!response.ok) {
                alert('Password reset failed: ' + text);
                return;
            }

            alert('Password successfully reset!');
            navigate('/');
        } catch (err) {
            console.error("Error during password reset:", err);
            alert("Server error. Please try again later.");
        }
    }

    // motion.div is for animating the page
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
                        <h2 className="neon-title">Great!</h2>
                        <p className="neon-subtext">Now enter your new password!</p>

                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="New Password"
                        /><br />

                        <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={e => setConfirmNewPassword(e.target.value)}
                            placeholder="Confirm New Password"
                        /><br />

                        {/* Reset button that calls backend to finalize password change */}
                        <input
                            type="button"
                            id="FPUserButton"
                            className="neon-btn"
                            value="Reset Password"
                            onClick={SecurityQuestions}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
export default ChangePassword;
