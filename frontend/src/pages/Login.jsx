import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import axios from "axios"; 
import { useAuth } from "../context/AuthContext"; 

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); 
  const { auth, login } = useAuth(); 
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (auth.token) navigate('/');
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true') {
        alert("Success! Your email has been verified. You can now log in.");
        navigate('/login', { replace: true }); 
    }
  }, [auth.token, navigate, location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const url = isRegister 
      ? `${API_BASE_URL}/api/auth/register` 
      : `${API_BASE_URL}/api/auth/login`;

    try {
      const payload = isRegister ? { name, email, password } : { email, password };
      
      const response = await axios.post(url, payload);

      if (isRegister) {
        alert("Account created successfully. Verification email sent.");
        setIsRegister(false); 
        setName("");
        setEmail("");
        setPassword("");
      } else {
        const { token, role, name } = response.data;
        login(token, name, role); 
        navigate('/'); 
      }

    } catch (error) {
      const message = error.response?.data?.message || "Authentication failed.";
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isRegister ? "Create Account" : "Sign In"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            {isRegister ? "Enter your details to get started." : "Access your order history and wishlist."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-600 focus:ring-0 outline-none transition-all"
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-600 focus:ring-0 outline-none transition-all"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                {!isRegister && (
                    <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400">
                        Forgot Password?
                    </Link>
                )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-600 focus:ring-0 outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {isRegister ? "Already have an account?" : "New to Spar-Shoe?"}{" "}
          <button 
            type="button" 
            onClick={() => setIsRegister(!isRegister)} 
            className="text-blue-600 hover:underline font-semibold"
          >
            {isRegister ? "Sign In" : "Create Account"}
          </button>
        </p>
      </div>
    </div>
  );
}