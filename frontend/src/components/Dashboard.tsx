import React, { useState } from 'react';
import { motion } from 'framer-motion'; // to animate pages ooooooo
import { useNavigate } from 'react-router-dom'; // if you're using React Router



function Dashboard () {






    return (

        <motion.div
            initial = {{y: -100, opacity: 0}}
            animate =  {{y: 0, opacity: 1}}
            exit = {{y: -100, opacity: 0}}
            transition={{duration: 0.4}}
        >

        <h1>Welcome back, test user (hardcoded)</h1>
    




        </motion.div>
    );
}

export default Dashboard;