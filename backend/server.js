const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
require('dotenv').config();

// NEW IMPORTS FOR EMAIL & TOKEN
const crypto = require('crypto'); 
const nodemailer = require('nodemailer'); 
const Razorpay = require('razorpay'); // <--- NEW IMPORT FOR PAYMENTS

// Import Security Middleware
const auth = require('./middleware/auth'); 

// Import the Product Blueprint
const Product = require('./models/Product'); 

const app = express();
app.use(express.json()); // Allows server to read JSON data from client

// CORS CONFIGURATION (Updated for Vercel deployment)
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://spar-shoe.vercel.app" // Your live frontend URL
  ],
  credentials: true
}));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Basic Route
app.get('/', (req, res) => {
    res.send("Server is Working!");
});

// =========================================================
//                  I. AUTHENTICATION ROUTES
// =========================================================

// 1. Register User Route (Sign Up)
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body; 
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const verificationToken = crypto.randomBytes(20).toString('hex');

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'customer', 
            isVerified: false, 
            verificationToken: verificationToken,
            verificationTokenExpires: Date.now() + 1800000 
        });

        await user.save();
        
        // --- FIX: NODEMAILER CONNECTION TIMEOUT ---
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // Explicit Host
            port: 465,             // Secure Port
            secure: true,          // Use SSL/TLS
            auth: { 
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS 
            }
        });

        // NOTE: In production, change localhost to your Render backend URL if needed for verification
        const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email/${verificationToken}`;
        
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Verify Your Email for Spar-Shoe',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                    <h2 style="color: #2563EB; text-align: center; margin-bottom: 20px;">Welcome to Spar-Shoe! 👟</h2>
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">Hi there,</p>
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">Thank you for creating an account. Please verify your email:</p>
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${verificationUrl}" style="background-color: #2563EB; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                            👉 Verify Email Address
                        </a>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json({ message: 'Registration Successful! Please check your email.' });

    } catch (err) {
        // If it's a timeout error, this will show up here.
        console.error('Registration Error:', err.message); 
        res.status(500).send('Server error');
    }
});

// 2. Login User Route
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        
        if (!user.isVerified && user.role !== 'admin') {
            return res.status(401).json({ message: 'Account not verified. Please check your email.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(
            payload, 'mySecretKey', { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role, name: user.name });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 3. Forgot Password Route
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'If user exists, a password reset email has been sent.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // --- FIX: NODEMAILER CONNECTION TIMEOUT ---
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        // Use Vercel URL for production, localhost for dev
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset Request',
            html: `<p>Click this link to reset your password:</p><a href="${resetUrl}">Reset Password</a>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'If user exists, a password reset email has been sent.' });

    } catch (err) {
        console.error('Forgot Password Error:', err.message);
        res.status(500).send('Server error sending email.');
    }
});

// 4. Reset Password Route
app.post('/api/auth/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({ 
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or expired.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.json({ message: 'Password has been successfully reset.' });

    } catch (err) {
        console.error('Reset Password Error:', err.message);
        res.status(500).send('Server error');
    }
});

// 5. Verify Email Route
app.get('/api/auth/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({ 
            verificationToken: req.params.token,
            verificationTokenExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).send('<h1>Link invalid or expired.</h1>');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?verified=true`);

    } catch (err) {
        console.error('Verification Error:', err.message);
        res.status(500).send('Server error.');
    }
});


// =========================================================
//                  II. PRODUCT ROUTES (CRUD)
// =========================================================

app.post('/api/products', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    try {
        const newProduct = new Product(req.body); 
        await newProduct.save(); 
        res.status(201).json(newProduct); 
    } catch (error) {
        res.status(500).json({ error: "Failed to add product" });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const { category, search } = req.query; 
        let filter = {};
        
        if (category) filter.category = category;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } } 
            ];
        }

        const products = await Product.find(filter); 
        res.json(products); 
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

app.put('/api/products/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).send('Product not found.');
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =========================================================
//                  III. PAYMENT ROUTES (RAZORPAY)
// =========================================================

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order Route
app.post('/api/payment/order', async (req, res) => {
  const { amount } = req.body;

  try {
    const options = {
      amount: amount * 100, // Amount in paisa (100 = 1 INR)
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).send(error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));