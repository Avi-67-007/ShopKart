import express from "express";

import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
} from "../controllers/customer.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

const customerRoutes = express.Router();

customerRoutes.post("/register", registerCustomer);

customerRoutes.post("/login", loginCustomer);

customerRoutes.post("/logout", isAuthenticated, logoutCustomer);

customerRoutes.get("/me", isAuthenticated, (req, res) => {
  res.status(200).json({
    success: true,
    customer: {
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
    },
  });
});

export default customerRoutes;