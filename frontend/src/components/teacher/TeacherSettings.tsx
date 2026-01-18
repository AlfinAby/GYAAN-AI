// Teacher Settings Page
import { useState } from 'react';
import Sidebar from '../ui/Sidebar';
import { useAppStore } from '../../store/appStore';
import '../teacher/TeacherDashboard.css';

const TeacherSettings = () => {
    const { user } = useAppStore();
    const [rageModeEnabled, setRageModeEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    return (
        <div className="app-layout">
            <Sidebar role="teacher" />
            <main className="main-content teacher-main">
                <header className="dashboard-header">
                    <h1 className="page-title">Settings</h1>
                </header>

                <section className="content-section">
                    <div className="settings-container">
                        <div className="settings-card">
                            <h3>Profile</h3>
                            <div className="setting-row">
                                <label>Name</label>
                                <input type="text" className="input" defaultValue={user?.username || 'Teacher'} />
                            </div>
                            <div className="setting-row">
                                <label>Academy</label>
                                <input type="text" className="input" defaultValue="Midgard Academy" />
                            </div>
                            <div className="setting-row">
                                <label>ID</label>
                                <input type="text" className="input" value={user?.id || ''} disabled />
                            </div>
                        </div>

                        <div className="settings-card">
                            <h3>Preferences</h3>
                            <div className="setting-row toggle-row">
                                <label>Rage Mode (Students)</label>
                                <button
                                    className={`toggle-btn ${rageModeEnabled ? 'on' : 'off'}`}
                                    onClick={() => setRageModeEnabled(!rageModeEnabled)}
                                >
                                    {rageModeEnabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <div className="setting-row toggle-row">
                                <label>Notifications</label>
                                <button
                                    className={`toggle-btn ${notificationsEnabled ? 'on' : 'off'}`}
                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                >
                                    {notificationsEnabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                        </div>

                        <div className="settings-card">
                            <h3>Account</h3>
                            <button className="btn-outline" style={{ marginBottom: 12 }}>
                                Change Password
                            </button>
                            <button className="btn-outline" style={{ color: '#e05050' }}>
                                Delete Account
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default TeacherSettings;
