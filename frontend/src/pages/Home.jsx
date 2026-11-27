import { useEffect, useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';
import ClothingRailHero from '@/components/ui/product-rail-gallery';
import GlyphPortal from '@/components/ui/glyph-portal';
import ShopNextStamp from '@/components/ui/stamp';
import VideoMarqueeDemo from '@/components/ui/fashion-video-marquee';
import TestimonialsVerticalMarquee from '@/components/ui/testimonials-with-verticalmarquee';
import LeInviteOpening from '@/components/ui/le-invite-scroll-to-unwrap';
import Skiper39 from '@/components/ui/skiper39';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addToCart } from '../redux/cartSlice';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state?.cart?.cartItems || []);

  useEffect(() => {
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
  }, []);

  const railProducts = useMemo(() => {
    const withRailAssets = products.filter((p) => p.backImageUrl || p.sideImageUrl);
    return (withRailAssets.length > 0 ? withRailAssets : products).slice(0, 10);
  }, [products]);

  const railItems = useMemo(() => {
    return railProducts.map((product) => {
      const formattedPrice = `₹${Number(product.price || 0).toLocaleString('en-IN')}`;
      return {
        id: product._id,
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        category: product.category,
        kind: product.kind || 'tee',
        color: product.color || '#EFEBE2',
        image: product.imageUrl,
        backImage: product.backImageUrl || product.imageUrl,
        sideImage: product.sideImageUrl,
        tag: formattedPrice,
        details:
          Array.isArray(product.details) && product.details.length > 0
            ? product.details
            : [product.category, formattedPrice],
      };
    });
  }, [railProducts]);

  const handleHeroAddToCart = (item) => {
    if (!user) {
      showToast('Please login or signup to add items to your cart.', 'warning');
      navigate('/login');
      return;
    }

    if (typeof item.stock === 'number' && item.stock <= 0) {
      showToast('This product is currently out of stock!', 'error');
      return;
    }

    const existingItem = cartItems.find(
      (cartItem) => (cartItem._id || cartItem.productId) === item._id
    );

    if (existingItem && typeof item.stock === 'number' && existingItem.qty >= item.stock) {
      showToast(`Cannot add more. Only ${item.stock} items available in stock!`, 'warning');
      return;
    }

    dispatch(addToCart({
      _id: item._id,
      productId: item._id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      stock: item.stock,
      qty: existingItem ? existingItem.qty + 1 : 1,
    }));

    showToast('Successfully added to your cart!', 'success');
  };

  const handleHeroViewProduct = (item) => {
    navigate(`/product/${item._id}`);
  };

  const featuredProducts = useMemo(() => {
    return railProducts.slice(0, 4);
  }, [railProducts]);

  return (
    <div className="home-container">
      {railItems.length > 0 ? (
        <ClothingRailHero
          items={railItems}
          hanger="none"
          heading=" Find Your Next Favourite Fit."
          caption="Brush along the rail, slide a hanger, lift a piece to see the back."
          autoplay={true}
          onAddToCart={handleHeroAddToCart}
          onViewProduct={handleHeroViewProduct}
          action={
            <Link to="/shop" className="btn">
              View Full Catalog →
            </Link>
          }
          className="mb-12 rounded-2xl border border-[#e5e7eb] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
        />
      ) : (
        <div className="hero-banner">
          <h1>Welcome to ShopNext</h1>
          <p>Discover the best products at unbeatable prices.</p>
        </div>
      )}

      {!user && (
        <div className="my-8 rounded-2xl overflow-x-clip">
          <GlyphPortal
            word="SHOPNEXT"
            fontFamily="'Outfit', Arial, sans-serif"
            fontWeight={800}
            scrollLength={1.8}
            interactive={true}
            enterLabel="Step inside"
            front={
              <div className="pointer-events-none flex flex-col items-center justify-between h-full py-10 px-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4b5563]">
                  Curated everyday essentials
                </p>
                <p className="text-sm text-[#4b5563] mb-16">
                  Choose a letter &amp; scroll to explore
                </p>
              </div>
            }
          >
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111827] max-w-2xl leading-tight mb-0">
                Everyday silhouettes, crafted for how you actually dress.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="border-t border-[#e5e7eb] pt-4">
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">
                    <span className="font-mono text-xs tracking-widest text-[#ea580c] mr-2.5">01</span>
                    Curated Apparel
                  </h3>
                  <p className="text-sm leading-relaxed text-[#4b5563]">
                    Heavyweight tees, breathable knits, and clean-cut outerwear built for daily rotation.
                  </p>
                </div>
                <div className="border-t border-[#e5e7eb] pt-4">
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">
                    <span className="font-mono text-xs tracking-widest text-[#ea580c] mr-2.5">02</span>
                    Transparent INR Pricing
                  </h3>
                  <p className="text-sm leading-relaxed text-[#4b5563]">
                    Honest, rounded Indian retail pricing with zero hidden fees from cart to checkout.
                  </p>
                </div>
                <div className="border-t border-[#e5e7eb] pt-4">
                  <h3 className="text-lg font-semibold text-[#111827] mb-2">
                    <span className="font-mono text-xs tracking-widest text-[#ea580c] mr-2.5">03</span>
                    Effortless Delivery
                  </h3>
                  <p className="text-sm leading-relaxed text-[#4b5563]">
                    Fast shipping across India with smooth cart controls and instant Razorpay checkout.
                  </p>
                </div>
              </div>
            </div>
          </GlyphPortal>
        </div>
      )}

      <h2>Featured Products</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="product-grid">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      )}

      <ShopNextStamp />
      {!user && <VideoMarqueeDemo />}
      {!user && <TestimonialsVerticalMarquee />}
      {!user && <LeInviteOpening theme="light" fontFamily="'Outfit', sans-serif" className="mt-12 overflow-x-clip" />}
      {user && <Skiper39 />}
    </div>
  );
};

export default Home;
