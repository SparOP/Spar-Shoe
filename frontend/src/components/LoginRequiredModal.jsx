import { X, Lock } from 'lucide-react';

export default function LoginRequiredModal({ isOpen, onClose, onLoginRedirect }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-[100] p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Lock size={20} className="text-blue-600" />
                        Login Required
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                        Please log in to add items to your secure shopping cart. 👟
                    </p>
                    <button 
                        onClick={onLoginRedirect}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                    >
                        Go to Login Page
                    </button>
                </div>
            </div>
        </div>
    );
}