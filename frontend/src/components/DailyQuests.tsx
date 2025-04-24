
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // to animate pages ooooooo
import Dashboard from '../components/Dashboard';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


type Quest = {
    _id: string;
    Title: string;
    Description: string;
    xp: number;
    requirement: number;
    type: string;
};

function DailyQuests() {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState('');
    const [completed, setCompleted] = useState<string[]>(() => {
        const stored = localStorage.getItem('completedQuests');
        return stored ? JSON.parse(stored) : [];
    });


    const calculateTimeLeft = () => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);

        const diff = midnight.getTime() - now.getTime();

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return `${hours.toString().padStart(2, '0')}h ${minutes
            .toString()
            .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    };

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10); // e.g. '2025-04-23'
        const storedDate = localStorage.getItem('questDate');

        if (storedDate !== today) {
            localStorage.removeItem('completedQuests');
            localStorage.setItem('questDate', today);
            setCompleted([]);
        }
    }, []);


    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(interval);
    }, []);


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

                console.log("Response Status:", response.status);
                const raw = await response.text();
                console.log("🔍 Raw Response:", raw);

                if (!response.ok) {
                    const errRes = JSON.parse(raw);
                    setError(errRes.error || 'Failed to fetch daily quests');
                    setLoading(false);
                    return;
                }

                const data = JSON.parse(raw);
                console.log(" Parsed Daily Quests:", data.dailyQuests);
                setQuests(data.dailyQuests || []);
                setLoading(false);
            } catch (err) {
                console.error(" Fetch error:", err);
                setError('Error fetching quests. Please try again later.');
                setLoading(false);
            }
        };

        fetchQuests();
    }, []);

    const back = () => {
        window.location.href = "/Dashboard";
    };

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="neon-login-container">
                <h1 className="neon-title">Daily Quests</h1>

                <p style={{ marginTop: '10px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                     Time Left: {timeLeft}
                </p>

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="error-msg">{error}</p>
                ) : quests.length > 0 ? (
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>

                    {quests.map((quest) => {
                            const isDone = completed.includes(quest._id);

                            return (
                                <li key={quest._id} style={{ marginBottom: '15px', opacity: isDone ? 0.6 : 1 }}>
                                    <strong style={{ textDecoration: isDone ? 'line-through' : 'none' }}>
                                        {quest.Title || 'Unnamed Quest'}
                                    </strong><br />
                                    {quest.Description && <em>{quest.Description}</em>}<br />
                                    XP: {quest.xp} | Requirement: {quest.requirement}<br />

                                    {!isDone && (
                                        <button
                                            onClick={async () => {
                                                const userData = localStorage.getItem('user_data');
                                                const { _id } = userData ? JSON.parse(userData) : {};

                                                try {
                                                    const res = await fetch('https://merntest.fitgame.space/api/quests/complete', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ userId: _id, xp: quest.xp })
                                                    });

                                                    const data = await res.json();
                                                    if (res.ok) {
                                                        setCompleted((prev) => [...prev, quest._id]);
                                                        if (res.ok) {
                                                            const updated = [...completed, quest._id];
                                                            setCompleted(updated);
                                                            localStorage.setItem('completedQuests', JSON.stringify(updated));
                                                        }

                                                    } else {
                                                        alert(data.error || 'Failed to complete quest.');
                                                    }
                                                } catch (err) {
                                                    console.error("Quest completion failed:", err);
                                                }

                                            }}
                                            className="button"
                                            style={{ marginTop: '6px', fontSize: '0.8rem' }}
                                        >
                                             Complete
                                        </button>
                                    )}
                                </li>
                            );
                        })}
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