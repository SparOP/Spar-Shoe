import { useEffect, useState, useCallback } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavbarMain';
import Footer from './components/Footer'; // <--- NEW IMPORT: Footer is now active
import Login from './pages/Login';
import Admin from './pages/Admin'; 
import Checkout from './pages/Checkout'; 
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useCart } from './context/CartContext'; 

// Home Component receives 'searchTerm' as a prop from App
function Home({ searchTerm }) {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const { addToCart } = useCart(); 

  // Base URL for API calls
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  // Categories for the filter buttons
  const categories = ['All', 'Running', 'Casual', 'Basketball', 'Training'];

  // Fetch Logic
  const fetchProducts = useCallback(() => {
    let url = `${API_BASE_URL}/api/products?`;

    // Append Category if selected
    if (selectedCategory && selectedCategory !== 'All') {
      url += `category=${selectedCategory}&`;
    }

    // Append Search Term if typed
    if (searchTerm) {
      url += `search=${searchTerm}&`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, [selectedCategory, searchTerm]); 

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); 

  const handleFilterClick = (category) => {
    setSelectedCategory(category);
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-300 p-4 md:p-8 font-sans animate-fade-in">
      
      {/* Hero Section */}
      <div className="text-center py-12 md:py-20 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-6">
          RUN FASTER. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">FLY HIGHER.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
          The premium collection of athletic footwear designed for performance and style.
        </p>
      </div>
      
      {/* FILTER BUTTONS */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleFilterClick(category)}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-md ${
              selectedCategory === category || (!selectedCategory && category === 'All')
                ? 'bg-blue-600 text-white shadow-blue-500/50 hover:bg-blue-700'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      {products.length === 0 ? (
         <div className="text-center py-20">
             <h2 className="text-2xl font-bold text-gray-400">No shoes found matching your search.</h2>
         </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto pb-20">
        {products.map((shoe) => (
          <div key={shoe._id} className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 dark:hover:border-blue-900">
            
            {/* Image */}
            <div className="h-80 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10 transition-colors duration-300">
              {shoe.image ? (
                <img src={shoe.image} alt={shoe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
              ) : (
                <span className="text-6xl drop-shadow-2xl filter group-hover:scale-110 transition-transform duration-500 ease-out">👟</span>
              )}
            </div>
            
            {/* Details */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{shoe.name}</h2>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-2">{shoe.category}</p> 
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 min-h-12">{shoe.description}</p>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                <span className="text-xl font-black text-gray-900 dark:text-white">₹{shoe.price}</span>
                <button 
                  onClick={() => addToCart(shoe)} 
                  className="bg-gray-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl font-bold hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState(""); 

  return (
    <Router>
      {/* LAYOUT FIX: 
        'flex flex-col' makes the main div a column layout.
        'min-h-screen' makes sure it takes up at least 100% of the screen height.
      */}
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 font-sans selection:bg-blue-500 selection:text-white"> 
        
        {/* Navbar at the top */}
        <Navbar onSearch={setSearchTerm} />
          
        {/* CONTENT WRAPPER:
           'flex-grow' tells this div to take up all available space.
           This pushes the Footer to the bottom if the page content is short.
        */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home searchTerm={searchTerm} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/checkout" element={<Checkout />} />
            
            {/* RECOVERY ROUTES */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        </div>

        {/* Footer at the bottom */}
        <Footer />
        
      </div>
    </Router>
  );
}