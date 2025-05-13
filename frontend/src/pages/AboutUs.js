import { useState, useEffect, useRef } from "react";
import { 
  Award, 
  Users, 
  ThumbsUp, 
  Clock, 
  Heart, 
  Instagram, 
  Facebook, 
  Twitter, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  Star,
  MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import ChatAssistant from './chatbot';

const AboutPage = () => {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    // Simulate loading data
    setTimeout(() => {
      if (!isMounted.current) return;
      
      setTeam([
        {
          name: "Priya Sharma",
          position: "Founder & CEO",
          image: "https://randomuser.me/api/portraits/women/44.jpg",
          bio: "Priya founded New Erode Fancy in 2005 with a vision to bring premium quality beauty products to Erode."
        },
        {
          name: "Rajan Kumar",
          position: "Head of Merchandising",
          image: "https://randomuser.me/api/portraits/men/32.jpg",
          bio: "With over 15 years in retail, Rajan ensures we source only the finest products for our customers."
        },
        {
          name: "Meera Rajesh",
          position: "Customer Experience Manager",
          image: "https://randomuser.me/api/portraits/women/68.jpg",
          bio: "Meera leads our customer service team, ensuring every visit to our store is delightful."
        }
      ]);

      setMilestones([
        { year: "2005", event: "New Erode Fancy founded in Sivashanmugam Street" },
        { year: "2010", event: "Expanded store space and introduced jewelry collection" },
        { year: "2015", event: "Launched exclusive cosmetics line" },
        { year: "2020", event: "Started online operations" },
        { year: "2025", event: "Celebrating 20 years of beauty excellence" }
      ]);
      
      setLoading(false);
    }, 800);

    return () => {
      isMounted.current = false;
    };
  }, []);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading our story...</p>
      </div>
    );

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div 
        className="relative min-h-[500px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1920&q=80")',
          backgroundColor: '#234781'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Bringing beauty and elegance to Erode since 2005
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link 
              to="/shop" 
              className="bg-white text-blue-700 px-8 py-3 rounded-full font-semibold hover:bg-blue-100 transition-colors transform hover:scale-105"
            >
              Shop Now
            </Link>
            <Link 
              to="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Our Mission */}
      <section className="matte-section max-w-7xl mx-auto my-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Our Mission</h2>
          <div className="inline-block w-24 h-1 bg-blue-700 mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            To provide premium quality beauty products and accessories that enhance confidence and celebrate individuality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center p-6 rounded-xl hover:shadow-xl transition-all border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Quality First</h3>
            <p className="text-gray-600">
              We source only the finest products, ensuring everything we offer meets our high standards.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-xl hover:shadow-xl transition-all border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Customer Care</h3>
            <p className="text-gray-600">
              Our customers are at the heart of everything we do, with service that exceeds expectations.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-xl hover:shadow-xl transition-all border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Community Impact</h3>
            <p className="text-gray-600">
              We're proud to support local causes and contribute to the Erode community.
            </p>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="matte-section max-w-7xl mx-auto my-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Our Journey</h2>
          <div className="inline-block w-24 h-1 bg-blue-700 mb-6"></div>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
          
          {/* Timeline Items */}
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className={`flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="md:w-1/2"></div>
                <div className="hidden md:flex justify-center items-center">
                  <div className="w-8 h-8 bg-blue-700 rounded-full z-10 border-4 border-white"></div>
                </div>
                <div className="md:w-1/2 md:pr-8 md:pl-8">
                  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all">
                    <span className="text-blue-700 font-bold text-lg">{milestone.year}</span>
                    <h3 className="text-xl font-semibold text-gray-800 mt-2">{milestone.event}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="matte-section max-w-7xl mx-auto my-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Meet Our Team</h2>
          <div className="inline-block w-24 h-1 bg-blue-700 mb-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
              <div className="h-64 overflow-hidden">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                <p className="text-blue-700 font-medium mb-3">{member.position}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brands We Carry */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Brands We Carry</h2>
            <div className="inline-block w-24 h-1 bg-blue-700 mb-6"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((brand) => (
              <div key={brand} className="bg-white p-8 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                  <p className="font-medium text-gray-800">Brand {brand}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Highlight */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2">What Our Customers Say</h2>
            <div className="inline-block w-24 h-1 bg-white mb-6"></div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="text-6xl font-serif text-blue-400 absolute -top-10 left-0">"</div>
              <p className="text-xl italic mb-6">
                New Erode Fancy has been my go-to store for all beauty needs for over a decade. 
                Their products are authentic, staff is knowledgeable, and the ambiance is welcoming.
              </p>
              <div className="flex justify-center">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-300 w-5 h-5 fill-yellow-300" />
                  ))}
                </div>
              </div>
              <p className="font-bold text-lg">Lakshmi Devi</p>
              <p className="text-blue-200">Loyal Customer since 2010</p>
            </div>
            
            <Link to="/testimonials" className="inline-block mt-8 bg-white text-blue-700 px-6 py-2 rounded-full font-semibold hover:bg-blue-100 transition-colors">
              Read More Testimonials
            </Link>
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

      {/* Chat Window - Add implementation */}
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

export default AboutPage;