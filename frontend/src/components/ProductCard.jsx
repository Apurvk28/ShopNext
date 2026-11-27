import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { addToCart, removeFromCart } from "../redux/cartSlice";
import "../styles/productcard.css";

const ProductCard = ({ product }) => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector((state) => state?.cart?.cartItems || []);

    const cartItem = cartItems.find(
        (item) => (item._id || item.productId) === product._id
    );
    const qty = cartItem ? Number(cartItem.qty) || 1 : 0;

    const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;
    const isAtMaxStock = typeof product.stock === "number" && qty >= product.stock;

    const handleCardClick = () => {
        navigate(`/product/${product._id}`);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();

        if (!user) {
            showToast("Please login or signup to add items to your cart.", "warning");
            navigate("/login");
            return;
        }

        if (isOutOfStock) {
            showToast("This product is currently out of stock!", "error");
            return;
        }

        dispatch(addToCart({
            _id: product._id,
            productId: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock,
            qty: 1,
        }));

        showToast("Successfully added to your cart!", "success");
    };

    const handleIncrement = (e) => {
        e.stopPropagation();

        if (!user) {
            showToast("Please login or signup to add items to your cart.", "warning");
            navigate("/login");
            return;
        }

        if (isAtMaxStock) {
            showToast(`Cannot add more. Only ${product.stock} items available in stock!`, "warning");
            return;
        }

        dispatch(addToCart({
            _id: product._id,
            productId: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock,
            qty: qty + 1,
        }));
    };

    const handleDecrement = (e) => {
        e.stopPropagation();

        if (qty <= 1) {
            dispatch(removeFromCart(product._id));
            showToast("Removed from cart.", "info");
        } else {
            dispatch(addToCart({
                _id: product._id,
                productId: product._id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                stock: product.stock,
                qty: qty - 1,
            }));
        }
    };

    const handleGoToCart = (e) => {
        e.stopPropagation();
        navigate("/cart");
    };

    return (
        <div
            className="product-card"
            onClick={handleCardClick}
            style={{ cursor: "pointer" }}
        >
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <div className="product-info">
                <h3>{product.name}</h3>
                <p className="price">₹{product.price}</p>
                {qty > 0 ? (
                    <div className="card-cart-actions" onClick={(e) => e.stopPropagation()}>
                        <div className="card-qty-selector">
                            <button
                                type="button"
                                onClick={handleDecrement}
                                className="card-qty-btn"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>
                            <span className="card-qty-value">{qty}</span>
                            <button
                                type="button"
                                onClick={handleIncrement}
                                className="card-qty-btn"
                                disabled={isAtMaxStock}
                                title={isAtMaxStock ? "Maximum available stock reached" : "Increase quantity"}
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleGoToCart}
                            className="btn btn-go-to-cart"
                        >
                            Go to Cart
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className="btn"
                        disabled={isOutOfStock}
                        style={isOutOfStock ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                    >
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
