import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, User, LayoutDashboard, ShoppingCart, LogOut, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext"; 
import logoImg from '../assets/logo.png'; 

export default function Navbar({ onSearch }) {
  const [darkMode, setDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();
  const { auth, logout } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    onSearch(e.target.value);
  };

  const isLoggedIn = auth.token;
  const isAdmin = auth.role === 'admin';
  const userName = auth.user;

  return (
    <div className="sticky top-0 z-50 px-4 py-4">
      <nav className="max-w-7xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl transition-all duration-300">
        <div className="px-6 h-20 flex items-center justify-between gap-4">
          
          {/* 1. LOGO SECTION */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            {/* Logo Image with rounded corners and rotation effect */}
            <img 
                src={logoImg} 
                alt="Spar-Shoe" 
                // Added 'rounded-xl' here for rounded edges
                className="w-12 h-12 object-contain rounded-xl group-hover:-rotate-12 transition-transform duration-300 drop-shadow-lg"
            />
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 hidden md:block">
              Spar-Shoe
            </span>
          </Link>

          {/* 2. SEARCH BAR (Hidden on mobile) */}
          <div className="flex-grow max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search for shoes..." 
                onChange={handleSearch} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* 3. DESKTOP ICONS */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            
            <Link to="/checkout" className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 hover:scale-110">
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-bounce">
                  {cart.length}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link to="/admin" className="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 hover:scale-110" title="Admin Dashboard">
                <LayoutDashboard size={22} />
              </Link>
            )}
            
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 hover:scale-110">
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            {!isLoggedIn ? (
              <Link to="/login" className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all duration-300 shadow-blue-500/20">
                <User size={18} />
                <span>Login</span>
              </Link>
            ) : (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
                <span className="text-gray-800 dark:text-white font-medium text-sm hidden lg:inline">
                  Hi, <span className="font-bold text-blue-600 dark:text-blue-400">{userName?.split(' ')[0]}</span>
                </span>
                <button onClick={handleLogout} className="bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-2.5 rounded-xl transition-all hover:scale-105">
                    <LogOut size={20} />
                </button>
              </div>
            )}
          </div>

          {/* 4. MOBILE MENU BUTTON */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* 5. MOBILE DROPDOWN MENU */}
        {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 dark:border-gray-800 p-4 space-y-4 animate-fade-in-down">
                {/* Mobile Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                    />
                </div>

                <div className="flex justify-between items-center px-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Dark Mode</span>
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>

                <Link to="/checkout" className="flex items-center gap-3 px-2 py-2 font-bold text-gray-700 dark:text-gray-200" onClick={() => setIsMenuOpen(false)}>
                    <ShoppingCart size={20} /> My Cart ({cart.length})
                </Link>

                {isAdmin && (
                    <Link to="/admin" className="block text-center w-full bg-gray-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>
                        Admin Dashboard
                    </Link>
                )}

                {!isLoggedIn ? (
                    <Link to="/login" className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-bold shadow-lg" onClick={() => setIsMenuOpen(false)}>
                        Login / Sign Up
                    </Link>
                ) : (
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500 py-3 font-bold bg-red-50 dark:bg-red-900/10 rounded-xl">
                        <LogOut size={20} /> Logout
                    </button>
                )}
            </div>
        )}
      </nav>
    </div>
  );
}