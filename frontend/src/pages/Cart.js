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
import './Cart.css';
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

  // Memoize showToast
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  }, []);

  // Debounced version of refreshCart
  const debouncedRefreshCart = useCallback(debounce(refreshCart, 500), [refreshCart]);

  // Only merge carts on login state change
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
  }, [isLoggedIn, mergeCarts, refreshCart, showToast]);// Only depend on isLoggedIn

  // Update selected items when cart changes
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

  // Fetch additional data with error handling
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

  // Handle scroll for back-to-top button
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
          items: cart.filter((item) => selectedItems.includes(item._id || item.productId)),
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

      const options = {
        key: 'rzp_test_mUZPelBGqqVPrG',
        amount: finalAmount * 100,
        currency: 'INR',
        name: 'Fancy Store',
        description: `Order #${orderResponse.data.orderId}`,
        order_id: orderResponse.data.orderId,
        handler: (response) => {
          showToast(
            `Payment successful! Payment ID: ${response.razorpay_payment_id}`,
            'success'
          );
          setStep(3);
          fetchTrackingInfo(orderResponse.data.orderId);
        },
        prefill: {
          name: shippingInfo.name,
          email: isLoggedIn ? user?.email || 'guest@example.com' : 'guest@example.com',
          contact: shippingInfo.contact,
        },
        theme: { color: '#2b3e7a' },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Payment error:', error);
      showToast('Error processing payment', 'error');
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
      <div className="cart-page">
        <div className="loading">Loading your cart...</div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="progress-stepper">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <FaShoppingCart /> Cart
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <FaTruck /> Shipping
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <FaCreditCard /> Payment
          </div>
        </div>

        {toast.message && (
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' && <FaCheckCircle />} {toast.message}
          </div>
        )}

        <div className={`step-container step-${step}`}>
          {step === 1 && (
            <div className="cart-step">
              {isLoggedIn && (
                <div className="loyalty-points">
                  <FaStar /> Loyalty Points: {loyaltyPoints}
                  <button onClick={redeemPoints} className="redeem-btn">
                    Redeem
                  </button>
                </div>
              )}

              {cart.length === 0 ? (
                <p className="empty-cart">
                  Your cart is empty.{' '}
                  <span onClick={() => navigate('/shop')} className="shop-link">
                    Shop Now
                  </span>
                </p>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item._id || item.productId} className="cart-item">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id || item.productId)}
                          onChange={() => toggleSelection(item._id || item.productId)}
                          className="item-checkbox"
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
                          className="item-image"
                          onError={(e) => (e.target.src = '/images/default.jpg')}
                        />
                        <div className="item-details">
                          <p className="item-name">{item.name}</p>
                          <p className="item-price">₹{item.price}</p>
                          {item.color && (
                            <p className="item-color">Color: {item.color}</p>
                          )}
                          <div className="quantity-controls">
                            <button
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <FaMinus />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item, 1)}
                              disabled={item.quantity >= (item.availableQuantity || 10)}
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </div>
                        <div className="item-actions">
                          <button
                            onClick={() => setShowQuickView(item)}
                            className="quick-view-btn"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => saveForLater(item)}
                            className="save-btn"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={() => removeFromCart(item)}
                            className="remove-btn"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => toggleWishlistItem(item.productId)}
                            className={`wishlist-btn ${
                              wishlist.includes(item.productId) ? 'active' : ''
                            }`}
                          >
                            <FaHeart />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {savedForLater.length > 0 && (
                    <div className="saved-items">
                      <h3>Saved for Later</h3>
                      {savedForLater.map((item) => (
                        <div key={item._id || item.productId} className="saved-item">
                          <img
                            src={
                              item.imageUrl
                                ? item.imageUrl.startsWith('http')
                                  ? item.imageUrl
                                  : `http://localhost:5000${item.imageUrl}`
                                : '/images/default.jpg'
                            }
                            alt={item.name}
                            onError={(e) => (e.target.src = '/images/default.jpg')}
                          />
                          <p>{item.name}</p>
                          <button onClick={() => moveToCart(item)}>Move to Cart</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="cart-summary">
                    <p>Subtotal: ₹{totalAmount}</p>
                    <p>Discount: ₹{discount}</p>
                    <p>Delivery: ₹{deliveryCharge}</p>
                    <p>Gift Wrapping: ₹{giftCharge}</p>
                    <p className="total">Total: ₹{finalAmount}</p>
                    <div className="coupon-section">
                      <input
                        type="text"
                        placeholder="Enter Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="coupon-input"
                      />
                      <button
                        onClick={applyCoupon}
                        className="apply-coupon-btn"
                        disabled={promoApplied}
                      >
                        Apply
                      </button>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="proceed-btn"
                      disabled={selectedItems.length === 0}
                    >
                      Proceed to Shipping
                    </button>
                  </div>

                  {recommendations.length > 0 && (
                    <div className="recommendations">
                      <h3>You Might Also Like</h3>
                      <div className="rec-grid">
                        {recommendations.map((item) => (
                          <div key={item._id} className="rec-item">
                            <img
                              src={
                                item.imageUrl
                                  ? item.imageUrl.startsWith('http')
                                    ? item.imageUrl
                                    : `http://localhost:5000${item.imageUrl}`
                                  : '/images/default.jpg'
                              }
                              alt={item.name}
                              onError={(e) => (e.target.src = '/images/default.jpg')}
                            />
                            <p>{item.name}</p>
                            <p>₹{item.price}</p>
                            <button
                              onClick={() =>
                                handleAddToCart({
                                  ...item,
                                  quantity: 1,
                                  productId: item._id,
                                })
                              }
                            >
                              Add to Cart
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="shipping-step">
              <div className="shipping-section">
                <h2>Shipping Details</h2>
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
                    className="shipping-input"
                    required
                  />
                ))}
                <div className="delivery-options">
                  <label className="delivery-option">
                    <input
                      type="radio"
                      value="normal"
                      checked={deliveryType === 'normal'}
                      onChange={() => setDeliveryType('normal')}
                    />
                    <span>Normal (₹20, Est. {calculateDeliveryDate()})</span>
                  </label>
                  <label className="delivery-option">
                    <input
                      type="radio"
                      value="express"
                      checked={deliveryType === 'express'}
                      onChange={() => setDeliveryType('express')}
                    />
                    <span>Express (₹50, Est. {calculateDeliveryDate()})</span>
                  </label>
                </div>
                <div className="gift-section">
                  <label>
                    <input
                      type="checkbox"
                      checked={giftOptions.wrapping}
                      onChange={(e) =>
                        setGiftOptions({
                          ...giftOptions,
                          wrapping: e.target.checked,
                        })
                      }
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
                      className="gift-message"
                    />
                  )}
                </div>
                <textarea
                  placeholder="Order Notes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="order-notes"
                />
                <div className="shipping-summary">
                  <p>Estimated Delivery: {calculateDeliveryDate()}</p>
                  <p>Total: ₹{finalAmount}</p>
                </div>
                <div className="step-buttons">
                  <button onClick={() => setStep(1)} className="back-btn">
                    Back
                  </button>
                  <button onClick={handlePayment} className="proceed-btn">
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="payment-step">
              <div className="payment-section">
                <h2>Payment</h2>
                <p className="final-amount">Final Amount: ₹{finalAmount}</p>
                <button onClick={handlePayment} className="pay-btn">
                  Pay Now
                </button>
                {trackingInfo && (
                  <button
                    onClick={() => setShowTracking(true)}
                    className="track-btn"
                  >
                    <FaSearch /> Track Order
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {showTracking && trackingInfo && (
          <div className="tracking-modal">
            <div className="tracking-content">
              <h3>Order Tracking</h3>
              <p>
                <FaMapMarkerAlt /> Status: {trackingInfo.status}
              </p>
              <p>
                <FaClock /> Estimated Delivery: {trackingInfo.estimatedDelivery}
              </p>
              <button
                onClick={() => setShowTracking(false)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {showQuickView && (
          <div className="quick-view-modal">
            <div className="quick-view-content">
              <img
                src={
                  showQuickView.imageUrl
                    ? showQuickView.imageUrl.startsWith('http')
                      ? showQuickView.imageUrl
                      : `http://localhost:5000${showQuickView.imageUrl}`
                    : '/images/default.jpg'
                }
                alt={showQuickView.name}
                onError={(e) => (e.target.src = '/images/default.jpg')}
              />
              <h3>{showQuickView.name}</h3>
              <p>₹{showQuickView.price}</p>
              <p>{showQuickView.description || 'No description available'}</p>
              <button
                onClick={() => setShowQuickView(null)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {showBackToTop && (
          <button className="back-to-top" onClick={scrollToTop}>
            <FaArrowUp />
          </button>
        )}
      </div>
    </div>
  );
};

export default Cart;