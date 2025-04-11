import React, { useState, useEffect } from "react";
import "./Home.css";
import { 
  FaHeart, 
  FaStar, 
  FaArrowLeft, 
  FaArrowRight, 
  FaArrowUp, 
  FaShoppingCart, 
  FaComment, 
  FaInstagram,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";

const API_BASE_URL = "http://localhost:5001/api";

const HomePage = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [featuredCollection, setFeaturedCollection] = useState([]);
  const [dealOfTheDay, setDealOfTheDay] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [cart, setCart] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showWishlistNotification, setShowWishlistNotification] = useState(false);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await fetch(`${API_BASE_URL}/products`);
        if (!productsResponse.ok) throw new Error("Failed to fetch products");
        const products = await productsResponse.json();

        setTrendingProducts(products.filter((p) => p.category === "trendingProducts").slice(0, 4));
        setFeaturedCollection(products.filter((p) => p.category === "featuredProducts").slice(0, 8));
        setDealOfTheDay(products.find((p) => p.category === "dealOfTheDay") || products[0]);
        setTestimonials([
          { name: "Priya S.", rating: 5, text: "The lipsticks are vibrant and long-lasting!", image: "https://randomuser.me/api/portraits/women/44.jpg" },
          { name: "Arjun K.", rating: 4, text: "Great perfumes with amazing lasting power!", image: "https://randomuser.me/api/portraits/men/32.jpg" },
          { name: "Meera R.", rating: 5, text: "Best place for rental jewelry!", image: "https://randomuser.me/api/portraits/women/68.jpg" },
        ]);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    const fetchInstagramPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/instagram-posts`);
        if (!response.ok) throw new Error("Failed to fetch Instagram posts");
        const data = await response.json();
        setInstagramPosts(data.slice(0, 6));
      } catch (error) {
        console.error("Error fetching Instagram posts:", error);
        setInstagramPosts([
          { imageUrl: "https://images.unsplash.com/photo-1560972550-aba3456b5564", url: "#" },
          { imageUrl: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19", url: "#" },
          { imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348", url: "#" },
          { imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70e758", url: "#" },
          { imageUrl: "https://images.unsplash.com/photo-1575330933337-f744b8cafc51", url: "#" },
          { imageUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31", url: "#" },
        ]);
      }
    };

    fetchData();
    fetchInstagramPosts();

    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function calculateTimeLeft() {
    const endDate = new Date("2025-04-30T00:00:00");
    const now = new Date();
    const difference = endDate - now;
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  const handleWishlistToggle = (productName) => {
    setWishlist((prev) => {
      const updated = prev.includes(productName) ? prev.filter((item) => item !== productName) : [...prev, productName];
      if (!prev.includes(productName)) {
        setShowWishlistNotification(true);
        setTimeout(() => setShowWishlistNotification(false), 2000);
      }
      return updated;
    });
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
    setRecentlyViewed((prev) => {
      const updated = prev.filter((item) => item._id !== product._id);
      return [product, ...updated].slice(0, 4);
    });
  };

  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
    const notification = document.createElement("div");
    notification.textContent = "Added to cart!";
    notification.className = "cart-notification";
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 2000);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  const nextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const toggleChat = () => setIsChatOpen((prev) => !prev);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const categories = [
    { id: "all", name: "All" },
    { id: "makeup", name: "Makeup" },
    { id: "skincare", name: "Skincare" },
    { id: "jewelry", name: "Jewelry" },
    { id: "perfumes", name: "Perfumes" }
  ];

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading beautiful things for you...</p>
    </div>
  );

  return (
    <div className="home-container">
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <p>Free shipping on orders above ₹999 | Use code NEWUSER20 for 20% off on first purchase</p>
      </div>

      {/* Hero Section with Video Background */}
      <section className="hero-section">
        <video autoPlay muted loop className="hero-video">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-elegant-perfume-bottle-rotation-32709-large.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Elevate Your <span className="highlight">Style</span></h1>
          <p>Discover Beauty That Speaks to Your Soul</p>
          <div className="hero-buttons">
            <Link to="/shop" className="cta-btn primary">Shop Now</Link>
            <Link to="/collections" className="cta-btn secondary">View Collections</Link>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="category-nav">
        <div className="category-container">
          {categories.map(category => (
            <button 
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Deal of the Day */}
      {dealOfTheDay && (
        <section className="deal-section">
          <div className="section-header">
            <h2>Deal of the Day</h2>
            <div className="section-line"></div>
          </div>
          <div className="deal-content">
            <div className="deal-image">
              <img src={dealOfTheDay.imageUrl || "https://images.unsplash.com/photo-1596462502278-27bfdc403348"} alt={dealOfTheDay.name} />
              <div className="deal-badge">SALE</div>
            </div>
            <div className="deal-info">
              <span className="exclusive-tag">Exclusive Offer</span>
              <h3>{dealOfTheDay.name}</h3>
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < 4 ? "filled" : ""} />
                ))}
                <span>(42 reviews)</span>
              </div>
              <p className="deal-description">
                This limited edition collection brings you the finest quality at an unbeatable price.
                Perfect for everyday use or as a special gift.
              </p>
              <p className="deal-price">
                ₹{dealOfTheDay.price} 
                <span className="original-price">₹{dealOfTheDay.price + 200}</span>
                <span className="discount">30% OFF</span>
              </p>
              <div className="deal-timer">
                <div className="timer-label">Limited Time Offer Ends In:</div>
                <div className="countdown-boxes">
                  <div className="countdown-box">
                    <span className="time">{timeLeft.days}</span>
                    <span className="label">Days</span>
                  </div>
                  <div className="countdown-box">
                    <span className="time">{timeLeft.hours}</span>
                    <span className="label">Hours</span>
                  </div>
                  <div className="countdown-box">
                    <span className="time">{timeLeft.minutes}</span>
                    <span className="label">Mins</span>
                  </div>
                  <div className="countdown-box">
                    <span className="time">{timeLeft.seconds}</span>
                    <span className="label">Secs</span>
                  </div>
                </div>
              </div>
              <div className="deal-actions">
                <button className="cta-btn primary">Buy Now</button>
                <button 
                  className="cta-btn add-cart"
                  onClick={() => handleAddToCart(dealOfTheDay)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Collection with Animation */}
      <section className="featured-collection">
        <div className="section-header">
          <h2>Featured Collection</h2>
          <div className="section-line"></div>
        </div>
        <div className="view-options">
          <Link to="/collections" className="view-all">View All</Link>
        </div>
        <div className="products-grid featured-grid">
          {featuredCollection.map((product, index) => (
            <div 
              key={product._id} 
              className="product-card" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="product-image">
                <img src={product.imageUrl || `https://images.unsplash.com/photo-156044235${index + 1}000-fe3b225f8554`} alt={product.name} />
                <div className="product-overlay">
                  <button onClick={() => handleViewProduct(product)} className="quick-view">Quick View</button>
                </div>
                <button
                  className={`wishlist-btn ${wishlist.includes(product.name) ? "active" : ""}`}
                  onClick={() => handleWishlistToggle(product.name)}
                >
                  <FaHeart />
                </button>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="ratings">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < 4 ? "filled" : ""} />
                  ))}
                </div>
                <div className="price-row">
                  <p className="product-price">₹{product.price}</p>
                  {index % 3 === 0 && <span className="discount-tag">Sale</span>}
                </div>
                <button onClick={() => handleAddToCart(product)} className="add-to-cart">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner with Parallax Effect */}
      <section className="parallax-banner">
        <div className="parallax-content">
          <h2>Summer Collection 2025</h2>
          <p>Embrace the season with our fresh new arrivals</p>
          <Link to="/summer-collection" className="cta-btn glow">Explore Now</Link>
        </div>
      </section>

      {/* Trending Products */}
      <section className="trending-products">
        <div className="section-header">
          <h2>Trending Now</h2>
          <div className="section-line"></div>
        </div>
        <div className="products-grid trending-grid">
          {trendingProducts.map((product, index) => (
            <div key={product._id} className="product-card trending-card">
              <div className="product-image">
                <img src={product.imageUrl || `https://images.unsplash.com/photo-156044231${index + 5}000-fe3b225f8554`} alt={product.name} />
                <div className="trending-badge">Trending</div>
                <div className="product-overlay">
                  <button onClick={() => handleViewProduct(product)} className="quick-view">Quick View</button>
                </div>
                <button
                  className={`wishlist-btn ${wishlist.includes(product.name) ? "active" : ""}`}
                  onClick={() => handleWishlistToggle(product.name)}
                >
                  <FaHeart />
                </button>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="ratings">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < 4 ? "filled" : ""} />
                  ))}
                </div>
                <p className="product-price">₹{product.price}</p>
                <button onClick={() => handleAddToCart(product)} className="add-to-cart">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="promo-content">
          <div className="promo-text">
            <h2>Diwali Special Sale</h2>
            <p>Celebrate this festival of lights with our exclusive collection</p>
            <div className="promo-discount">Up to 50% Off</div>
            <div className="countdown">
              <div className="countdown-item">
                <span className="number">{timeLeft.days}</span>
                <span className="label">Days</span>
              </div>
              <div className="countdown-item">
                <span className="number">{timeLeft.hours}</span>
                <span className="label">Hours</span>
              </div>
              <div className="countdown-item">
                <span className="number">{timeLeft.minutes}</span>
                <span className="label">Mins</span>
              </div>
              <div className="countdown-item">
                <span className="number">{timeLeft.seconds}</span>
                <span className="label">Secs</span>
              </div>
            </div>
            <Link to="/diwali-sale" className="cta-btn shine">Shop The Sale</Link>
          </div>
          <div className="promo-image">
            <img src="https://images.unsplash.com/photo-1593143521073-44901d288dce" alt="Diwali Sale" />
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="features-banner">
        <div className="feature">
          <div className="feature-icon">🚚</div>
          <h3>Free Shipping</h3>
          <p>On orders above ₹999</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔄</div>
          <h3>Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔒</div>
          <h3>Secure Payments</h3>
          <p>100% secure checkout</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💎</div>
          <h3>Premium Quality</h3>
          <p>Guaranteed authenticity</p>
        </div>
      </section>

      {/* Testimonials with Better Styling */}
      <section className="testimonials">
        <div className="section-header">
          <h2>Customer Reviews</h2>
          <div className="section-line"></div>
        </div>
        <div className="testimonial-container">
          <button className="slider-btn prev" onClick={prevTestimonial}>
            <FaArrowLeft />
          </button>
          <div className="testimonial-slider">
            <div className="testimonial-card">
              <div className="quote-mark">"</div>
              <img 
                src={testimonials[currentTestimonial].image} 
                alt={testimonials[currentTestimonial].name} 
                className="testimonial-image"
              />
              <div className="testimonial-stars">
                {Array(testimonials[currentTestimonial].rating).fill().map((_, i) => (
                  <FaStar key={i} className="star-filled" />
                ))}
                {Array(5 - testimonials[currentTestimonial].rating).fill().map((_, i) => (
                  <FaStar key={i + testimonials[currentTestimonial].rating} className="star-empty" />
                ))}
              </div>
              <p className="testimonial-text">{testimonials[currentTestimonial].text}</p>
              <h3 className="testimonial-name">{testimonials[currentTestimonial].name}</h3>
              <p className="testimonial-date">Verified Customer - April 2025</p>
            </div>
          </div>
          <button className="slider-btn next" onClick={nextTestimonial}>
            <FaArrowRight />
          </button>
        </div>
        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button 
              key={index} 
              className={`dot ${currentTestimonial === index ? 'active' : ''}`}
              onClick={() => setCurrentTestimonial(index)}
            ></button>
          ))}
        </div>
      </section>

      {/* Instagram Feed with Modern Layout */}
      <section className="instagram-feed">
        <div className="section-header">
          <h2>Shop Our Instagram</h2>
          <div className="section-line"></div>
        </div>
        <p className="instagram-tagline">Follow Us @NewErodeFancy</p>
        <div className="insta-grid">
          {instagramPosts.map((post, index) => (
            <a key={index} href={post.url} target="_blank" rel="noopener noreferrer" className="insta-post">
              <img src={post.imageUrl || `https://images.unsplash.com/photo-156044239${index}000-fe3b225f8554`} alt={`Instagram Post ${index + 1}`} />
              <div className="insta-overlay">
                <FaInstagram />
                <span>View Post</span>
              </div>
            </a>
          ))}
        </div>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="view-instagram">
          View More on Instagram
        </a>
      </section>

      {/* Newsletter with Gradient Background */}
      <section className="newsletter">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h2>Join Our Beauty Club</h2>
            <p>Subscribe to get special offers, free giveaways, and exclusive deals.</p>
          </div>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <div className="form-group">
              <input type="email" placeholder="Your Email Address" required />
              <button type="submit" className="subscribe-btn">Subscribe</button>
            </div>
            {subscribed && <p className="success-message">Thank you for subscribing! Check your inbox for a special welcome gift.</p>}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-column">
            <h3>New Erode Fancy</h3>
            <p>Elevating your beauty experience since 2010. Quality products for every occasion.</p>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>
          <div className="footer-column">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/makeup">Makeup</Link></li>
              <li><Link to="/skincare">Skincare</Link></li>
              <li><Link to="/perfumes">Perfumes</Link></li>
              <li><Link to="/jewelry">Jewelry</Link></li>
              <li><Link to="/new-arrivals">New Arrivals</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Help</h4>
            <ul>
              <li><Link to="/shipping">Shipping</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/track-order">Track Order</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Contact</h4>
            <address>
              <p>123 Beauty Street</p>
              <p>Erode, Tamil Nadu 638001</p>
              <p>Phone: +91 98765 43210</p>
              <p>Email: info@newerosefancy.com</p>
            </address>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 New Erode Fancy. All rights reserved.</p>
          <div className="payment-icons">
            <img src="/payment-icons/visa.png" alt="Visa" />
            <img src="/payment-icons/mastercard.png" alt="Mastercard" />
            <img src="/payment-icons/paypal.png" alt="PayPal" />
            <img src="/payment-icons/upi.png" alt="UPI" />
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showModal && selectedProduct && (
        <div className="modal">
          <div className="modal-content quick-view-modal">
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <div className="modal-grid">
              <div className="modal-image">
                <img src={selectedProduct.imageUrl || "https://images.unsplash.com/photo-1560972550-aba3456b5564"} alt={selectedProduct.name} />
              </div>
              <div className="modal-details">
                <span className="product-category">Beauty Product</span>
                <h3>{selectedProduct.name}</h3>
                <div className="modal-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < 4 ? "filled" : ""} />
                  ))}
                  <span>(24 reviews)</span>
                </div>
                <p className="modal-price">₹{selectedProduct.price}</p>
                <p className="modal-description">{selectedProduct.description || "Experience the luxury and elegance of our premium beauty products."}</p>
                <div className="quantity-selector">
                  <label>Quantity:</label>
                  <div className="quantity-buttons">
                    <button className="quantity-btn">-</button>
                    <input type="number" min="1" value="1" readOnly />
                    <button className="quantity-btn">+</button>
                  </div>
                </div>
                <div className="modal-actions">
                  <button onClick={() => handleAddToCart(selectedProduct)} className="cta-btn primary">Add to Cart</button>
                  <button 
                    className={`wishlist-btn-large ${wishlist.includes(selectedProduct.name) ? "active" : ""}`}
                    onClick={() => handleWishlistToggle(selectedProduct.name)}
                  >
                    <FaHeart /> {wishlist.includes(selectedProduct.name) ? "In Wishlist" : "Add to Wishlist"}
                  </button>
                </div>
                <div className="product-meta">
                  <p><strong>SKU:</strong> {selectedProduct._id || "NE" + Math.floor(Math.random() * 10000)}</p>
                  <p><strong>Categories:</strong> Beauty, Makeup</p>
                  <p><strong>Tags:</strong> Premium, Bestseller</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Elements */}
      

      <button className="chat-btn" onClick={toggleChat}>
        <FaComment />
        <span>Chat</span>
      </button>
      {isChatOpen && <ChatWidget />}
      {showBackToTop && <button className="back-to-top" onClick={scrollToTop}><FaArrowUp /></button>}
      {showWishlistNotification && <div className="wishlist-notification">Added to Wishlist!</div>}
    </div>
  );
};

export default HomePage;