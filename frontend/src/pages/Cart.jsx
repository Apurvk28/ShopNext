import { useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { removeFromCart, addToCart } from '../redux/cartSlice';
import '../styles/cart.css';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const cartItems = useSelector((state) => state?.cart?.cartItems || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQty = (item, qty) => {
    if (typeof item.stock === 'number' && qty > item.stock) {
      showToast(`Cannot add more. Only ${item.stock} items available in stock!`, 'warning');
      return;
    }

    if (qty > 0) {
      dispatch(addToCart({ ...item, qty }));
    }
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1),
    0
  );

  const handleCheckout = () => {
    if (!user) {
      showToast('Please login or signup to proceed to checkout.', 'warning');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty. <Link to="/shop">Go Shopping</Link></p>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => {
              const id = item._id || item.productId;
              const hasStockLimit = typeof item.stock === 'number';
              const isAtMaxStock = hasStockLimit && item.qty >= item.stock;

              return (
                <div key={id} className="cart-item">
                  <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>₹{item.price}</p>
                    <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => handleUpdateQty(item, item.qty - 1)}>-</button>
                      <span style={{ fontWeight: '600', minWidth: '24px', textAlign: 'center' }}>{item.qty}</span>
                      <button
                        onClick={() => handleUpdateQty(item, item.qty + 1)}
                        disabled={isAtMaxStock}
                        title={isAtMaxStock ? `Maximum available stock reached` : 'Increase quantity'}
                        style={isAtMaxStock ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                      >
                        +
                      </button>
                    </div>
                    {isAtMaxStock && (
                      <p style={{ color: '#f97316', fontSize: '0.8rem', marginTop: '4px' }}>
                        Maximum in-stock quantity reached
                      </p>
                    )}
                    <button onClick={() => handleRemove(id)} className="btn-remove">Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cart-summary">
            <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
            <button onClick={handleCheckout} className="btn btn-checkout">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
