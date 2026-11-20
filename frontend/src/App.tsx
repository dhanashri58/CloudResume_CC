import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/landing/LandingPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TemplatesPage from './pages/templates/TemplatesPage';
import EditorPage from './pages/editor/EditorPage';
import AIAssistantPage from './pages/ai/AIAssistantPage';
import ProfilePage from './pages/profile/ProfilePage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import { useAuth } from './auth/AuthContext';

/**
 * Adaptive layout for Templates view:
 * When authenticated, preserves the DashboardLayout (sidebar, header, user profile, settings)
 * so the user stays in their workflow.
 * When unauthenticated, displays the clean PublicLayout with landing navbar.
 */
const TemplatesAdaptiveRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <DashboardLayout />;
  }
  return <PublicLayout />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Adaptive Templates route */}
            <Route element={<TemplatesAdaptiveRoute />}>
              <Route path="/templates" element={<TemplatesPage />} />
            </Route>

            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/register" element={<SignUpPage />} />
            </Route>

            {/* Protected Dashboard routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/resumes" element={<DashboardPage />} />
              <Route path="/ai" element={<AIAssistantPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Protected Editor route (full screen, no sidebar) */}
            <Route
              path="/editor/:id"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
