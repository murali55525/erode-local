import React, { useState, useEffect } from 'react';
import './AboutUs.css';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  ShoppingBag,
  Gift,
  Diamond,
  Heart,
  Award,
  Users,
  Truck,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const About = () => {
  const [activeTab, setActiveTab] = useState('story');
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.animate-section').forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="stars-container">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="star-icon filled" />
        ))}
        {halfStar && <Star className="star-icon half-filled" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="star-icon" />
        ))}
      </div>
    );
  };

  const categoryItems = [
    { icon: <ShoppingBag />, title: "Cosmetics", description: "Premium makeup and skincare products from trusted brands" },
    { icon: <ShoppingBag />, title: "Bags", description: "Stylish handbags, backpacks, and accessories for all occasions" },
    { icon: <Diamond />, title: "Costume Jewelry", description: "Trendy accessories to complete your fashion statement" },
    { icon: <Gift />, title: "Gift Items", description: "Unique presents for your loved ones for every special occasion" },
    { icon: <Diamond />, title: "Jewelry", description: "Elegant pieces to add sparkle to your everyday look" },
    { icon: <Heart />, title: "Wedding Essentials", description: "Everything you need for your special day in one place" }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to <span className="highlight">NEW ERODE FANCY</span></h1>
          <p className="hero-subtitle">Your premium destination for fashion, beauty, and gifts in Erode</p>
          <div className="rating-banner">
            <div className="rating-stars">
              {renderStars(3.9)}
              <span className="rating-number">3.9/5</span>
            </div>
            <div className="rating-divider"></div>
            <div className="review-count">
              <Users className="review-icon" />
              <span>157 Customer Reviews</span>
            </div>
          </div>
          <div className="hero-badges">
            <div className="badge">
              <CheckCircle className="badge-icon" />
              <span>Premium Quality</span>
            </div>
            <div className="badge">
              <Truck className="badge-icon" />
              <span>Local Delivery</span>
            </div>
            <div className="badge">
              <Award className="badge-icon" />
              <span>Since 2005</span>
            </div>
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-image">
            {/* Placeholder for store image */}
            <div className="placeholder-image"></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'story' ? 'active' : ''}`}
          onClick={() => setActiveTab('story')}
        >
          Our Story
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`tab-button ${activeTab === 'visit' ? 'active' : ''}`}
          onClick={() => setActiveTab('visit')}
        >
          Visit Us
        </button>
        <button 
          className={`tab-button ${activeTab === 'faqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('faqs')}
        >
          FAQs
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Our Story */}
        <div className={`tab-pane ${activeTab === 'story' ? 'active' : ''}`}>
          <div id="story-section" className={`animate-section ${isVisible['story-section'] ? 'visible' : ''}`}>
            <h2 className="section-title">Our Story</h2>
            <div className="story-content">
              <p className="featured-text">
                For over a decade, NEW ERODE FANCY has been the premier destination for cosmetics, 
                fashion accessories, and wedding essentials in Erode, Tamil Nadu. We take pride in offering 
                a diverse collection of high-quality products that cater to the style needs of our community.
              </p>
              
              <div className="story-cards">
                <div className="story-card">
                  <h3>Our Mission</h3>
                  <p>
                    To provide our customers with quality products that enhance their style and confidence, 
                    while offering exceptional service in a welcoming environment.
                  </p>
                </div>
                
                <div className="story-card">
                  <h3>Our Values</h3>
                  <p>
                    Quality, diversity, customer satisfaction, and community engagement are the pillars 
                    that guide our business philosophy.
                  </p>
                </div>
                
                <div className="story-card">
                  <h3>Our Promise</h3>
                  <p>
                    We are committed to staying current with fashion trends and ensuring our inventory 
                    meets the evolving needs of our valued customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className={`tab-pane ${activeTab === 'products' ? 'active' : ''}`}>
          <div id="products-section" className={`animate-section ${isVisible['products-section'] ? 'visible' : ''}`}>
            <h2 className="section-title">Our Products</h2>
            <p className="section-description">
              Discover our wide range of products carefully selected to meet your style and gift needs.
            </p>
            
            <div className="category-grid">
              {categoryItems.map((item, index) => (
                <div key={index} className="category-card">
                  <div className="category-icon">
                    {item.icon}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <button className="category-btn">
                    Explore <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="featured-products">
              <h3 className="featured-heading">Featured Collections</h3>
              <div className="featured-grid">
                <div className="featured-item">
                  <div className="featured-image"></div>
                  <h4>Wedding Collection</h4>
                  <p>Everything for your special day</p>
                </div>
                <div className="featured-item">
                  <div className="featured-image"></div>
                  <h4>Seasonal Gifts</h4>
                  <p>Perfect presents for every occasion</p>
                </div>
                <div className="featured-item">
                  <div className="featured-image"></div>
                  <h4>Fashion Accessories</h4>
                  <p>Complete your look with our accessories</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visit Us */}
        <div className={`tab-pane ${activeTab === 'visit' ? 'active' : ''}`}>
          <div id="visit-section" className={`animate-section ${isVisible['visit-section'] ? 'visible' : ''}`}>
            <h2 className="section-title">Visit Our Store</h2>
            
            <div className="store-info-container">
              <div className="store-details">
                <div className="info-card">
                  <MapPin className="info-icon" />
                  <div className="info-content">
                    <h3>Location</h3>
                    <p>51, Sivashanmugam St, near P.S. Park, Erode, Tamil Nadu 638001, India</p>
                    <p className="info-note">0.76 km from Erode Junction railway station</p>
                  </div>
                </div>
                
                <div className="info-card">
                  <Clock className="info-icon" />
                  <div className="info-content">
                    <h3>Opening Hours</h3>
                    <p>Open 7 days a week</p>
                    <p className="hours">10:00 AM - 09:00 PM</p>
                  </div>
                </div>
                
                <div className="info-card">
                  <Phone className="info-icon" />
                  <div className="info-content">
                    <h3>Contact</h3>
                    <p>+91 88255 24425</p>
                    <button className="call-btn">Call Now</button>
                  </div>
                </div>
              </div>
              
              <div className="store-map">
                <div className="map-container">
                  {/* Placeholder for Google Map */}
                  <div className="map-placeholder">
                    <div className="map-marker">
                      <MapPin size={24} />
                    </div>
                    <div className="map-tooltip">
                      <h4>NEW ERODE FANCY</h4>
                      <p>51, Sivashanmugam St, near P.S. Park</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="store-gallery">
              <h3>Store Gallery</h3>
              <div className="gallery-grid">
                <div className="gallery-item"></div>
                <div className="gallery-item"></div>
                <div className="gallery-item"></div>
                <div className="gallery-item"></div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className={`tab-pane ${activeTab === 'faqs' ? 'active' : ''}`}>
          <div id="faqs-section" className={`animate-section ${isVisible['faqs-section'] ? 'visible' : ''}`}>
            <h2 className="section-title">Frequently Asked Questions</h2>
            
            <div className="faq-container">
              <div className="faq-item">
                <h3>Where is NEW ERODE FANCY located?</h3>
                <div className="faq-answer">
                  <p>NEW ERODE FANCY is located at 51, Sivashanmugam St, near P.S. Park, Erode, Tamil Nadu 638001, India.</p>
                </div>
              </div>
              
              <div className="faq-item">
                <h3>What is the contact number for NEW ERODE FANCY?</h3>
                <div className="faq-answer">
                  <p>The contact number for NEW ERODE FANCY is +91 88255 24425.</p>
                </div>
              </div>
              
              <div className="faq-item">
                <h3>What are the operating hours for NEW ERODE FANCY?</h3>
                <div className="faq-answer">
                  <p>NEW ERODE FANCY is open 7 days a week from 10:00 AM to 09:00 PM.</p>
                </div>
              </div>
              
              <div className="faq-item">
                <h3>What is the nearest railway station from NEW ERODE FANCY?</h3>
                <div className="faq-answer">
                  <p>Erode Junction railway station is the nearest railway station to NEW ERODE FANCY. It is nearly 0.76 kilometers away from it.</p>
                </div>
              </div>
              
              <div className="faq-item">
                <h3>Do you offer home delivery services?</h3>
                <div className="faq-answer">
                  <p>Yes, we offer home delivery services within Erode city. Please contact us for more details.</p>
                </div>
              </div>
              
              <div className="faq-item">
                <h3>Do you accept returns or exchanges?</h3>
                <div className="faq-answer">
                  <p>Yes, we have a 7-day return policy for unused items with original packaging and receipt.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials-section" className={`animate-section ${isVisible['testimonials-section'] ? 'visible' : ''}`}>
        <h2 className="section-title">Customer Testimonials</h2>
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="testimonial-rating">
              {renderStars(4)}
            </div>
            <p className="testimonial-text">
              "Great collection of wedding accessories. The staff helped me find everything I needed for my wedding."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Priya Rajan</h4>
                <p>Loyal Customer</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-rating">
              {renderStars(5)}
            </div>
            <p className="testimonial-text">
              "The quality of cosmetics here is exceptional. I always find what I'm looking for at reasonable prices."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Arun Kumar</h4>
                <p>Regular Customer</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-rating">
              {renderStars(4)}
            </div>
            <p className="testimonial-text">
              "Their gift collection is unique. I always shop here for birthday and anniversary gifts."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Lakshmi Venkat</h4>
                <p>Frequent Shopper</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Explore Our Collection?</h2>
          <p>Visit our store today or contact us for more information about our products.</p>
          <div className="cta-buttons">
            <button className="cta-btn primary">Visit Our Store</button>
            <button className="cta-btn secondary">Contact Us</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;