// Student Home - Premium Professional Dashboard
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import Sidebar from '../ui/Sidebar';
import './StudentHome.css';

interface EvaluationData {
    scores: Array<{ skill: string; score: number; feedback: string; icon: string }>;
    overall: number;
    weaknesses: string[];
    tasks: string[];
    language: string;
    date: string;
}

interface UserData {
    isApproved: boolean;
    hasClass: boolean;
    testAssigned: 'english' | 'hindi' | 'malayalam' | 'math' | null;
    className?: string;
}

const StudentHome = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAppStore();
    const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        loadUserData();
    }, [isAuthenticated, navigate, user?.id]);

    const loadUserData = () => {
        setLoading(true);
        const rawUsers = localStorage.getItem('gyaan_users');
        const users = rawUsers ? JSON.parse(rawUsers) : {};
        const currentUser = users[user?.id || ''];

        if (currentUser) {
            setUserData({
                isApproved: currentUser.isApproved || false,
                hasClass: currentUser.hasClass || false,
                testAssigned: currentUser.testAssigned || null,
                className: currentUser.className || ''
            });
        } else {
            setUserData({ isApproved: false, hasClass: false, testAssigned: null, className: '' });
        }

        const evaluations = JSON.parse(localStorage.getItem('gyaan_evaluations') || '{}');
        const userEval = evaluations[user?.id || ''];
        if (userEval) setEvaluation(userEval);

        setTimeout(() => setLoading(false), 300);
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#22c55e';
        if (score >= 50) return '#eab308';
        return '#ef4444';
    };

    const getTestLabel = (test: string) => {
        const labels: Record<string, string> = {
            'english': '🇬🇧 English Reading',
            'hindi': '🇮🇳 Hindi (हिंदी)',
            'malayalam': '🌴 Malayalam (മലയാളം)',
            'math': '🔢 Mathematics'
        };
        return labels[test] || test;
    };

    // Loading state
    if (loading) {
        return (
            <div className="premium-dashboard">
                <Sidebar role="student" />
                <main className="premium-main">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your learning journey...</p>
                    </div>
                </main>
            </div>
        );
    }

    // Onboarding states with enhanced UI
    if (!userData?.isApproved || !userData?.hasClass || !userData?.testAssigned) {
        const currentStep = !userData?.isApproved ? 1 : !userData?.hasClass ? 2 : 3;

        return (
            <div className="premium-dashboard">
                <Sidebar role="student" />
                <main className="premium-main onboarding-main">
                    {/* Welcome Banner */}
                    <motion.div
                        className="welcome-hero"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="hero-content">
                            <h1>Welcome to <span className="brand-gradient">GYAAN-AI</span> 👋</h1>
                            <p>Your personalized AI-powered learning journey begins here</p>
                        </div>
                        <div className="hero-badge">
                            <span className="level">Level 1</span>
                            <span className="xp">0 XP</span>
                        </div>
                    </motion.div>

                    {/* Journey Progress */}
                    <motion.div
                        className="journey-tracker"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2>🗺️ Your Learning Journey</h2>
                        <div className="journey-steps">
                            <div className={`journey-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                                <div className="step-icon">
                                    {currentStep > 1 ? '✅' : '1️⃣'}
                                </div>
                                <span className="step-label">Account Created</span>
                                <div className="step-line"></div>
                            </div>
                            <div className={`journey-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                                <div className="step-icon">
                                    {currentStep > 2 ? '✅' : '2️⃣'}
                                </div>
                                <span className="step-label">Join Class</span>
                                <div className="step-line"></div>
                            </div>
                            <div className={`journey-step ${currentStep >= 3 ? 'active' : ''}`}>
                                <div className="step-icon">3️⃣</div>
                                <span className="step-label">Take Evaluation</span>
                                <div className="step-line"></div>
                            </div>
                            <div className="journey-step">
                                <div className="step-icon">🎯</div>
                                <span className="step-label">Start Learning</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="onboarding-grid">
                        {/* Current Status Card */}
                        <motion.div
                            className="status-card-large"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="status-header">
                                <div className="status-icon-large">
                                    {currentStep === 1 ? '⏳' : currentStep === 2 ? '📚' : '📝'}
                                </div>
                                <div>
                                    <h3>
                                        {currentStep === 1 ? 'Awaiting Approval' :
                                            currentStep === 2 ? 'Ready for Class!' :
                                                'Evaluation Pending'}
                                    </h3>
                                    <p>
                                        {currentStep === 1 ? 'Your teacher will approve your account soon' :
                                            currentStep === 2 ? 'Your teacher is assigning you to a class' :
                                                'Take your initial assessment to get started'}
                                    </p>
                                </div>
                            </div>

                            <div className="status-details">
                                <div className="detail-row">
                                    <span className="detail-label">Student ID</span>
                                    <span className="detail-value code">{user?.id}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Account Status</span>
                                    <span className={`detail-value badge ${userData?.isApproved ? 'success' : 'pending'}`}>
                                        {userData?.isApproved ? '✅ Approved' : '⏳ Pending'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Class</span>
                                    <span className={`detail-value ${userData?.hasClass ? '' : 'muted'}`}>
                                        {userData?.className || 'Awaiting assignment'}
                                    </span>
                                </div>
                                {userData?.testAssigned && (
                                    <div className="detail-row">
                                        <span className="detail-label">Assigned Test</span>
                                        <span className="detail-value">{getTestLabel(userData.testAssigned)}</span>
                                    </div>
                                )}
                            </div>

                            <button className="btn-check-status" onClick={loadUserData}>
                                <span className="btn-icon">🔄</span>
                                Check Status
                            </button>
                        </motion.div>

                        {/* Quick Info Cards */}
                        <div className="info-cards-stack">
                            <motion.div
                                className="info-card-mini"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="mini-icon purple">🎓</div>
                                <div className="mini-content">
                                    <span className="mini-label">Learning Style</span>
                                    <span className="mini-value">AI Personalized</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="info-card-mini"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="mini-icon blue">🤖</div>
                                <div className="mini-content">
                                    <span className="mini-label">AI Agents</span>
                                    <span className="mini-value">5 Active</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="info-card-mini"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="mini-icon green">📊</div>
                                <div className="mini-content">
                                    <span className="mini-label">Skill Tracking</span>
                                    <span className="mini-value">Real-time</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="info-card-mini"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="mini-icon orange">🏆</div>
                                <div className="mini-content">
                                    <span className="mini-label">Achievements</span>
                                    <span className="mini-value">Unlock Soon</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Features Preview */}
                    <motion.div
                        className="features-preview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <h3>🚀 What Awaits You</h3>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">📖</div>
                                <h4>Reading Analysis</h4>
                                <p>AI evaluates your reading fluency and comprehension</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🧮</div>
                                <h4>Math Practice</h4>
                                <p>Personalized problems based on your skill level</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">📈</div>
                                <h4>Progress Map</h4>
                                <p>Visual tracking of all your learning milestones</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">🎯</div>
                                <h4>Smart Tasks</h4>
                                <p>AI-generated exercises tailored just for you</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Test Ready CTA */}
                    {userData?.testAssigned && (
                        <motion.div
                            className="test-ready-banner"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="banner-content">
                                <span className="banner-badge">🎉 Ready!</span>
                                <h2>Your Evaluation Test is Ready!</h2>
                                <p>Take the {getTestLabel(userData.testAssigned)} assessment to unlock your personalized learning path</p>
                            </div>
                            <button
                                className="btn-start-test"
                                onClick={() => navigate('/student/evaluate')}
                            >
                                Start Assessment →
                            </button>
                        </motion.div>
                    )}
                </main>
            </div>
        );
    }

    // Full Dashboard (after evaluation)
    return (
        <div className="premium-dashboard">
            <Sidebar role="student" />
            <main className="premium-main">
                {/* Welcome Header */}
                <motion.div
                    className="dashboard-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-left">
                        <h1>Welcome back, <span className="name-gradient">{user?.username || 'Student'}</span>! 👋</h1>
                        <p>Continue your personalized learning journey</p>
                    </div>
                    <div className="header-stats">
                        <div className="header-stat">
                            <span className="stat-value">{evaluation?.overall || 0}%</span>
                            <span className="stat-label">Overall Score</span>
                        </div>
                        <div className="header-stat">
                            <span className="stat-value">Level {Math.floor((evaluation?.overall || 0) / 20) + 1}</span>
                            <span className="stat-label">Current Level</span>
                        </div>
                    </div>
                </motion.div>

                {evaluation ? (
                    <div className="dashboard-content">
                        {/* Overall Score Card */}
                        <motion.div
                            className="score-overview-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="score-circle" style={{ borderColor: getScoreColor(evaluation.overall) }}>
                                <span className="score-value" style={{ color: getScoreColor(evaluation.overall) }}>
                                    {evaluation.overall}%
                                </span>
                                <span className="score-label">Overall</span>
                            </div>
                            <div className="score-details">
                                <h3>Your Performance Summary</h3>
                                <p>{evaluation.language} Evaluation completed</p>
                                <div className="skill-mini-bars">
                                    {evaluation.scores.slice(0, 3).map((skill, idx) => (
                                        <div key={idx} className="mini-bar-row">
                                            <span>{skill.icon} {skill.skill}</span>
                                            <div className="mini-bar">
                                                <div
                                                    className="mini-fill"
                                                    style={{ width: `${skill.score}%`, background: getScoreColor(skill.score) }}
                                                ></div>
                                            </div>
                                            <span style={{ color: getScoreColor(skill.score) }}>{skill.score}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Skills Grid */}
                        <motion.div
                            className="skills-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2>📊 Your Skills</h2>
                            <div className="skills-grid">
                                {evaluation.scores.map((skill, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="skill-card"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + idx * 0.1 }}
                                    >
                                        <div className="skill-header">
                                            <span className="skill-icon">{skill.icon}</span>
                                            <span className="skill-name">{skill.skill}</span>
                                        </div>
                                        <div className="skill-score" style={{ color: getScoreColor(skill.score) }}>
                                            {skill.score}%
                                        </div>
                                        <div className="skill-bar-container">
                                            <motion.div
                                                className="skill-bar-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skill.score}%` }}
                                                transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                                                style={{ background: getScoreColor(skill.score) }}
                                            ></motion.div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Tasks Section */}
                        <motion.div
                            className="tasks-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2>📝 Your Learning Tasks</h2>
                            <div className="tasks-list">
                                {evaluation.tasks.map((task, idx) => (
                                    <div key={idx} className="task-item">
                                        <div className="task-checkbox"></div>
                                        <span className="task-text">{task}</span>
                                        <span className="task-xp">+{(idx + 1) * 10} XP</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            className="quick-actions-grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <button className="action-card" onClick={() => navigate('/student/evaluate')}>
                                <span className="action-icon">📝</span>
                                <span className="action-label">Retake Evaluation</span>
                            </button>
                            <button className="action-card" onClick={() => navigate('/student/reading')}>
                                <span className="action-icon">📖</span>
                                <span className="action-label">Practice Reading</span>
                            </button>
                            <button className="action-card" onClick={() => navigate('/student/math')}>
                                <span className="action-icon">🧮</span>
                                <span className="action-label">Practice Math</span>
                            </button>
                            <button className="action-card" onClick={() => navigate('/student/learn')}>
                                <span className="action-icon">🎓</span>
                                <span className="action-label">Learn New Topics</span>
                            </button>
                        </motion.div>
                    </div>
                ) : (
                    <motion.div
                        className="test-ready-banner fullpage"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="banner-content">
                            <span className="banner-badge">🎉 Ready to Start!</span>
                            <h2>Take Your First Evaluation</h2>
                            <p>Complete your assessment to unlock personalized learning</p>
                        </div>
                        <button
                            className="btn-start-test"
                            onClick={() => navigate('/student/evaluate')}
                        >
                            Start Evaluation →
                        </button>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default StudentHome;
