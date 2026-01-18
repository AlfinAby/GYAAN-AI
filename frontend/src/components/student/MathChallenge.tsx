// Math Challenge Component
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { api } from '../../services/api';
import { FireEmbers } from '../ui/Transitions';
import './MathChallenge.css';

const MATH_PROBLEMS = [
    {
        id: 1,
        problem: '23 + 45 = ?',
        answer: '68',
        hint: 'Add the ones place first, then the tens place',
        difficulty: 1,
        xpReward: 50
    },
    {
        id: 2,
        problem: '56 + 27 = ?',
        answer: '83',
        hint: 'Remember to carry when the ones add up to more than 9',
        difficulty: 2,
        xpReward: 75
    },
    {
        id: 3,
        problem: '84 - 37 = ?',
        answer: '47',
        hint: 'You might need to borrow from the tens place',
        difficulty: 3,
        xpReward: 100
    }
];

const MathChallenge = () => {
    const navigate = useNavigate();
    const { addXP, setLoading } = useAppStore();
    const { duration, startRecording, stopRecording, resetRecording } = useAudioRecorder();

    const [currentProblem, setCurrentProblem] = useState(MATH_PROBLEMS[0]);
    const [stage, setStage] = useState<'select' | 'solve' | 'recording' | 'analyzing' | 'result'>('select');
    const [diagnosis, setDiagnosis] = useState<any>(null);
    const [showHint, setShowHint] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);

    const handleSelectProblem = (problem: typeof MATH_PROBLEMS[0]) => {
        setCurrentProblem(problem);
        setStage('solve');
        resetRecording();
        setDiagnosis(null);
        setShowHint(false);
    };

    const handleStartRecording = async () => {
        try {
            await startRecording();
            setStage('recording');
            setStartTime(Date.now());
        } catch (error) {
            alert('Please allow microphone access to continue.');
        }
    };

    const handleStopRecording = async () => {
        const blob = await stopRecording();
        if (blob) {
            setStage('analyzing');
            await analyzeRecording(blob);
        }
    };

    const analyzeRecording = async (blob: Blob) => {
        setLoading(true);
        try {
            // Get transcription
            const transcription = await api.transcribeAudio(blob);

            // Get diagnosis
            const result = await api.diagnoseMath(
                transcription.text,
                currentProblem.problem,
                currentProblem.answer
            );

            // Calculate time bonus
            const timeTaken = (Date.now() - startTime) / 1000;
            const timeBonus = timeTaken < 30 ? Math.floor((30 - timeTaken) * 2) : 0;

            const totalXP = result.xpEarned + timeBonus;

            setDiagnosis({
                ...result,
                timeBonus,
                totalXP,
                timeTaken: Math.floor(timeTaken)
            });

            // Add XP
            addXP(totalXP);

            setStage('result');
        } catch (error) {
            console.error('Analysis error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTryAnother = () => {
        setStage('select');
        resetRecording();
        setDiagnosis(null);
    };

    return (
        <div className="math-challenge">
            <FireEmbers />

            {/* Header */}
            <header className="challenge-header fire-header">
                <button className="back-btn fire-btn" onClick={() => navigate('/student')}>
                    ← Back
                </button>
                <h1 className="challenge-title fire-title">
                    <span className="icon">🔢</span>
                    Math Challenge
                </h1>
                <div className="header-spacer" />
            </header>

            <main className="challenge-main">
                <AnimatePresence mode="wait">
                    {/* Stage: Select Problem */}
                    {stage === 'select' && (
                        <motion.div
                            key="select"
                            className="stage-container"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="stage-title">Choose a Problem</h2>
                            <div className="problems-grid">
                                {MATH_PROBLEMS.map((problem) => (
                                    <motion.button
                                        key={problem.id}
                                        className="problem-card"
                                        onClick={() => handleSelectProblem(problem)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="problem-difficulty">
                                            {'🔥'.repeat(problem.difficulty)}
                                        </span>
                                        <h3 className="problem-equation">{problem.problem}</h3>
                                        <span className="problem-reward">+{problem.xpReward} XP</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Stage: Solve Problem */}
                    {stage === 'solve' && (
                        <motion.div
                            key="solve"
                            className="stage-container"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="stage-title">Explain Your Solution</h2>
                            <p className="stage-instructions">
                                Speak aloud as you solve this problem step by step
                            </p>

                            <div className="problem-display">
                                <span className="problem-equation-large">{currentProblem.problem}</span>
                            </div>

                            {showHint && (
                                <motion.div
                                    className="hint-box"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    💡 <strong>Hint:</strong> {currentProblem.hint}
                                </motion.div>
                            )}

                            <div className="problem-actions">
                                <button
                                    className="hint-btn"
                                    onClick={() => setShowHint(true)}
                                    disabled={showHint}
                                >
                                    {showHint ? 'Hint Shown' : 'Show Hint'}
                                </button>

                                <motion.button
                                    className="btn btn-fire record-btn"
                                    onClick={handleStartRecording}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="mic-icon">🎤</span>
                                    Start Explaining
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Stage: Recording */}
                    {stage === 'recording' && (
                        <motion.div
                            key="recording"
                            className="stage-container"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="stage-title">Explain Step by Step...</h2>

                            <div className="problem-display recording-active">
                                <span className="problem-equation-large">{currentProblem.problem}</span>
                            </div>

                            <div className="steps-guide">
                                <p>Example: "First, I add 3 and 5 in the ones place..."</p>
                            </div>

                            <div className="recording-indicator">
                                <motion.div
                                    className="recording-dot"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                                <span className="recording-time">{duration}s</span>
                            </div>

                            <motion.button
                                className="btn btn-gold stop-btn"
                                onClick={handleStopRecording}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                ⏹ Done Explaining
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Stage: Analyzing */}
                    {stage === 'analyzing' && (
                        <motion.div
                            key="analyzing"
                            className="stage-container analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="analyzing-content">
                                <motion.div
                                    className="analyzing-icon"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                >
                                    🔥
                                </motion.div>
                                <h2>Analyzing Your Solution...</h2>
                                <p>Our Math Agent is checking each step of your reasoning</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Stage: Result */}
                    {stage === 'result' && diagnosis && (
                        <motion.div
                            key="result"
                            className="stage-container"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="result-header">
                                <h2 className="result-title">Challenge Complete!</h2>
                                <div className="xp-earned fire-xp">
                                    <span className="xp-icon">⚡</span>
                                    <span className="xp-amount">+{diagnosis.totalXP} XP</span>
                                </div>
                            </div>

                            <div className="result-breakdown">
                                <div className="result-stat">
                                    <span className="stat-label">Accuracy</span>
                                    <span className="stat-value fire-value">{diagnosis.accuracy}%</span>
                                </div>
                                <div className="result-stat">
                                    <span className="stat-label">Time</span>
                                    <span className="stat-value fire-value">{diagnosis.timeTaken}s</span>
                                </div>
                                <div className="result-stat">
                                    <span className="stat-label">Speed Bonus</span>
                                    <span className="stat-value fire-value">+{diagnosis.timeBonus}</span>
                                </div>
                            </div>

                            <div className="diagnosis-card fire-card">
                                <h3>Math Agent Analysis</h3>
                                <p>{diagnosis.analysis}</p>

                                <div className="correct-answer">
                                    <span className="answer-label">Correct Answer:</span>
                                    <span className="answer-value">{currentProblem.answer}</span>
                                </div>

                                {diagnosis.gapsFound.length > 0 && (
                                    <div className="gaps-section">
                                        <h4>Concepts to Practice</h4>
                                        <ul>
                                            {diagnosis.gapsFound.map((gap: string, i: number) => (
                                                <li key={i}>{gap}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="recommendations-section">
                                    <h4>Recommendations</h4>
                                    <ul>
                                        {diagnosis.recommendations.map((rec: string, i: number) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="result-actions">
                                <motion.button
                                    className="btn btn-fire"
                                    onClick={handleTryAnother}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Try Another Problem
                                </motion.button>
                                <motion.button
                                    className="btn btn-outline"
                                    onClick={() => navigate('/student')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Back to Home
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default MathChallenge;
