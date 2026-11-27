import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useSelector } from 'react-redux';
import '../styles/navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const cartItems = useSelector((state) => state.cart.cartItems);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        setMenuOpen(false);
        logout();
        navigate('/');
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" onClick={closeMenu}>
                    <img
                        src="/Mainlogo.jpg"
                        alt="ShopNext Logo"
                        className="navbar-logo"
                    />
                    ShopNext
                </Link>
            </div>

            <button
                type="button"
                className="navbar-toggle"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={menuOpen}
            >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                <li><Link to="/shop" onClick={closeMenu}>Shop</Link></li>
                <li><Link to="/cart" onClick={closeMenu}>Cart ({cartItems ? cartItems.length : 0})</Link></li>
                {user ? (
                    <>
                        <li><Link to="/profile" onClick={closeMenu}>Hi, {user.name}</Link></li>
                        {user.role === 'admin' && <li><Link to="/admin" onClick={closeMenu}>Admin</Link></li>}
                        <li><button onClick={handleLogout} className="btn-logout">Logout</button></li>
                    </>
                ) : (
                    <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
