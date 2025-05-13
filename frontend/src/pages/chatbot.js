import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Enhanced category keywords with variations and synonyms
const CATEGORY_KEYWORDS = {
  'lipstick': {
    category: 'Lipstick',
    keywords: ['lipstick', 'lip color', 'lip stick', 'lip wear']
  },
  'nail polish': {
    category: 'Nail Polish',
    keywords: ['nail polish', 'nail paint', 'nail color', 'nail enamel']
  },
  'perfume': {
    category: 'Perfumes',
    keywords: ['perfume', 'fragrance', 'scent', 'spray']
  },
  'necklace': {
    category: 'Necklace',
    keywords: ['necklace', 'chain', 'pendant', 'neck piece']
  },
  'bangles': {
    category: 'Bangles',
    keywords: ['bangle', 'bracelet', 'kada', 'wrist wear']
  },
  'watch': {
    category: 'Watches',
    keywords: ['watch', 'timepiece', 'wristwatch']
  },
  'shoes': {
    category: 'Shoes',
    keywords: ['shoe', 'footwear', 'sandal', 'sneaker', 'boot']
  },
  'slippers': {
    category: 'Slippers',
    keywords: ['slipper', 'flip flop', 'sandal', 'slip on']
  },
  'bags': {
    category: 'Bag Items',
    keywords: ['bag', 'handbag', 'purse', 'backpack', 'clutch']
  }
};

// Advanced response generator with sentiment analysis and context awareness
const getAIResponse = async (message, previousMessages = []) => {
  const lowerMessage = message.toLowerCase();
  
  // Add typing delay for more natural feel
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check for greetings
  if (/^(hi|hello|hey|greetings|howdy)/i.test(message)) {
    return { 
      text: "Hello! Welcome to Fancy Store. How can I help you today?",
      suggestions: ['Show me products', 'Track my order', 'Contact support']
    };
  }
  
  // Find matching category based on keywords with improved matching
  const matchedCategory = Object.entries(CATEGORY_KEYWORDS).find(([_, data]) => 
    data.keywords.some(keyword => lowerMessage.includes(keyword))
  );

  if (matchedCategory) {
    try {
      const category = matchedCategory[1].category;
      const response = await axios.get(`http://localhost:5000/api/products?category=${category}`);
      const products = response.data.filter(p => p.category === category).slice(0, 3);

      if (products.length === 0) {
        return {
          text: `I couldn't find any ${category} products at the moment. Would you like to see other categories?`,
          suggestions: ['Show all categories', 'Show similar products'],
          action: 'noProducts'
        };
      }

      return {
        text: `Here are some ${category} products you might like:`,
        products: products.map(p => ({
          name: p.name,
          price: `₹${p.price}`,
          link: `/shop?category=${category}`,
          imageId: p.imageId,
          id: p._id
        })),
        category: category,
        action: 'showProducts',
        suggestions: ['Show more', 'View details', 'Add to cart']
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { 
        text: `Sorry, I couldn't fetch the ${matchedCategory[1].category} products. Would you like to try another category?`,
        suggestions: ['Show all categories', 'Try another search'],
        error: true
      };
    }
  } else if (lowerMessage.includes('show') && lowerMessage.includes('categor')) {
    return {
      text: 'Here are all our categories:',
      categories: Object.values(CATEGORY_KEYWORDS).map(data => data.category),
      action: 'showCategories'
    };
  } else if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
    return { 
      text: 'Please provide your order ID to track your package.',
      action: 'requestOrderId'
    };
  } else if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
    return { 
      text: 'Our support team is here! What issue are you facing?',
      suggestions: ['Payment issues', 'Delivery problems', 'Product questions', 'Returns'],
      action: 'support'
    };
  } else if (lowerMessage.includes('thank')) {
    return { 
      text: "You're welcome! Is there anything else I can help you with?",
      suggestions: ['No, that\'s all', 'Yes, I have another question']
    };
  } else {
    // Enhanced fallback with suggestions
    return { 
      text: "I'm here to help! Try asking about products, orders, or support.",
      suggestions: ['Show products', 'Track order', 'Contact support'],
      action: 'fallback'
    };
  }
};

const ChatAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { text: 'Welcome to Fancy Store! How can I assist you today?', sender: 'bot', suggestions: ['Show products', 'Track order', 'Contact support'] },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (messages.length === 1) {
      inputRef.current?.focus();
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !loading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse(input, messages);
      setIsTyping(false);
      
      // Short delay before showing bot response for natural feel
      setTimeout(() => {
        const botMessage = { 
          text: aiResponse.text, 
          sender: 'bot', 
          products: aiResponse.products,
          action: aiResponse.action,
          category: aiResponse.category,
          suggestions: aiResponse.suggestions,
          categories: aiResponse.categories,
          error: aiResponse.error
        };
        setMessages(prev => [...prev, botMessage]);
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'bot',
        error: true
      }]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleProductClick = (category) => {
    navigate(`/shop?category=${category}`);
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <div className="max-w-md mx-auto h-[550px] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="bg-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Fancy Store Assistant</h2>
        </div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
            <div 
              className={`max-w-xs p-3 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white animate-fadeIn' 
                  : message.error 
                    ? 'bg-red-100 text-red-800 animate-fadeIn' 
                    : 'bg-white text-gray-800 shadow-sm animate-fadeIn'
              }`}
            >
              <p>{message.text}</p>
              
              {message.suggestions && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              {message.categories && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {message.categories.map((category, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleProductClick(category)}
                      className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-2 rounded-md transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
              
              {message.products && (
                <div className="mt-4 space-y-4">
                  {message.products.map((product, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow">
                      {product.imageId && (
                        <img
                          src={`http://localhost:5000/api/images/${product.imageId}`}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=Product+Image';
                          }}
                        />
                      )}
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-blue-600 font-medium">{product.price}</p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleProductClick(message.category)}
                          className="flex-1 bg-blue-600 text-white px-2 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                        >
                          View
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                        <button
                          className="flex-1 bg-purple-600 text-white px-2 py-1.5 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-white p-3 rounded-lg shadow-sm animate-pulse">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className={`${
            loading || !input.trim() ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
          } text-white px-4 py-2 rounded-r-lg transition-colors flex items-center`}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatAssistant;