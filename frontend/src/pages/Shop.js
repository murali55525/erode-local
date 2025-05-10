import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faStar,
  faCamera,
  faMicrophone,
  faFilter,
  faWandMagicSparkles,
  faPaintBrush,
  faSoap,
  faBottleDroplet,
  faSprayCan,
  faShoppingBag,
  faGem,
  faRing,
  faShoePrints,
  faClock,
  faDotCircle,
  faKey,
  faGift,
  faCrown,
  faLeaf,
  faShoppingCart,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import "./Shop.css";

const CART_API_BASE_URL = "http://localhost:5000/api";
const PRODUCT_API_BASE_URL = "http://localhost:5001/api/admin"; // Updated API endpoint

const ALL_CATEGORIES = [
  { name: "Lipstick", icon: faWandMagicSparkles },
  { name: "Nail polish", icon: faPaintBrush },
  { name: "Soap", icon: faSoap },
  { name: "Shampoo", icon: faBottleDroplet },
  { name: "Perfumes", icon: faSprayCan },
  { name: "Bag items", icon: faShoppingBag },
  { name: "Necklace", icon: faGem },
  { name: "Bangles", icon: faRing },
  { name: "Steads", icon: faGem },
  { name: "Hip band", icon: faRing },
  { name: "Bands", icon: faRing },
  { name: "Cosmetics makeup accessories", icon: faPaintBrush },
  { name: "Slippers", icon: faShoePrints },
  { name: "Shoes", icon: faShoePrints },
  { name: "Watches", icon: faClock },
  { name: "Bindi", icon: faDotCircle },
  { name: "Key chains", icon: faKey },
  { name: "Gift items", icon: faGift },
  { name: "Rental jewelry", icon: faCrown },
  { name: "Skin care products", icon: faLeaf },
  { name: "Bottles", icon: faBottleDroplet },
];

const Shop = () => {
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [popupMessage, setPopupMessage] = useState(null); // For showing popup messages
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortOption, setSortOption] = useState("priceLow");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const productsResponse = await axios.get(`${PRODUCT_API_BASE_URL}/products`, { timeout: 5000 });
        // Update to use the data property from the admin API response
        const productsData = productsResponse.data.data || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(`Failed to load products: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const fetchReviews = async () => {
        try {
          const response = await axios.get(`${PRODUCT_API_BASE_URL}/products/${selectedProduct._id}/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          });
          setReviews(response.data || []);
        } catch (error) {
          console.error("Error fetching reviews:", error);
          setReviews([]);
          setError(`Failed to load reviews: ${error.message}`);
        }
      };
      fetchReviews();
    }
  }, [selectedProduct, token]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get(`${CART_API_BASE_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(response.data.items.map((item) => item.productId.toString()));
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        setError("Failed to load wishlist.");
      }
    };

    if (token) {
      fetchWishlist();
    }
  }, [token]);

  const handleLensSearch = async (file) => {
    if (!file) {
      setError("Please upload an image.");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(`${PRODUCT_API_BASE_URL}/products/lens-search`, formData, { timeout: 10000 });
      setFilteredProducts(response.data.length > 0 ? response.data : []);
      setSearch("");
      setSelectedCategories([]);
    } catch (error) {
      setError(`Lens search failed: ${error.response ? error.response.data.error : error.message}`);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setError("Voice search is not supported in your browser.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = async (event) => {
      const voiceQuery = event.results[0][0].transcript;
      setSearch(voiceQuery);
      setLoading(true);
      try {
        const response = await axios.get(`${PRODUCT_API_BASE_URL}/products/search?q=${encodeURIComponent(voiceQuery)}`, { timeout: 5000 });
        setFilteredProducts(response.data);
        setSelectedCategories([]);
      } catch (error) {
        setError(`Voice search failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    recognition.onerror = (event) => setError(`Voice search failed: ${event.error}`);
    recognition.start();
  };

  const handleTextSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        search.trim()
          ? `${PRODUCT_API_BASE_URL}/products/search?q=${encodeURIComponent(search)}`
          : `${PRODUCT_API_BASE_URL}/products`,
        { timeout: 5000 }
      );
      setFilteredProducts(response.data);
      setSelectedCategories([]);
    } catch (error) {
      setError(`Text search failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = () => {
    const filtered = products
      .filter((product) => {
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
        return matchesCategory && matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        if (sortOption === "priceLow") return a.price - b.price;
        if (sortOption === "priceHigh") return b.price - a.price;
        if (sortOption === "nameAsc") return a.name.localeCompare(b.name);
        if (sortOption === "nameDesc") return b.name.localeCompare(a.name);
        return 0;
      });
    setFilteredProducts(filtered);
    setShowFilters(false);
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleWishlistItem = async (productId) => {
    try {
      if (!token) {
        setError("Please log in to manage your wishlist.");
        return;
      }

      const isInWishlist = wishlist.includes(productId);
      if (isInWishlist) {
        await axios.delete(`${CART_API_BASE_URL}/wishlist/remove/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist((prev) => prev.filter((id) => id !== productId));
        setPopupMessage("Removed from Wishlist");
      } else {
        await axios.post(
          `${CART_API_BASE_URL}/wishlist/add`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlist((prev) => [...prev, productId]);
        setPopupMessage("Added to Wishlist");
      }

      // Show popup for 2 seconds
      setTimeout(() => setPopupMessage(null), 2000);
    } catch (error) {
      console.error("Error updating wishlist:", error);
      setError("Failed to update wishlist.");
    }
  };

  const openModal = (product) => {
    if (!product) return;
    setSelectedProduct(product);
    setQuantity(1);
    setSelectedColor(typeof product.colors === "string" && product.colors ? product.colors.split(", ")[0] : "");
    setShowModal(true);
    setNewRating(0);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setNewReview("");
    setNewRating(0);
    setError("");
  };

  const handleAddToCart = async (product, fromModal = false) => {
    if (!product || (fromModal && quantity <= 0)) {
      setError("Invalid product or quantity.");
      return;
    }

    const cartItem = {
      ...product,
      quantity: fromModal ? quantity : 1,
      selectedColor: selectedColor || null,
    };

    console.log("Add to Cart Payload:", cartItem);

    try {
      await addToCart(cartItem);
      setShowPopup(true); // Show confirmation popup
      setTimeout(() => setShowPopup(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data?.message || error.message);
      setError(error.response?.data?.message || "Failed to add item to cart.");
    }
    if (fromModal) setShowModal(false);
  };

  const handleSubmitReview = async () => {
    if (!newReview.trim() || newRating === 0) {
      setError("Review and rating are required.");
      return;
    }
    try {
      const response = await axios.post(
        `${PRODUCT_API_BASE_URL}/products/${selectedProduct._id}/reviews`,
        {
          reviewText: newReview,
          rating: newRating,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );
      setReviews((prev) => [...prev, response.data.review]);
      setNewReview("");
      setNewRating(0);
      setError("");
    } catch (error) {
      console.error("Error submitting review:", error);
      setError(`Failed to submit review: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = "https://via.placeholder.com/300x200?text=No+Image"; // External placeholder
  };

  return (
    <div className="matte-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="matte-section mb-8">
          <h1>Shop at NEW ERODE FANCY</h1>
          <div className="filters">
            <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              <FontAwesomeIcon icon={faFilter} /> Filters
            </button>
            <div className="search-bar-container">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTextSearch()}
                className="search-bar"
              />
              <button onClick={handleVoiceSearch} className="search-btn mic-btn" title="Voice Search">
                <FontAwesomeIcon icon={faMicrophone} />
              </button>
              <label className="search-btn lens-btn" title="Lens Search">
                <FontAwesomeIcon icon={faCamera} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLensSearch(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="sort-filter">
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="nameAsc">Name: A-Z</option>
              <option value="nameDesc">Name: Z-A</option>
            </select>
            <div className="price-range">
              <label>Price: ₹{priceRange.min} - ₹{priceRange.max}</label>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                className="price-slider"
              />
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="flex gap-8">
          {/* Filter Panel */}
          <div className={`matte-card p-4 ${showFilters ? "w-64" : "w-0"}`}>
            <h3>Filter by Category</h3>
            <div className="category-list">
              {ALL_CATEGORIES.map((category) => (
                <label key={category.name} className="category-option">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => toggleCategory(category.name)}
                  />
                  <FontAwesomeIcon icon={category.icon} className="category-icon" />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
            <button className="apply-filter-btn" onClick={handleFilterApply}>
              Apply Filters
            </button>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product._id} className="matte-card p-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="no-image-placeholder">No Image Available</div>
                  )}
                  <div className="product-details">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-price">₹{product.price}</p>
                    <div className="product-actions">
                      <button onClick={() => openModal(product)} className="view-details-btn">
                        View Details
                      </button>
                      <button onClick={() => handleAddToCart(product)} className="add-to-cart-btn">
                        <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                      </button>
                      <button
                        onClick={() => toggleWishlistItem(product._id)}
                        className={`wishlist-btn ${wishlist.includes(product._id) ? "in-wishlist" : ""}`}
                      >
                        <FontAwesomeIcon icon={faHeart} />
                        {wishlist.includes(product._id) ? "In Wishlist" : "Add to Wishlist"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedProduct && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedProduct.name}</h2>
              <button onClick={closeModal} className="close-modal-btn">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <div className="product-image-container">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="product-img-modal"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="no-image-placeholder">No Image Available</div>
                )}
              </div>
              <div className="product-info">
                <p className="product-description">{selectedProduct.description}</p>
                <p className="product-price">Price: ₹{selectedProduct.price}</p>
                {selectedProduct.colors && typeof selectedProduct.colors === "string" && (
                  <div className="color-options">
                    <label className="color-label">Color:</label>
                    {selectedProduct.colors.split(", ").map((color) => (
                      <div
                        key={color}
                        className={`color-box ${selectedColor === color ? "selected" : ""}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                )}
                <div className="quantity-selection">
                  <label className="quantity-label">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="quantity-dropdown"
                  >
                    {Array.from({ length: Math.min(selectedProduct.availableQuantity || 10, 10) }, (_, i) => i + 1).map(
                      (num) => (
                        <option key={num} value={num}>{num}</option>
                      )
                    )}
                  </select>
                </div>
                <button onClick={() => handleAddToCart(selectedProduct, true)} className="add-to-cart-btn">
                  <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                </button>
              </div>
              <div className="reviews-section">
                <h3>Reviews</h3>
                {error && <p className="error-message">{error}</p>}
                <ul className="review-list">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <li key={review._id} className="review-item">
                        <p>{review.reviewText}</p>
                        <p>
                          <strong>Rating:</strong> {review.rating || 0}{" "}
                          <FontAwesomeIcon icon={faStar} className="star-icon" />
                        </p>
                        <p><small>By: {review.userId || "Anonymous"}</small></p>
                      </li>
                    ))
                  ) : (
                    <p>No reviews yet.</p>
                  )}
                </ul>
                <div className="rating-section">
                  <label>Rate this product:</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesomeIcon
                        key={star}
                        icon={faStar}
                        className={`star-icon ${star <= newRating ? "active" : ""}`}
                        onClick={() => setNewRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Write your review here..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  className="review-input"
                />
                <button onClick={handleSubmitReview} className="submit-review-btn">
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPopup && <div className="popup">✔ Added to Cart</div>}
    </div>
  );
};

export default Shop;