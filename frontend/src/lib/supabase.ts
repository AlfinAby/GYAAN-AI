// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
// NOTE: These are from Supabase project - update with your own
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database types
export interface DbUser {
    id: string;
    username: string;
    name: string;
    email: string;
    role: 'student' | 'teacher';
    section: string;
    is_approved: boolean;
    has_class: boolean;
    class_name: string;
    test_assigned: 'english' | 'hindi' | 'malayalam' | 'math' | null;
    is_late: boolean;
    manual_tasks: string[];
    created_at: string;
}

export interface DbEvaluation {
    id: string;
    user_id: string;
    overall: number;
    language: string;
    scores: Array<{ skill: string; score: number; feedback: string; icon: string }>;
    weaknesses: string[];
    tasks: string[];
    created_at: string;
}

// Helper functions
export const dbHelpers = {
    // Get all students
    async getStudents() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'student');
        return { data, error };
    },

    // Get student by ID
    async getStudent(id: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        return { data, error };
    },

    // Update student
    async updateStudent(id: string, updates: Partial<DbUser>) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select();
        return { data, error };
    },

    // Approve student
    async approveStudent(id: string) {
        return this.updateStudent(id, { is_approved: true });
    },

    // Assign class
    async assignClass(id: string, className: string) {
        return this.updateStudent(id, { has_class: true, class_name: className });
    },

    // Assign test
    async assignTest(id: string, testType: 'english' | 'hindi' | 'malayalam' | 'math') {
        return this.updateStudent(id, { test_assigned: testType });
    },

    // Mark late
    async toggleLate(id: string, isLate: boolean) {
        return this.updateStudent(id, { is_late: isLate });
    },

    // Add manual task
    async addManualTask(id: string, task: string) {
        const { data: user } = await this.getStudent(id);
        if (user) {
            const tasks = user.manual_tasks || [];
            tasks.push(task);
            return this.updateStudent(id, { manual_tasks: tasks });
        }
        return { error: 'User not found' };
    },

    // Get evaluation
    async getEvaluation(userId: string) {
        const { data, error } = await supabase
            .from('evaluations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        return { data, error };
    },

    // Save evaluation
    async saveEvaluation(evaluation: Omit<DbEvaluation, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('evaluations')
            .insert(evaluation)
            .select();
        return { data, error };
    }
};

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    return SUPABASE_URL !== 'https://your-project.supabase.co' &&
        SUPABASE_ANON_KEY !== 'your-anon-key';
};
