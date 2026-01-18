// TeacherClasses - Professional Class Management Page
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import './TeacherClasses.css';

interface ClassData {
    id: string;
    name: string;
    section: string;
    studentCount: number;
    avgScore: number;
    testAssigned: 'english' | 'hindi' | 'malayalam' | 'math' | null;
}

const TeacherClasses = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', section: '' });

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = () => {
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        const evaluations = JSON.parse(localStorage.getItem('gyaan_evaluations') || '{}');

        // Group students by class
        const classMap: Record<string, { students: any[], totalScore: number, scoredCount: number }> = {};

        Object.values(users).forEach((u: any) => {
            if (u.role === 'student' && u.className) {
                if (!classMap[u.className]) {
                    classMap[u.className] = { students: [], totalScore: 0, scoredCount: 0 };
                }
                classMap[u.className].students.push(u);

                const eval_ = evaluations[u.id];
                if (eval_) {
                    classMap[u.className].totalScore += eval_.overall;
                    classMap[u.className].scoredCount++;
                }
            }
        });

        // Load custom classes from localStorage
        const savedClasses = JSON.parse(localStorage.getItem('gyaan_classes') || '[]');

        // Merge all classes
        const allClassNames = new Set([...Object.keys(classMap), ...savedClasses.map((c: any) => c.name)]);

        const classList: ClassData[] = Array.from(allClassNames).map(className => {
            const data = classMap[className] || { students: [], totalScore: 0, scoredCount: 0 };
            const savedClass = savedClasses.find((c: any) => c.name === className);
            return {
                id: className.replace(/\s/g, '-').toLowerCase(),
                name: className,
                section: savedClass?.section || className.split(' ')[1] || '',
                studentCount: data.students.length,
                avgScore: data.scoredCount > 0 ? Math.round(data.totalScore / data.scoredCount) : 0,
                testAssigned: null
            };
        });

        setClasses(classList);
    };

    const addClass = () => {
        if (!newClass.name) return;

        const savedClasses = JSON.parse(localStorage.getItem('gyaan_classes') || '[]');
        savedClasses.push({
            name: newClass.name,
            section: newClass.section,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('gyaan_classes', JSON.stringify(savedClasses));

        setNewClass({ name: '', section: '' });
        setShowAddModal(false);
        loadClasses();
    };

    const deleteClass = (className: string) => {
        if (!confirm(`Delete "${className}"? Students will be removed from this class.`)) return;

        // Remove students from this class
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        Object.keys(users).forEach(userId => {
            if (users[userId].className === className) {
                users[userId].hasClass = false;
                users[userId].className = '';
                users[userId].testAssigned = null;
            }
        });
        localStorage.setItem('gyaan_users', JSON.stringify(users));

        // Remove from saved classes
        const savedClasses = JSON.parse(localStorage.getItem('gyaan_classes') || '[]');
        const filtered = savedClasses.filter((c: any) => c.name !== className);
        localStorage.setItem('gyaan_classes', JSON.stringify(filtered));

        loadClasses();
    };

    const assignBatchTest = (className: string, testType: 'english' | 'hindi' | 'malayalam' | 'math') => {
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        Object.keys(users).forEach(userId => {
            if (users[userId].className === className && users[userId].isApproved) {
                users[userId].testAssigned = testType;
            }
        });
        localStorage.setItem('gyaan_users', JSON.stringify(users));
        loadClasses();
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#22c55e';
        if (score >= 50) return '#eab308';
        if (score > 0) return '#ef4444';
        return '#64748b';
    };

    return (
        <div className="premium-dashboard">
            <Sidebar role="teacher" />

            <main className="premium-main">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left">
                        <h1>🏫 My Classes</h1>
                        <p>Manage your classes and assign batch assessments</p>
                    </div>
                    <button className="btn-add-class" onClick={() => setShowAddModal(true)}>
                        <span>+</span> Create Class
                    </button>
                </div>

                {/* Classes Grid */}
                <div className="classes-grid">
                    {classes.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">🏫</span>
                            <h3>No classes yet</h3>
                            <p>Create a class to start organizing your students</p>
                        </div>
                    ) : (
                        classes.map((cls, idx) => (
                            <motion.div
                                key={cls.id}
                                className="class-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="class-header">
                                    <div className="class-icon">📚</div>
                                    <div className="class-info">
                                        <h3>{cls.name}</h3>
                                        <span className="class-section">Section: {cls.section || 'All'}</span>
                                    </div>
                                    <button
                                        className="btn-delete-class"
                                        onClick={() => deleteClass(cls.name)}
                                        title="Delete Class"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                <div className="class-stats">
                                    <div className="stat-item">
                                        <span className="stat-value">{cls.studentCount}</span>
                                        <span className="stat-label">Students</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value" style={{ color: getScoreColor(cls.avgScore) }}>
                                            {cls.avgScore > 0 ? `${cls.avgScore}%` : '-'}
                                        </span>
                                        <span className="stat-label">Avg Score</span>
                                    </div>
                                </div>

                                <div className="class-actions">
                                    <button
                                        className="btn-class-action primary"
                                        onClick={() => navigate('/teacher/students')}
                                    >
                                        👥 View Students
                                    </button>

                                    <select
                                        className="btn-class-action select"
                                        onChange={(e) => assignBatchTest(cls.name, e.target.value as any)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>📝 Assign Test to All</option>
                                        <option value="english">🇬🇧 English</option>
                                        <option value="hindi">🇮🇳 Hindi</option>
                                        <option value="malayalam">🌴 Malayalam</option>
                                        <option value="math">🔢 Math</option>
                                    </select>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Add Class Modal */}
                <AnimatePresence>
                    {showAddModal && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                        >
                            <motion.div
                                className="modal-content"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <h2>➕ Create New Class</h2>

                                <div className="form-group">
                                    <label>Class Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Class 5A"
                                        value={newClass.name}
                                        onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Section (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="A"
                                        value={newClass.section}
                                        onChange={e => setNewClass({ ...newClass, section: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button className="btn-submit" onClick={addClass}>
                                        Create Class
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default TeacherClasses;
