// ProgressMap - Individual Student Progress Chart Component
import { motion } from 'framer-motion';
import './ProgressMap.css';

interface SkillScore {
    skill: string;
    score: number;
    icon: string;
}

interface ProgressMapProps {
    scores: SkillScore[];
    overall: number;
    studentName: string;
}

const ProgressMap = ({ scores, overall, studentName }: ProgressMapProps) => {
    const getScoreColor = (score: number) => {
        if (score >= 70) return '#22c55e';
        if (score >= 50) return '#eab308';
        return '#ef4444';
    };

    const getGrade = (score: number) => {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    };

    // Calculate radar chart points
    const numSkills = scores.length || 5;
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;

    const getRadarPoints = (scoreValues: number[]) => {
        return scoreValues.map((score, i) => {
            const angle = (Math.PI * 2 * i) / numSkills - Math.PI / 2;
            const radius = (score / 100) * maxRadius;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
    };

    const getGridPoints = (level: number) => {
        return Array.from({ length: numSkills }, (_, i) => {
            const angle = (Math.PI * 2 * i) / numSkills - Math.PI / 2;
            const radius = (level / 100) * maxRadius;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
    };

    const skillScoreValues = scores.map(s => s.score);

    return (
        <motion.div
            className="progress-map"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="map-header">
                <h3>📊 Progress Map</h3>
                <span className="student-label">{studentName}</span>
            </div>

            <div className="map-content">
                {/* Radar Chart */}
                <div className="radar-container">
                    <svg viewBox="0 0 300 300" className="radar-chart">
                        {/* Grid lines */}
                        {[25, 50, 75, 100].map(level => (
                            <polygon
                                key={level}
                                points={getGridPoints(level)}
                                className="radar-grid"
                                style={{ opacity: level / 150 }}
                            />
                        ))}

                        {/* Axis lines */}
                        {scores.map((_, i) => {
                            const angle = (Math.PI * 2 * i) / numSkills - Math.PI / 2;
                            const x2 = centerX + maxRadius * Math.cos(angle);
                            const y2 = centerY + maxRadius * Math.sin(angle);
                            return (
                                <line
                                    key={i}
                                    x1={centerX}
                                    y1={centerY}
                                    x2={x2}
                                    y2={y2}
                                    className="radar-axis"
                                />
                            );
                        })}

                        {/* Data polygon */}
                        <motion.polygon
                            points={getRadarPoints(skillScoreValues)}
                            className="radar-data"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{ fill: `${getScoreColor(overall)}33`, stroke: getScoreColor(overall) }}
                        />

                        {/* Skill labels */}
                        {scores.map((skill, i) => {
                            const angle = (Math.PI * 2 * i) / numSkills - Math.PI / 2;
                            const labelRadius = maxRadius + 25;
                            const x = centerX + labelRadius * Math.cos(angle);
                            const y = centerY + labelRadius * Math.sin(angle);
                            return (
                                <g key={i}>
                                    <text
                                        x={x}
                                        y={y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="radar-label"
                                    >
                                        {skill.icon}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Center score */}
                        <text
                            x={centerX}
                            y={centerY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="radar-center-score"
                            fill={getScoreColor(overall)}
                        >
                            {overall}%
                        </text>
                    </svg>
                </div>

                {/* Skill Bars */}
                <div className="skill-bars">
                    {scores.map((skill, idx) => (
                        <div key={idx} className="skill-bar-item">
                            <div className="skill-bar-header">
                                <span className="skill-icon">{skill.icon}</span>
                                <span className="skill-name">{skill.skill}</span>
                                <span
                                    className="skill-grade"
                                    style={{ color: getScoreColor(skill.score) }}
                                >
                                    {getGrade(skill.score)}
                                </span>
                            </div>
                            <div className="skill-bar-track">
                                <motion.div
                                    className="skill-bar-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${skill.score}%` }}
                                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
                                    style={{ background: getScoreColor(skill.score) }}
                                />
                            </div>
                            <span
                                className="skill-score-value"
                                style={{ color: getScoreColor(skill.score) }}
                            >
                                {skill.score}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overall Summary */}
            <div className="overall-summary">
                <div className="overall-grade" style={{ borderColor: getScoreColor(overall) }}>
                    <span className="grade-letter" style={{ color: getScoreColor(overall) }}>
                        {getGrade(overall)}
                    </span>
                    <span className="grade-label">Overall Grade</span>
                </div>
                <div className="overall-score-bar">
                    <span className="score-label">Overall Progress</span>
                    <div className="score-track">
                        <motion.div
                            className="score-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${overall}%` }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            style={{ background: `linear-gradient(90deg, ${getScoreColor(overall)}, ${getScoreColor(overall)}aa)` }}
                        />
                    </div>
                    <span className="score-value" style={{ color: getScoreColor(overall) }}>{overall}%</span>
                </div>
            </div>
        </motion.div>
    );
};

export default ProgressMap;
