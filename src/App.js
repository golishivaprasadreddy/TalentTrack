import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminDriveDetail from './pages/AdminDriveDetail';
import PanelDashboard from './pages/PanelDashboard';
import PanelRoundDetail from './pages/PanelRoundDetail';
import CandidateDashboard from './pages/CandidateDashboard';
import './index.css';

const HomePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  } else if (user.role === 'panel') {
    return <Navigate to="/panel/dashboard" />;
  } else {
    return <Navigate to="/candidate/dashboard" />;
  }
};

const NavbarWrapper = () => {
  const location = useLocation();
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  
  if (publicRoutes.includes(location.pathname)) {
    return null;
  }
  
  return <Navbar />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <NavbarWrapper />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/drive/:driveId"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDriveDetail />
              </ProtectedRoute>
            }
          />

          {/* Panel Routes */}
          <Route
            path="/panel/dashboard"
            element={
              <ProtectedRoute requiredRole="panel">
                <PanelDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/round/:roundId"
            element={
              <ProtectedRoute requiredRole="panel">
                <PanelRoundDetail />
              </ProtectedRoute>
            }
          />

          {/* Candidate Routes */}
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute requiredRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
