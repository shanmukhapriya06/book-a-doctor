import { useState, useRef } from 'react';
import { message } from 'antd';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png';
const MAX_SIZE_MB = 5;

const FileUpload = ({ files, onFilesChange, label = 'Documents', sublabel = 'Upload medical records, prescriptions, or ID proofs' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      message.error(`"${file.name}" — only PDF, JPG, PNG allowed`);
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      message.error(`"${file.name}" — max size is 5MB`);
      return false;
    }
    return true;
  };

  const addFiles = (newFiles) => {
    const valid = [];
    for (const f of newFiles) {
      if (validateFile(f)) valid.push(f);
    }
    if (valid.length) {
      onFilesChange([...files, ...valid]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <style>{`
        .file-drop-zone {
          border: 2px dashed #CBD5E1;
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #FAFBFD;
        }
        .file-drop-zone.dragging {
          border-color: #2563EB;
          background: #EFF6FF;
        }
        .file-drop-zone:hover {
          border-color: #94A3B8;
          background: #F1F5F9;
        }
        .file-drop-zone.dragging:hover {
          border-color: #2563EB;
          background: #EFF6FF;
        }
        .file-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          margin-top: 8px;
          transition: border-color 0.2s;
        }
        .file-item:hover {
          border-color: #CBD5E1;
        }
        .file-remove-btn {
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .file-remove-btn:hover {
          color: #DC2626;
          background: #FEF2F2;
        }
        .file-preview-thumb {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #E2E8F0;
          flex-shrink: 0;
        }
        .file-pdf-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #FEF2F2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #DC2626;
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
          border: 1px solid #FECACA;
        }
      `}</style>

      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
        {label}
      </label>
      <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 12px 0' }}>
        {sublabel} • PDF, JPG, PNG • Max 5MB
      </p>

      <div
        className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS}
          style={{ display: 'none' }}
          onChange={(e) => {
            addFiles(Array.from(e.target.files));
            e.target.value = '';
          }}
        />
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#2563EB' : '#94A3B8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: isDragging ? '#2563EB' : '#475569' }}>
          {isDragging ? 'Drop files here' : 'Click to upload or drag & drop'}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
          Supports PDF, JPEG, PNG
        </p>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', margin: '0 0 4px 0' }}>
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </p>
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="file-item">
              {file.type === 'application/pdf' ? (
                <div className="file-pdf-icon">PDF</div>
              ) : (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="file-preview-thumb"
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                  {formatSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                className="file-remove-btn"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                title="Remove file"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
