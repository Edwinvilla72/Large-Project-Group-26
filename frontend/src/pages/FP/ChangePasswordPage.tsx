import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // if you're using React Router
import { motion } from 'framer-motion'; // to animate pages ooooooo


const ChangePassword = () => {
    const navigate = useNavigate(); // for redirecting
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    function SecurityQuestions() {
        var obj = { newPassword: newPassword, confirmNewPassword: confirmNewPassword };
        var js = JSON.stringify(obj);
        alert(`if username was found on db, send them to answer their security questions.\nIf not, say no user found`);

        // sends user (if they exist) to answer their security question
        window.location.href = '/';
    }

    // motion.div is for animating the page
    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="neon-login-container">
                <h1 className="neon-title">Great!</h1>
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

                <input
                    type="button"
                    id="FPUserButton"
                    className="neon-btn"
                    value="Reset Password"
                    onClick={SecurityQuestions}
                />
            </div>
        </motion.div>
    );
}
export default ChangePassword;