import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Club Events</Link>
      <div className="nav-links">
        {user?.role === 'student' && (
          <>
            <Link to="/events">Browse Events</Link>
            <Link to="/my-events">My Events</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/events/new">Create Event</Link>
          </>
        )}
        {user ? (
          <>
            <span className="user-name">{user.name}</span>
            <button className="btn btn-small" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}