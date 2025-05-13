import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom" // Add this import
import { useCart } from "./CartContext"
import axios from "axios"
import {
  X,
  Search,
  Mic,
  Camera,
  Filter,
  Heart,
  ShoppingCart,
  ArrowUpDown,
  Plus,
  Minus,
  ShoppingBag,
  Palette,
  Droplet,
  Sparkles,
  Gift,
  Watch,
  Gem,
  ChevronRight,
  Star,
} from "lucide-react"

// Use a single API base URL for all requests including images
const API_BASE_URL = "https://render-1-ehkn.onrender.com"

// Map category icons with Lucide icons (normalized to match backend)
const CATEGORY_ICONS = {
  Lipstick: Sparkles,
  "Nail Polish": Palette,
  Soap: Droplet,
  Shampoo: Droplet,
  Perfumes: Droplet,
  "Bag Items": ShoppingBag,
  Necklace: Gem,
  Bangles: Gem,
  Steads: Gem,
  "Hip Band": Gem,
  Bands: Gem,
  "Cosmetics Makeup Accessories": Palette,
  Slippers: ShoppingBag,
  Shoes: ShoppingBag,
  Watches: Watch,
  Bindi: Gem,
  "Key Chains": Gift,
  "Gift Items": Gift,
  "Rental Jewelry": Gem,
  "Skin Care Products": Droplet,
  Bottles: Droplet,
  featuredProducts: Gift,
  trendingProducts: Gift,
  dealOfTheDay: Gift,
  shop: ShoppingBag,
}

const ALL_CATEGORIES = Object.keys(CATEGORY_ICONS).map((name) => ({
  name,
  Icon: CATEGORY_ICONS[name] || Gift,
}))

// Color palette for the royal blue theme
const COLORS = {
  primary: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
    950: "#1e1b4b",
  },
  accent: {
    light: "#f0fdfa",
    medium: "#5eead4",
    dark: "#0d9488",
  },
  gold: "#fbbf24",
}

const Shop = () => {
  const navigate = useNavigate(); // Add this line
  const { addToCart } = useCart()
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [popupMessage, setPopupMessage] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [sortOption, setSortOption] = useState("priceLow")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [hoveredProductId, setHoveredProductId] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [featuredCategories, setFeaturedCategories] = useState([])

  const token = localStorage.getItem("token")

  // Fetch products on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products`, { timeout: 5000 })
        const productsData = response.data || []
        setProducts(productsData)
        const sortedProducts = sortProducts(productsData, sortOption)
        setFilteredProducts(sortedProducts)

        // Extract 8 random categories for featured display
        const categories = [...new Set(productsData.map((p) => p.category).filter(Boolean))]
        setFeaturedCategories(categories.sort(() => 0.5 - Math.random()).slice(0, 8))
      } catch (error) {
        console.error("Error fetching products:", error)
        setError(`Failed to load products: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch wishlist if authenticated
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setWishlist(response.data.items?.map((item) => item.productId.toString()) || [])
      } catch (error) {
        console.error("Error fetching wishlist:", error)
        setError("Failed to load wishlist.")
      }
    }

    if (token) {
      fetchWishlist()
    }
  }, [token])

  // Sort products based on selected option
  const sortProducts = (productList, option) => {
    return [...productList].sort((a, b) => {
      if (option === "priceLow") return a.price - b.price
      if (option === "priceHigh") return b.price - a.price
      if (option === "nameAsc") return a.name.localeCompare(b.name)
      if (option === "nameDesc") return b.name.localeCompare(a.name)
      return 0
    })
  }

  // Update sorting when sortOption changes
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const sorted = sortProducts(filteredProducts, sortOption)
      setFilteredProducts(sorted)
    }
  }, [sortOption])

  // Handle lens search
  const handleLensSearch = async (file) => {
    if (!file) {
      setError("Please upload an image.")
      return
    }
    setLoading(true)
    setError("")
    const formData = new FormData()
    formData.append("image", file)

    try {
      const response = await axios.post(`${API_BASE_URL}/api/products/lens-search`, formData, {
        timeout: 10000,
        headers: { Authorization: `Bearer ${token}` },
      })
      setFilteredProducts(response.data.length > 0 ? response.data : [])
      setSearch("")
      setSelectedCategories([])
      setActiveCategory(null)
    } catch (error) {
      setError(`Lens search failed: ${error.response?.data?.error || error.message}`)
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Handle voice search
  const handleVoiceSearch = () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setError("Voice search is not supported in your browser.")
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.onresult = async (event) => {
      const voiceQuery = event.results[0][0].transcript
      setSearch(voiceQuery)
      setLoading(true)
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products`, { timeout: 5000 })
        const filtered = response.data.filter((product) =>
          product.name.toLowerCase().includes(voiceQuery.toLowerCase()),
        )
        setFilteredProducts(sortProducts(filtered, sortOption))
        setSelectedCategories([])
        setActiveCategory(null)
      } catch (error) {
        setError(`Voice search failed: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }
    recognition.onerror = (event) => setError(`Voice search failed: ${event.error}`)
    recognition.start()
  }

  // Handle text search
  const handleTextSearch = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`, { timeout: 5000 })
      const filtered = search.trim()
        ? response.data.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
        : response.data
      setFilteredProducts(sortProducts(filtered, sortOption))
      setSelectedCategories([])
      setActiveCategory(null)
    } catch (error) {
      setError(`Text search failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  const handleFilterApply = () => {
    const filtered = products.filter((product) => {
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max
      return matchesCategory && matchesSearch && matchesPrice
    })
    const sortedFiltered = sortProducts(filtered, sortOption)
    setFilteredProducts(sortedFiltered)
    setShowFilters(false)
  }

  // Toggle category filter
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Set active category and filter products
  const handleCategoryClick = (category) => {
    setActiveCategory(category)
    setSelectedCategories([category])

    const filtered = products.filter((product) => product.category === category)
    setFilteredProducts(sortProducts(filtered, sortOption))

    // Scroll to products section
    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" })
  }

  // Toggle wishlist item
  const toggleWishlistItem = async (productId) => {
    if (!token) {
      setError("Please log in to manage your wishlist.")
      return
    }
    try {
      const isInWishlist = wishlist.includes(productId)
      if (isInWishlist) {
        await axios.delete(`${API_BASE_URL}/api/wishlist/remove/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setWishlist((prev) => prev.filter((id) => id !== productId))
        setPopupMessage("Removed from Wishlist")
      } else {
        await axios.post(
          `${API_BASE_URL}/api/wishlist/add`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        setWishlist((prev) => [...prev, productId])
        setPopupMessage("Added to Wishlist")
      }
      setTimeout(() => setPopupMessage(null), 2000)
    } catch (error) {
      console.error("Error updating wishlist:", error)
      setError("Failed to update wishlist.")
    }
  }

  // Open product modal
  const openModal = (product) => {
    if (!product) return
    setSelectedProduct(product)
    setQuantity(1)
    setSelectedColor(product.colors?.[0] || "")
    setShowModal(true)
  }

  // Close product modal
  const closeModal = () => {
    setShowModal(false)
    setSelectedProduct(null)
    setError("")
  }

  // Handle add to cart
  const handleAddToCart = async (product, fromModal = false) => {
    if (!token) {
      setError("Please log in to add items to cart.")
      navigate("/login")
      return
    }

    if (!product || (fromModal && quantity <= 0)) {
      setError("Invalid product or quantity.")
      return
    }

    try {
      const cartItem = {
        ...product,
        quantity: fromModal ? quantity : 1,
        selectedColor: selectedColor || null,
      }
      
      await addToCart(cartItem)
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 2000)
    } catch (error) {
      console.error("Error adding to cart:", error)
      setError(error.response?.data?.message || "Failed to add item to cart.")
    }

    if (fromModal) {
      setShowModal(false)
    }
  }

  // Change quantity
  const changeQuantity = (amount) => {
    const newQuantity = quantity + amount
    const max = selectedProduct?.availableQuantity || 10
    if (newQuantity >= 1 && newQuantity <= max) {
      setQuantity(newQuantity)
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setSearch("")
    setSelectedCategories([])
    setPriceRange({ min: 0, max: 1000 })
    setActiveCategory(null)
    setFilteredProducts(sortProducts(products, sortOption))
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner with Royal Blue Gradient */}
      {/* Banner content removed for brevity */}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            {/* Search bar */}
            <div className="relative flex-1 w-full">
              <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-0">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleTextSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg sm:rounded-l-xl sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-blue-400" />
                </div>
                <button
                  onClick={handleTextSearch}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg sm:rounded-l-none sm:rounded-r-xl transition-colors w-full sm:w-auto"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 w-full sm:w-auto justify-center sm:justify-start mt-3 sm:mt-0">
              <button
                onClick={handleVoiceSearch}
                className="bg-blue-50 hover:bg-blue-100 p-3 rounded-full transition-colors text-blue-700"
                title="Voice Search"
              >
                <Mic className="h-5 w-5" />
              </button>
              <label className="bg-blue-50 hover:bg-blue-100 p-3 rounded-full cursor-pointer transition-colors text-blue-700">
                <Camera className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLensSearch(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-full transition-colors ${
                  showFilters ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 ${showFilters ? "block" : "hidden"}`}>
            {/* Sort Options */}
            <div className="p-4 sm:p-5 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                <ArrowUpDown className="w-5 h-5 mr-2" />
                Sort By
              </h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sortOption"
                    checked={sortOption === "priceLow"}
                    onChange={() => setSortOption("priceLow")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Price: Low to High</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sortOption"
                    checked={sortOption === "priceHigh"}
                    onChange={() => setSortOption("priceHigh")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Price: High to Low</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sortOption"
                    checked={sortOption === "nameAsc"}
                    onChange={() => setSortOption("nameAsc")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Name: A-Z</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sortOption"
                    checked={sortOption === "nameDesc"}
                    onChange={() => setSortOption("nameDesc")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Name: Z-A</span>
                </label>
              </div>
            </div>

            {/* Price Range */}
            <div className="p-4 sm:p-5 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-3">Price Range</h3>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-blue-700 font-medium">₹{priceRange.min}</span>
                  <span className="text-sm text-blue-700 font-medium">₹{priceRange.max}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number.parseInt(e.target.value) })}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(priceRange.max / 1000) * 100}%, #dbeafe ${(priceRange.max / 1000) * 100}%, #dbeafe 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Popular Categories */}
            <div className="p-4 sm:p-5 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-3">Popular Categories</h3>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.slice(0, 6).map(({ name, Icon }) => (
                  <button
                    key={name}
                    onClick={() => toggleCategory(name)}
                    className={`flex items-center px-3 py-1.5 text-xs rounded-full transition-colors ${
                      selectedCategories.includes(name)
                        ? "bg-blue-600 text-white"
                        : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end mt-4">
              <button onClick={resetFilters} className="mr-3 text-blue-600 hover:text-blue-800 font-medium">
                Reset
              </button>
              <button
                onClick={handleFilterApply}
                className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* All Categories Carousel with improved styling */}
        <div id="all-categories" className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Browse All Categories</h2>
          <div className="flex space-x-2 sm:space-x-4 pb-2 overflow-x-auto scrollbar-hide">
            {ALL_CATEGORIES.map(({ name, Icon }) => (
              <button
                key={name}
                onClick={() => handleCategoryClick(name)}
                className={`flex flex-col items-center p-3 sm:p-4 min-w-[100px] sm:min-w-[120px] rounded-xl transition-all ${
                  activeCategory === name
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-800"
                }`}
              >
                <div className={`p-2 sm:p-3 rounded-full ${activeCategory === name ? "bg-white bg-opacity-20" : "bg-white"}`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${activeCategory === name ? "text-white" : "text-blue-600"}`} />
                </div>
                <span className="mt-2 text-xs sm:text-sm font-medium truncate">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Category Title */}
        {activeCategory && (
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-900">
              {activeCategory} <span className="text-blue-600">({filteredProducts.length} Products)</span>
            </h2>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
            >
              Clear Filter <X className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}

        {/* Product Grid with enhanced styling */}
        <div id="products-section" className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-blue-50"
              onMouseEnter={() => setHoveredProductId(product._id)}
              onMouseLeave={() => setHoveredProductId(null)}
              onTouchStart={() => setHoveredProductId(product._id)}
              onTouchEnd={() => setTimeout(() => setHoveredProductId(null), 1000)}
            >
              <div className="relative h-48 sm:h-64 overflow-hidden">
                {product.imageId ? (
                  <img
                    src={`${API_BASE_URL}/api/images/${product.imageId}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.onerror = null;
                      e.target.src = '/images/default.jpg';
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                    No Image Available
                  </div>
                )}
                {/* Wishlist button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleWishlistItem(product._id)
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-colors shadow-md"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-blue-600"
                    }`}
                  />
                </button>

                {/* Category tag */}
                {product.category && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{product.category}</span>
                  </div>
                )}

                {/* Quick add to cart button - always visible on mobile */}
                <div
                  className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-blue-900 to-transparent text-white transform transition-transform duration-300 ${
                    hoveredProductId === product._id || window.innerWidth < 640 ? "translate-y-0" : "translate-y-full"
                  }`}
                >
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-2 bg-white text-blue-700 hover:bg-blue-50 font-medium rounded-lg flex items-center justify-center transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Quick Add
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-medium text-blue-900 truncate text-sm sm:text-base">{product.name}</h3>
                <div className="flex items-center mt-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${i < 3 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">(12)</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-base sm:text-lg font-bold text-blue-700">₹{product.price}</p>
                  <button
                    onClick={() => openModal(product)}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-8 sm:py-16 bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-blue-100">
              <Search className="h-8 w-8 sm:h-12 sm:w-12 text-blue-400" />
            </div>
            <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-medium text-blue-900">No products found</h3>
            <p className="mt-2 text-blue-600 px-4">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 sm:mt-6 inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Product Details Modal with enhanced styling */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b p-3 sm:p-4">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-900 truncate">{selectedProduct.name}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 p-2" aria-label="Close">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid md:grid-cols-2 gap-4 sm:gap-8 p-4 sm:p-6">
                {/* Product Image */}
                <div className="flex items-center justify-center bg-blue-50 rounded-xl overflow-hidden">
                  {selectedProduct.imageId ? (
                    <img
                      src={`${API_BASE_URL}/api/images/${selectedProduct.imageId}`}
                      alt={selectedProduct.name}
                      className="max-h-[400px] object-contain"
                      onError={(e) => {
                        console.error('Image load error:', e);
                        e.target.onerror = null;
                        e.target.src = '/images/default.jpg';
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-[400px] w-full flex items-center justify-center text-blue-500">
                      No Image Available
                    </div>
                  )}
                </div>
                {/* Product Info */}
                <div>
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {selectedProduct.category || "General"}
                      </span>
                      {selectedProduct.availableQuantity && selectedProduct.availableQuantity < 5 && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded-full">
                          Only {selectedProduct.availableQuantity} left
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-blue-700 mb-2">₹{selectedProduct.price}</p>
                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < 3 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">(12 reviews)</span>
                    </div>
                    <p className="text-gray-600">
                      {selectedProduct.description || "No description available for this product."}
                    </p>
                  </div>
                  {/* Color Selection */}
                  {selectedProduct.colors?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-blue-900 mb-2">Colors</h3>
                      <div className="flex space-x-3">
                        {selectedProduct.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`relative h-10 w-10 rounded-full border-2 ${
                              selectedColor === color ? "ring-2 ring-blue-500 ring-offset-2" : "border-gray-200"
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Quantity Selection */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Quantity</h3>
                    <div className="flex items-center border border-gray-300 rounded-lg max-w-[140px]">
                      <button
                        onClick={() => changeQuantity(-1)}
                        disabled={quantity <= 1}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-white rounded-l-lg"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="flex-1 text-center py-2 font-medium text-blue-900">{quantity}</div>
                      <button
                        onClick={() => changeQuantity(1)}
                        disabled={quantity >= (selectedProduct.availableQuantity || 10)}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-white rounded-r-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {/* Add to Cart and Wishlist Buttons */}
                  <div className="flex space-x-3 mb-6 mt-4 sm:mt-0">
                    <button
                      onClick={() => handleAddToCart(selectedProduct, true)}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      <span className="sm:inline hidden">Add to Cart</span>
                      <span className="sm:hidden inline">Add</span>
                    </button>
                    <button
                      onClick={() => toggleWishlistItem(selectedProduct._id)}
                      className={`p-3 border rounded-lg ${
                        wishlist.includes(selectedProduct._id)
                          ? "bg-red-50 border-red-200 text-red-500"
                          : "border-gray-300 text-blue-600 hover:bg-blue-50"
                      }`}
                      aria-label="Add to wishlist"
                    >
                      <Heart className={wishlist.includes(selectedProduct._id) ? "fill-red-500 h-5 w-5" : "h-5 w-5"} />
                    </button>
                  </div>
                  
                  {/* Product Details */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Product Details</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>
                        Category: <span className="font-medium">{selectedProduct.category || "General"}</span>
                      </p>
                      {selectedProduct.availableQuantity && (
                        <p>
                          Available: <span className="font-medium">{selectedProduct.availableQuantity} items</span>
                        </p>
                      )}
                      <p>
                        SKU: <span className="font-medium">{selectedProduct._id.substring(0, 8).toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Success Popup */}
      {showPopup && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white py-3 px-6 rounded-lg shadow-lg flex items-center animate-slide-up">
          <div className="bg-white bg-opacity-30 rounded-full p-1 mr-3">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <span>Added to cart successfully!</span>
        </div>
      )}

      {/* Wishlist Action Popup */}
      {popupMessage && (
        <div
          className={`fixed bottom-6 right-6 ${
            popupMessage.includes("Added") ? "bg-blue-600" : "bg-gray-700"
          } text-white py-3 px-6 rounded-lg shadow-lg flex items-center animate-slide-up`}
        >
          <div className="bg-white bg-opacity-30 rounded-full p-1 mr-3">
            <Heart className="h-5 w-5" />
          </div>
          <span>{popupMessage}</span>
        </div>
      )}

      {/* Footer Banner with enhanced styling */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 mt-16 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center p-3 bg-white bg-opacity-10 rounded-full mb-4">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Free Delivery</h3>
              <p className="mt-1 text-blue-200">On orders above ₹500</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white bg-opacity-10 rounded-full mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">24/7 Support</h3>
              <p className="mt-1 text-blue-200">Customer service excellence</p>
            </div>
            <div className="text-center md:text-right">
              <div className="inline-flex items-center justify-center p-3 bg-white bg-opacity-10 rounded-full mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Secure Payment</h3>
              <p className="mt-1 text-blue-200">100% secure payment options</p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-blue-200">© 2023 NEW ERODE FANCY. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shop
