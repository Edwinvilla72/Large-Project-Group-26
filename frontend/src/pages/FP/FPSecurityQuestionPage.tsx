import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // if you're using React Router
import { motion } from 'framer-motion'; // to animate pages ooooooo


const FPSecurityQuestion = () => {
const navigate = useNavigate(); // for redirecting
    let _ud: any = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);

    const [answer, setAnswer] = useState('');


    function SecurityQuestions() {
        var obj = { answer: answer};
        var js = JSON.stringify(obj);
        alert(``);

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
            <div className="neon-login-container">
                <h1 className="neon-title">Hi, User!</h1>
                
                <p className="neon-subtext">Answer your security question:</p>
                <p className="neon-subtext">[Insert question here]</p><br />

                <input
                    type="text"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
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
        </motion.div>
    );
}
export default FPSecurityQuestion;