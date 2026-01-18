// TeacherAssignments - Professional Assignments Management
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../ui/Sidebar';
import './TeacherAssignments.css';

interface Assignment {
    id: string;
    title: string;
    type: 'reading' | 'math' | 'evaluation';
    dueDate: string;
    className: string;
    totalStudents: number;
    submitted: number;
}

const TeacherAssignments = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        type: 'reading' as 'reading' | 'math' | 'evaluation',
        dueDate: '',
        className: ''
    });

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = () => {
        const saved = JSON.parse(localStorage.getItem('gyaan_assignments') || '[]');
        setAssignments(saved);
    };

    const addAssignment = () => {
        if (!newAssignment.title || !newAssignment.dueDate) return;

        const saved = JSON.parse(localStorage.getItem('gyaan_assignments') || '[]');
        const newId = `assignment-${Date.now()}`;

        saved.push({
            id: newId,
            title: newAssignment.title,
            type: newAssignment.type,
            dueDate: newAssignment.dueDate,
            className: newAssignment.className || 'All Students',
            totalStudents: 30,
            submitted: 0
        });

        localStorage.setItem('gyaan_assignments', JSON.stringify(saved));
        setNewAssignment({ title: '', type: 'reading', dueDate: '', className: '' });
        setShowAddModal(false);
        loadAssignments();
    };

    const deleteAssignment = (id: string) => {
        if (!confirm('Delete this assignment?')) return;
        const saved = JSON.parse(localStorage.getItem('gyaan_assignments') || '[]');
        const filtered = saved.filter((a: any) => a.id !== id);
        localStorage.setItem('gyaan_assignments', JSON.stringify(filtered));
        loadAssignments();
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'reading': return '📖';
            case 'math': return '🔢';
            case 'evaluation': return '📝';
            default: return '📋';
        }
    };

    const getProgress = (submitted: number, total: number) => {
        return total > 0 ? Math.round((submitted / total) * 100) : 0;
    };

    return (
        <div className="premium-dashboard">
            <Sidebar role="teacher" />

            <main className="premium-main">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left">
                        <h1>📋 Assignments</h1>
                        <p>Create and manage student assignments</p>
                    </div>
                    <button className="btn-add-assignment" onClick={() => setShowAddModal(true)}>
                        <span>+</span> Create Assignment
                    </button>
                </div>

                {/* Assignments List */}
                <div className="assignments-list">
                    {assignments.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📋</span>
                            <h3>No assignments yet</h3>
                            <p>Create your first assignment to get started</p>
                        </div>
                    ) : (
                        assignments.map((assignment, idx) => (
                            <motion.div
                                key={assignment.id}
                                className="assignment-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="assignment-icon">
                                    {getTypeIcon(assignment.type)}
                                </div>

                                <div className="assignment-info">
                                    <h3>{assignment.title}</h3>
                                    <div className="assignment-meta">
                                        <span className="meta-tag type">{assignment.type}</span>
                                        <span className="meta-tag class">📚 {assignment.className}</span>
                                        <span className="meta-tag date">📅 Due: {assignment.dueDate}</span>
                                    </div>
                                </div>

                                <div className="assignment-progress">
                                    <div className="progress-text">
                                        <span className="submitted">{assignment.submitted}/{assignment.totalStudents}</span>
                                        <span className="label">submitted</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${getProgress(assignment.submitted, assignment.totalStudents)}%`,
                                                background: getProgress(assignment.submitted, assignment.totalStudents) >= 70
                                                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                                    : 'linear-gradient(135deg, #eab308, #ca8a04)'
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="assignment-actions">
                                    <button className="btn-view-submissions">
                                        View Submissions
                                    </button>
                                    <button
                                        className="btn-delete-assignment"
                                        onClick={() => deleteAssignment(assignment.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Add Modal */}
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
                                <h2>➕ Create Assignment</h2>

                                <div className="form-group">
                                    <label>Assignment Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Reading Practice - Chapter 3"
                                        value={newAssignment.title}
                                        onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select
                                            value={newAssignment.type}
                                            onChange={e => setNewAssignment({ ...newAssignment, type: e.target.value as any })}
                                        >
                                            <option value="reading">📖 Reading</option>
                                            <option value="math">🔢 Math</option>
                                            <option value="evaluation">📝 Evaluation</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Due Date *</label>
                                        <input
                                            type="date"
                                            value={newAssignment.dueDate}
                                            onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Assign To</label>
                                    <select
                                        value={newAssignment.className}
                                        onChange={e => setNewAssignment({ ...newAssignment, className: e.target.value })}
                                    >
                                        <option value="">All Students</option>
                                        <option value="Class 1A">Class 1A</option>
                                        <option value="Class 2B">Class 2B</option>
                                        <option value="Class 3C">Class 3C</option>
                                        <option value="Class 4D">Class 4D</option>
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button className="btn-submit" onClick={addAssignment}>
                                        Create Assignment
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

export default TeacherAssignments;
