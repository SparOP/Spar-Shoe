import { Facebook, Instagram, Mail, Phone, MapPin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        
        {/* Top Section: Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-500 mb-4">
              Spar-Shoe
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
              Premium athletic footwear designed for performance, style, and durability. Run faster, fly higher.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Running Shoes</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Basketball Kicks</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Casual Sneakers</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">New Arrivals</a></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Support</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Order Tracker</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Returns & Exchange</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 4: Contact - UPDATED */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-blue-600" />
                <span>123 Shoe Lane, Tech Park,<br />Kolkata, WB 700091</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-600" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-600" />
                <span>projectsparshoe@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Spar-Shoe Pvt Ltd. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-200">Terms</a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-200">Privacy</a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-200">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}