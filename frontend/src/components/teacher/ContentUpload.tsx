// ContentUpload - Professional Content Management
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../ui/Sidebar';
import './ContentUpload.css';

interface Content {
    id: string;
    title: string;
    type: 'textbook' | 'topic' | 'video';
    subject: string;
    createdAt: string;
    status: 'ready' | 'processing';
}

const ContentUpload = () => {
    const [contents, setContents] = useState<Content[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newContent, setNewContent] = useState({
        title: '',
        type: 'textbook' as 'textbook' | 'topic' | 'video',
        subject: 'english'
    });

    useEffect(() => {
        const saved = localStorage.getItem('gyaan_content');
        if (saved) {
            setContents(JSON.parse(saved));
        } else {
            const defaults = [
                { id: 'c1', title: 'Class 2 English - Unit 1', type: 'textbook', subject: 'Reading', createdAt: '2024-01-15', status: 'ready' },
                { id: 'c2', title: 'Addition Practice', type: 'topic', subject: 'Math', createdAt: '2024-01-14', status: 'ready' }
            ];
            setContents(defaults as any);
            localStorage.setItem('gyaan_content', JSON.stringify(defaults));
        }
    }, []);

    const addContent = () => {
        if (!newContent.title) return;

        const saved = JSON.parse(localStorage.getItem('gyaan_content') || '[]');
        const newItem = {
            id: `content-${Date.now()}`,
            title: newContent.title,
            type: newContent.type,
            subject: newContent.subject,
            createdAt: new Date().toISOString().split('T')[0],
            status: 'ready'
        };
        saved.push(newItem);
        localStorage.setItem('gyaan_content', JSON.stringify(saved));
        setContents(saved);
        setNewContent({ title: '', type: 'textbook', subject: 'english' });
        setShowAddModal(false);
    };

    const deleteContent = (id: string) => {
        if (!confirm('Delete this content?')) return;
        const saved = JSON.parse(localStorage.getItem('gyaan_content') || '[]');
        const filtered = saved.filter((c: any) => c.id !== id);
        localStorage.setItem('gyaan_content', JSON.stringify(filtered));
        setContents(filtered);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'textbook': return '📚';
            case 'topic': return '📝';
            case 'video': return '🎬';
            default: return '📄';
        }
    };

    return (
        <div className="premium-dashboard">
            <Sidebar role="teacher" />

            <main className="premium-main">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left">
                        <h1>📚 Curriculum Content</h1>
                        <p>Upload textbooks and topics for AI to verify student progress</p>
                    </div>
                    <button className="btn-add-content" onClick={() => setShowAddModal(true)}>
                        <span>+</span> Add Content
                    </button>
                </div>

                {/* Content List */}
                <div className="content-list">
                    {contents.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📚</span>
                            <h3>No content uploaded</h3>
                            <p>Add textbooks and topics for students to learn from</p>
                        </div>
                    ) : (
                        contents.map((content, idx) => (
                            <motion.div
                                key={content.id}
                                className="content-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="content-icon">
                                    {getTypeIcon(content.type)}
                                </div>

                                <div className="content-info">
                                    <h3>{content.title}</h3>
                                    <div className="content-meta">
                                        <span className="meta-tag">{content.type}</span>
                                        <span className="meta-tag subject">{content.subject}</span>
                                        <span className="meta-date">📅 {content.createdAt}</span>
                                    </div>
                                </div>

                                <span className={`content-status ${content.status}`}>
                                    {content.status === 'ready' ? '✓ Ready' : '⏳ Processing'}
                                </span>

                                <button
                                    className="btn-delete-content"
                                    onClick={() => deleteContent(content.id)}
                                >
                                    ✕
                                </button>
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
                                <h2>➕ Add Content</h2>

                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Class 3 English - Chapter 5"
                                        value={newContent.title}
                                        onChange={e => setNewContent({ ...newContent, title: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select
                                            value={newContent.type}
                                            onChange={e => setNewContent({ ...newContent, type: e.target.value as any })}
                                        >
                                            <option value="textbook">📚 Textbook</option>
                                            <option value="topic">📝 Topic</option>
                                            <option value="video">🎬 Video</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Subject</label>
                                        <select
                                            value={newContent.subject}
                                            onChange={e => setNewContent({ ...newContent, subject: e.target.value })}
                                        >
                                            <option value="english">English</option>
                                            <option value="hindi">Hindi</option>
                                            <option value="malayalam">Malayalam</option>
                                            <option value="math">Math</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button className="btn-submit" onClick={addContent}>
                                        Add Content
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

export default ContentUpload;
