// Reading Challenge Component
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { api } from '../../services/api';
import { FrostParticles } from '../ui/Transitions';
import './ReadingChallenge.css';

const SAMPLE_PASSAGES = [
    {
        id: 1,
        title: 'The Quick Fox',
        text: 'The quick brown fox jumps over the lazy dog. The dog was sleeping under a big tree. The fox was happy and ran into the forest.',
        difficulty: 1,
        xpReward: 50
    },
    {
        id: 2,
        title: 'The Kind Farmer',
        text: 'Once there was a kind farmer who lived near a river. Every morning he would water his plants and feed his animals. The animals loved him very much.',
        difficulty: 2,
        xpReward: 75
    },
    {
        id: 3,
        title: 'The Adventure',
        text: 'Ravi and his sister went on an adventure to the mountains. They saw beautiful birds and colorful flowers. At the top, they could see their village far below.',
        difficulty: 3,
        xpReward: 100
    }
];

const ReadingChallenge = () => {
    const navigate = useNavigate();
    const { addXP, setLoading } = useAppStore();
    const { duration, startRecording, stopRecording, resetRecording } = useAudioRecorder();

    const [currentPassage, setCurrentPassage] = useState(SAMPLE_PASSAGES[0]);
    const [stage, setStage] = useState<'select' | 'read' | 'recording' | 'analyzing' | 'result'>('select');
    const [diagnosis, setDiagnosis] = useState<any>(null);
    const [startTime, setStartTime] = useState<number>(0);

    const handleSelectPassage = (passage: typeof SAMPLE_PASSAGES[0]) => {
        setCurrentPassage(passage);
        setStage('read');
        resetRecording();
        setDiagnosis(null);
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
            const result = await api.diagnoseReading(transcription.text, currentPassage.text);

            // Calculate time bonus
            const timeTaken = (Date.now() - startTime) / 1000;
            const expectedTime = currentPassage.text.split(' ').length * 0.5; // 0.5 seconds per word
            const timeBonus = timeTaken < expectedTime ? Math.floor((expectedTime - timeTaken) * 2) : 0;

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
        <div className="reading-challenge">
            <FrostParticles />

            {/* Header */}
            <header className="challenge-header">
                <button className="back-btn" onClick={() => navigate('/student')}>
                    ← Back
                </button>
                <h1 className="challenge-title">
                    <span className="icon">📖</span>
                    Reading Challenge
                </h1>
                <div className="header-spacer" />
            </header>

            <main className="challenge-main">
                <AnimatePresence mode="wait">
                    {/* Stage: Select Passage */}
                    {stage === 'select' && (
                        <motion.div
                            key="select"
                            className="stage-container"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="stage-title">Choose a Passage</h2>
                            <div className="passages-grid">
                                {SAMPLE_PASSAGES.map((passage) => (
                                    <motion.button
                                        key={passage.id}
                                        className="passage-card"
                                        onClick={() => handleSelectPassage(passage)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="passage-difficulty">
                                            {'⭐'.repeat(passage.difficulty)}
                                        </span>
                                        <h3 className="passage-title">{passage.title}</h3>
                                        <p className="passage-preview">
                                            {passage.text.substring(0, 60)}...
                                        </p>
                                        <span className="passage-reward">+{passage.xpReward} XP</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Stage: Read Passage */}
                    {stage === 'read' && (
                        <motion.div
                            key="read"
                            className="stage-container"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="stage-title">Read This Passage Aloud</h2>
                            <div className="passage-display">
                                <h3>{currentPassage.title}</h3>
                                <p className="passage-text">{currentPassage.text}</p>
                            </div>
                            <motion.button
                                className="btn btn-frost record-btn"
                                onClick={handleStartRecording}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="mic-icon">🎤</span>
                                Start Recording
                            </motion.button>
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
                            <h2 className="stage-title">Recording...</h2>
                            <div className="passage-display recording-active-display">
                                <h3>{currentPassage.title}</h3>
                                <p className="passage-text">{currentPassage.text}</p>
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
                                className="btn btn-fire stop-btn"
                                onClick={handleStopRecording}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                ⏹ Stop Recording
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
                                    ❄️
                                </motion.div>
                                <h2>Analyzing Your Reading...</h2>
                                <p>Our AI agents are evaluating your fluency and comprehension</p>
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
                                <div className="xp-earned">
                                    <span className="xp-icon">⚡</span>
                                    <span className="xp-amount">+{diagnosis.totalXP} XP</span>
                                </div>
                            </div>

                            <div className="result-breakdown">
                                <div className="result-stat">
                                    <span className="stat-label">Accuracy</span>
                                    <span className="stat-value">{diagnosis.accuracy}%</span>
                                </div>
                                <div className="result-stat">
                                    <span className="stat-label">Time</span>
                                    <span className="stat-value">{diagnosis.timeTaken}s</span>
                                </div>
                                <div className="result-stat">
                                    <span className="stat-label">Time Bonus</span>
                                    <span className="stat-value">+{diagnosis.timeBonus}</span>
                                </div>
                            </div>

                            <div className="diagnosis-card">
                                <h3>AI Analysis</h3>
                                <p>{diagnosis.analysis}</p>

                                {diagnosis.gapsFound.length > 0 && (
                                    <div className="gaps-section">
                                        <h4>Areas to Improve</h4>
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
                                    className="btn btn-frost"
                                    onClick={handleTryAnother}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Try Another Passage
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

export default ReadingChallenge;
