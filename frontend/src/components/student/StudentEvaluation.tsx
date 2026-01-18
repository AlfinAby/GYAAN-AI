// Student Evaluation Component - Recording + AI Analysis
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import '../ui/Sidebar.css';
import './StudentEvaluation.css';

// Reading passages for evaluation
const PASSAGES = {
    english: {
        title: "The Little Bird",
        text: "A little bird sat on a tree. It was a sunny day. The bird sang a sweet song. All the animals in the forest listened. The rabbit hopped closer. The squirrel came down from the tree. Everyone was happy to hear the bird sing.",
        instructions: "Read the passage aloud clearly. Take your time."
    },
    hindi: {
        title: "छोटी चिड़िया",
        text: "एक छोटी चिड़िया पेड़ पर बैठी थी। धूप का दिन था। चिड़िया ने मीठा गाना गाया। जंगल के सभी जानवरों ने सुना। खरगोश पास आया। गिलहरी पेड़ से नीचे आई। सब खुश थे।",
        instructions: "पैसेज को स्पष्ट रूप से जोर से पढ़ें।"
    },
    malayalam: {
        title: "കുഞ്ഞുപക്ഷി",
        text: "ഒരു കുഞ്ഞുപക്ഷി മരത്തിൽ ഇരുന്നു. വെയിലുള്ള ദിവസമായിരുന്നു. പക്ഷി മധുരമായ പാട്ട് പാടി. കാട്ടിലെ എല്ലാ മൃഗങ്ങളും കേട്ടു. എല്ലാവരും സന്തോഷിച്ചു.",
        instructions: "ഭാഗം ഉറക്കെ വ്യക്തമായി വായിക്കുക."
    }
};

type Language = 'english' | 'hindi' | 'malayalam';
type EvaluationStep = 'select' | 'ready' | 'recording' | 'analyzing' | 'results';

interface SkillScore {
    skill: string;
    score: number;
    feedback: string;
    icon: string;
}

const StudentEvaluation = () => {
    const [step, setStep] = useState<EvaluationStep>('select');
    const [language, setLanguage] = useState<Language>('english');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [skillScores, setSkillScores] = useState<SkillScore[]>([]);
    const [overallScore, setOverallScore] = useState(0);
    const [weaknesses, setWeaknesses] = useState<string[]>([]);
    const [recommendedTasks, setRecommendedTasks] = useState<string[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    const navigate = useNavigate();
    const user = useAppStore((state) => state.user);

    const passage = PASSAGES[language];

    // Start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setStep('recording');
            setRecordingTime(0);

            // Timer
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Microphone access denied:', err);
            alert('Please allow microphone access to record.');
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    // Analyze with AI agents
    const analyzeRecording = async () => {
        setStep('analyzing');

        // Simulate AI agent analysis (in production, send to backend)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Simulated agent results
        const results: SkillScore[] = [
            { skill: 'Fluency', score: Math.floor(Math.random() * 40) + 50, feedback: 'Good reading pace', icon: '🎯' },
            { skill: 'Pronunciation', score: Math.floor(Math.random() * 40) + 45, feedback: 'Work on word endings', icon: '🗣️' },
            { skill: 'Grammar', score: Math.floor(Math.random() * 40) + 40, feedback: 'Practice verb tenses', icon: '📝' },
            { skill: 'Vocabulary', score: Math.floor(Math.random() * 40) + 55, feedback: 'Good word recognition', icon: '📚' },
            { skill: 'Comprehension', score: Math.floor(Math.random() * 40) + 50, feedback: 'Understands context', icon: '🧠' },
            { skill: 'Speaking Clarity', score: Math.floor(Math.random() * 40) + 45, feedback: 'Speak louder', icon: '🔊' },
        ];

        setSkillScores(results);

        // Calculate overall
        const overall = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
        setOverallScore(overall);

        // Find weaknesses (score < 60)
        const weak = results.filter(r => r.score < 60).map(r => r.skill);
        setWeaknesses(weak);

        // Generate recommended tasks
        const tasks = weak.map(w => {
            switch (w) {
                case 'Fluency': return '📖 Practice Reading: Daily 10-minute reading aloud';
                case 'Pronunciation': return '🗣️ Pronunciation Drill: Word ending exercises';
                case 'Grammar': return '📝 Grammar Basics: Subject-verb agreement';
                case 'Vocabulary': return '📚 New Words: Learn 5 words daily';
                case 'Comprehension': return '🧠 Story Questions: Read and answer';
                case 'Speaking Clarity': return '🔊 Voice Training: Speak clearly exercises';
                default: return `📌 Practice ${w}`;
            }
        });
        setRecommendedTasks(tasks);

        setStep('results');

        // Save evaluation to localStorage
        const userId = user?.id || 'unknown';
        const evaluations = JSON.parse(localStorage.getItem('gyaan_evaluations') || '{}');
        evaluations[userId] = {
            scores: results,
            overall: overall,
            weaknesses: weak,
            tasks: tasks,
            language: language,
            date: new Date().toISOString()
        };
        localStorage.setItem('gyaan_evaluations', JSON.stringify(evaluations));
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#10b981';
        if (score >= 50) return '#f5b041';
        return '#ef4444';
    };

    return (
        <div className="evaluation-page">
            <header className="eval-header">
                <h1>📊 Reading Evaluation</h1>
                <p>Hi {user?.username || 'Student'}! Let's see how well you can read.</p>
            </header>

            <AnimatePresence mode="wait">
                {/* Step 1: Select Language */}
                {step === 'select' && (
                    <motion.div
                        key="select"
                        className="eval-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h2>Choose Language</h2>
                        <p>Select the language you want to read in:</p>

                        <div className="language-options">
                            <button
                                className={`lang-btn ${language === 'english' ? 'active' : ''}`}
                                onClick={() => setLanguage('english')}
                            >
                                🇬🇧 English
                            </button>
                            <button
                                className={`lang-btn ${language === 'hindi' ? 'active' : ''}`}
                                onClick={() => setLanguage('hindi')}
                            >
                                🇮🇳 हिंदी
                            </button>
                            <button
                                className={`lang-btn ${language === 'malayalam' ? 'active' : ''}`}
                                onClick={() => setLanguage('malayalam')}
                            >
                                🌴 മലയാളം
                            </button>
                        </div>

                        <button className="btn-primary" onClick={() => setStep('ready')}>
                            Continue →
                        </button>
                    </motion.div>
                )}

                {/* Step 2: Ready to Record */}
                {step === 'ready' && (
                    <motion.div
                        key="ready"
                        className="eval-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h2>{passage.title}</h2>
                        <p className="instructions">{passage.instructions}</p>

                        <div className="passage-box">
                            <p className="passage-text">{passage.text}</p>
                        </div>

                        <div className="ready-actions">
                            <button className="btn-back" onClick={() => setStep('select')}>
                                ← Change Language
                            </button>
                            <button className="btn-record" onClick={startRecording}>
                                🎤 Start Recording
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Recording */}
                {step === 'recording' && (
                    <motion.div
                        key="recording"
                        className="eval-card recording-active"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="recording-indicator">
                            <span className="rec-dot"></span>
                            <span className="rec-text">Recording...</span>
                            <span className="rec-time">{formatTime(recordingTime)}</span>
                        </div>

                        <h2>{passage.title}</h2>

                        <div className="passage-box highlight">
                            <p className="passage-text">{passage.text}</p>
                        </div>

                        <button className="btn-stop" onClick={stopRecording}>
                            ⏹️ Stop Recording
                        </button>
                    </motion.div>
                )}

                {/* After Recording - Play & Analyze */}
                {step === 'recording' && audioUrl && !isRecording && (
                    <motion.div
                        key="review"
                        className="eval-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2>✅ Recording Complete!</h2>

                        <div className="audio-preview">
                            <audio controls src={audioUrl}></audio>
                        </div>

                        <div className="review-actions">
                            <button className="btn-back" onClick={() => { setStep('ready'); setAudioUrl(null); }}>
                                🔄 Record Again
                            </button>
                            <button className="btn-primary" onClick={analyzeRecording}>
                                🤖 Analyze with AI
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Analyzing */}
                {step === 'analyzing' && (
                    <motion.div
                        key="analyzing"
                        className="eval-card analyzing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="analyzing-spinner">
                            <div className="spinner"></div>
                        </div>
                        <h2>🤖 AI Agents Analyzing...</h2>
                        <div className="agent-list">
                            <div className="agent-item">📖 Reading Agent</div>
                            <div className="agent-item">📝 Grammar Agent</div>
                            <div className="agent-item">🗣️ Pronunciation Agent</div>
                            <div className="agent-item">📚 Vocabulary Agent</div>
                            <div className="agent-item">🧠 Comprehension Agent</div>
                        </div>
                    </motion.div>
                )}

                {/* Step 5: Results */}
                {step === 'results' && (
                    <motion.div
                        key="results"
                        className="eval-card results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="overall-score" style={{ borderColor: getScoreColor(overallScore) }}>
                            <span className="score-value" style={{ color: getScoreColor(overallScore) }}>
                                {overallScore}
                            </span>
                            <span className="score-label">Overall Score</span>
                        </div>

                        <h2>📊 Skill Map</h2>

                        <div className="skill-grid">
                            {skillScores.map((skill, idx) => (
                                <div key={idx} className="skill-card">
                                    <div className="skill-header">
                                        <span className="skill-icon">{skill.icon}</span>
                                        <span className="skill-name">{skill.skill}</span>
                                    </div>
                                    <div className="skill-bar">
                                        <div
                                            className="skill-fill"
                                            style={{
                                                width: `${skill.score}%`,
                                                background: getScoreColor(skill.score)
                                            }}
                                        ></div>
                                    </div>
                                    <div className="skill-score" style={{ color: getScoreColor(skill.score) }}>
                                        {skill.score}%
                                    </div>
                                    <p className="skill-feedback">{skill.feedback}</p>
                                </div>
                            ))}
                        </div>

                        {weaknesses.length > 0 && (
                            <div className="weakness-section">
                                <h3>⚠️ Areas to Improve</h3>
                                <div className="weakness-tags">
                                    {weaknesses.map((w, idx) => (
                                        <span key={idx} className="weakness-tag">{w}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {recommendedTasks.length > 0 && (
                            <div className="tasks-section">
                                <h3>📌 Recommended Tasks</h3>
                                <ul className="task-list">
                                    {recommendedTasks.map((task, idx) => (
                                        <li key={idx} className="task-item">{task}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="result-actions">
                            <button className="btn-back" onClick={() => setStep('select')}>
                                🔄 Take Again
                            </button>
                            <button className="btn-primary" onClick={() => navigate('/student')}>
                                ✅ Go to Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentEvaluation;
