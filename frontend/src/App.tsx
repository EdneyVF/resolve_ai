import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1b5e20',
      light: '#4c8c4a',
      dark: '#003300',
    },
    secondary: {
      main: '#2e7d32',
      light: '#60ad5e',
      dark: '#005005',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const MyReportsPage = lazy(() => import('./pages/MyReportsPage'));
const CreateReportPage = lazy(() => import('./pages/CreateReportPage'));
const ReportDetailsPage = lazy(() => import('./pages/ReportDetailsPage'));

const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminPendingPage = lazy(() => import('./pages/AdminPendingPage'));
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));

const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const ProtectedRoute = () => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <LoadingComponent />;
  }
  
  return authState.user ? <Outlet /> : <Navigate to="/auth" />;
};

const ProtectedAdminRoute = () => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <LoadingComponent />;
  }
  
  if (!authState.user) {
    return <Navigate to="/auth" />;
  }
  
  return authState.user.role === 'admin' ? <Outlet /> : <Navigate to="/" />;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Suspense fallback={<LoadingComponent />}>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reports/:id" element={<ReportDetailsPage />} />
                
                {/* Rotas protegidas (apenas usuários autenticados) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/:userId" element={<UserProfilePage />} />
                  <Route path="/my-reports" element={<MyReportsPage />} />
                  <Route path="/reports/create" element={<CreateReportPage />} />
                  <Route path="/reports/edit/:id" element={<CreateReportPage />} />
                </Route>
                
                {/* Rotas de admin (apenas usuários admin) */}
                <Route element={<ProtectedAdminRoute />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/pending" element={<AdminPendingPage />} />
                  <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                </Route>
                
                {/* Rota para páginas não encontradas */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
