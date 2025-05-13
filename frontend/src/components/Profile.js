"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../features/auth/authSlice"
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  Edit,
  Home,
  Bell,
  Search,
  Filter,
  Truck,
  Download,
  Trash,
  Plus,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Star,
  X,
  ChevronRight,
  Eye,
} from "lucide-react"
import { updateUser } from "../features/auth/authSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const API_BASE_URL = "http://localhost:5000" // For orders and other data
const IMAGE_API_URL = "http://localhost:5000" // For product images

const Profile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isLoggedIn } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [settings, setSettings] = useState({
    email: user?.email || "",
    name: user?.name || "",
    phone: user?.phone || "",
    profileImage: user?.profileImage || null,
  })
  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    accountActivity: true,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [currentAddress, setCurrentAddress] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [orderFilter, setOrderFilter] = useState("all")
  const [orderSearch, setOrderSearch] = useState("")
  const [currentPasswordInput, setCurrentPasswordInput] = useState("")
  const [newPasswordInput, setNewPasswordInput] = useState("")
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [selectedWishlistItem, setSelectedWishlistItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("")
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState("")
  const [newRating, setNewRating] = useState(0)
  const [trackingInfo, setTrackingInfo] = useState(null)
  const [showTracking, setShowTracking] = useState(false)

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  const showToast = (message, type) => {
    setError({ type, message: message.toString() })
    setTimeout(() => setError(null), 3000)
  }

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login")
    }
  }, [isLoggedIn, navigate])

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders()
      fetchWishlist()
      fetchAddresses()
      fetchPaymentMethods()
    }
  }, [isLoggedIn])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to load order history")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWishlist = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch wishlist")
      const data = await response.json()
      setWishlist(data.items || [])
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      setError("Failed to load wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAddresses = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      console.log("Fetching addresses...")
      
      const response = await fetch(`${API_BASE_URL}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) {
        // If response is 404, perhaps the endpoint doesn't exist yet
        if (response.status === 404) {
          console.warn("Addresses endpoint not found, might need to be implemented")
          setAddresses([])
          return true
        }
        
        throw new Error(`Failed to fetch addresses: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("Addresses response:", data)
      setAddresses(data.addresses || [])
      return true
    } catch (error) {
      console.error("Error fetching addresses:", error)
      setError(`Failed to fetch addresses: ${error.message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPaymentMethods = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/user/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch payment methods")
      const data = await response.json()
      setPaymentMethods(data.paymentMethods || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedWishlistItem) {
      const fetchReviews = async () => {
        try {
          const token = localStorage.getItem("token")
          const response = await fetch(`${API_BASE_URL}/api/products/${selectedWishlistItem.productId}/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!response.ok) throw new Error("Failed to fetch reviews")
          const data = await response.json()
          setReviews(data || [])
        } catch (error) {
          console.error("Error fetching reviews:", error)
          setReviews([])
          setError(`Failed to load reviews: ${error.message}`)
        }
      }
      fetchReviews()
    }
  }, [selectedWishlistItem])

  // Update the useEffect hook to handle user data persistence
  useEffect(() => {
    if (user) {
      setSettings({
        email: user.email || "",
        name: user.name || "",
        phone: user.phone || "",
        profileImage: user.profileImage || null,
      })
    }
  }, [user]) // Only depend on user changes

  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error")
        return
      }

      const formData = new FormData()
      formData.append("profilePicture", file)

      setIsLoading(true)
      const token = localStorage.getItem("token")
      
      // Log for debugging
      console.log("Uploading profile picture...")
      
      fetch(`${API_BASE_URL}/api/users/me/profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            console.error("Server responded with status:", response.status)
            throw new Error(`Failed to upload profile picture: ${response.statusText}`)
          }
          return response.json()
        })
        .then((data) => {
          console.log("Profile picture update response:", data)
          
          if (data.profileImage) {
            setSettings((prev) => ({ ...prev, profileImage: data.profileImage }))
            // Update Redux store with new profile image
            dispatch(updateUser({ ...user, profileImage: data.profileImage }))
            showToast("Profile picture updated successfully!", "success")
          } else {
            throw new Error("No profile image URL in response")
          }
        })
        .catch((error) => {
          console.error("Error uploading profile picture:", error)
          setError("Failed to upload profile picture: " + error.message)
          showToast("Failed to upload profile picture: " + error.message, "error")
        })
        .finally(() => setIsLoading(false))
    }
  }

  const saveSettings = async () => {
    // Basic validation
    if (!settings.name.trim()) {
      showToast("Name is required", "error")
      return
    }
    
    if (!settings.email.trim() || !/^\S+@\S+\.\S+$/.test(settings.email)) {
      showToast("Valid email is required", "error")
      return
    }
    
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      // Log for debugging
      console.log("Saving user settings:", settings)
      
      const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: settings.email,
          name: settings.name,
          phone: settings.phone || "",
        }),
      })

      // Log the raw response for debugging
      console.log("Settings update response status:", response.status)
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response text:", errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          throw new Error(`Failed to update settings: ${response.statusText}`)
        }
        
        throw new Error(errorData.message || "Failed to update settings")
      }

      const data = await response.json()
      console.log("Settings update response data:", data)

      if (data.success) {
        // Update Redux store
        dispatch(
          updateUser({
            ...user,
            ...data.user,
          })
        )
        setIsEditing(false)
        showToast("Settings updated successfully!", "success")
      } else {
        throw new Error(data.message || "Failed to update settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      showToast(error.message || "Failed to save settings", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async () => {
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError("Passwords don't match")
      return
    }
    if (newPasswordInput.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to change password")
      }

      setCurrentPasswordInput("")
      setNewPasswordInput("")
      setConfirmPasswordInput("")
      setPasswordError("")
      showToast("Password changed successfully!", "success")
    } catch (error) {
      console.error("Error changing password:", error)
      setPasswordError(error.message || "Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  const saveNotificationPreferences = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/user/notification-preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notifications),
      })
      if (!response.ok) throw new Error("Failed to save notification preferences")
      showToast("Notification preferences updated!", "success")
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      setError("Failed to save notification preferences")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setCurrentAddress({ ...currentAddress, [name]: value })
  }

  const saveAddress = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const method = currentAddress._id ? "PUT" : "POST"
      const url = currentAddress._id
        ? `${API_BASE_URL}/api/user/addresses/${currentAddress._id}`
        : `${API_BASE_URL}/api/user/addresses`

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentAddress),
      })

      if (!response.ok) throw new Error("Failed to save address")

      await fetchAddresses()
      setIsEditingAddress(false)
      setCurrentAddress(null)
      showToast("Address saved successfully!", "success")
    } catch (error) {
      console.error("Error saving address:", error)
      setError("Failed to save address")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/user/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to delete address")

      await fetchAddresses()
      showToast("Address deleted successfully!", "success")
    } catch (error) {
      console.error("Error deleting address:", error)
      setError("Failed to delete address")
    } finally {
      setIsLoading(false)
    }
  }

  const setDefaultAddress = async (addressId) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/user/addresses/${addressId}/default`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to set default address")

      await fetchAddresses()
      showToast("Default address set successfully!", "success")
    } catch (error) {
      console.error("Error setting default address:", error)
      setError("Failed to set default address")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (item) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/wishlist/remove/${item.productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to remove item from wishlist")
      setWishlist((prev) => prev.filter((i) => i.productId !== item.productId))
      showToast("Item removed from wishlist!", "success")
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      setError("Failed to remove item from wishlist")
    }
  }

  const addToCart = async (item) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.productId,
          quantity: 1,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
        }),
      })
      if (!response.ok) throw new Error("Failed to add item to cart")
      showToast("Item added to cart successfully!", "success")
    } catch (error) {
      console.error("Error adding item to cart:", error)
      showToast("Failed to add item to cart", "error")
    }
  }

  const openModal = async (item) => {
    if (!item) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/products/${item.productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch product details")
      const product = await response.json()
      setSelectedWishlistItem({ ...item, ...product })
    } catch (error) {
      console.error("Error fetching product details:", error)
      setSelectedWishlistItem(item)
      showToast("Failed to fetch product details", "error")
    }
    setQuantity(1)
    setSelectedColor("")
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedWishlistItem(null)
    setNewReview("")
    setNewRating(0)
    setError(null)
  }

  const handleSubmitReview = async () => {
    if (!newReview.trim() || newRating === 0) {
      setError("Review and rating are required.")
      return
    }
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/products/${selectedWishlistItem.productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewText: newReview, rating: newRating }),
      })
      if (!response.ok) throw new Error("Failed to submit review")
      const data = await response.json()
      setReviews((prev) => [...prev, data.review])
      setNewReview("")
      setNewRating(0)
      setError(null)
      showToast("Review submitted successfully!", "success")
    } catch (error) {
      console.error("Error submitting review:", error)
      setError(`Failed to submit review: ${error.message}`)
    }
  }

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prevOrderId) => (prevOrderId === orderId ? null : orderId))
  }

  const getFilteredOrders = () => {
    let filtered = [...orders]

    if (orderFilter !== "all") {
      filtered = filtered.filter((order) => order.status.toLowerCase() === orderFilter.toLowerCase())
    }

    if (orderSearch) {
      const searchLower = orderSearch.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchLower) ||
          (order.total || order.totalAmount || 0).toString().includes(searchLower) ||
          order.status.toLowerCase().includes(searchLower),
      )
    }

    return filtered
  }

  const generateInvoice = async (order) => {
    try {
      const doc = new jsPDF()

      // Add company logo/header
      doc.setFontSize(20)
      doc.setTextColor(35, 71, 129)
      doc.text("NEW ERODE FANCY", 105, 20, { align: "center" })

      // Add invoice details
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Invoice No: INV-${order._id.substring(0, 8)}`, 20, 40)
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 45)
      doc.text(`Status: ${order.status}`, 20, 50)

      // Add customer details
      doc.setFontSize(12)
      doc.setTextColor(35, 71, 129)
      doc.text("Customer Details", 20, 65)
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Name: ${user?.name || "N/A"}`, 20, 75)
      doc.text(`Email: ${user?.email || "N/A"}`, 20, 80)

      // Add shipping details
      doc.setFontSize(12)
      doc.setTextColor(35, 71, 129)
      doc.text("Shipping Details", 20, 95)
      doc.setFontSize(10)
      doc.setTextColor(100)
      const shippingAddress = order.shippingInfo
        ? `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.postalCode}`
        : "N/A"
      doc.text(`Address: ${shippingAddress}`, 20, 105)
      doc.text(`Contact: ${order.shippingInfo?.contact || "N/A"}`, 20, 110)

      // Add items table
      const tableData = order.items.map((item) => [
        item.name,
        item.quantity.toString(),
        `₹${item.price.toFixed(2)}`,
        `₹${(item.price * item.quantity).toFixed(2)}`,
      ])

      autoTable(doc, {
        startY: 125,
        head: [["Item", "Quantity", "Price", "Total"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [35, 71, 129],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 35, halign: "right" },
          3: { cellWidth: 35, halign: "right" },
        },
      })

      // Add total calculations
      const finalY = doc.lastAutoTable.finalY + 10
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text("Subtotal:", 140, finalY)
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 180, finalY, { align: "right" })

      if (order.shippingCost) {
        doc.text("Shipping:", 140, finalY + 7)
        doc.text(`₹${order.shippingCost.toFixed(2)}`, 180, finalY + 7, { align: "right" })
      }

      doc.setFontSize(12)
      doc.setTextColor(35, 71, 129)
      doc.text("Total Amount:", 140, finalY + 20)
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 180, finalY + 20, { align: "right" })

      // Add footer
      doc.setFontSize(8)
      doc.setTextColor(100)
      doc.text("Thank you for shopping with NEW ERODE FANCY!", 105, 270, { align: "center" })
      doc.text("For any queries, please contact support@erodefancy.com", 105, 275, { align: "center" })

      // Add item images in a grid
      const yPos = 125
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i]
        try {
          if (item.imageId) {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = `${IMAGE_API_URL}/api/images/${item.imageId}`

            await new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = reject
            })

            const imgWidth = 40
            const imgHeight = 40
            const x = 20 + (i % 3) * (imgWidth + 10)
            const y = finalY + 30 + Math.floor(i / 3) * (imgHeight + 10)

            doc.addImage(img, "JPEG", x, y, imgWidth, imgHeight)
          }
        } catch (imgError) {
          console.error("Error adding image to PDF:", imgError)
        }
      }

      // Save PDF
      doc.save(`Invoice-${order._id}.pdf`)
    } catch (error) {
      console.error("Error generating invoice:", error)
      showToast("Failed to generate invoice", "error")
    }
  }

  const trackOrder = async (orderId) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/track`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch tracking information")
      }

      const data = await response.json()
      setTrackingInfo(data)
      setShowTracking(true)
    } catch (error) {
      console.error("Error tracking order:", error)
      showToast("Failed to fetch tracking information", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadInvoice = (orderId) => {
    const order = orders.find((o) => o._id === orderId)
    if (!order) {
      showToast("Order not found", "error")
      return
    }

    try {
      const doc = new jsPDF()

      // Add header
      doc.setFontSize(20)
      doc.setTextColor(35, 71, 129)
      doc.text("NEW ERODE FANCY", 105, 20, { align: "center" })

      // Add invoice details
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Invoice No: INV-${order._id.substring(0, 8)}`, 20, 40)
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 45)
      doc.text(`Status: ${order.status}`, 20, 50)

      // Add customer details
      doc.setFontSize(12)
      doc.setTextColor(35, 71, 129)
      doc.text("Customer Details", 20, 65)
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Name: ${user?.name || "N/A"}`, 20, 75)
      doc.text(`Email: ${user?.email || "N/A"}`, 20, 80)

      // Add shipping details
      doc.setFontSize(12)
      doc.setTextColor(35, 71, 129)
      doc.text("Shipping Details", 20, 95)
      doc.setFontSize(10)
      doc.setTextColor(100)
      const shippingAddress = order.shippingInfo
        ? `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.postalCode}`
        : "N/A"
      doc.text(`Address: ${shippingAddress}`, 20, 105)
      doc.text(`Contact: ${order.shippingInfo?.contact || "N/A"}`, 20, 110)

      // Add items table
      const tableData = order.items.map((item) => [
        item.name,
        item.quantity.toString(),
        `₹${item.price.toFixed(2)}`,
        `₹${(item.price * item.quantity).toFixed(2)}`,
      ])

      autoTable(doc, {
        startY: 125,
        head: [["Item", "Quantity", "Price", "Total"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [35, 71, 129],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 35, halign: "right" },
          3: { cellWidth: 35, halign: "right" },
        },
      })

      // Add total calculations
      const finalY = doc.lastAutoTable.finalY + 10
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text("Subtotal:", 140, finalY)
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 180, finalY, { align: "right" })

      if (order.shippingCost) {
        doc.text("Shipping:", 140, finalY + 7)
        doc.text(`₹${order.shippingCost.toFixed(2)}`, 180, finalY + 7, { align: "right" })
      }

      doc.setFontSize(12)
      doc.setTextColor(35, 71, 129)
      doc.text("Total Amount:", 140, finalY + 20)
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 180, finalY + 20, { align: "right" })

      // Add footer
      doc.setFontSize(8)
      doc.setTextColor(100)
      doc.text("Thank you for shopping with NEW ERODE FANCY!", 105, 270, { align: "center" })
      doc.text("For any queries, please contact support@erodefancy.com", 105, 275, { align: "center" })

      // Save the PDF
      doc.save(`Invoice-${order._id}.pdf`)
      showToast("Invoice downloaded successfully", "success")
    } catch (error) {
      console.error("Error generating invoice:", error)
      showToast("Failed to generate invoice", "error")
    }
  }

  const DashboardTab = () => {
    const pendingOrders = orders.filter((order) => order.status === "Pending" || order.status === "Processing")
    const recentActivity = [
      ...orders.slice(0, 3).map((order) => ({
        type: "order",
        date: new Date(order.createdAt),
        details: `Order #${order._id} - ${order.status}`,
        id: order._id,
      })),
      ...wishlist.slice(0, 3).map((item) => ({
        type: "wishlist",
        date: new Date(),
        details: `Added ${item.name} to wishlist`,
        id: item.productId,
      })),
    ]
      .sort((a, b) => b.date - a.date)
      .slice(0, 5)

    const recommendedProducts = [
      { _id: "rec1", name: "Premium Headphones", price: 299.99, imageUrl: "/images/headphones.jpg" },
      { _id: "rec2", name: "Smart Watch", price: 199.99, imageUrl: "/images/smartwatch.jpg" },
      { _id: "rec3", name: "Wireless Earbuds", price: 149.99, imageUrl: "/images/earbuds.jpg" },
    ]

    return (
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
          <Home className="mr-2 h-6 w-6 text-purple-600" /> Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Welcome back, {user?.name}!</h3>
                <p className="text-slate-500">Last login: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Account Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-purple-700">{orders.length}</span>
                <p className="text-purple-600 mt-1">Orders</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-pink-700">{wishlist.length}</span>
                <p className="text-pink-600 mt-1">Wishlist</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-indigo-700">{pendingOrders.length}</span>
                <p className="text-indigo-600 mt-1">Pending</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No recent activity</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <div
                      className={`p-2 rounded-full ${activity.type === "order" ? "bg-purple-100 text-purple-600" : "bg-pink-100 text-pink-600"}`}
                    >
                      {activity.type === "order" ? <Package className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
                    </div>
                    <div className="ml-4">
                      <p className="text-slate-800 font-medium">{activity.details}</p>
                      <span className="text-slate-500 text-sm">{activity.date.toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recommended Products */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recommended For You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedProducts.map((product) => (
                <div key={product._id} className="group">
                  <div className="relative overflow-hidden rounded-lg mb-2">
                    <img
                      src={product.imageUrl || "/placeholder.svg?height=120&width=200"}
                      alt={product.name}
                      className="w-full h-32 object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  </div>
                  <h4 className="font-medium text-slate-800 truncate">{product.name}</h4>
                  <p className="text-purple-600 font-semibold">₹{product.price}</p>
                  <button className="mt-2 w-full bg-purple-600 text-white hover:bg-purple-700 py-1.5 px-3 rounded-lg text-sm transition-colors">
                    View Product
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ProfileTab = () => (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
        <User className="mr-2 h-6 w-6 text-purple-600" /> My Profile
      </h2>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto md:mx-0 md:mr-6"></div>
              <div className="mt-4 md:mt-0 text-center md:text-left w-full">
                <div className="h-6 bg-slate-200 rounded w-3/4 mx-auto md:mx-0"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto md:mx-0 mt-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto md:mx-0 mt-2"></div>
                <div className="h-10 bg-slate-200 rounded w-40 mx-auto md:mx-0 mt-4"></div>
              </div>
            </div>
          </div>
        ) : error && error.type !== "success" ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error.message || error}</div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-6 md:mb-0 md:mr-8">
                {settings.profileImage ? (
                  <img
                    src={settings.profileImage || "/placeholder.svg"}
                    alt={user?.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-purple-100 shadow-sm"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-3xl font-bold shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-slate-800">{user?.name}</h3>
                <p className="text-slate-500">{user?.email}</p>
                <p className="text-slate-500 mb-4">
                  Member since: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </p>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Edit Profile Information</h4>
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={settings.name}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={settings.phone}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-colors"
                    />
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                  <button
                    onClick={saveSettings}
                    disabled={isLoading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
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
  )
const OrdersTab = () => {
  const filteredOrders = getFilteredOrders();
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  const trackOrder = async (orderId) => {
    try {
      setIsTrackingLoading(true);
      setTrackingOrderId(orderId);
      
      const token = localStorage.getItem("token");
      // Try to fetch from dedicated tracking endpoint first
      let response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/tracking`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // If dedicated endpoint fails, try the orders-stats endpoint
      if (!response.ok) {
        response = await fetch(`${API_BASE_URL}/api/admin/orders-stats?orderId=${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      if (!response.ok) {
        throw new Error("Failed to fetch tracking information");
      }

      const data = await response.json();
      
      // Create tracking info object from response data
      const trackingData = {
        orderId,
        status: data.status || "Processing",
        trackingNumber: data.trackingNumber || `TRK${orderId.substring(0, 8)}`,
        carrier: data.carrier || "Erode Express",
        estimatedDelivery: data.estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        events: data.events || [
          {
            description: "Order Placed",
            location: "Erode, TN",
            timestamp: data.createdAt || new Date().toISOString()
          },
          {
            description: "Order Processing",
            location: "Erode Warehouse",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
      
      setTrackingInfo(trackingData);
      setShowTrackingModal(true);
    } catch (error) {
      console.error("Error tracking order:", error);
      showToast("Failed to fetch tracking information", "error");
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const closeTrackingModal = () => {
    setShowTrackingModal(false);
    setTrackingInfo(null);
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
        <Package className="mr-2 h-6 w-6 text-purple-600" /> Order History
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search and Filter */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-slate-400" />
              </div>
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
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
        </div>

        {/* Orders List */}
        <div className="p-4">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-lg"></div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-1">No orders found</h3>
              <p className="text-slate-500">
                {orderSearch || orderFilter !== "all"
                  ? "Try changing your search or filter"
                  : "Start shopping to see your orders here"}
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div key={order._id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center">
                        <p className="font-semibold text-slate-800">Order #{order._id.substring(0, 8)}</p>
                        <span
                          className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "Cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm font-medium text-purple-600 mt-1">
                        ₹{order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => trackOrder(order._id)}
                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                      >
                        <Truck className="mr-1.5 h-4 w-4" /> Track
                      </button>
                      <button
                        onClick={() => downloadInvoice(order._id)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                      >
                        <Download className="mr-1.5 h-4 w-4" /> Invoice
                      </button>
                    </div>
                  </div>

                  {/* Order Details (Expandable) */}
                  <div
                    className={`transition-all duration-300 overflow-hidden ${expandedOrderId === order._id ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="p-4 border-t border-slate-200">
                      <div className="grid gap-4">
                        {order.items.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                          >
                            <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-lg overflow-hidden">
                              {item.imageId || item.imageUrl ? (
                                <img
                                  src={item.imageId ? `${IMAGE_API_URL}/api/images/${item.imageId}` : item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null
                                    e.target.src = "/placeholder.svg?height=64&width=64"
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-slate-800">{item.name}</h4>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                                <p className="text-sm font-medium text-purple-600">
                                  ₹{item.price ? item.price.toFixed(2) : "0.00"}
                                </p>
                                {item.color && <p className="text-sm text-slate-500">Color: {item.color}</p>}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-medium text-slate-800">
                                ₹{item.price && item.quantity ? (item.price * item.quantity).toFixed(2) : "0.00"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                        <div className="text-sm text-slate-600">
                          <p>Shipping: {order.shippingCost ? `₹${order.shippingCost.toFixed(2)}` : "Free"}</p>
                          <p>Tax: {order.tax ? `₹${order.tax.toFixed(2)}` : "Included"}</p>
                        </div>
                        <p className="text-lg font-semibold text-purple-700">
                          Total: ₹{order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleOrderDetails(order._id)}
                    className="w-full p-2 text-center text-purple-600 hover:bg-purple-50 transition-colors border-t border-slate-200 flex items-center justify-center"
                  >
                    {expandedOrderId === order._id ? (
                      <>
                        Hide Details <ChevronUp className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Show Details <ChevronDown className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && trackingInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Order Tracking #{trackingOrderId?.substring(0, 8)}
              </h3>
              <button
                onClick={closeTrackingModal}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              {isTrackingLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-20 bg-slate-200 rounded"></div>
                  <div className="h-20 bg-slate-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="mb-6 bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-500 text-sm">Tracking Number</p>
                        <p className="font-medium text-slate-800">{trackingInfo.trackingNumber}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">Carrier</p>
                        <p className="font-medium text-slate-800">{trackingInfo.carrier}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">Status</p>
                        <p className="font-medium text-slate-800">{trackingInfo.status}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">Estimated Delivery</p>
                        <p className="font-medium text-slate-800">
                          {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-medium text-slate-800 mb-4">Tracking History</h4>
                  <div className="relative">
                    <div className="absolute left-3 top-0 h-full w-0.5 bg-indigo-100"></div>
                    <div className="space-y-6">
                      {trackingInfo.events.map((event, index) => (
                        <div key={index} className="relative pl-10">
                          <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-indigo-100 border-4 border-white"></div>
                          <p className="font-medium text-slate-800">{event.description}</p>
                          <p className="text-sm text-slate-500">{event.location}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
  const WishlistTab = () => (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
        <Heart className="mr-2 h-6 w-6 text-purple-600" /> My Wishlist
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {isLoading ? (
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="h-48 bg-slate-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">Your wishlist is empty</h3>
            <p className="text-slate-500 mb-4">Save items you love to your wishlist and find them here anytime</p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Discover Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.productId}
                className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative">
                  <img
                    src={item.imageUrl || "/placeholder.svg?height=240&width=320"}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => removeFromWishlist(item)}
                    className="absolute top-2 right-2 p-1.5 bg-white bg-opacity-80 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-purple-600 font-bold mb-3">₹{item.price.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
                    </button>
                    <button
                      onClick={() => openModal(item)}
                      className="flex-none p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                      aria-label="View details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {showModal && selectedWishlistItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">{selectedWishlistItem.name}</h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={selectedWishlistItem.imageUrl || "/placeholder.svg?height=300&width=400"}
                      alt={selectedWishlistItem.name}
                      className="w-full h-64 md:h-80 object-cover"
                    />
                  </div>
                </div>

                <div className="md:w-1/2">
                  <div className="prose prose-slate max-w-none mb-4">
                    <p>{selectedWishlistItem.description || "No description available"}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-purple-600">₹{selectedWishlistItem.price.toFixed(2)}</p>
                    {selectedWishlistItem.originalPrice && (
                      <p className="text-slate-500 line-through">₹{selectedWishlistItem.originalPrice.toFixed(2)}</p>
                    )}
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedWishlistItem.colors && selectedWishlistItem.colors.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedWishlistItem.colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`w-8 h-8 rounded-full border-2 ${
                                selectedColor === color ? "border-purple-600" : "border-transparent"
                              }`}
                              style={{ backgroundColor: color.toLowerCase() }}
                              aria-label={`Select ${color} color`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(selectedWishlistItem)}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </button>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Customer Reviews</h4>

                {reviews.length === 0 ? (
                  <p className="text-slate-500 italic">No reviews yet. Be the first to review this product!</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {reviews.map((review, index) => (
                      <div key={index} className="border-b border-slate-100 pb-4 last:border-0">
                        <div className="flex items-center mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-slate-700">{review.reviewText}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {review.userName || "Anonymous"} -{" "}
                          {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Write a Review Form */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h5 className="font-medium text-slate-800 mb-3">Write a Review</h5>
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 cursor-pointer ${i < newRating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                        onClick={() => setNewRating(i + 1)}
                      />
                    ))}
                  </div>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={4}
                  />
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                  <button
                    onClick={handleSubmitReview}
                    className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const SettingsTab = () => (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
        <Settings className="mr-2 h-6 w-6 text-purple-600" /> Settings
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="animate-pulse p-6 space-y-6">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
            <div className="h-10 bg-slate-200 rounded w-40"></div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {/* Personal Information */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
              {isEditing ? (
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={settings.name}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={settings.phone}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={saveSettings}
                      disabled={isLoading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-24 text-sm text-slate-500">Name:</span>
                    <span className="text-slate-800">{settings.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-sm text-slate-500">Email:</span>
                    <span className="text-slate-800">{settings.email}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-sm text-slate-500">Phone:</span>
                    <span className="text-slate-800">{settings.phone || "Not provided"}</span>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-3 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </button>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Change Password</h3>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                {passwordError && <div className="bg-red-50 text-red-600 p-3 rounded-lg">{passwordError}</div>}
                <button
                  onClick={changePassword}
                  disabled={isLoading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>

            {/* Address Book */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Address Book</h3>
              {isEditingAddress ? (
                <div className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Street</label>
                      <input
                        type="text"
                        name="street"
                        value={currentAddress?.street || ""}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={currentAddress?.city || ""}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={currentAddress?.state || ""}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Zip Code</label>
                          <input
                            type="text"
                            name="zip"
                            value={currentAddress?.zip || ""}
                            onChange={handleAddressChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          onClick={saveAddress}
                          disabled={isLoading}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                          {isLoading ? "Saving..." : "Save Address"}
                        </button>
                        <button
                          onClick={() => setIsEditingAddress(false)}
                          className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {addresses.length === 0 ? (
                        <p className="text-slate-500 italic mb-4">No addresses saved yet.</p>
                      ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address._id} className="border border-slate-200 rounded-lg p-4 relative">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-slate-800">
                                {address.street}
                                {address.isDefault && (
                                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                    Default
                                  </span>
                                )}
                              </p>
                              <p className="text-slate-600">
                                {address.city}, {address.state} {address.zip}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setCurrentAddress(address);
                                  setIsEditingAddress(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteAddress(address._id)}
                                className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {!address.isDefault && (
                            <button
                              onClick={() => setDefaultAddress(address._id)}
                              className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                            >
                              Set as default
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setCurrentAddress({})
                          setIsEditingAddress(true)
                        }}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add New Address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Preferences */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Notification Preferences</h3>
              <div className="space-y-4 max-w-2xl">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <input
                      id={`notification-${key}`}
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
                    />
                    <label htmlFor={`notification-${key}`} className="ml-3 text-slate-700">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </label>
                  </div>
                ))}
                <button
                  onClick={saveNotificationPreferences}
                  disabled={isLoading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {error && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg transition-all transform ${
            error ? "translate-y-0 opacity-100" : "translate-y-[-20px] opacity-0"
          } ${error.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
        >
          <div className="flex items-center">
            {error.type === "success" ? (
              <div className="flex-shrink-0 w-5 h-5 text-green-500">✓</div>
            ) : (
              <div className="flex-shrink-0 w-5 h-5 text-red-500">✕</div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium">{error.message}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-slate-400 hover:text-slate-600 rounded-lg p-1.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden w-full mb-4 bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm"
        onClick={toggleMobileMenu}
      >
        <span className="font-medium">Menu</span>
        {showMobileMenu ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className={`md:w-64 w-full ${showMobileMenu ? "block" : "hidden"} md:block`}>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-4">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h1 className="text-xl font-bold text-slate-800">My Account</h1>
            </div>
            <nav className="p-2">
              <ul className="space-y-1">
                {[
                  { tab: "dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
                  { tab: "profile", icon: <User className="h-5 w-5" />, label: "My Profile" },
                  { tab: "orders", icon: <Package className="h-5 w-5" />, label: "Order History" },
                  { tab: "wishlist", icon: <Heart className="h-5 w-5" />, label: "My Wishlist" },
                  { tab: "settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
                ].map(({ tab, icon, label }) => (
                  <li key={tab}>
                    <button
                      onClick={() => {
                        setActiveTab(tab)
                        setShowMobileMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center transition-colors ${
                        activeTab === tab ? "bg-purple-600 text-white" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="mr-3">{icon}</span>
                      <span>{label}</span>
                      {activeTab === tab && <ChevronRight className="ml-auto h-4 w-4" />}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="pt-2 mt-4 border-t border-slate-200">
                <button
                  onClick={() => dispatch(logout())}
                  className="w-full text-left px-4 py-2.5 rounded-lg flex items-center text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "wishlist" && <WishlistTab />}
            {activeTab === "settings" && <SettingsTab />}
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      {showTracking && trackingInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Tracking Information</h3>
              <button
                onClick={() => setShowTracking(false)}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-slate-600">
                  Tracking Number:{" "}
                  <span className="font-medium text-slate-800">{trackingInfo.trackingNumber || "N/A"}</span>
                </p>
                <p className="text-slate-600">
                  Carrier: <span className="font-medium text-slate-800">{trackingInfo.carrier || "N/A"}</span>
                </p>
                <p className="text-slate-600">
                  Status: <span className="font-medium text-slate-800">{trackingInfo.status || "N/A"}</span>
                </p>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-slate-200"></div>
                <ul className="space-y-6">
                  {(trackingInfo.events || []).map((event, index) => (
                    <li key={index} className="relative pl-10">
                      <div className="absolute left-0 top-1.5 h-8 w-8 rounded-full bg-purple-100 border-4 border-white flex items-center justify-center">
                        <Truck className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{event.description}</p>
                        <p className="text-sm text-slate-500">{event.location}</p>
                        <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {trackingInfo.estimatedDelivery && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <p className="text-purple-800">
                    Estimated Delivery:{" "}
                    <span className="font-semibold">
                      {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile;
