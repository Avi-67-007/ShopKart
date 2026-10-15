
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const fetchWishlist = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/wishlist");
            setWishlist(response.data.wishlist);
        } catch (err) {
            console.error(err);
            setError("Unable to load wishlist.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const handleRemove = async (productId) => {
        try {
            await api.delete(`/wishlist/${productId}`);

            setWishlist((current) =>
                current.filter(
                    (product) => product._id !== productId
                )
            );
        } catch (err) {
            console.error(err);
            setError("Unable to remove product. Please try again.");
        }
    };

    if (loading) {
        return <h2>Loading your wishlist...</h2>;
    }

    if (error && wishlist.length === 0) {
        return (
            <div>
                <p>{error}</p>
                <button onClick={fetchWishlist}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="products-page">
            <h1>My Wishlist</h1>
            <p>{wishlist.length} products saved</p>

            {error && <p>{error}</p>}

            {wishlist.length === 0 ? (
                <div>
                    <h2>Your wishlist is empty ❤️</h2>
                    <p>Save products you love and find them here later.</p>
                    <button onClick={() => navigate("/products")}>
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="products-grid">
                    {wishlist.map((product) => (
                        <div className="product-card" key={product._id}>
                            <img
                                src={product.image}
                                alt={product.name}
                            />
                            <h2>{product.name}</h2>
                            <p>₹{product.price}</p>
                            <p>{product.category}</p>
                            <p>
                                {product.stock > 0
                                    ? `${product.stock} units left`
                                    : "Out of stock"}
                            </p>

                            <button
                                onClick={() =>
                                    navigate(`/products/${product._id}`)
                                }
                            >
                                View Details
                            </button>

                            <button
                                onClick={() => handleRemove(product._id)}
                            >
                                Remove from Wishlist
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Wishlist;
