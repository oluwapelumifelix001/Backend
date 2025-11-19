import User from '../models/user.models.js';
import { transporter } from '../index.js'; 


export const PostSignup = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const name = req.body.name?.trim();
    const email = req.body.email?.toLowerCase().trim();
    const Password = req.body.Password?.trim();

    const PasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (!PasswordRegex.test(Password)) {
      return res.status(400).json({
        message: "Password must include uppercase, lowercase, number, special character, and be at least 6 characters long."
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered." });

    const newUser = new User({ name, email, Password });
    await newUser.save();

    if (transporter) {
      const mailOptions = {
        from: process.env.Email_USER,
        to: email,
        subject: "Welcome to Felix Page - Email Verification",
        html: `
          <div style="font-family: Arial, sans-serif; text-align:center; padding:40px;">
            <h2>Welcome ${name}!</h2>
            <p>Thank you for joining <strong>Felix Page</strong>.</p>
            <a href="#" style="padding:10px 20px; background:#007bff; color:white; border-radius:5px; text-decoration:none;">Get Started</a>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    }

    req.session.userId = newUser._id;
    res.status(201).json({ message: "Signup successful!", user: { name: newUser.name, email: newUser.email } });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Something went wrong, please try again." });
  }
};


export const PostLogin = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const Password = req.body.Password?.trim();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Email or Password" });

    const isMatch = await user.comparePassword(Password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Email or Password" });

    req.session.userId = user._id;
    res.status(200).json({ message: "Login successful", user: { name: user.name, email: user.email } });

  } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Something went wrong, please try again." });
    }
  };

export const getDashboard = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(req.session.userId).select('-Password');
    res.status(200).json({ user });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



