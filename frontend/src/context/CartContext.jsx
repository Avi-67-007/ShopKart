
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import api from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch cart from MongoDB through our backend
    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/cart");
            setCartItems(response.data.cart);
        } catch (err) {
            console.error(err);
            setError("Unable to load your cart.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Add product
    const addToCart = async (productId) => {
        const response = await api.post(`/cart/${productId}`);
        setCartItems(response.data.cart);
        return response.data;
    };

    // Update quantity
    const updateQuantity = async (productId, quantity) => {
        const response = await api.patch(`/cart/${productId}`, {
            quantity,
        });

        setCartItems(response.data.cart);
        return response.data;
    };

    // Remove product
    const removeFromCart = async (productId) => {
        const response = await api.delete(`/cart/${productId}`);
        setCartItems(response.data.cart);
        return response.data;
    };

    // Derived values — never hardcode or store separately
    const totalItems = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = cartItems.reduce(
        (total, item) =>
            total + item.product.price * item.quantity,
        0
    );

    const value = {
        cartItems,
        loading,
        error,
        totalItems,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
