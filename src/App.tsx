import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import MonitoringPage  from './pages/MonitoringPage';
import StudentsPage    from './pages/StudentsPage';
import AllocationPage  from './pages/AllocationPage';
import ExercisesPage   from './pages/ExercisesPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SessionsPage    from './pages/SessionsPage';
import FaultsPage      from './pages/FaultsPage';
import ReportsPage     from './pages/ReportsPage';
import SettingsPage    from './pages/SettingsPage';
import type { Role } from './types';

// Role guard
function RoleGuard({ children, roles }: { children: React.ReactNode; roles: Role[] }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-4xl mb-3">🚫</div>
        <h2 className="text-xl font-semibold text-slate-700">Access Denied</h2>
        <p className="text-slate-400 text-sm mt-1">You do not have permission to view this page.</p>
        <button
          className="mt-4 text-indigo-600 hover:underline text-sm cursor-pointer"
          onClick={() => window.history.back()}
        >
          ← Go back
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route element={<AppLayout />}>
        <Route path="/"            element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"   element={<DashboardPage />} />
        <Route path="/monitoring"  element={<RoleGuard roles={['admin','faculty']}><MonitoringPage /></RoleGuard>} />
        <Route path="/students"    element={<RoleGuard roles={['admin','faculty']}><StudentsPage /></RoleGuard>} />
        <Route path="/allocation"  element={<RoleGuard roles={['admin','faculty']}><AllocationPage /></RoleGuard>} />
        <Route path="/exercises"   element={<ExercisesPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/sessions"    element={<RoleGuard roles={['admin','faculty']}><SessionsPage /></RoleGuard>} />
        <Route path="/faults"      element={<RoleGuard roles={['admin','faculty']}><FaultsPage /></RoleGuard>} />
        <Route path="/reports"     element={<RoleGuard roles={['admin','faculty']}><ReportsPage /></RoleGuard>} />
        <Route path="/settings"    element={<RoleGuard roles={['admin']}><SettingsPage /></RoleGuard>} />
        <Route path="*"            element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
