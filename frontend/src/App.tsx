// Main App Component
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/appStore';
import { RageModeOverlay } from './components/ui/Transitions';

// Import pages
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import StudentHome from './components/student/StudentHome';
import ReadingChallenge from './components/student/ReadingChallenge';
import MathChallenge from './components/student/MathChallenge';
import LearningLesson from './components/student/LearningLesson';
import StudentEvaluation from './components/student/StudentEvaluation';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherClasses from './components/teacher/TeacherClasses';
import TeacherStudents from './components/teacher/TeacherStudents';
import ContentUpload from './components/teacher/ContentUpload';
import TeacherAssignments from './components/teacher/TeacherAssignments';
import TeacherRewards from './components/teacher/TeacherRewards';
import TeacherAnalytics from './components/teacher/TeacherAnalytics';
import TeacherSettings from './components/teacher/TeacherSettings';

// Import styles
import './styles/theme.css';
import './styles/animations.css';

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRole
}: {
  children: React.ReactNode;
  allowedRole?: 'student' | 'teacher';
}) => {
  const { isAuthenticated, user } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { isRageMode, setRageMode } = useAppStore();

  const handleClaimReward = () => {
    setRageMode(false);
    alert(`🎉 Congratulations! You've earned your reward!\n\nYour rage meter has been reset. Keep going to earn more rewards!`);
  };

  return (
    <Router>
      <div className={`app ${isRageMode ? 'rage-mode' : ''}`}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/reading"
              element={
                <ProtectedRoute allowedRole="student">
                  <ReadingChallenge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/math"
              element={
                <ProtectedRoute allowedRole="student">
                  <MathChallenge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/learn"
              element={
                <ProtectedRoute allowedRole="student">
                  <LearningLesson />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/evaluate"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentEvaluation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/progress"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/rewards"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/settings"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentHome />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/classes"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/content"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <ContentUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/rewards"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherRewards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/analytics"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/settings"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherSettings />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>

        {/* Rage Mode Overlay */}
        <RageModeOverlay active={isRageMode} onClaim={handleClaimReward} />
      </div>
    </Router>
  );
}

export default App;
