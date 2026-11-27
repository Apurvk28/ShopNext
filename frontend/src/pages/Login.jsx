import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        showToast('Logged in successfully!', 'success');
        navigate('/');
      } else if (res.status === 403 && data.requiresVerification) {
        showToast(data.message, 'warning');
        navigate('/register', { state: { emailToVerify: data.email } });
      } else {
        showToast(data.message || 'Invalid credentials', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Network error: Unable to reach the server. Please try again.', 'error');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <img
          src="/SmallSquareLogoJpg.jpg"
          alt="ShopNext Logo"
          style={{
            height: '100px',
            width: '100px',
            borderRadius: '12px',
            objectFit: 'contain',
            margin: '0 auto 8px',
            display: 'block',
          }}
        />
        <h2>Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn">Login</button>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
};

export default Login;
