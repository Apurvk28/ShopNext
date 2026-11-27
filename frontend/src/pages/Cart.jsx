import { useContext, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Sparkles, Tag, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { removeFromCart, addToCart, applyPromoCode, removePromoCode } from '../redux/cartSlice';
import { AVAILABLE_PROMOS, evaluatePromo } from '../utils/promo';
import '../styles/cart.css';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const cartItems = useSelector((state) => state?.cart?.cartItems || []);
  const appliedPromoCode = useSelector((state) => state?.cart?.promoCode || null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [promoQuery, setPromoQuery] = useState(appliedPromoCode || '');
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.products || []);
        setSuggestedProducts(list);
      } catch (err) {
        console.error('Failed to load suggested products:', err);
      }
    };
    fetchSuggestions();
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1),
    0
  );

  const promoResult = useMemo(() => {
    if (!appliedPromoCode) {
      return { valid: false, promo: null, discountAmount: 0, finalTotal: subtotal, reason: '' };
    }
    return evaluatePromo(appliedPromoCode, subtotal);
  }, [appliedPromoCode, subtotal]);

  const filteredPromos = useMemo(() => {
    const q = promoQuery.trim().toLowerCase();
    if (!q) return AVAILABLE_PROMOS;
    return AVAILABLE_PROMOS.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [promoQuery]);

  const recommendations = useMemo(() => {
    const inCartIds = new Set(cartItems.map((item) => item._id || item.productId));
    return suggestedProducts
      .filter((p) => !inCartIds.has(p._id) && (typeof p.stock !== 'number' || p.stock > 0))
      .slice(0, 4);
  }, [suggestedProducts, cartItems]);

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

  const handleApplyPromo = (codeToApply) => {
    const candidate = (codeToApply ?? promoQuery).trim().toUpperCase();
    const check = evaluatePromo(candidate, subtotal);

    if (!check.valid) {
      showToast(check.reason, 'warning');
      return;
    }

    dispatch(applyPromoCode(check.promo.code));
    setPromoQuery(check.promo.code);
    showToast(`${check.promo.code} applied! You saved ₹${check.discountAmount.toLocaleString('en-IN')}.`, 'success');
  };

  const handleRemovePromo = () => {
    dispatch(removePromoCode());
    setPromoQuery('');
    showToast('Promo code removed.', 'info');
  };

  const handleQuickAdd = (product) => {
    if (!user) {
      showToast('Please login or signup to add items to your cart.', 'warning');
      navigate('/login');
      return;
    }
    dispatch(
      addToCart({
        _id: product._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        qty: 1,
      })
    );
    showToast(`${product.name} added to your cart!`, 'success');
  };

  const handleCheckout = () => {
    if (!user) {
      showToast('Please login or signup to proceed to checkout.', 'warning');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const discountAmount = promoResult.valid ? promoResult.discountAmount : 0;
  const finalTotal = promoResult.valid ? promoResult.finalTotal : subtotal;

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty. <Link to="/shop">Go Shopping</Link></p>
      ) : (
        <>
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
                          title={isAtMaxStock ? 'Maximum available stock reached' : 'Increase quantity'}
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

            <div className="cart-summary space-y-5">
              {/* Promo Code Search & Available Offers */}
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[#111827]">
                    <Tag className="size-4 text-[#ea580c]" />
                    Promo Code
                  </span>
                  {promoResult.valid && (
                    <span className="text-xs font-semibold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                      {promoResult.promo.code} Applied
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="size-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={promoQuery}
                      onChange={(e) => setPromoQuery(e.target.value)}
                      placeholder="Search or enter code (e.g. NEXT20)"
                      className="w-full rounded-lg border border-[#d1d5db] bg-white pl-9 pr-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/15"
                    />
                  </div>
                  {promoResult.valid ? (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-xs font-semibold text-[#ef4444] hover:bg-[#fef2f2] transition-colors cursor-pointer"
                    >
                      <X className="size-3.5" />
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyPromo(promoQuery)}
                      className="rounded-lg bg-[#111827] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ea580c] transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  )}
                </div>

                {appliedPromoCode && !promoResult.valid && promoResult.reason && (
                  <p className="text-xs font-medium text-[#d97706] bg-[#fffbeb] border border-[#fde68a] rounded-lg px-3 py-2">
                    {promoResult.reason}
                  </p>
                )}

                {/* Available Promo Codes List */}
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                    Available Offers
                  </p>
                  {filteredPromos.length > 0 ? (
                    filteredPromos.map((offer) => {
                      const isApplied = promoResult.valid && promoResult.promo?.code === offer.code;
                      const isEligible = subtotal > offer.minSubtotal;
                      return (
                        <div
                          key={offer.code}
                          className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-[#fdba74] bg-white p-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#ea580c] bg-[#fff7ed] px-2 py-0.5 rounded border border-[#fed7aa]">
                                {offer.code}
                              </span>
                              <span className="text-xs font-semibold text-[#111827] truncate">
                                {offer.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6b7280] mt-1">
                              {isEligible
                                ? offer.description
                                : `Add ₹${(offer.minSubtotal + 1 - subtotal).toLocaleString('en-IN')} more to unlock`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => (isApplied ? handleRemovePromo() : handleApplyPromo(offer.code))}
                            className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                              isApplied
                                ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                                : 'bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] hover:bg-[#ea580c] hover:text-white'
                            }`}
                          >
                            {isApplied ? 'Applied ✓' : 'Apply'}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-[#6b7280]">No matching promo codes found.</p>
                  )}
                </div>
              </div>

              {/* Total Bill Split */}
              <div className="space-y-2.5 border-t border-[#e5e7eb] pt-4 text-sm">
                <h3 className="!text-lg !mb-3 !pb-2">Bill Summary</h3>
                <div className="flex items-center justify-between text-[#4b5563]">
                  <span>Cart Subtotal</span>
                  <span className="font-medium text-[#111827]">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-[#059669]">
                    <span>Promo ({promoResult.promo.code} · {promoResult.promo.discountPercent}% OFF)</span>
                    <span className="font-semibold">- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-3 text-base font-bold text-[#111827]">
                  <span>Total Payable</span>
                  <span className="text-xl text-[#ea580c]">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleCheckout} className="btn btn-checkout">
                Proceed to Checkout
              </button>
            </div>
          </div>

          {/* Frequently Bought Together / Quick Add Suggestions */}
          {recommendations.length > 0 && (
            <section className="mt-14 pt-8 border-t border-[#e5e7eb]">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="size-5 text-[#ea580c]" />
                <h3 className="text-xl font-bold text-[#111827] mb-0">
                  Frequently Bought Together
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recommendations.map((product) => (
                  <div
                    key={product._id}
                    className="flex flex-col justify-between rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-[#fdba74] transition-all"
                  >
                    <Link to={`/product/${product._id}`} className="block">
                      <div className="h-44 w-full rounded-lg bg-[#f9fafb] border border-[#e5e7eb]/60 flex items-center justify-center p-3 mb-3 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <p className="text-xs font-medium text-[#6b7280]">{product.category}</p>
                      <h4 className="text-sm font-bold text-[#111827] truncate mt-0.5 mb-1">
                        {product.name}
                      </h4>
                      <p className="text-base font-bold text-[#ea580c] mb-3">
                        ₹{product.price}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#ea580c] bg-[#fff7ed] px-3 py-2 text-xs font-semibold text-[#ea580c] hover:bg-[#ea580c] hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      Quick Add
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
