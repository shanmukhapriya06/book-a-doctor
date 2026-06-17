import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <style>{`
        .role-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .role-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        .timeline-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .timeline-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 20px -5px rgba(0, 0, 0, 0.08) !important;
        }
        .why-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .why-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 20px -5px rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>

      <nav style={{ backgroundColor: '#2563EB', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ color: 'white', fontSize: '20px', fontWeight: '800' }}>MediCare</span>
        </div>
        <div>
          <button
            style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '8px', padding: '8px 20px', marginRight: '10px', cursor: 'pointer', fontWeight: '500' }}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            style={{ background: 'white', color: '#2563EB', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: '700', cursor: 'pointer' }}
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
        </div>
      </nav>

      <div style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '0 40px' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div style={{ paddingRight: '48px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white', padding: '8px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: '600', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <span>✦</span>
                  <span>Appointment Management Platform</span>
                </div>
                <h1 style={{ color: 'white', fontSize: '58px', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1.5px' }}>
                  Book a Doctor
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '17px', lineHeight: '1.7', marginBottom: '32px' }}>
                  A complete platform connecting Patients, Doctors and Admins. Book appointments, manage schedules and track everything in one place.
                </p>
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginBottom: '10px' }}>
                    <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                    <span>Patient appointment booking</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginBottom: '10px' }}>
                    <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                    <span>Doctor schedule management</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginBottom: '10px' }}>
                    <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                    <span>Admin platform control</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <button
                    style={{ backgroundColor: 'white', color: '#1D4ED8', border: 'none', borderRadius: '10px', padding: '16px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15 rgba(0,0,0,0.2)' }}
                    onClick={() => navigate(localStorage.getItem('token') ? '/userhome' : '/login')}
                  >
                    Book Appointment
                  </button>
                  <button
                    style={{ backgroundColor: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '10px', padding: '16px 32px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
                    onClick={() => navigate('/register')}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.12))' }} viewBox="0 0 600 500" fill="none">
                  <defs>
                    <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="header-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#0EA5E9" />
                    </linearGradient>
                    <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.06" />
                    </filter>
                  </defs>

                  <circle cx="300" cy="250" r="220" fill="url(#glow-grad)" />

                  <path d="M 120 230 C 200 130, 400 130, 480 230" stroke="#93C5FD" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" />

                  <path d="M 230 460 L 260 460 L 268 445 L 276 480 L 286 430 L 296 490 L 306 450 L 314 465 L 322 460 L 370 460" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />

                  <path d="M 50 60 C 50 110, 110 110, 110 60" stroke="#93C5FD" strokeWidth="2" fill="none" opacity="0.3" />
                  <path d="M 80 100 L 80 120 C 80 130, 90 140, 100 140" stroke="#93C5FD" strokeWidth="2" fill="none" opacity="0.3" />
                  
                  <path d="M 330 40 C 340 38, 350 34, 360 30 C 370 34, 380 38, 390 40 C 390 55, 385 70, 360 82 C 335 70, 330 55, 330 40 Z" stroke="#93C5FD" strokeWidth="2" fill="none" opacity="0.35" />

                  <g filter="url(#card-shadow)">
                    <rect x="20" y="130" width="160" height="220" rx="20" fill="white" stroke="#F1F5F9" strokeWidth="1" />
                    <path d="M 20 150 C 20 139, 29 130, 40 130 L 140 130 C 151 130, 160 139, 160 150 L 160 155 L 20 155 Z" fill="#10B981" />
                    
                    <circle cx="100" cy="190" r="32" fill="#F1F5F9" />
                    <path d="M 80 220 C 80 205, 90 200, 100 200 C 110 200, 120 205, 120 220 Z" fill="#94A3B8" />
                    <circle cx="100" cy="184" r="12" fill="#64748B" />
                    <path d="M 94 196 L 94 204 M 106 196 L 106 204 M 94 204 C 94 207, 106 207, 106 204" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
                    
                    <circle cx="124" cy="208" r="9" fill="#2563EB" />
                    <path d="M 120 208 L 123 211 L 129 205" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                    <text x="100" y="244" fill="#1E293B" fontSize="12" fontWeight="700" textAnchor="middle">Dr. Sarah Jenkins</text>
                    <text x="100" y="258" fill="#64748B" fontSize="9" fontWeight="600" textAnchor="middle">Cardiologist</text>
                    
                    <path d="M 85 272 L 87 276 L 92 276 L 88 279 L 89 284 L 85 281 L 81 284 L 82 279 L 78 276 L 83 276 Z" fill="#F59E0B" />
                    <text x="110" y="280" fill="#1E293B" fontSize="10" fontWeight="600" textAnchor="middle">4.9 (124)</text>

                    <rect x="40" y="298" width="120" height="24" rx="12" fill="#ECFDF5" />
                    <circle cx="56" cy="310" r="4" fill="#10B981" />
                    <text x="112" y="313" fill="#047857" fontSize="9" fontWeight="700" textAnchor="middle">Available Today</text>
                  </g>

                  <g filter="url(#card-shadow)">
                    <rect x="420" y="150" width="160" height="180" rx="20" fill="white" stroke="#F1F5F9" strokeWidth="1" />
                    
                    <circle cx="500" cy="200" r="28" fill="#EFF6FF" />
                    <path d="M 483 224 C 483 212, 490 208, 500 208 C 510 208, 517 212, 517 224 Z" fill="#60A5FA" />
                    <circle cx="500" cy="194" r="10" fill="#2563EB" />

                    <text x="500" y="248" fill="#1E293B" fontSize="12" fontWeight="700" textAnchor="middle">John Doe</text>
                    <text x="500" y="262" fill="#64748B" fontSize="9" fontWeight="500" textAnchor="middle">Patient ID: #4802</text>

                    <rect x="445" y="284" width="110" height="22" rx="11" fill="#EFF6FF" />
                    <text x="500" y="297" fill="#2563EB" fontSize="9" fontWeight="700" textAnchor="middle">Booking Active</text>
                  </g>

                  <g filter="url(#card-shadow)">
                    <rect x="200" y="70" width="200" height="310" rx="24" fill="white" stroke="#F1F5F9" strokeWidth="1" />
                    
                    <path d="M 200 94 C 200 81, 209 70, 222 70 L 378 70 C 391 70, 400 81, 400 94 L 400 115 L 200 115 Z" fill="url(#header-grad)" />
                    <text x="300" y="97" fill="white" fontSize="11" fontWeight="700" textAnchor="middle">BOOK APPOINTMENT</text>
                    
                    <text x="300" y="136" fill="#1E293B" fontSize="12" fontWeight="800" textAnchor="middle">June 2026</text>
                    
                    <g fontSize="8" fontWeight="700" fill="#94A3B8" textAnchor="middle">
                      <text x="220" y="154">M</text>
                      <text x="246" y="154">T</text>
                      <text x="272" y="154">W</text>
                      <text x="298" y="154">T</text>
                      <text x="324" y="154">F</text>
                      <text x="350" y="154">S</text>
                      <text x="376" y="154">S</text>
                    </g>

                    <g fontSize="9" fontWeight="600" fill="#64748B" textAnchor="middle">
                      <text x="220" y="176" fill="#CBD5E1">28</text>
                      <text x="246" y="176" fill="#CBD5E1">29</text>
                      <text x="272" y="176" fill="#CBD5E1">30</text>
                      <text x="298" y="176" fill="#CBD5E1">31</text>
                      <text x="324" y="176" fill="#1E293B">1</text>
                      <text x="350" y="176" fill="#1E293B">2</text>
                      <text x="376" y="176" fill="#1E293B">3</text>

                      <text x="220" y="200" fill="#1E293B">4</text>
                      <text x="246" y="200" fill="#1E293B">5</text>
                      <text x="272" y="200" fill="#1E293B">6</text>
                      <text x="298" y="200" fill="#1E293B">7</text>
                      <text x="324" y="200" fill="#1E293B">8</text>
                      <text x="350" y="200" fill="#1E293B">9</text>
                      <text x="376" y="200" fill="#1E293B">10</text>

                      <text x="220" y="224" fill="#1E293B">11</text>
                      <text x="246" y="224" fill="#1E293B">12</text>
                      <text x="272" y="224" fill="#1E293B">13</text>
                      <text x="298" y="224" fill="#1E293B">14</text>
                      <text x="324" y="224" fill="#1E293B">15</text>
                      <circle cx="350" cy="221" r="11" fill="#2563EB" />
                      <text x="350" y="224" fill="white" fontWeight="800">16</text>
                      <text x="376" y="224" fill="#1E293B">17</text>
                    </g>

                    <line x1="215" y1="242" x2="385" y2="242" stroke="#F1F5F9" strokeWidth="1" />

                    <text x="300" y="260" fill="#1E293B" fontSize="10" fontWeight="800" textAnchor="middle">Available Slots</text>
                    
                    <g fontSize="8" fontWeight="700" textAnchor="middle">
                      <rect x="212" y="272" width="52" height="20" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                      <text x="238" y="284" fill="#64748B">09:00 AM</text>
                      
                      <rect x="270" y="272" width="60" height="20" rx="6" fill="#2563EB" />
                      <text x="300" y="284" fill="white">10:30 AM</text>

                      <rect x="336" y="272" width="52" height="20" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                      <text x="362" y="284" fill="#64748B">02:00 PM</text>
                    </g>

                    <rect x="215" y="316" width="170" height="36" rx="10" fill="#2563EB" />
                    <text x="300" y="338" fill="white" fontSize="11" fontWeight="700" textAnchor="middle">Book Slot</text>
                  </g>

                  <g filter="url(#card-shadow)">
                    <rect x="360" y="20" width="220" height="52" rx="14" fill="white" stroke="#ECFDF5" strokeWidth="1" />
                    <circle cx="388" cy="46" r="14" fill="#D1FAE5" />
                    <path d="M 382 46 L 386 50 L 395 41" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <text x="412" y="42" fill="#1E293B" fontSize="10" fontWeight="800">Appointment Confirmed</text>
                    <text x="412" y="55" fill="#64748B" fontSize="8" fontWeight="600">June 16, 10:30 AM</text>
                  </g>

                  <g filter="url(#card-shadow)">
                    <rect x="10" y="365" width="160" height="75" rx="16" fill="white" stroke="#F1F5F9" strokeWidth="1" />
                    <circle cx="34" cy="390" r="12" fill="#EFF6FF" />
                    <path d="M 34 382 C 31 382, 29 385, 29 388 C 29 392, 34 397, 34 397 C 34 397, 39 392, 39 388 C 39 385, 37 382, 34 382 Z" fill="#2563EB" />
                    <circle cx="34" cy="387" r="2" fill="white" />
                    <text x="54" y="388" fill="#64748B" fontSize="9" fontWeight="600">Active Patients</text>
                    <text x="54" y="399" fill="#1E293B" fontSize="12" fontWeight="800">342 Active</text>
                    <rect x="22" y="418" width="136" height="6" rx="3" fill="#E2E8F0" />
                    <rect x="22" y="418" width="95" height="6" rx="3" fill="#2563EB" />
                  </g>

                  <g filter="url(#card-shadow)">
                    <rect x="410" y="345" width="170" height="95" rx="16" fill="white" stroke="#F1F5F9" strokeWidth="1" />
                    <circle cx="434" cy="375" r="12" fill="#ECFDF5" />
                    <path d="M 429 378 L 434 372 L 439 378" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <text x="454" y="373" fill="#64748B" fontSize="9" fontWeight="600">Weekly Bookings</text>
                    <text x="454" y="385" fill="#10B981" fontSize="8" fontWeight="700">+18.4%</text>
                    <text x="434" y="415" fill="#1E293B" fontSize="18" fontWeight="800">1,248</text>
                    <path d="M 495 420 Q 510 405, 520 412 T 545 398 T 565 395" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <circle cx="565" cy="395" r="3" fill="#2563EB" />
                    <line x1="495" y1="425" x2="565" y2="425" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2 2" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '32px 40px', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-3">
              <div style={{ padding: '8px' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#2563EB', marginBottom: '4px' }}>500+</div>
                <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>Doctors Available</div>
              </div>
            </div>
            <div className="col-md-3">
              <div style={{ padding: '8px' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#2563EB', marginBottom: '4px' }}>10K+</div>
                <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>Happy Patients</div>
              </div>
            </div>
            <div className="col-md-3">
              <div style={{ padding: '8px' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#2563EB', marginBottom: '4px' }}>20+</div>
                <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>Specializations</div>
              </div>
            </div>
            <div className="col-md-3">
              <div style={{ padding: '8px' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#2563EB', marginBottom: '4px' }}>24/7</div>
                <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '80px 40px', backgroundColor: 'white' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: '800', color: '#1E293B', marginBottom: '12px' }}>
            Why Choose Us
          </h2>
          <p style={{ textAlign: 'center', color: '#64748B', fontSize: '16px', marginBottom: '56px', maxWidth: '500px', margin: '0 auto 56px' }}>
            A reliable and efficient appointment booking system
          </p>
          <div className="row g-4 justify-content-center">
            <div className="col-lg-3 col-md-6">
              <div className="why-card" style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px 24px', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#EFF6FF', borderRadius: '12px', marginBottom: '20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '12px', fontSize: '18px' }}>Verified Doctors</h4>
                <p style={{ color: '#64748B', lineHeight: '1.6', margin: 0, fontSize: '13px' }}>
                  All healthcare providers are thoroughly verified and approved by our admin team before listing.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="why-card" style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px 24px', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#EFF6FF', borderRadius: '12px', marginBottom: '20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '12px', fontSize: '18px' }}>Secure Records</h4>
                <p style={{ color: '#64748B', lineHeight: '1.6', margin: 0, fontSize: '13px' }}>
                  Your health records and personal details are encrypted and kept private with JWT secure authentication.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="why-card" style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px 24px', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#EFF6FF', borderRadius: '12px', marginBottom: '20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h4 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '12px', fontSize: '18px' }}>Instant Booking</h4>
                <p style={{ color: '#64748B', lineHeight: '1.6', margin: 0, fontSize: '13px' }}>
                  Select your preferred slot, confirm instantly, and receive booking details in under 2 minutes.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="why-card" style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px 24px', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#EFF6FF', borderRadius: '12px', marginBottom: '20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <h4 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '12px', fontSize: '18px' }}>Live Updates</h4>
                <p style={{ color: '#64748B', lineHeight: '1.6', margin: 0, fontSize: '13px' }}>
                  Get instant confirmation, updates on schedule changes, and reminders for your upcoming visits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '80px 40px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: '12px' }}>How It Works</h2>
          <p style={{ color: '#64748B', textAlign: 'center', marginBottom: '60px', fontSize: '16px' }}>Three simple steps to connect patients and doctors</p>
          <div className="row g-4 justify-content-center align-items-center">
            <div className="col-lg-2 col-md-5">
              <div className="timeline-card" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F6FF 100%)', borderRadius: '20px', padding: '36px 20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', textAlign: 'center', height: '100%' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#2563EB', margin: '0 auto 20px', boxShadow: '0 4px 8px rgba(37,99,235,0.15)' }}>1</div>
                <h5 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '12px', fontSize: '16px' }}>Create Account</h5>
                <p style={{ color: '#64748B', lineHeight: '1.6', margin: 0, fontSize: '12px' }}>Register as a patient, apply as a doctor, or login as admin.</p>
              </div>
            </div>
            <div className="col-lg-1 d-none d-lg-flex align-items-center justify-content-center">
              <div style={{ fontSize: '32px', color: '#2563EB', fontWeight: '800' }}>→</div>
            </div>
            <div className="col-md-5 col-lg-2">
              <div className="timeline-card" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F6FF 100%)', borderRadius: '20px', padding: '36px 20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', textAlign: 'center', height: '100%' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#2563EB', margin: '0 auto 20px', boxShadow: '0 4px 8px rgba(37,99,235,0.15)' }}>2</div>
                <h5 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '12px', fontSize: '16px' }}>Find Doctor</h5>
                <p style={{ color: '#64748B', lineHeight: '1.6', margin: 0, fontSize: '12px' }}>Browse verified doctors by specialization, experience, and fees.</p>
              </div>
            </div>
            <div className="col-lg-1 d-none d-lg-flex align-items-center justify-content-center">
              <div style={{ fontSize: '32px', color: '#2563EB', fontWeight: '800' }}>→</div>
            </div>
            <div className="col-md-5 col-lg-2">
              <div className="timeline-card" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F6FF 100%)', borderRadius: '20px', padding: '36px 20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', textAlign: 'center', height: '100%' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#2563EB', margin: '0 auto 20px', boxShadow: '0 4px 8px rgba(37,99,235,0.15)' }}>3</div>
                <h5 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '12px', fontSize: '16px' }}>Book Appointment</h5>
                <p style={{ color: '#64748B', lineHeight: '1.6', margin: 0, fontSize: '12px' }}>Select your preferred time slot and confirm booking instantly.</p>
              </div>
            </div>
            <div className="col-lg-1 d-none d-lg-flex align-items-center justify-content-center">
              <div style={{ fontSize: '32px', color: '#2563EB', fontWeight: '800' }}>→</div>
            </div>
            <div className="col-md-5 col-lg-2">
              <div className="timeline-card" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F6FF 100%)', borderRadius: '20px', padding: '36px 20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', textAlign: 'center', height: '100%' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#2563EB', margin: '0 auto 20px', boxShadow: '0 4px 8px rgba(37,99,235,0.15)' }}>4</div>
                <h5 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '12px', fontSize: '16px' }}>Track Status</h5>
                <p style={{ color: '#64748B', lineHeight: '1.6', margin: 0, fontSize: '12px' }}>Receive instant confirmation and follow status updates in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '60px 40px 80px 40px', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF4FF 100%)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: '800', color: '#1E293B', marginBottom: '12px' }}>
            Who Is This For?
          </h2>
          <p style={{ textAlign: 'center', color: '#64748B', fontSize: '16px', marginBottom: '56px', maxWidth: '500px', margin: '0 auto 56px' }}>
            A complete platform built for three types of users
          </p>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="role-card" style={{ backgroundColor: 'white', border: '1px solid #BFDBFE', borderTop: '6px solid #2563EB', borderRadius: '20px', padding: '36px 28px', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563EB', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>
                  Patient Portal
                </div>
                <div style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', borderRadius: '16px', marginBottom: '20px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h4 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '16px' }}>For Patients</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>Browse verified doctors</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>Book appointments instantly</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>Track appointment history</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>Receive status notifications</span>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="role-card" style={{ backgroundColor: 'white', border: '1px solid #BBF7D0', borderTop: '6px solid #10B981', borderRadius: '20px', padding: '36px 28px', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>
                  Doctor Portal
                </div>
                <div style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4', borderRadius: '16px', marginBottom: '20px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h4 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '16px' }}>For Doctors</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>View incoming appointments</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>Approve or reject bookings</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>Manage your availability</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>Update appointment status</span>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="role-card" style={{ backgroundColor: 'white', border: '1px solid #FED7AA', borderTop: '6px solid #F59E0B', borderRadius: '20px', padding: '36px 28px', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>
                  Admin Portal
                </div>
                <div style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF7ED', borderRadius: '16px', marginBottom: '20px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <h4 style={{ fontWeight: '700', color: '#1E293B', marginBottom: '16px' }}>For Admins</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>Approve doctor registrations</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>Monitor all users</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>View all appointments</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700' }}>✓</span>
                  <span>Full platform control</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#1E293B', padding: '64px 40px' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ color: 'white', fontWeight: '700', fontSize: '20px' }}>MediCare</span>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: '1.6', maxWidth: '300px' }}>
                Connecting patients with trusted healthcare professionals. Secure, fast, and reliable doctor appointment management.
              </p>
            </div>
            <div className="col-md-4">
              <h5 style={{ color: 'white', fontWeight: '700', marginBottom: '20px' }}>Quick Links</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }} onClick={() => navigate('/')}>Home</span>
                <span style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }} onClick={() => navigate('/login')}>Login</span>
                <span style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }} onClick={() => navigate('/register')}>Register</span>
              </div>
            </div>
            <div className="col-md-4">
              <h5 style={{ color: 'white', fontWeight: '700', marginBottom: '20px' }}>Features</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#94A3B8', fontSize: '14px' }}>
                <span>Appointment Booking</span>
                <span>Doctor Dashboard</span>
                <span>Admin Panel</span>
              </div>
            </div>
          </div>
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '40px 0 24px 0' }} />
          <div className="row">
            <div className="col-md-6">
              <p style={{ color: '#64748B', margin: 0, fontSize: '14px' }}>
                © 2026 MediCare. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p style={{ color: '#64748B', margin: 0, fontSize: '14px' }}>
                Contact: info@medicare.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
