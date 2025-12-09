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

// Import Security Middleware
const auth = require('./middleware/auth'); 

// Import the Product Blueprint
const Product = require('./models/Product'); 

const app = express();
app.use(express.json()); // Allows server to read JSON data from client
app.use(cors()); // Allows Frontend (port 5173) to talk to Backend (port 5000)

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

// 1. Register User Route (Sign Up) - UPDATED WITH PROFESSIONAL EMAIL
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body; 
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Generate verification token (30 minute expiry)
        const verificationToken = crypto.randomBytes(20).toString('hex');

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'customer', 
            isVerified: false, 
            verificationToken: verificationToken,
            verificationTokenExpires: Date.now() + 1800000 // 30 minutes
        });

        await user.save();
        
        // --- Send Professional Verification Email ---
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const verificationUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;
        
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Verify Your Email for Spar-Shoe',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                    <h2 style="color: #2563EB; text-align: center; margin-bottom: 20px;">Welcome to Spar-Shoe! 👟</h2>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">Hi there,</p>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">Thank you for creating an account with <strong>Spar-Shoe</strong>.</p>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">To keep your account secure and ensure a smooth shopping experience, please verify your email address by clicking the link below:</p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${verificationUrl}" style="background-color: #2563EB; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                            👉 Verify Email Address
                        </a>
                    </div>

                    <p style="font-size: 14px; color: #666; margin-top: 20px;">If you did not request this verification, you can safely ignore this email.</p>
                    <p style="font-size: 14px; color: #666;">Your account will remain inactive until your email is verified.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
                    
                    <p style="font-size: 14px; color: #888;">For any assistance, our support team is always here to help.</p>
                    <p style="font-size: 14px; color: #333; line-height: 1.6;">
                        Thank you,<br>
                        <strong>Spar-Shoe Team</strong><br>
                        <em style="color: #2563EB; font-weight: bold;">Run Faster. Fly Higher.</em>
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        
        res.status(201).json({ message: 'Registration Successful! Please check your email to verify your account before logging in.' });

    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).send('Server error');
    }
});

// 2. Login User Route (Sign In) - FIXED FOR ADMIN ACCESS
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        
        // FIXED CHECK: Block unverified users ONLY if they are NOT admins
        if (!user.isVerified && user.role !== 'admin') {
            return res.status(401).json({ message: 'Account not verified. Please check your email for the verification link.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create JWT (JSON Web Token)
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


// 3. Request Password Reset Link (Forgot Password - Step 1)
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'If user exists, a password reset email has been sent.' });
        }

        // Generate reset token (1 hour expiry)
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // 1. Create transporter (Email Sender)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        // 2. Construct the frontend reset link
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        // 3. Email content
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset Request',
            html: `<p>You requested a password reset. Click this link to reset your password within one hour:</p><a href="${resetUrl}">Reset Password</a>`
        };

        // 4. Send the email
        await transporter.sendMail(mailOptions);
        res.json({ message: 'If user exists, a password reset email has been sent.' });

    } catch (err) {
        console.error('Forgot Password Error:', err.message);
        res.status(500).send('Server error sending email.');
    }
});

// 4. Reset Password with Token (Forgot Password - Step 2)
app.post('/api/auth/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({ 
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() } // Check if token is not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        // Hash new password
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

// 5. Email Verification Route (New Route)
app.get('/api/auth/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({ 
            verificationToken: req.params.token,
            verificationTokenExpires: { $gt: Date.now() } // Check if token is not expired
        });

        if (!user) {
            return res.status(400).send('<h1>Email verification link is invalid or has expired.</h1><p>Please re-register or contact support.</p>');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        // Redirect user to a success page or the login page
        res.redirect('http://localhost:5173/login?verified=true');

    } catch (err) {
        console.error('Verification Error:', err.message);
        res.status(500).send('Server error during verification.');
    }
});


// =========================================================
//                  II. PRODUCT ROUTES (CRUD)
// =========================================================

// 1. Add a new Shoe (CREATE - POST) - SECURED
app.post('/api/products', auth, async (req, res) => {
    // Check role from the token payload
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

// 2. Get all Shoes (READ - GET) - UPDATED FOR SEARCH & FILTER
app.get('/api/products', async (req, res) => {
    try {
        const { category, search } = req.query; 

        let filter = {};
        
        // 1. Apply Category Filter
        if (category) {
            filter.category = category;
        }

        // 2. Apply Search Filter (Regex for partial match, case-insensitive)
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

// 3. Update/Edit a Shoe (UPDATE - PUT) - SECURED
app.put('/api/products/:id', auth, async (req, res) => {
    // Check role from the token payload
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } 
        );
        if (!product) return res.status(404).send('Product not found.');
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Delete a Shoe (DELETE) - SECURED
app.delete('/api/products/:id', auth, async (req, res) => {
    // Check role from the token payload
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));