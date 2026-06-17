import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import api from '../services/api';
import DoctorCard from '../components/DoctorCard';
import UserAppointments from '../components/UserAppointments';
import ApplyDoctor from '../components/ApplyDoctor';
import Notifications from '../components/Notifications';

const UserHome = () => {
  const [doctors, setDoctors] = useState([]);
  const [userData, setUserData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userData')); } catch { return null; }
  });
  const [activeMenu, setActiveMenu] = useState('home');
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });

  const [doctorSearch, setDoctorSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/user/updateprofile', {
        userId: userData?._id,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      });
      if (res.data.success) {
        const updatedUser = { ...res.data.data, password: undefined };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        message.success("Profile updated successfully");
        setShowEditModal(false);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchFreshUserData = async () => {
      const data = JSON.parse(localStorage.getItem('userData'));
      try {
        const res = await api.post('/user/getuserdata', { userId: data?._id });
        if (cancelled) return;
        if (res.data.success) {
          const fresh = { ...res.data.data, password: undefined };
          localStorage.setItem('userData', JSON.stringify(fresh));
          setUserData(fresh);
          const merged = [
            ...(fresh.notification || []).map((n, i) => ({ id: n._id || `unread-${i}`, message: n.message, type: n.type, isRead: false, date: n.date || null })),
            ...(fresh.seennotification || []).map((n, i) => ({ id: n._id || `read-${i}`, message: n.message, type: n.type, isRead: true, date: n.date || null }))
          ];
          setNotifications(merged);
        }
      } catch {
        if (!cancelled) console.log("Failed to fetch fresh user data");
      }
    };

    const fetchDoctors = async () => {
      try {
        const res = await api.get('/user/getalldoctorsu');
        if (cancelled) return;
        if (res.data.success) {
          setDoctors(res.data.data);
        }
      } catch {
        if (!cancelled) console.log("Failed to fetch doctors");
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await api.get('/user/getuserappointments');
        if (cancelled) return;
        if (res.data.success) {
          setAppointments(res.data.data);
        }
      } catch {
        if (!cancelled) console.log("Failed to fetch appointments");
      }
    };

    fetchFreshUserData();
    fetchDoctors();
    fetchAppointments();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (activeMenu !== 'notifications') return;
    const data = JSON.parse(localStorage.getItem('userData'));
    const fetchNotifications = async () => {
      try {
        const res = await api.post('/user/getuserdata', { userId: data?._id });
        if (res.data.success) {
          const fresh = res.data.data;
          const merged = [
            ...(fresh.notification || []).map((n, i) => ({ id: n._id || `unread-${i}`, message: n.message, type: n.type, isRead: false, date: n.date || null })),
            ...(fresh.seennotification || []).map((n, i) => ({ id: n._id || `read-${i}`, message: n.message, type: n.type, isRead: true, date: n.date || null }))
          ];
          setNotifications(merged);
        }
      } catch {
        console.log("Failed to fetch notifications");
      }
    };
    fetchNotifications();
  }, [activeMenu]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const upcomingCount = appointments.filter(a => {
    if (a.status?.toLowerCase() !== 'approved') return false;
    try { return new Date(a.date).getTime() > Date.now(); } catch { return false; }
  }).length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const uniqueCities = useMemo(() => {
    const cities = new Set();
    doctors.forEach(d => {
      const addr = d.address || '';
      const parts = addr.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) cities.add(parts[parts.length - 1]);
      else if (parts.length === 1 && parts[0]) cities.add(parts[0]);
    });
    return ['All', ...Array.from(cities).sort()];
  }, [doctors]);

  const uniqueSpecialties = useMemo(() => {
    const specs = new Set();
    doctors.forEach(d => { if (d.specialization) specs.add(d.specialization); });
    return ['All', ...Array.from(specs).sort()];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      const q = doctorSearch.toLowerCase().trim();
      if (q) {
        const name = (d.fullName || '').toLowerCase();
        const spec = (d.specialization || '').toLowerCase();
        const addr = (d.address || '').toLowerCase();
        if (!name.includes(q) && !spec.includes(q) && !addr.includes(q)) return false;
      }
      if (specialtyFilter !== 'All' && d.specialization !== specialtyFilter) return false;
      if (availableOnly && !d.isAvailable) return false;
      if (cityFilter !== 'All') {
        const addr = d.address || '';
        const parts = addr.split(',').map(s => s.trim()).filter(Boolean);
        const city = parts.length > 1 ? parts[parts.length - 1] : (parts[0] || '');
        if (city !== cityFilter) return false;
      }
      return true;
    });
  }, [doctors, doctorSearch, cityFilter, specialtyFilter, availableOnly]);

  return (
    <div className="d-flex" style={{ height: '100vh', width: '100%', overflow: 'hidden' }}>
      <style>{`
        .sidebar-custom {
          background-color: #0F172A;
          width: 280px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          padding: 36px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: white;
          box-shadow: 4px 0 20px rgba(15, 23, 42, 0.15);
          flex-shrink: 0;
          z-index: 10;
          overflow-y: auto;
        }
        .menu-item-custom {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 12px;
          color: #94A3B8;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 8px;
          border: 1px solid transparent;
        }
        .menu-item-custom:hover {
          background-color: rgba(255, 255, 255, 0.04);
          color: white;
          transform: translateX(4px);
        }
        .menu-item-custom.active {
          background-color: #2563EB;
          color: white;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .content-custom {
          flex: 1;
          background-color: #F8FAFC;
          padding: 40px;
          overflow-y: auto;
          height: 100vh;
          margin-left: 280px;
          box-sizing: border-box;
        }
        .stat-card-custom {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          align-items: center;
          gap: 20px;
          height: 100%;
        }
        .stat-card-custom:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.04), 0 4px 8px -2px rgba(0, 0, 0, 0.04);
        }
        .stat-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .avatar-dropdown {
          position: absolute;
          bottom: 100%;
          left: 8px;
          right: 8px;
          background: white;
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 100;
          margin-bottom: 8px;
          animation: slideUp 0.2s ease;
        }
        .avatar-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #1E293B;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .avatar-dropdown-item:hover {
          background: #F1F5F9;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15,23,42,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        .modal-box {
          background: white;
          border-radius: 20px;
          padding: 32px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        .filter-section {
          background: white;
          border-radius: 20px;
          padding: 24px 28px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          margin-bottom: 28px;
        }
        .filter-search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #1E293B;
          background-color: #F8FAFC;
          transition: all 0.2s ease;
          outline: none;
        }
        .filter-search-input:focus {
          border-color: #2563EB;
          background-color: white;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }
        .filter-search-input::placeholder {
          color: #94A3B8;
          font-weight: 400;
        }
        .filter-dropdown {
          padding: 10px 14px;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #1E293B;
          background-color: #F8FAFC;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          appearance: auto;
        }
        .filter-dropdown:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
        }
        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background-color: #CBD5E1;
          border-radius: 12px;
          cursor: pointer;
          transition: background-color 0.25s ease;
          flex-shrink: 0;
        }
        .toggle-switch.active {
          background-color: #2563EB;
        }
        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: transform 0.25s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .toggle-switch.active::after {
          transform: translateX(20px);
        }
      `}</style>

      <div className="sidebar-custom">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px', paddingLeft: '8px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: 'white', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>MediCare</span>
          </div>

          <div>
            <div className={`menu-item-custom ${activeMenu === 'home' ? 'active' : ''}`} onClick={() => setActiveMenu('home')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Home</span>
            </div>

            <div className={`menu-item-custom ${activeMenu === 'appointments' ? 'active' : ''}`} onClick={() => setActiveMenu('appointments')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Appointments</span>
            </div>

            <div className={`menu-item-custom ${activeMenu === 'applydoctor' ? 'active' : ''}`} onClick={() => setActiveMenu('applydoctor')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
              <span>Apply Doctor</span>
            </div>

            <div className={`menu-item-custom ${activeMenu === 'notifications' ? 'active' : ''}`} onClick={() => setActiveMenu('notifications')} style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span style={{ backgroundColor: '#EF4444', color: 'white', fontSize: '11px', fontWeight: '700', borderRadius: '10px', padding: '2px 8px', minWidth: '20px', textAlign: 'center' }}>
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          {showProfileDropdown && (
            <div className="avatar-dropdown" id="profileDropdown">
              <div className="avatar-dropdown-item" id="viewProfileOption" onClick={() => {
                setShowProfileDropdown(false);
                setShowViewModal(true);
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>View Profile</span>
              </div>
              <div className="avatar-dropdown-item" id="editProfileOption" onClick={() => {
                setShowProfileDropdown(false);
                setEditForm({
                  name: userData?.name || '',
                  email: userData?.email || '',
                  phone: userData?.phone || ''
                });
                setShowEditModal(true);
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Edit Profile</span>
              </div>
            </div>
          )}
          <div 
            id="profileToggleBtn"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '20px', cursor: 'pointer' }}
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
              <div id="profileAvatarIcon" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white' }}>
                {userData?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div id="navUserName" style={{ fontSize: '14px', fontWeight: '700', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userData?.name}</div>
                <div id="navUserEmail" style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userData?.email}</div>
              </div>
            </div>
          </div>

          <div className="menu-item-custom" onClick={handleLogout} style={{ margin: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </div>
        </div>
      </div>

      <div className="content-custom">
        {activeMenu === 'home' && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', borderRadius: '24px', padding: '32px 40px', color: 'white', marginBottom: '32px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 20px rgba(59,130,246,0.1)' }}>
              <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Welcome Back, {userData?.name}! 👋</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', margin: 0, maxWidth: '600px', lineHeight: '1.6' }}>
                Manage your virtual medical workspace, consult with verified specialists, and track notifications to stay on top of your health.
              </p>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="stat-card-custom">
                  <div className="stat-icon-box" style={{ backgroundColor: '#EFF6FF' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upcoming</div>
                    <div style={{ color: '#1E293B', fontSize: '28px', fontWeight: '800', marginTop: '2px' }}>{upcomingCount}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="stat-card-custom">
                  <div className="stat-icon-box" style={{ backgroundColor: '#ECFDF5' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed</div>
                    <div style={{ color: '#1E293B', fontSize: '28px', fontWeight: '800', marginTop: '2px' }}>{completedCount}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="stat-card-custom">
                  <div className="stat-icon-box" style={{ backgroundColor: '#FFF7ED' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notifications</div>
                    <div style={{ color: '#1E293B', fontSize: '28px', fontWeight: '800', marginTop: '2px' }}>{unreadCount}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div>
          {activeMenu === 'home' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h4 style={{ color: '#1E293B', fontWeight: '800', fontSize: '20px', margin: 0 }}>Verified Medical Practitioners</h4>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>
                  {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
                </span>
              </div>

              <div className="filter-section">
                <div className="row g-3 align-items-center">
                  <div className="col-12 col-md-6 col-lg-4">
                    <div style={{ position: 'relative' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        className="filter-search-input"
                        placeholder="Search by name, specialization or city..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-6 col-md-3 col-lg-2">
                    <select className="filter-dropdown" style={{ width: '100%' }} value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                      {uniqueCities.map(c => <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-md-3 col-lg-2">
                    <select className="filter-dropdown" style={{ width: '100%' }} value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
                      {uniqueSpecialties.map(s => <option key={s} value={s}>{s === 'All' ? 'All Specialties' : s}</option>)}
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-2">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={`toggle-switch ${availableOnly ? 'active' : ''}`} onClick={() => setAvailableOnly(!availableOnly)} />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>Available Now</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                {uniqueSpecialties.map(s => (
                  <button
                    key={s}
                    onClick={() => setSpecialtyFilter(s)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '20px',
                      border: specialtyFilter === s ? '1px solid #2563EB' : '1px solid #E2E8F0',
                      backgroundColor: specialtyFilter === s ? '#2563EB' : 'white',
                      color: specialtyFilter === s ? 'white' : '#475569',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      boxShadow: specialtyFilter === s ? '0 2px 8px rgba(37,99,235,0.25)' : 'none'
                    }}
                  >
                    {s === 'All' ? 'All' : s}
                  </button>
                ))}
              </div>

              {filteredDoctors.length > 0 ? (
                <div className="row g-4">
                  {filteredDoctors.map((doctor) => (
                    <div key={doctor._id} className="col-md-6 col-lg-4">
                      <DoctorCard doctor={doctor} userId={userData?._id} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>No doctors found</p>
                  <p style={{ fontSize: '13px', margin: 0 }}>Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
          {activeMenu === 'appointments' && <UserAppointments appointments={appointments} setAppointments={setAppointments} />}
          {activeMenu === 'applydoctor' && <ApplyDoctor userId={userData?._id} />}
          {activeMenu === 'notifications' && <Notifications notifications={notifications} setNotifications={setNotifications} />}
        </div>
      </div>

      {showViewModal && (
        <div className="modal-overlay" id="viewProfileModal" onClick={() => setShowViewModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 }}>User Profile</h3>
              <button 
                id="closeViewProfileBtn"
                onClick={() => setShowViewModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '20px' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '24px', color: 'white' }}>
                  {userData?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', margin: 0 }}>{userData?.name}</h4>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                    {userData?.type || 'User'}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <div id="viewProfileName" style={{ fontSize: '15px', fontWeight: '500', color: '#1E293B' }}>{userData?.name}</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Email Address</label>
                <div id="viewProfileEmail" style={{ fontSize: '15px', fontWeight: '500', color: '#1E293B' }}>{userData?.email}</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <div id="viewProfilePhone" style={{ fontSize: '15px', fontWeight: '500', color: '#1E293B' }}>{userData?.phone || 'Not provided'}</div>
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                id="closeViewProfileFooterBtn"
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
                style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" id="editProfileModal" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Edit Profile</h3>
              <button 
                id="closeEditProfileBtn"
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '20px' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditProfileSubmit} id="editProfileForm">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="editProfileNameInput" style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '6px' }}>Full Name</label>
                  <input 
                    type="text" 
                    id="editProfileNameInput"
                    className="form-control"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', width: '100%' }}
                  />
                </div>

                <div>
                  <label htmlFor="editProfileEmailInput" style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '6px' }}>Email Address</label>
                  <input 
                    type="email" 
                    id="editProfileEmailInput"
                    className="form-control"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', width: '100%' }}
                  />
                </div>

                <div>
                  <label htmlFor="editProfilePhoneInput" style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '6px' }}>Phone Number (Optional)</label>
                  <input 
                    type="text" 
                    id="editProfilePhoneInput"
                    className="form-control"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="e.g. +1234567890"
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button"
                  id="cancelEditProfileBtn"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  id="saveProfileChangesBtn"
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;
