'use client';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/layout/LoadingScreen';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/auth" replace />;
  if (currentUser.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route
        path="/auth"
        element={currentUser ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DataProvider>
              <Layout />
            </DataProvider>
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route
          path="team"
          element={
            <AdminRoute>
              <DataProvider>
                <TeamPage />
              </DataProvider>
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
