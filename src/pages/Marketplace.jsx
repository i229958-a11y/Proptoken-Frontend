import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, AlertCircle, MapPin, Grid3x3, List, SlidersHorizontal, X, TrendingUp, DollarSign, Building2, Sparkles, ChevronDown, ChevronUp, Star, Zap, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { connectWallet } from '../utils/wallet';
import { buyTokens, getTokenPrice, getUSDTBalance } from '../utils/contract';
import { sampleProperties } from '../data/properties';
import PropertyCard from '../components/PropertyCard';
import Modal from '../components/Modal';

const Marketplace = () => {
  const { 
    walletAddress, 
    isConnected, 
    setWalletAddress,
    properties,
    setProperties,
    contractFrozen,
    ethBalance,
    propyBalance,
    usdtBalance,
    setUsdtBalance,
    kycStatus,
    demoMode,
  } = useStore();
  
  const isDemoMode = demoMode;
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [isBuying, setIsBuying] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price', 'roi', 'tokens'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    priceMin: '',
    priceMax: '',
    location: '',
    roiMin: '',
    type: '',
  });

  useEffect(() => {
    // Initialize properties from sample data
    if (properties.length === 0) {
      setProperties(sampleProperties);
    }
  }, [properties.length, setProperties]);

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBuyTokens = async () => {
    if (!isConnected && !isDemoMode) {
      alert('Please connect your MetaMask wallet first');
      return;
    }

    // In demo mode, allow purchases without KYC. In production, require KYC approval
    if (!isDemoMode) {
      const { kycStatus } = useStore.getState();
      if (kycStatus !== 'approved') {
        alert('KYC verification is required to invest. Please complete your KYC verification in the Dashboard.');
        return;
      }
    } else {
      // Demo mode: Show warning but allow purchase
      const { kycStatus } = useStore.getState();
      if (kycStatus !== 'approved') {
        const proceed = window.confirm('⚠️ Demo Mode: KYC not verified. In production, KYC approval is required.\n\nDo you want to proceed with demo purchase?');
        if (!proceed) {
          return;
        }
      }
    }

    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      alert('Please enter a valid token amount');
      return;
    }

    if (contractFrozen) {
      alert('Contract interactions are currently frozen by admin');
      return;
    }

    setIsBuying(true);
    try {
      if (isDemoMode) {
        // Demo mode: Simulate transaction (NO MetaMask, NO blockchain)
        const tokenPrice = 0.25; // Fixed demo price
        const ethAmount = (parseFloat(buyAmount) * parseFloat(tokenPrice)).toString();
      
      // Demo mode: Simulate transaction (NO MetaMask, NO blockchain)
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        
      // Simulate balance update - use demo balances if wallet not connected
        const { setEthBalance, setPropyBalance, user, addInvestment, setInvestments } = useStore.getState();
      const currentEthBalance = isConnected && parseFloat(ethBalance) > 0 ? parseFloat(ethBalance) : 12.5432; // Demo balance
      const currentPropyBalance = isConnected && parseFloat(propyBalance) > 0 ? parseFloat(propyBalance) : 28450.75; // Demo balance
      
      const newEthBalance = Math.max(0, currentEthBalance - parseFloat(ethAmount));
      const newPropyBalance = currentPropyBalance + parseFloat(buyAmount);
        
        // Update balances in store
        setEthBalance(newEthBalance.toFixed(4));
        setPropyBalance(newPropyBalance.toFixed(4));
        
        // Save investment to backend
        if (user && user.email) {
          const { addInvestment: addInvestmentBackend, getUserInvestments } = await import('../utils/backend');
          
          // Add investment to backend
          addInvestmentBackend(user.email, {
            propertyId: selectedProperty.id,
            propertyName: selectedProperty.name,
            propertyImage: selectedProperty.image,
            propertyLocation: selectedProperty.location,
            tokens: parseFloat(buyAmount),
            amount: parseFloat(ethAmount),
            tokenPrice: parseFloat(tokenPrice),
            roi: selectedProperty.roi || 12,
            transactionHash: `demo_tx_${Date.now()}`,
          });
          
          // Load updated investments and update store
          const updatedInvestments = getUserInvestments(user.email);
          setInvestments(updatedInvestments);
          
          // Add to store investments as well
          addInvestment({
            propertyId: selectedProperty.id,
            propertyName: selectedProperty.name,
            propertyImage: selectedProperty.image,
            propertyLocation: selectedProperty.location,
            tokens: parseFloat(buyAmount),
            amount: parseFloat(ethAmount),
            tokenPrice: parseFloat(tokenPrice),
            roi: selectedProperty.roi || 12,
            investedAt: new Date().toISOString(),
          });
        }
        
      alert(`✅ Demo Transaction successful! Purchased ${buyAmount} tokens for ${selectedProperty.name}\n\nETH Balance: ${newEthBalance.toFixed(4)} ETH\nPROPY Balance: ${newPropyBalance.toFixed(4)} PROPY`);
        setSelectedProperty(null);
        setBuyAmount('');
        
        // Update property tokens available
        const updatedProperties = properties.map(p => 
          p.id === selectedProperty.id 
            ? { ...p, tokensAvailable: Math.max(0, p.tokensAvailable - parseFloat(buyAmount)) }
            : p
        );
        setProperties(updatedProperties);
      
      // NOTE: Production mode with real blockchain transactions
      } else {
        // Production mode: Real transaction via USDT
        const onChainId = selectedProperty.onChainId ?? selectedProperty.id;
        const receipt = await buyTokens(onChainId, buyAmount);
        
        // Save investment to backend
        const { user, addInvestment, setInvestments } = useStore.getState();
        const tokenPrice = selectedProperty.tokenPrice || 250;
        const usdtCost = parseFloat(buyAmount) * tokenPrice;
        
        if (user && user.email) {
          const { addInvestment: addInvestmentBackend, getUserInvestments } = await import('../utils/backend');
          
          addInvestmentBackend(user.email, {
            propertyId: selectedProperty.id,
            propertyName: selectedProperty.name,
            propertyImage: selectedProperty.image,
            propertyLocation: selectedProperty.location,
            tokens: parseFloat(buyAmount),
            amount: usdtCost,
            tokenPrice: tokenPrice,
            roi: selectedProperty.roi || 12,
            transactionHash: receipt.hash,
          });
          
          const updatedInvestments = getUserInvestments(user.email);
          setInvestments(updatedInvestments);
          
          addInvestment({
            propertyId: selectedProperty.id,
            propertyName: selectedProperty.name,
            propertyImage: selectedProperty.image,
            propertyLocation: selectedProperty.location,
            tokens: parseFloat(buyAmount),
            amount: usdtCost,
            tokenPrice: tokenPrice,
            roi: selectedProperty.roi || 12,
            investedAt: new Date().toISOString(),
            transactionHash: receipt.hash,
          });
        }
        
        // Refresh USDT balance
        const newUsdtBal = await getUSDTBalance(walletAddress);
        setUsdtBalance(newUsdtBal);
        
        alert(`✅ Transaction successful!\nHash: ${receipt.hash}`);
        setSelectedProperty(null);
        setBuyAmount('');
        
        // Update property tokens available
        const updatedProperties = properties.map(p => 
          p.id === selectedProperty.id 
            ? { ...p, tokensAvailable: p.tokensAvailable - parseFloat(buyAmount) }
            : p
        );
        setProperties(updatedProperties);
      }
    } catch (error) {
      console.error('Error buying tokens:', error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setIsBuying(false);
    }
  };

  // Filter and sort properties
  let filteredProperties = properties
    .filter(p => p.visible !== false)
    .filter(p => {
      if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !p.location.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.priceMin && p.price < parseFloat(filters.priceMin)) return false;
      if (filters.priceMax && p.price > parseFloat(filters.priceMax)) return false;
      if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.roiMin && p.roi < parseFloat(filters.roiMin)) return false;
      if (filters.type && p.type !== filters.type) return false;
      return true;
    });

  // Sort properties
  if (sortBy === 'price') {
    filteredProperties = [...filteredProperties].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'roi') {
    filteredProperties = [...filteredProperties].sort((a, b) => b.roi - a.roi);
  } else if (sortBy === 'tokens') {
    filteredProperties = [...filteredProperties].sort((a, b) => b.tokensAvailable - a.tokensAvailable);
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-orange-50/30">
      {/* Hero Header Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-white to-primary/5 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-10 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.15, 0.1],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: 5
            }}
            className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-primary-600 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
            >
              <Building2 size={16} />
              <span>Premium Real Estate Marketplace</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-primary via-orange-500 to-pink-600 animate-gradient bg-[length:200%_auto]">
                Property
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-pink-500 via-orange-500 to-primary animate-gradient bg-[length:200%_auto] mt-2">
                Marketplace
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-accent-600 max-w-3xl mx-auto font-medium"
            >
              Discover and invest in premium tokenized real estate properties from around the world
            </motion.p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Properties', value: filteredProperties.length, icon: Building2 },
              { label: 'Total Value', value: '$50M+', icon: DollarSign },
              { label: 'Avg ROI', value: '15%', icon: TrendingUp },
              { label: 'Investors', value: '10K+', icon: Sparkles },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft-lg border border-white/50 text-center"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-accent-900 mb-1">{stat.value}</p>
                <p className="text-sm text-accent-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Wallet Connection Banner - Enhanced */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20 rounded-3xl p-6 mb-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
            <div className="relative flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="text-primary" size={32} />
                </div>
                <div>
                  <p className="font-bold text-lg text-accent-900 mb-1">Connect MetaMask to Invest</p>
                  <p className="text-sm text-accent-600">Connect your wallet to purchase property tokens and start earning</p>
                  {isDemoMode && (
                    <p className="text-xs text-yellow-600 mt-1 font-semibold">Demo Mode: Demo balance will be used for testing</p>
                  )}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConnectWallet}
                className="px-8 py-3 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-bold shadow-lg transition-all"
              >
                Connect Wallet
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Demo Mode Banner */}
        {isConnected && isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-yellow-600" size={20} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800">Demo Mode Active</p>
                <p className="text-xs text-yellow-700">Using demo balances: {parseFloat(ethBalance).toFixed(4)} ETH | {parseFloat(propyBalance).toFixed(4)} PROPY</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft-lg p-6 mb-8 border border-white/50"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search properties by name or location..."
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                />
              </div>
            </div>

            {/* View Toggle & Sort */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-accent-50 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-accent-600 hover:bg-accent-100'
                  }`}
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-accent-600 hover:bg-accent-100'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
              >
                <option value="default">Sort: Default</option>
                <option value="price">Sort: Price (Low to High)</option>
                <option value="roi">Sort: ROI (High to Low)</option>
                <option value="tokens">Sort: Tokens Available</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="relative px-6 py-3 bg-gradient-to-r from-primary to-primary-600 text-white rounded-2xl font-bold shadow-lg flex items-center space-x-2"
              >
                <SlidersHorizontal size={20} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-primary rounded-full flex items-center justify-center text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-accent-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-accent-700 mb-2">Min Price ($)</label>
                      <input
                        type="number"
                        value={filters.priceMin}
                        onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                        placeholder="Min price"
                        className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-accent-700 mb-2">Max Price ($)</label>
                      <input
                        type="number"
                        value={filters.priceMax}
                        onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                        placeholder="Max price"
                        className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-accent-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        placeholder="City or Country"
                        className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-accent-700 mb-2">Min ROI (%)</label>
                      <input
                        type="number"
                        value={filters.roiMin}
                        onChange={(e) => setFilters({ ...filters, roiMin: e.target.value })}
                        placeholder="Minimum ROI"
                        className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-accent-700 mb-2">Property Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      >
                        <option value="">All Types</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setFilters({
                            search: '',
                            priceMin: '',
                            priceMax: '',
                            location: '',
                            roiMin: '',
                            type: '',
                          });
                        }}
                        className="w-full px-6 py-3 bg-accent-100 hover:bg-accent-200 text-accent-800 rounded-2xl font-semibold transition-colors"
                      >
                        Clear All
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pakistan Properties Map */}
        {filteredProperties.some(p => p.country === 'Pakistan') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-soft p-6 mb-8"
          >
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="text-primary" size={24} />
              <h2 className="text-2xl font-bold text-accent-800">Properties in Pakistan</h2>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.0!2d67.0011!3d24.8607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e06651d4bbf%3A0x9cf92f44555a0c23!2sPakistan!5e0!3m2!1sen!2s!4v1234567890!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pakistan Properties Map"
              />
              {/* Property Markers Overlay */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 max-h-64 overflow-y-auto">
                <h3 className="font-bold text-accent-800 mb-2 text-sm">Properties on Map</h3>
                <div className="space-y-2">
                  {filteredProperties
                    .filter(p => p.country === 'Pakistan' && p.lat && p.lng)
                    .map((property) => (
                      <div
                        key={property.id}
                        onClick={() => setSelectedProperty(property)}
                        className="p-2 bg-accent-50 hover:bg-accent-100 rounded-2xl cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-semibold text-accent-800">{property.name}</p>
                        <p className="text-xs text-accent-600">{property.location}</p>
                        <p className="text-xs text-primary font-medium">${property.price.toLocaleString()}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            {/* Property List */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties
                .filter(p => p.country === 'Pakistan')
                .map((property) => (
                  <div
                    key={property.id}
                    onClick={() => setSelectedProperty(property)}
                    className="bg-accent-50 hover:bg-accent-100 p-4 rounded-2xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin size={16} className="text-primary" />
                      <p className="font-semibold text-accent-800 text-sm">{property.name}</p>
                    </div>
                    <p className="text-xs text-accent-600 mb-1">{property.location}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-primary">${property.price.toLocaleString()}</p>
                      <p className="text-xs text-green-600 font-medium">{property.roi}% ROI</p>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Properties Grid/List View */}
        {filteredProperties.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
            : 'space-y-6'
          }>
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={viewMode === 'list' ? 'bg-white rounded-3xl shadow-soft-lg overflow-hidden' : ''}
              >
                {viewMode === 'list' ? (
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-64 md:h-auto bg-gradient-to-br from-accent-100 to-accent-200">
                      <img
                        src={property.image}
                        alt={property.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&sig=${property.id}`;
                          e.target.onerror = null;
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="md:w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-2xl font-bold text-accent-900">{property.name}</h3>
                          {property.roi > 15 && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center">
                              <Star className="fill-green-700 text-green-700" size={12} />
                              <span className="ml-1">High ROI</span>
                            </span>
                          )}
                        </div>
                        <p className="text-accent-600 mb-4 flex items-center">
                          <MapPin size={16} className="mr-1 text-primary" />
                          {property.location}
                        </p>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-accent-500">Price</p>
                            <p className="text-xl font-bold text-accent-900">${property.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-accent-500">ROI</p>
                            <p className="text-xl font-bold text-green-600">{property.roi}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-accent-500">Tokens</p>
                            <p className="text-xl font-bold text-primary">{property.tokensAvailable.toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-accent-600 text-sm line-clamp-2">{property.description}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedProperty(property)}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-primary to-primary-600 text-white rounded-2xl font-bold shadow-lg self-start"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <PropertyCard
                    property={property}
                    onViewProperty={setSelectedProperty}
                  />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-accent-400" size={64} />
            </div>
            <h3 className="text-3xl font-bold text-accent-900 mb-4">No Properties Found</h3>
            <p className="text-xl text-accent-600 mb-6">Try adjusting your filters to find more properties</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFilters({
                  search: '',
                  priceMin: '',
                  priceMax: '',
                  location: '',
                  roiMin: '',
                  type: '',
                });
              }}
              className="px-8 py-4 bg-primary hover:bg-primary-600 text-white rounded-2xl font-bold shadow-lg"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Buy Tokens Modal */}
      <Modal
        isOpen={!!selectedProperty}
        onClose={() => {
          setSelectedProperty(null);
          setBuyAmount('');
        }}
        title={`Buy Tokens - ${selectedProperty?.name}`}
      >
        {selectedProperty && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-accent-500 mb-1">Token Price</p>
                <p className="text-xl font-bold text-accent-800">${selectedProperty.tokenPrice}</p>
              </div>
              <div>
                <p className="text-sm text-accent-500 mb-1">Tokens Available</p>
                <p className="text-xl font-bold text-accent-800">
                  {selectedProperty.tokensAvailable.toLocaleString()}
                </p>
              </div>
            </div>
            <div>
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
                  Total Cost: ${(parseFloat(buyAmount || 0) * selectedProperty.tokenPrice).toLocaleString()}
                </p>
              )}
            </div>
            {!isConnected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <p className="text-sm text-yellow-800">
                  Please connect your MetaMask wallet to purchase tokens
                </p>
              </div>
            ) : kycStatus !== 'approved' ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-red-800 mb-1">
                  KYC Verification Required
                </p>
                <p className="text-xs text-red-700">
                  Please complete your KYC verification in the Dashboard to invest in properties.
                </p>
              </div>
            ) : (
              <button
                onClick={handleBuyTokens}
                disabled={isBuying || !buyAmount || parseFloat(buyAmount) <= 0 || parseFloat(buyAmount) > selectedProperty.tokensAvailable}
                className="w-full px-6 py-3 bg-primary hover:bg-primary-600 disabled:bg-accent-300 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-colors"
              >
                {isBuying ? 'Processing...' : 'Buy Tokens'}
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Marketplace;

