import { motion } from 'framer-motion';

interface XPBarProps {
  xp: number;
  xpToLevel: number;
}

const XPBar = ({ xp, xpToLevel }: XPBarProps) => {
  const progress = Math.min((xp / xpToLevel) * 100, 100); // capped at 100%

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 9999, //above everything else on screen
        height: '25px',
        backgroundColor: '#222',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '1rem',
        border: '2px solid #4caf50',
      }}
    >


      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6 }}
        style={{
          height: '100%',
          backgroundColor: '#4caf50',
          borderRadius: '12px',
        }}
      />
    </div>
  );
};

export default XPBar;
