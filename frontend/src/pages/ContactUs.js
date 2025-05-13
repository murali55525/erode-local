import { useState } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Heart,
  MessageCircle, 
  Send,
  CheckCircle,
  Instagram, 
  Facebook, 
  Twitter 
} from "lucide-react";
import { Link } from "react-router-dom";
import ChatAssistant from './chatbot';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      
      // Reset form after showing success message
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        });
      }, 3000);
    }, 1500);
  };

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div 
        className="relative min-h-[300px] sm:min-h-[400px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=1920&q=80")',
          backgroundColor: '#234781'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg">
            Get In Touch
          </h1>
          <p className="text-base sm:text-xl md:text-2xl mb-4 sm:mb-8 text-white/90 max-w-2xl mx-auto">
            We'd love to hear from you. Contact us for any inquiries, feedback, or assistance.
          </p>
        </div>
      </div>

      {/* Contact Form & Info */}
      <section className="matte-section max-w-7xl mx-auto my-8 sm:my-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Information */}
          <div className="matte-card p-4 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Contact Information</h2>
            <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                  <MapPin className="text-blue-700 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Store Location</h3>
                  <p className="text-gray-600 text-sm sm:text-base">51, Sivashanmugam St, near P.S. Park, Erode, Tamil Nadu 638001</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                  <Phone className="text-blue-700 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Phone Number</h3>
                  <p className="text-gray-600">+91 98765 43210</p>
                  <p className="text-gray-600">+91 99887 76655</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                  <Mail className="text-blue-700 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Email Address</h3>
                  <p className="text-gray-600">info@neweroderfancy.com</p>
                  <p className="text-gray-600">support@neweroderfancy.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                  <Clock className="text-blue-700 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Opening Hours</h3>
                  <p className="text-gray-600">Monday - Saturday: 10:00 AM - 8:00 PM</p>
                  <p className="text-gray-600">Sunday: 11:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-3">Follow Us</h3>
              <div className="flex space-x-3 sm:space-x-4">
                <a href="#" className="bg-blue-700 hover:bg-blue-800 text-white p-2 sm:p-3 rounded-full transition-colors">
                  <Instagram size={18} className="sm:w-5 sm:h-5 w-4 h-4" />
                </a>
                <a href="#" className="bg-blue-700 hover:bg-blue-800 text-white p-2 sm:p-3 rounded-full transition-colors">
                  <Facebook size={18} className="sm:w-5 sm:h-5 w-4 h-4" />
                </a>
                <a href="#" className="bg-blue-700 hover:bg-blue-800 text-white p-2 sm:p-3 rounded-full transition-colors">
                  <Twitter size={18} className="sm:w-5 sm:h-5 w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="matte-card p-4 sm:p-8">
            {submitted ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl z-10">
                <div className="text-green-500 mb-4">
                  <CheckCircle size={48} className="sm:w-16 sm:h-16 w-12 h-12" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                <p className="text-gray-600 text-center px-4">
                  Your message has been sent successfully. We'll get back to you soon.
                </p>
              </div>
            ) : null}
            
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="matte-input w-full mb-2 sm:mb-4 text-sm sm:text-base py-2.5 sm:py-3"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="matte-input w-full mb-2 sm:mb-4 text-sm sm:text-base py-2.5 sm:py-3"
                    placeholder="Your email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="matte-input w-full mb-2 sm:mb-4 text-sm sm:text-base py-2.5 sm:py-3"
                    placeholder="Your phone (optional)"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="matte-input w-full mb-2 sm:mb-4 text-sm sm:text-base py-2.5 sm:py-3"
                    placeholder="Subject of your message"
                    required
                  />
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <label htmlFor="message" className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Your Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="matte-input w-full mb-2 sm:mb-4 text-sm sm:text-base py-2.5 sm:py-3"
                  placeholder="How can we help you?"
                  required
                ></textarea>
              </div>

              <div className="flex items-center mb-4 sm:mb-6">
                <input type="checkbox" id="privacy" className="mr-2" required />
                <label htmlFor="privacy" className="text-gray-700">
                  I agree to the <Link to="/privacy" className="text-blue-700 hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="matte-button w-full py-2.5 sm:py-3 text-sm sm:text-base mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                )}
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section - Adjust layout for mobile */}
      <section className="matte-section max-w-7xl mx-auto my-8 sm:my-16 px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Find Us</h2>
          <div className="inline-block w-16 sm:w-24 h-1 bg-blue-700 mb-4 sm:mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-8 text-sm sm:text-base">
            Visit our store in Erode for personalized beauty consultations and exclusive in-store offers.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Google Maps Embed */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[300px] sm:h-[400px] order-2 md:order-1">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.172294415799!2d77.71720931744384!3d11.341036799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f4d4c1ba175%3A0x8c8dc06148e4a5ba!2sSivashanmugam%20St%2C%20Erode%2C%20Tamil%20Nadu%20638001!5e0!3m2!1sen!2sin!4v1647800000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-xl"
            ></iframe>
          </div>

          {/* Store Information */}
          <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg order-1 md:order-2">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                  <MapPin className="text-blue-700 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Store Address</h3>
                  <p className="text-gray-600 text-sm sm:text-base">51, Sivashanmugam St, near P.S. Park</p>
                  <p className="text-gray-600 text-sm sm:text-base">Erode, Tamil Nadu 638001</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                  <Clock className="text-blue-700 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Opening Hours</h3>
                  <p className="text-gray-600">Monday - Saturday: 10:00 AM - 8:00 PM</p>
                  <p className="text-gray-600">Sunday: 11:00 AM - 6:00 PM</p>
                </div>
              </div>

              <a 
                href="https://www.google.com/maps/dir//Sivashanmugam+St,+Erode,+Tamil+Nadu+638001/@11.3410368,77.7172093,17z/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-800 transition-colors text-sm sm:text-base"
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="matte-section max-w-7xl mx-auto my-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Frequently Asked Questions</h2>
          <div className="inline-block w-24 h-1 bg-blue-700 mb-6"></div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {[
            { 
              question: "Do you offer international shipping?", 
              answer: "Yes, we offer international shipping to select countries. Shipping rates vary based on destination. Please check our shipping policy for more details." 
            },
            { 
              question: "What is your return policy?", 
              answer: "We accept returns within 14 days of purchase if the product is unused and in its original packaging. For hygiene reasons, we cannot accept returns on opened cosmetic products." 
            },
            { 
              question: "Do you offer gift wrapping?", 
              answer: "Yes, we offer complimentary gift wrapping for all purchases. You can select this option during checkout." 
            },
            { 
              question: "How can I track my order?", 
              answer: "Once your order is shipped, you will receive a tracking number via email. You can use this number to track your package on our website." 
            }
          ].map((faq, index) => (
            <div key={index} className="mb-6 border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
          
          <div className="mt-8 text-center">
            <p className="text-gray-700 mb-4">Still have questions?</p>
            <Link 
              to="/faq" 
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium inline-block"
            >
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-10 sm:py-16 bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">
                Stay updated with our latest products, special offers, and beauty tips. Join our community today!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-grow px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-800 focus:outline-none text-sm sm:text-base"
                />
                <button className="bg-blue-900 hover:bg-blue-950 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium whitespace-nowrap text-sm sm:text-base">
                  Subscribe
                </button>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 mt-2 sm:mt-3">
                By subscribing, you agree to receive marketing emails from us. Don't worry, we'll never spam you.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full opacity-30"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500 rounded-full opacity-30"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold">Exclusive Offers</h3>
                        <p className="text-blue-200 text-sm">Be the first to know</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold">Beauty Tips</h3>
                        <p className="text-blue-200 text-sm">Expert advice weekly</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold">New Arrivals</h3>
                        <p className="text-blue-200 text-sm">Stay updated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-6">
          <div>
            <h3 className="text-xl font-bold mb-4">New Erode Fancy</h3>
            <p className="text-gray-400">Elevating your beauty experience since 2005. Quality products for every occasion.</p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Shop</h4>
            <ul className="text-gray-400 space-y-2">
              <li><Link to="/makeup" className="hover:text-white">Makeup</Link></li>
              <li><Link to="/skincare" className="hover:text-white">Skincare</Link></li>
              <li><Link to="/perfumes" className="hover:text-white">Perfumes</Link></li>
              <li><Link to="/jewelry" className="hover:text-white">Jewelry</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Help</h4>
            <ul className="text-gray-400 space-y-2">
              <li><Link to="/shipping" className="hover:text-white">Shipping</Link></li>
              <li><Link to="/returns" className="hover:text-white">Returns</Link></li>
              <li><Link to="/track-order" className="hover:text-white">Track Order</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Contact</h4>
            <address className="text-gray-400 not-italic space-y-2">
              <p className="flex items-center"><MapPin size={16} className="mr-2" /> 51, Sivashanmugam St, Erode</p>
              <p className="flex items-center"><Phone size={16} className="mr-2" /> +91 98765 43210</p>
              <p className="flex items-center"><Mail size={16} className="mr-2" /> info@neweroderfancy.com</p>
            </address>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400">© 2025 New Erode Fancy. All rights reserved.</p>
        </div>
      </footer>

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-700 text-white rounded-full flex flex-col items-center justify-center shadow-lg hover:bg-blue-800 transition-all z-50"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="text-xs mt-1">Chat</span>
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-8 w-80 h-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold">Customer Support</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">×</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="bg-blue-100 p-3 rounded-lg rounded-tl-none mb-4 max-w-3/4">
              Hello! How can we help you today?
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 flex">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 border border-gray-300 rounded-l-full px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            <button className="bg-blue-700 text-white rounded-r-full px-4 py-2 hover:bg-blue-800">
              Send
            </button>
          </div>
        </div>
      )}

      {/* Add Chatbot */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-8 z-50">
          <ChatAssistant />
        </div>
      )}
    </div>
  );
};

export default ContactPage;