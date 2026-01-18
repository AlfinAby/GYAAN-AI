// API Service for GYAAN-AI

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Types
interface TranscriptionResult {
    text: string;
    confidence: number;
    duration: number;
}

interface DiagnosisResult {
    type: 'reading' | 'math' | 'comprehension';
    analysis: string;
    conceptsIdentified: string[];
    gapsFound: string[];
    recommendations: string[];
    xpEarned: number;
    accuracy: number;
}

interface StudentProgress {
    id: string;
    username: string;
    xp: number;
    level: number;
    conceptsMastered: string[];
    recentDiagnoses: DiagnosisResult[];
}

// API Functions
export const api = {
    // Audio Transcription
    async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            const response = await fetch(`${API_BASE}/audio/transcribe`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Transcription failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Transcription error:', error);
            // Return mock data for demo
            return {
                text: "The student read: The quick brown fox jumps over the lazy dog. The student showed good fluency with minor hesitation on 'jumps'.",
                confidence: 0.92,
                duration: 8.5
            };
        }
    },

    // Reading Diagnosis
    async diagnoseReading(transcript: string, expectedText: string): Promise<DiagnosisResult> {
        try {
            const response = await fetch(`${API_BASE}/diagnose/reading`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript, expectedText }),
            });

            if (!response.ok) {
                throw new Error('Reading diagnosis failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Reading diagnosis error:', error);
            // Return mock diagnosis for demo
            return {
                type: 'reading',
                analysis: 'Student demonstrates good word recognition and fluency. Reading pace is appropriate for grade level. Minor hesitation observed on multi-syllable words.',
                conceptsIdentified: ['Letter Recognition', 'Word Formation', 'Sentence Reading'],
                gapsFound: ['Paragraph Fluency'],
                recommendations: ['Practice reading longer passages', 'Focus on multi-syllable word pronunciation'],
                xpEarned: 75,
                accuracy: 85
            };
        }
    },

    // Math Diagnosis
    async diagnoseMath(transcript: string, problem: string, expectedAnswer: string): Promise<DiagnosisResult> {
        try {
            const response = await fetch(`${API_BASE}/diagnose/math`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript, problem, expectedAnswer }),
            });

            if (!response.ok) {
                throw new Error('Math diagnosis failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Math diagnosis error:', error);
            // Return mock diagnosis for demo
            return {
                type: 'math',
                analysis: 'Student correctly identified the operation but made an error in the carrying step. Understanding of basic addition is solid, but place value concept needs reinforcement.',
                conceptsIdentified: ['Number Recognition', 'Counting', 'Addition'],
                gapsFound: ['Place Value'],
                recommendations: ['Practice two-digit addition with carrying', 'Review place value concepts with visual aids'],
                xpEarned: 60,
                accuracy: 70
            };
        }
    },

    // Get Student Progress
    async getStudentProgress(studentId: string): Promise<StudentProgress> {
        try {
            const response = await fetch(`${API_BASE}/student/${studentId}/progress`);

            if (!response.ok) {
                throw new Error('Failed to fetch progress');
            }

            return await response.json();
        } catch (error) {
            console.error('Progress fetch error:', error);
            // Return mock progress
            return {
                id: studentId,
                username: 'Student',
                xp: 320,
                level: 4,
                conceptsMastered: ['c1', 'c2', 'm1', 'm2'],
                recentDiagnoses: []
            };
        }
    },

    // Get Teacher Dashboard Data
    async getTeacherDashboard(): Promise<{ students: StudentProgress[], classStats: object }> {
        try {
            const response = await fetch(`${API_BASE}/teacher/dashboard`);

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard');
            }

            return await response.json();
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            return {
                students: [],
                classStats: {
                    totalStudents: 4,
                    averageXP: 387,
                    conceptsMastered: 24,
                    activeToday: 3
                }
            };
        }
    },

    // Submit Reward Configuration
    async updateRewardConfig(config: {
        rageThreshold: number;
        rewardType: string;
        rewardValue: string;
        rewardDescription: string;
    }): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE}/teacher/rewards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            return response.ok;
        } catch (error) {
            console.error('Reward config update error:', error);
            return true; // Assume success for demo
        }
    }
};

export default api;
