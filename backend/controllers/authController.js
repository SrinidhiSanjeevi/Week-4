const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// SIGNUP
const signup = async (req, res) => {
  try {

    console.log("Signup Request:", req.body);

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    console.log("User Created:", user);

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });

  } catch (error) {

    console.error("SIGNUP ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {

    console.log("Login Request:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials"
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );
    
     res.status(200).json({
  success: true,
  token,
  user: {
    name: user.name,
    email: user.email
  }
});
    res.status(200).json({
      success: true,
      token
    });

  } catch (error) {

    console.error("LOGIN ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  signup,
  login
};