import { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clearCart } from '../redux/cartSlice';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const cartItems = useSelector((state) => state?.cart?.cartItems || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      showToast('Please login or signup to proceed to checkout.', 'warning');
      navigate('/login');
    }
  }, [user, navigate, showToast]);

  if (!user) return null;

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1),
    0
  );

  const handlePayment = async () => {
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        showToast('Razorpay SDK failed to load. Please check your internet connection.', 'error');
        setLoading(false);
        return;
      }

      // Send item IDs and quantities so the server securely calculates real pricing and checks stock
      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item._id || item.productId,
            qty: Number(item.qty) || 1
          }))
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        showToast(orderData.message || 'Payment initialization failed on server.', 'error');
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ShopNext',
        description: 'Order Payment',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Secure order placement with cryptographic signature and payment ID
            const saveOrderRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
              },
              body: JSON.stringify({
                items: cartItems.map((item) => ({
                  productId: item._id || item.productId,
                  qty: Number(item.qty) || 1
                })),
                address,
                paymentId: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const savedOrderData = await saveOrderRes.json();

            if (saveOrderRes.ok) {
              dispatch(clearCart());
              navigate('/ordersuccess');
            } else {
              showToast(savedOrderData.message || 'Order confirmation failed. Please contact support.', 'error');
            }
          } catch (err) {
            console.error('Order Save Error:', err);
            showToast('Error processing order confirmation.', 'error');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user ? user.name : '',
          email: user ? user.email : '',
          contact: ''
        },
        theme: {
          color: '#f97316'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (resp) {
        showToast('Payment failed: ' + (resp?.error?.description || 'Transaction unsuccessful'), 'error');
        setLoading(false);
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
      showToast('Error initiating checkout: ' + error.message, 'error');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login first to complete your purchase", "warning");
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      showToast("Your cart is empty!", "warning");
      navigate('/shop');
      return;
    }
    handlePayment();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="checkout-form">
          <h3>Shipping Address</h3>
          <input
            type="text"
            placeholder="Full Name"
            required
            value={address.fullName}
            onChange={(e) => setAddress({...address, fullName: e.target.value})}
          />
          <input
            type="text"
            placeholder="Street Address"
            required
            value={address.street}
            onChange={(e) => setAddress({...address, street: e.target.value})}
          />
          <input
            type="text"
            placeholder="City"
            required
            value={address.city}
            onChange={(e) => setAddress({...address, city: e.target.value})}
          />
          <input
            type="text"
            placeholder="Postal Code"
            required
            value={address.postalCode}
            onChange={(e) => setAddress({...address, postalCode: e.target.value})}
          />
          <input
            type="text"
            placeholder="Country"
            required
            value={address.country}
            onChange={(e) => setAddress({...address, country: e.target.value})}
          />
          <div className="checkout-summary">
            <h4>Estimated Total: ₹{totalPrice.toFixed(2)}</h4>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Processing Payment...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
