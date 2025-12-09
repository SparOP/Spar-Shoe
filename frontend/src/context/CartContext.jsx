import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    
    const [cart, setCart] = useState(() => {
        const localData = localStorage.getItem('sparshoe_cart');
        return localData ? JSON.parse(localData) : [];
    });

    useEffect(() => {
        localStorage.setItem('sparshoe_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        // We add a unique timestamp property for debugging/future quantity tracking
        setCart(currentCart => [...currentCart, { ...product, addedAt: Date.now() }]); 
    };
    
    // FIX: Remove only the first instance of a matching product ID
    const removeFromCart = (idToRemove) => {
        setCart(currentCart => {
            // 1. Find the index of the first item with this _id
            const indexToRemove = currentCart.findIndex(item => item._id === idToRemove);

            // 2. If the item is found (index is not -1)
            if (indexToRemove > -1) {
                // Create a copy of the array
                const newCart = [...currentCart]; 
                // Remove ONE item at the found index
                newCart.splice(indexToRemove, 1); 
                return newCart; // Set the new state
            }
            return currentCart; // If not found, return the original cart
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};