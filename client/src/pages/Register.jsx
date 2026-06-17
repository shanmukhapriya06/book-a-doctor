import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    type: 'user'
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
      const res = await api.post('/user/register', formData);
      if (res.data.success) {
        message.success(res.data.message);
        navigate('/login');
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
          margin-bottom: 20px;
        }
        .input-custom {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          font-size: 14px;
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
              Join the Smart Healthcare Platform
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
              Create your profile today to gain access to verified healthcare professionals, calendar scheduling tools, and instant consultation notifications.
            </p>
          </div>

          <div style={{ maxWidth: '460px' }}>
            <div className="trust-card">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88" />
                  </svg>
                </div>
                <div>
                  <h6 style={{ fontWeight: '700', margin: '0 0 4px 0', fontSize: '15px' }}>Free to Join</h6>
                  <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                    Register your patient profile instantly without any initial registration fees or membership costs.
                  </p>
                </div>
              </div>
            </div>

            <div className="trust-card">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div>
                  <h6 style={{ fontWeight: '700', margin: '0 0 4px 0', fontSize: '15px' }}>Instant Portal Access</h6>
                  <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                    Access available practitioner schedules and secure calendar slots in under two minutes.
                  </p>
                </div>
              </div>
            </div>

            <div className="trust-card">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <h6 style={{ fontWeight: '700', margin: '0 0 4px 0', fontSize: '15px' }}>Configurable Roles</h6>
                  <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                    Configure specific access panels tailored for Patient booking schedules or Admin directories.
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
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>Create Account</h2>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Join MediCare today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Full Name</label>
              <div className="input-group-custom">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-custom"
                  required
                />
              </div>
            </div>

            <div className="mb-2">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Email Address</label>
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

            <div className="mb-2">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Password</label>
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

            <div className="mb-2">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Phone Number</label>
              <div className="input-group-custom">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="input-custom"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Select Account Role</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div
                  onClick={() => setFormData({ ...formData, type: 'user' })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: formData.type === 'user' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: formData.type === 'user' ? '#EFF6FF' : 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: formData.type === 'user' ? '0 4px 12px rgba(37, 99, 235, 0.08)' : 'none'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={formData.type === 'user' ? '#2563EB' : '#64748B'} strokeWidth="2" style={{ marginBottom: '6px' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div style={{ fontWeight: '700', color: formData.type === 'user' ? '#2563EB' : '#1E293B', fontSize: '13px' }}>Patient</div>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, type: 'admin' })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: formData.type === 'admin' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: formData.type === 'admin' ? '#EFF6FF' : 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: formData.type === 'admin' ? '0 4px 12px rgba(37, 99, 235, 0.08)' : 'none'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={formData.type === 'admin' ? '#2563EB' : '#64748B'} strokeWidth="2" style={{ marginBottom: '6px' }}>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <div style={{ fontWeight: '700', color: formData.type === 'admin' ? '#2563EB' : '#1E293B', fontSize: '13px' }}>Admin</div>
                </div>
              </div>
            </div>

            <button type="submit" className="login-btn">
              Register
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#64748B' }}>Already have an account? </span>
              <span onClick={() => navigate('/login')} className="link-custom">Login here</span>
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

export default Register;
