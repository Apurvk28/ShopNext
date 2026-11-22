import { Link } from "react-router-dom";

const Home = () => {
    return (
        <main className="home">
            <section className="hero">
                <h1>Welcome to ShopNext</h1>
                <p>Your one stop solution for all yout needs.Explore our wide range of products and enjoy seamless shopping experience.</p>
                <Link to="/shop" className="cta-button">Start Shopping</Link>
            </section>
        </main>
    );
};

export default Home;
