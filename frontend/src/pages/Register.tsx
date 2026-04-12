import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { Loader2, Mail, Lock, User, ArrowRight, Sparkles, Check } from 'lucide-react';

const passwordRules = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains a letter', test: (p: string) => /[a-zA-Z]/.test(p) },
];

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showStrength, setShowStrength] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/board');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const passedRules = passwordRules.filter(r => r.test(password));
  const strength = password.length === 0 ? 0 : passedRules.length;

  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981'][strength];

  return (
    <div className="register-root">
      <div className="bg-canvas">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      <div className={`register-container ${mounted ? 'visible' : ''}`}>
        <div className="brand-mark">
          <div className="brand-icon">
            <Sparkles size={18} />
          </div>
          <span className="brand-name">JobFlow</span>
        </div>

        <div className="card">
          <div className="card-inner">
            <div className="card-header">
              <h1 className="card-title">Get started</h1>
              <p className="card-subtitle">Start tracking your applications today</p>
            </div>

            {error && (
              <div className="error-banner">
                <span className="error-dot" />
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="form">
              <div className={`field ${focusedField === 'name' ? 'focused' : ''} ${name ? 'filled' : ''}`}>
                <label className="field-label">Full name</label>
                <div className="field-input-wrap">
                  <User className="field-icon" size={16} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="field-input"
                    placeholder="Jane Smith"
                    autoComplete="name"
                  />
                </div>
                <div className="field-line" />
              </div>

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
                    onFocus={() => { setFocusedField('password'); setShowStrength(true); }}
                    onBlur={() => setFocusedField(null)}
                    className="field-input"
                    placeholder="Create a strong password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  {password && strength === 3 && (
                    <Check size={14} className="check-icon" />
                  )}
                </div>
                <div className="field-line" />

                {showStrength && password.length > 0 && (
                  <div className="strength-wrap">
                    <div className="strength-bars">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="strength-bar"
                          style={{ background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)' }}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}

                {showStrength && password.length > 0 && (
                  <div className="rules-wrap">
                    {passwordRules.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <div key={rule.label} className={`rule ${passed ? 'passed' : ''}`}>
                          <span className="rule-dot" />
                          {rule.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                <span className="btn-text">
                  {loading ? (
                    <Loader2 className="spin-icon" size={18} />
                  ) : (
                    <>
                      Create account
                      <ArrowRight size={16} className="btn-arrow" />
                    </>
                  )}
                </span>
                <div className="btn-shine" />
              </button>
            </form>

            <p className="terms-note">
              By signing up, you agree to our{' '}
              <a href="#" className="terms-link">Terms</a>{' '}
              and{' '}
              <a href="#" className="terms-link">Privacy Policy</a>
            </p>

            <div className="divider"><span>or</span></div>

            <p className="login-prompt">
              Already have an account?{' '}
              <Link to="/login" className="login-link">Sign in</Link>
            </p>
          </div>
        </div>

        <p className="footer-note">Secure · Private · Free</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .register-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #040507;
          position: relative;
          overflow: hidden;
          padding: 24px 0;
        }
        .bg-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: drift 12s ease-in-out infinite alternate; }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
          top: -100px; right: -100px; animation-delay: 0s;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          bottom: -80px; left: -80px; animation-delay: -5s;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%);
          top: 40%; left: 40%; animation-delay: -9s;
        }
        @keyframes drift { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(30px,40px) scale(1.05); } }
        .grid-overlay {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
        }

        .register-container {
          position: relative; z-index: 1;
          width: 100%; max-width: 440px; padding: 24px;
          display: flex; flex-direction: column; align-items: center; gap: 24px;
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .register-container.visible { opacity: 1; transform: translateY(0); }

        .brand-mark { display: flex; align-items: center; gap: 10px; }
        .brand-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white;
          box-shadow: 0 0 20px rgba(16,185,129,0.4);
        }
        .brand-name { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: white; letter-spacing: -0.3px; }

        .card {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .card-inner { padding: 40px; }
        .card-header { margin-bottom: 32px; }
        .card-title { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; line-height: 1; margin-bottom: 8px; }
        .card-subtitle { font-size: 14px; color: rgba(255,255,255,0.4); }

        .error-banner {
          display: flex; align-items: center; gap: 8px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5; padding: 12px 16px; border-radius: 12px; font-size: 13px; margin-bottom: 24px;
        }
        .error-dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; flex-shrink: 0; }

        .form { display: flex; flex-direction: column; gap: 24px; }
        .field { position: relative; padding-top: 20px; }
        .field-label {
          position: absolute; top: 0; left: 0;
          font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.3); transition: color 0.2s;
        }
        .field.focused .field-label { color: #34d399; }
        .field-input-wrap { display: flex; align-items: center; gap: 10px; padding-bottom: 10px; }
        .field-icon { color: rgba(255,255,255,0.25); flex-shrink: 0; transition: color 0.2s; }
        .field.focused .field-icon { color: #34d399; }
        .field-input { flex: 1; background: transparent; border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 15px; color: white; caret-color: #34d399; }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }
        .field-line { height: 1px; background: rgba(255,255,255,0.08); position: relative; }
        .field-line::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, #10b981, #34d399);
          transform: scaleX(0); transform-origin: left; transition: transform 0.3s ease; border-radius: 1px;
        }
        .field.focused .field-line::after { transform: scaleX(1); }
        .check-icon { color: #10b981; flex-shrink: 0; }

        /* Strength */
        .strength-wrap { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
        .strength-bars { display: flex; gap: 4px; flex: 1; }
        .strength-bar { flex: 1; height: 3px; border-radius: 2px; transition: background 0.3s; }
        .strength-label { font-size: 11px; font-weight: 500; min-width: 40px; text-align: right; transition: color 0.3s; }

        /* Rules */
        .rules-wrap { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; }
        .rule { display: flex; align-items: center; gap: 7px; font-size: 12px; color: rgba(255,255,255,0.3); transition: color 0.3s; }
        .rule.passed { color: rgba(255,255,255,0.6); }
        .rule-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

        /* Button */
        .submit-btn {
          position: relative; width: 100%;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          border: none; border-radius: 14px; color: white;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          padding: 14px; cursor: pointer; overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s;
          box-shadow: 0 4px 24px rgba(16,185,129,0.3); margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(16,185,129,0.4); }
        .submit-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-text { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-arrow { transition: transform 0.2s; }
        .submit-btn:hover .btn-arrow { transform: translateX(3px); }
        .btn-shine {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: skewX(-20deg) translateX(-150%); transition: transform 0.6s ease;
        }
        .submit-btn:hover .btn-shine { transform: skewX(-20deg) translateX(250%); }
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .terms-note { text-align: center; font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 16px; line-height: 1.6; }
        .terms-link { color: rgba(255,255,255,0.35); text-decoration: none; }
        .terms-link:hover { color: rgba(255,255,255,0.6); }

        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0 0; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider span { font-size: 11px; color: rgba(255,255,255,0.2); }

        .login-prompt { text-align: center; font-size: 13px; color: rgba(255,255,255,0.3); margin-top: 16px; }
        .login-link { color: #34d399; text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .login-link:hover { color: #6ee7b7; }
        .footer-note { font-size: 11px; color: rgba(255,255,255,0.15); letter-spacing: 0.1em; text-transform: uppercase; }

        @media (max-width: 640px) {
          .register-container { padding: 16px; gap: 20px; }
          .card-inner { padding: 24px 20px; }
          .card-title { font-size: 26px; }
          .brand-name { font-size: 18px; }
          .brand-icon { width: 30px; height: 30px; }
          .submit-btn { padding: 12px; font-size: 14px; }
          .divider { margin: 16px 0 0; }
        }
      `}</style>
    </div>
  );
}