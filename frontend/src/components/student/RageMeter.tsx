// Rage Meter Component
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import './RageMeter.css';

const RageMeter = () => {
    const { studentData, rewardConfig, setRageMode } = useAppStore();

    if (!studentData) return null;

    const progress = (studentData.rageProgress / rewardConfig.rageThreshold) * 100;
    const isFull = progress >= 100;

    const handleClaimReward = () => {
        // Show rage mode overlay then reset
        setRageMode(true);
    };

    return (
        <div className={`rage-meter-container ${isFull ? 'rage-ready' : ''}`}>
            <div className="rage-meter-header">
                <div className="rage-title">
                    <span className="rage-icon">⚔️</span>
                    <span className="rage-text">SPARTAN RAGE</span>
                </div>
                <div className="rage-stats">
                    <span className="rage-current">{studentData.rageProgress}</span>
                    <span className="rage-divider">/</span>
                    <span className="rage-max">{rewardConfig.rageThreshold} XP</span>
                </div>
            </div>

            <div className="rage-bar-container">
                <div className="rage-bar-bg">
                    <motion.div
                        className={`rage-bar-fill ${isFull ? 'rage-full' : ''}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />

                    {/* Glow effect when near full */}
                    {progress > 80 && (
                        <motion.div
                            className="rage-bar-glow"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    )}
                </div>

                {/* Milestone markers */}
                <div className="rage-milestones">
                    <div className="milestone" style={{ left: '25%' }} />
                    <div className="milestone" style={{ left: '50%' }} />
                    <div className="milestone" style={{ left: '75%' }} />
                </div>
            </div>

            <div className="rage-footer">
                <p className="rage-reward-info">
                    <span className="reward-label">Reward:</span>
                    <span className="reward-value">{rewardConfig.rewardDescription}</span>
                </p>

                {isFull && (
                    <motion.button
                        className="rage-claim-button"
                        onClick={handleClaimReward}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="claim-icon">🔥</span>
                        <span>ACTIVATE RAGE</span>
                    </motion.button>
                )}

                {!isFull && (
                    <p className="rage-hint">
                        Complete challenges faster to fill the rage meter!
                    </p>
                )}
            </div>
        </div>
    );
};

export default RageMeter;
