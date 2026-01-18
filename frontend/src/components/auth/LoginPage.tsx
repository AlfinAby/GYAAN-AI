// Login Page - Auto-detect role from ID prefix (PRC=Student, PCE=Teacher)
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import './LoginPage.css';

const LoginPage = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const login = useAppStore((state) => state.login);

    // Auto-detect role from ID prefix
    const getDetectedRole = (id: string): 'student' | 'teacher' | null => {
        const prefix = id.toUpperCase().substring(0, 3);
        if (prefix === 'PRC') return 'student';
        if (prefix === 'PCE') return 'teacher';
        return null;
    };

    const detectedRole = getDetectedRole(userId);

    const handleLogin = async () => {
        if (!userId.trim()) {
            setError('Please enter your ID');
            return;
        }

        if (!detectedRole) {
            setError('ID must start with PRC (student) or PCE (teacher)');
            return;
        }

        if (!password.trim()) {
            setError('Please enter your password');
            return;
        }

        setIsLoading(true);
        setError('');

        await new Promise((resolve) => setTimeout(resolve, 800));

        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        const user = users[userId.toUpperCase()];

        if (user) {
            if (user.password !== password) {
                setError('Incorrect password');
                setIsLoading(false);
                return;
            }

            login(user.name, user.role, userId.toUpperCase());

            if (user.role === 'student') {
                navigate('/student');
            } else {
                navigate('/teacher');
            }
        } else {
            setError('Account not found. Please sign up first.');
            setIsLoading(false);
        }

        setIsLoading(false);
    };

    return (
        <div className="auth-page">
            {/* Header */}
            <header className="auth-header">
                <div className="brand">
                    <span className="brand-icon">📚</span>
                    <div className="brand-text">
                        <h1>GYAAN-AI</h1>
                        <span className="tagline">Real-time Learning Diagnosis</span>
                    </div>
                </div>
            </header>

            {/* Login Card */}
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h2 className="card-title">Welcome Back</h2>
                <p className="card-subtitle">Sign in to continue learning</p>

                {/* Form */}
                <div className="auth-form">
                    <div className="form-group">
                        <label>Your ID</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                name="username"
                                autoComplete="username"
                                placeholder="PRC23CA001 or PCE23CA001"
                                value={userId}
                                onChange={(e) => { setUserId(e.target.value.toUpperCase()); setError(''); }}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                className={error ? 'error' : ''}
                            />
                            <span className="input-icon">🆔</span>
                        </div>
                        {userId.length >= 3 && (
                            <div className={`role-indicator ${detectedRole || 'invalid'}`}>
                                {detectedRole === 'student' && '🎒 Student detected'}
                                {detectedRole === 'teacher' && '👩‍🏫 Teacher detected'}
                                {!detectedRole && '❌ Invalid prefix (use PRC or PCE)'}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                autoComplete="current-password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                className={error ? 'error' : ''}
                            />
                            <button
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-message">⚠️ {error}</div>}

                    <button
                        className="btn-primary"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳ Signing In...' : 'Sign In'}
                    </button>

                    <div className="auth-links">
                        <Link to="/forgot-password" className="link">Forgot password?</Link>
                    </div>
                </div>

                {/* Divider */}
                <div className="divider"><span>or</span></div>

                {/* Sign Up Link */}
                <div className="auth-footer">
                    <p>Don't have an account?</p>
                    <Link to="/signup" className="btn-secondary">Create Account</Link>
                </div>

                {/* Sponsors */}
                <div className="sponsors">
                    <span className="sponsors-text">Hackathon 2026 • Powered by</span>
                    <div className="sponsor-names">
                        <span>Akumen</span>
                        <span>•</span>
                        <span>Mastra</span>
                        <span>•</span>
                        <span>Interview Cake</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
