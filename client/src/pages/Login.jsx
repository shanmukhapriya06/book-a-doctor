import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/user/login', formData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userData', JSON.stringify(res.data.userData));
        message.success(res.data.message);
        if (res.data.userData.type === 'admin') {
          navigate('/adminhome');
        } else if (res.data.userData.isdoctor === true) {
          navigate('/doctorhome');
        } else {
          navigate('/userhome');
        }
      } else {
        message.error(res.data.message);
      }
    } catch {
      message.error("Something went wrong");
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }
        .left-panel {
          width: 55%;
          background: linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%);
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .right-panel {
          width: 45%;
          background-color: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        .form-card {
          width: 100%;
          max-width: 440px;
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          border: 1px solid #E2E8F0;
          margin: auto;
        }
        .input-group-custom {
          position: relative;
          margin-bottom: 24px;
        }
        .input-custom {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.3s ease;
          background-color: #F8FAFC;
          color: #1E293B;
        }
        .input-custom:focus {
          outline: none;
          border-color: #2563EB;
          background-color: white;
          box-shadow: 0 0 0 4px rgba(37, 99, 237, 0.1);
        }
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .password-toggle:hover {
          color: #2563EB;
        }
        .trust-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        .trust-card:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.15);
        }
        .login-btn {
          width: 100%;
          background-color: #2563EB;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }
        .login-btn:hover {
          background-color: #1D4ED8;
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
        }
        .login-btn:active {
          transform: translateY(0);
        }
        .link-custom {
          color: #2563EB;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .link-custom:hover {
          color: #1D4ED8;
          text-decoration: underline;
        }
        @media (max-width: 991px) {
          .left-panel {
            display: none !important;
          }
          .right-panel {
            width: 100%;
            min-height: 100vh;
            background-color: #F8FAFC;
          }
        }
      `}</style>

      <div className="left-panel">
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: 'white', fontSize: '20px', fontWeight: '800' }}>MediCare</span>
          </div>
          
          <div style={{ maxWidth: '480px' }}>
            <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px' }}>
              Your Secure Gateway to Better Health
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
              Access your medical consultations, message verified practitioners, and organize healthcare visits seamlessly with MediCare.
            </p>
          </div>

          <div style={{ maxWidth: '460px' }}>
            <div className="trust-card">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h6 style={{ fontWeight: '700', margin: '0 0 4px 0', fontSize: '15px' }}>Verified Doctors Only</h6>
                  <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                    Connect with thoroughly credentialed healthcare professionals approved by our medical board.
                  </p>
                </div>
              </div>
            </div>

            <div className="trust-card">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h6 style={{ fontWeight: '700', margin: '0 0 4px 0', fontSize: '15px' }}>100% Secure MERN Portal</h6>
                  <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                    Your private patient dashboard is protected with advanced cryptographic JWT encryption keys.
                  </p>
                </div>
              </div>
            </div>

            <div className="trust-card">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <h6 style={{ fontWeight: '700', margin: '0 0 4px 0', fontSize: '15px' }}>Instant Appointment Booking</h6>
                  <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                    Secure scheduling instantly matches you to available specialist calendars.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <svg style={{ width: '100%', height: '40px', opacity: 0.15 }} viewBox="0 0 400 60" fill="none">
            <path d="M 0 30 C 50 30, 80 10, 110 50 C 140 10, 160 50, 180 30 L 220 30 L 228 15 L 236 45 L 246 5 L 256 55 L 266 25 L 274 35 L 282 30 L 400 30" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="right-panel">
        <div className="form-card">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1E293B', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Login to your MediCare account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Email Address</label>
              <div className="input-group-custom">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="input-custom"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Password</label>
              <div className="input-group-custom">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-custom"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>
          </form>

          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '14px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ color: '#64748B' }}>Don't have an account? </span>
              <span onClick={() => navigate('/register')} className="link-custom">Register here</span>
            </div>
            <div>
              <span onClick={() => navigate('/')} className="link-custom" style={{ color: '#64748B', fontWeight: '500' }}>Back to Home</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

