// TeacherRewards - Professional Rewards Configuration
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../ui/Sidebar';
import './TeacherRewards.css';

interface Reward {
    id: string;
    name: string;
    description: string;
    xp: number;
    icon: string;
}

const defaultRewards: Reward[] = [
    { id: 'r1', name: 'Reading Champion', description: 'Complete 10 reading exercises', xp: 100, icon: '📖' },
    { id: 'r2', name: 'Math Wizard', description: 'Solve 50 math problems', xp: 150, icon: '🧮' },
    { id: 'r3', name: 'Perfect Score', description: 'Get 100% on any evaluation', xp: 200, icon: '⭐' },
    { id: 'r4', name: 'Streak Master', description: 'Practice 7 days in a row', xp: 75, icon: '🔥' },
    { id: 'r5', name: 'Quick Learner', description: 'Complete first evaluation', xp: 50, icon: '🚀' }
];

const TeacherRewards = () => {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);
    const [newReward, setNewReward] = useState({ name: '', description: '', xp: 50, icon: '🏆' });

    const iconOptions = ['🏆', '⭐', '📖', '🧮', '🔥', '🚀', '💎', '🎯', '🌟', '👑'];

    useEffect(() => {
        const saved = localStorage.getItem('gyaan_rewards');
        if (saved) {
            setRewards(JSON.parse(saved));
        } else {
            setRewards(defaultRewards);
            localStorage.setItem('gyaan_rewards', JSON.stringify(defaultRewards));
        }
    }, []);

    const saveRewards = (updatedRewards: Reward[]) => {
        setRewards(updatedRewards);
        localStorage.setItem('gyaan_rewards', JSON.stringify(updatedRewards));
    };

    const addReward = () => {
        if (!newReward.name) return;
        const newId = `reward-${Date.now()}`;
        const updated = [...rewards, { ...newReward, id: newId }];
        saveRewards(updated);
        setNewReward({ name: '', description: '', xp: 50, icon: '🏆' });
        setShowAddModal(false);
    };

    const updateReward = () => {
        if (!editingReward) return;
        const updated = rewards.map(r => r.id === editingReward.id ? editingReward : r);
        saveRewards(updated);
        setEditingReward(null);
    };

    const deleteReward = (id: string) => {
        if (!confirm('Delete this reward?')) return;
        const updated = rewards.filter(r => r.id !== id);
        saveRewards(updated);
    };

    return (
        <div className="premium-dashboard">
            <Sidebar role="teacher" />

            <main className="premium-main">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left">
                        <h1>🏆 Reward Configuration</h1>
                        <p>Configure badges and achievements for students</p>
                    </div>
                    <button className="btn-add-reward" onClick={() => setShowAddModal(true)}>
                        <span>+</span> Add Reward
                    </button>
                </div>

                {/* Rewards Grid */}
                <div className="rewards-grid">
                    {rewards.map((reward, idx) => (
                        <motion.div
                            key={reward.id}
                            className="reward-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <div className="reward-icon">{reward.icon}</div>
                            <div className="reward-content">
                                <h3>{reward.name}</h3>
                                <p>{reward.description}</p>
                                <span className="reward-xp">+{reward.xp} XP</span>
                            </div>
                            <div className="reward-actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => setEditingReward(reward)}
                                >
                                    ✏️
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => deleteReward(reward.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Add/Edit Modal */}
                <AnimatePresence>
                    {(showAddModal || editingReward) && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowAddModal(false); setEditingReward(null); }}
                        >
                            <motion.div
                                className="modal-content"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <h2>{editingReward ? '✏️ Edit Reward' : '➕ Add Reward'}</h2>

                                <div className="form-group">
                                    <label>Icon</label>
                                    <div className="icon-picker">
                                        {iconOptions.map(icon => (
                                            <button
                                                key={icon}
                                                className={`icon-option ${(editingReward?.icon || newReward.icon) === icon ? 'selected' : ''}`}
                                                onClick={() => editingReward
                                                    ? setEditingReward({ ...editingReward, icon })
                                                    : setNewReward({ ...newReward, icon })
                                                }
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Reward Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Star Reader"
                                        value={editingReward?.name || newReward.name}
                                        onChange={e => editingReward
                                            ? setEditingReward({ ...editingReward, name: e.target.value })
                                            : setNewReward({ ...newReward, name: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        placeholder="Complete 5 reading challenges"
                                        value={editingReward?.description || newReward.description}
                                        onChange={e => editingReward
                                            ? setEditingReward({ ...editingReward, description: e.target.value })
                                            : setNewReward({ ...newReward, description: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>XP Points</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="500"
                                        step="10"
                                        value={editingReward?.xp || newReward.xp}
                                        onChange={e => editingReward
                                            ? setEditingReward({ ...editingReward, xp: parseInt(e.target.value) })
                                            : setNewReward({ ...newReward, xp: parseInt(e.target.value) })
                                        }
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => { setShowAddModal(false); setEditingReward(null); }}>
                                        Cancel
                                    </button>
                                    <button className="btn-submit" onClick={editingReward ? updateReward : addReward}>
                                        {editingReward ? 'Save Changes' : 'Add Reward'}
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

export default TeacherRewards;
