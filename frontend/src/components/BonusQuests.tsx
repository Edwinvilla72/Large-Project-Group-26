
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // to animate pages ooooooo
import Dashboard from './Dashboard';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


function BonusQuests() {

    const navigate = useNavigate();

     function back() {
        // window reload necessary for the models to load back up as things are rn
        // cannot use navigate 
        window.location.href = "/Dashboard";
        
     }
    

    return (
        <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.4 }}
        >
            
        <div className="neon-login-container">
          <h1 className="neon-title">Bonus Quests</h1>
          <p>This is a test!</p>
        </div>
        <br></br>
        <button className="button" onClick={back}>Back</button>
      </motion.div>
    );
}
export default BonusQuests;