# ShopKart — MERN E-Commerce Application

ShopKart is a full-stack e-commerce web application built using the MERN stack. It allows users to browse products, manage their shopping cart and wishlist, authenticate securely, and place orders through a payment integration.

## Features

- **User Authentication:** Customer registration, login, and logout.
- **Product Catalog:** Browse products and view product details.
- **Search and Filtering:** Find products using the available search and filter options.
- **Shopping Cart:** Add products, manage quantities, and view the cart total.
- **Wishlist:** Save products for later.
- **Checkout:** Enter shipping details and proceed to payment.
- **Payment Integration:** Razorpay integration with payment verification.
- **Order Management:** View order history and individual order details.
- **Responsive UI:** A modern storefront interface.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- HTML5
- CSS3
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- Cookie Parser
- CORS
- Razorpay

## Project Structure

```text
ShopKart/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   ├── seedProducts.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Prerequisites

Make sure the following are installed:

- Node.js and npm
- MongoDB Atlas account or another accessible MongoDB database
- Git
- A Razorpay account for payment integration

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Avi-67-007/ShopKart.git
cd ShopKart
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory and configure the environment variables expected by the backend configuration:

```env
dbURL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Use the exact variable names referenced in your backend code. Never commit real credentials to GitHub.

Start the backend:

```bash
node index.js
```

The backend runs on port `8081` in the local development configuration.

### 3. Seed the product database

Open a separate terminal:

```bash
cd backend
node seedProducts.js
```

The seeding script adds the sample products that are not already present in the database.

### 4. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, normally:

http://localhost:5173

Ensure the frontend API configuration points to the running backend at `http://localhost:8081` during local development.

## API Routes

The backend exposes the following API route groups:

| Route | Purpose |
|---|---|
| `/customers` | Customer authentication and account operations |
| `/products` | Product catalog operations |
| `/wishlist` | Wishlist management |
| `/cart` | Shopping cart management |
| `/orders` | Checkout, payment verification, and order management |

The exact endpoints and HTTP methods are defined in the corresponding route files under `backend/routes/`.

## Payment Integration

ShopKart integrates Razorpay for checkout and payment verification. Use Razorpay Test Mode credentials for development and testing. Payment verification is handled by the backend.

Never expose the Razorpay secret key or JWT secret in frontend code.

## Testing

The application was tested locally for its core shopping workflows, including authentication, product browsing, cart and wishlist operations, and checkout-related functionality.

Payment testing should use Razorpay's official test credentials and test payment methods.

## Future Improvements

- Deploy the frontend and backend.
- Add product reviews and ratings.
- Improve product recommendations.
- Add an administration dashboard for product and order management.

## Author

**Avichal Sharma**

GitHub: https://github.com/Avi-67-007

## License

This project was developed for educational purposes.
