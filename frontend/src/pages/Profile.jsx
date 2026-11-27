import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoggingOut = useRef(false);

  useEffect(() => {
    if (!user) {
      if (!isLoggingOut.current) {
        navigate('/login');
      }
      return;
    }
    const fetchMyOrders = async () => {
      try {
        const res = await fetch('/api/orders/myorders', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setOrders(Array.isArray(data) ? data : []);
        } else {
          // Token obsolete or 401: clear and bounce
          if (res.status === 401) {
             logout();
             navigate('/login');
          }
          setOrders([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [user, navigate]);

  const handleLogout = () => {
    isLoggingOut.current = true;
    logout();
    navigate('/');
  };

  const containerStyle = { maxWidth: '1000px', margin: '40px auto', padding: '30px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', color: '#111827' };
  const badgeStyle = { background: 'rgba(234,88,12,0.1)', color: '#ea580c', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' };

  if (!user) return null;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e7eb', paddingBottom: '30px', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#111827', fontSize: '2.2rem', marginBottom: '10px' }}>My Profile</h2>
          <p style={{ color: '#4b5563', fontSize: '1.2rem', marginBottom: '5px' }}><strong>Name:</strong> {user.name}</p>
          <p style={{ color: '#4b5563', fontSize: '1.2rem', marginBottom: '15px' }}><strong>Email:</strong> {user.email}</p>
          <span style={badgeStyle}>Account Type: {user.role.toUpperCase()}</span>
        </div>
        <button onClick={handleLogout} className="btn" style={{ background: '#ef4444', boxShadow: 'none' }}>Logout</button>
      </div>

      <h3 style={{ color: '#ea580c', marginBottom: '20px', fontSize: '1.5rem' }}>Order History</h3>
      {loading ? (
        <p style={{ color: '#6b7280' }}>Fetching your orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ background: '#f9fafb', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#4b5563', marginBottom: '15px' }}>You haven't placed any orders yet.</p>
          <Link to="/shop" className="btn">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map(order => (
            <div key={order._id} style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
              <div>
                <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '5px' }}>Order ID: <span style={{ color: '#111827', fontWeight: '600' }}>{order._id}</span></p>
                <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '5px' }}>Placed On: <span style={{ color: '#111827' }}>{new Date(order.createdAt).toLocaleDateString()}</span></p>
                <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>Total: <strong style={{ color: '#059669' }}>₹{order.totalAmount.toFixed(2)}</strong></p>
              </div>
              <div>
                <span style={{ 
                  background: order.status === 'Delivered' ? 'rgba(16,185,129,0.15)' : order.status === 'Shipped' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)', 
                  color: order.status === 'Delivered' ? '#059669' : order.status === 'Shipped' ? '#2563eb' : '#d97706',
                  padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' 
                }}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
