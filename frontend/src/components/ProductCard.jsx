import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Package, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { addToCart, removeFromCart } from "../redux/cartSlice";
import { PerspectiveFlipCard } from "@/components/ui/perspective-flip-card";
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

    const frontFace = (
        <div className="size-full flex flex-col [transform-style:preserve-3d]">
            <div className="relative h-60 w-full [transform-style:preserve-3d] [transform:translateZ(50px)]">
                <div className="absolute inset-0 rounded-xl bg-[#f9fafb] overflow-hidden border border-[#e5e7eb]/70 flex items-center justify-center p-3">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain transition duration-700 group-hover/p-card:scale-105"
                    />
                </div>
            </div>

            <div className="flex flex-col justify-between flex-grow px-3 pt-4 pb-2 [transform-style:preserve-3d]">
                <div className="space-y-1.5 [transform-style:preserve-3d] [transform:translateZ(60px)]">
                    <div className="flex items-center gap-1.5 text-[#ea580c] text-xs font-semibold tracking-wide">
                        <Sparkles className="size-3.5" />
                        <span>{product.category || "ShopNext"}</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-[#111827] transition duration-300 group-hover/p-card:text-[#ea580c] leading-snug truncate">
                        {product.name}
                    </h3>
                    <p className="text-xl font-bold text-[#ea580c] leading-none pt-1">
                        ₹{product.price}
                    </p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#6b7280] [transform:translateZ(40px)] pt-2">
                    <span className="group-hover/p-card:text-[#ea580c] group-hover/p-card:translate-x-1 transition-all">
                        Hover for details
                    </span>
                    <ArrowRight className="size-4 group-hover/p-card:text-[#ea580c]" />
                </div>
            </div>
        </div>
    );

    const backFace = (
        <div className="size-full flex flex-col items-center justify-between [transform-style:preserve-3d] py-2">
            <div className="w-full [transform-style:preserve-3d] flex justify-center gap-2.5">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#f9fafb] border border-[#e5e7eb] [transform:translateZ(120px)] flex-1 min-w-0 [transform-style:preserve-3d]">
                    <div className="p-1.5 rounded-xl bg-white border border-[#e5e7eb] text-[#ea580c] [transform:translateZ(20px)] shadow-sm">
                        <Tag className="size-4" />
                    </div>
                    <p className="text-[11px] font-bold text-[#111827] [transform:translateZ(10px)] tracking-tight truncate max-w-full">
                        ₹{product.price}
                    </p>
                </div>

                <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#f9fafb] border border-[#e5e7eb] [transform:translateZ(150px)] flex-1 min-w-0 [transform-style:preserve-3d]">
                    <div className="p-1.5 rounded-xl bg-white border border-[#e5e7eb] text-[#ea580c] [transform:translateZ(25px)] shadow-sm">
                        <Package className="size-4" />
                    </div>
                    <p className="text-[11px] font-bold text-[#111827] [transform:translateZ(10px)] tracking-tight truncate max-w-full">
                        {isOutOfStock ? "Out" : `${product.stock ?? "In"} Left`}
                    </p>
                </div>

                <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#f9fafb] border border-[#e5e7eb] [transform:translateZ(120px)] flex-1 min-w-0 [transform-style:preserve-3d]">
                    <div className="p-1.5 rounded-xl bg-white border border-[#e5e7eb] text-[#ea580c] [transform:translateZ(20px)] shadow-sm">
                        <ShoppingBag className="size-4" />
                    </div>
                    <p className="text-[11px] font-bold text-[#111827] [transform:translateZ(10px)] tracking-tight truncate max-w-full">
                        {product.category || "Apparel"}
                    </p>
                </div>
            </div>

            <div className="space-y-2 [transform-style:preserve-3d] px-2">
                <h3 className="text-lg font-bold tracking-tight text-[#111827] [transform:translateZ(80px)] line-clamp-1">
                    {product.name}
                </h3>
                <p className="text-[13px] font-medium text-[#4b5563] leading-relaxed [transform:translateZ(40px)] line-clamp-3 max-w-[260px] mx-auto">
                    {product.description || "Curated ShopNext piece crafted for everyday comfort and style."}
                </p>
            </div>

            <div
                className="w-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
                onClick={(e) => e.stopPropagation()}
            >
                {qty > 0 ? (
                    <div className="card-cart-actions">
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

    return (
        <PerspectiveFlipCard
            onClick={handleCardClick}
            front={frontFace}
            back={backFace}
        />
    );
};

export default ProductCard;
