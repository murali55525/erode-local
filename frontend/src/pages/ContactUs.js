import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  Calendar,
  Send,
  MessageCircle,
  User,
  CheckCircle
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const validateForm = () => {
    let errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
      errors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prevState => ({
        ...prevState,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        setFormSubmitted(true);
        setSubmitting(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }, 1500);
    }
  };

  return (
    <div className="contact-container">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get in Touch</h1>
          <p>We'd love to hear from you! Contact us with any questions or feedback.</p>
        </div>
      </div>
      
      {/* Contact Info Cards */}
      <div id="contact-info-section" className={`contact-info-section animate-section ${isVisible['contact-info-section'] ? 'visible' : ''}`}>
        <div className="info-card">
          <div className="info-icon-wrapper">
            <MapPin className="info-icon" />
          </div>
          <h3>Visit Us</h3>
          <p>51, Sivashanmugam St, near P.S. Park,<br />Erode, Tamil Nadu 638001, India</p>
          <p className="info-note">0.76 km from Erode Junction railway station</p>
        </div>
        
        <div className="info-card">
          <div className="info-icon-wrapper">
            <Phone className="info-icon" />
          </div>
          <h3>Call Us</h3>
          <p className="contact-number">+91 88255 24425</p>
          <button className="contact-action-btn">Call Now</button>
        </div>
        
        <div className="info-card">
          <div className="info-icon-wrapper">
            <Clock className="info-icon" />
          </div>
          <h3>Store Hours</h3>
          <p>Open 7 days a week</p>
          <p className="hours">10:00 AM - 09:00 PM</p>
        </div>
        
        <div className="info-card">
          <div className="info-icon-wrapper">
            <Mail className="info-icon" />
          </div>
          <h3>Email Us</h3>
          <p className="contact-email">contact@newefodefancy.com</p>
          <button className="contact-action-btn">Send Email</button>
        </div>
      </div>
      
      {/* Main Contact Section */}
      <div className="main-contact-section">
        <div id="contact-form-section" className={`contact-form-container animate-section ${isVisible['contact-form-section'] ? 'visible' : ''}`}>
          <div className="form-header">
            <h2>Send Us a Message</h2>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
          </div>
          
          {formSubmitted ? (
            <div className="success-message">
              <div className="success-icon-wrapper">
                <CheckCircle className="success-icon" />
              </div>
              <h3>Message Sent Successfully!</h3>
              <p>Thank you for reaching out to us. We will get back to you soon.</p>
              <button className="reset-btn" onClick={() => setFormSubmitted(false)}>Send Another Message</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    <User size={16} />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={16} />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    <Phone size={16} />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number (optional)"
                    className={formErrors.phone ? 'error' : ''}
                  />
                  {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">
                    <MessageCircle size={16} />
                    <span>Subject *</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    className={formErrors.subject ? 'error' : ''}
                  />
                  {formErrors.subject && <div className="error-message">{formErrors.subject}</div>}
                </div>
              </div>
              
              <div className="form-group full-width">
                <label htmlFor="message">
                  <MessageCircle size={16} />
                  <span>Message *</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="How can we help you?"
                  className={formErrors.message ? 'error' : ''}
                ></textarea>
                {formErrors.message && <div className="error-message">{formErrors.message}</div>}
              </div>
              
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? (
                  <span className="submitting">
                    <span className="loader"></span>
                    Sending...
                  </span>
                ) : (
                  <span>
                    Send Message
                    <Send size={16} />
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
        
        <div id="hours-section" className={`business-hours-container animate-section ${isVisible['hours-section'] ? 'visible' : ''}`}>
          <div className="hours-header">
            <h2>Business Hours</h2>
            <div className="open-indicator">
              <span className="status-dot"></span>
              <span className="status-text">Open Today</span>
            </div>
          </div>
          
          <div className="hours-table">
            <div className="day-row">
              <div className="day">
                <Calendar size={16} />
                <span>Monday</span>
              </div>
              <div className="hours">10:00 AM - 09:00 PM</div>
            </div>
            <div className="day-row">
              <div className="day">
                <Calendar size={16} />
                <span>Tuesday</span>
              </div>
              <div className="hours">10:00 AM - 09:00 PM</div>
            </div>
            <div className="day-row">
              <div className="day">
                <Calendar size={16} />
                <span>Wednesday</span>
              </div>
              <div className="hours">10:00 AM - 09:00 PM</div>
            </div>
            <div className="day-row">
              <div className="day">
                <Calendar size={16} />
                <span>Thursday</span>
              </div>
              <div className="hours">10:00 AM - 09:00 PM</div>
            </div>
            <div className="day-row">
              <div className="day">
                <Calendar size={16} />
                <span>Friday</span>
              </div>
              <div className="hours">10:00 AM - 09:00 PM</div>
            </div>
            <div className="day-row">
              <div className="day">
                <Calendar size={16} />
                <span>Saturday</span>
              </div>
              <div className="hours">10:00 AM - 09:00 PM</div>
            </div>
            <div className="day-row">
              <div className="day">
                <Calendar size={16} />
                <span>Sunday</span>
              </div>
              <div className="hours">10:00 AM - 09:00 PM</div>
            </div>
          </div>
          
          <div className="note-card">
            <h3>Special Note</h3>
            <p>During festival seasons, our store might operate with extended hours. Please call ahead to confirm.</p>
          </div>
        </div>
      </div>
      
      {/* Map Section */}
      <div id="map-section" className={`map-section animate-section ${isVisible['map-section'] ? 'visible' : ''}`}>
        <h2 className="section-title">Find Us</h2>
        
        <div className="map-container">
          <div className="interactive-map">
            {/* Placeholder for Google Map */}
            <div className="map-placeholder">
              <div className="map-point">
                <MapPin size={30} className="map-marker" />
                <div className="pulse-effect"></div>
              </div>
            </div>
          </div>
          
          <div className="map-direction">
            <h3>Get Directions</h3>
            <p className="direction-text">
              Our store is conveniently located near P.S. Park, just 0.76 kilometers away from Erode Junction railway station.
            </p>
            <div className="direction-steps">
              <div className="step">
                <div className="step-number">1</div>
                <p>From Erode Junction, head east on Sivashanmugam Street</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <p>Continue for about 0.7 kilometers</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <p>Look for our store near P.S. Park on your right</p>
              </div>
            </div>
            <button className="map-btn">Open in Google Maps</button>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div id="contact-faq-section" className={`contact-faq-section animate-section ${isVisible['contact-faq-section'] ? 'visible' : ''}`}>
        <h2 className="section-title">Frequently Asked Questions</h2>
        
        <div className="faq-grid">
          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>We accept cash, all major credit cards, UPI, and digital wallets including Paytm, Google Pay, and PhonePe.</p>
          </div>
          
          <div className="faq-item">
            <h3>Do you offer home delivery?</h3>
            <p>Yes, we offer home delivery services within Erode city limits. For orders outside the city, additional shipping charges may apply.</p>
          </div>
          
          <div className="faq-item">
            <h3>What is your return policy?</h3>
            <p>We have a 7-day return policy for unused items in their original packaging with receipt. Some items like cosmetics may have specific return conditions.</p>
          </div>
          
          <div className="faq-item">
            <h3>Do you offer gift wrapping?</h3>
            <p>Yes, we provide complimentary gift wrapping services for all purchases. Premium gift wrapping options are available at an additional cost.</p>
          </div>
          
          <div className="faq-item">
            <h3>Do you have a loyalty program?</h3>
            <p>Yes, our loyalty program rewards frequent shoppers with exclusive discounts and early access to new arrivals. Ask our staff for details.</p>
          </div>
          
          <div className="faq-item">
            <h3>Can I place an order by phone?</h3>
            <p>Absolutely! You can place orders by calling us at +91 88255 24425 during our business hours.</p>
          </div>
        </div>
      </div>
      
      {/* Newsletter Section */}
      <div id="newsletter-section" className={`newsletter-section animate-section ${isVisible['newsletter-section'] ? 'visible' : ''}`}>
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for the latest updates, offers, and promotions.</p>
          
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button className="subscribe-btn">Subscribe</button>
          </div>
          
          <p className="privacy-note">By subscribing, you agree to receive marketing communications from us. Don't worry, we respect your privacy and won't share your information.</p>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="contact-cta-section">
        <div className="cta-container">
          <h2>Ready to Explore Our Collection?</h2>
          <p>Visit our store today or call us to learn more about our products.</p>
          <div className="cta-buttons">
            <button className="cta-primary">Visit Our Store</button>
            <button className="cta-secondary">View Products</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;