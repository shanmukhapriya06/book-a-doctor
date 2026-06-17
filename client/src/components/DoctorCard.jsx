import { useState } from 'react';
import { message } from 'antd';
import api from '../services/api';
import FileUpload from './FileUpload';

const DoctorCard = ({ doctor, userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00');
  const [messageText, setMessageText] = useState('');
  const [bookingFiles, setBookingFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const improveText = (text) => {
    if (!text.trim()) return text;
    let t = text.trim();
    t = t.charAt(0).toUpperCase() + t.slice(1);
    t = t.replace(/\b(chest pain|headache|stomach ache|body pain|back pain|throat|cough|cold|fever|fatigue|dizziness|nausea)\b/gi, (m) => m.charAt(0).toUpperCase() + m.slice(1));
    t = t.replace(/\bsince\s+(\d+)\s*(day|days|week|weeks|month|months|year|years)\b/gi, (_, n, u) => `for the past ${n} ${u}`);
    t = t.replace(/\bfoll?ow\s*up\b/gi, 'Follow-up');
    t = t.replace(/\bgeneral checkup\b/gi, 'General checkup');
    t = t.replace(/\bcheck\s*up\b/gi, 'check-up');
    t = t.replace(/\bpreviuos\b/gi, 'previous');
    t = t.replace(/\btreetment\b/gi, 'treatment');
    t = t.replace(/\bapointment\b/gi, 'appointment');
    t = t.replace(/\bconsulattion\b/gi, 'consultation');
    t = t.replace(/\bprescrption\b/gi, 'prescription');
    if (!/[.!?]$/.test(t)) t += '.';
    return t;
  };

  const handleImproveText = () => {
    if (!messageText.trim()) {
      message.info('Type something first, then click Check Grammar');
      return;
    }
    const improved = improveText(messageText);
    if (improved === messageText) {
      message.success('Text looks good!');
    } else {
      setMessageText(improved);
      message.success('Text improved');
    }
  };
  const isAvailable = doctor.isAvailable !== false;

  const timeSlotLabels = {
    '09:00': '09:00 AM', '10:00': '10:00 AM', '11:00': '11:00 AM',
    '12:00': '12:00 PM', '13:00': '01:00 PM', '14:00': '02:00 PM',
    '15:00': '03:00 PM', '16:00': '04:00 PM', '17:00': '05:00 PM',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
  };

  const handleReview = () => {
    if (!bookingDate) {
      message.warning('Please select a preferred date');
      return;
    }
    setShowForm(false);
    setShowConfirm(true);
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      const combinedDateTime = `${bookingDate}T${timeSlot}`;
      const docsPayload = await Promise.all(
        bookingFiles.map(async (f) => ({
          name: f.name,
          fileType: f.type,
          data: await fileToBase64(f),
        }))
      );
      const res = await api.post('/user/getappointment', {
        userId,
        doctorId: doctor._id,
        date: combinedDateTime,
        message: messageText,
        userInfo: JSON.parse(localStorage.getItem('userData')),
        doctorInfo: doctor,
        documents: docsPayload,
      });
      if (res.data.success) {
        message.success(res.data.message || "Appointment Booked Successfully");
        handleClose();
      } else {
        message.error(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setShowConfirm(false);
    setBookingDate('');
    setTimeSlot('09:00');
    setMessageText('');
    setBookingFiles([]);
  };

  const inputStyle = {
    borderRadius: '12px', border: '1px solid #E2E8F0', padding: '12px 16px',
    fontSize: '14px', color: '#1E293B', width: '100%', backgroundColor: '#F8FAFC', boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
  };

  return (
    <>
      <style>{`
        .doc-card-custom {
          background: white; border-radius: 20px; border: 1px solid #E2E8F0;
          padding: 24px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02); display: flex;
          flex-direction: column; justify-content: space-between; height: 100%;
        }
        .doc-card-custom:hover { transform: translateY(-6px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.03); }
        .detail-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: #64748B; font-size: 13px; }
        .detail-icon { color: #3B82F6; display: flex; align-items: center; flex-shrink: 0; }
        .book-btn-custom {
          width: 100%; background-color: #2563EB; color: white; border: none; border-radius: 12px;
          padding: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.15); margin-top: 16px;
        }
        .book-btn-custom:hover { background-color: #1D4ED8; transform: translateY(-1px); box-shadow: 0 8px 12px -3px rgba(37, 99, 235, 0.25); }
        .book-btn-custom:active { transform: translateY(0); }
        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1050; }
        .modal-card { background: white; border-radius: 24px; width: 100%; max-width: 520px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; border: 1px solid #E2E8F0; animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes modalSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="doc-card-custom">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h5 style={{ color: '#1E293B', fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>{doctor.fullName}</h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-block', backgroundColor: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {doctor.specialization}
                </div>
                <div style={{ display: 'inline-block', backgroundColor: isAvailable ? '#ECFDF5' : '#FEF2F2', color: isAvailable ? '#059669' : '#DC2626', padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginBottom: '16px' }}>
            <div className="detail-row">
              <span className="detail-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
              </span>
              <span style={{ fontWeight: '500' }}>{doctor.experience} Experience</span>
            </div>
            <div className="detail-row">
              <span className="detail-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </span>
              <span style={{ fontWeight: '600', color: '#1E293B' }}>Consultation Fee: Rs. {doctor.fees}</span>
            </div>
            <div className="detail-row">
              <span className="detail-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </span>
              <span>Available Timings: {doctor.timings?.[0]} - {doctor.timings?.[1]}</span>
            </div>
            <div className="detail-row" style={{ margin: 0 }}>
              <span className="detail-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </span>
              <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{doctor.address}</span>
            </div>
          </div>
        </div>

        <div>
          {isAvailable ? (
            <button className="book-btn-custom" onClick={() => setShowForm(true)}>Book Appointment</button>
          ) : (
            <button className="book-btn-custom" disabled style={{ backgroundColor: '#CBD5E1', cursor: 'not-allowed', boxShadow: 'none', transform: 'none' }}>Currently Unavailable</button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={handleClose}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '20px 28px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h5 style={{ margin: 0, fontWeight: '800', color: '#1E293B', fontSize: '17px' }}>Book Appointment</h5>
                <p style={{ margin: '2px 0 0 0', color: '#64748B', fontSize: '12px' }}>Consulting with {doctor.fullName}</p>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '22px', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: '28px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Select Date</label>
                <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Select Time Slot</label>
                <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} style={inputStyle} required>
                  {Object.entries(timeSlotLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Reason for Visit (Optional)</label>
                <textarea
                  value={messageText}
                  onChange={e => { if (e.target.value.length <= 150) setMessageText(e.target.value); }}
                  maxLength={150}
                  placeholder="Briefly describe the purpose of your consultation..."
                  style={{ ...inputStyle, height: '80px', resize: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={handleImproveText}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: 'none', border: 'none', color: '#2563EB',
                      fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                      padding: '2px 0', textDecoration: 'none',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Check Grammar
                  </button>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{messageText.length}/150</span>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <FileUpload
                  files={bookingFiles}
                  onFilesChange={setBookingFiles}
                  label="Attachments (Optional)"
                  sublabel="Upload prescriptions, reports, or images"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleClose} style={{ flex: 1, backgroundColor: 'white', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                <button onClick={handleReview} style={{ flex: 1, backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.15)' }}>Review Booking</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-backdrop" onClick={handleClose}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '20px 28px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h5 style={{ margin: 0, fontWeight: '800', color: '#1E293B', fontSize: '17px' }}>Confirm Booking</h5>
                <p style={{ margin: '2px 0 0 0', color: '#64748B', fontSize: '12px' }}>Please review your appointment details</p>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '22px', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: '28px' }}>
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '500' }}>Doctor</span>
                  <span style={{ color: '#1E293B', fontWeight: '700', fontSize: '13px' }}>{doctor.fullName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '500' }}>Specialization</span>
                  <span style={{ color: '#2563EB', fontWeight: '700', fontSize: '12px', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>{doctor.specialization}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '500' }}>Date</span>
                  <span style={{ color: '#1E293B', fontWeight: '700', fontSize: '13px' }}>{formatDate(bookingDate)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '500' }}>Time</span>
                  <span style={{ color: '#1E293B', fontWeight: '700', fontSize: '13px' }}>{timeSlotLabels[timeSlot]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: messageText ? '10px' : '0' }}>
                  <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '500' }}>Consultation Fee</span>
                  <span style={{ color: '#059669', fontWeight: '800', fontSize: '13px' }}>Rs. {doctor.fees}</span>
                </div>
                {messageText && (
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', marginTop: '2px' }}>
                    <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Reason for Visit</span>
                    <span style={{ color: '#1E293B', fontSize: '13px', fontWeight: '600' }}>{messageText}</span>
                  </div>
                )}
                {bookingFiles.length > 0 && (
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', marginTop: '2px' }}>
                    <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Attachments ({bookingFiles.length})</span>
                    {bookingFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: '500' }}>{f.name}</span>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>({(f.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', margin: '0 0 20px 0' }}>Are you sure you want to book this appointment?</p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleClose} style={{ flex: 1, backgroundColor: 'white', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }} disabled={submitting}>Cancel</button>
                <button onClick={handleConfirmBooking} style={{ flex: 1, backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.15)', opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorCard;
