import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import api from '../services/api';

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeMenu, setActiveMenu] = useState('home');
  const [userData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userData')); } catch { return null; }
  });
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [adminDocPreview, setAdminDocPreview] = useState({ open: false, file: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/getallusers');
        if (res.data.success) setUsers(res.data.data);
      } catch {
        message.error("Failed to fetch users");
      }
    };

    const fetchDoctors = async () => {
      try {
        const res = await api.get('/admin/getalldoctors');
        if (res.data.success) setDoctors(res.data.data);
      } catch {
        message.error("Failed to fetch doctors");
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await api.get('/admin/getallAppointmentsAdmin');
        if (res.data.success) setAppointments(res.data.data);
      } catch {
        message.error("Failed to fetch appointments");
      }
    };

    fetchUsers();
    fetchDoctors();
    fetchAppointments();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleApprove = async (doctorId, userid) => {
    try {
      const res = await api.post('/admin/getapprove', { doctorId, userid });
      if (res.data.success) {
        message.success("Doctor Approved");
        const docRes = await api.get('/admin/getalldoctors');
        if (docRes.data.success) setDoctors(docRes.data.data);
        setExpandedDoctor(null);
      } else {
        message.error(res.data.message);
      }
    } catch {
      message.error("Failed to approve doctor");
    }
  };

  const handleReject = async (doctorId, userid) => {
    try {
      const res = await api.post('/admin/getreject', { doctorId, userid });
      if (res.data.success) {
        message.success("Doctor Rejected");
        const docRes = await api.get('/admin/getalldoctors');
        if (docRes.data.success) setDoctors(docRes.data.data);
        setExpandedDoctor(null);
      } else {
        message.error(res.data.message);
      }
    } catch {
      message.error("Failed to reject doctor");
    }
  };

  const activeDoctors = doctors.filter(d => d.status === 'approved');
  const pendingDoctors = doctors.filter(d => d.status === 'pending');

  const uniqueDoctors = Object.values(
    doctors.reduce((acc, doc) => {
      const key = doc.userId;
      if (!acc[key] || new Date(doc.createdAt) > new Date(acc[key].createdAt)) {
        acc[key] = doc;
      }
      return acc;
    }, {})
  );

  const filteredDoctors = uniqueDoctors.filter(d => {
    const matchesFilter = doctorFilter === 'all' || d.status === doctorFilter;
    const search = doctorSearch.toLowerCase();
    const matchesSearch = !search || d.fullName?.toLowerCase().includes(search) || d.specialization?.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });

  const doctorCounts = {
    all: uniqueDoctors.length,
    pending: uniqueDoctors.filter(d => d.status === 'pending').length,
    approved: uniqueDoctors.filter(d => d.status === 'approved').length,
    rejected: uniqueDoctors.filter(d => d.status === 'rejected').length,
  };

  const filteredUsers = users.filter(u => {
    const search = userSearch.toLowerCase();
    return !search || u.name?.toLowerCase().includes(search) || u.email?.toLowerCase().includes(search);
  });

  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = appointmentFilter === 'all' || apt.status === appointmentFilter;
    const search = appointmentSearch.toLowerCase();
    const matchesSearch = !search || apt.userInfo?.name?.toLowerCase().includes(search) || apt.doctorInfo?.fullName?.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });

  const appointmentCounts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    approved: appointments.filter(a => a.status === 'approved').length,
    rejected: appointments.filter(a => a.status === 'rejected').length,
  };

  const getDoctorStatusColor = (status) => {
    switch (status) {
      case 'approved': return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'rejected': return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      default: return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'approved': return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'rejected': return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      case 'completed': return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      default: return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    }
  };

  const toggleDoctor = (id) => {
    setExpandedDoctor(prev => prev === id ? null : id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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
        .data-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #E2E8F0;
        }
        .data-table thead th {
          background: #F8FAFC;
          color: #64748B;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 16px 20px;
          border-bottom: 1px solid #E2E8F0;
          text-align: left;
        }
        .data-table tbody tr {
          transition: background 0.15s ease;
        }
        .data-table tbody tr:hover {
          background: #F8FAFC;
        }
        .data-table tbody td {
          padding: 16px 20px;
          border-bottom: 1px solid #F1F5F9;
          color: #1E293B;
          font-size: 14px;
        }
        .data-table tbody tr:last-child td {
          border-bottom: none;
        }
        .btn-action {
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-action:active { transform: scale(0.96); }
        .doctor-row {
          background: white;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          margin-bottom: 12px;
          overflow: hidden;
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .doctor-row:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .doctor-row.expanded {
          border-color: #2563EB;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.1);
        }
        .doctor-row-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          cursor: pointer;
          transition: background 0.2s ease;
          gap: 16px;
        }
        .doctor-row-header:hover {
          background: #F8FAFC;
        }
        .doctor-expand-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
          opacity: 0;
        }
        .doctor-expand-content.open {
          max-height: 800px;
          opacity: 1;
        }
        .verification-card {
          background: #F8FAFC;
          border-top: 1px solid #E2E8F0;
          padding: 28px 24px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .info-label {
          font-size: 11px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #1E293B;
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
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

            <div className={`menu-item-custom ${activeMenu === 'users' ? 'active' : ''}`} onClick={() => setActiveMenu('users')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Users</span>
            </div>

            <div className={`menu-item-custom ${activeMenu === 'doctors' ? 'active' : ''}`} onClick={() => setActiveMenu('doctors')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>Doctors</span>
              {pendingDoctors.length > 0 && (
                <span style={{ marginLeft: 'auto', background: '#EF4444', color: 'white', fontSize: '11px', fontWeight: '700', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pendingDoctors.length}
                </span>
              )}
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
          </div>
        </div>

        <div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', fontSize: '16px' }}>
                {userData?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userData?.name}</div>
                <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Administrator</div>
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
            <div style={{ background: 'linear-gradient(135deg, #581C87 0%, #9333EA 50%, #7C3AED 100%)', borderRadius: '24px', padding: '32px 40px', color: 'white', marginBottom: '32px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 20px rgba(147,51,234,0.1)' }}>
              <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Admin Dashboard 👋</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', margin: 0, maxWidth: '600px', lineHeight: '1.6' }}>
                Manage users, review doctor applications, and monitor all platform activity from your centralized control panel.
              </p>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="stat-card-custom">
                  <div className="stat-icon-box" style={{ backgroundColor: '#EFF6FF' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Users</div>
                    <div style={{ color: '#1E293B', fontSize: '28px', fontWeight: '800', marginTop: '2px' }}>{users.length}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="stat-card-custom">
                  <div className="stat-icon-box" style={{ backgroundColor: '#ECFDF5' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Doctors</div>
                    <div style={{ color: '#1E293B', fontSize: '28px', fontWeight: '800', marginTop: '2px' }}>{activeDoctors.length}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="stat-card-custom">
                  <div className="stat-icon-box" style={{ backgroundColor: '#FFF7ED' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Appointments</div>
                    <div style={{ color: '#1E293B', fontSize: '28px', fontWeight: '800', marginTop: '2px' }}>{appointments.length}</div>
                  </div>
                </div>
              </div>
            </div>

            <h4 style={{ color: '#1E293B', fontWeight: '800', fontSize: '20px', marginBottom: '24px' }}>Pending Doctor Applications</h4>
            {pendingDoctors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>All caught up!</p>
                <p style={{ fontSize: '13px' }}>No pending doctor applications</p>
              </div>
            ) : (
              pendingDoctors.map((doctor) => {
                const sc = getDoctorStatusColor(doctor.status);
                return (
                  <div key={doctor._id} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', marginBottom: '12px', transition: 'all 0.2s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>{doctor.fullName}</div>
                          <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{doctor.specialization} · {doctor.experience} yrs exp</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                          Pending
                        </span>
                        <button className="btn-action" style={{ backgroundColor: '#10B981', color: 'white' }} onClick={() => setConfirmModal({ action: 'approve', doctorId: doctor._id, userId: doctor.userId, name: doctor.fullName })}>
                          Approve
                        </button>
                        <button className="btn-action" style={{ backgroundColor: '#EF4444', color: 'white' }} onClick={() => setConfirmModal({ action: 'reject', doctorId: doctor._id, userId: doctor.userId, name: doctor.fullName })}>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {activeMenu === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
              <h4 style={{ color: '#1E293B', fontWeight: '800', fontSize: '20px', margin: 0 }}>All Users</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: '280px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#1E293B', background: 'white', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>
                <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', backgroundColor: '#EFF6FF', color: '#2563EB', whiteSpace: 'nowrap' }}>{filteredUsers.length} users</span>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>No users found</p>
                <p style={{ fontSize: '13px' }}>Try a different search term</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ borderTopLeftRadius: '16px' }}>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th style={{ borderTopRightRadius: '16px' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id || index}>
                      <td style={{ fontWeight: '600', color: '#94A3B8' }}>{index + 1}</td>
                      <td style={{ fontWeight: '600' }}>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: user.isdoctor ? '#ECFDF5' : '#EFF6FF', color: user.isdoctor ? '#059669' : '#2563EB' }}>
                          {user.isdoctor ? 'Doctor' : 'Patient'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeMenu === 'doctors' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#1E293B', fontWeight: '800', fontSize: '20px', margin: 0 }}>Doctor Verification & Management</h4>
              <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0 0' }}>Review applications, verify credentials, and manage doctor accounts</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div style={{ flex: 1, background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>{doctorCounts.pending}</div>
                </div>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>{doctorCounts.approved}</div>
                </div>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rejected</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>{doctorCounts.rejected}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'approved', label: 'Active' },
                  { key: 'rejected', label: 'Rejected' },
                ].map(f => {
                  const isActive = doctorFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setDoctorFilter(f.key)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: isActive ? '1px solid #2563EB' : '1px solid #E2E8F0',
                        backgroundColor: isActive ? '#2563EB' : 'white',
                        color: isActive ? 'white' : '#64748B',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {f.label}
                      <span style={{
                        padding: '1px 7px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                        color: isActive ? 'white' : '#94A3B8',
                      }}>
                        {doctorCounts[f.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ position: 'relative', width: '280px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#1E293B', background: 'white', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
            </div>

            {filteredDoctors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>No doctors found</p>
                <p style={{ fontSize: '13px' }}>{doctorSearch ? 'Try a different search term' : 'No doctors match this filter'}</p>
              </div>
            ) : (
              filteredDoctors.map((doctor) => {
                const sc = getDoctorStatusColor(doctor.status);
                const isExpanded = expandedDoctor === doctor._id;
                return (
                  <div key={doctor._id} className={`doctor-row ${isExpanded ? 'expanded' : ''}`}>
                    <div className="doctor-row-header" onClick={() => toggleDoctor(doctor._id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: doctor.status === 'approved' ? '#ECFDF5' : doctor.status === 'pending' ? '#FFF7ED' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={doctor.status === 'approved' ? '#059669' : doctor.status === 'pending' ? '#F59E0B' : '#DC2626'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{doctor.fullName}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{doctor.specialization} · {doctor.email}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                        <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                          {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                        </span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    <div className={`doctor-expand-content ${isExpanded ? 'open' : ''}`}>
                      <div className="verification-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                          </svg>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>Verification Details</span>
                        </div>

                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Full Name</span>
                            <span className="info-value">{doctor.fullName}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Email Address</span>
                            <span className="info-value">{doctor.email}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Phone Number</span>
                            <span className="info-value">{doctor.phone}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Address</span>
                            <span className="info-value">{doctor.address}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Specialization</span>
                            <span className="info-value">{doctor.specialization}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Experience</span>
                            <span className="info-value">{doctor.experience} years</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Consultation Fees</span>
                            <span className="info-value">₹{doctor.fees}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Available Timings</span>
                            <span className="info-value">{doctor.timings?.join(' - ') || 'N/A'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Application Status</span>
                            <span className="info-value" style={{ color: sc.text }}>{doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Application Date</span>
                            <span className="info-value">{formatDate(doctor.createdAt)}</span>
                          </div>
                        </div>

                        {doctor.status === 'pending' && (
                          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span style={{ fontSize: '13px', color: '#64748B', flex: 1 }}>Review the information above carefully before making a decision</span>
                            <button className="btn-action" style={{ backgroundColor: '#10B981', color: 'white', padding: '10px 24px' }} onClick={() => setConfirmModal({ action: 'approve', doctorId: doctor._id, userId: doctor.userId, name: doctor.fullName })}>
                              Approve
                            </button>
                            <button className="btn-action" style={{ backgroundColor: '#EF4444', color: 'white', padding: '10px 24px' }} onClick={() => setConfirmModal({ action: 'reject', doctorId: doctor._id, userId: doctor.userId, name: doctor.fullName })}>
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeMenu === 'appointments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <h4 style={{ color: '#1E293B', fontWeight: '800', fontSize: '20px', margin: 0 }}>Appointments</h4>
              <div style={{ position: 'relative', width: '280px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by patient or doctor..."
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#1E293B', background: 'white', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'approved', label: 'Approved' },
                { key: 'rejected', label: 'Rejected' },
              ].map(f => {
                const isActive = appointmentFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setAppointmentFilter(f.key)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: isActive ? '1px solid #2563EB' : '1px solid #E2E8F0',
                      backgroundColor: isActive ? '#2563EB' : 'white',
                      color: isActive ? 'white' : '#64748B',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {f.label}
                    <span style={{
                      padding: '1px 7px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                      color: isActive ? 'white' : '#94A3B8',
                    }}>
                      {appointmentCounts[f.key]}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>No appointments found</p>
                <p style={{ fontSize: '13px' }}>{appointmentSearch ? 'Try a different search term' : 'No appointments match this filter'}</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ borderTopLeftRadius: '16px' }}>Appointment ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Documents</th>
                    <th style={{ borderTopRightRadius: '16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment, index) => {
                    const sc = getAppointmentStatusColor(appointment.status);
                    const docs = appointment.documents || [];
                    return (
                      <tr key={appointment._id || index}>
                        <td style={{ fontWeight: '600', color: '#1E293B' }}>#{appointment._id?.slice(-6).toUpperCase() || '—'}</td>
                        <td style={{ fontWeight: '600' }}>{appointment.userInfo?.name}</td>
                        <td>{appointment.doctorInfo?.fullName}</td>
                        <td>{appointment.date}</td>
                        <td>
                          {docs.length > 0 ? (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {docs.slice(0, 2).map((doc, i) => (
                                <button key={i} onClick={() => setAdminDocPreview({ open: true, file: doc })} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '10px', fontWeight: '500', color: '#475569', cursor: 'pointer' }}>
                                  {doc.fileType?.startsWith('image/') ? (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                  ) : (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                  )}
                                  {doc.name?.length > 12 ? doc.name.slice(0, 12) + '...' : doc.name}
                                </button>
                              ))}
                              {docs.length > 2 && <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>+{docs.length - 2}</span>}
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>None</span>
                          )}
                        </td>
                        <td>
                          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setConfirmModal(null)} />
          <div style={{ position: 'relative', background: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', margin: '20px', animation: 'modalSlideUp 0.3s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: confirmModal.action === 'approve' ? '#ECFDF5' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                {confirmModal.action === 'approve' ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                )}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1E293B', margin: '0 0 8px 0' }}>Are you sure?</h3>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: '1.6' }}>
                You are about to <span style={{ fontWeight: '700', color: confirmModal.action === 'approve' ? '#059669' : '#DC2626' }}>{confirmModal.action === 'approve' ? 'approve' : 'reject'}</span> the application of <span style={{ fontWeight: '600', color: '#1E293B' }}>{confirmModal.name}</span>.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{ flex: 1, padding: '12px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#64748B', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.action === 'approve') {
                    handleApprove(confirmModal.doctorId, confirmModal.userId);
                  } else {
                    handleReject(confirmModal.doctorId, confirmModal.userId);
                  }
                  setConfirmModal(null);
                }}
                className="btn-action"
                style={{ flex: 1, padding: '12px 20px', backgroundColor: confirmModal.action === 'approve' ? '#10B981' : '#EF4444', color: 'white', fontSize: '14px' }}
              >
                {confirmModal.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
      {adminDocPreview.open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setAdminDocPreview({ open: false, file: null })}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} />
          <div style={{ position: 'relative', background: 'white', borderRadius: '20px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                {adminDocPreview.file?.fileType?.startsWith('image/') ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                )}
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminDocPreview.file?.name}</span>
              </div>
              <button onClick={() => setAdminDocPreview({ open: false, file: null })} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', maxHeight: 'calc(90vh - 60px)', overflow: 'auto', background: adminDocPreview.file?.fileType?.startsWith('image/') ? '#F1F5F9' : 'white' }}>
              {adminDocPreview.file?.fileType?.startsWith('image/') ? (
                <img src={adminDocPreview.file.data} alt={adminDocPreview.file.name} style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 100px)', borderRadius: '12px', objectFit: 'contain' }} />
              ) : adminDocPreview.file?.fileType === 'application/pdf' ? (
                <iframe src={adminDocPreview.file.data} title={adminDocPreview.file.name} style={{ width: '100%', height: 'calc(90vh - 100px)', border: 'none', borderRadius: '12px' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>Preview not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
