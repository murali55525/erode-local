import { useState, useEffect, useCallback, useRef } from "react";
import {
  Heart,
  Star,
  ArrowUp,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  ChevronRight,
  CheckCircle,
  Truck,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import ChatAssistant from './chatbot';

const HomePage = () => {
  const [dealOfTheDay, setDealOfTheDay] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setTimeout(() => {
      if (!isMounted.current) return;
      setDealOfTheDay({
        _id: "deal123",
        name: "Rose Petal Perfume",
        price: 799,
        imageUrl:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=60",
      });
      setTestimonials([
        {
          name: "Priya S.",
          rating: 5,
          text: "The lipsticks are vibrant and long-lasting!",
          image: "https://randomuser.me/api/portraits/women/44.jpg",
        },
        {
          name: "Arjun K.",
          rating: 4,
          text: "Great perfumes with amazing lasting power!",
          image: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        {
          name: "Meera R.",
          rating: 5,
          text: "Best place for rental jewelry!",
          image: "https://randomuser.me/api/portraits/women/68.jpg",
        },
      ]);
      setLoading(false);
    }, 800);

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isMounted.current) return;
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    const handleScroll = () => {
      if (!isMounted.current) return;
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function calculateTimeLeft() {
    const endDate = new Date("2025-06-30T00:00:00");
    const now = new Date();
    const difference = endDate - now;
    if (difference <= 0)
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="text-yellow-500 w-5 h-5 fill-yellow-500" />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="text-gray-300 w-5 h-5" />
        ))}
      </div>
    );
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading beautiful things for you...</p>
      </div>
    );

  return (
    <div className="matte-bg">
      {/* Hero Section with Background Image */}
      <div 
        className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1920&q=80")',
          backgroundColor: '#234781'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
            New Erode Fancy
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Your premium destination for fashion and beauty in Erode
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/shop"
              className="bg-white text-blue-700 px-8 py-3 rounded-full font-semibold hover:bg-blue-100 transition-colors transform hover:scale-105"
            >
              Shop Now
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Badges - Update position */}
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 -mt-12 px-4 mb-16 relative z-10">
        {[
          { icon: <CheckCircle className="w-6 h-6" />, text: "Premium Quality" },
          { icon: <Truck className="w-6 h-6" />, text: "Free Shipping" },
          { icon: <Award className="w-6 h-6" />, text: "Since 2005" },
        ].map((badge, index) => (
          <div key={index} className="matte-card flex items-center px-6 py-4">
            <div className="text-blue-700 mr-3">{badge.icon}</div>
            <span className="text-gray-800 font-medium">{badge.text}</span>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="matte-section max-w-7xl mx-auto my-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Our Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Cosmetics', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=60' },
            { name: 'Jewelry', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=60' },
            { name: 'Accessories', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=500&q=60' }
          ].map(category => (
            <div key={category.name} className="group relative rounded-xl overflow-hidden shadow-lg">
              <div className="aspect-square relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent z-10"></div>
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                <Link
                  to={`/shop?category=${category.name.toLowerCase()}`}
                  className="inline-flex items-center text-white group-hover:underline transition-all"
                >
                  View Collection <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deal of the Day */}
      {dealOfTheDay && (
        <section className="matte-section max-w-7xl mx-auto my-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Deal of the Day</h2>
            <div className="inline-block w-24 h-1 bg-blue-700 mb-4"></div>
          </div>
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="relative w-full lg:w-1/2">
              <img
                src={dealOfTheDay.imageUrl}
                alt={dealOfTheDay.name}
                className="rounded-xl shadow-2xl"
              />
              <span className="absolute top-4 left-4 bg-blue-700 text-white px-4 py-2 rounded-full font-bold shadow-lg">SALE</span>
            </div>
            <div className="w-full lg:w-1/2 space-y-6">
              <span className="block text-sm text-blue-700 font-semibold uppercase">Exclusive Offer</span>
              <h3 className="text-3xl font-bold text-gray-800">{dealOfTheDay.name}</h3>
              {renderStars(4)}
              <p className="text-gray-700">
                This limited edition collection brings you the finest quality at an unbeatable price. Perfect for everyday use or as a special gift.
              </p>
              <p className="text-xl font-bold text-gray-800">
                ₹{dealOfTheDay.price}
                <span className="line-through text-gray-500 ml-2">₹{dealOfTheDay.price + 200}</span>
                <span className="text-green-500 ml-2">30% OFF</span>
              </p>
              <div className="flex gap-4 mt-4">
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">{timeLeft.days}</span>
                  <p className="text-gray-600">Days</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">{timeLeft.hours}</span>
                  <p className="text-gray-600">Hours</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">{timeLeft.minutes}</span>
                  <p className="text-gray-600">Mins</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">{timeLeft.seconds}</span>
                  <p className="text-gray-600">Secs</p>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button className="px-6 py-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-all">Buy Now</button>
                <button className="px-6 py-3 border-2 border-blue-700 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition-all">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">What Our Customers Say</h2>
            <div className="inline-block w-24 h-1 bg-blue-700 mb-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100">
                <div className="flex items-center mb-4">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-800">{t.name}</h4>
                    <div className="flex text-yellow-500">
                      {renderStars(t.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Info */}
      <section className="bg-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Visit Our Store</h2>
            <div className="inline-block w-24 h-1 bg-white mb-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-xl">
              <MapPin className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Find Us</h3>
              <p className="text-blue-100">51, Sivashanmugam St, near P.S. Park, Erode, Tamil Nadu 638001</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-xl">
              <Clock className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Store Hours</h3>
              <p className="text-blue-100">Mon - Sat: 10:00 AM - 8:00 PM</p>
              <p className="text-blue-100">Sunday: 11:00 AM - 6:00 PM</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-xl">
              <Phone className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">Contact</h3>
              <p className="text-blue-100">Phone: +91 98765 43210</p>
              <p className="text-blue-100">Email: info@neweroderfancy.com</p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link 
              to="/contact"
              className="bg-white text-blue-700 px-8 py-3 rounded-full font-semibold hover:bg-blue-100 transition-colors"
            >
              Get Directions
            </Link>
          </div>
        </div>
      </section>

      {/* Categories - Extended Grid */}
      <div className="matte-section max-w-7xl mx-auto my-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Our Complete Collection</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[
            { name: 'Lipstick', icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=500&q=60' },
            { name: 'Nail Polish', icon: 'Palette', image: 'https://images.unsplash.com/photo-1607779097040-26e80aa4489f?auto=format&fit=crop&w=500&q=60' },
            { name: 'Perfumes', icon: 'Droplet', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=500&q=60' },
            { name: 'Necklace', icon: 'Gem', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=60' },
            { name: 'Bangles', icon: 'Gem', image: 'https://images.unsplash.com/photo-1535632787501-702f5e590c25?auto=format&fit=crop&w=500&q=60' },
            { name: 'Watches', icon: 'Watch', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=60' },
            { name: 'Gift Items', icon: 'Gift', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=60' },
            { name: 'Skin Care', icon: 'Droplet', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=60' },
            { name: 'Shoes', icon: 'ShoppingBag', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=500&q=60' },
            { name: 'Bags', icon: 'ShoppingBag', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=60' }
          ].map(category => (
            <Link
              key={category.name}
              to={`/shop?category=${category.name.toLowerCase()}`}
              className="group relative rounded-xl overflow-hidden shadow-lg transform transition-all duration-500 hover:-translate-y-2"
            >
              <div className="aspect-square relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent z-10"></div>
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20">
                  <h3 className="text-lg font-bold mb-1">{category.name}</h3>
                  <div className="flex items-center text-sm text-white/80">
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    <span>View Products</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

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
              <p className="flex items-center"><Mail size={16} className="mr-2" /> info@newerodfancy.com</p>
            </address>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400">© 2025 New Erode Fancy. All rights reserved.</p>
        </div>
      </footer>

      {/* Chatbot */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-8 z-50">
          <ChatAssistant />
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-700 text-white rounded-full flex flex-col items-center justify-center shadow-lg hover:bg-blue-800 transition-all z-50"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="text-xs mt-1">Chat</span>
      </button>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 w-12 h-12 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:text-white transition-all z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default HomePage;