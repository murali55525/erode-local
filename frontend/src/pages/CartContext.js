import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './Authcontext';

const CartContext = createContext();

// Update the formatImageUrl function to be more robust
const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return '/images/default.jpg';
  
  // If it's already a full URL
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it includes /api/images/ path but doesn't have the base URL
  if (imageUrl.includes('/api/images/')) {
    return `http://localhost:5000${imageUrl}`;
  }
  
  // If it's just an ID, construct the full URL
  if (imageUrl.match(/^[a-f0-9]{24}$/)) {
    return `http://localhost:5000/api/images/${imageUrl}`;
  }
  
  // For any other relative path
  return `http://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const getCartKey = useCallback(() => {
    return isAuthenticated ? `userCart_${user?.email}` : 'guestCart';
  }, [isAuthenticated, user]);

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        
        // Process image URLs in the cart items
        const processedItems = (response.data.items || []).map(item => ({
          ...item,
          imageUrl: formatImageUrl(item.imageUrl)
        }));
        
        setCart(processedItems);
      } else {
        const cartKey = getCartKey();
        const guestCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        
        // Process image URLs for guest cart too
        const processedGuestCart = guestCart.map(item => ({
          ...item,
          imageUrl: formatImageUrl(item.imageUrl)
        }));
        
        setCart(processedGuestCart);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getCartKey]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart, isAuthenticated]);

  const addToCart = useCallback(async (product) => {
    try {
      const item = {
        productId: product._id || product.id,
        quantity: product.quantity || 1,
        color: product.selectedColor || null,
        price: product.price,
        imageUrl: formatImageUrl(product.imageUrl || product.image),
        name: product.name,
        availableQuantity: product.availableQuantity || 10,
      };

      if (isAuthenticated) {
        const response = await axios.post('http://localhost:5000/api/cart', item, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCart(response.data.cart.items);
      } else {
        const cartKey = getCartKey();
        const guestCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const existingItemIndex = guestCart.findIndex(
          (cartItem) => cartItem.productId === item.productId && cartItem.color === item.color
        );

        let updatedCart;
        if (existingItemIndex >= 0) {
          updatedCart = [...guestCart];
          updatedCart[existingItemIndex].quantity += item.quantity;
        } else {
          updatedCart = [...guestCart, { ...item, _id: Date.now().toString() }];
        }

        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error in addToCart:', error.response?.data || error.message);
      throw error;
    }
  }, [isAuthenticated, getCartKey]);

  const removeFromCart = useCallback(async (product) => {
    try {
      if (isAuthenticated) {
        await axios.delete(`http://localhost:5000/api/cart/${product._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCart((prev) => prev.filter((item) => item._id !== product._id));
      } else {
        const cartKey = getCartKey();
        const guestCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const updatedCart = guestCart.filter(
          (item) => !(item.productId === product.productId && item.color === (product.color || null))
        );
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }, [isAuthenticated, getCartKey]);

  const updateQuantity = useCallback(async (product, newQuantity) => {
    try {
      if (isAuthenticated) {
        await axios.put(
          `http://localhost:5000/api/cart/${product._id}`,
          { quantity: newQuantity },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setCart((prev) =>
          prev.map((item) =>
            item._id === product._id ? { ...item, quantity: newQuantity } : item
          )
        );
      } else {
        const cartKey = getCartKey();
        const guestCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const updatedCart = guestCart.map((item) =>
          item.productId === product.productId && item.color === (product.color || null)
            ? { ...item, quantity: newQuantity }
            : item
        );
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }, [isAuthenticated, getCartKey]);

  const mergeCarts = useCallback(async () => {
    if (!isAuthenticated) return;
  
    const guestCartKey = 'guestCart';
    let guestCart = [];
    
    try {
      // Safely get guest cart from localStorage
      const guestCartString = localStorage.getItem(guestCartKey);
      if (guestCartString) {
        guestCart = JSON.parse(guestCartString);
      }
      
      // Verify we have an array
      if (!Array.isArray(guestCart)) {
        console.warn('Invalid guest cart format, resetting');
        guestCart = [];
      }
  
      if (guestCart.length === 0) return;
  
      // Add all guest cart items to user cart
      await Promise.all(
        guestCart.map((item) =>
          axios.post('http://localhost:5000/api/cart', item, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }).catch(error => {
            console.error('Error merging item:', item, error);
            // Continue with other items even if one fails
          })
        )
      );
  
      // Clear guest cart only if merge was successful
      localStorage.removeItem(guestCartKey);
      
      // Refresh the user cart
      await refreshCart();
      
    } catch (error) {
      console.error('Error merging carts:', error);
      throw error;
    }
  }, [isAuthenticated, refreshCart]);

  const clearCart = useCallback(async () => {
    try {
      if (isAuthenticated) {
        await axios.delete('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCart([]);
      } else {
        const cartKey = getCartKey();
        localStorage.setItem(cartKey, JSON.stringify([]));
        setCart([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }, [isAuthenticated, getCartKey]);

  // Utility function to detect if device is mobile
  const isMobileDevice = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
  }, []);

  // Get a compact summary of the cart for mobile displays
  const getCartSummary = useCallback(() => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const uniqueItems = cart.length;
    
    return {
      totalItems,
      totalPrice,
      uniqueItems,
      isEmpty: totalItems === 0
    };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        mergeCarts,
        refreshCart,
        isLoading,
        formatImageUrl,
        isMobileDevice, // Expose mobile detection function
        getCartSummary, // Expose cart summary for compact mobile displays
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);