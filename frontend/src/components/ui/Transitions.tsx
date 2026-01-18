// Frost and Fire Transition Components
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import './Transitions.css';

// Frost Transition Wrapper
interface TransitionProps {
    children: ReactNode;
    isVisible?: boolean;
}

export const FrostTransition = ({ children, isVisible = true }: TransitionProps) => {
    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Fire Transition Wrapper
export const FireTransition = ({ children, isVisible = true }: TransitionProps) => {
    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, filter: 'brightness(2)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'brightness(0.5)' }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Frost Particles Background
export const FrostParticles = () => {
    const [particles] = useState(() =>
        Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 4,
            duration: 3 + Math.random() * 2,
            size: 4 + Math.random() * 6
        }))
    );

    return (
        <div className="frost-particles-container">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="frost-particle"
                    style={{
                        left: `${p.left}%`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        width: `${p.size}px`,
                        height: `${p.size}px`
                    }}
                />
            ))}
        </div>
    );
};

// Fire Embers Background
export const FireEmbers = () => {
    const [embers] = useState(() =>
        Array.from({ length: 25 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 3,
            duration: 2 + Math.random() * 2,
            size: 3 + Math.random() * 5
        }))
    );

    return (
        <div className="fire-embers-container">
            {embers.map((e) => (
                <div
                    key={e.id}
                    className="fire-ember"
                    style={{
                        left: `${e.left}%`,
                        animationDelay: `${e.delay}s`,
                        animationDuration: `${e.duration}s`,
                        width: `${e.size}px`,
                        height: `${e.size}px`
                    }}
                />
            ))}
        </div>
    );
};

// Axe Loader
export const AxeLoader = ({ loading }: { loading: boolean }) => {
    if (!loading) return null;

    return (
        <div className="axe-loader-overlay">
            <motion.div
                className="axe-loader-icon"
                animate={{
                    x: ['-100%', '0%', '100%'],
                    rotate: [0, 360, 720],
                    scale: [0.8, 1, 0.8]
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            >
                <svg viewBox="0 0 100 100" width="60" height="60">
                    <defs>
                        <linearGradient id="frostGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4fc3f7" />
                            <stop offset="100%" stopColor="#81d4fa" />
                        </linearGradient>
                    </defs>
                    {/* Axe blade */}
                    <path
                        d="M20 50 L50 20 L80 50 L50 55 Z"
                        fill="url(#frostGradient)"
                        stroke="#fff"
                        strokeWidth="2"
                    />
                    {/* Axe handle */}
                    <rect x="45" y="50" width="10" height="40" fill="#8B4513" rx="2" />
                </svg>
            </motion.div>
            <motion.p
                className="loader-text"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                Loading...
            </motion.p>
        </div>
    );
};

// Rage Mode Overlay
interface RageOverlayProps {
    active: boolean;
    onClaim?: () => void;
}

export const RageModeOverlay = ({ active, onClaim }: RageOverlayProps) => {
    const [showClaim, setShowClaim] = useState(false);

    useEffect(() => {
        if (active) {
            const timer = setTimeout(() => setShowClaim(true), 1500);
            return () => clearTimeout(timer);
        }
        setShowClaim(false);
    }, [active]);

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    className="rage-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="rage-border-effect" />

                    <motion.div
                        className="rage-content"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    >
                        <motion.h1
                            className="rage-title"
                            animate={{
                                textShadow: [
                                    '0 0 20px #ff0000',
                                    '0 0 40px #ff0000',
                                    '0 0 20px #ff0000'
                                ]
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            ⚔️ SPARTAN RAGE ACTIVATED ⚔️
                        </motion.h1>

                        <p className="rage-subtitle">You have earned your reward!</p>

                        {showClaim && (
                            <motion.button
                                className="btn btn-gold rage-claim-btn"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClaim}
                            >
                                CLAIM REWARD
                            </motion.button>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
