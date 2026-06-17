import { useState } from 'react';
import { message } from 'antd';
import api from '../services/api';
import FileUpload from './FileUpload';

const ApplyDoctor = ({ userId }) => {
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    experience: '',
    fees: '',
    timings: ['', '']
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTimingChange = (index, value) => {
    const updatedTimings = [...formData.timings];
    updatedTimings[index] = value;
    setFormData({
      ...formData,
      timings: updatedTimings
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        userId,
        experience: Number(formData.experience) || 0,
        fees: Number(formData.fees) || 0,
      };
      const res = await api.post('/user/registerdoc', payload);
      if (res.data.success) {
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch {
      message.error("Something went wrong");
    }
  };

  return (
    <div className="apply-doctor-container">
      <style>{`
        .apply-doctor-container {
          max-width: 960px;
          margin: 0 auto;
          padding-bottom: 40px;
        }
        .portal-card {
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
          padding: 40px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .section-header-custom {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid #F1F5F9;
        }
        .section-icon-container {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background-color: #EFF6FF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563EB;
          flex-shrink: 0;
        }
        .section-title-custom {
          margin: 0;
          font-weight: 700;
          color: #1E293B;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-label-custom {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
        }
        .form-control-custom {
          display: block;
          width: 100%;
          height: 48px;
          padding: 10px 16px;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.5;
          color: #1E293B;
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }
        .form-control-custom:focus {
          background-color: #FFFFFF;
          border-color: #2563EB;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
        .form-control-custom::placeholder {
          color: #94A3B8;
        }
        .btn-verification-custom {
          background-color: #2563EB;
          color: white;
          border: none;
          border-radius: 12px;
          height: 52px;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
          cursor: pointer;
        }
        .btn-verification-custom:hover {
          background-color: #1D4ED8;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
        }
        .btn-verification-custom:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="mb-4">
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Become a Verified Doctor
        </h2>
        <p style={{ color: '#64748B', fontSize: '15px', margin: 0, lineHeight: '1.6' }}>
          Join our network of elite medical professionals. Complete your verification profile to start receiving and managing patient appointment requests.
        </p>
      </div>

      <div className="portal-card">
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <div className="section-header-custom">
              <div className="section-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h5 className="section-title-custom">Personal Information</h5>
            </div>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <label className="form-label-custom">Full Name</label>
                <input
                  type="text"
                  className="form-control-custom"
                  name="fullName"
                  placeholder="e.g. Dr. Jane Smith"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 col-lg-4">
                <label className="form-label-custom">Email Address</label>
                <input
                  type="text"
                  className="form-control-custom"
                  name="email"
                  placeholder="e.g. janesmith@medicare.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-12 col-lg-4">
                <label className="form-label-custom">Phone Number</label>
                <input
                  type="text"
                  className="form-control-custom"
                  name="phone"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="section-header-custom">
              <div className="section-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h5 className="section-title-custom">Professional Information</h5>
            </div>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <label className="form-label-custom">Specialization</label>
                <input
                  type="text"
                  className="form-control-custom"
                  name="specialization"
                  placeholder="e.g. Cardiology, Pediatrics"
                  value={formData.specialization}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 col-lg-4">
                <label className="form-label-custom">Experience (Years)</label>
                <input
                  type="text"
                  className="form-control-custom"
                  name="experience"
                  placeholder="e.g. 8"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-12 col-lg-4">
                <label className="form-label-custom">Consultation Fee ($)</label>
                <input
                  type="text"
                  className="form-control-custom"
                  name="fees"
                  placeholder="e.g. 150"
                  value={formData.fees}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="section-header-custom">
              <div className="section-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h5 className="section-title-custom">Clinic Information</h5>
            </div>
            <div className="row g-4">
              <div className="col-12">
                <label className="form-label-custom">Address</label>
                <input
                  type="text"
                  className="form-control-custom"
                  name="address"
                  placeholder="e.g. Suite 402, Medical Center Plaza, NY"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="section-header-custom">
              <div className="section-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h5 className="section-title-custom">Availability Schedule</h5>
            </div>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label-custom">Start Time</label>
                <input
                  type="time"
                  className="form-control-custom"
                  value={formData.timings[0]}
                  onChange={(e) => handleTimingChange(0, e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">End Time</label>
                <input
                  type="time"
                  className="form-control-custom"
                  value={formData.timings[1]}
                  onChange={(e) => handleTimingChange(1, e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px'
          }}>
          <div className="mb-5">
            <div className="section-header-custom">
              <div className="section-icon-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h5 className="section-title-custom">Supporting Documents</h5>
            </div>
            <FileUpload
              files={documents}
              onFilesChange={setDocuments}
              label="Medical Credentials"
              sublabel="Upload your medical license, degree certificates, or ID proof"
            />
          </div>

          <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <p style={{ margin: 0, color: '#1E3A8A', fontSize: '14px', fontWeight: '500', lineHeight: '1.5' }}>
              Doctor applications are reviewed and approved by administrators before becoming visible to patients.
            </p>
          </div>

          <button type="submit" className="btn-verification-custom">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Apply for Verification
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyDoctor;
