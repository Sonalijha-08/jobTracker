import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { Loader2, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/board');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Animated background */}
      <div className="bg-canvas">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      <div className={`login-container ${mounted ? 'visible' : ''}`}>
        {/* Brand mark */}
        <div className="brand-mark">
          <div className="brand-icon">
            <Sparkles size={18} />
          </div>
          <span className="brand-name">JobFlow</span>
        </div>

        <div className="card">
          <div className="card-inner">
            <div className="card-header">
              <h1 className="card-title">Sign in</h1>
              <p className="card-subtitle">Track your career journey</p>
            </div>

            {error && (
              <div className="error-banner">
                <span className="error-dot" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="form">
              <div className={`field ${focusedField === 'email' ? 'focused' : ''} ${email ? 'filled' : ''}`}>
                <label className="field-label">Email address</label>
                <div className="field-input-wrap">
                  <Mail className="field-icon" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="field-input"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="field-line" />
              </div>

              <div className={`field ${focusedField === 'password' ? 'focused' : ''} ${password ? 'filled' : ''}`}>
                <label className="field-label">Password</label>
                <div className="field-input-wrap">
                  <Lock className="field-icon" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="field-input"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div className="field-line" />
              </div>

              <div className="form-footer-row">
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                <span className="btn-text">
                  {loading ? (
                    <Loader2 className="spin-icon" size={18} />
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={16} className="btn-arrow" />
                    </>
                  )}
                </span>
                <div className="btn-shine" />
              </button>
            </form>

            <p className="signup-prompt">
              New here?{' '}
              <Link to="/register" className="signup-link">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="footer-note">Secure · Private · Free</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #040507;
          position: relative;
          overflow: hidden;
        }

        /* Background */
        .bg-canvas {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: drift 12s ease-in-out infinite alternate;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          top: -100px; left: -100px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          animation-delay: -4s;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%);
          top: 50%; left: 55%;
          transform: translate(-50%, -50%);
          animation-delay: -8s;
        }
        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 40px) scale(1.05); }
        }
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
        }

        /* Container */
        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .login-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Brand */
        .brand-mark {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }
        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.3px;
        }

        /* Card */
        .card {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .card-inner {
          padding: 40px;
        }
        .card-header {
          margin-bottom: 32px;
        }
        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          line-height: 1;
          margin-bottom: 8px;
        }
        .card-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
        }

        /* Error */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 24px;
        }
        .error-dot {
          width: 6px; height: 6px;
          background: #ef4444;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Form fields */
        .form { display: flex; flex-direction: column; gap: 24px; }

        .field {
          position: relative;
          padding-top: 20px;
        }
        .field-label {
          position: absolute;
          top: 0;
          left: 0;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          transition: color 0.2s;
        }
        .field.focused .field-label { color: #818cf8; }

        .field-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 10px;
        }
        .field-icon {
          color: rgba(255,255,255,0.25);
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .field.focused .field-icon { color: #818cf8; }

        .field-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: white;
          caret-color: #818cf8;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }

        .field-line {
          height: 1px;
          background: rgba(255,255,255,0.08);
          position: relative;
          transition: background 0.2s;
        }
        .field-line::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
          border-radius: 1px;
        }
        .field.focused .field-line::after { transform: scaleX(1); }

        /* Forgot */
        .form-footer-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -8px;
        }
        .forgot-link {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          transition: color 0.2s;
        }
        .forgot-link:hover { color: rgba(255,255,255,0.6); }

        /* Button */
        .submit-btn {
          position: relative;
          width: 100%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          border-radius: 14px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          padding: 14px;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s;
          box-shadow: 0 4px 24px rgba(99,102,241,0.35);
          margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.45);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-text {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-arrow { transition: transform 0.2s; }
        .submit-btn:hover .btn-arrow { transform: translateX(3px); }

        .btn-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: skewX(-20deg) translateX(-150%);
          transition: transform 0.6s ease;
        }
        .submit-btn:hover .btn-shine { transform: skewX(-20deg) translateX(250%); }

        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Signup prompt */
        .signup-prompt {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          margin-top: 28px;
        }
        .signup-link {
          color: #818cf8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .signup-link:hover { color: #a5b4fc; }

        .footer-note {
          font-size: 11px;
          color: rgba(255,255,255,0.15);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}