import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();
const API_BASE_URL = 'http://localhost:5000';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const addToCart = async (product) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/cart`,
        {
          productId: product._id || product.productId,
          quantity: product.quantity || 1,
          price: product.price,
          name: product.name,
          imageId: product.imageId, // Include imageId in the request
          imageUrl: product.imageUrl // Also include imageUrl as fallback
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setCart(response.data.cart.items);
        return true;
      }
      throw new Error(response.data.message);
    } catch (error) {
      console.error('Error in addToCart:', error);
      throw error;
    }
  };

  // ... rest of your context code ...

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      // ... other methods
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
