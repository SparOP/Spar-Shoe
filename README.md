# 👟 Spar-Shoe | Premium E-Commerce Store

**Spar-Shoe** is a full-stack e-commerce application designed for sneaker enthusiasts. It features a modern, responsive UI, secure user authentication with email verification, an admin dashboard for product management, and a seamless shopping experience.

![Project Logo](frontend/src/assets/logo.png)

## 🚀 Live Demo
> Link 


---

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, Vite, Lucide React
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **Authentication:** JWT (JSON Web Tokens), Nodemailer (Email Verification & Password Reset)
* **State Management:** React Context API

---

## ✨ Key Features

### 🔐 Authentication & Security
* **User Registration:** Secure sign-up with password hashing (bcrypt).
* **Email Verification:** Users receive a real email code to verify their account before logging in.
* **Forgot Password:** Secure reset link sent via email if a password is lost.
* **Role-Based Access:** Distinct User and Admin roles.

### 🛍️ Shopping Experience
* **Product Filtering:** Filter shoes by Category (Running, Basketball, Casual, etc.).
* **Smart Search:** Real-time search bar to find products instantly.
* **Shopping Cart:** Add/Remove items and view total price dynamically.
* **Wishlist:** Save favorite items for later.
* **Responsive Design:** Fully optimized for Mobile, Tablet, and Desktop.

### ⚡ Admin Dashboard
* **Product Management:** Admin can Add, Edit, and Delete products.
* **Secure Access:** Protected routes ensure only Admins can access the dashboard.

---

## ⚙️ Environment Variables

To run this project locally, you will need to add the following environment variables to your `.env` file in the `backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password
