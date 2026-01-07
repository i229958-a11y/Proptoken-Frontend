import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, TrendingUp, DollarSign, MapPin, Building2 } from 'lucide-react';

const AIChatBot = ({ properties, userProfile, filters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "👋 Hi! I'm your AI Property Investment Assistant.\n\n🔍 **Please apply filters** to see different properties!\n\nI can help you:\n• Find properties matching your criteria\n• Analyze market trends\n• Provide investment recommendations\n• Compare properties\n\nApply filters like budget, ROI, location, or property type to get personalized recommendations!",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getQuickSuggestions = () => {
    const activeFilters = [];
    if (filters.budgetMin || filters.budgetMax) activeFilters.push('budget');
    if (filters.roiMin || filters.roiMax) activeFilters.push('ROI');
    if (filters.location) activeFilters.push('location');
    if (filters.type) activeFilters.push('property type');
    if (filters.risk) activeFilters.push('risk level');

    if (activeFilters.length === 0) {
      return [
        "🔍 Apply filters to see properties",
        "Show me properties under $2M",
        "Find high ROI properties",
        "Recommend residential properties"
      ];
    }

    return [
      "Show me properties matching filters",
      "Analyze my current filters",
      "Suggest similar properties",
      "What's the market trend?"
    ];
  };

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check if filters are applied
    const hasFilters = filters.budgetMin || filters.budgetMax || filters.roiMin || filters.roiMax || filters.location || filters.type || filters.risk;
    
    // Property search queries
    if (lowerMessage.includes('show') || lowerMessage.includes('find') || lowerMessage.includes('recommend') || lowerMessage.includes('properties')) {
      if (!hasFilters) {
        return "🔍 **Please apply filters first!**\n\nTo see different properties, please:\n• Set your budget range\n• Choose ROI preferences\n• Select location or property type\n• Set risk level\n\nOnce you apply filters, I'll show you personalized property recommendations that match your criteria!";
      }
      
      const filtered = properties.filter(p => {
        if (filters.budgetMin && p.price < parseFloat(filters.budgetMin) * 0.9) return false;
        if (filters.budgetMax && p.price > parseFloat(filters.budgetMax) * 1.1) return false;
        if (filters.roiMin && p.roi < parseFloat(filters.roiMin) - 1) return false;
        if (filters.roiMax && p.roi > parseFloat(filters.roiMax) + 2) return false;
        if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (filters.type && p.type !== filters.type) return false;
        return true;
      });

      const top3 = filtered.slice(0, 3);
      if (top3.length > 0) {
        return `✅ **Great! Here are ${top3.length} properties matching your filters:**\n\n${top3.map((p, i) => 
          `**${i + 1}. ${p.name}**\n📍 ${p.location}\n💰 Price: $${p.price.toLocaleString()}\n📈 ROI: ${p.roi}%\n⭐ AI Score: ${p.aiScore || 85}/100`
        ).join('\n\n')}\n\n✨ These properties match your investment profile perfectly! You can compare them using the comparison feature.`;
      }
      return "🔍 I couldn't find properties matching your exact criteria. Try adjusting your filters:\n• Widen your budget range\n• Adjust ROI preferences\n• Try a different location\n\nOr ask me to suggest alternatives!";
    }

    // Market analysis
    if (lowerMessage.includes('trend') || lowerMessage.includes('market') || lowerMessage.includes('analyze')) {
      const avgROI = properties.reduce((sum, p) => sum + p.roi, 0) / properties.length;
      const highROI = properties.filter(p => p.roi > 15).length;
      const residential = properties.filter(p => p.type === 'residential').length;
      const commercial = properties.filter(p => p.type === 'commercial').length;
      
      return `📊 Market Analysis:\n\n• Average ROI: ${avgROI.toFixed(1)}%\n• High ROI Properties (>15%): ${highROI}\n• Residential: ${residential} | Commercial: ${commercial}\n\n💡 Insight: ${avgROI > 12 ? 'The market shows strong returns!' : 'Consider diversifying your portfolio.'}`;
    }

    // Investment advice
    if (lowerMessage.includes('advice') || lowerMessage.includes('suggest') || lowerMessage.includes('best') || lowerMessage.includes('should')) {
      const riskTolerance = userProfile?.riskTolerance || 'medium';
      const recommendations = riskTolerance === 'low' 
        ? "For low-risk investments, focus on residential properties with ROI 10-12% in established areas."
        : riskTolerance === 'high'
        ? "For high-risk investments, consider commercial properties with ROI 15%+ for maximum returns."
        : "A balanced portfolio with both residential and commercial properties (ROI 12-15%) is ideal.";
      
      return `💡 Investment Advice:\n\n${recommendations}\n\nBased on your ${riskTolerance} risk tolerance, I recommend diversifying across 3-5 properties for optimal returns.`;
    }

    // Budget queries
    if (lowerMessage.includes('budget') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      if (filters.budgetMax) {
        const inBudget = properties.filter(p => p.price <= parseFloat(filters.budgetMax));
        return `💰 Budget Analysis:\n\nYou have ${inBudget.length} properties within your budget of $${parseFloat(filters.budgetMax).toLocaleString()}.\n\nTop picks in your range:\n${inBudget.slice(0, 3).map((p, i) => `${i + 1}. ${p.name} - $${p.price.toLocaleString()}`).join('\n')}`;
      }
      return "To get budget-specific recommendations, please set your maximum budget in the filters!";
    }

    // ROI queries
    if (lowerMessage.includes('roi') || lowerMessage.includes('return')) {
      const highROI = properties.filter(p => p.roi >= 15).slice(0, 3);
      return `📈 High ROI Properties (15%+):\n\n${highROI.length > 0 ? highROI.map((p, i) => 
        `${i + 1}. ${p.name}\n   ROI: ${p.roi}% | Price: $${p.price.toLocaleString()} | Location: ${p.location}`
      ).join('\n\n') : 'No properties with ROI 15%+ found. Try adjusting your filters!'}`;
    }

    // Location queries
    if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('city')) {
      const locations = [...new Set(properties.map(p => p.location.split(',')[0]))];
      return `📍 Available Locations:\n\n${locations.slice(0, 10).join(', ')}\n\n${locations.length > 10 ? `...and ${locations.length - 10} more locations` : ''}\n\nWhich location interests you? I can find properties there!`;
    }

    // Default response
    return "I understand you're looking for property investment guidance. I can help you with:\n\n• Finding properties matching your criteria\n• Market trend analysis\n• Investment recommendations\n• Budget planning\n• ROI analysis\n\nTry asking: 'Show me high ROI properties' or 'What's the market trend?'";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000));

    const botResponse = {
      id: Date.now() + 1,
      type: 'bot',
      text: generateBotResponse(inputValue),
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botResponse]);
  };

  const handleQuickSuggestion = (suggestion) => {
    setInputValue(suggestion);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary via-primary-600 to-primary-700 rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-primary/50 transition-all ring-4 ring-primary/20"
        >
          <Bot className="text-white" size={28} />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-primary rounded-full opacity-20"
          />
          <motion.span
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-white rounded-full"
          />
        </motion.button>
      )}

      {/* Chat Window - Mobile Responsive */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed inset-4 md:inset-auto md:bottom-6 md:right-6 md:w-96 md:h-[600px] h-[calc(100vh-2rem)] bg-white rounded-3xl shadow-2xl z-50 flex flex-col border-2 border-primary/20 overflow-hidden backdrop-blur-sm bg-white/95"
          >
            {/* Header - Enhanced */}
            <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 p-4 md:p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-12 h-12 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/30"
                >
                  <Bot className="text-white" size={24} />
                </motion.div>
                <div>
                  <h3 className="text-white font-black text-lg md:text-xl">AI Assistant</h3>
                  <p className="text-white/90 text-xs md:text-sm font-medium">Property Investment Expert</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 md:w-8 md:h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
              >
                <X className="text-white" size={20} />
              </button>
            </div>

            {/* Messages - Enhanced */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-gradient-to-b from-accent-50 via-white to-accent-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[80%] rounded-2xl md:rounded-3xl p-4 md:p-3 shadow-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary-600 text-white'
                        : 'bg-white border-2 border-primary/20 text-accent-800'
                    }`}
                  >
                    {message.type === 'bot' && (
                      <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-accent-100">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="text-primary" size={16} />
                        </motion.div>
                        <span className="text-xs font-bold text-primary">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm md:text-base whitespace-pre-line leading-relaxed font-medium">{message.text}</p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-accent-200 rounded-2xl p-3">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions - Enhanced */}
            {messages.length === 1 && (
              <div className="px-4 md:px-5 py-3 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-t-2 border-primary/20">
                <p className="text-xs md:text-sm font-bold text-primary mb-3 flex items-center space-x-2">
                  <Sparkles size={14} />
                  <span>Quick Suggestions:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {getQuickSuggestions().slice(0, 2).map((suggestion, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="text-xs md:text-sm px-4 py-2 bg-white border-2 border-primary/30 rounded-full hover:bg-gradient-to-r hover:from-primary hover:to-primary-600 hover:text-white hover:border-primary transition-all shadow-md font-semibold"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input - Enhanced */}
            <div className="p-4 md:p-5 bg-gradient-to-r from-white via-accent-50 to-white border-t-2 border-primary/20 shadow-lg">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about properties..."
                  className="flex-1 px-4 py-3 md:py-2 text-sm md:text-base border-2 border-primary/30 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-inner bg-white"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendMessage}
                  className="w-12 h-12 md:w-10 md:h-10 bg-gradient-to-br from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-xl"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatBot;

