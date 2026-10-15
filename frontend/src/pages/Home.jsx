import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const getCustomer = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/customers/me",
          {
            withCredentials: true,
          }
        );

        setCustomer(response.data.customer);
      } catch (err) {
        console.log(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getCustomer();
  }, [navigate]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-content">
        <div className="customer-card">
          <h1>Welcome, {customer.fullName} 👋</h1>

          <p className="subtitle">
            Welcome back to ShopKart
          </p>

          <div className="customer-info">
            <div>
              <span>Email</span>
              <p>{customer.email}</p>
            </div>

            <div>
              <span>Phone</span>
              <p>{customer.phone}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;