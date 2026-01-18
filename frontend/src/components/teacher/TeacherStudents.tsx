// TeacherStudents - Professional Student Management Page
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import Sidebar from '../ui/Sidebar';
import ProgressMap from '../ui/ProgressMap';
import './TeacherStudents.css';

interface StudentData {
    id: string;
    name: string;
    email: string;
    section: string;
    isApproved: boolean;
    hasClass: boolean;
    className: string;
    testAssigned: 'english' | 'hindi' | 'malayalam' | 'math' | null;
    evaluation?: {
        overall: number;
        scores: Array<{ skill: string; score: number; icon: string }>;
        weaknesses: string[];
        tasks: string[];
        date: string;
    };
    manualTasks?: string[];
}

type ModalType = 'none' | 'add' | 'view' | 'assign-task';

const TeacherStudents = () => {
    useAppStore(); // Just to ensure store is initialized
    const [students, setStudents] = useState<StudentData[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
    const [modal, setModal] = useState<ModalType>('none');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState<string>('all');
    const [newTaskText, setNewTaskText] = useState('');

    // Add student form
    const [newStudent, setNewStudent] = useState({
        id: '',
        name: '',
        email: '',
        section: '',
        className: ''
    });

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = () => {
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        const evaluations = JSON.parse(localStorage.getItem('gyaan_evaluations') || '{}');

        const studentList: StudentData[] = [];
        Object.values(users).forEach((u: any) => {
            if (u.role === 'student') {
                studentList.push({
                    id: u.id,
                    name: u.name || u.username || u.id,
                    email: u.email || '',
                    section: u.section || 'N/A',
                    isApproved: u.isApproved || false,
                    hasClass: u.hasClass || false,
                    className: u.className || '',
                    testAssigned: u.testAssigned || null,
                    evaluation: evaluations[u.id] || undefined,
                    manualTasks: u.manualTasks || []
                });
            }
        });
        setStudents(studentList);
    };

    const addStudent = () => {
        if (!newStudent.id || !newStudent.name) return;

        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        users[newStudent.id] = {
            id: newStudent.id,
            username: newStudent.name,
            name: newStudent.name,
            email: newStudent.email,
            section: newStudent.section,
            role: 'student',
            isApproved: true,
            hasClass: !!newStudent.className,
            className: newStudent.className,
            testAssigned: null,
            password: 'student123',
            registeredAt: new Date().toISOString()
        };
        localStorage.setItem('gyaan_users', JSON.stringify(users));

        setNewStudent({ id: '', name: '', email: '', section: '', className: '' });
        setModal('none');
        loadStudents();
    };

    const removeStudent = (studentId: string) => {
        if (!confirm('Remove this student?')) return;

        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        delete users[studentId];
        localStorage.setItem('gyaan_users', JSON.stringify(users));

        setModal('none');
        setSelectedStudent(null);
        loadStudents();
    };

    const removeFromClass = (studentId: string) => {
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        if (users[studentId]) {
            users[studentId].hasClass = false;
            users[studentId].className = '';
            users[studentId].testAssigned = null;
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

    const addManualTask = (studentId: string, task: string) => {
        if (!task.trim()) return;

        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        if (users[studentId]) {
            users[studentId].manualTasks = users[studentId].manualTasks || [];
            users[studentId].manualTasks.push(task);
            localStorage.setItem('gyaan_users', JSON.stringify(users));
            setNewTaskText('');
            loadStudents();

            // Update selected student
            if (selectedStudent?.id === studentId) {
                setSelectedStudent({
                    ...selectedStudent,
                    manualTasks: [...(selectedStudent.manualTasks || []), task]
                });
            }
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#22c55e';
        if (score >= 50) return '#eab308';
        return '#ef4444';
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass === 'all' || s.className === filterClass;
        return matchesSearch && matchesClass;
    });

    const classes = [...new Set(students.filter(s => s.className).map(s => s.className))];

    return (
        <div className="premium-dashboard">
            <Sidebar role="teacher" />

            <main className="premium-main">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left">
                        <h1>👥 Student Management</h1>
                        <p>Manage your students, assign tasks, and track progress</p>
                    </div>
                    <button className="btn-add-student" onClick={() => setModal('add')}>
                        <span>+</span> Add Student
                    </button>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                    >
                        <option value="all">All Classes</option>
                        {classes.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <div className="student-count">
                        {filteredStudents.length} students
                    </div>
                </div>

                {/* Students Grid */}
                <div className="students-grid">
                    {filteredStudents.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📭</span>
                            <h3>No students found</h3>
                            <p>Add students using the button above</p>
                        </div>
                    ) : (
                        filteredStudents.map((student, idx) => (
                            <motion.div
                                key={student.id}
                                className={`student-card ${student.isApproved ? 'approved' : 'pending'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="card-header">
                                    <div className="student-avatar" style={{
                                        background: student.evaluation
                                            ? `linear-gradient(135deg, ${getScoreColor(student.evaluation.overall)}, ${getScoreColor(student.evaluation.overall)}aa)`
                                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                    }}>
                                        {student.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="student-info">
                                        <h3>{student.name}</h3>
                                        <span className="student-id">{student.id}</span>
                                    </div>
                                    {student.evaluation && (
                                        <div className="score-badge" style={{ background: getScoreColor(student.evaluation.overall) }}>
                                            {student.evaluation.overall}%
                                        </div>
                                    )}
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="info-label">Class:</span>
                                        <span className="info-value">{student.className || 'Not assigned'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Test:</span>
                                        <span className="info-value">{student.testAssigned || 'Not assigned'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Status:</span>
                                        <span className={`status-badge ${student.isApproved ? 'approved' : 'pending'}`}>
                                            {student.isApproved ? '✅ Active' : '⏳ Pending'}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <button
                                        className="btn-action primary"
                                        onClick={() => { setSelectedStudent(student); setModal('view'); }}
                                    >
                                        📊 View Report
                                    </button>
                                    <button
                                        className="btn-action secondary"
                                        onClick={() => { setSelectedStudent(student); setModal('assign-task'); }}
                                    >
                                        📝 Assign Task
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {/* Add Student Modal */}
                    {modal === 'add' && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModal('none')}
                        >
                            <motion.div
                                className="modal-content"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <h2>➕ Add New Student</h2>

                                <div className="form-group">
                                    <label>Student ID *</label>
                                    <input
                                        type="text"
                                        placeholder="PRC23CA001"
                                        value={newStudent.id}
                                        onChange={e => setNewStudent({ ...newStudent, id: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Student Name"
                                        value={newStudent.name}
                                        onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="student@gmail.com"
                                        value={newStudent.email}
                                        onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Section</label>
                                        <input
                                            type="text"
                                            placeholder="CA"
                                            value={newStudent.section}
                                            onChange={e => setNewStudent({ ...newStudent, section: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Class</label>
                                        <select
                                            value={newStudent.className}
                                            onChange={e => setNewStudent({ ...newStudent, className: e.target.value })}
                                        >
                                            <option value="">Select Class</option>
                                            <option value="Class 1A">Class 1A</option>
                                            <option value="Class 2B">Class 2B</option>
                                            <option value="Class 3C">Class 3C</option>
                                            <option value="Class 4D">Class 4D</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setModal('none')}>
                                        Cancel
                                    </button>
                                    <button className="btn-submit" onClick={addStudent}>
                                        Add Student
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* View Report Modal */}
                    {modal === 'view' && selectedStudent && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModal('none')}
                        >
                            <motion.div
                                className="modal-content large"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="report-header">
                                    <div className="report-avatar" style={{
                                        background: selectedStudent.evaluation
                                            ? `linear-gradient(135deg, ${getScoreColor(selectedStudent.evaluation.overall)}, ${getScoreColor(selectedStudent.evaluation.overall)}aa)`
                                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                    }}>
                                        {selectedStudent.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="report-info">
                                        <h2>{selectedStudent.name}</h2>
                                        <p>{selectedStudent.id} • {selectedStudent.className || 'No class'}</p>
                                    </div>
                                    {selectedStudent.evaluation && (
                                        <div className="overall-score" style={{ borderColor: getScoreColor(selectedStudent.evaluation.overall) }}>
                                            <span style={{ color: getScoreColor(selectedStudent.evaluation.overall) }}>
                                                {selectedStudent.evaluation.overall}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {selectedStudent.evaluation ? (
                                    <>
                                        <h3>📊 Skill Scores</h3>
                                        <div className="skills-report">
                                            {selectedStudent.evaluation.scores.map((skill, idx) => (
                                                <div key={idx} className="skill-row">
                                                    <span className="skill-icon">{skill.icon}</span>
                                                    <span className="skill-name">{skill.skill}</span>
                                                    <div className="skill-bar">
                                                        <div
                                                            className="skill-fill"
                                                            style={{ width: `${skill.score}%`, background: getScoreColor(skill.score) }}
                                                        ></div>
                                                    </div>
                                                    <span className="skill-score" style={{ color: getScoreColor(skill.score) }}>
                                                        {skill.score}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {selectedStudent.evaluation.weaknesses.length > 0 && (
                                            <>
                                                <h3>⚠️ Areas to Improve</h3>
                                                <div className="weakness-chips">
                                                    {selectedStudent.evaluation.weaknesses.map((w, idx) => (
                                                        <span key={idx} className="weakness-chip">{w}</span>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        <h3>📌 AI-Generated Tasks</h3>
                                        <ul className="tasks-list">
                                            {selectedStudent.evaluation.tasks.map((task, idx) => (
                                                <li key={idx}>{task}</li>
                                            ))}
                                        </ul>

                                        {/* Progress Map */}
                                        <ProgressMap
                                            scores={selectedStudent.evaluation.scores}
                                            overall={selectedStudent.evaluation.overall}
                                            studentName={selectedStudent.name}
                                        />
                                    </>
                                ) : (
                                    <div className="no-evaluation">
                                        <span>📭</span>
                                        <p>No evaluation completed yet</p>
                                    </div>
                                )}

                                {(selectedStudent.manualTasks?.length || 0) > 0 && (
                                    <>
                                        <h3>📝 Manual Tasks (Teacher Assigned)</h3>
                                        <ul className="tasks-list manual">
                                            {selectedStudent.manualTasks?.map((task, idx) => (
                                                <li key={idx}>{task}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                <div className="report-actions">
                                    {!selectedStudent.hasClass && (
                                        <select
                                            className="action-select"
                                            onChange={(e) => {
                                                assignClass(selectedStudent.id, e.target.value);
                                                setSelectedStudent({ ...selectedStudent, hasClass: true, className: e.target.value });
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>+ Assign Class</option>
                                            <option value="Class 1A">Class 1A</option>
                                            <option value="Class 2B">Class 2B</option>
                                            <option value="Class 3C">Class 3C</option>
                                            <option value="Class 4D">Class 4D</option>
                                        </select>
                                    )}

                                    {selectedStudent.hasClass && !selectedStudent.testAssigned && (
                                        <select
                                            className="action-select"
                                            onChange={(e) => {
                                                const val = e.target.value as 'english' | 'hindi' | 'malayalam' | 'math';
                                                assignTest(selectedStudent.id, val);
                                                setSelectedStudent({ ...selectedStudent, testAssigned: val });
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>📝 Assign Test</option>
                                            <option value="english">🇬🇧 English</option>
                                            <option value="hindi">🇮🇳 Hindi</option>
                                            <option value="malayalam">🌴 Malayalam</option>
                                            <option value="math">🔢 Math</option>
                                        </select>
                                    )}

                                    <button
                                        className="btn-action secondary"
                                        onClick={() => { setModal('assign-task'); }}
                                    >
                                        📝 Add Manual Task
                                    </button>

                                    {selectedStudent.hasClass && (
                                        <button
                                            className="btn-action warning"
                                            onClick={() => {
                                                removeFromClass(selectedStudent.id);
                                                setSelectedStudent({ ...selectedStudent, hasClass: false, className: '', testAssigned: null });
                                            }}
                                        >
                                            🚫 Remove from Class
                                        </button>
                                    )}

                                    <button
                                        className="btn-action danger"
                                        onClick={() => removeStudent(selectedStudent.id)}
                                    >
                                        🗑️ Delete Student
                                    </button>
                                </div>

                                <button className="btn-close" onClick={() => setModal('none')}>✕</button>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Assign Task Modal */}
                    {modal === 'assign-task' && selectedStudent && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModal('none')}
                        >
                            <motion.div
                                className="modal-content"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <h2>📝 Assign Task to {selectedStudent.name}</h2>

                                <div className="form-group">
                                    <label>Task Description</label>
                                    <textarea
                                        placeholder="Practice reading fluency for 10 minutes daily..."
                                        value={newTaskText}
                                        onChange={e => setNewTaskText(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setModal('none')}>
                                        Cancel
                                    </button>
                                    <button
                                        className="btn-submit"
                                        onClick={() => {
                                            addManualTask(selectedStudent.id, newTaskText);
                                            setModal('view');
                                        }}
                                    >
                                        Assign Task
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

export default TeacherStudents;
