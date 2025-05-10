import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import {
  FaUser, FaBox, FaHeart, FaCog, FaSignOutAlt, FaEdit, FaHome,
  FaBell, FaCreditCard, FaMapMarkerAlt, FaSearch, FaFilter,
  FaTruck, FaDownload, FaTrash, FaPlus, FaChevronDown, FaChevronUp,
  FaShoppingCart, FaStar, FaTimes
} from 'react-icons/fa';
import './Profile.css';

const API_BASE_URL = 'http://localhost:5000';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [settings, setSettings] = useState({
    email: user?.email || '',
    name: user?.name || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || null,
  });
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    accountActivity: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Fix for showToast function to ensure only strings are rendered
  const showToast = (message, type) => {
    setError({ type, message: message.toString() }); // Ensure message is a string
    setTimeout(() => setError(null), 3000);
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch Initial Data
  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      fetchWishlist();
      fetchAddresses();
      fetchPaymentMethods();
    }
  }, [isLoggedIn]);

  // Fetch Order History
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load order history');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Wishlist
  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      const data = await response.json();
      setWishlist(data.items || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Addresses
  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch addresses');
      const data = await response.json();
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Payment Methods
  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Reviews for Selected Wishlist Item
  useEffect(() => {
    if (selectedWishlistItem) {
      const fetchReviews = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/api/products/${selectedWishlistItem.productId}/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Failed to fetch reviews');
          const data = await response.json();
          setReviews(data || []);
        } catch (error) {
          console.error('Error fetching reviews:', error);
          setReviews([]);
          setError(`Failed to load reviews: ${error.message}`);
        }
      };
      fetchReviews();
    }
  }, [selectedWishlistItem]);

  // Handle settings update
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  // Handle file upload for profile image
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save settings
  const saveSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      const data = await response.json();
      dispatch({ type: 'auth/updateUser', payload: { user: { ...user, ...data.user } } });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  }, [settings, dispatch, user]);

  // Change password
  const changePassword = async () => {
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError("Passwords don't match");
      return;
    }
    if (newPasswordInput.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setPasswordError('');
      setError({ type: 'success', message: 'Password changed successfully!' });
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  // Save notification preferences
  const saveNotificationPreferences = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notifications),
      });
      if (!response.ok) throw new Error('Failed to save notification preferences');
      setError({ type: 'success', message: 'Notification preferences updated!' });
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setError('Failed to save notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle address form
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setCurrentAddress({ ...currentAddress, [name]: value });
  };

  // Add/Edit address
  const saveAddress = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const method = currentAddress._id ? 'PUT' : 'POST';
      const url = currentAddress._id
        ? `${API_BASE_URL}/api/user/addresses/${currentAddress._id}`
        : `${API_BASE_URL}/api/user/addresses`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentAddress),
      });

      if (!response.ok) throw new Error('Failed to save address');

      await fetchAddresses();
      setIsEditingAddress(false);
      setCurrentAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
      setError('Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete address');

      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address');
    } finally {
      setIsLoading(false);
    }
  };

  // Set default address
  const setDefaultAddress = async (addressId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to set default address');

      await fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      setError('Failed to set default address');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove from Wishlist
  const removeFromWishlist = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/wishlist/remove/${item.productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to remove item from wishlist');
      setWishlist((prev) => prev.filter((i) => i.productId !== item.productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove item from wishlist');
    }
  };

  // Fix for addToCart function
  const addToCart = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.productId,
          quantity: 1,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
        }),
      });
      if (!response.ok) throw new Error('Failed to add item to cart');
      showToast('Item added to cart successfully!', 'success');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      showToast('Failed to add item to cart', 'error');
    }
  };

  // Fix for openModal function
  const openModal = async (item) => {
    if (!item) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/products/${item.productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch product details');
      const product = await response.json();
      setSelectedWishlistItem({ ...item, ...product });
    } catch (error) {
      console.error('Error fetching product details:', error);
      setSelectedWishlistItem(item); // Fallback to basic item
      showToast('Failed to fetch product details', 'error');
    }
    setQuantity(1);
    setSelectedColor('');
    setShowModal(true);
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedWishlistItem(null);
    setNewReview('');
    setNewRating(0);
    setError(null);
  };

  // Submit Review
  const handleSubmitReview = async () => {
    if (!newReview.trim() || newRating === 0) {
      setError('Review and rating are required.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/products/${selectedWishlistItem.productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewText: newReview, rating: newRating }),
      });
      if (!response.ok) throw new Error('Failed to submit review');
      const data = await response.json();
      setReviews((prev) => [...prev, data.review]);
      setNewReview('');
      setNewRating(0);
      setError(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(`Failed to submit review: ${error.message}`);
    }
  };

  // Toggle order details
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prevOrderId) => (prevOrderId === orderId ? null : orderId));
  };

  // Filter orders
  const getFilteredOrders = () => {
    let filtered = [...orders];

    if (orderFilter !== 'all') {
      filtered = filtered.filter(order =>
        order.status.toLowerCase() === orderFilter.toLowerCase()
      );
    }

    if (orderSearch) {
      const searchLower = orderSearch.toLowerCase();
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchLower) ||
        (order.total || order.totalAmount || 0).toString().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Download invoice
  const downloadInvoice = (orderId) => {
    alert(`Downloading invoice for order ${orderId}`);
  };

  // Track order
  const trackOrder = (orderId) => {
    navigate(`/order-tracking/${orderId}`);
  };

  // Handle Logout
  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  // Tab Components Defined Before Return
  const DashboardTab = () => {
    const pendingOrders = orders.filter(order => order.status === 'Pending' || order.status === 'Processing');
    const recentActivity = [
      ...orders.slice(0, 3).map(order => ({
        type: 'order',
        date: new Date(order.createdAt),
        details: `Order #${order._id} - ${order.status}`,
        id: order._id
      })),
      ...wishlist.slice(0, 3).map(item => ({
        type: 'wishlist',
        date: new Date(),
        details: `Added ${item.name} to wishlist`,
        id: item.productId
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 5);

    const recommendedProducts = [
      { _id: 'rec1', name: 'Premium Headphones', price: 299.99, imageUrl: '/images/headphones.jpg' },
      { _id: 'rec2', name: 'Smart Watch', price: 199.99, imageUrl: '/images/smartwatch.jpg' },
      { _id: 'rec3', name: 'Wireless Earbuds', price: 149.99, imageUrl: '/images/earbuds.jpg' },
    ];

    return (
      <div className="profile-tab-content">
        <h2 className="profile-tab-title">
          <FaHome className="profile-icon" /> Dashboard
        </h2>
        <div className="profile-dashboard-grid">
          <div className="profile-card profile-overview-card">
            <h3>Welcome back, {user?.name}!</h3>
            <p className="profile-last-login">Last login: {new Date().toLocaleString()}</p>
          </div>

          <div className="profile-card profile-stats-card">
            <h3>Account Summary</h3>
            <div className="profile-stats-grid">
              <div className="profile-stat-item">
                <h4>{orders.length}</h4>
                <p>Orders</p>
              </div>
              <div className="profile-stat-item">
                <h4>{wishlist.length}</h4>
                <p>Wishlist</p>
              </div>
              <div className="profile-stat-item">
                <h4>{pendingOrders.length}</h4>
                <p>Pending</p>
              </div>
            </div>
          </div>

          <div className="profile-card profile-activity-card">
            <h3>Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p>No recent activity</p>
            ) : (
              <ul className="profile-activity-list">
                {recentActivity.map((activity, index) => (
                  <li key={index} className="profile-activity-item">
                    <div className={`profile-activity-icon ${activity.type === 'order' ? 'profile-order-icon' : 'profile-wishlist-icon'}`}>
                      {activity.type === 'order' ? <FaBox /> : <FaHeart />}
                    </div>
                    <div className="profile-activity-details">
                      <p>{activity.details}</p>
                      <span className="profile-activity-date">{activity.date.toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="profile-card profile-recommendations-card">
            <h3>Recommended For You</h3>
            <div className="profile-recommendations-grid">
              {recommendedProducts.map((product) => (
                <div key={product._id} className="profile-recommendation-item">
                  <img
                    src={product.imageUrl || '/images/default.jpg'}
                    alt={product.name}
                    className="profile-recommendation-image"
                  />
                  <p className="profile-recommendation-name">{product.name}</p>
                  <p className="profile-recommendation-price">₹{product.price}</p>
                  <button className="profile-view-button">View Product</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfileTab = () => (
    <div className="profile-tab-content">
      <h2 className="profile-tab-title">
        <FaUser className="profile-icon" /> My Profile
      </h2>
      <div className="profile-card">
        {isLoading ? (
          <div className="profile-skeleton-loader">
            <div className="profile-skeleton-circle"></div>
            <div className="profile-skeleton-line"></div>
            <div className="profile-skeleton-line"></div>
            <div className="profile-skeleton-line"></div>
          </div>
        ) : error && error.type !== 'success' ? (
          <p className="profile-error">{error.message || error}</p>
        ) : (
          <div className="profile-content-section">
            <div className="profile-header">
              <div className="profile-avatar-container">
                {settings.profileImage ? (
                  <img
                    src={settings.profileImage}
                    alt={user?.name}
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="profile-user-info">
                <h3>{user?.name || 'User'}</h3>
                <p>{user?.email || 'email@example.com'}</p>
                <p className="profile-member-since">Member since {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-detail-item">
                <span className="profile-detail-label">Email:</span>
                <span className="profile-detail-value">{user?.email || 'Not set'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">Phone:</span>
                <span className="profile-detail-value">{user?.phone || 'Not set'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">Default Address:</span>
                <span className="profile-detail-value">
                  {addresses.find(addr => addr.isDefault)?.fullAddress || 'Not set'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const OrderHistoryTab = () => {
    const filteredOrders = getFilteredOrders();

    const formatShippingAddress = (shippingInfo) => {
      if (!shippingInfo || !Object.keys(shippingInfo).length) {
        return 'No shipping address provided';
      }
      const { name, address, city, postalCode, contact } = shippingInfo;
      return `${name || 'N/A'}, ${address || 'N/A'}, ${city || 'N/A'} ${postalCode || 'N/A'}, Contact: ${contact || 'N/A'}`;
    };

    const calculateEstimatedDelivery = (createdAt, deliveryType) => {
      const orderDate = new Date(createdAt);
      const daysToAdd = deliveryType === 'express' ? 2 : 7;
      orderDate.setDate(orderDate.getDate() + daysToAdd);
      return orderDate.toLocaleDateString();
    };

    return (
      <div className="profile-tab-content">
        <h2 className="profile-tab-title">
          <FaBox className="profile-icon" /> Order History
        </h2>

        <div className="profile-card">
          <div className="profile-order-filters">
            <div className="profile-search-container">
              <FaSearch className="profile-search-icon" />
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="profile-search-input"
              />
            </div>

            <div className="profile-filter-container">
              <FaFilter className="profile-filter-icon" />
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="profile-filter-select"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="profile-skeleton-loader">
              <div className="profile-skeleton-line"></div>
              <div className="profile-skeleton-line"></div>
              <div className="profile-skeleton-line"></div>
            </div>
          ) : error ? (
            <p className="profile-error">{error}</p>
          ) : filteredOrders.length === 0 ? (
            <div className="profile-empty-container">
              <FaBox className="profile-empty-icon" />
              <p className="profile-empty-message">No orders found</p>
              <button
                className="profile-shop-now-button"
                onClick={() => navigate('/shop')}
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div className="profile-order-list">
              {filteredOrders.map((order) => (
                <div key={order._id} className="profile-order-item">
                  <div className="profile-order-header">
                    <div className="profile-order-info">
                      <h3>Order #{order._id}</h3>
                      <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="profile-order-status-container">
                      <span
                        className={`profile-status profile-status-${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                      <span className="profile-order-price">₹{order.total || order.totalAmount || 0}</span>
                    </div>
                  </div>

                  <div className="profile-order-actions">
                    <button
                      className="profile-order-action-button"
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                      {expandedOrderId === order._id ? (
                        <>Hide Details <FaChevronUp /></>
                      ) : (
                        <>View Details <FaChevronDown /></>
                      )}
                    </button>

                    <button
                      className="profile-order-action-button"
                      onClick={() => trackOrder(order._id)}
                    >
                      <FaTruck /> Track Order
                    </button>

                    <button
                      className="profile-order-action-button"
                      onClick={() => downloadInvoice(order._id)}
                    >
                      <FaDownload /> Invoice
                    </button>
                  </div>

                  {expandedOrderId === order._id && (
                    <div className="profile-order-details">
                      <h4>Order Items</h4>
                      <div className="profile-order-items">
                        {(order.items || []).map((item, index) => (
                          <div key={index} className="profile-order-item-detail">
                            <img
                              src={item.imageUrl || '/images/default.jpg'}
                              alt={item.name}
                              className="profile-order-item-image"
                            />
                            <div className="profile-order-item-info">
                              <h5>{item.name}</h5>
                              <p>Product ID: {item.productId?._id || item.productId}</p>
                              <p>Quantity: {item.quantity}</p>
                              <p>Price: ₹{item.price}</p>
                              {item.color && <p>Color: {item.color}</p>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="profile-order-summary">
                        <div className="profile-order-address">
                          <h4>Shipping Address</h4>
                          <p>{formatShippingAddress(order.shippingInfo)}</p>
                        </div>

                        <div className="profile-order-delivery">
                          <h4>Delivery Details</h4>
                          <p>Delivery Type: {order.deliveryType || 'N/A'}</p>
                          <p>Estimated Delivery: {calculateEstimatedDelivery(order.createdAt, order.deliveryType)}</p>
                          <p>Total: ₹{order.total || order.totalAmount || 0}</p>
                          {order.orderNotes && <p>Order Notes: {order.orderNotes}</p>}
                        </div>
                      </div>

                      {order.status === 'Delivered' && (
                        <div className="profile-order-review">
                          <h4>Leave a Review</h4>
                          <button className="profile-review-button">Write a Review</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const WishlistTab = () => (
    <div className="profile-tab-content">
      <h2 className="profile-tab-title">
        <FaHeart className="profile-icon" /> Wishlist
      </h2>
      <div className="profile-card">
        {isLoading ? (
          <div className="profile-skeleton-loader">
            <div className="profile-skeleton-grid">
              <div className="profile-skeleton-card"></div>
              <div className="profile-skeleton-card"></div>
              <div className="profile-skeleton-card"></div>
            </div>
          </div>
        ) : error ? (
          <p className="profile-error">{error.message || error.toString()}</p>
        ) : wishlist.length === 0 ? (
          <div className="profile-empty-container">
            <FaHeart className="profile-empty-icon" />
            <p className="profile-empty-message">Your wishlist is empty</p>
            <button
              className="profile-shop-now-button"
              onClick={() => navigate('/shop')}
            >
              Discover Products
            </button>
          </div>
        ) : (
          <div className="profile-wishlist-grid">
            {wishlist.map((item) => (
              <div key={item._id} className="profile-wishlist-item">
                <div className="profile-wishlist-image-container">
                  <img
                    src={
                      item.imageUrl
                        ? item.imageUrl.startsWith('http')
                          ? item.imageUrl
                          : `http://localhost:5000${item.imageUrl}`
                        : '/images/default.jpg'
                    }
                    alt={item.name}
                    className="profile-wishlist-image"
                    onError={(e) => (e.target.src = '/images/default.jpg')}
                  />
                </div>
                <div className="profile-wishlist-content">
                  <h3 className="profile-wishlist-name">{item.name}</h3>
                  <p className="profile-wishlist-price">₹{item.price}</p>
                  <div className="profile-wishlist-actions">
                    <button
                      onClick={() => removeFromWishlist(item)}
                      className="profile-remove-wishlist-button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="profile-tab-content">
      <h2 className="profile-tab-title">
        <FaCog className="profile-icon" /> Settings
      </h2>

      {/* Personal Information */}
      <div className="profile-card">
        <h3 className="profile-section-title">Personal Information</h3>
        {isLoading && !isEditing ? (
          <div className="profile-skeleton-loader">
            <div className="profile-skeleton-line"></div>
            <div className="profile-skeleton-line"></div>
            <div className="profile-skeleton-line"></div>
          </div>
        ) : error && error.type !== 'success' ? (
          <p className="profile-error">{error.message || error}</p>
        ) : isEditing ? (
          <div className="profile-settings-form">
            <div className="profile-form-group">
              <label>Profile Picture</label>
              <div className="profile-image-upload">
                {settings.profileImage ? (
                  <img src={settings.profileImage} alt="Profile" className="profile-preview-image" />
                ) : (
                  <div className="profile-image-placeholder">
                    <FaUser />
                  </div>
                )}
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="profile-image-input"
                />
                <label htmlFor="profile-image" className="profile-image-button">
                  Change Picture
                </label>
              </div>
            </div>
            <div className="profile-form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={settings.name}
                onChange={handleSettingsChange}
                className="profile-form-input"
              />
            </div>
            <div className="profile-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleSettingsChange}
                className="profile-form-input"
              />
            </div>
            <div className="profile-form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleSettingsChange}
                className="profile-form-input"
              />
            </div>
            <div className="profile-form-actions">
              <button onClick={saveSettings} className="profile-save-button">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="profile-cancel-button">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-content-section">
            <div className="profile-details">
              <div className="profile-detail-item">
                <span className="profile-detail-label">Name:</span>
                <span className="profile-detail-value">{settings.name}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">Email:</span>
                <span className="profile-detail-value">{settings.email}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">Phone:</span>
                <span className="profile-detail-value">{settings.phone || 'Not set'}</span>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)} className="profile-edit-button">
              <FaEdit className="profile-icon" /> Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Password Management */}
      <div className="profile-card">
        <h3 className="profile-section-title">Password Management</h3>
        <form className="profile-password-form">
          <div className="profile-form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              className="profile-form-input"
            />
          </div>
          <div className="profile-form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              className="profile-form-input"
            />
          </div>
          <div className="profile-form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPasswordInput}
              onChange={(e) => setConfirmPasswordInput(e.target.value)}
              className="profile-form-input"
            />
          </div>
          {passwordError && <p className="profile-error">{passwordError}</p>}
          <button
            type="button"
            onClick={changePassword}
            className="profile-password-button"
            disabled={!currentPasswordInput || !newPasswordInput || !confirmPasswordInput}
          >
            Change Password
          </button>
        </form>
      </div>

      {/* Address Book */}
      <div className="profile-card">
        <h3 className="profile-section-title">Address Book</h3>
        {isEditingAddress ? (
          <div className="profile-address-form">
            <div className="profile-form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={currentAddress?.fullName || ''}
                onChange={handleAddressChange}
                className="profile-form-input"
              />
            </div>
            <div className="profile-form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={currentAddress?.phone || ''}
                onChange={handleAddressChange}
                className="profile-form-input"
              />
            </div>
            <div className="profile-form-group">
              <label>Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={currentAddress?.addressLine1 || ''}
                onChange={handleAddressChange}
                className="profile-form-input"
              />
            </div>
            <div className="profile-form-group">
              <label>Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={currentAddress?.addressLine2 || ''}
                onChange={handleAddressChange}
                className="profile-form-input"
              />
            </div>
            <div className="profile-form-row">
              <div className="profile-form-groupiltro">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={currentAddress?.city || ''}
                  onChange={handleAddressChange}
                  className="profile-form-input"
                />
              </div>
              <div className="profile-form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={currentAddress?.state || ''}
                  onChange={handleAddressChange}
                  className="profile-form-input"
                />
              </div>
            </div>
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={currentAddress?.postalCode || ''}
                  onChange={handleAddressChange}
                  className="profile-form-input"
                />
              </div>
              <div className="profile-form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={currentAddress?.country || ''}
                  onChange={handleAddressChange}
                  className="profile-form-input"
                />
              </div>
            </div>
            <div className="profile-form-group">
              <label className="profile-checkbox-label">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={currentAddress?.isDefault || false}
                  onChange={(e) => setCurrentAddress({ ...currentAddress, isDefault: e.target.checked })}
                  className="profile-checkbox"
                />
                Set as default address
              </label>
            </div>
            <div className="profile-form-actions">
              <button onClick={saveAddress} className="profile-save-button">
                Save Address
              </button>
              <button
                onClick={() => {
                  setIsEditingAddress(false);
                  setCurrentAddress(null);
                }}
                className="profile-cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-address-list">
              {isLoading ? (
                <div className="profile-skeleton-loader">
                  <div className="profile-skeleton-card"></div>
                  <div className="profile-skeleton-card"></div>
                </div>
              ) : addresses.length === 0 ? (
                <p className="profile-empty-message">No addresses saved</p>
              ) : (
                addresses.map((address) => (
                  <div key={address._id} className={`profile-address-card ${address.isDefault ? 'profile-default-address' : ''}`}>
                    {address.isDefault && <span className="profile-default-badge">Default</span>}
                    <h4>{address.fullName}</h4>
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>{address.city}, {address.state} {address.postalCode}</p>
                    <p>{address.country}</p>
                    <p>{address.phone}</p>
                    <div className="profile-address-actions">
                      <button
                        onClick={() => {
                          setCurrentAddress(address);
                          setIsEditingAddress(true);
                        }}
                        className="profile-address-edit-button"
                      >
                        Edit
                      </button>
                      {!address.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(address._id)}
                          className="profile-address-default-button"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => deleteAddress(address._id)}
                        className="profile-address-delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => {
                setCurrentAddress({});
                setIsEditingAddress(true);
              }}
              className="profile-add-address-button"
            >
              <FaPlus /> Add New Address
            </button>
          </>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="profile-card">
        <h3 className="profile-section-title">Notification Preferences</h3>
        <div className="profile-notification-settings">
          <div className="profile-notification-option">
            <label className="profile-checkbox-label">
              <input
                type="checkbox"
                checked={notifications.orderUpdates}
                onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
                className="profile-checkbox"
              />
              Order Updates
            </label>
            <p className="profile-notification-description">
              Receive notifications about your order status
            </p>
          </div>
          <div className="profile-notification-option">
            <label className="profile-checkbox-label">
              <input
                type="checkbox"
                checked={notifications.promotions}
                onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                className="profile-checkbox"
              />
              Promotions & Deals
            </label>
            <p className="profile-notification-description">
              Be the first to know about sales and special offers
            </p>
          </div>
          <div className="profile-notification-option">
            <label className="profile-checkbox-label">
              <input
                type="checkbox"
                checked={notifications.newsletter}
                onChange={(e) => setNotifications({ ...notifications, newsletter: e.target.checked })}
                className="profile-checkbox"
              />
              Newsletter
            </label>
            <p className="profile-notification-description">
              Receive monthly newsletter with tips and product updates
            </p>
          </div>
          <div className="profile-notification-option">
            <label className="profile-checkbox-label">
              <input
                type="checkbox"
                checked={notifications.accountActivity}
                onChange={(e) => setNotifications({ ...notifications, accountActivity: e.target.checked })}
                className="profile-checkbox"
              />
              Account Activity
            </label>
            <p className="profile-notification-description">
              Get notified about login attempts and account changes
            </p>
          </div>
          <button onClick={saveNotificationPreferences} className="profile-save-button">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-page-container">
      <button className="profile-mobile-menu-toggle" onClick={toggleMobileMenu}>
        Menu {showMobileMenu ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      <div className="profile-content-wrapper">
        <div className={`profile-sidebar ${showMobileMenu ? 'profile-show-mobile' : ''}`}>
          <h1 className="profile-sidebar-title">My Account</h1>
          <ul className="profile-sidebar-list">
            <li>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setShowMobileMenu(false);
                }}
                className={`profile-sidebar-button ${activeTab === 'dashboard' ? 'profile-active' : ''}`}
              >
                <FaHome className="profile-icon" /> Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setShowMobileMenu(false);
                }}
                className={`profile-sidebar-button ${activeTab === 'profile' ? 'profile-active' : ''}`}
              >
                <FaUser className="profile-icon" /> Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setShowMobileMenu(false);
                }}
                className={`profile-sidebar-button ${activeTab === 'orders' ? 'profile-active' : ''}`}
              >
                <FaBox className="profile-icon" /> Orders
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('wishlist');
                  setShowMobileMenu(false);
                }}
                className={`profile-sidebar-button ${activeTab === 'wishlist' ? 'profile-active' : ''}`}
              >
                <FaHeart className="profile-icon" /> Wishlist
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowMobileMenu(false);
                }}
                className={`profile-sidebar-button ${activeTab === 'settings' ? 'profile-active' : ''}`}
              >
                <FaCog className="profile-icon" /> Settings
              </button>
            </li>
            <li>
              <button onClick={handleLogout} className="profile-sidebar-button profile-logout">
                <FaSignOutAlt className="profile-icon" /> Logout
              </button>
            </li>
          </ul>
        </div>

        <div className="profile-main-content">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'orders' && <OrderHistoryTab />}
          {activeTab === 'wishlist' && <WishlistTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>

      {showModal && selectedWishlistItem && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <div className="profile-modal-header">
              <h2>{selectedWishlistItem.name}</h2>
              <button onClick={closeModal} className="profile-close-modal-btn">
                <FaTimes />
              </button>
            </div>
            <div className="profile-modal-body">
              <div className="profile-product-image-container">
                {selectedWishlistItem.imageUrl ? (
                  <img
                    src={selectedWishlistItem.imageUrl}
                    alt={selectedWishlistItem.name}
                    className="profile-product-img-modal"
                    onError={(e) => (e.target.src = '/images/default.jpg')}
                  />
                ) : (
                  <div className="profile-no-image-placeholder">No Image Available</div>
                )}
              </div>
              <div className="profile-product-info">
                <p className="profile-product-description">
                  {selectedWishlistItem.description || 'No description available.'}
                </p>
                <p className="profile-product-price">Price: ₹{selectedWishlistItem.price}</p>
                <div className="profile-quantity-selection">
                  <label className="profile-quantity-label">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="profile-quantity-dropdown"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => addToCart(selectedWishlistItem)} className="profile-add-to-cart-btn">
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
              <div className="profile-reviews-section">
                <h3>Reviews</h3>
                {error && <p className="profile-error-message">{error}</p>}
                <ul className="profile-review-list">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <li key={review._id} className="profile-review-item">
                        <p>{review.reviewText}</p>
                        <p>
                          <strong>Rating:</strong> {review.rating || 0} <FaStar className="profile-star-icon" />
                        </p>
                        <p><small>By: {review.userId || 'Anonymous'}</small></p>
                      </li>
                    ))
                  ) : (
                    <p>No reviews yet.</p>
                  )}
                </ul>
                <div className="profile-rating-section">
                  <label>Rate this product:</label>
                  <div className="profile-star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`profile-star-icon ${star <= newRating ? 'profile-active' : ''}`}
                        onClick={() => setNewRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Write your review here..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  className="profile-review-input"
                />
                <button onClick={handleSubmitReview} className="profile-submit-review-btn">
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;