import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/auth.css';

const Register = () => {
  const location = useLocation();
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.emailToVerify) {
      setEmail(location.state.emailToVerify);
      setStep('verify');
      setStatusMsg('Please enter the 6-digit OTP sent to your email to complete verification.');
    }
  }, [location.state]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok && data.requiresVerification) {
        setEmail(data.email || email);
        setStatusMsg(data.message || 'OTP sent to your email.');
        setStep('verify');
      } else if (res.ok && data.token) {
        login(data);
        navigate('/');
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Network error: Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Email verified successfully! Welcome to ShopNext.', 'success');
        login(data);
        navigate('/');
      } else {
        setErrorMsg(data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Network error: Unable to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setStatusMsg('');
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message || 'A new OTP has been sent to your email.');
      } else {
        setErrorMsg(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Network error: Unable to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      {step === 'register' ? (
        <form onSubmit={handleRegisterSubmit} className="auth-form">
          <img
            src="/SmallSquareLogoJpg.jpg"
            alt="ShopNext Logo"
            style={{
              height: '72px',
              width: '72px',
              borderRadius: '12px',
              objectFit: 'contain',
              margin: '0 auto 8px',
              display: 'block',
            }}
          />
          <h2>Register</h2>
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {errorMsg}
            </div>
          )}
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Register'}
          </button>
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="auth-form">
          <img
            src="/SmallSquareLogoJpg.jpg"
            alt="ShopNext Logo"
            style={{
              height: '130px',
              width: '130px',
              borderRadius: '12px',
              objectFit: 'contain',
              margin: '0 auto 8px',
              display: 'block',
            }}
          />
          <h2>Verify Email</h2>
          <p style={{ marginTop: 0, fontSize: '0.95rem', color: '#4b5563' }}>
            Enter the 6-digit OTP sent to <strong style={{ color: '#111827' }}>{email}</strong>
          </p>
          {statusMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              {statusMsg}
            </div>
          )}
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {errorMsg}
            </div>
          )}
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
            style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.2rem', fontWeight: '600' }}
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Complete Signup'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', fontSize: '0.9rem' }}>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: '600', cursor: 'pointer', padding: 0 }}
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('register'); setOtp(''); setErrorMsg(''); setStatusMsg(''); }}
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}
            >
              Change Email
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Register;
