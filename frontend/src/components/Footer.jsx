import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>ShopNext</h3>
                    <p>&copy; 2026 ShopNext. All rights reserved.</p>
                </div>

                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/shop">Shop</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
