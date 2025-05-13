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
import { updateUser } from '../features/auth/authSlice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = 'http://localhost:5000';  // For orders and other data
const IMAGE_API_URL = 'http://localhost:5000'; // For product images

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
    accountActivity: true,
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
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [showTracking, setShowTracking] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const showToast = (message, type) => {
    setError({ type, message: message.toString() });
    setTimeout(() => setError(null), 3000);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      fetchWishlist();
      fetchAddresses();
      fetchPaymentMethods();
    }
  }, [isLoggedIn]);

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
      return false; // Add proper return statement
    } finally {
      setIsLoading(false);
    }
    return true; // Add proper return statement
  };

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

  // Update the useEffect hook to handle user data persistence
  useEffect(() => {
    if (user) {
      setSettings({
        email: user.email || '',
        name: user.name || '',
        phone: user.phone || '',
        profileImage: user.profileImage || null,
      });
    }
  }, [user]); // Only depend on user changes

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

 const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file);

      setIsLoading(true);
      const token = localStorage.getItem('token');
      fetch(`${API_BASE_URL}/api/users/me/profile-picture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) throw new Error('Failed to upload profile picture');
          return response.json();
        })
        .then((data) => {
          setSettings((prev) => ({ ...prev, profileImage: data.profileImage }));
          // Update Redux store with new profile image
          dispatch(updateUser({ profileImage: data.profileImage }));
          showToast('Profile picture updated successfully!', 'success');
        })
        .catch((error) => {
          console.error('Error uploading profile picture:', error);
          setError('Failed to upload profile picture');
        })
        .finally(() => setIsLoading(false));
    }
  }

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: settings.email,
          name: settings.name,
          phone: settings.phone || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update settings');
      }

      const data = await response.json();
      
      if (data.success) {
        dispatch(updateUser({
          ...user,
          ...data.user
        }));
        showToast('Settings updated successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(error.message || 'Failed to save settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
          newPassword: newPasswordInput,
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
      showToast('Password changed successfully!', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

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
      showToast('Notification preferences updated!', 'success');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setError('Failed to save notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setCurrentAddress({ ...currentAddress, [name]: value });
  };

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
      showToast('Address saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving address:', error);
      setError('Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

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
      showToast('Address deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address');
    } finally {
      setIsLoading(false);
    }
  };

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
      showToast('Default address set successfully!', 'success');
    } catch (error) {
      console.error('Error setting default address:', error);
      setError('Failed to set default address');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/wishlist/remove/${item.productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to remove item from wishlist');
      setWishlist((prev) => prev.filter((i) => i.productId !== item.productId));
      showToast('Item removed from wishlist!', 'success');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove item from wishlist');
    }
  };

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
      setSelectedWishlistItem(item);
      showToast('Failed to fetch product details', 'error');
    }
    setQuantity(1);
    setSelectedColor('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedWishlistItem(null);
    setNewReview('');
    setNewRating(0);
    setError(null);
  };

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
      showToast('Review submitted successfully!', 'success');
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(`Failed to submit review: ${error.message}`);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prevOrderId) => (prevOrderId === orderId ? null : orderId));
  };

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

  const generateInvoice = async (order) => {
    try {
      const doc = new jsPDF();
      
      // Add company logo/header
      doc.setFontSize(20);
      doc.setTextColor(35, 71, 129);
      doc.text('NEW ERODE FANCY', 105, 20, { align: 'center' });
      
      // Add invoice details
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Invoice No: INV-${order._id.substring(0, 8)}`, 20, 40);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 45);
      doc.text(`Status: ${order.status}`, 20, 50);

      // Add customer details
      doc.setFontSize(12);
      doc.setTextColor(35, 71, 129);
      doc.text('Customer Details', 20, 65);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Name: ${user?.name || 'N/A'}`, 20, 75);
      doc.text(`Email: ${user?.email || 'N/A'}`, 20, 80);

      // Add shipping details
      doc.setFontSize(12);
      doc.setTextColor(35, 71, 129);
      doc.text('Shipping Details', 20, 95);
      doc.setFontSize(10);
      doc.setTextColor(100);
      const shippingAddress = order.shippingInfo 
        ? `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.postalCode}`
        : 'N/A';
      doc.text(`Address: ${shippingAddress}`, 20, 105);
      doc.text(`Contact: ${order.shippingInfo?.contact || 'N/A'}`, 20, 110);

      // Add items table
      const tableData = order.items.map(item => [
        item.name,
        item.quantity.toString(),
        `₹${item.price.toFixed(2)}`,
        `₹${(item.price * item.quantity).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 125,
        head: [['Item', 'Quantity', 'Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [35, 71, 129],
          textColor: [255, 255, 255],
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' }
        }
      });

      // Add total calculations
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Subtotal:', 140, finalY);
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 180, finalY, { align: 'right' });

      if (order.shippingCost) {
        doc.text('Shipping:', 140, finalY + 7);
        doc.text(`₹${order.shippingCost.toFixed(2)}`, 180, finalY + 7, { align: 'right' });
      }

      doc.setFontSize(12);
      doc.setTextColor(35, 71, 129);
      doc.text('Total Amount:', 140, finalY + 20);
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 180, finalY + 20, { align: 'right' });

      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('Thank you for shopping with NEW ERODE FANCY!', 105, 270, { align: 'center' });
      doc.text('For any queries, please contact support@erodefancy.com', 105, 275, { align: 'center' });

      // Add item images in a grid
      let yPos = 125;
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        try {
          if (item.imageId) {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = `${IMAGE_API_URL}/api/images/${item.imageId}`;
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            
            const imgWidth = 40;
            const imgHeight = 40;
            const x = 20 + (i % 3) * (imgWidth + 10);
            const y = finalY + 30 + Math.floor(i / 3) * (imgHeight + 10);

            doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
          }
        } catch (imgError) {
          console.error('Error adding image to PDF:', imgError);
        }
      }

      // Save PDF
      doc.save(`Invoice-${order._id}.pdf`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      showToast('Failed to generate invoice', 'error');
    }
  };

  const trackOrder = async (orderId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/track`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracking information');
      }

      const data = await response.json();
      setTrackingInfo(data);
      setShowTracking(true);
    } catch (error) {
      console.error('Error tracking order:', error);
      showToast('Failed to fetch tracking information', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = (orderId) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) {
      showToast('Order not found', 'error');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(35, 71, 129);
      doc.text('NEW ERODE FANCY', 105, 20, { align: 'center' });
      
      // Add invoice details
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Invoice No: INV-${order._id.substring(0, 8)}`, 20, 40);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 45);
      doc.text(`Status: ${order.status}`, 20, 50);

      // Add customer details
      doc.setFontSize(12);
      doc.setTextColor(35, 71, 129);
      doc.text('Customer Details', 20, 65);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Name: ${user?.name || 'N/A'}`, 20, 75);
      doc.text(`Email: ${user?.email || 'N/A'}`, 20, 80);

      // Add shipping details
      doc.setFontSize(12);
      doc.setTextColor(35, 71, 129);
      doc.text('Shipping Details', 20, 95);
      doc.setFontSize(10);
      doc.setTextColor(100);
      const shippingAddress = order.shippingInfo 
        ? `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.postalCode}`
        : 'N/A';
      doc.text(`Address: ${shippingAddress}`, 20, 105);
      doc.text(`Contact: ${order.shippingInfo?.contact || 'N/A'}`, 20, 110);

      // Add items table
      const tableData = order.items.map(item => [
        item.name,
        item.quantity.toString(),
        `₹${item.price.toFixed(2)}`,
        `₹${(item.price * item.quantity).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 125,
        head: [['Item', 'Quantity', 'Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [35, 71, 129],
          textColor: [255, 255, 255],
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' }
        }
      });

      // Add total calculations
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Subtotal:', 140, finalY);
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 180, finalY, { align: 'right' });

      if (order.shippingCost) {
        doc.text('Shipping:', 140, finalY + 7);
        doc.text(`₹${order.shippingCost.toFixed(2)}`, 180, finalY + 7, { align: 'right' });
      }

      doc.setFontSize(12);
      doc.setTextColor(35, 71, 129);
      doc.text('Total Amount:', 140, finalY + 20);
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 180, finalY + 20, { align: 'right' });

      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('Thank you for shopping with NEW ERODE FANCY!', 105, 270, { align: 'center' });
      doc.text('For any queries, please contact support@erodefancy.com', 105, 275, { align: 'center' });

      // Save the PDF
      doc.save(`Invoice-${order._id}.pdf`);
      showToast('Invoice downloaded successfully', 'success');
    } catch (error) {
      console.error('Error generating invoice:', error);
      showToast('Failed to generate invoice', 'error');
    }
  };

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
      <div className="p-4">
        <h2 className="text-royal-blue text-xl font-bold mb-4 flex items-center">
          <FaHome className="mr-2" /> Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-light-royal rounded-lg p-6 shadow-sm">
            <h3 className="text-gray-800 font-semibold">Welcome back, {user?.name}!</h3>
            <p className="text-gray-600">Last login: {new Date().toLocaleString()}</p>
          </div>
          <div className="bg-white border border-light-royal rounded-lg p-6 shadow-sm">
            <h3 className="text-gray-800 font-semibold">Account Summary</h3>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <h4 className="text-gray-800 font-bold">{orders.length}</h4>
                <p className="text-gray-600">Orders</p>
              </div>
              <div>
                <h4 className="text-gray-800 font-bold">{wishlist.length}</h4>
                <p className="text-gray-600">Wishlist</p>
              </div>
              <div>
                <h4 className="text-gray-800 font-bold">{pendingOrders.length}</h4>
                <p className="text-gray-600">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-light-royal rounded-lg p-6 shadow-sm">
            <h3 className="text-gray-800 font-semibold">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-gray-600">No recent activity</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {recentActivity.map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <div className={`p-2 rounded-full ${activity.type === 'order' ? 'bg-light-royal' : 'bg-red-100'}`}>
                      {activity.type === 'order' ? <FaBox className="text-royal-blue" /> : <FaHeart className="text-red-500" />}
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-800">{activity.details}</p>
                      <span className="text-gray-500 text-sm">{activity.date.toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white border border-light-royal rounded-lg p-6 shadow-sm">
            <h3 className="text-gray-800 font-semibold">Recommended For You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {recommendedProducts.map((product) => (
                <div key={product._id} className="text-center">
                  <img
                    src={product.imageUrl || '/images/default.jpg'}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-gray-800 mt-2">{product.name}</p>
                  <p className="text-gray-600">₹{product.price}</p>
                  <button className="mt-2 bg-royal-blue text-white hover:bg-blue-700 py-1 px-3 rounded">
                    View Product
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfileTab = () => (
    <div className="p-4">
      <h2 className="text-royal-blue text-xl font-bold mb-4 flex items-center">
        <FaUser className="mr-2" /> My Profile
      </h2>
      <div className="bg-white border border-light-royal rounded-lg p-6 shadow-sm">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mt-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mt-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mt-2"></div>
          </div>
        ) : error && error.type !== 'success' ? (
          <p className="text-red-500">{error.message || error}</p>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-4 md:mb-0 md:mr-6">
                {settings.profileImage ? (
                  <img
                    src={settings.profileImage}
                    alt={user?.name}
                    className="w-24 h-24 border-2 border-royal-blue rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 border-2 border-royal-blue rounded-full flex items-center justify-center bg-light-royal text-gray-800 text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-800">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-gray-600">Member since: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 bg-royal-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center mx-auto md:mx-0"
                  >
                    <FaEdit className="mr-2" /> Edit Profile
                  </button>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="mt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={settings.name}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={settings.phone}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-royal-blue file:text-white hover:file:bg-blue-700"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={saveSettings}
                    disabled={isLoading}
                    className="bg-royal-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const OrdersTab = () => (
    <div className="p-4">
      <h2 className="text-royal-blue text-xl font-bold mb-4 flex items-center">
        <FaBox className="mr-2" /> Order History
      </h2>
      <div className="bg-white border border-light-royal rounded-lg p-6 shadow-sm">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <FaBox className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="border border-light-royal rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-blue-900">Order #{order._id.substring(0, 8)}</p>
                    <p className="text-sm text-blue-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => trackOrder(order._id)}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Track Order
                    </button>
                    <button
                      onClick={() => downloadInvoice(order._id)}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Download Invoice
                    </button>
                  </div>
                </div>
                <div className={`p-4 ${expandedOrderId === order._id ? 'block' : 'hidden'}`}>
                  <div className="grid gap-4">
                    {order.items.map((item) => (
                      <div key={item._id} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-center bg-blue-50 rounded-xl overflow-hidden w-20 h-20">
                          {item.imageId || item.imageUrl ? (
                            <img
                              src={item.imageId 
                                ? `${IMAGE_API_URL}/api/images/${item.imageId}` 
                                : item.imageUrl}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                console.error('Image load error:', e);
                                e.target.onerror = null;
                                e.target.src = '/images/default.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-500">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm font-medium text-blue-600">₹{item.price}</p>
                          {item.color && (
                            <p className="text-sm text-gray-500">Color: {item.color}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-right text-lg font-medium text-blue-600">
                      Total: ₹{order.totalAmount}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleOrderDetails(order._id)}
                  className="w-full p-2 text-center text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  {expandedOrderId === order._id ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const WishlistTab = () => (
    <div className="p-4">
      <h2 className="text-royal-blue text-xl font-bold mb-4 flex items-center">
        <FaHeart className="mr-2" /> My Wishlist
      </h2>
      <div className="bg-white border border-light-royal rounded-lg p-6 shadow-sm">
        {isLoading ? (
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-8">
            <FaHeart className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Your wishlist is empty</p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-4 bg-royal-blue text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {wishlist.map((item) => (
              <div key={item.productId} className="border border-light-royal rounded-lg shadow-sm">
                <div className="relative">
                  <img
                    src={item.imageUrl || '/images/default.jpg'}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <button
                    onClick={() => removeFromWishlist(item)}
                    className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-gray-800 font-semibold">{item.name}</h3>
                  <p className="text-royal-blue font-semibold">₹{item.price}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 bg-royal-blue text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                    >
                      <FaShoppingCart className="mr-2" /> Add to Cart
                    </button>
                    <button
                      onClick={() => openModal(item)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && selectedWishlistItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{selectedWishlistItem.name}</h3>
              <button onClick={closeModal} className="text-gray-600 hover:text-gray-800">
                <FaTimes size={24} />
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <img
                  src={selectedWishlistItem.imageUrl || '/images/default.jpg'}
                  alt={selectedWishlistItem.name}
                  className="w-full max-h-80 object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <p className="text-gray-600">{selectedWishlistItem.description || 'No description available'}</p>
                <p className="text-royal-blue font-semibold mt-2">₹{selectedWishlistItem.price}</p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => addToCart(selectedWishlistItem)}
                  className="mt-4 w-full bg-royal-blue text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <FaShoppingCart className="mr-2" /> Add to Cart
                </button>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-gray-800 font-semibold">Reviews</h4>
              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet</p>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((review, index) => (
                    <li key={index} className="border-b border-light-royal pb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      <p className="text-gray-600 mt-1">{review.reviewText}</p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <h4 className="text-gray-800 font-semibold">Write a Review</h4>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`cursor-pointer ${i < newRating ? 'text-yellow-400' : 'text-gray-300'}`}
                      onClick={() => setNewRating(i + 1)}
                    />
                  ))}
                </div>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Write your review..."
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue"
                  rows={4}
                />
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <button
                  onClick={handleSubmitReview}
                  className="mt-2 bg-royal-blue text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const SettingsTab = () => (
    <div className="p-4">
      <h2 className="text-royal-blue text-xl font-bold mb-4 flex items-center">
        <FaCog className="mr-2" /> Settings
      </h2>
      <div className="bg-white border border-light-royal rounded-lg p-6 shadow-sm">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={settings.name}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={settings.phone}
                      onChange={handleSettingsChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-royal-blue file:text-white hover:file:bg-blue-700"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={saveSettings}
                      disabled={isLoading}
                      className="bg-royal-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">Name: {settings.name}</p>
                  <p className="text-gray-600">Email: {settings.email}</p>
                  <p className="text-gray-600">Phone: {settings.phone}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 bg-royal-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <FaEdit className="mr-2" /> Edit
                  </button>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                  />
                </div>
                {passwordError && <p className="text-red-500">{passwordError}</p>}
                <button
                  onClick={changePassword}
                  disabled={isLoading}
                  className="bg-royal-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Change Password
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Book</h3>
              {isEditingAddress ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Street</label>
                      <input
                        type="text"
                        name="street"
                        value={currentAddress?.street || ''}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        name="city"
                        value={currentAddress?.city || ''}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        name="state"
                        value={currentAddress?.state || ''}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                      <input
                        type="text"
                        name="zip"
                        value={currentAddress?.zip || ''}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring focus:ring-royal-blue focus:border-royal-blue sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={saveAddress}
                      disabled={isLoading}
                      className="bg-royal-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Save Address
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingAddress(false);
                        setCurrentAddress(null);
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`border border-light-royal rounded-lg p-4 relative ${address.isDefault ? 'border-royal-blue shadow-sm' : ''}`}
                      >
                        {address.isDefault && (
                          <span className="absolute top-2 right-2 bg-royal-blue text-white text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                        <h4 className="text-gray-800 font-semibold">{address.name || 'Address'}</h4>
                        <p className="text-gray-600">{address.street}</p>
                        <p className="text-gray-600">{address.city}, {address.state} {address.zip}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setCurrentAddress(address);
                              setIsEditingAddress(true);
                            }}
                            className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 text-sm"
                          >
                            Edit
                          </button>
                          {!address.isDefault && (
                            <button
                              onClick={() => setDefaultAddress(address._id)}
                              className="flex-1 bg-light-royal text-royal-blue px-3 py-2 rounded-md hover:bg-blue-100 text-sm"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => deleteAddress(address._id)}
                            className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentAddress({});
                      setIsEditingAddress(true);
                    }}
                    className="bg-royal-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add New Address
                  </button>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.keys(notifications).map((key) => (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                      className="h-4 w-4 text-royal-blue focus:ring-royal-blue border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                  </div>
                ))}
                <button
                  onClick={saveNotificationPreferences}
                  disabled={isLoading}
                  className="bg-royal-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {error && (
        <div className={`p-4 mb-4 rounded-md ${error.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {error.message}
        </div>
      )}
      <button
        className="md:hidden bg-royal-blue text-white px-4 py-2 rounded-md flex items-center justify-center w-full mb-4"
        onClick={toggleMobileMenu}
      >
        Menu {showMobileMenu ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
      </button>
      <div className="flex flex-col md:flex-row gap-6">
        <div className={`md:w-64 w-full ${showMobileMenu ? 'block' : 'hidden'} md:block bg-light-royal p-4 rounded-lg shadow-sm`}>
          <h1 className="text-xl font-bold text-royal-blue mb-4">My Account</h1>
          <ul className="space-y-2">
            {[
              { tab: 'dashboard', icon: <FaHome />, label: 'Dashboard' },
              { tab: 'profile', icon: <FaUser />, label: 'My Profile' },
              { tab: 'orders', icon: <FaBox />, label: 'Order History' },
              { tab: 'wishlist', icon: <FaHeart />, label: 'My Wishlist' },
              { tab: 'settings', icon: <FaCog />, label: 'Settings' },
            ].map(({ tab, icon, label }) => (
              <li key={tab}>
                <button
                  onClick={() => {
                    setActiveTab(tab);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                    activeTab === tab ? 'bg-royal-blue text-white' : 'text-royal-blue hover:bg-blue-100'
                  }`}
                >
                  {icon}
                  <span className="ml-2">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 bg-white border border-light-royal rounded-lg shadow-sm">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'orders' && <OrdersTab />}  
          {activeTab === 'wishlist' && <WishlistTab />}   
          {activeTab === 'settings' && <SettingsTab />}    
        </div>        
      </div>       
    </div>        
  );
};

export default Profile;