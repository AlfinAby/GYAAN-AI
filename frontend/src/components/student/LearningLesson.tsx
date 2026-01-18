// Learning Lesson Component - Actual teaching content for students
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import Sidebar from '../ui/Sidebar';
import './LearningLesson.css';

interface Lesson {
    id: string;
    subject: 'reading' | 'math' | 'vocabulary';
    title: string;
    level: number;
    content: string;
    example: string;
    practice: PracticeItem[];
    xpReward: number;
}

interface PracticeItem {
    type: 'read-aloud' | 'match' | 'fill-blank';
    question: string;
    answer: string;
    options?: string[];
}

// Lessons focused on Fluency, Grammar, and Speaking skills
const lessons: Lesson[] = [
    // ========== ENGLISH LESSONS ==========
    {
        id: 'en1',
        subject: 'reading',
        title: '🇬🇧 English: Read Smoothly',
        level: 1,
        content: 'Good reading means reading smoothly without stopping too much. Read each word clearly and keep going!',
        example: '❌ Wrong: "The... cat... is... big"\n✅ Right: "The cat is big" (smooth and clear!)\n\n🎯 Tip: Practice reading the same sentence 3 times to get faster!',
        practice: [
            { type: 'read-aloud', question: '🔊 Read aloud: "I like to play."', answer: 'i like to play' },
            { type: 'read-aloud', question: '🔊 Read aloud: "The sun is hot."', answer: 'the sun is hot' },
            { type: 'match', question: 'Which is smoother reading?', answer: 'The cat is big', options: ['The...cat...is...big', 'The cat is big', 'Thecat isbig'] }
        ],
        xpReward: 35
    },
    {
        id: 'en2',
        subject: 'reading',
        title: '🇬🇧 English: Simple Sentences',
        level: 1,
        content: 'A sentence tells us something. It starts with a BIG letter and ends with a full stop (.).',
        example: '✅ "I am happy." - Starts with big I, ends with .\n✅ "She runs fast." - Starts with big S, ends with .\n❌ "i am happy" - Wrong! No big letter.',
        practice: [
            { type: 'read-aloud', question: '🔊 Say: "My name is..."', answer: 'my name is' },
            { type: 'match', question: 'Which is a correct sentence?', answer: 'I like mangoes.', options: ['i like mangoes', 'I like mangoes.', 'I like mangoes'] },
            { type: 'match', question: 'Sentences start with...?', answer: 'A big letter', options: ['A small letter', 'A big letter', 'A number'] }
        ],
        xpReward: 40
    },

    // ========== HINDI LESSONS (हिंदी) ==========
    {
        id: 'hi1',
        subject: 'reading',
        title: '🇮🇳 हिंदी: स्वर सीखें',
        level: 1,
        content: 'हिंदी में 11 स्वर हैं। आइए पहले 5 स्वर सीखें: अ आ इ ई उ',
        example: '🔤 अ - अनार (Pomegranate)\n🔤 आ - आम (Mango)\n🔤 इ - इमली (Tamarind)\n🔤 ई - ईख (Sugarcane)\n🔤 उ - उल्लू (Owl)\n\n🎯 टिप: हर स्वर को 3 बार बोलें!',
        practice: [
            { type: 'read-aloud', question: '🔊 बोलें: "अ आ इ ई उ"', answer: 'अ आ इ ई उ' },
            { type: 'match', question: '"आम" किस स्वर से शुरू होता है?', answer: 'आ', options: ['अ', 'आ', 'इ'] },
            { type: 'match', question: 'हिंदी में कितने स्वर हैं?', answer: '11', options: ['5', '11', '26'] }
        ],
        xpReward: 35
    },
    {
        id: 'hi2',
        subject: 'reading',
        title: '🇮🇳 हिंदी: सरल वाक्य',
        level: 1,
        content: 'हिंदी में वाक्य बनाना सीखें। हर वाक्य में कर्ता (Subject) और क्रिया (Verb) होती है।',
        example: '✅ "मैं खेलता हूँ।" - I play\n✅ "वह पढ़ती है।" - She reads\n✅ "हम स्कूल जाते हैं।" - We go to school\n\n🎯 वाक्य पूर्ण विराम (।) से समाप्त होता है!',
        practice: [
            { type: 'read-aloud', question: '🔊 बोलें: "मेरा नाम... है।"', answer: 'मेरा नाम है' },
            { type: 'match', question: 'वाक्य किससे समाप्त होता है?', answer: '।', options: ['.', '।', '?'] },
            { type: 'read-aloud', question: '🔊 बोलें: "मुझे खेलना पसंद है।"', answer: 'मुझे खेलना पसंद है' }
        ],
        xpReward: 40
    },
    {
        id: 'hi3',
        subject: 'vocabulary',
        title: '🇮🇳 हिंदी: गिनती 1-10',
        level: 1,
        content: 'हिंदी में गिनती सीखें: एक से दस तक!',
        example: '1️⃣ एक  2️⃣ दो  3️⃣ तीन  4️⃣ चार  5️⃣ पाँच\n6️⃣ छह  7️⃣ सात  8️⃣ आठ  9️⃣ नौ  🔟 दस',
        practice: [
            { type: 'read-aloud', question: '🔊 गिनें: "एक, दो, तीन, चार, पाँच"', answer: 'एक दो तीन चार पाँच' },
            { type: 'match', question: '"7" हिंदी में क्या है?', answer: 'सात', options: ['छह', 'सात', 'आठ'] },
            { type: 'match', question: '"पाँच" कौन सी संख्या है?', answer: '5', options: ['4', '5', '6'] }
        ],
        xpReward: 35
    },

    // ========== MALAYALAM LESSONS (മലയാളം) ==========
    {
        id: 'ml1',
        subject: 'reading',
        title: '🇮🇳 മലയാളം: സ്വരാക്ഷരങ്ങൾ',
        level: 1,
        content: 'മലയാളത്തിൽ 15 സ്വരാക്ഷരങ്ങൾ ഉണ്ട്. ആദ്യത്തെ 5 സ്വരങ്ങൾ പഠിക്കാം: അ ആ ഇ ഈ ഉ',
        example: '🔤 അ - അമ്മ (Mother)\n🔤 ആ - ആന (Elephant)\n🔤 ഇ - ഇല (Leaf)\n🔤 ഈ - ഈച്ച (Fly)\n🔤 ഉ - ഉപ്പ് (Salt)\n\n🎯 ടിപ്പ്: ഓരോ അക്ഷരവും 3 തവണ പറയൂ!',
        practice: [
            { type: 'read-aloud', question: '🔊 പറയൂ: "അ ആ ഇ ഈ ഉ"', answer: 'അ ആ ഇ ഈ ഉ' },
            { type: 'match', question: '"ആന" ഏത് അക്ഷരത്തിൽ തുടങ്ങുന്നു?', answer: 'ആ', options: ['അ', 'ആ', 'ഇ'] },
            { type: 'match', question: 'മലയാളത്തിൽ എത്ര സ്വരാക്ഷരങ്ങൾ?', answer: '15', options: ['5', '15', '26'] }
        ],
        xpReward: 35
    },
    {
        id: 'ml2',
        subject: 'reading',
        title: '🇮🇳 മലയാളം: ലളിതമായ വാക്യങ്ങൾ',
        level: 1,
        content: 'മലയാളത്തിൽ വാക്യങ്ങൾ എഴുതാൻ പഠിക്കാം. വാക്യം പൂർണ്ണ വിരാമത്തിൽ അവസാനിക്കും.',
        example: '✅ "ഞാൻ കളിക്കുന്നു." - I play\n✅ "അവൾ വായിക്കുന്നു." - She reads\n✅ "ഞങ്ങൾ സ്കൂളിൽ പോകുന്നു." - We go to school\n\n🎯 വാക്യം "." ൽ അവസാനിക്കുന്നു!',
        practice: [
            { type: 'read-aloud', question: '🔊 പറയൂ: "എന്റെ പേര്... ആണ്."', answer: 'എന്റെ പേര് ആണ്' },
            { type: 'match', question: 'വാക്യം എന്തിൽ അവസാനിക്കുന്നു?', answer: '.', options: ['.', '।', '?'] },
            { type: 'read-aloud', question: '🔊 പറയൂ: "എനിക്ക് കളിക്കാൻ ഇഷ്ടമാണ്."', answer: 'എനിക്ക് കളിക്കാൻ ഇഷ്ടമാണ്' }
        ],
        xpReward: 40
    },
    {
        id: 'ml3',
        subject: 'vocabulary',
        title: '🇮🇳 മലയാളം: എണ്ണൽ 1-10',
        level: 1,
        content: 'മലയാളത്തിൽ എണ്ണൽ പഠിക്കാം: ഒന്ന് മുതൽ പത്ത് വരെ!',
        example: '1️⃣ ഒന്ന്  2️⃣ രണ്ട്  3️⃣ മൂന്ന്  4️⃣ നാല്  5️⃣ അഞ്ച്\n6️⃣ ആറ്  7️⃣ ഏഴ്  8️⃣ എട്ട്  9️⃣ ഒൻപത്  🔟 പത്ത്',
        practice: [
            { type: 'read-aloud', question: '🔊 എണ്ണൂ: "ഒന്ന്, രണ്ട്, മൂന്ന്, നാല്, അഞ്ച്"', answer: 'ഒന്ന് രണ്ട് മൂന്ന് നാല് അഞ്ച്' },
            { type: 'match', question: '"7" മലയാളത്തിൽ എന്താണ്?', answer: 'ഏഴ്', options: ['ആറ്', 'ഏഴ്', 'എട്ട്'] },
            { type: 'match', question: '"അഞ്ച്" ഏത് സംഖ്യ?', answer: '5', options: ['4', '5', '6'] }
        ],
        xpReward: 35
    }
];

const LearningLesson = () => {
    const { studentData, addXP } = useAppStore();
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [currentStep, setCurrentStep] = useState<'learn' | 'practice' | 'complete'>('learn');
    const [practiceIndex, setPracticeIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [score, setScore] = useState(0);

    const level = studentData?.level || 1;

    // Stop any ongoing speech
    const stopSpeech = () => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    };

    // Akumen Accessibility: Text-to-Speech function
    const speakText = (text: string) => {
        // Don't start new speech if already speaking
        if (isSpeaking) {
            stopSpeech();
            return;
        }

        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech first
            speechSynthesis.cancel();

            // Small delay to ensure cancel completes
            setTimeout(() => {
                setIsSpeaking(true);
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.8; // Slower for young students
                utterance.pitch = 1.1; // Slightly higher pitch
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = () => setIsSpeaking(false);
                speechSynthesis.speak(utterance);
            }, 100);
        }
    };

    const handleSelectLesson = (lesson: Lesson) => {
        setCurrentLesson(lesson);
        setCurrentStep('learn');
        setPracticeIndex(0);
        setScore(0);
        console.log('[Mastra] Lesson started:', lesson.title);
    };

    const handleStartPractice = () => {
        setCurrentStep('practice');
        setPracticeIndex(0);
    };

    const handleAnswer = (answer: string) => {
        const practice = currentLesson?.practice[practiceIndex];
        if (!practice) return;

        const correct = answer.toLowerCase() === practice.answer.toLowerCase();
        setSelectedAnswer(answer);
        setIsCorrect(correct);

        if (correct) {
            setScore(prev => prev + 1);
        }

        // Move to next question after delay
        setTimeout(() => {
            if (practiceIndex < (currentLesson?.practice.length || 0) - 1) {
                setPracticeIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setIsCorrect(null);
            } else {
                setCurrentStep('complete');
                if (currentLesson) {
                    addXP(currentLesson.xpReward);
                    console.log('[Akumen Analytics] Lesson complete, XP earned:', currentLesson.xpReward);
                }
            }
        }, 1500);
    };

    const handleFinish = () => {
        setCurrentLesson(null);
        setCurrentStep('learn');
    };

    return (
        <div className="app-layout">
            <Sidebar role="student" />
            <main className="main-content learning-main">
                {/* Akumen Accessibility: Dyslexia-friendly font toggle */}
                <div className="accessibility-bar">
                    <span>🔊 Akumen Accessibility</span>
                    {isSpeaking ? (
                        <button
                            className="btn-stop"
                            onClick={stopSpeech}
                        >
                            ⏹️ Stop
                        </button>
                    ) : (
                        <button
                            className="btn-speak"
                            onClick={() => speakText('Welcome to GYAAN AI Learning')}
                        >
                            🔊 Read Aloud
                        </button>
                    )}
                </div>

                {!currentLesson ? (
                    <div className="lessons-grid">
                        <h2>📚 Choose a Lesson</h2>
                        <p className="lessons-subtitle">Learn step by step, earn XP!</p>

                        <div className="lesson-cards">
                            {lessons.filter(l => l.level <= level + 1).map(lesson => (
                                <motion.div
                                    key={lesson.id}
                                    className={`lesson-card ${lesson.subject}`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectLesson(lesson)}
                                >
                                    <div className="lesson-icon">
                                        {lesson.subject === 'reading' ? '📖' :
                                            lesson.subject === 'math' ? '🔢' : '🗣️'}
                                    </div>
                                    <h3>{lesson.title}</h3>
                                    <span className="lesson-xp">+{lesson.xpReward} XP</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {currentStep === 'learn' && (
                            <motion.div
                                className="lesson-content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <h2>{currentLesson.title}</h2>
                                <div className="lesson-box">
                                    <p className="lesson-text">{currentLesson.content}</p>
                                    <button
                                        className="btn-speak-content"
                                        onClick={() => speakText(currentLesson.content)}
                                    >
                                        🔊 Listen
                                    </button>
                                </div>
                                <div className="example-box">
                                    <h3>Examples:</h3>
                                    <pre className="example-text">{currentLesson.example}</pre>
                                    <button
                                        className="btn-speak-content"
                                        onClick={() => speakText(currentLesson.example.replace(/\n/g, '. '))}
                                    >
                                        🔊 Listen
                                    </button>
                                </div>
                                <motion.button
                                    className="btn-gold"
                                    onClick={handleStartPractice}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    Start Practice ▶
                                </motion.button>
                            </motion.div>
                        )}

                        {currentStep === 'practice' && currentLesson.practice[practiceIndex] && (
                            <motion.div
                                className="practice-content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="progress-indicator">
                                    Question {practiceIndex + 1} of {currentLesson.practice.length}
                                </div>
                                <div className="practice-question">
                                    <p>{currentLesson.practice[practiceIndex].question}</p>
                                    <button
                                        className="btn-speak-content"
                                        onClick={() => speakText(currentLesson.practice[practiceIndex].question)}
                                    >
                                        🔊
                                    </button>
                                </div>

                                {currentLesson.practice[practiceIndex].options && (
                                    <div className="options-grid">
                                        {currentLesson.practice[practiceIndex].options?.map(opt => (
                                            <motion.button
                                                key={opt}
                                                className={`option-btn ${selectedAnswer === opt
                                                    ? isCorrect ? 'correct' : 'wrong'
                                                    : ''
                                                    }`}
                                                onClick={() => handleAnswer(opt)}
                                                disabled={selectedAnswer !== null}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {opt}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {isCorrect !== null && (
                                    <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>
                                        {isCorrect ? '✓ Great job!' : '✗ Try again next time!'}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {currentStep === 'complete' && (
                            <motion.div
                                className="complete-content"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                <div className="complete-icon">🎉</div>
                                <h2>Lesson Complete!</h2>
                                <p>You got {score} out of {currentLesson.practice.length} correct!</p>
                                <div className="xp-earned">+{currentLesson.xpReward} XP</div>
                                <motion.button
                                    className="btn-frost"
                                    onClick={handleFinish}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    Back to Lessons
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
};

export default LearningLesson;
