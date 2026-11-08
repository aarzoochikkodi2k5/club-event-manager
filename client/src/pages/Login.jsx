import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const fill = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <AuthLayout>
      <h2>Welcome back 👋</h2>
      <p className="auth-sub">Log in to see and join campus events.</p>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        <label>Password</label>
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="auth-switch">New here? <Link to="/signup">Create an account</Link></p>

      <div className="demo-box">
        <p>Just exploring? Fill in a demo account:</p>
        <div className="demo-btns">
          <button type="button" className="demo-btn" onClick={() => fill('student1@seed.test', 'demo1234')}>Demo student</button>
          <button type="button" className="demo-btn" onClick={() => fill('techclub@seed.test', 'demo1234')}>Demo club admin</button>
        </div>
      </div>
    </AuthLayout>
  );
}