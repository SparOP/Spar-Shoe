import { X, ShoppingCart, IndianRupee } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

// IMPORTANT: Replace the placeholder key below with your actual Razorpay Test Key ID.
const RAZORPAY_KEY_ID = "YOUR_ACTUAL_RAZORPAY_TEST_KEY_ID_HERE"; 

export default function Checkout() {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();
  
  // Base URL for API calls, deployment ready
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Calculation (Total amount in Rupees)
  const subtotal = cart.reduce((acc, item) => acc + parseFloat(item.price || 0), 0);
  const tax = subtotal * 0.05; // 5% GST/Tax
  const shipping = subtotal > 0 ? 150 : 0; 
  const total = subtotal + tax + shipping;
  
  // Razorpay requires the amount in PAUSE (100 paise = 1 Rupee)
  const totalInPaise = Math.round(total * 100); 

  // Function to load the official Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
      if (totalInPaise === 0) {
        alert("Your cart is empty!");
        return;
      }

      // If the key is still the placeholder, alert the user to fix it.
      if (RAZORPAY_KEY_ID.includes('YOUR_ACTUAL_RAZORPAY_TEST_KEY_ID')) {
        alert("CRITICAL ERROR: Please replace the placeholder key in Checkout.jsx with your actual Razorpay Test Key ID.");
        return;
      }

      // 1. Prepare Payment Options
      const options = {
          key: RAZORPAY_KEY_ID, 
          amount: totalInPaise, 
          currency: "INR",
          name: "Spar-Shoe E-Commerce",
          description: "Premium Online Shoe Order (MCA Project)",
          image: "https://via.placeholder.com/100/3B82F6/FFFFFF?text=Shoe", // Placeholder Logo
          handler: function (response) {
              // --- PAYMENT SUCCESS CALLBACK ---
              alert("Payment Successful! Order ID: " + response.razorpay_order_id);
              
              // 2. Final Action: Clear the cart and redirect
              // Note: You would typically send this response to the backend to verify and record the payment.
              cart.forEach(item => removeFromCart(item._id)); 
              navigate('/');
          },
          prefill: {
              name: "Test User", 
              email: "test.user@example.com",
              contact: "9999999999"
          },
          theme: {
              color: "#3B82F6"
          }
      };

      // 2. Open the Razorpay Checkout Modal
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
  };

  // --- Empty Cart View ---
  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-950">
        <ShoppingCart size={64} className="text-gray-400 dark:text-gray-600 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Start adding some cool shoes to your collection!</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // --- Cart View with Summary ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 transition-colors duration-300 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items List (Left Side) */}
          <div className="lg:w-2/3 space-y-4">
            {cart.map((item, index) => (
              <div key={item._id + index} className="flex items-center bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-800">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                <div className="flex-grow">
                  <h2 className="font-bold text-gray-900 dark:text-white">{item.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Category: {item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 dark:text-white flex items-center justify-end">
                    <IndianRupee size={16} />{item.price}
                  </p>
                </div>
                <button 
                  onClick={() => removeFromCart(item._id)} 
                  className="ml-4 p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          
          {/* Order Summary (Right Side) */}
          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">Order Summary</h2>
              
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className='font-bold flex items-center'><IndianRupee size={16} />{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5% GST)</span>
                  <span className='font-bold flex items-center'><IndianRupee size={16} />{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className='font-bold flex items-center'><IndianRupee size={16} />{shipping.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xl font-extrabold text-gray-900 dark:text-white">
                  <span>Order Total</span>
                  <span className='flex items-center text-blue-600 dark:text-blue-400'><IndianRupee size={20} />{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button - CONNECTED TO RAZORPAY */}
              <button 
                onClick={handlePayment}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02]"
              >
                Proceed to Payment (₹{total.toFixed(2)})
              </button>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}