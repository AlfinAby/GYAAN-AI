// Subject-Based Progress Map - Shows progress for Reading, Math, Comprehension
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import './ProgressMap.css';

interface SubjectMapProps {
    level: number;
    xp: number;
    hasCompletedAssessment: boolean;
}

// Subject definitions
const subjects = [
    {
        id: 'reading',
        name: 'Reading',
        icon: '📖',
        color: '#46bdd7',
        skills: ['Letters', 'Words', 'Sentences', 'Paragraphs', 'Stories']
    },
    {
        id: 'math',
        name: 'Math',
        icon: '🔢',
        color: '#e85a3c',
        skills: ['Numbers', 'Counting', 'Addition', 'Subtraction', 'Shapes']
    },
    {
        id: 'comprehension',
        name: 'Understanding',
        icon: '🧠',
        color: '#c89b3c',
        skills: ['Listen', 'Answer', 'Remember', 'Explain', 'Create']
    },
    {
        id: 'vocabulary',
        name: 'Words',
        icon: '🗣️',
        color: '#27ae60',
        skills: ['Basic', 'Animals', 'Objects', 'Actions', 'Describing']
    }
];

const ProgressMap = ({ level, xp, hasCompletedAssessment }: SubjectMapProps) => {
    const { concepts } = useAppStore();

    // Calculate progress for each subject based on concepts
    const getSubjectProgress = (subjectId: string) => {
        const subjectConcepts = concepts.filter(c =>
            (subjectId === 'reading' && c.category === 'reading') ||
            (subjectId === 'math' && c.category === 'math') ||
            (subjectId === 'comprehension' && c.category === 'comprehension')
        );

        if (subjectConcepts.length === 0) {
            // Use level-based progress for now
            return Math.min(level * 20, 100);
        }

        const mastered = subjectConcepts.filter(c => c.status === 'mastered').length;
        return Math.round((mastered / subjectConcepts.length) * 100);
    };

    // Calculate which skill is current based on progress
    const getCurrentSkillIndex = (progress: number) => {
        if (progress < 20) return 0;
        if (progress < 40) return 1;
        if (progress < 60) return 2;
        if (progress < 80) return 3;
        return 4;
    };

    if (!hasCompletedAssessment) {
        return (
            <div className="progress-map locked">
                <div className="map-locked-overlay">
                    <div className="lock-icon">🔒</div>
                    <h3>Map Locked</h3>
                    <p>Complete your first reading to unlock</p>
                </div>
            </div>
        );
    }

    return (
        <div className="progress-map subject-based">
            <div className="map-header">
                <h2>📚 Your Learning Journey</h2>
                <div className="player-stats">
                    <span className="stat-badge level">Level {level}</span>
                    <span className="stat-badge xp">{xp} XP</span>
                </div>
            </div>

            <div className="subjects-grid">
                {subjects.map((subject, index) => {
                    const progress = getSubjectProgress(subject.id);
                    const currentSkill = getCurrentSkillIndex(progress);
                    const isUnlocked = level > 0 || index === 0;

                    return (
                        <motion.div
                            key={subject.id}
                            className={`subject-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{ '--subject-color': subject.color } as React.CSSProperties}
                        >
                            <div className="subject-header">
                                <span className="subject-icon">{subject.icon}</span>
                                <h3>{subject.name}</h3>
                                {!isUnlocked && <span className="lock-badge">🔒</span>}
                            </div>

                            <div className="subject-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${isUnlocked ? progress : 0}%` }}
                                    />
                                </div>
                                <span className="progress-text">{isUnlocked ? progress : 0}%</span>
                            </div>

                            <div className="skill-list">
                                {subject.skills.map((skill, skillIndex) => (
                                    <div
                                        key={skill}
                                        className={`skill-item ${skillIndex < currentSkill ? 'completed' :
                                                skillIndex === currentSkill ? 'current' : 'locked'
                                            }`}
                                    >
                                        <span className="skill-status">
                                            {skillIndex < currentSkill ? '✓' :
                                                skillIndex === currentSkill ? '▶' : '○'}
                                        </span>
                                        <span className="skill-name">{skill}</span>
                                    </div>
                                ))}
                            </div>

                            {isUnlocked && (
                                <motion.button
                                    className="btn-practice"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Practice Now
                                </motion.button>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="map-footer">
                <p className="encouragement">
                    {level === 0 ? "🌟 Great start! Keep practicing!" :
                        level < 3 ? "🔥 You're doing awesome! Keep going!" :
                            "⭐ You're a superstar learner!"}
                </p>
            </div>
        </div>
    );
};

export default ProgressMap;
