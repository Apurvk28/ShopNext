import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                <img src="" alt="ShopNext Logo" className="navbar-logo" />
                ShopNext
                </Link>
            </div>
            <ul className="navbar-link">
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/profile">Profile</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
