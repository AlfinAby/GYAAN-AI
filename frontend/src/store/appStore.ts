// State Management Store - Zustand (Clean Version)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  username: string;
  role: 'student' | 'teacher';
  section?: string;
  avatar?: string;
  isApproved?: boolean; // For students pending teacher approval
  classId?: string;
}

export interface Student extends User {
  xp: number;
  level: number;
  rageProgress: number;
  rageMeterMax: number;
  achievements: Achievement[];
  conceptsMastered: string[];
  hasCompletedAssessment: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Concept {
  id: string;
  name: string;
  category: 'reading' | 'math' | 'comprehension';
  status: 'mastered' | 'learning' | 'locked';
  prerequisites: string[];
  xpReward: number;
}

export interface Challenge {
  id: string;
  type: 'reading' | 'math';
  title: string;
  content: string;
  difficulty: 1 | 2 | 3;
  xpReward: number;
  timeLimit: number;
}

export interface Diagnosis {
  id: string;
  studentId: string;
  challengeId: string;
  type: 'reading' | 'math' | 'comprehension';
  transcript: string;
  analysis: string;
  conceptsIdentified: string[];
  gapsFound: string[];
  recommendations: string[];
  xpEarned: number;
  timeTaken: number;
  createdAt: string;
}

export interface RewardConfig {
  rageThreshold: number;
  rewardType: 'bonus_marks' | 'break_time' | 'special_badge' | 'custom';
  rewardValue: string;
  rewardDescription: string;
}

export interface PendingStudent {
  id: string;
  name: string;
  section: string;
  email: string;
  registeredAt: string;
}

// App State Interface
interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Student Data
  studentData: Student | null;

  // UI State
  isRageMode: boolean;
  isRecording: boolean;
  isLoading: boolean;
  currentTransition: 'frost' | 'fire' | null;

  // Data
  concepts: Concept[];
  currentChallenge: Challenge | null;
  diagnoses: Diagnosis[];

  // Teacher Data
  students: Student[];
  pendingStudents: PendingStudent[];
  rewardConfig: RewardConfig;

  // Actions
  login: (username: string, role: 'student' | 'teacher', userId?: string) => void;
  logout: () => void;
  setRageMode: (active: boolean) => void;
  setRecording: (recording: boolean) => void;
  setLoading: (loading: boolean) => void;
  setTransition: (type: 'frost' | 'fire' | null) => void;
  addXP: (amount: number) => void;
  setCurrentChallenge: (challenge: Challenge | null) => void;
  addDiagnosis: (diagnosis: Diagnosis) => void;
  updateConcept: (conceptId: string, status: Concept['status']) => void;
  setRewardConfig: (config: RewardConfig) => void;
  approveStudent: (studentId: string) => void;
  removeStudent: (studentId: string) => void;
  completeAssessment: (xpEarned: number) => void;
  refreshStudents: () => void;
}

// Empty concepts (all locked by default)
const initialConcepts: Concept[] = [
  { id: 'c1', name: 'Letter Recognition', category: 'reading', status: 'locked', prerequisites: [], xpReward: 50 },
  { id: 'c2', name: 'Word Formation', category: 'reading', status: 'locked', prerequisites: ['c1'], xpReward: 75 },
  { id: 'c3', name: 'Sentence Reading', category: 'reading', status: 'locked', prerequisites: ['c2'], xpReward: 100 },
  { id: 'c4', name: 'Paragraph Fluency', category: 'reading', status: 'locked', prerequisites: ['c3'], xpReward: 150 },
  { id: 'm1', name: 'Number Recognition', category: 'math', status: 'locked', prerequisites: [], xpReward: 50 },
  { id: 'm2', name: 'Counting', category: 'math', status: 'locked', prerequisites: ['m1'], xpReward: 75 },
  { id: 'm3', name: 'Addition', category: 'math', status: 'locked', prerequisites: ['m2'], xpReward: 100 },
  { id: 'm4', name: 'Subtraction', category: 'math', status: 'locked', prerequisites: ['m3'], xpReward: 125 },
];

// Helper to extract section from ID
const extractSection = (id: string): string => {
  // Student: PRC23CA001 -> CA (chars 5-7)
  // Teacher: PCE23CA001 -> CA (chars 5-7) - same pattern!
  if (id.startsWith('PRC') || id.startsWith('PCE')) {
    return id.length >= 7 ? id.substring(5, 7) : '';
  }
  return '';
};

// Create Store with Persistence
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State - ALL CLEAN, NO MOCK DATA
      user: null,
      isAuthenticated: false,
      studentData: null,
      isRageMode: false,
      isRecording: false,
      isLoading: false,
      currentTransition: null,
      concepts: initialConcepts,
      currentChallenge: null,
      diagnoses: [],
      students: [], // Empty - no mock students
      pendingStudents: [], // Pending students from registration
      rewardConfig: {
        rageThreshold: 500,
        rewardType: 'bonus_marks',
        rewardValue: '5',
        rewardDescription: '5 Bonus Marks'
      },

      // Actions
      login: (username, role, userId) => {
        const section = userId ? extractSection(userId) : '';

        const user: User = {
          id: userId || crypto.randomUUID(),
          username,
          role,
          section,
        };

        if (role === 'student') {
          // Check if this student exists in localStorage
          const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
          const savedUser = users[userId?.toUpperCase() || ''];

          // NEW STUDENTS START AT LEVEL 0
          const studentData: Student = {
            ...user,
            xp: 0,
            level: 0,
            rageProgress: 0,
            rageMeterMax: 500,
            achievements: [],
            conceptsMastered: [],
            isApproved: savedUser?.isApproved || false,
            hasCompletedAssessment: savedUser?.hasCompletedAssessment || false,
          };
          set({ user, isAuthenticated: true, studentData });
        } else {
          // Teacher login - load students from localStorage
          const allUsers = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
          const pending: PendingStudent[] = [];
          const approvedStudents: Student[] = [];

          // Find students with matching section
          Object.values(allUsers).forEach((u: any) => {
            if (u.role === 'student' && u.section === section) {
              if (!u.isApproved) {
                // Pending students
                pending.push({
                  id: u.id,
                  name: u.name,
                  section: u.section,
                  email: u.email,
                  registeredAt: u.createdAt
                });
              } else {
                // Already approved students - add to class
                approvedStudents.push({
                  id: u.id,
                  username: u.name,
                  role: 'student',
                  section: u.section,
                  xp: u.xp || 0,
                  level: u.level || 0,
                  rageProgress: 0,
                  rageMeterMax: 500,
                  achievements: [],
                  conceptsMastered: [],
                  isApproved: true,
                  hasCompletedAssessment: u.hasCompletedAssessment || false,
                });
              }
            }
          });

          set({ user, isAuthenticated: true, students: approvedStudents, pendingStudents: pending });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          studentData: null,
          students: [],
          pendingStudents: [],
          isRageMode: false
        });
      },

      setRageMode: (active) => set({ isRageMode: active }),
      setRecording: (recording) => set({ isRecording: recording }),
      setLoading: (loading) => set({ isLoading: loading }),
      setTransition: (type) => set({ currentTransition: type }),

      addXP: (amount) => {
        const { studentData, rewardConfig, user } = get();
        if (!studentData || !user) return;

        const newXP = studentData.xp + amount;
        const newRageProgress = studentData.rageProgress + amount;
        const rageActivated = newRageProgress >= rewardConfig.rageThreshold;
        const newLevel = Math.floor(newXP / 200) + 1;

        const updatedStudentData = {
          ...studentData,
          xp: newXP,
          level: newLevel,
          rageProgress: rageActivated ? newRageProgress % rewardConfig.rageThreshold : newRageProgress
        };

        // Save to localStorage for teacher sync
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        if (users[user.id]) {
          users[user.id].xp = newXP;
          users[user.id].level = newLevel;
          localStorage.setItem('gyaan_users', JSON.stringify(users));
        }

        set({
          studentData: updatedStudentData,
          isRageMode: rageActivated
        });
      },

      setCurrentChallenge: (challenge) => set({ currentChallenge: challenge }),

      addDiagnosis: (diagnosis) => {
        set((state) => ({
          diagnoses: [...state.diagnoses, diagnosis]
        }));
      },

      updateConcept: (conceptId, status) => {
        set((state) => ({
          concepts: state.concepts.map(c =>
            c.id === conceptId ? { ...c, status } : c
          )
        }));
      },

      setRewardConfig: (config) => set({ rewardConfig: config }),

      approveStudent: (studentId) => {
        // Get pending student info and users from localStorage
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        const pendingStudent = get().pendingStudents.find(s => s.id === studentId);

        if (users[studentId]) {
          users[studentId].isApproved = true;
          localStorage.setItem('gyaan_users', JSON.stringify(users));
        }

        // Create student object to add to class
        const newStudent: Student = {
          id: studentId,
          username: pendingStudent?.name || users[studentId]?.name || 'Student',
          role: 'student',
          section: pendingStudent?.section || users[studentId]?.section,
          xp: 0,
          level: 0,
          rageProgress: 0,
          rageMeterMax: 500,
          achievements: [],
          conceptsMastered: [],
          isApproved: true,
          hasCompletedAssessment: false,
        };

        // Add to students array and remove from pending
        set((state) => ({
          students: [...state.students, newStudent],
          pendingStudents: state.pendingStudents.filter(s => s.id !== studentId)
        }));
      },

      removeStudent: (studentId) => {
        // Update in localStorage - set isApproved back to false
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        if (users[studentId]) {
          users[studentId].isApproved = false;
          localStorage.setItem('gyaan_users', JSON.stringify(users));
        }

        // Remove from students array
        set((state) => ({
          students: state.students.filter(s => s.id !== studentId)
        }));
      },

      completeAssessment: (xpEarned: number) => {
        const { studentData, user } = get();
        if (!studentData || !user) return;

        const newXP = studentData.xp + xpEarned;
        const newLevel = Math.floor(newXP / 200) + 1;

        // Update localStorage for teacher sync
        const users = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        if (users[user.id]) {
          users[user.id].hasCompletedAssessment = true;
          users[user.id].xp = newXP;
          users[user.id].level = newLevel;
          localStorage.setItem('gyaan_users', JSON.stringify(users));
        }

        // Unlock first concepts and add XP
        set((state) => ({
          studentData: {
            ...studentData,
            hasCompletedAssessment: true,
            xp: newXP,
            level: newLevel
          },
          concepts: state.concepts.map(c =>
            c.id === 'c1' || c.id === 'm1' ? { ...c, status: 'learning' as const } : c
          )
        }));
      },

      // Refresh students list from localStorage (for teacher)
      refreshStudents: () => {
        const { user } = get();
        if (!user || user.role !== 'teacher') return;

        const allUsers = JSON.parse(localStorage.getItem('gyaan_users') || '{}');
        const section = user.section;
        const updatedStudents: Student[] = [];
        const updatedPending: PendingStudent[] = [];

        Object.values(allUsers).forEach((u: any) => {
          if (u.role === 'student' && u.section === section) {
            if (u.isApproved) {
              updatedStudents.push({
                id: u.id,
                username: u.name || u.id,
                role: 'student',
                section: u.section,
                xp: u.xp || 0,
                level: u.level || 0,
                rageProgress: 0,
                rageMeterMax: 500,
                achievements: [],
                conceptsMastered: [],
                isApproved: true,
                hasCompletedAssessment: u.hasCompletedAssessment || false,
              });
            } else {
              // Add to pending list
              updatedPending.push({
                id: u.id,
                name: u.name || u.id,
                section: u.section,
                email: u.email || '',
                registeredAt: u.createdAt || new Date().toISOString(),
              });
            }
          }
        });

        set({ students: updatedStudents, pendingStudents: updatedPending });
      }
    }),
    {
      name: 'gyaan-session',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        studentData: state.studentData,
        students: state.students,
        pendingStudents: state.pendingStudents,
        concepts: state.concepts
      }),
    }
  )
);
