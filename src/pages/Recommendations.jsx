import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Filter, AlertCircle, CheckCircle, Brain, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { connectWallet } from '../utils/wallet';
import { getTopRecommendations, generateAIInsights, getRecommendedFilters } from '../utils/recommender';
import { getSponsoredProperties } from '../utils/sponsored';
import { sampleProperties } from '../data/properties';
import { getInvestmentProbability, getPropertyAnalytics } from '../ml';
import RecommendedCard from '../components/RecommendedCard';
import SponsoredCard from '../components/SponsoredCard';
import AISnapshotPanel from '../components/AISnapshotPanel';
import PropertyComparison from '../components/PropertyComparison';
import Modal from '../components/Modal';
import AIChatBot from '../components/AIChatBot';
import { buyTokens } from '../utils/contract';

const Recommendations = () => {
  const {
    walletAddress,
    isConnected,
    setWalletAddress,
    kycStatus,
    properties,
    setProperties,
    userProfile,
    viewingHistory,
    userInvestments,
    updateUserProfile,
    addToViewingHistory,
    comparisonProperties,
    addToComparison,
    removeFromComparison,
    clearComparison,
    ethBalance,
    propyBalance,
    setEthBalance,
    setPropyBalance,
  } = useStore();

  // Check demo mode from localStorage (defaults to true)
  const isDemoMode = localStorage.getItem('propToken_demoMode') !== 'false';

  const [recommendations, setRecommendations] = useState([]);
  const [sponsoredProperties, setSponsoredProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [isBuying, setIsBuying] = useState(false);
  const [filters, setFilters] = useState({
    budgetMin: '',
    budgetMax: '',
    roiMin: '',
    roiMax: '',
    location: '',
    type: '',
    risk: '',
  });
  const [aiInsights, setAIInsights] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isMLRunning, setIsMLRunning] = useState(false);
  const [hasFiltersApplied, setHasFiltersApplied] = useState(false);
  const [aiPredictions, setAIPredictions] = useState(null);
  const [marketTrends, setMarketTrends] = useState(null);

  useEffect(() => {
    // Initialize properties
    if (properties.length === 0) {
      setProperties(sampleProperties);
    }
  }, [properties.length, setProperties]);

  // Initialize demo balances when in demo mode (even without wallet connection)
  useEffect(() => {
    if (isDemoMode && (!isConnected || parseFloat(ethBalance) === 0)) {
      // Set demo balances if not already set or if wallet is not connected
      if (parseFloat(ethBalance) === 0 || !isConnected) {
        setEthBalance('5.2500'); // Demo ETH balance
        setPropyBalance('12500.0000'); // Demo PROPY balance
      }
    }
  }, [isDemoMode, isConnected, ethBalance, setEthBalance, setPropyBalance]);

  useEffect(() => {
    // Load user profile defaults if empty
    if (!userProfile.budgetRange && !userProfile.preferredROI) {
      // Set defaults based on investments or use general defaults
      const defaultProfile = {
        budgetRange: [500000, 5000000],
        preferredROI: 12,
        preferredCities: [],
        preferredTypes: [],
        riskTolerance: 'medium',
      };
      updateUserProfile(defaultProfile);
    }
  }, [userProfile, updateUserProfile]);

  // Track previous filters to detect changes
  const prevFiltersRef = useRef(filters);
  
  // Generate recommendations when properties or filters change
  useEffect(() => {
    if (properties.length > 0) {
      // Check if filters actually changed
      const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
      prevFiltersRef.current = filters;
      
      // Show ML running message when filters change
      const hasActiveFilters = filters.budgetMin || filters.budgetMax || filters.roiMin || filters.roiMax || filters.location || filters.type || filters.risk;
      if (hasActiveFilters && filtersChanged) {
        setIsMLRunning(true);
        setHasFiltersApplied(true);
      }

      const generateRecommendations = async () => {
        const userProfileData = {
          ...userProfile,
          budgetRange: userProfile.budgetRange || [500000, 5000000],
          preferredROI: userProfile.preferredROI || 12,
          riskTolerance: userProfile.riskTolerance || 'medium',
          budget: userProfile.budgetRange ? userProfile.budgetRange[1] : 500000,
          preferredType: userProfile.preferredTypes?.[0] || 'residential',
          preferredLocation: userProfile.preferredCities || [],
        };
        
        // Simulate ML processing delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        let propertiesToProcess = properties;
        
        // Enhanced filtering - Apply filters intelligently to show different properties
        if (hasActiveFilters) {
          propertiesToProcess = properties.filter(prop => {
            // Budget filtering with flexibility
            if (filters.budgetMin && prop.price < parseFloat(filters.budgetMin) * 0.9) return false;
            if (filters.budgetMax && prop.price > parseFloat(filters.budgetMax) * 1.1) return false;
            
            // ROI filtering with range
            if (filters.roiMin && prop.roi < parseFloat(filters.roiMin) - 1) return false;
            if (filters.roiMax && prop.roi > parseFloat(filters.roiMax) + 2) return false;
            
            // Location filtering (partial match)
            if (filters.location) {
              const filterLoc = filters.location.toLowerCase();
              const propLoc = prop.location.toLowerCase();
              if (!propLoc.includes(filterLoc) && !filterLoc.includes(propLoc.split(',')[0])) {
                return false;
              }
            }
            
            // Type filtering
            if (filters.type && prop.type !== filters.type) return false;
            
            return true;
          });
          
          // If no properties match exact filters, show similar ones
          if (propertiesToProcess.length === 0) {
            propertiesToProcess = properties.filter(prop => {
              // More lenient filtering
              if (filters.budgetMax && prop.price > parseFloat(filters.budgetMax) * 1.5) return false;
              if (filters.roiMin && prop.roi < parseFloat(filters.roiMin) - 3) return false;
              return true;
            });
          }
        }
        
        // Generate AI predictions based on current filters
        const generatePredictions = () => {
          const filteredProps = propertiesToProcess.length > 0 ? propertiesToProcess : properties;
          const avgROI = filteredProps.reduce((sum, p) => sum + p.roi, 0) / filteredProps.length;
          const avgPrice = filteredProps.reduce((sum, p) => sum + p.price, 0) / filteredProps.length;
          const highROICount = filteredProps.filter(p => p.roi > 15).length;
          const residentialCount = filteredProps.filter(p => p.type === 'residential').length;
          
          return {
            avgROI: avgROI.toFixed(1),
            avgPrice: avgPrice.toFixed(0),
            highROICount,
            residentialCount,
            totalProperties: filteredProps.length,
            marketSentiment: avgROI > 12 ? 'Bullish' : avgROI > 10 ? 'Neutral' : 'Bearish',
            recommendation: avgROI > 12 
              ? 'Strong investment opportunities available'
              : 'Consider diversifying your portfolio'
          };
        };
        
        setAIPredictions(generatePredictions());
        
        // Generate market trends
        const generateTrends = () => {
          const allProps = properties;
          const trends = {
            topLocation: (() => {
              const locations = {};
              allProps.forEach(p => {
                const loc = p.location.split(',')[0];
                locations[loc] = (locations[loc] || 0) + 1;
              });
              return Object.entries(locations).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
            })(),
            avgMarketROI: (allProps.reduce((sum, p) => sum + p.roi, 0) / allProps.length).toFixed(1),
            priceRange: {
              min: Math.min(...allProps.map(p => p.price)),
              max: Math.max(...allProps.map(p => p.price))
            },
            trendingType: allProps.filter(p => p.type === 'residential').length > allProps.filter(p => p.type === 'commercial').length 
              ? 'Residential' 
              : 'Commercial'
          };
          return trends;
        };
        
        setMarketTrends(generateTrends());
        
        const topRecs = getTopRecommendations(propertiesToProcess, userProfileData, 20);
        
        // Enhance with ML predictions
        const enhancedRecs = topRecs.map(rec => {
          const mlAnalytics = getPropertyAnalytics(rec);
          const investmentProb = getInvestmentProbability(userProfileData, rec);
          return {
            ...rec,
            mlAnalytics,
            investmentProbability: investmentProb.probability,
            investmentRecommendation: investmentProb.recommendation,
          };
        }).sort((a, b) => b.investmentProbability - a.investmentProbability);
        
        // Apply risk filter after ML processing
        const finalRecs = filters.risk 
          ? enhancedRecs.filter(rec => rec.riskLevel === filters.risk)
          : enhancedRecs;
        
        setRecommendations(finalRecs);

        // Generate AI insights
        const insights = generateAIInsights(userProfileData, userInvestments, viewingHistory);
        setAIInsights(insights);

        // Get sponsored properties
        const sponsored = getSponsoredProperties(properties);
        setSponsoredProperties(sponsored);
        
        setIsMLRunning(false);
      };
      
      generateRecommendations();
    }
  }, [properties, userProfile, userInvestments, viewingHistory, filters]);

  useEffect(() => {
    // Apply recommended filters on initial load
    if (userProfile.budgetRange || userProfile.preferredROI) {
      const recommendedFilters = getRecommendedFilters(userProfile);
      setFilters(prev => {
        // Only set if filters are empty (initial load)
        const isEmpty = !prev.budgetMin && !prev.budgetMax && !prev.roiMin && !prev.roiMax && !prev.location && !prev.type && !prev.risk;
        if (isEmpty) {
          return {
            budgetMin: recommendedFilters.budgetMin?.toString() || '',
            budgetMax: recommendedFilters.budgetMax?.toString() || '',
            roiMin: recommendedFilters.roiMin?.toString() || '',
            roiMax: recommendedFilters.roiMax?.toString() || '',
            location: recommendedFilters.location || '',
            type: recommendedFilters.type || '',
            risk: recommendedFilters.risk || '',
          };
        }
        return prev;
      });
    }
  }, [userProfile]);

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    addToViewingHistory(property);
  };

  const handleBuy = (property) => {
    // In demo mode, allow buying without wallet connection
    if (!isDemoMode && !isConnected) {
      alert('Please connect your MetaMask wallet first');
      return;
    }
    // In demo mode, skip KYC check or show warning
    if (!isDemoMode && kycStatus !== 'approved') {
      alert('KYC verification is required to invest. Please complete your KYC verification in the Dashboard.');
      return;
    }
    // In demo mode with KYC not approved, show warning but allow
    if (isDemoMode && kycStatus !== 'approved') {
      const proceed = window.confirm('⚠️ Demo Mode: KYC not verified. In production, KYC approval is required.\n\nDo you want to proceed with demo purchase?');
      if (!proceed) {
        return;
      }
    }
    setSelectedProperty(property);
    setBuyAmount('');
  };

  const handleBuyTokens = async () => {
    // In demo mode, allow buying without wallet connection
    if (!isDemoMode && !isConnected) {
      alert('Please connect your MetaMask wallet first');
      return;
    }

    // In demo mode, skip KYC check or show warning
    if (!isDemoMode && kycStatus !== 'approved') {
      alert('KYC verification is required to invest. Please complete your KYC verification in the Dashboard.');
      return;
    }

    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      alert('Please enter a valid token amount');
      return;
    }

    setIsBuying(true);
    try {
      const tokenPrice = 0.25; // Default token price
      const ethAmount = (parseFloat(buyAmount) * tokenPrice).toString();
      
      if (isDemoMode) {
        // Demo mode: Simulate transaction (no MetaMask required)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Use demo balances if wallet not connected or balance is zero
        const currentEthBalance = isConnected && parseFloat(ethBalance) > 0 
          ? parseFloat(ethBalance) 
          : 5.2500; // Demo balance
        const currentPropyBalance = isConnected && parseFloat(propyBalance) > 0 
          ? parseFloat(propyBalance) 
          : 12500.0000; // Demo balance
        
        // Simulate balance update
        const { user, addInvestment, setInvestments } = useStore.getState();
        const newEthBalance = Math.max(0, currentEthBalance - parseFloat(ethAmount));
        const newPropyBalance = currentPropyBalance + parseFloat(buyAmount);
        
        setEthBalance(newEthBalance.toFixed(4));
        setPropyBalance(newPropyBalance.toFixed(4));
        
        // Save investment to backend
        if (user && user.email) {
          const { addInvestment: addInvestmentBackend, getUserInvestments } = await import('../utils/backend');
          
          addInvestmentBackend(user.email, {
            propertyId: selectedProperty.id,
            propertyName: selectedProperty.name,
            propertyImage: selectedProperty.image,
            propertyLocation: selectedProperty.location,
            tokens: parseFloat(buyAmount),
            amount: parseFloat(ethAmount),
            tokenPrice: 0.25,
            roi: selectedProperty.roi || 12,
            transactionHash: `demo_tx_${Date.now()}`,
          });
          
          const updatedInvestments = getUserInvestments(user.email);
          setInvestments(updatedInvestments);
          
          addInvestment({
            propertyId: selectedProperty.id,
            propertyName: selectedProperty.name,
            propertyImage: selectedProperty.image,
            propertyLocation: selectedProperty.location,
            tokens: parseFloat(buyAmount),
            amount: parseFloat(ethAmount),
            tokenPrice: 0.25,
            roi: selectedProperty.roi || 12,
            investedAt: new Date().toISOString(),
          });
        }
        
        alert(`Demo Transaction successful! Purchased ${buyAmount} tokens for ${selectedProperty.name}\n\nETH Balance: ${newEthBalance.toFixed(4)} ETH\nPROPY Balance: ${newPropyBalance.toFixed(4)} PROPY`);
        setSelectedProperty(null);
        setBuyAmount('');
      } else {
        // Production mode: Real transaction
        const tx = await buyTokens(selectedProperty.id, buyAmount, ethAmount);
        alert(`Transaction successful! Hash: ${tx.hash}`);
        setSelectedProperty(null);
        setBuyAmount('');
      }
    } catch (error) {
      console.error('Error buying tokens:', error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setIsBuying(false);
    }
  };

  const handleAddToComparison = (property) => {
    addToComparison(property);
  };

  // Recommendations are already filtered in the useEffect, so we use them directly
  const filteredRecommendations = recommendations;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <section className="relative py-16 bg-gradient-to-br from-primary/10 via-white to-primary/5 overflow-hidden rounded-3xl mb-12 border-2 border-primary/20">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-10 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"
            />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
              >
                <Sparkles size={16} />
                <span>AI-Powered Intelligence</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-primary via-orange-500 to-pink-600 animate-gradient bg-[length:200%_auto]">
                  AI Recommendations
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-accent-600 max-w-3xl mx-auto font-medium"
              >
                Personalized property suggestions powered by advanced machine learning
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Context-Aware Banners */}
        {!isConnected && !isDemoMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8 flex items-center space-x-4"
          >
            <AlertCircle className="text-yellow-600" size={24} />
            <div className="flex-1">
              <p className="font-semibold text-yellow-800">Connect your MetaMask Wallet to Improve AI Suggestions</p>
              <p className="text-sm text-yellow-700">Connecting your wallet helps us provide better personalized recommendations</p>
            </div>
            <button
              onClick={handleConnectWallet}
              className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-2xl font-medium transition-colors"
            >
              Connect Wallet
            </button>
          </motion.div>
        )}
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 flex items-center space-x-4"
          >
            <AlertCircle className="text-blue-600" size={24} />
            <div className="flex-1">
              <p className="font-semibold text-blue-800">Demo Mode Active</p>
              <p className="text-sm text-blue-700">
                You're using demo balances for testing. MetaMask connection is optional. 
                Demo Balance: {ethBalance} ETH | {propyBalance} PROPY
              </p>
            </div>
            {!isConnected && (
              <button
                onClick={handleConnectWallet}
                className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-2xl font-medium transition-colors"
              >
                Connect Wallet (Optional)
              </button>
            )}
          </motion.div>
        )}

        {kycStatus !== 'approved' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 flex items-center space-x-4"
          >
            <CheckCircle className="text-blue-600" size={24} />
            <div className="flex-1">
              <p className="font-semibold text-blue-800">Complete KYC to unlock advanced AI-matching features</p>
              <p className="text-sm text-blue-700">Verify your identity to access premium recommendation features</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Sponsored Properties Carousel */}
            {sponsoredProperties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary-50 to-white rounded-2xl shadow-soft-lg p-6 border-2 border-primary/20"
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Sparkles className="text-primary" size={24} />
                  <h2 className="text-2xl font-bold text-accent-800">Sponsored Properties</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sponsoredProperties.map((property) => (
                    <SponsoredCard
                      key={property.id}
                      property={property}
                      onViewDetails={handleViewDetails}
                      onBuy={handleBuy}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Smart Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white to-primary/5 rounded-3xl shadow-lg p-6 border-2 border-primary/20"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Filter className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-accent-900">Smart AI Filters</h3>
                    <p className="text-xs text-accent-600">Refine your property search</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>

              {/* Active Filter Badges */}
              {hasFiltersApplied && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {filters.budgetMin && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold flex items-center space-x-1">
                      <span>Min: ${parseFloat(filters.budgetMin).toLocaleString()}</span>
                      <button
                        onClick={() => setFilters({ ...filters, budgetMin: '' })}
                        className="ml-1 hover:text-primary-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.budgetMax && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold flex items-center space-x-1">
                      <span>Max: ${parseFloat(filters.budgetMax).toLocaleString()}</span>
                      <button
                        onClick={() => setFilters({ ...filters, budgetMax: '' })}
                        className="ml-1 hover:text-primary-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.roiMin && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <span>Min ROI: {filters.roiMin}%</span>
                      <button
                        onClick={() => setFilters({ ...filters, roiMin: '' })}
                        className="ml-1 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.roiMax && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <span>Max ROI: {filters.roiMax}%</span>
                      <button
                        onClick={() => setFilters({ ...filters, roiMax: '' })}
                        className="ml-1 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.location && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <span>📍 {filters.location}</span>
                      <button
                        onClick={() => setFilters({ ...filters, location: '' })}
                        className="ml-1 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.type && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <span>🏢 {filters.type}</span>
                      <button
                        onClick={() => setFilters({ ...filters, type: '' })}
                        className="ml-1 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.risk && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <span>⚠️ {filters.risk} risk</span>
                      <button
                        onClick={() => setFilters({ ...filters, risk: '' })}
                        className="ml-1 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-accent-800 mb-2">Min Budget ($)</label>
                      <input
                        type="number"
                        value={filters.budgetMin}
                        onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })}
                        placeholder="e.g., 500000"
                        className="w-full px-4 py-3 border-2 border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-accent-800 mb-2">Max Budget ($)</label>
                      <input
                        type="number"
                        value={filters.budgetMax}
                        onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
                        placeholder="e.g., 5000000"
                        className="w-full px-4 py-3 border-2 border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-accent-800 mb-2">Min ROI (%)</label>
                      <input
                        type="number"
                        value={filters.roiMin}
                        onChange={(e) => setFilters({ ...filters, roiMin: e.target.value })}
                        placeholder="e.g., 10"
                        className="w-full px-4 py-3 border-2 border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-accent-800 mb-2">Max ROI (%)</label>
                      <input
                        type="number"
                        value={filters.roiMax}
                        onChange={(e) => setFilters({ ...filters, roiMax: e.target.value })}
                        placeholder="e.g., 20"
                        className="w-full px-4 py-3 border-2 border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-accent-800 mb-2">Location</label>
                      <input
                        type="text"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        placeholder="City name"
                        className="w-full px-4 py-3 border-2 border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-accent-800 mb-2">Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                      >
                        <option value="">All Types</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-accent-800 mb-2">Risk Level</label>
                      <select
                        value={filters.risk}
                        onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                      >
                        <option value="">All Risk Levels</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-accent-200">
                    <button
                      onClick={() => {
                        setFilters({
                          budgetMin: '',
                          budgetMax: '',
                          roiMin: '',
                          roiMax: '',
                          location: '',
                          type: '',
                          risk: '',
                        });
                        setHasFiltersApplied(false);
                      }}
                      className="px-6 py-2 bg-accent-100 hover:bg-accent-200 text-accent-800 rounded-xl font-medium transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-xl font-medium transition-colors shadow-lg"
                    >
                      Apply Filters
                    </button>
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white via-primary/5 to-white rounded-3xl shadow-xl p-8 border-2 border-primary/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-primary to-primary-600 rounded-2xl shadow-lg">
                    <Brain className="text-white" size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-accent-900">AI-Powered Recommendations</h2>
                    <p className="text-sm text-accent-600 mt-1">
                      {hasFiltersApplied 
                        ? `Showing ${filteredRecommendations.length} properties matching your filters`
                        : 'Personalized for your investment profile'}
                    </p>
                  </div>
                </div>
                {hasFiltersApplied && (
                  <div className="flex items-center space-x-3">
                    <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                      {filteredRecommendations.length} Matches
                    </div>
                    {aiPredictions && (
                      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        Avg ROI: {aiPredictions.avgROI}%
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ML Running Message */}
              <AnimatePresence>
                {isMLRunning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-8 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/30 rounded-2xl p-6"
                  >
                  <div className="flex items-center space-x-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Brain className="text-white" size={24} />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-primary mb-1">🤖 ML is Running for You</p>
                      <p className="text-sm text-accent-700">Analyzing properties and matching them to your preferences...</p>
                    </div>
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
                  </motion.div>
                )}
              </AnimatePresence>

              <Suspense fallback={
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-accent-600">Loading recommendations...</p>
                </div>
              }>
                {!isMLRunning && (
                  <>
                    {filteredRecommendations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredRecommendations.map((property, index) => (
                          <motion.div
                            key={property.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <RecommendedCard
                              property={property}
                              rank={index + 1}
                              isTopPick={index < 3}
                              onViewDetails={handleViewDetails}
                              onBuy={handleBuy}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 bg-gradient-to-br from-accent-50 to-white rounded-2xl border-2 border-accent-200"
                      >
                        <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Filter className="text-accent-400" size={40} />
                        </div>
                        <p className="text-lg font-semibold text-accent-800 mb-2">No properties match your current filters</p>
                        <p className="text-sm text-accent-600 mb-4">Try adjusting your filters to see more recommendations</p>
                        <button
                          onClick={() => {
                            setFilters({
                              budgetMin: '',
                              budgetMax: '',
                              roiMin: '',
                              roiMax: '',
                              location: '',
                              type: '',
                              risk: '',
                            });
                            setHasFiltersApplied(false);
                          }}
                          className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </motion.div>
                    )}
                  </>
                )}
              </Suspense>
            </motion.div>

            {/* Property Comparison - Enhanced & Always Visible */}
            {comparisonProperties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-4 z-10"
              >
                <PropertyComparison
                  properties={comparisonProperties}
                  onRemove={removeFromComparison}
                  onClear={clearComparison}
                />
              </motion.div>
            )}
            
            {/* Comparison Prompt when empty */}
            {comparisonProperties.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-primary/10 via-white to-primary/5 rounded-3xl shadow-lg p-8 border-2 border-dashed border-primary/30 text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-4">
                  <TrendingUp className="text-primary" size={40} />
                </div>
                <h3 className="text-2xl font-black text-accent-900 mb-2">Compare Properties</h3>
                <p className="text-accent-600 mb-4">Use the "Compare" button on property cards to add up to 3 properties for side-by-side comparison</p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-accent-500">
                  <span>✨ Compare prices</span>
                  <span>•</span>
                  <span>📈 Compare ROI</span>
                  <span>•</span>
                  <span>📍 Compare locations</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - AI Snapshot Panel & Features */}
          <div className="lg:col-span-1 space-y-6">
            <Suspense fallback={<div>Loading insights...</div>}>
              <AISnapshotPanel insights={aiInsights} />
            </Suspense>

            {/* AI Predictions Card */}
            {aiPredictions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary/10 via-white to-primary/5 rounded-2xl shadow-lg p-6 border-2 border-primary/20"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="text-primary" size={24} />
                  <h3 className="text-xl font-bold text-accent-800">AI Predictions</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/60 rounded-xl p-3 border border-primary/10">
                    <p className="text-xs text-accent-600 mb-1">Average ROI</p>
                    <p className="text-2xl font-black text-primary">{aiPredictions.avgROI}%</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 border border-primary/10">
                    <p className="text-xs text-accent-600 mb-1">High ROI Properties</p>
                    <p className="text-xl font-bold text-green-600">{aiPredictions.highROICount} properties</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 border border-primary/10">
                    <p className="text-xs text-accent-600 mb-1">Market Sentiment</p>
                    <p className={`text-lg font-bold ${
                      aiPredictions.marketSentiment === 'Bullish' ? 'text-green-600' :
                      aiPredictions.marketSentiment === 'Neutral' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {aiPredictions.marketSentiment} 📈
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
                    <p className="text-xs font-semibold text-primary mb-1">AI Recommendation</p>
                    <p className="text-sm text-accent-700">{aiPredictions.recommendation}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Market Trends Card */}
            {marketTrends && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-accent-50 to-white rounded-2xl shadow-lg p-6 border-2 border-accent-200"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="text-primary" size={24} />
                  <h3 className="text-xl font-bold text-accent-800">Market Trends</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="text-sm text-accent-600">Top Location</span>
                    <span className="font-bold text-accent-800">{marketTrends.topLocation}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="text-sm text-accent-600">Market Avg ROI</span>
                    <span className="font-bold text-primary">{marketTrends.avgMarketROI}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="text-sm text-accent-600">Trending Type</span>
                    <span className="font-bold text-accent-800">{marketTrends.trendingType}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl">
                    <p className="text-xs text-accent-600 mb-1">Price Range</p>
                    <p className="text-sm font-semibold text-accent-800">
                      ${(marketTrends.priceRange.min / 1000000).toFixed(1)}M - ${(marketTrends.priceRange.max / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* AI ChatBot */}
      <AIChatBot 
        properties={properties} 
        userProfile={userProfile}
        filters={filters}
      />

      {/* Property Detail / Buy Modal */}
      <Modal
        isOpen={!!selectedProperty}
        onClose={() => {
          setSelectedProperty(null);
          setBuyAmount('');
        }}
        title={selectedProperty?.name}
      >
        {selectedProperty && (
          <div className="space-y-6">
            <img
              src={selectedProperty.image}
              alt={selectedProperty.name}
              className="w-full h-64 object-cover rounded-2xl"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-accent-500 mb-1">Location</p>
                <p className="text-lg font-semibold text-accent-800">{selectedProperty.location}</p>
              </div>
              <div>
                <p className="text-sm text-accent-500 mb-1">ROI</p>
                <p className="text-lg font-semibold text-green-600">{selectedProperty.roi}%</p>
              </div>
              <div>
                <p className="text-sm text-accent-500 mb-1">Price</p>
                <p className="text-lg font-semibold text-accent-800">
                  ${selectedProperty.price.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-accent-500 mb-1">AI Score</p>
                <p className="text-lg font-semibold text-primary">{selectedProperty.aiScore || 0}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-accent-500 mb-1">Description</p>
              <p className="text-accent-700">{selectedProperty.description}</p>
            </div>
            {(isConnected || isDemoMode) && (
              <div>
                {isDemoMode && !isConnected && (
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                    <p className="text-sm text-yellow-800 font-semibold mb-1">Demo Mode Active</p>
                    <p className="text-xs text-yellow-700">Using demo balance for testing. MetaMask connection not required.</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Demo Balance: {ethBalance} ETH | {propyBalance} PROPY
                    </p>
                  </div>
                )}
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  Number of Tokens to Buy
                </label>
                <input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="Enter token amount"
                  max={selectedProperty.tokensAvailable}
                  className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {buyAmount && (
                  <p className="mt-2 text-sm text-accent-600">
                    Total Cost: ${(parseFloat(buyAmount || 0) * (selectedProperty.tokenPrice || 250)).toLocaleString()}
                  </p>
                )}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleBuyTokens}
                    disabled={isBuying || !buyAmount || parseFloat(buyAmount) <= 0}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary-600 disabled:bg-accent-300 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-colors"
                  >
                    {isBuying ? 'Processing...' : 'Buy Tokens'}
                  </button>
                  <button
                    onClick={() => handleAddToComparison(selectedProperty)}
                    disabled={comparisonProperties.length >= 3 || comparisonProperties.find(p => p.id === selectedProperty.id)}
                    className="px-6 py-3 bg-accent-100 hover:bg-accent-200 text-accent-800 rounded-2xl font-semibold transition-colors disabled:opacity-50"
                  >
                    Compare
                  </button>
                </div>
              </div>
            )}
            {!isConnected && !isDemoMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <p className="text-sm text-yellow-800">
                  Please connect your MetaMask wallet to purchase tokens
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Recommendations;

