import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AdminAuthProvider, AdminRoute } from './context/AdminAuthContext';
import WelcomePage from './pages/welcome';
import LoginAdmin from './pages/auth/LoginAdmin';
import RegisterAdmin from './pages/auth/RegisterAdmin';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRequests from './pages/admin/Requests';
import StudentRequestPage from './pages/student/studentRequest';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

function AppProviders({ children }: { children: React.ReactNode }) {
  const content = <AdminAuthProvider>{children}</AdminAuthProvider>;
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.length > 10) {
    return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{content}</GoogleOAuthProvider>;
  }
  return content;
}

export function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Routes>
          {/* Public Student Printing Routes */}
          <Route path="/request" element={<StudentRequestPage />} />
          <Route path="/submit" element={<Navigate to="/request" replace />} />
          <Route path="/track" element={<Navigate to="/request?tab=track" replace />} />

          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginAdmin />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<RegisterAdmin />} />
          <Route path="/admin/register" element={<Navigate to="/register" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/forgot-password" element={<Navigate to="/forgot-password" replace />} />

          {/* Admin Shortcuts */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <AdminRoute>
                <AdminRequests />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
