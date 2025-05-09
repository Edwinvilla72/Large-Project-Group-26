import React, { useState } from 'react';
import { motion } from 'framer-motion'; // to animate pages ooooooo

function PageTitle() {

    return (
        <motion.div initial={{ y: -100, opacity: 0 }} animate={{y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} transition={{ duration: 0.4 }} >

        <h1 id="title">🏋️Fitopia🏃</h1>

        </motion.div>

    );
};

export default PageTitle;