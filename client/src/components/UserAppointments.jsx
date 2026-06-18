import { useState } from 'react';
import { message, Modal } from 'antd';
import api from '../services/api';

const UserAppointments = ({ appointments, setAppointments, loading }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [docPreview, setDocPreview] = useState({ open: false, file: null });

  const formatDateTime = (dateTimeStr) => {
    try {
      const dateObj = new Date(dateTimeStr);
      if (isNaN(dateObj.getTime())) return { date: dateTimeStr, time: '' };
      const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return { date, time };
    } catch {
      return { date: dateTimeStr, time: '' };
    }
  };

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'approved':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', label: 'Accepted', dot: '#2563EB' };
      case 'completed':
        return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', label: 'Completed', dot: '#059669' };
      case 'rejected':
        return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: 'Rejected', dot: '#DC2626' };
      case 'cancelled':
        return { bg: '#F5F5F5', color: '#737373', border: '#E5E5E5', label: 'Cancelled', dot: '#A3A3A3' };
      default:
        return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', label: 'Pending', dot: '#D97706' };
    }
  };

  const isFutureAppointment = (a) => {
    if (a.status?.toLowerCase() !== 'approved') return false;
    try { return new Date(a.date).getTime() > Date.now(); } catch { return false; }
  };

  const getFilteredAppointments = () => {
    const filtered = appointments.filter(a => {
      const s = a.status?.toLowerCase() || '';
      switch (activeFilter) {
        case 'upcoming': return isFutureAppointment(a);
        case 'pending': return s === 'pending';
        case 'completed': return s === 'completed';
        case 'rejected': return s === 'rejected';
        case 'cancelled': return s === 'cancelled';
        default: return true;
      }
    });
    if (activeFilter === 'upcoming') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return filtered;
  };

  const getFilterCount = (filter) => {
    switch (filter) {
      case 'upcoming': return appointments.filter(a => isFutureAppointment(a)).length;
      case 'pending': return appointments.filter(a => a.status?.toLowerCase() === 'pending').length;
      case 'completed': return appointments.filter(a => a.status?.toLowerCase() === 'completed').length;
      case 'rejected': return appointments.filter(a => a.status?.toLowerCase() === 'rejected').length;
      case 'cancelled': return appointments.filter(a => a.status?.toLowerCase() === 'cancelled').length;
      default: return appointments.length;
    }
  };

  const handleCancel = (appointmentId) => {
    Modal.confirm({
      title: 'Cancel Appointment',
      content: 'Are you sure you want to cancel this appointment?',
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const res = await api.post('/user/cancelappointment', { appointmentId });
          if (res.data.success) {
            message.success("Appointment cancelled");
            const refreshed = await api.get('/user/getuserappointments');
            if (refreshed.data.success) setAppointments(refreshed.data.data);
          } else {
            message.error(res.data.message);
          }
        } catch {
          message.error("Failed to cancel appointment");
        }
      }
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const AptIdBadge = ({ id }) => {
    if (!id) return null;
    const short = id.length > 8 ? id.slice(-6).toUpperCase() : id.toUpperCase();
    return (
      <span style={{
        fontSize: '10px', fontWeight: '700', color: '#94A3B8',
        fontFamily: 'monospace', letterSpacing: '0.5px',
        background: '#F8FAFC', padding: '3px 8px', borderRadius: '6px',
        border: '1px solid #F1F5F9'
      }}>
        #{short}
      </span>
    );
  };

  const DetailRow = ({ icon, label, value, muted }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1px' }}>{label}</div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: muted ? '#94A3B8' : '#1E293B', wordBreak: 'break-word' }}>{value}</div>
      </div>
    </div>
  );

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filtered = getFilteredAppointments();

  return (
    <div>
      <style>{`
        .f-tab {
          padding: 7px 16px; border-radius: 8px; font-size: 12px; font-weight: 600;
          border: 1px solid #E2E8F0; background: white; color: #64748B;
          cursor: pointer; transition: all 0.2s; display: inline-flex;
          align-items: center; gap: 6px;
        }
        .f-tab:hover { background: #F8FAFC; border-color: #CBD5E1; }
        .f-tab.active { background: #2563EB; color: white; border-color: #2563EB; }
        .f-tab .ct { padding: 1px 6px; border-radius: 8px; font-size: 10px; font-weight: 700; background: #F1F5F9; color: #94A3B8; }
        .f-tab.active .ct { background: rgba(255,255,255,0.2); color: white; }
        .a-card {
          background: white; border-radius: 14px; border: 1px solid #E2E8F0;
          margin-bottom: 12px; transition: all 0.2s; overflow: hidden;
        }
        .a-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .a-card.expanded { border-color: #BFDBFE; }
        .a-header {
          padding: 16px 20px; cursor: pointer; display: flex;
          align-items: center; gap: 14px; transition: background 0.15s;
        }
        .a-header:hover { background: #FAFBFC; }
        .a-expand-icon {
          width: 24px; height: 24px; border-radius: 6px; display: flex;
          align-items: center; justify-content: center; flex-shrink: 0;
          transition: transform 0.2s; background: #F8FAFC;
        }
        .a-expand-icon.open { transform: rotate(180deg); }
        .a-details {
          max-height: 0; overflow: hidden; transition: max-height 0.3s ease, opacity 0.2s;
          opacity: 0;
        }
        .a-details.open { max-height: 600px; opacity: 1; }
        .a-details-inner {
          padding: 0 20px 16px; border-top: 1px solid #F1F5F9;
          margin-top: 0; padding-top: 12px;
        }
        .cancel-btn {
          padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 600;
          border: 1px solid #FECACA; background: #FEF2F2; color: #DC2626;
          cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .cancel-btn:hover { background: #FEE2E2; border-color: #F87171; }
        .view-btn {
          padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600;
          border: 1px solid #E2E8F0; background: white; color: #64748B;
          cursor: pointer; transition: all 0.15s; white-space: nowrap;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .view-btn:hover { background: #F8FAFC; border-color: #CBD5E1; color: #334155; }
      `}</style>

      <h4 style={{ color: '#1E293B', fontWeight: '800', fontSize: '20px', marginBottom: '16px' }}>My Appointments</h4>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.key} className={`f-tab ${activeFilter === f.key ? 'active' : ''}`} onClick={() => setActiveFilter(f.key)}>
            {f.label}<span className="ct">{getFilterCount(f.key)}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ color: '#64748B', fontWeight: '600', fontSize: '13px', marginTop: '14px', marginBottom: 0 }}>Loading your appointments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p style={{ color: '#64748B', fontWeight: '600', fontSize: '14px', margin: '0 0 4px 0' }}>
            {activeFilter === 'all' ? 'No appointments yet.' : `No ${activeFilter} appointments.`}
          </p>
          <p style={{ color: '#94A3B8', fontSize: '12px', margin: 0 }}>
            {activeFilter === 'all' ? 'Book your first appointment to get started.' : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        filtered.map((apt) => {
          const { date, time } = formatDateTime(apt.date);
          const sc = getStatusConfig(apt.status);
          const reason = apt.message?.trim() || null;
          const isExpanded = expandedId === apt._id;

          return (
            <div key={apt._id} className={`a-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="a-header" onClick={() => toggleExpand(apt._id)}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: sc.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: sc.dot }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#1E293B' }}>
                      {apt.doctorInfo?.fullName || 'Doctor'}
                    </span>
                    <AptIdBadge id={apt._id} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '1px' }}>
                    {apt.doctorInfo?.specialization || 'Medical Practitioner'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right', marginRight: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{date}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{time || '—'}</div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '700',
                    backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                    whiteSpace: 'nowrap'
                  }}>
                    {sc.label}
                  </span>
                  <div className={`a-expand-icon ${isExpanded ? 'open' : ''}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={`a-details ${isExpanded ? 'open' : ''}`}>
                <div className="a-details-inner">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 24px', marginBottom: '10px' }}>
                    <DetailRow
                      icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                      label="Doctor" value={apt.doctorInfo?.fullName || 'Doctor'}
                    />
                    <DetailRow
                      icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
                      label="Specialization" value={apt.doctorInfo?.specialization || 'Medical Practitioner'}
                    />
                    <DetailRow
                      icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                      label="Date" value={date}
                    />
                    <DetailRow
                      icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                      label="Time" value={time || 'Scheduled Slot'}
                    />
                    <DetailRow
                      icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                      label="Appointment ID" value={`#${apt._id?.slice(-6).toUpperCase() || '—'}`}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '8px', marginBottom: '8px' }}>
                    <DetailRow
                      icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
                      label="Reason for Visit" value={reason || 'Not provided'} muted={!reason}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '8px', marginBottom: apt.status?.toLowerCase() === 'pending' ? '8px' : 0 }}>
                    <DetailRow
                      icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                      label="Uploaded Documents"
                      value={apt.documents && apt.documents.length > 0
                        ? <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {apt.documents.map((doc, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                                {doc.fileType?.startsWith('image/') ? (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                )}
                                <span style={{ flex: 1, fontSize: '12px', fontWeight: '500', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); setDocPreview({ open: true, file: doc }); }} className="view-btn">View</button>
                              </div>
                            ))}
                          </div>
                        : 'No documents uploaded'}
                    />
                  </div>

                  {apt.status?.toLowerCase() === 'pending' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                      <button className="cancel-btn" onClick={(e) => { e.stopPropagation(); handleCancel(apt._id); }}>
                        Cancel Appointment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      {docPreview.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}
          onClick={() => setDocPreview({ open: false, file: null })}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
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

export default UserAppointments;
