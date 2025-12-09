import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // 1. Initialize cart state from local storage
    const [cart, setCart] = useState(() => {
        const localData = localStorage.getItem('sparshoe_cart');
        return localData ? JSON.parse(localData) : [];
    });

    // 2. Sync cart state with local storage on every change
    useEffect(() => {
        localStorage.setItem('sparshoe_cart', JSON.stringify(cart));
    }, [cart]);

    // 3. Add item to cart (allows duplicates for simplicity)
    const addToCart = (product) => {
        setCart(currentCart => [...currentCart, { ...product, addedAt: Date.now() }]); 
    };
    
    // 4. FIX: Remove item from cart
    // This removes ALL instances of the product with the matching MongoDB _id
    const removeFromCart = (idToRemove) => {
        setCart(currentCart => currentCart.filter(item => item._id !== idToRemove));
    };

    // 5. Clear entire cart
    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};