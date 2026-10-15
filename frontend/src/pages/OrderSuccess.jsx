import { useNavigate, useParams } from "react-router-dom";

function OrderSuccess() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="order-success">
            <h1>✅ Order Placed Successfully!</h1>
            <p>Order ID: {id}</p>
            <p>Your payment has been verified and your order is saved.</p>

            <button onClick={() => navigate("/orders")}>
                View My Orders
            </button>

            <button onClick={() => navigate("/products")}>
                Continue Shopping
            </button>
        </div>
    );
}

export default OrderSuccess;
