import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

const AdminProducts = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const productList = Array.isArray(data) ? data : (data.products || []);
        setProducts(productList);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user, navigate]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
        setConfirmDeleteId(null);
        showToast('Product deleted successfully.', 'success');
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to delete product.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Network error while deleting product.', 'error');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#ea580c' }}>Manage Products</h2>
        <Link to="/admin/add-product" className="btn">+ Add Product</Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#ea580c' }}>Loading products...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No products found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={rowStyle}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>NAME</th>
                <th style={thStyle}>PRICE</th>
                <th style={thStyle}>CATEGORY</th>
                <th style={thStyle}>STOCK</th>
                <th style={thStyle}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} style={rowStyle}>
                  <td style={tdStyle}>{product._id.substring(0, 8)}...</td>
                  <td style={tdStyle}>{product.name}</td>
                  <td style={tdStyle}>₹{Number(product.price || 0).toFixed(2)}</td>
                  <td style={tdStyle}>{product.category}</td>
                  <td style={tdStyle}>{product.stock}</td>
                  <td style={tdStyle}>
                    <Link to={`/admin/edit-product/${product._id}`} style={editBtn}>Edit</Link>
                    {confirmDeleteId === product._id ? (
                      <>
                        <button onClick={() => handleDelete(product._id)} style={deleteBtn}>Confirm</button>
                        <button onClick={() => setConfirmDeleteId(null)} style={cancelBtn}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(product._id)} style={deleteBtn}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const containerStyle = { maxWidth: '1200px', margin: '40px auto', padding: '30px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', color: '#111827' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const rowStyle = { borderBottom: '1px solid #e5e7eb' };
const thStyle = { padding: '15px', textAlign: 'left', color: '#4b5563', fontSize: '0.9rem' };
const tdStyle = { padding: '15px', textAlign: 'left', color: '#111827' };
const editBtn = { background: '#2563eb', color: '#fff', padding: '6px 12px', borderRadius: '4px', marginRight: '10px', textDecoration: 'none' };
const deleteBtn = { background: '#ef4444', color: '#fff', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', marginRight: '6px' };
const cancelBtn = { background: '#e5e7eb', color: '#111827', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' };

export default AdminProducts;
