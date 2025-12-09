import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Search, LayoutDashboard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Base URL for API calls
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "Running", // Default value
    description: "",
    image: ""
  });

  const navigate = useNavigate();

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(res.data);
    } catch (err) {
        console.error("Failed to fetch products");
    }
  };

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Basic Validation
    if (!newProduct.name || !newProduct.price || !newProduct.description) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const config = { headers: { "x-auth-token": token } };

        if (editingProduct) {
            // Update existing product
            await axios.put(`${API_BASE_URL}/api/products/${editingProduct._id}`, newProduct, config);
            alert("Product Updated Successfully!");
        } else {
            // Create new product
            await axios.post(`${API_BASE_URL}/api/products`, newProduct, config);
            alert("Product Added Successfully!");
        }

        setShowModal(false);
        setEditingProduct(null);
        setNewProduct({ name: "", price: "", category: "Running", description: "", image: "" }); // Reset Form
        fetchProducts(); // Refresh list

    } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Operation failed. Are you an Admin?");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct(product); // Populate form with existing data
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    const token = localStorage.getItem("token");
    try {
        await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
            headers: { "x-auth-token": token }
        });
        alert("Product Deleted!");
        fetchProducts();
    } catch (err) {
        alert("Failed to delete. Check your admin privileges.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Filter products for the Admin Table search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your inventory</p>
            </div>
          </div>
          
          <div className="flex gap-4">
             <button 
                onClick={() => {
                    setEditingProduct(null);
                    setNewProduct({ name: "", price: "", category: "Running", description: "", image: "" });
                    setShowModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
             >
                <Plus size={18} /> Add Product
             </button>
             <button onClick={handleLogout} className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-5 py-2.5 rounded-xl font-bold transition-all">
                <LogOut size={18} /> Logout
             </button>
          </div>
        </div>

        {/* Stats & Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center">
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Products</h3>
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-2">{products.length}</p>
            </div>
            
            <div className="md:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search inventory..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => (
                <div key={product._id} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-6 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                    <img 
                        src={product.image || "https://via.placeholder.com/150"} 
                        alt={product.name} 
                        className="w-20 h-20 object-cover rounded-lg bg-gray-50"
                    />
                    
                    <div className="flex-grow text-center md:text-left">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.category} • ₹{product.price}</p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <h2 className="text-xl font-bold">{editingProduct ? `Edit: ${editingProduct.name}` : "Add New Product"}</h2>
                        <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                            <input 
                                name="name" 
                                value={newProduct.name} 
                                onChange={handleInputChange} 
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="e.g. Nike Air Max"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                                <input 
                                    name="price" 
                                    type="number"
                                    value={newProduct.price} 
                                    onChange={handleInputChange} 
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="9999"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                <select 
                                    name="category" 
                                    value={newProduct.category} 
                                    onChange={handleInputChange} 
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Running">Running</option>
                                    <option value="Casual">Casual</option>
                                    <option value="Basketball">Basketball</option>
                                    <option value="Training">Training</option> {/* <--- NEW OPTION ADDED HERE */}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                            <input 
                                name="image" 
                                value={newProduct.image} 
                                onChange={handleInputChange} 
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                            <textarea 
                                name="description" 
                                value={newProduct.description} 
                                onChange={handleInputChange} 
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" 
                                placeholder="Product details..."
                            ></textarea>
                        </div>

                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-4">
                            {editingProduct ? "Update Product" : "Add to Inventory"}
                        </button>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}