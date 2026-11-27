import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addToCart } from '../redux/cartSlice';
import '../styles/product.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state?.cart?.cartItems || []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data.product || data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      showToast('Please login or signup to add items to your cart.', 'warning');
      navigate('/login');
      return;
    }

    if (product) {
      if (typeof product.stock === 'number' && product.stock <= 0) {
        showToast('This product is currently out of stock!', 'error');
        return;
      }

      const existingItem = cartItems.find(
        (item) => (item._id || item.productId) === product._id
      );

      if (existingItem && typeof product.stock === 'number' && existingItem.qty >= product.stock) {
        showToast(`Cannot add more. Only ${product.stock} items available in stock!`, 'warning');
        return;
      }

      dispatch(addToCart({
        _id: product._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        qty: existingItem ? existingItem.qty + 1 : 1
      }));
      showToast('Successfully added to your cart!', 'success');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', margin: '100px', color: '#ea580c' }}>Loading Product...</div>;
  if (!product || !product.name) return <div style={{ textAlign: 'center', margin: '100px', color: '#ef4444' }}>Product Not Found</div>;

  return (
    <div className="product-detail-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      {/* Breadcrumb Navigation */}
      <div style={{ color: '#6b7280', marginBottom: '20px', fontSize: '0.95rem' }}>
        <Link to="/" style={{ color: '#ea580c' }}>Home</Link> / <Link to="/shop" style={{ color: '#ea580c' }}>Shop</Link> / {product.category || 'General'} / <span style={{ color: '#111827', fontWeight: '500' }}>{product.name}</span>
      </div>

      <div className="product-detail">
        {/* Left Side: Image */}
        <div className="detail-image-container">
          <img src={product.imageUrl} alt={product.name} className="detail-image" />
        </div>

        {/* Right Side: Information Block */}
        <div className="detail-info">
          
          <h2 style={{ fontSize: '2.8rem', marginBottom: '10px' }}>{product.name}</h2>

          <p className="detail-price" style={{ fontSize: '2.5rem', margin: '15px 0' }}>₹{Number(product.price || 0).toFixed(2)}</p>

          {/* Description */}
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#111827', marginBottom: '10px' }}>Product Description</h4>
            <p style={{ color: '#4b5563', lineHeight: '1.8' }}>{product.description}</p>
          </div>

          {/* Cart & Stock Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={handleAddToCart} 
              className="btn" 
              style={{ flexGrow: '1', padding: '18px', fontSize: '1.2rem' }}
              disabled={typeof product.stock === 'number' && product.stock <= 0}
            >
              {typeof product.stock === 'number' && product.stock <= 0 ? 'Out of Stock' : 'Add to Shopping Cart'}
            </button>
          </div>
          
          <p style={{ marginTop: '20px', color: (typeof product.stock === 'number' && product.stock > 0) ? '#059669' : '#ef4444', fontWeight: '600' }}>
            {typeof product.stock === 'number' && product.stock > 0 ? `● In Stock (${product.stock} units available)` : `● Temporarily Out of Stock`}
          </p>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
