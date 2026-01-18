// Signup Page - Demo OTP Mode
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginPage.css';

const SignupPage = () => {
    const [step, setStep] = useState(1);

    // Form fields
    const [userId, setUserId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    // Generate random 4-digit OTP
    const generateOtp = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    };

    // Auto-detect role from ID prefix
    const getDetectedRole = (id: string): 'student' | 'teacher' | null => {
        const prefix = id.toUpperCase().substring(0, 3);
        if (prefix === 'PRC') return 'student';
        if (prefix === 'PCE') return 'teacher';
        return null;
    };

    // Extract section from ID
    const extractSection = (id: string): string => {
        if (id.length >= 7) {
            return id.substring(5, 7);
        }
        return '';
    };

    const detectedRole = getDetectedRole(userId);
    const section = extractSection(userId);

    const validateStep1 = () => {
        if (!userId.trim()) {
            setError('Please enter your ID');
            return false;
        }
        if (!detectedRole) {
            setError('ID must start with PRC (student) or PCE (teacher)');
            return false;
        }
        if (userId.length < 10) {
            setError('ID must be at least 10 characters');
            return false;
        }
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        if (users[userId.toUpperCase()]) {
            setError('This ID is already registered');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!name.trim()) {
            setError('Please enter your name');
            return false;
        }
        if (!email.trim() || !email.includes('@gmail.com')) {
            setError('Please enter a valid Gmail address');
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 4) {
            setError('Please enter the 4-digit OTP');
            return false;
        }
        if (otpCode !== generatedOtp) {
            setError('Invalid OTP. Please check and try again.');
            return false;
        }
        return true;
    };

    const validateStep4 = () => {
        if (!password.trim() || password.length < 4) {
            setError('Password must be at least 4 characters');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const sendOtp = async () => {
        setIsLoading(true);
        setError('');

        const newOtp = generateOtp();
        setGeneratedOtp(newOtp);

        // Demo mode: OTP will be shown on screen
        console.log('📧 Demo OTP:', newOtp);

        // Simulate sending delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsLoading(false);

        // Start resend timer
        setResendTimer(30);
        const timer = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Handle OTP input with paste support
    const handleOtpChange = (index: number, value: string) => {
        // If pasting multiple digits
        if (value.length > 1) {
            const digits = value.replace(/\D/g, '').slice(0, 4).split('');
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                if (index + i < 4) {
                    newOtp[index + i] = digit;
                }
            });
            setOtp(newOtp);
            setError('');
            // Focus last filled input
            const lastIndex = Math.min(index + digits.length - 1, 3);
            const lastInput = document.getElementById(`otp-${lastIndex}`);
            lastInput?.focus();
            return;
        }

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    // Handle paste event
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, 4).split('');
        if (digits.length > 0) {
            const newOtp = ['', '', '', ''];
            digits.forEach((digit, i) => {
                if (i < 4) newOtp[i] = digit;
            });
            setOtp(newOtp);
            const lastIndex = Math.min(digits.length - 1, 3);
            setTimeout(() => {
                const lastInput = document.getElementById(`otp-${lastIndex}`);
                lastInput?.focus();
            }, 0);
        }
    };

    const nextStep = async () => {
        setError('');
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) {
            await sendOtp();
            setStep(3);
        }
        else if (step === 3 && validateStep3()) setStep(4);
    };

    const prevStep = () => {
        setError('');
        if (step === 3) {
            setOtp(['', '', '', '']);
        }
        setStep(step - 1);
    };

    const handleSignup = async () => {
        if (!validateStep4()) return;

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        users[userId.toUpperCase()] = {
            id: userId.toUpperCase(),
            name: name,
            email: email,
            emailVerified: true,
            role: detectedRole,
            section: section,
            password: password,
            isApproved: detectedRole === 'teacher',
            registeredAt: new Date().toISOString()
        };
        localStorage.setItem('gyaan_users', JSON.stringify(users));

        setIsLoading(false);
        setSuccess(true);
    };

    return (
        <div className="auth-page">
            <header className="auth-header">
                <div className="brand">
                    <span className="brand-icon">📚</span>
                    <div className="brand-text">
                        <h1>GYAAN-AI</h1>
                        <span className="tagline">Real-time Learning Diagnosis</span>
                    </div>
                </div>
            </header>

            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {success ? (
                    <div className="success-card">
                        <div className="success-icon">🎉</div>
                        <h2 className="success-title">Account Created!</h2>
                        <p className="card-subtitle">
                            {detectedRole === 'student'
                                ? 'Your teacher will approve your request soon.'
                                : 'You can now sign in and manage your classes.'
                            }
                        </p>
                        <div className="success-details">
                            <div className="detail-item">
                                <span className="detail-label">Your ID</span>
                                <span className="detail-value">{userId.toUpperCase()}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">✅ {email}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Role</span>
                                <span className="detail-value">{detectedRole === 'student' ? '🎒 Student' : '👩‍🏫 Teacher'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Section</span>
                                <span className="detail-value">{section}</span>
                            </div>
                        </div>
                        <button className="btn-primary" onClick={() => navigate('/')}>
                            Go to Sign In
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="card-title">Create Account</h2>
                        <p className="card-subtitle">Join GYAAN-AI learning platform</p>

                        <div className="step-indicator">
                            <div className={`step ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>
                                <div className="step-number">{step > 1 ? '✓' : '1'}</div>
                                <span>ID</span>
                            </div>
                            <div className={`step ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
                                <div className="step-number">{step > 2 ? '✓' : '2'}</div>
                                <span>Email</span>
                            </div>
                            <div className={`step ${step >= 3 ? (step > 3 ? 'completed' : 'active') : ''}`}>
                                <div className="step-number">{step > 3 ? '✓' : '3'}</div>
                                <span>Verify</span>
                            </div>
                            <div className={`step ${step >= 4 ? 'active' : ''}`}>
                                <div className="step-number">4</div>
                                <span>Password</span>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="auth-form">
                                    <div className="form-group">
                                        <label>Your ID</label>
                                        <div className="input-wrapper">
                                            <input
                                                type="text"
                                                placeholder="PRC23CA001 or PCE23CA001"
                                                value={userId}
                                                onChange={(e) => { setUserId(e.target.value.toUpperCase()); setError(''); }}
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
                                    {error && <div className="error-message">⚠️ {error}</div>}
                                    <button className="btn-primary" onClick={nextStep}>Continue</button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="auth-form">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <div className="input-wrapper">
                                            <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} className={error && !name ? 'error' : ''} />
                                            <span className="input-icon">👤</span>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Gmail Address (Required for OTP)</label>
                                        <div className="input-wrapper">
                                            <input type="email" placeholder="yourname@gmail.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} className={error && !email.includes('@gmail.com') ? 'error' : ''} />
                                            <span className="input-icon">📧</span>
                                        </div>
                                    </div>
                                    {error && <div className="error-message">⚠️ {error}</div>}
                                    <div className="button-group">
                                        <button className="btn-back" onClick={prevStep}>Back</button>
                                        <button className="btn-primary" onClick={nextStep} disabled={isLoading}>
                                            {isLoading ? '⏳ Sending OTP...' : 'Send OTP'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="auth-form">
                                    <div className="otp-header">
                                        <span className="otp-icon">📨</span>
                                        <p>We sent a verification code to</p>
                                        <p className="otp-email">{email}</p>
                                    </div>

                                    {/* Demo: Show OTP on screen */}
                                    <div className="demo-otp-display">
                                        <span className="demo-label">🎯 Demo OTP:</span>
                                        <span className="demo-code">{generatedOtp}</span>
                                    </div>

                                    <div className="otp-inputs" onPaste={handleOtpPaste}>
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className="otp-input"
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>

                                    <div className="resend-otp">
                                        {resendTimer > 0 ? (
                                            <span>Resend OTP in {resendTimer}s</span>
                                        ) : (
                                            <button className="link-btn" onClick={sendOtp} disabled={isLoading}>Resend OTP</button>
                                        )}
                                    </div>

                                    {error && <div className="error-message">⚠️ {error}</div>}

                                    <div className="button-group">
                                        <button className="btn-back" onClick={prevStep}>Back</button>
                                        <button className="btn-primary" onClick={nextStep}>Verify OTP</button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="auth-form">
                                    <div className="verified-badge">✅ Email Verified: {email}</div>
                                    <div className="form-group">
                                        <label>Password</label>
                                        <div className="input-wrapper">
                                            <input type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className={error && !password ? 'error' : ''} />
                                            <button className="toggle-password" onClick={() => setShowPassword(!showPassword)} type="button">{showPassword ? '🙈' : '👁️'}</button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <div className="input-wrapper">
                                            <input type={showPassword ? 'text' : 'password'} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} className={error && password !== confirmPassword ? 'error' : ''} />
                                            <span className="input-icon">🔒</span>
                                        </div>
                                    </div>
                                    {error && <div className="error-message">⚠️ {error}</div>}
                                    <div className="button-group">
                                        <button className="btn-back" onClick={prevStep}>Back</button>
                                        <button className="btn-primary" onClick={handleSignup} disabled={isLoading}>
                                            {isLoading ? '⏳ Creating...' : 'Create Account'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="divider"><span>or</span></div>
                        <div className="auth-footer">
                            <p>Already have an account?</p>
                            <Link to="/" className="btn-secondary">Sign In</Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default SignupPage;
