import { useState } from 'react';
import { message } from 'antd';
import api from '../services/api';

const Notifications = ({ notifications, setNotifications }) => {
  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [deleteSingle, setDeleteSingle] = useState({ open: false, index: null });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const syncToServer = async (updatedNotifs) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const unread = updatedNotifs.filter(n => !n.isRead).map(({ message, type }) => ({ message, type }));
      const read = updatedNotifs.filter(n => n.isRead).map(({ message, type }) => ({ message, type }));
      const res = await api.post('/user/syncnotifications', { userId: userData?._id, notification: unread, seennotification: read });
      if (res.data.success) {
        const fresh = { ...res.data.data, password: undefined };
        localStorage.setItem('userData', JSON.stringify(fresh));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMarkAsRead = (index) => {
    const updated = notifications.map((n, i) => i === index ? { ...n, isRead: true } : n);
    setNotifications(updated);
    syncToServer(updated);
    message.success("Notification marked as read");
  };

  const handleDeleteSingle = () => {
    const updated = notifications.filter((_, i) => i !== deleteSingle.index);
    setNotifications(updated);
    syncToServer(updated);
    setDeleteSingle({ open: false, index: null });
    message.success("Notification deleted");
  };

  const handleMarkAllRead = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const res = await api.post('/user/getallnotification', { userId: userData?._id });
      if (res.data.success) {
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        setNotifications(updated);
        localStorage.setItem('userData', JSON.stringify(res.data.data));
        message.success("All notifications marked as read");
      } else {
        message.error(res.data.message);
      }
    } catch {
      message.error("Something went wrong");
    }
  };

  const handleDeleteAll = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const res = await api.post('/user/deleteallnotification', { userId: userData?._id });
      if (res.data.success) {
        setNotifications([]);
        localStorage.setItem('userData', JSON.stringify(res.data.data));
        setDeleteAllModal(false);
        message.success("All notifications deleted");
      } else {
        message.error(res.data.message);
      }
    } catch {
      message.error("Something went wrong");
    }
  };

  const getNotifDetails = (msg) => {
    const text = msg?.toLowerCase() || '';
    if (text.includes('appointment') || text.includes('status')) {
      return {
        title: 'Appointment Update',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
        bg: '#EFF6FF'
      };
    } else if (text.includes('doctor') || text.includes('approved') || text.includes('rejected')) {
      return {
        title: 'Doctor Application',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <polyline points="16 11 18 13 22 9" />
          </svg>
        ),
        bg: '#ECFDF5'
      };
    }
    return {
      title: 'System Notification',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
      bg: '#FFF7ED'
    };
  };

  return (
    <div>
      <style>{`
        .notif-item { display: flex; gap: 14px; align-items: flex-start; padding: 18px 20px; border-radius: 14px; margin-bottom: 10px; transition: all 0.2s ease; position: relative; }
        .notif-item:hover .notif-actions { opacity: 1; pointer-events: all; }
        .notif-actions { opacity: 0; pointer-events: none; display: flex; gap: 4px; transition: opacity 0.2s ease; }
        .notif-action-btn { width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1050; }
        .modal-box { background: white; border-radius: 20px; padding: 32px; max-width: 400px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h4 style={{ color: '#1E293B', fontWeight: '800', fontSize: '20px', margin: 0 }}>Notifications</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '10px', padding: '9px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={() => setDeleteAllModal(true)} style={{ backgroundColor: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '10px', padding: '9px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              Delete All
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p style={{ color: '#64748B', fontWeight: '600', margin: 0 }}>No notifications yet.</p>
        </div>
      ) : (
        notifications.map((notif, index) => {
          const details = getNotifDetails(notif.message);
          return (
            <div key={notif.id || index} className="notif-item" style={{ background: !notif.isRead ? '#F0F7FF' : 'white', border: `1px solid ${!notif.isRead ? '#BFDBFE' : '#E2E8F0'}` }}>
              {!notif.isRead && <div style={{ position: 'absolute', top: '20px', left: '8px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }} />}
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: details.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {details.icon}
              </div>
              <div style={{ flex: 1, opacity: !notif.isRead ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h6 style={{ color: '#1E293B', fontWeight: !notif.isRead ? '700' : '500', fontSize: '13px', margin: '0 0 3px 0' }}>{details.title}</h6>
                </div>
                <p style={{ color: '#64748B', fontSize: '13px', margin: 0, lineHeight: '1.5', fontWeight: !notif.isRead ? '600' : '400' }}>{notif.message}</p>
              </div>
              <div className="notif-actions">
                {!notif.isRead && (
                  <button className="notif-action-btn" style={{ backgroundColor: '#ECFDF5', color: '#059669' }} title="Mark as read" onClick={() => handleMarkAsRead(index)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </button>
                )}
                <button className="notif-action-btn" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }} title="Delete" onClick={() => setDeleteSingle({ open: true, index })}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          );
        })
      )}

      {deleteAllModal && (
        <div className="modal-overlay" onClick={() => setDeleteAllModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h5 style={{ margin: '0 0 12px', fontWeight: '800', color: '#1E293B', fontSize: '18px' }}>Delete All Notifications</h5>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>This will permanently remove all notifications. This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setDeleteAllModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={handleDeleteAll} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#EF4444', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Delete All</button>
            </div>
          </div>
        </div>
      )}

      {deleteSingle.open && (
        <div className="modal-overlay" onClick={() => setDeleteSingle({ open: false, index: null })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h5 style={{ margin: '0 0 12px', fontWeight: '800', color: '#1E293B', fontSize: '18px' }}>Delete Notification</h5>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>Are you sure you want to delete this notification?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setDeleteSingle({ open: false, index: null })} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={handleDeleteSingle} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#EF4444', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
