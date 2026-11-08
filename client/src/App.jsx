import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyEvents from './pages/MyEvents';
import AdminDashboard from './pages/AdminDashboard';
import EventForm from './pages/EventForm';
import Registrants from './pages/Registrants';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <p className="center">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/events'} replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Student pages */}
        <Route path="/events" element={<ProtectedRoute role="student"><Events /></ProtectedRoute>} />
        <Route path="/my-events" element={<ProtectedRoute role="student"><MyEvents /></ProtectedRoute>} />

        {/* Event details: any logged-in user */}
        <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />

        {/* Admin pages */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/events/new" element={<ProtectedRoute role="admin"><EventForm /></ProtectedRoute>} />
        <Route path="/admin/events/:id/edit" element={<ProtectedRoute role="admin"><EventForm /></ProtectedRoute>} />
        <Route path="/admin/events/:id/registrants" element={<ProtectedRoute role="admin"><Registrants /></ProtectedRoute>} />
      </Routes>
    </>
  );
}