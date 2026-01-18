// TeacherAnalytics - Professional Analytics Dashboard
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../ui/Sidebar';
import './TeacherAnalytics.css';

interface SkillAverage {
    skill: string;
    icon: string;
    avg: number;
}

const TeacherAnalytics = () => {
    const [totalStudents, setTotalStudents] = useState(0);
    const [evaluatedStudents, setEvaluatedStudents] = useState(0);
    const [avgScore, setAvgScore] = useState(0);
    const [skillAverages, setSkillAverages] = useState<SkillAverage[]>([]);
    const [topPerformers, setTopPerformers] = useState<any[]>([]);
    const [needsHelp, setNeedsHelp] = useState<any[]>([]);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = () => {
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        const evaluations = JSON.parse(localStorage.getItem('gyaan_evaluations') || '{}');

        let studentCount = 0;
        let evalCount = 0;
        let totalScore = 0;
        const skillTotals: Record<string, { total: number; count: number; icon: string }> = {};
        const studentsWithScores: any[] = [];

        Object.values(users).forEach((u: any) => {
            if (u.role === 'student' && u.isApproved) {
                studentCount++;

                const eval_ = evaluations[u.id];
                if (eval_) {
                    evalCount++;
                    totalScore += eval_.overall;

                    studentsWithScores.push({
                        id: u.id,
                        name: u.name || u.username || u.id,
                        score: eval_.overall,
                        className: u.className || 'No class'
                    });

                    // Aggregate skill scores
                    if (eval_.scores) {
                        eval_.scores.forEach((s: any) => {
                            if (!skillTotals[s.skill]) {
                                skillTotals[s.skill] = { total: 0, count: 0, icon: s.icon };
                            }
                            skillTotals[s.skill].total += s.score;
                            skillTotals[s.skill].count++;
                        });
                    }
                }
            }
        });

        setTotalStudents(studentCount);
        setEvaluatedStudents(evalCount);
        setAvgScore(evalCount > 0 ? Math.round(totalScore / evalCount) : 0);

        // Calculate skill averages
        const skills: SkillAverage[] = Object.entries(skillTotals).map(([skill, data]) => ({
            skill,
            icon: data.icon,
            avg: Math.round(data.total / data.count)
        }));
        setSkillAverages(skills);

        // Sort students by score
        studentsWithScores.sort((a, b) => b.score - a.score);
        setTopPerformers(studentsWithScores.slice(0, 5));
        setNeedsHelp(studentsWithScores.filter(s => s.score < 50).slice(0, 5));
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#22c55e';
        if (score >= 50) return '#eab308';
        return '#ef4444';
    };

    return (
        <div className="premium-dashboard">
            <Sidebar role="teacher" />

            <main className="premium-main">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left">
                        <h1>📈 Analytics Dashboard</h1>
                        <p>Track student performance and class progress</p>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="analytics-stats">
                    <motion.div
                        className="analytics-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="stat-icon purple">👥</div>
                        <div className="stat-content">
                            <span className="stat-number">{totalStudents}</span>
                            <span className="stat-label">Total Students</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="analytics-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="stat-icon green">✅</div>
                        <div className="stat-content">
                            <span className="stat-number">{evaluatedStudents}</span>
                            <span className="stat-label">Evaluated</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="analytics-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="stat-icon blue">📊</div>
                        <div className="stat-content">
                            <span className="stat-number" style={{ color: getScoreColor(avgScore) }}>
                                {avgScore}%
                            </span>
                            <span className="stat-label">Average Score</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="analytics-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="stat-icon orange">📝</div>
                        <div className="stat-content">
                            <span className="stat-number">
                                {totalStudents > 0 ? Math.round((evaluatedStudents / totalStudents) * 100) : 0}%
                            </span>
                            <span className="stat-label">Completion Rate</span>
                        </div>
                    </motion.div>
                </div>

                <div className="analytics-grid">
                    {/* Skill Breakdown */}
                    <motion.div
                        className="analytics-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3>📊 Class Skill Averages</h3>
                        {skillAverages.length > 0 ? (
                            <div className="skill-bars">
                                {skillAverages.map((skill, idx) => (
                                    <div key={idx} className="skill-bar-row">
                                        <span className="skill-bar-icon">{skill.icon}</span>
                                        <span className="skill-bar-name">{skill.skill}</span>
                                        <div className="skill-bar-track">
                                            <motion.div
                                                className="skill-bar-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skill.avg}%` }}
                                                transition={{ delay: 0.5 + idx * 0.1 }}
                                                style={{ background: getScoreColor(skill.avg) }}
                                            ></motion.div>
                                        </div>
                                        <span className="skill-bar-value" style={{ color: getScoreColor(skill.avg) }}>
                                            {skill.avg}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-analytics">
                                <span>📭</span>
                                <p>No evaluation data yet</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Top Performers */}
                    <motion.div
                        className="analytics-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3>🏆 Top Performers</h3>
                        {topPerformers.length > 0 ? (
                            <div className="performer-list">
                                {topPerformers.map((student, idx) => (
                                    <div key={student.id} className="performer-row">
                                        <span className="performer-rank">#{idx + 1}</span>
                                        <div className="performer-avatar" style={{ background: `linear-gradient(135deg, ${getScoreColor(student.score)}, ${getScoreColor(student.score)}aa)` }}>
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="performer-info">
                                            <span className="performer-name">{student.name}</span>
                                            <span className="performer-class">{student.className}</span>
                                        </div>
                                        <span className="performer-score" style={{ color: getScoreColor(student.score) }}>
                                            {student.score}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-analytics">
                                <span>📭</span>
                                <p>No students evaluated yet</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Needs Attention */}
                    <motion.div
                        className="analytics-card attention"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h3>⚠️ Needs Attention</h3>
                        {needsHelp.length > 0 ? (
                            <div className="attention-list">
                                {needsHelp.map((student) => (
                                    <div key={student.id} className="attention-row">
                                        <div className="attention-avatar">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="attention-info">
                                            <span className="attention-name">{student.name}</span>
                                            <span className="attention-score" style={{ color: getScoreColor(student.score) }}>
                                                Score: {student.score}%
                                            </span>
                                        </div>
                                        <button className="btn-help">Help</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-analytics success">
                                <span>✅</span>
                                <p>All students scoring above 50%!</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default TeacherAnalytics;
