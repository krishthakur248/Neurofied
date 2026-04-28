import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { insforgeClient } from './lib/insforge';

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import ResultsPage from './pages/ResultsPage';
import LearnPage from './pages/LearnPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import ExpressPage from './pages/ExpressPage';
import PredictPage from './pages/PredictPage';
import VideosPage from './pages/VideosPage';

// Components
import Navigation from './components/Navigation';
import FloatingChatButton from './components/FloatingChatButton';

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await insforgeClient.auth.getCurrentUser();
        if (!error && data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const { data, error } = await insforgeClient.auth.getCurrentUser();
      if (!error && data?.user) {
        setUser(data.user);
        return data.user;
      }
    } catch (e) {
      console.error('Refresh user failed:', e);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" />;
  }

  return children;
}

function AppLayout({ children }) {
  const location = useLocation();
  const hideNav = ['/login', '/landing'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-app-gradient">
      {!hideNav && <Navigation />}
      {children}
      <FloatingChatButton />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={user ? <Navigate to="/" /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/test" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
        <Route path="/test/:testSlug" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/express" element={<ProtectedRoute><ExpressPage /></ProtectedRoute>} />
        <Route path="/predict" element={<ProtectedRoute><PredictPage /></ProtectedRoute>} />
        <Route path="/learn" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path="/videos" element={<ProtectedRoute><VideosPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? "/" : "/landing"} />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
