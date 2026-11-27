import React from 'react';

const About = () => {
  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px',
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    textAlign: 'center'
  };

  const socialBtnStyle = {
    display: 'inline-block',
    margin: '10px',
    padding: '10px 20px',
    background: '#f3f4f6',
    color: '#111827',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    border: '1px solid #e5e7eb',
    fontWeight: '500'
  };

  return (
    <div style={containerStyle}>
      <img
        src=""
        alt="@Apurv"
        style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ea580c', marginBottom: '20px', boxShadow: '0 4px 20px rgba(234, 88, 12, 0.25)' }}
      />
      <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#111827' }}>About Me</h2>
      <h3 style={{ fontSize: '1.5rem', color: '#ea580c', marginBottom: '15px' }}>Apurv Khairnar</h3>

      <p style={{ color: '#4b5563', fontSize: '1.2rem', lineHeight: '1.8', maxWidth: '600px', margin: '0 auto 30px auto' }}>
        <strong>Join the community and grow together!</strong> Welcome to my platform where we build, deploy, and scale highly engineered systems.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
        <a href="" target="_blank" rel="noreferrer" style={socialBtnStyle}>🌐 Website</a>
        <a href="" target="_blank" rel="noreferrer" style={{ ...socialBtnStyle, background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#dc2626' }}>📺 YouTube</a>
        <a href="" target="_blank" rel="noreferrer" style={{ ...socialBtnStyle, background: 'rgba(236, 72, 153, 0.1)', borderColor: '#ec4899', color: '#db2777' }}>📸 Instagram</a>
        <a href="   " target="_blank" rel="noreferrer" style={{ ...socialBtnStyle, background: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6', color: '#2563eb' }}>💼 LinkedIn</a>
        <a href="" target="_blank" rel="noreferrer" style={socialBtnStyle}>✖️ X (Twitter)</a>
        <a href="" target="_blank" rel="noreferrer" style={{ ...socialBtnStyle, background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981', color: '#059669' }}>💬 WhatsApp</a>
        <a href="" target="_blank" rel="noreferrer" style={socialBtnStyle}>🔗 Linktree</a>
      </div>
    </div>
  );
};

export default About;
