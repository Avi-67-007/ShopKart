import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [adding, setAdding] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState("");

    const handleAddToWishlist = async () => {
        try {
            setSaving(true);
            setMessage("");
            setError("");

            await api.post(`/wishlist/${product._id}`);

            setMessage("♥ Added to Wishlist");
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Unable to save product. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleAddToCart = async () => {
        try {
            setAdding(true);
            setCartMessage("");
            setCartError("");

            await addToCart(product._id);

            setCartMessage("Added to cart!");
        } catch (err) {
            console.error(err);
            setCartError(
                err.response?.data?.message ||
                "Unable to add product to cart."
            );
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="product-card">
            <img src={product.image} alt={product.name} />

            <h2>{product.name}</h2>
            <p>₹{product.price}</p>
            <p>{product.category}</p>
            <p>Stock: {product.stock}</p>

            <button
                onClick={() => navigate(`/products/${product._id}`)}
            >
                View Details
            </button>

            <button
                onClick={handleAddToWishlist}
                disabled={saving}
            >
                {saving ? "Saving..." : "♡ Add to Wishlist"}
            </button>

            <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
            >
                {adding ? "Adding..." : "🛒 Add to Cart"}
            </button>

            {message && <p>{message}</p>}
            {error && <p>{error}</p>}

            {cartMessage && <p>{cartMessage}</p>}
            {cartError && <p>{cartError}</p>}
        </div>
    );
}

export default ProductCard;
