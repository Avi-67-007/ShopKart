import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";


export const registerCustomer = async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  console.log(req.body);
  
  try {
    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    console.log("About to search");
    
    const customer = await Customer.findOne({ email });
    console.log("searched");
    
    if (customer) {
      return res.status(409).json({
        message: "email already exist",
      });
    }
    if(phone.length != 10){
        return res.status(400).json({
            message : "Invalid Phone Number"
        })
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "password too short",
      });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newCustomer = await Customer.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(200).json({
        success: true,
        message: "Customer registered successfully",
        customer : {
            _id : newCustomer._id,
            fullName : newCustomer.fullName,
            email : newCustomer.email,
            phone : newCustomer.phone
        }
    });
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(customer._id);

    res.cookie("token", token, {
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const logoutCustomer = async (req, res) => {
  try {
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const getCustomer = (req, res) => {
  res.status(200).json(req.customer);
};
