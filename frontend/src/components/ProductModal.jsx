import { X, Upload, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ProductModal({ isOpen, onClose, onProductAdded, currentProduct }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "Running"
  });
  const [loading, setLoading] = useState(false);

  // Effect to load current product data when editing
  useEffect(() => {
    if (currentProduct) {
      // Use existing data for editing
      setFormData(currentProduct);
    } else {
      // Reset form when adding a new product
      setFormData({ name: "", price: "", description: "", image: "", category: "Running" });
    }
  }, [currentProduct, isOpen]);

  if (!isOpen) return null;

  // Determine if we are editing or adding
  const isEditing = !!currentProduct;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = isEditing 
      ? `http://localhost:5000/api/products/${currentProduct._id}` // PUT endpoint
      : "http://localhost:5000/api/products"; // POST endpoint
      
    const method = isEditing ? "PUT" : "POST";

    // NOTE: We MUST send the token in the header to authenticate the Admin
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, // Sending the security token
        },
      });

      if (response.status === 201 || response.status === 200) {
        alert(`Product ${isEditing ? 'Updated' : 'Added'} Successfully! 🎉`);
        onProductAdded(); // Refresh the list
        onClose(); 
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      alert(`Error: ${message}. Did you make sure your account is an Admin account?`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? `Edit: ${currentProduct.name}` : "Add New Shoe"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
            <input 
              type="text" 
              required
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white transition font-medium"
              placeholder="Ex: Nike Air Jordan"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price in INR */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
              <input 
                type="number" 
                required
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white transition font-medium"
                placeholder="12999"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select 
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white transition font-medium"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Running</option>
                <option>Casual</option>
                <option>Basketball</option>
              </select>
            </div>
          </div>

          {/* Image URL Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
            <input 
              type="url" 
              required
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white transition font-medium"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white transition font-medium"
              rows="3"
              placeholder="Describe the shoe details..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2 disabled:bg-gray-500"
          >
            {loading ? "Processing..." : isEditing ? "Save Changes" : "Publish Product"}
            {!loading && (isEditing ? <Pencil size={20} /> : <Upload size={20} />)}
          </button>
        </form>
      </div>
    </div>
  );
}