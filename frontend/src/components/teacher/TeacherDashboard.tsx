// Teacher Dashboard - Premium Modern UI
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import Sidebar from '../ui/Sidebar';
import './TeacherDashboard.css';

interface StudentData {
    id: string;
    name: string;
    email: string;
    section: string;
    isApproved: boolean;
    hasClass: boolean;
    className: string;
    testAssigned: 'english' | 'hindi' | 'malayalam' | 'math' | null;
    registeredAt: string;
    evaluation?: {
        overall: number;
        weaknesses: string[];
    };
}

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAppStore();
    const [students, setStudents] = useState<StudentData[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [averageScore, setAverageScore] = useState(0);
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        loadStudents();
    }, [isAuthenticated, navigate]);

    const loadStudents = () => {
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        const evaluations = JSON.parse(localStorage.getItem('gyaan_evaluations') || '{}');

        const studentList: StudentData[] = [];
        let pending = 0;
        let approved = 0;
        let totalScore = 0;
        let scoredStudents = 0;

        Object.values(users).forEach((u: any) => {
            if (u.role === 'student') {
                const evaluation = evaluations[u.id];
                studentList.push({
                    id: u.id,
                    name: u.name || u.username || u.id,
                    email: u.email || '',
                    section: u.section || 'N/A',
                    isApproved: u.isApproved || false,
                    hasClass: u.hasClass || false,
                    className: u.className || '',
                    testAssigned: u.testAssigned || null,
                    registeredAt: u.registeredAt || new Date().toISOString(),
                    evaluation: evaluation ? {
                        overall: evaluation.overall,
                        weaknesses: evaluation.weaknesses
                    } : undefined
                });

                if (u.isApproved) {
                    approved++;
                    if (evaluation) {
                        totalScore += evaluation.overall;
                        scoredStudents++;
                    }
                } else {
                    pending++;
                }
            }
        });

        setStudents(studentList);
        setPendingCount(pending);
        setApprovedCount(approved);
        setAverageScore(scoredStudents > 0 ? Math.round(totalScore / scoredStudents) : 0);
    };

    const approveStudent = (studentId: string) => {
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        if (users[studentId]) {
            users[studentId].isApproved = true;
            localStorage.setItem('gyaan_users', JSON.stringify(users));
            loadStudents();
        }
    };

    const assignClass = (studentId: string, className: string) => {
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        if (users[studentId]) {
            users[studentId].hasClass = true;
            users[studentId].className = className;
            localStorage.setItem('gyaan_users', JSON.stringify(users));
            loadStudents();
        }
    };

    const assignTest = (studentId: string, testType: 'english' | 'hindi' | 'malayalam' | 'math') => {
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        if (users[studentId]) {
            users[studentId].testAssigned = testType;
            localStorage.setItem('gyaan_users', JSON.stringify(users));
            loadStudents();
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#22c55e';
        if (score >= 50) return '#eab308';
        return '#ef4444';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 70) return 'linear-gradient(135deg, #22c55e, #16a34a)';
        if (score >= 50) return 'linear-gradient(135deg, #eab308, #ca8a04)';
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
    };

    const filteredStudents = activeTab === 'pending'
        ? students.filter(s => !s.isApproved)
        : students; // All Students shows everyone

    return (
        <div className="premium-dashboard">
            <Sidebar role="teacher" />

            <main className="premium-main">
                {/* Welcome Section */}
                <motion.div
                    className="welcome-banner"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="welcome-content">
                        <h1>Welcome back, <span className="name-highlight">{user?.username || 'Teacher'}</span> 👋</h1>
                        <p>Here's what's happening with your students today.</p>
                    </div>
                    <div className="welcome-date">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="premium-stats">
                    <motion.div
                        className="stat-card gradient-purple"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="stat-glow purple"></div>
                        <div className="stat-icon-wrapper">
                            <span className="stat-icon">👥</span>
                        </div>
                        <div className="stat-data">
                            <span className="stat-value">{students.length}</span>
                            <span className="stat-title">Total Students</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="stat-card gradient-green"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                    >
                        <div className="stat-glow green"></div>
                        <div className="stat-icon-wrapper">
                            <span className="stat-icon">✅</span>
                        </div>
                        <div className="stat-data">
                            <span className="stat-value">{approvedCount}</span>
                            <span className="stat-title">Active</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="stat-card gradient-orange"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="stat-glow orange"></div>
                        <div className="stat-icon-wrapper">
                            <span className="stat-icon">⏳</span>
                        </div>
                        <div className="stat-data">
                            <span className="stat-value">{pendingCount}</span>
                            <span className="stat-title">Pending</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="stat-card gradient-blue"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 }}
                    >
                        <div className="stat-glow blue"></div>
                        <div className="stat-icon-wrapper">
                            <span className="stat-icon">📊</span>
                        </div>
                        <div className="stat-data">
                            <span className="stat-value" style={{ color: getScoreColor(averageScore) }}>
                                {averageScore}%
                            </span>
                            <span className="stat-title">Avg Score</span>
                        </div>
                    </motion.div>
                </div>

                {/* Main Content Area */}
                <div className="dashboard-content">
                    {/* Students Section */}
                    <motion.div
                        className="students-panel glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="panel-header">
                            <h2>Students Overview</h2>
                            <div className="tab-buttons">
                                <button
                                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    All Students
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('pending')}
                                >
                                    Pending ({pendingCount})
                                </button>
                            </div>
                        </div>

                        {filteredStudents.length === 0 ? (
                            <div className="empty-state-premium">
                                <div className="empty-icon">📭</div>
                                <h3>No students here</h3>
                                <p>{activeTab === 'pending' ? 'All students have been approved!' : 'Approve pending students to see them here.'}</p>
                            </div>
                        ) : (
                            <div className="students-list">
                                {filteredStudents.map((student, idx) => (
                                    <motion.div
                                        key={student.id}
                                        className="student-row"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                    >
                                        <div className="student-info">
                                            <div className="student-avatar" style={{ background: student.isApproved ? getScoreGradient(student.evaluation?.overall || 50) : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="student-details">
                                                <span className="student-name">{student.name}</span>
                                                <span className="student-meta">{student.id} • Section {student.section}</span>
                                            </div>
                                        </div>

                                        <div className="student-score">
                                            {student.evaluation ? (
                                                <div className="score-badge" style={{ background: getScoreGradient(student.evaluation.overall) }}>
                                                    {student.evaluation.overall}%
                                                </div>
                                            ) : (
                                                <span className="no-score">Not evaluated</span>
                                            )}
                                        </div>

                                        <div className="student-actions">
                                            {!student.isApproved ? (
                                                <button
                                                    className="btn-approve-premium"
                                                    onClick={() => approveStudent(student.id)}
                                                >
                                                    ✓ Approve
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn-action-sm view"
                                                        onClick={() => navigate('/teacher/students')}
                                                        title="View Report"
                                                    >
                                                        📊
                                                    </button>

                                                    {/* Assign Special Task */}
                                                    <button
                                                        className="btn-action-sm task"
                                                        onClick={() => {
                                                            const task = prompt(`Assign special task to ${student.name}:`);
                                                            if (task && task.trim()) {
                                                                const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
                                                                if (users[student.id]) {
                                                                    users[student.id].manualTasks = users[student.id].manualTasks || [];
                                                                    users[student.id].manualTasks.push(task);
                                                                    localStorage.setItem('gyaan_users', JSON.stringify(users));
                                                                    alert(`Task assigned to ${student.name}`);
                                                                }
                                                            }
                                                        }}
                                                        title="Assign Task"
                                                    >
                                                        📝
                                                    </button>

                                                    {/* Mark Late */}
                                                    <button
                                                        className="btn-action-sm late"
                                                        onClick={() => {
                                                            const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
                                                            if (users[student.id]) {
                                                                users[student.id].isLate = !users[student.id].isLate;
                                                                localStorage.setItem('gyaan_users', JSON.stringify(users));
                                                                loadStudents();
                                                                alert(users[student.id].isLate ? `${student.name} marked as LATE` : `${student.name} late status removed`);
                                                            }
                                                        }}
                                                        title="Mark Late"
                                                    >
                                                        ⏰
                                                    </button>

                                                    {!student.hasClass ? (
                                                        <select
                                                            className="select-action"
                                                            onChange={(e) => assignClass(student.id, e.target.value)}
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>+ Class</option>
                                                            <option value="Class 1A">1A</option>
                                                            <option value="Class 2B">2B</option>
                                                            <option value="Class 3C">3C</option>
                                                            <option value="Class 4D">4D</option>
                                                        </select>
                                                    ) : !student.testAssigned ? (
                                                        <select
                                                            className="select-action"
                                                            onChange={(e) => assignTest(student.id, e.target.value as 'english' | 'hindi' | 'malayalam' | 'math')}
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>📝 Test</option>
                                                            <option value="english">EN</option>
                                                            <option value="hindi">HI</option>
                                                            <option value="malayalam">ML</option>
                                                            <option value="math">Math</option>
                                                        </select>
                                                    ) : (
                                                        <span className="status-chip ready">✅</span>
                                                    )}

                                                    <button
                                                        className="btn-action-sm remove"
                                                        onClick={() => {
                                                            if (confirm('Remove this student?')) {
                                                                const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
                                                                delete users[student.id];
                                                                localStorage.setItem('gyaan_users', JSON.stringify(users));
                                                                loadStudents();
                                                            }
                                                        }}
                                                        title="Remove Student"
                                                    >
                                                        🗑️
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        className="actions-panel glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2>Quick Actions</h2>
                        <div className="quick-actions">
                            <button className="action-btn" onClick={() => navigate('/teacher/students')}>
                                <div className="action-icon-bg purple">
                                    <span>👥</span>
                                </div>
                                <span className="action-text">Manage Students</span>
                            </button>
                            <button className="action-btn" onClick={() => navigate('/teacher/analytics')}>
                                <div className="action-icon-bg blue">
                                    <span>📈</span>
                                </div>
                                <span className="action-text">Analytics</span>
                            </button>
                            <button className="action-btn" onClick={() => navigate('/teacher/assignments')}>
                                <div className="action-icon-bg green">
                                    <span>📝</span>
                                </div>
                                <span className="action-text">Assignments</span>
                            </button>
                            <button className="action-btn" onClick={() => navigate('/teacher/content')}>
                                <div className="action-icon-bg orange">
                                    <span>📚</span>
                                </div>
                                <span className="action-text">Content</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
