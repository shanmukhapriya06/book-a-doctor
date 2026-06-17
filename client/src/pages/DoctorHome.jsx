import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import api from '../services/api';

const DoctorHome = () => {
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userData')); } catch { return null; }
  });
  const [doctorData, setDoctorData] = useState(null);
  const [activeMenu, setActiveMenu] = useState('home');
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userData'))?.notification || []; } catch { return []; }
  });
  const [seenNotifications, setSeenNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userData'))?.seennotification || []; } catch { return []; }
  });
  const [apptFilter, setApptFilter] = useState('All');
  const [apptSearch, setApptSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, aptId: null, patientName: '', date: '', status: '' });
  const [conflictModal, setConflictModal] = useState({ open: false, conflict: null, pending: null });
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifDeleteModal, setNotifDeleteModal] = useState(false);
  const [notifDeleteSingle, setNotifDeleteSingle] = useState({ open: false, index: null, notif: null });
  const [docPreview, setDocPreview] = useState({ open: false, file: null });
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '', address: '', specialization: '', experience: '', fees: '', timingsStart: '09:00', timingsEnd: '17:00' });
  const [changedFields, setChangedFields] = useState({});
  const [isAvailable, setIsAvailable] = useState(true);
  const navigate = useNavigate();

  const formatDoctorName = (name) => {
    if (!name) return '';
    return /^dr[\s.]/i.test(name.trim()) ? name.trim() : `Dr. ${name.trim()}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '', time: '' };
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return { date: '', time: '' };
      const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      return { date, time };
    } catch {
      return { date: '', time: '' };
    }
  };

  const populateProfileForm = useCallback((doc) => {
    setProfileForm({
      fullName: doc?.fullName || userData?.name || '',
      phone: doc?.phone || '',
      address: doc?.address || '',
      specialization: doc?.specialization || '',
      experience: doc?.experience ?? '',
      fees: doc?.fees ?? '',
      timingsStart: doc?.timings?.[0] || '09:00',
      timingsEnd: doc?.timings?.[1] || '17:00',
    });
    setIsAvailable(doc?.isAvailable ?? true);
    setChangedFields({});
  }, [userData]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('userData'));

    const fetchFreshUserData = async () => {
      try {
        const res = await api.post('/user/getuserdata', { userId: data?._id });
        if (res.data.success) {
          const fresh = { ...res.data.data, password: undefined };
          localStorage.setItem('userData', JSON.stringify(fresh));
          setUserData(fresh);
          setNotifications(fresh.notification || []);
          setSeenNotifications(fresh.seennotification || []);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await api.get('/doctor/getdoctorappointments');
        if (res.data.success) {
          setAppointments(res.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const initProfile = async () => {
      try {
        const res = await api.get('/doctor/getprofile');
        if (res.data.success) {
          setDoctorData(res.data.data);
          populateProfileForm(res.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchFreshUserData();
    fetchAppointments();
    initProfile();
  }, [populateProfileForm]);

  useEffect(() => {
    if (activeMenu !== 'notifications') return;
    const data = JSON.parse(localStorage.getItem('userData'));
    const fetchNotifications = async () => {
      try {
        const res = await api.post('/user/getuserdata', { userId: data?._id });
        if (res.data.success) {
          const fresh = res.data.data;
          setNotifications(fresh.notification || []);
          setSeenNotifications(fresh.seennotification || []);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchNotifications();
  }, [activeMenu]);

  const fetchDoctorProfile = async () => {
    try {
      const res = await api.get('/doctor/getprofile');
      if (res.data.success) {
        setDoctorData(res.data.data);
        return res.data.data;
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  };

  const handleOpenProfile = async () => {
    setShowAvatarMenu(false);
    setShowProfileModal(true);
    const fresh = await fetchDoctorProfile();
    if (fresh) {
      populateProfileForm(fresh);
    } else if (doctorData) {
      populateProfileForm(doctorData);
    }
  };

  const handleToggleAvailability = async () => {
    const newValue = !isAvailable;
    setIsAvailable(newValue);
    try {
      console.log('TOGGLE: sending request', { userId: userData?._id, isAvailable: newValue });
      const res = await api.post('/doctor/toggleavailability', { userId: userData._id, isAvailable: newValue });
      console.log('TOGGLE: response =', res.data);
      if (!res.data.success) {
        setIsAvailable(!newValue);
        message.error(res.data.message || "Failed to update availability");
      }
    } catch (error) {
      console.log('TOGGLE: error =', error.response?.data || error.message);
      setIsAvailable(!newValue);
      message.error(error.response?.data?.message || "Failed to update availability");
    }
  };

  const handleProfileFieldChange = (field, value) => {
    const original = field === 'timingsStart'
      ? (doctorData?.timings?.[0] || '09:00')
      : field === 'timingsEnd'
      ? (doctorData?.timings?.[1] || '17:00')
      : (doctorData?.[field] || (field === 'fullName' ? userData?.name : ''));
    setProfileForm(prev => ({ ...prev, [field]: value }));
    setChangedFields(prev => ({ ...prev, [field]: value !== String(original) }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    const payload = {
      userId: userData._id,
      fullName: profileForm.fullName,
      phone: profileForm.phone,
      address: profileForm.address,
      specialization: profileForm.specialization,
      experience: Number(profileForm.experience) || 0,
      fees: Number(profileForm.fees) || 0,
      timings: [profileForm.timingsStart, profileForm.timingsEnd],
    };
    try {
      const res = await api.post('/doctor/updateprofile', payload);
      if (res.data.success) {
        const fresh = await fetchDoctorProfile();
        if (fresh) populateProfileForm(fresh);
        message.success("Profile updated successfully");
        setShowProfileModal(false);
      } else {
        message.error(res.data.message);
      }
    } catch {
      message.error("Failed to update profile");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleStatusConfirm = async () => {
    const { aptId, action, userId } = confirmModal;
    setConfirmModal({ open: false, action: null, aptId: null, patientName: '', date: '', status: '' });
    try {
      const res = await api.post('/doctor/handlestatus', { appointId: aptId, status: action, userId });
      if (res.data.success) {
        message.success(`Appointment ${action}`);
        const apptRes = await api.get('/doctor/getdoctorappointments');
        if (apptRes.data.success) setAppointments(apptRes.data.data);
        const freshRes = await api.post('/user/getuserdata', { userId: userData._id });
        if (freshRes.data.success) {
          const fresh = freshRes.data.data;
          setNotifications(fresh.notification || []);
          setSeenNotifications(fresh.seennotification || []);
          const updatedUser = { ...userData, notification: fresh.notification || [], seennotification: fresh.seennotification || [] };
          localStorage.setItem('userData', JSON.stringify(updatedUser));
          setUserData(updatedUser);
        }
      } else {
        message.error(res.data.message);
      }
    } catch {
      message.error("Something went wrong");
    }
  };

  const openConfirmModal = (aptId, action, userId, patientName, date) => {
    if (action === 'approved') {
      const conflict = appointments.find(
        a => a._id !== aptId && a.status === 'approved' && a.date === date
      );
      if (conflict) {
        const { date: d, time: t } = formatDateTime(conflict.date);
        setConflictModal({
          open: true,
          conflict: {
            patientName: conflict.userInfo?.name || 'Patient',
            date: d,
            time: t,
          },
          pending: { aptId, action, userId, patientName, date },
        });
        return;
      }
    }
    setConfirmModal({ open: true, action, aptId, userId, patientName, date });
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.post('/user/getallnotification', { userId: userData._id });
      if (res.data.success) {
        setNotifications([]);
        const updatedSeen = res.data.data?.seennotification || [];
        setSeenNotifications(updatedSeen);
        const updatedUser = {
          ...userData,
          notification: [],
          seennotification: updatedSeen
        };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        message.success("Marked all as read");
      }
    } catch {
      message.error("Failed to mark notifications");
    }
  };

  const handleDeleteAll = async () => {
    try {
      const res = await api.post('/user/deleteallnotification', { userId: userData._id });
      if (res.data.success) {
        setNotifications([]);
        setSeenNotifications([]);
        const updatedUser = {
          ...userData,
          notification: [],
          seennotification: []
        };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        message.success("Notifications cleared");
      }
    } catch {
      message.error("Failed to delete notifications");
    }
  };

  const handleMarkAsRead = async (index) => {
    const notifToMove = notifications[index];
    if (!notifToMove) return;
    const newNotifications = notifications.filter((_, i) => i !== index);
    const newSeen = [...seenNotifications, notifToMove];
    setNotifications(newNotifications);
    setSeenNotifications(newSeen);
    const updatedUser = {
      ...userData,
      notification: newNotifications,
      seennotification: newSeen
    };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    setUserData(updatedUser);
    try {
      await api.post('/user/syncnotifications', {
        userId: userData._id,
        notification: newNotifications,
        seennotification: newSeen
      });
    } catch (error) {
      console.log(error);
    }
    message.success("Marked as read");
  };

  const handleDeleteSingle = async () => {
    const { index, notif } = notifDeleteSingle;
    if (index === null || !notif) return;
    const isInUnread = notifications.includes(notif);
    let newNotifications, newSeen;
    if (isInUnread) {
      newNotifications = notifications.filter((_, i) => i !== index);
      newSeen = [...seenNotifications];
    } else {
      newNotifications = [...notifications];
      const seenIndex = seenNotifications.indexOf(notif);
      newSeen = seenNotifications.filter((_, i) => i !== seenIndex);
    }
    setNotifications(newNotifications);
    setSeenNotifications(newSeen);
    const updatedUser = {
      ...userData,
      notification: newNotifications,
      seennotification: newSeen
    };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    setUserData(updatedUser);
    setNotifDeleteSingle({ open: false, index: null, notif: null });
    try {
      await api.post('/user/syncnotifications', {
        userId: userData._id,
        notification: newNotifications,
        seennotification: newSeen
      });
    } catch (error) {
      console.log(error);
    }
    message.success("Notification deleted");
  };

  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const approvedCount = appointments.filter(a => a.status === 'approved').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const allNotifications = [...notifications, ...seenNotifications];
  const unreadCount = notifications.length;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayAppointments = appointments
    .filter(a => a.date?.startsWith(today) && a.status === 'approved')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(0, 5);
  const recentActivity = [...appointments].filter(a => a.status !== 'pending').reverse().slice(0, 5);

  const filteredAppointments = appointments.filter(a => {
    const matchFilter = apptFilter === 'All' || a.status === apptFilter.toLowerCase();
    const matchSearch = apptSearch === '' || a.userInfo?.name?.toLowerCase().includes(apptSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const apptFilterCounts = {
    All: appointments.length,
    Pending: appointments.filter(a => a.status === 'pending').length,
    Approved: appointments.filter(a => a.status === 'approved').length,
    Rejected: appointments.filter(a => a.status === 'rejected').length,
    Completed: appointments.filter(a => a.status === 'completed').length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'rejected': return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      case 'completed': return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      default: return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    }
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
          border-radius: 16px;
          padding: 22px 24px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 16px;
          height: 100%;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .stat-card-custom::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          border-radius: 16px 16px 0 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .stat-card-custom:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px -5px rgba(0,0,0,0.08), 0 4px 10px -5px rgba(0,0,0,0.04);
          border-color: transparent;
        }
        .stat-card-custom:hover::after {
          opacity: 1;
        }
        .stat-card-custom.stat-total::after { background: #2563EB; }
        .stat-card-custom.stat-pending::after { background: #F59E0B; }
        .stat-card-custom.stat-approved::after { background: #10B981; }
        .stat-card-custom.stat-completed::after { background: #2563EB; }
        .stat-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .stat-card-custom:hover .stat-icon-box {
          transform: scale(1.08);
        }
        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #F1F5F9;
          transition: background 0.15s ease;
        }
        .activity-item:last-child { border-bottom: none; }
        .activity-item:hover {
          background: #F8FAFC;
          margin: 0 -16px;
          padding-left: 16px;
          padding-right: 16px;
          border-radius: 10px;
        }
        .activity-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }
        .appt-card {
          background: white;
          border-radius: 14px;
          padding: 16px 20px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
          margin-bottom: 10px;
        }
        .appt-card:hover {
          box-shadow: 0 6px 12px -3px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 18px 20px;
          background: white;
          border-radius: 14px;
          border: 1px solid #E2E8F0;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        .notif-item:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .notif-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .notif-item:hover .notif-actions {
          opacity: 1;
        }
        .notif-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          background: transparent;
        }
        .notif-action-btn:active {
          transform: scale(0.9);
        }
        .notif-action-btn.mark-read {
          color: #2563EB;
        }
        .notif-action-btn.mark-read:hover {
          background: #EFF6FF;
        }
        .notif-action-btn.delete {
          color: #EF4444;
        }
        .notif-action-btn.delete:hover {
          background: #FEF2F2;
        }
        .profile-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }
        .profile-card label {
          font-size: 13px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          display: block;
        }
        .profile-card input, .profile-card select {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          font-size: 14px;
          color: #1E293B;
          background: #F8FAFC;
          transition: all 0.2s ease;
        }
        .profile-card input:focus, .profile-card select:focus {
          outline: none;
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
          background: white;
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
        .profile-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
          padding: 20px;
        }
        .profile-modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0,0,0,0.25);
          animation: slideUp 0.3s ease;
        }
        .profile-modal::-webkit-scrollbar { width: 6px; }
        .profile-modal::-webkit-scrollbar-track { background: transparent; }
        .profile-modal::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        .pm-header {
          background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
          border-radius: 20px 20px 0 0;
          padding: 28px 32px 24px;
          position: relative;
          overflow: hidden;
        }
        .pm-header::before {
          content: '';
          position: absolute;
          top: -40%;
          right: -15%;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
        }
        .pm-header::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          pointer-events: none;
        }
        .pm-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }
        .pm-close-btn {
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          transition: background 0.15s;
          background: rgba(255,255,255,0.1);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pm-close-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .pm-body {
          padding: 28px 32px 32px;
        }
        .pm-section {
          margin-bottom: 24px;
        }
        .pm-section:last-child { margin-bottom: 0; }
        .pm-section-title {
          font-size: 11px;
          font-weight: 700;
          color: #2563EB;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 2px solid #EFF6FF;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pm-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .pm-field { display: flex; flex-direction: column; }
        .pm-field-full { grid-column: 1 / -1; }
        .pm-label {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pm-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .pm-input-icon {
          position: absolute;
          left: 12px;
          color: #94A3B8;
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .pm-input {
          width: 100%;
          padding: 11px 14px 11px 38px;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          font-size: 14px;
          color: #1E293B;
          background: #F8FAFC;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .pm-input:focus {
          outline: none;
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
          background: white;
        }
        .pm-input::placeholder { color: #CBD5E1; }
        .pm-input-changed {
          border-color: #2563EB !important;
          background: #EFF6FF !important;
          box-shadow: 0 0 0 2px rgba(37,99,235,0.1) !important;
        }
        .pm-footer {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding-top: 24px;
          border-top: 1px solid #F1F5F9;
          margin-top: 28px;
        }
        .pm-btn-cancel {
          padding: 11px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          border: 1.5px solid #E2E8F0;
          cursor: pointer;
          background: white;
          color: #64748B;
          transition: all 0.2s ease;
        }
        .pm-btn-cancel:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }
        .pm-btn-save {
          padding: 11px 28px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: white;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pm-btn-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(37,99,235,0.4);
        }
        .pm-btn-save:active { transform: translateY(0); }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 576px) {
          .pm-grid { grid-template-columns: 1fr; }
          .pm-header { padding: 24px 20px 20px; }
          .pm-body { padding: 24px 20px 28px; }
          .pm-footer { flex-direction: column-reverse; }
          .pm-btn-cancel, .pm-btn-save { width: 100%; justify-content: center; padding: 13px; }
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

            <div className={`menu-item-custom ${activeMenu === 'notifications' ? 'active' : ''}`} onClick={() => setActiveMenu('notifications')} style={{ position: 'relative' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', right: '12px', background: '#EF4444', color: 'white', fontSize: '11px', fontWeight: '700', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '20px', cursor: 'pointer', paddingLeft: '8px', paddingRight: '8px', borderRadius: '12px', transition: 'background 0.2s' }}
            onClick={() => setShowAvatarMenu(!showAvatarMenu)}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', fontSize: '16px', flexShrink: 0 }}>
                {userData?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{formatDoctorName(userData?.name)}</div>
                <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{doctorData?.specialization || 'Doctor'}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: showAvatarMenu ? 'rotate(180deg)' : 'rotate(0)' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {showAvatarMenu && (
            <div className="avatar-dropdown">
              <div className="avatar-dropdown-item" onClick={handleOpenProfile}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Edit Profile
              </div>
              <div className="avatar-dropdown-item" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="content-custom">
        {activeMenu === 'home' && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', borderRadius: '24px', padding: '32px 40px', color: 'white', marginBottom: '32px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 20px rgba(59,130,246,0.1)' }}>
              <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Welcome {formatDoctorName(userData?.name)}! 👋</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', margin: 0, maxWidth: '600px', lineHeight: '1.6' }}>
                Manage your appointments, review patient requests, and update your professional profile to keep your practice running smoothly.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', background: isAvailable ? 'linear-gradient(135deg, #ECFDF5, #F0FDF4)' : 'linear-gradient(135deg, #FEF2F2, #FFF1F2)', borderRadius: '16px', border: `1px solid ${isAvailable ? '#A7F3D0' : '#FECACA'}`, marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: isAvailable ? '#D1FAE5' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isAvailable ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>Doctor Availability</div>
                  <div style={{ fontSize: '13px', color: isAvailable ? '#059669' : '#DC2626', fontWeight: '600', marginTop: '2px' }}>
                    {isAvailable ? '🟢 Available for Booking' : '🔴 Unavailable for Booking'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleAvailability}
                style={{
                  position: 'relative', width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer', flexShrink: 0,
                  backgroundColor: isAvailable ? '#10B981' : '#E2E8F0',
                  transition: 'background-color 0.3s ease',
                }}
              >
                <div style={{
                  position: 'absolute', top: '3px', left: isAvailable ? '27px' : '3px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.3s ease',
                }} />
              </button>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-md-3 col-sm-6">
                <div className="stat-card-custom stat-total">
                  <div className="stat-icon-box" style={{ backgroundColor: '#EFF6FF' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
                    <div style={{ color: '#1E293B', fontSize: '26px', fontWeight: '800', marginTop: '2px', lineHeight: 1.1 }}>{totalAppointments}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="stat-card-custom stat-pending">
                  <div className="stat-icon-box" style={{ backgroundColor: '#FFFBEB' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending</div>
                    <div style={{ color: '#1E293B', fontSize: '26px', fontWeight: '800', marginTop: '2px', lineHeight: 1.1 }}>{pendingCount}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="stat-card-custom stat-approved">
                  <div className="stat-icon-box" style={{ backgroundColor: '#ECFDF5' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approved</div>
                    <div style={{ color: '#1E293B', fontSize: '26px', fontWeight: '800', marginTop: '2px', lineHeight: 1.1 }}>{approvedCount}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="stat-card-custom stat-completed">
                  <div className="stat-icon-box" style={{ backgroundColor: '#EFF6FF' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed</div>
                    <div style={{ color: '#1E293B', fontSize: '26px', fontWeight: '800', marginTop: '2px', lineHeight: 1.1 }}>{completedCount}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div>
          {activeMenu === 'home' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h4 style={{ color: '#1E293B', fontWeight: '800', fontSize: '20px', margin: 0 }}>Today's Appointments</h4>
                <button onClick={() => setActiveMenu('appointments')} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0', transition: 'color 0.15s' }}>
                  View All Appointments
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
              {todayAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 20px', color: '#94A3B8', background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '32px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📅</div>
                  <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>No approved appointments scheduled for today</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '8px', marginBottom: '32px' }}>
                  {todayAppointments.map((apt) => {
                    const { time: aptTimeStr } = formatDateTime(apt.date);
                    const shortId = apt._id?.slice(-6).toUpperCase() || '';
                    const hasReason = apt.message?.trim();
                    return (
                      <div key={apt._id} style={{ background: 'white', borderRadius: '12px', padding: '12px 16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'box-shadow 0.2s' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{apt.userInfo?.name || 'Patient'}</span>
                            {shortId && <span style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', fontFamily: 'monospace', background: '#F8FAFC', padding: '1px 5px', borderRadius: '4px', border: '1px solid #F1F5F9' }}>#{shortId}</span>}
                          </div>
                          {hasReason && (
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {apt.message.trim()}
                            </div>
                          )}
                        </div>
                        {aptTimeStr && (
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', whiteSpace: 'nowrap', flexShrink: 0 }}>{aptTimeStr}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h4 style={{ color: '#1E293B', fontWeight: '800', fontSize: '18px', margin: 0 }}>Recent Activity</h4>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }} />
                </div>
                {recentActivity.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 20px', color: '#94A3B8' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>No recent activity</p>
                    <p style={{ fontSize: '12px', marginTop: '4px', color: '#CBD5E1' }}>Actions on appointments will appear here</p>
                  </div>
                ) : (
                  <div>
                    {recentActivity.map((apt) => {
                      const sc = getStatusColor(apt.status);
                      const statusLabel = apt.status.charAt(0).toUpperCase() + apt.status.slice(1);
                      return (
                        <div key={apt._id} className="activity-item">
                          <div className="activity-dot" style={{ backgroundColor: sc.text }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                              <span style={{ fontWeight: '700' }}>{apt.userInfo?.name}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{(() => { const { date: d, time: t } = formatDateTime(apt.date); return d ? `${d}${t ? ` • ${t}` : ''}` : ''; })()}</div>
                          </div>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, flexShrink: 0 }}>
                            {statusLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'appointments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h4 style={{ color: '#1E293B', fontWeight: '800', fontSize: '20px', margin: 0 }}>All Appointments</h4>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: isAvailable ? '#ECFDF5' : '#FEF2F2', color: isAvailable ? '#059669' : '#DC2626', border: `1px solid ${isAvailable ? '#A7F3D0' : '#FECACA'}` }}>
                    {isAvailable ? '🟢' : '🔴'} {isAvailable ? 'Available for Booking' : 'Unavailable for Booking'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {Object.entries(apptFilterCounts).map(([label, count]) => (
                    <button key={label} onClick={() => setApptFilter(label)} style={{
                      padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer',
                      backgroundColor: apptFilter === label ? '#2563EB' : '#F1F5F9',
                      color: apptFilter === label ? 'white' : '#64748B',
                      transition: 'all 0.2s ease'
                    }}>
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="text" placeholder="Search by patient name..." value={apptSearch} onChange={(e) => setApptSearch(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px 12px 42px', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', color: '#1E293B', background: 'white', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
                  onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                />
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
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>Try adjusting your search or filter</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {filteredAppointments.map((apt) => {
                    const sc = getStatusColor(apt.status);
                    const docs = apt.documents || [];
                    const { date: aptDateStr, time: aptTimeStr } = formatDateTime(apt.date);
                    const shortId = apt._id?.slice(-6).toUpperCase() || '—';
                    const hasReason = apt.message?.trim();
                    const hasDocs = docs.length > 0;
                    return (
                      <div key={apt._id} className="appt-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '14px 18px 10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={sc.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#1E293B' }}>{apt.userInfo?.name || 'Patient'}</span>
                                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', fontFamily: 'monospace', letterSpacing: '0.5px', background: '#F8FAFC', padding: '2px 6px', borderRadius: '4px', border: '1px solid #F1F5F9' }}>#{shortId}</span>
                                </div>
                              </div>
                            </div>
                            <span style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: '700', backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </div>

                          {(aptDateStr || aptTimeStr) && (
                            <div style={{ fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: hasReason || hasDocs ? '8px' : 0 }}>
                              {aptDateStr}{aptTimeStr ? ` • ${aptTimeStr}` : ''}
                            </div>
                          )}

                          {hasReason && (
                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '6px', marginBottom: hasDocs ? '6px' : 0 }}>
                              <div style={{ fontSize: '12px', color: '#475569', whiteSpace: 'pre-wrap' }}>
                                {apt.message.trim()}
                              </div>
                            </div>
                          )}

                          {hasDocs && (
                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '6px', marginBottom: '4px' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {docs.map((doc, i) => (
                                  <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                                    {doc.fileType?.startsWith('image/') ? (
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                    ) : (
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    )}
                                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#475569', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                                    <button onClick={() => setDocPreview({ open: true, file: doc })} style={{ padding: '1px 6px', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'white', color: '#2563EB', fontSize: '10px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>View</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {(apt.status === 'pending' || apt.status === 'approved') && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', padding: '8px 18px', borderTop: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                            {apt.status === 'pending' && (
                              <>
                                <button className="btn-action" style={{ backgroundColor: '#10B981', color: 'white', padding: '6px 14px', fontSize: '11px' }} onClick={() => openConfirmModal(apt._id, 'approved', apt.userId, apt.userInfo?.name, apt.date)}>
                                  Approve
                                </button>
                                <button className="btn-action" style={{ backgroundColor: '#EF4444', color: 'white', padding: '6px 14px', fontSize: '11px' }} onClick={() => openConfirmModal(apt._id, 'rejected', apt.userId, apt.userInfo?.name, apt.date)}>
                                  Reject
                                </button>
                              </>
                            )}
                            {apt.status === 'approved' && (
                              <button className="btn-action" style={{ backgroundColor: '#2563EB', color: 'white', padding: '6px 14px', fontSize: '11px' }} onClick={() => openConfirmModal(apt._id, 'completed', apt.userId, apt.userInfo?.name, apt.date)}>
                                Mark Complete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeMenu === 'notifications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h4 style={{ color: '#1E293B', fontWeight: '800', fontSize: '20px', margin: 0 }}>Notifications</h4>
                  {unreadCount > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '12px', fontWeight: '700' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      {unreadCount} Unread
                    </span>
                  )}
                </div>
                {allNotifications.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-action" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }} onClick={handleMarkAllRead}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Mark All Read
                    </button>
                    <button className="btn-action" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }} onClick={() => setNotifDeleteModal(true)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete All
                    </button>
                  </div>
                )}
              </div>
              {allNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px dashed #E2E8F0' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', margin: '0 0 4px 0' }}>No notifications available.</p>
                  <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>You're all caught up!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {allNotifications.map((notif, index) => {
                    const isUnread = notifications.includes(notif);
                    const unreadIndex = isUnread ? index : null;
                    const seenIndex = !isUnread ? index - notifications.length : null;
                    return (
                      <div key={index} className="notif-item" style={{ opacity: isUnread ? 1 : 0.55, backgroundColor: isUnread ? '#F0F7FF' : 'white', border: isUnread ? '1px solid #BFDBFE' : '1px solid #E2E8F0', transition: 'all 0.2s ease' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: isUnread ? '#DBEAFE' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isUnread ? '#2563EB' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            {isUnread && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB', flexShrink: 0 }} />}
                            <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: isUnread ? '600' : '500' }}>{notif.message}</div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>{notif.type}</div>
                        </div>
                        <div className="notif-actions">
                          {isUnread && (
                            <button className="notif-action-btn mark-read" title="Mark as read" onClick={() => handleMarkAsRead(unreadIndex)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          )}
                          <button className="notif-action-btn delete" title="Delete" onClick={() => setNotifDeleteSingle({ open: true, index: isUnread ? unreadIndex : seenIndex, notif })}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {confirmModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setConfirmModal({ open: false, action: null, aptId: null, patientName: '', date: '', status: '' })}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '420px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', animation: 'slideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: confirmModal.action === 'approved' ? '#ECFDF5' : confirmModal.action === 'completed' ? '#EFF6FF' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={confirmModal.action === 'approved' ? '#10B981' : confirmModal.action === 'completed' ? '#2563EB' : '#EF4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {confirmModal.action === 'approved' && <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>}
                  {confirmModal.action === 'rejected' && <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>}
                  {confirmModal.action === 'completed' && <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>}
                </svg>
              </div>
              <h4 style={{ color: '#1E293B', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Are you sure?</h4>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                {confirmModal.action === 'approved' && `Approve appointment with ${confirmModal.patientName} on ${(() => { const { date: d, time: t } = formatDateTime(confirmModal.date); return d ? `${d}${t ? ` • ${t}` : ''}` : ''; })()}?`}
                {confirmModal.action === 'rejected' && `Reject appointment with ${confirmModal.patientName} on ${(() => { const { date: d, time: t } = formatDateTime(confirmModal.date); return d ? `${d}${t ? ` • ${t}` : ''}` : ''; })()}?`}
                {confirmModal.action === 'completed' && `Mark appointment with ${confirmModal.patientName} as completed?`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn-action" style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '10px 24px' }}
                onClick={() => setConfirmModal({ open: false, action: null, aptId: null, patientName: '', date: '', status: '' })}>
                Cancel
              </button>
              <button className="btn-action" style={{ backgroundColor: confirmModal.action === 'approved' ? '#10B981' : confirmModal.action === 'completed' ? '#2563EB' : '#EF4444', color: 'white', padding: '10px 24px' }}
                onClick={handleStatusConfirm}>
                {confirmModal.action === 'approved' ? 'Approve' : confirmModal.action === 'completed' ? 'Complete' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {conflictModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setConflictModal({ open: false, conflict: null, pending: null })}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '440px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', animation: 'slideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h4 style={{ color: '#1E293B', fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>Appointment Conflict Detected</h4>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                You already have an approved appointment scheduled for:
              </p>
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px 16px', marginTop: '12px', textAlign: 'left' }}>
                <div style={{ fontSize: '13px', color: '#92400E', fontWeight: '600' }}>
                  <span style={{ color: '#78350F' }}>Patient:</span> {conflictModal.conflict?.patientName}
                </div>
                <div style={{ fontSize: '13px', color: '#92400E', fontWeight: '600', marginTop: '4px' }}>
                  <span style={{ color: '#78350F' }}>Date:</span> {conflictModal.conflict?.date}
                </div>
                <div style={{ fontSize: '13px', color: '#92400E', fontWeight: '600', marginTop: '4px' }}>
                  <span style={{ color: '#78350F' }}>Time:</span> {conflictModal.conflict?.time || 'N/A'}
                </div>
              </div>
              <p style={{ color: '#64748B', fontSize: '13px', margin: '12px 0 0', lineHeight: '1.5' }}>
                Approving this appointment may result in overlapping consultations.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn-action" style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '10px 24px' }}
                onClick={() => setConflictModal({ open: false, conflict: null, pending: null })}>
                Cancel
              </button>
              <button className="btn-action" style={{ backgroundColor: '#F59E0B', color: 'white', padding: '10px 24px' }}
                onClick={() => {
                  const { aptId, action, userId, patientName, date } = conflictModal.pending;
                  setConflictModal({ open: false, conflict: null, pending: null });
                  setConfirmModal({ open: true, action, aptId, userId, patientName, date });
                }}>
                Approve Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {notifDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setNotifDeleteModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '420px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', animation: 'slideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <h4 style={{ color: '#1E293B', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Delete All Notifications?</h4>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>This action cannot be undone. All notifications will be permanently removed.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn-action" style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '10px 24px' }}
                onClick={() => setNotifDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-action" style={{ backgroundColor: '#EF4444', color: 'white', padding: '10px 24px' }}
                onClick={() => { setNotifDeleteModal(false); handleDeleteAll(); }}>
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {notifDeleteSingle.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setNotifDeleteSingle({ open: false, index: null, notif: null })}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '420px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', animation: 'slideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <h4 style={{ color: '#1E293B', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Delete Notification?</h4>
              <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>This notification will be permanently removed.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn-action" style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '10px 24px' }}
                onClick={() => setNotifDeleteSingle({ open: false, index: null, notif: null })}>
                Cancel
              </button>
              <button className="btn-action" style={{ backgroundColor: '#EF4444', color: 'white', padding: '10px 24px' }}
                onClick={handleDeleteSingle}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {docPreview.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}
          onClick={() => setDocPreview({ open: false, file: null })}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', animation: 'slideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                {docPreview.file?.fileType?.startsWith('image/') ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                )}
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{docPreview.file?.name}</span>
              </div>
              <button onClick={() => setDocPreview({ open: false, file: null })} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', maxHeight: 'calc(90vh - 60px)', overflow: 'auto', background: docPreview.file?.fileType?.startsWith('image/') ? '#F1F5F9' : 'white' }}>
              {docPreview.file?.fileType?.startsWith('image/') ? (
                <img src={docPreview.file.data} alt={docPreview.file.name} style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 100px)', borderRadius: '12px', objectFit: 'contain' }} />
              ) : docPreview.file?.fileType === 'application/pdf' ? (
                <iframe src={docPreview.file.data} title={docPreview.file.name} style={{ width: '100%', height: 'calc(90vh - 100px)', border: 'none', borderRadius: '12px' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>Preview not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pm-header">
              <div className="pm-header-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.25)', flexShrink: 0 }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>{formatDoctorName(profileForm.fullName || userData?.name)}</div>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '2px' }}>{profileForm.specialization || doctorData?.specialization || 'Healthcare Professional'}</div>
                  </div>
                </div>
                <button className="pm-close-btn" onClick={() => setShowProfileModal(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="pm-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)', borderRadius: '12px', marginBottom: '20px', border: '1px solid #DBEAFE' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{formatDoctorName(doctorData?.fullName || userData?.name)}</div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{doctorData?.specialization || 'Specialization not set'}</div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: doctorData?.status === 'approved' ? '#ECFDF5' : doctorData?.status === 'pending' ? '#FEF3C7' : '#FEF2F2', color: doctorData?.status === 'approved' ? '#059669' : doctorData?.status === 'pending' ? '#D97706' : '#DC2626', border: `1px solid ${doctorData?.status === 'approved' ? '#A7F3D0' : doctorData?.status === 'pending' ? '#FDE68A' : '#FECACA'}` }}>
                  {doctorData?.status === 'approved' ? 'Approved' : doctorData?.status === 'pending' ? 'Pending' : 'Rejected'}
                </span>
              </div>

              <form onSubmit={handleSubmitProfile}>
                <div className="pm-section">
                  <div className="pm-section-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Personal Information
                  </div>
                  <div className="pm-grid">
                    <div className="pm-field">
                      <label className="pm-label">Full Name {changedFields.fullName && <span style={{ color: '#2563EB', fontSize: '11px', fontWeight: '600' }}>(modified)</span>}</label>
                      <div className="pm-input-wrap">
                        <span className="pm-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input className={`pm-input ${changedFields.fullName ? 'pm-input-changed' : ''}`} type="text" value={profileForm.fullName} onChange={(e) => handleProfileFieldChange('fullName', e.target.value)} required />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label className="pm-label">Phone {changedFields.phone && <span style={{ color: '#2563EB', fontSize: '11px', fontWeight: '600' }}>(modified)</span>}</label>
                      <div className="pm-input-wrap">
                        <span className="pm-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </span>
                        <input className={`pm-input ${changedFields.phone ? 'pm-input-changed' : ''}`} type="text" value={profileForm.phone} onChange={(e) => handleProfileFieldChange('phone', e.target.value)} required />
                      </div>
                    </div>
                    <div className="pm-field pm-field-full">
                      <label className="pm-label">Address {changedFields.address && <span style={{ color: '#2563EB', fontSize: '11px', fontWeight: '600' }}>(modified)</span>}</label>
                      <div className="pm-input-wrap">
                        <span className="pm-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </span>
                        <input className={`pm-input ${changedFields.address ? 'pm-input-changed' : ''}`} type="text" value={profileForm.address} onChange={(e) => handleProfileFieldChange('address', e.target.value)} required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pm-section">
                  <div className="pm-section-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    Professional Details
                  </div>
                  <div className="pm-grid">
                    <div className="pm-field">
                      <label className="pm-label">Specialization {changedFields.specialization && <span style={{ color: '#2563EB', fontSize: '11px', fontWeight: '600' }}>(modified)</span>}</label>
                      <div className="pm-input-wrap">
                        <span className="pm-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                          </svg>
                        </span>
                        <input className={`pm-input ${changedFields.specialization ? 'pm-input-changed' : ''}`} type="text" value={profileForm.specialization} onChange={(e) => handleProfileFieldChange('specialization', e.target.value)} required />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label className="pm-label">Experience (years) {changedFields.experience && <span style={{ color: '#2563EB', fontSize: '11px', fontWeight: '600' }}>(modified)</span>}</label>
                      <div className="pm-input-wrap">
                        <span className="pm-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </span>
                        <input className={`pm-input ${changedFields.experience ? 'pm-input-changed' : ''}`} type="number" value={profileForm.experience} onChange={(e) => handleProfileFieldChange('experience', e.target.value)} placeholder="Not specified" min="0" />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label className="pm-label">Consultation Fees {changedFields.fees && <span style={{ color: '#2563EB', fontSize: '11px', fontWeight: '600' }}>(modified)</span>}</label>
                      <div className="pm-input-wrap">
                        <span className="pm-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        </span>
                        <input className={`pm-input ${changedFields.fees ? 'pm-input-changed' : ''}`} type="number" value={profileForm.fees} onChange={(e) => handleProfileFieldChange('fees', e.target.value)} placeholder="Not specified" min="0" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pm-section">
                  <div className="pm-section-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Availability
                  </div>
                  <div className="pm-grid">
                    <div className="pm-field">
                      <label className="pm-label">Start Time {changedFields.timingsStart && <span style={{ color: '#2563EB', fontSize: '11px', fontWeight: '600' }}>(modified)</span>}</label>
                      <div className="pm-input-wrap">
                        <span className="pm-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </span>
                        <input className={`pm-input ${changedFields.timingsStart ? 'pm-input-changed' : ''}`} type="time" value={profileForm.timingsStart} onChange={(e) => handleProfileFieldChange('timingsStart', e.target.value)} required />
                      </div>
                    </div>
                    <div className="pm-field">
                      <label className="pm-label">End Time {changedFields.timingsEnd && <span style={{ color: '#2563EB', fontSize: '11px', fontWeight: '600' }}>(modified)</span>}</label>
                      <div className="pm-input-wrap">
                        <span className="pm-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </span>
                        <input className={`pm-input ${changedFields.timingsEnd ? 'pm-input-changed' : ''}`} type="time" value={profileForm.timingsEnd} onChange={(e) => handleProfileFieldChange('timingsEnd', e.target.value)} required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pm-footer">
                  <button type="button" className="pm-btn-cancel" onClick={() => setShowProfileModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="pm-btn-save">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    Save Changes
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorHome;
