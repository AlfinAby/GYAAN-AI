// Sidebar Component - Premium Modern Design
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import './Sidebar.css';

interface SidebarProps {
    role: 'student' | 'teacher';
}

const Sidebar = ({ role }: SidebarProps) => {
    const navigate = useNavigate();
    const { user, logout } = useAppStore();

    const studentLinks = [
        { path: '/student', icon: '🏠', label: 'Home' },
        { path: '/student/evaluate', icon: '📊', label: 'Evaluation' },
        { path: '/student/learn', icon: '📚', label: 'Learn' },
        { path: '/student/reading', icon: '🎤', label: 'Reading' },
        { path: '/student/math', icon: '🔢', label: 'Math' },
    ];

    const teacherLinks = [
        { path: '/teacher', icon: '📊', label: 'Dashboard' },
        { path: '/teacher/classes', icon: '🏫', label: 'Classes' },
        { path: '/teacher/students', icon: '👥', label: 'Students' },
        { path: '/teacher/content', icon: '📝', label: 'Content' },
        { path: '/teacher/assignments', icon: '📋', label: 'Assignments' },
        { path: '/teacher/rewards', icon: '🏆', label: 'Rewards' },
        { path: '/teacher/analytics', icon: '📈', label: 'Analytics' },
        { path: '/teacher/settings', icon: '⚙️', label: 'Settings' },
    ];

    const links = role === 'student' ? studentLinks : teacherLinks;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="premium-sidebar">
            {/* Logo */}
            <div className="sidebar-brand">
                <div className="brand-icon">
                    <span>G</span>
                </div>
                <span className="brand-name">GYAAN-AI</span>
            </div>

            {/* Navigation */}
            <nav className="sidebar-navigation">
                {links.map((link, index) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.path === '/student' || link.path === '/teacher'}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <motion.div
                            className="link-inner"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <span className="link-icon">{link.icon}</span>
                            <span className="link-label">{link.label}</span>
                        </motion.div>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile */}
            <div className="sidebar-user">
                <div className="user-profile">
                    <div className="profile-avatar">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="profile-info">
                        <span className="profile-name">{user?.username || 'User'}</span>
                        <span className="profile-id">{user?.id || 'ID'}</span>
                    </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
