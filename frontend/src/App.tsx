import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import LoginPage from './components/auth/LoginPage';
import HomePage from './pages/HomePage';
import Navbar from './components/common/Navbar';
import UserDashboard from './components/user/UserDashboard';
import UserBookings from './components/user/UserBookings';
import UserTables from './components/user/UserTables';
import UserMenu from './components/user/UserMenu';
import UserOrders from './components/user/UserOrders';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminCustomers from './components/admin/AdminCustomers';
import AdminTables from './components/admin/AdminTables';
import AdminMenu from './components/admin/AdminMenu';
import AdminOrders from './components/admin/AdminOrders';
import AdminBookings from './components/admin/AdminBookings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const PathSaver: React.FC = () => {
  const { setLastPath, role, user } = useAuthStore();
  const location = globalThis.location;

  React.useEffect(() => {
    const isProtectedRoute = location.pathname !== '/login' &&
        location.pathname !== '/' &&
        location.pathname !== '/home';
    const isAuthenticated = role && user;

    if (isProtectedRoute && isAuthenticated) {
      setLastPath(location.pathname);
    }
  }, [location.pathname, setLastPath, role, user]);

  return null;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole: 'user' | 'admin' }> = ({
                                                                                                  children,
                                                                                                  allowedRole
                                                                                                }) => {
  const { role, user } = useAuthStore();

  if (!role || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to={`/${role}`} replace />;
  }

  return <>{children}</>;
};

const AuthRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { role, user, lastPath } = useAuthStore();
  const location = globalThis.location;
  const isAuthenticated = role && user;

  if (!isAuthenticated) {
    return null;
  }

  const isOnAuthPage = location.pathname === '/login' ||
      location.pathname === '/' ||
      location.pathname === '/home';

  if (isOnAuthPage) {
    const isValidLastPath = lastPath && (lastPath.startsWith('/user') || lastPath.startsWith('/admin'));
    const isRoleMatch = (role === 'admin' && lastPath?.startsWith('/admin')) ||
        (role === 'user' && lastPath?.startsWith('/user'));

    if (isValidLastPath && isRoleMatch) {
      setTimeout(() => navigate(lastPath), 0);
      return <Navigate to={lastPath} replace />;
    }

    return <Navigate to={`/${role}`} replace />;
  }

  return null;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, user } = useAuthStore();

  if (!role || !user) {
    return <>{children}</>;
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
  );
};

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <PathSaver />
          <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '14px',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
                loading: {
                  style: {
                    background: '#3b82f6',
                  },
                },
              }}
          />
          <AuthRedirect />
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route path="/user" element={
                <ProtectedRoute allowedRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="/user/bookings" element={
                <ProtectedRoute allowedRole="user">
                  <UserBookings />
                </ProtectedRoute>
              } />
              <Route path="/user/tables" element={
                <ProtectedRoute allowedRole="user">
                  <UserTables />
                </ProtectedRoute>
              } />
              <Route path="/user/menu" element={
                <ProtectedRoute allowedRole="user">
                  <UserMenu />
                </ProtectedRoute>
              } />
              <Route path="/user/orders" element={
                <ProtectedRoute allowedRole="user">
                  <UserOrders />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/customers" element={
                <ProtectedRoute allowedRole="admin">
                  <AdminCustomers />
                </ProtectedRoute>
              } />
              <Route path="/admin/tables" element={
                <ProtectedRoute allowedRole="admin">
                  <AdminTables />
                </ProtectedRoute>
              } />
              <Route path="/admin/menu" element={
                <ProtectedRoute allowedRole="admin">
                  <AdminMenu />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute allowedRole="admin">
                  <AdminOrders />
                </ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute allowedRole="admin">
                  <AdminBookings />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </QueryClientProvider>
  );
}

export default App;