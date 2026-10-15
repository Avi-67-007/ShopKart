import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8081/customers/logout",
        {},
        {
          withCredentials: true,
        }
      );

      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="navbar">
      <h2 className="logo">ShopKart</h2>

      <div className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/wishlist">Wishlist ♡</Link>
        <Link to="/cart">🛒 Cart ({totalItems})</Link>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default Navbar;
