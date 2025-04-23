
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // to animate pages ooooooo
import Dashboard from '../components/Dashboard';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


type Quest = {
    _id: string;
    Title: string;
    description: string;
    xp: number;
    requirement: number;
    type: string;
};

function DailyQuests() {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuests = async () => {
            const userData = localStorage.getItem('user_data');
            if (!userData) {
                setError('No user data found. Please log in.');
                setLoading(false);
                return;
            }

            const { _id } = JSON.parse(userData);

            try {
                const response = await fetch('/api/getDailyQuests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId: _id })
                });

                console.log("🚀 Response Status:", response.status);
                const raw = await response.text();
                console.log("🔍 Raw Response:", raw);

                if (!response.ok) {
                    const errRes = JSON.parse(raw);
                    setError(errRes.error || 'Failed to fetch daily quests');
                    setLoading(false);
                    return;
                }

                const data = JSON.parse(raw);
                console.log("✅ Parsed Daily Quests:", data.dailyQuests);
                setQuests(data.dailyQuests || []);
                setLoading(false);
            } catch (err) {
                console.error("❌ Fetch error:", err);
                setError('Error fetching quests. Please try again later.');
                setLoading(false);
            }
        };

        fetchQuests();
    }, []);

    const back = () => navigate('/Dashboard');

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="neon-login-container">
                <h1 className="neon-title">Daily Quests</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="error-msg">{error}</p>
                ) : quests.length > 0 ? (
                    <ul>
                        {quests.map((quest) => (
                            <li key={quest._id}>
                                <strong>{quest.Title || 'Unnamed Quest'}</strong><br />
                                XP: {quest.xp} | Requirement: {quest.requirement}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No daily quests assigned.</p>
                )}

                <br />
                <button className="button" onClick={back}>Back</button>
            </div>
        </motion.div>
    );
}

export default DailyQuests;