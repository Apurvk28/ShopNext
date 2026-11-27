import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      padding: '40px 20px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div>
          <h3 style={{ color: '#ea580c', marginBottom: '10px' }}>ShopNext</h3>
          <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>Premium E-Commerce Platform.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/about" style={{ color: '#4b5563', fontSize: '0.9rem' }}>About Us</Link>
          <Link to="/return" style={{ color: '#4b5563', fontSize: '0.9rem' }}>Return Policy</Link>
          <Link to="/disclaimer" style={{ color: '#4b5563', fontSize: '0.9rem' }}>Disclaimer</Link>
        </div>
        
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} ShopNext. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
