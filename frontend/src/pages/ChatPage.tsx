import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // to animate pages ooooooo
import Chat from '../components/Chat';

function ChatPage() {
    
    return (
        <div>
            <Chat />
            
        </div>
    );
}
export default ChatPage;