import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCart } from './CartContext';
import {
  FaShoppingCart,
  FaTruck,
  FaCreditCard,
  FaCheckCircle,
  FaHeart,
  FaPlus,
  FaMinus,
  FaTrash,
  FaArrowUp,
  FaStar,
  FaEye,
  FaSave,
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaTimes,
} from 'react-icons/fa';
import axios from 'axios';
import { debounce } from './utils/debounce';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, addToCart, updateQuantity, mergeCarts, refreshCart, isLoading: cartLoading } = useCart();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const [selectedItems, setSelectedItems] = useState([]);
  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    contact: '',
    city: '',
    postalCode: '',
  });
  const [deliveryType, setDeliveryType] = useState('normal');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [giftOptions, setGiftOptions] = useState({
    wrapping: false,
    message: '',
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [showTracking, setShowTracking] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [promoApplied, setPromoApplied] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [showQuickView, setShowQuickView] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  }, []);

  const debouncedRefreshCart = useCallback(debounce(refreshCart, 500), [refreshCart]);

  useEffect(() => {
    if (isLoggedIn) {
      const performMerge = async () => {
        try {
          await mergeCarts();
          await refreshCart();
          showToast('Cart synced successfully', 'success');
        } catch (error) {
          console.error('Error syncing cart:', error);
          showToast('Failed to sync cart', 'error');
        }
      };
      performMerge();
    }
  }, [isLoggedIn, mergeCarts, refreshCart, showToast]);

  useEffect(() => {
    if (!cartLoading && cart.length > 0) {
      const newSelectedItems = cart.map((item) => item._id || item.productId);
      setSelectedItems((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(newSelectedItems)) {
          return newSelectedItems;
        }
        return prev;
      });
    }
  }, [cart, cartLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isLoggedIn) {
          const [wishlistRes, recRes, pointsRes] = await Promise.allSettled([
            axios.get('http://localhost:5000/api/wishlist', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }).catch(() => ({ data: { wishlist: [] }})),
            axios.get('http://localhost:5000/api/recommendations').catch(() => ({ data: [] })),
            axios.get('http://localhost:5000/api/loyalty-points', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }).catch(() => ({ data: { points: 0 }}))
          ]);

          setWishlist(wishlistRes.value?.data?.wishlist || []);
          setRecommendations((recRes.value?.data || []).slice(0, 4));
          setLoyaltyPoints(pointsRes.value?.data?.points || 0);
        } else {
          const recRes = await axios.get('http://localhost:5000/api/recommendations')
            .catch(() => ({ data: [] }));
          setRecommendations((recRes.data || []).slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleQuantityChange = async (item, change) => {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0 && newQuantity <= (item.availableQuantity || 10)) {
      try {
        await updateQuantity(item, newQuantity);
        showToast('Quantity updated', 'success');
      } catch (error) {
        console.error('Error updating quantity:', error);
        showToast('Failed to update quantity', 'error');
      }
    } else if (newQuantity <= 0) {
      try {
        await removeFromCart(item);
        showToast('Item removed', 'success');
      } catch (error) {
        console.error('Error removing item:', error);
        showToast('Failed to remove item', 'error');
      }
    } else {
      showToast(`Maximum quantity is ${item.availableQuantity || 10}`, 'error');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      showToast('Item added to cart', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart', 'error');
    }
  };

  const saveForLater = async (item) => {
    try {
      if (isLoggedIn) {
        await axios.post(
          'http://localhost:5000/api/wishlist',
          { productId: item.productId },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        ).catch(() => {}); // Silently fail if wishlist endpoint doesn't exist
        setWishlist((prev) => [...prev, item.productId]);
      }
      setSavedForLater((prev) => [...prev, item]);
      await removeFromCart(item);
      showToast('Item saved for later', 'success');
    } catch (error) {
      console.error('Error saving for later:', error);
      showToast('Failed to save item', 'error');
    }
  };

  const moveToCart = async (item) => {
    try {
      setSavedForLater((prev) => prev.filter((i) => i._id !== item._id));
      await handleAddToCart({ ...item, quantity: 1 });
      showToast('Item moved to cart', 'success');
    } catch (error) {
      console.error('Error moving to cart:', error);
      showToast('Failed to move item to cart', 'error');
    }
  };

  const toggleWishlistItem = async (productId) => {
    try {
      if (isLoggedIn) {
        const response = await axios.post(
          `http://localhost:5000/api/wishlist`,
          { productId },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        ).catch(() => ({ data: { wishlist: [] }}));
        setWishlist(response.data.wishlist || []);
        showToast('Wishlist updated', 'success');
      } else {
        showToast('Please login to manage wishlist', 'error');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      showToast('Failed to update wishlist', 'error');
    }
  };

  const calculateDeliveryDate = () => {
    const days = deliveryType === 'express' ? 2 : 7;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString();
  };

  const redeemPoints = () => {
    if (loyaltyPoints >= 100) {
      const pointsDiscount = Math.floor(loyaltyPoints / 100) * 10;
      setDiscount((prev) => prev + pointsDiscount);
      setLoyaltyPoints((prev) => prev - pointsDiscount * 10);
      showToast(`Redeemed ${pointsDiscount}₹ using points!`, 'success');
    } else {
      showToast('Need at least 100 points to redeem', 'error');
    }
  };

  const applyCoupon = () => {
    if (promoApplied) return showToast('Coupon already applied', 'error');
    if (couponCode === 'DISCOUNT10') {
      setDiscount(totalAmount * 0.1);
      setPromoApplied(true);
      showToast('10% discount applied!', 'success');
    } else if (couponCode === 'DISCOUNT20') {
      setDiscount(totalAmount * 0.2);
      setPromoApplied(true);
      showToast('20% discount applied!', 'success');
    } else {
      showToast('Invalid coupon code', 'error');
    }
  };

  const handlePayment = async () => {
    const requiredFields = ['name', 'address', 'contact', 'city', 'postalCode'];
    if (requiredFields.some((field) => !shippingInfo[field])) {
      return showToast('Please fill all shipping details', 'error');
    }
    if (selectedItems.length === 0) {
      return showToast('Please select at least one item', 'error');
    }

    try {
      const orderResponse = await axios.post(
        'http://localhost:5000/api/orders',
        {
          items: cart.filter((item) => selectedItems.includes(item._id || item.productId)).map((item) => ({
            productId: item.productId || item._id,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            imageUrl: item.imageUrl,
            color: item.color,
          })),
          shippingInfo,
          deliveryType,
          giftOptions,
          orderNotes,
          totalAmount: finalAmount,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      // Clear the cart after placing the order
      await axios.delete('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      refreshCart(); // Refresh the cart context to reflect the cleared cart
      setSelectedItems([]); // Clear selected items
      setStep(1); // Reset to the first step
      showToast('Order placed successfully! Pay on delivery.', 'success');
    } catch (error) {
      console.error('Payment error:', error);
      showToast('Error processing order', 'error');
    }
  };

  const fetchTrackingInfo = async (orderId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/track`, {
        params: { orderId },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }).catch(() => ({
        data: {
          status: 'Processing',
          estimatedDelivery: calculateDeliveryDate(),
        }
      }));
      setTrackingInfo(response.data);
    } catch (error) {
      console.error('Error fetching tracking info:', error);
      showToast('Failed to fetch tracking information', 'error');
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const totalAmount = cart
    .filter((item) => selectedItems.includes(item._id || item.productId))
    .reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryCharge = deliveryType === 'express' ? 50 : 20;
  const giftCharge = giftOptions.wrapping ? 50 : 0;
  const finalAmount = totalAmount + deliveryCharge + giftCharge - discount;

  if (cartLoading) {
    return (
      <div className="matte-container">
        <div className="matte-content">
          <div className="flex justify-center items-center min-h-[300px] text-gray-600 text-xl">
            Loading your cart...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="matte-container">
      <div className="matte-content">
        <div className="matte-card">
          {/* Header Steps */}
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-[#234781] to-[#1e3a8a] mb-8">
            <div className={`flex items-center px-4 py-2 rounded-md ${
              step >= 1 
                ? 'text-white bg-white/20 font-medium backdrop-blur-sm' 
                : 'text-white/70'
            }`}>
              <FaShoppingCart className="mr-2" /> Cart
            </div>
            <div className={`flex items-center px-4 py-2 rounded-md ${
              step >= 2 
                ? 'text-white bg-white/20 font-medium backdrop-blur-sm' 
                : 'text-white/70'
            }`}>
              <FaTruck className="mr-2" /> Shipping
            </div>
            <div className={`flex items-center px-4 py-2 rounded-md ${
              step >= 3 
                ? 'text-white bg-white/20 font-medium backdrop-blur-sm' 
                : 'text-white/70'
            }`}>
              <FaCreditCard className="mr-2" /> Payment
            </div>
          </div>

          {/* Toast Notification */}
          {toast.message && (
            <div className={`fixed top-8 right-8 px-6 py-4 rounded-lg flex items-center gap-2 text-white shadow-lg z-50 animate-slideIn ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              {toast.type === 'success' && <FaCheckCircle />} {toast.message}
            </div>
          )}

          {/* Step 1: Cart Items */}
          <div className={`p-8 ${step === 1 ? 'block' : 'hidden'}`}>
            {step === 1 && (
              <div className="flex flex-col gap-6">
                {isLoggedIn && (
                  <div className="flex items-center bg-[#234781]/10 px-4 py-3 rounded-lg font-medium mb-4 text-[#234781]">
                    <FaStar className="mr-2 text-[#234781]" /> Loyalty Points: {loyaltyPoints}
                    <button 
                      onClick={redeemPoints} 
                      className="ml-auto bg-[#234781] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1e3a8a] transition"
                    >
                      Redeem
                    </button>
                  </div>
                )}

                {cart.length === 0 ? (
                  <p className="text-center py-12 text-gray-600 text-lg">
                    Your cart is empty.{' '}
                    <span onClick={() => navigate('/shop')} className="text-blue-600 underline font-medium cursor-pointer hover:text-blue-800">
                      Shop Now
                    </span>
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col gap-4">
                      {cart.map((item) => (
                        <div key={item._id || item.productId} className="grid grid-cols-[auto_100px_1fr_auto] gap-4 p-5 rounded-xl bg-white/80 shadow-sm border border-[#234781]/10 hover:shadow-md transition items-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id || item.productId)}
                            onChange={() => toggleSelection(item._id || item.productId)}
                            className="w-5 h-5 accent-blue-600 cursor-pointer"
                          />
                          <img
                            src={
                              item.imageUrl
                                ? item.imageUrl.startsWith('http')
                                  ? item.imageUrl
                                  : `http://localhost:5000${item.imageUrl}`
                                : '/images/default.jpg'
                            }
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg shadow-sm"
                            onError={(e) => (e.target.src = '/images/default.jpg')}
                          />
                          <div className="flex flex-col gap-2">
                            <p className="font-semibold text-lg text-gray-800">{item.name}</p>
                            <p className="font-semibold text-blue-600 text-lg">₹{item.price}</p>
                            {item.color && (
                              <p className="text-gray-600 text-sm">Color: {item.color}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => handleQuantityChange(item, -1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FaMinus />
                              </button>
                              <span className="font-medium w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item, 1)}
                                disabled={item.quantity >= (item.availableQuantity || 10)}
                                className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowQuickView(item)}
                              className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => saveForLater(item)}
                              className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-yellow-600 hover:text-white transition"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={() => removeFromCart(item)}
                              className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition"
                            >
                              <FaTrash />
                            </button>
                            <button
                              onClick={() => toggleWishlistItem(item.productId)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${wishlist.includes(item.productId) ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'}`}
                            >
                              <FaHeart />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {savedForLater.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 pl-3 border-l-4 border-blue-600">Saved for Later</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {savedForLater.map((item) => (
                            <div key={item._id || item.productId} className="flex flex-col items-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                              <img
                                src={
                                  item.imageUrl
                                    ? item.imageUrl.startsWith('http')
                                      ? item.imageUrl
                                      : `http://localhost:5000${item.imageUrl}`
                                    : '/images/default.jpg'
                                }
                                alt={item.name}
                                className="w-24 h-24 object-cover rounded-lg mb-3"
                                onError={(e) => (e.target.src = '/images/default.jpg')}
                              />
                              <p className="font-medium text-center mb-3">{item.name}</p>
                              <button 
                                onClick={() => moveToCart(item)}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                              >
                                Move to Cart
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary Card */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md border border-[#234781]/10 mt-6">
                      <div className="space-y-3">
                        <p className="flex justify-between pb-2 border-b border-gray-200">Subtotal: <span>₹{totalAmount}</span></p>
                        <p className="flex justify-between pb-2 border-b border-gray-200">Discount: <span>₹{discount}</span></p>
                        <p className="flex justify-between pb-2 border-b border-gray-200">Delivery: <span>₹{deliveryCharge}</span></p>
                        <p className="flex justify-between pb-2 border-b border-gray-200">Gift Wrapping: <span>₹{giftCharge}</span></p>
                        <p className="flex justify-between pt-2 font-bold text-xl text-blue-600">Total: <span>₹{finalAmount}</span></p>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <input
                          type="text"
                          placeholder="Enter Coupon Code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="matte-input px-4 py-3 w-full"
                        />
                        <button
                          onClick={applyCoupon}
                          className="matte-button px-6 py-3 w-full"
                          disabled={promoApplied}
                        >
                          Apply
                        </button>
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        className={`w-full mt-6 bg-[#234781] text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-[#1e3a8a] transition hover:-translate-y-1 shadow-lg ${
                          selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={selectedItems.length === 0}
                      >
                        Proceed to Shipping
                      </button>
                    </div>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                      <div className="mt-10">
                        <h3 className="text-xl font-semibold text-gray-700 mb-6 pl-3 border-l-4 border-blue-600">You Might Also Like</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {recommendations.map((item) => (
                            <div key={item._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border border-gray-200 flex flex-col">
                              <img
                                src={
                                  item.imageUrl
                                    ? item.imageUrl.startsWith('http')
                                      ? item.imageUrl
                                      : `http://localhost:5000${item.imageUrl}`
                                    : '/images/default.jpg'
                                }
                                alt={item.name}
                                className="w-full h-40 object-cover"
                                onError={(e) => (e.target.src = '/images/default.jpg')}
                              />
                              <div className="p-4 flex flex-col flex-grow">
                                <p className="font-medium mb-2">{item.name}</p>
                                <p className="font-semibold text-blue-600 mb-4">₹{item.price}</p>
                                <button
                                  onClick={() =>
                                    handleAddToCart({
                                      ...item,
                                      quantity: 1,
                                      productId: item._id,
                                    })
                                  }
                                  className="mt-auto bg-blue-50 text-blue-600 border border-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Shipping Details */}
          {step === 2 && (
            <div className="p-8">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Shipping Details</h2>
                {['name', 'address', 'city', 'postalCode', 'contact'].map((field) => (
                  <input
                    key={field}
                    type={field === 'contact' ? 'tel' : 'text'}
                    placeholder={
                      field.charAt(0).toUpperCase() +
                      field.slice(1).replace(/Code/, ' Code')
                    }
                    value={shippingInfo[field]}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        [field]: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                ))}
                <div className="flex flex-col gap-3 my-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer border border-gray-200 hover:bg-blue-50 transition">
                    <input
                      type="radio"
                      value="normal"
                      checked={deliveryType === 'normal'}
                      onChange={() => setDeliveryType('normal')}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <span>Normal (₹20, Est. {calculateDeliveryDate()})</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer border border-gray-200 hover:bg-blue-50 transition">
                    <input
                      type="radio"
                      value="express"
                      checked={deliveryType === 'express'}
                      onChange={() => setDeliveryType('express')}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <span>Express (₹50, Est. {calculateDeliveryDate()})</span>
                  </label>
                </div>
                <div className="my-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <label className="flex items-center gap-3 font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={giftOptions.wrapping}
                      onChange={(e) =>
                        setGiftOptions({
                          ...giftOptions,
                          wrapping: e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-red-600"
                    />
                    Add Gift Wrapping (+₹50)
                  </label>
                  {giftOptions.wrapping && (
                    <textarea
                      placeholder="Gift Message"
                      value={giftOptions.message}
                      onChange={(e) =>
                        setGiftOptions({
                          ...giftOptions,
                          message: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[100px]"
                    />
                  )}
                </div>
                <textarea
                  placeholder="Order Notes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                />
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 my-6">
                  <p className="font-medium mb-2">Estimated Delivery: {calculateDeliveryDate()}</p>
                  <p className="font-bold text-blue-600 text-xl">Total: ₹{finalAmount}</p>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(1)} className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                    Back
                  </button>
                  <button onClick={handlePayment} className="flex-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment Confirmation */}
          {step === 3 && (
            <div className="p-8">
              <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment</h2>
                <p className="text-3xl font-bold text-blue-600 mb-8">Final Amount: ₹{finalAmount}</p>
                <button 
                  onClick={handlePayment} 
                  className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition hover:-translate-y-1 shadow-lg"
                >
                  Confirm Order (Pay on Delivery)
                </button>
              </div>
            </div>
          )}

          {/* Tracking Info Modal */}
          {showTracking && trackingInfo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl relative w-full max-w-md max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">Order Tracking</h3>
                <p className="flex items-center gap-2 mb-2">
                  <FaMapMarkerAlt className="text-blue-600" /> Status: {trackingInfo.status}
                </p>
                <p className="flex items-center gap-2">
                  <FaClock className="text-blue-600" /> Estimated Delivery: {trackingInfo.estimatedDelivery}
                </p>
                <button
                  onClick={() => setShowTracking(false)}
                  className="absolute top-4 right-4 bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}

          {/* Quick View Modal */}
          {showQuickView && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl relative w-full max-w-md max-h-[80vh] overflow-y-auto flex flex-col items-center gap-4">
                <img
                  src={
                    showQuickView.imageUrl
                      ? showQuickView.imageUrl.startsWith('http')
                        ? showQuickView.imageUrl
                        : `http://localhost:5000${showQuickView.imageUrl}`
                      : '/images/default.jpg'
                  }
                  alt={showQuickView.name}
                  className="w-48 h-48 object-cover rounded-lg"
                  onError={(e) => (e.target.src = '/images/default.jpg')}
                />
                <h3 className="text-xl font-semibold text-center">{showQuickView.name}</h3>
                <p className="text-xl font-bold text-blue-600">₹{showQuickView.price}</p>
                <p className="text-center mb-4">{showQuickView.description || 'No description available'}</p>
                <button
                  onClick={() => setShowQuickView(null)}
                  className="absolute top-4 right-4 bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}

          {/* Back to Top Button */}
          {showBackToTop && (
            <button 
              onClick={scrollToTop} 
              className="fixed bottom-8 right-8 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition hover:-translate-y-1 z-40"
            >
              <FaArrowUp />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;