import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student', clubName: '', adminCode: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await signup(form);
      navigate(user.role === 'admin' ? '/admin' : '/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <AuthLayout>
      <h2>Create your account</h2>
      <p className="auth-sub">Join in less than a minute.</p>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
           <PasswordInput value={form.password} onChange={handleChange} />
        <label>I am a</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="admin">Club admin</option>
        </select>

        {form.role === 'admin' && (
          <>
            <label>Club name</label>
            <input name="clubName" value={form.clubName} onChange={handleChange} required />
            <label>Admin code</label>
            <input name="adminCode" value={form.adminCode} onChange={handleChange} required />
          </>
        )}

        <button className="btn" type="submit">Create account</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
    </AuthLayout>
  );
}