import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Calculator, Wallet, Home as HomeIcon, DollarSign, BarChart3, Shield, Zap, Users, Award, Building2, Sparkles, Star, ArrowLeft, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { connectWallet } from '../utils/wallet';
import PropertyCard from '../components/PropertyCard';
import Modal from '../components/Modal';
import { sampleProperties } from '../data/properties';

const Home = () => {
  const { walletAddress, isConnected, setWalletAddress } = useStore();
  const [tokenPrice, setTokenPrice] = useState('0.25');
  const [pkrAmount, setPkrAmount] = useState('');
  const [propyAmount, setPropyAmount] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [featuredProperties] = useState(sampleProperties.slice(0, 3));
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);

  // Fetch token price (simulated - replace with real API)
  useEffect(() => {
    const fetchPrice = () => {
      // Simulate price updates
      const basePrice = 0.25;
      const variation = (Math.random() - 0.5) * 0.02;
      setTokenPrice((basePrice + variation).toFixed(4));
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  // PKR to PROPY calculator
  useEffect(() => {
    if (pkrAmount) {
      const pkrToUsd = parseFloat(pkrAmount) / 280; // Approximate PKR to USD
      const propy = pkrToUsd / parseFloat(tokenPrice);
      setPropyAmount(propy.toFixed(4));
    } else {
      setPropyAmount('');
    }
  }, [pkrAmount, tokenPrice]);

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (error) {
      alert(error.message);
    }
  };

  const steps = [
    {
      icon: <HomeIcon className="w-8 h-8" />,
      title: 'Tokenize',
      description: 'Properties are tokenized into digital assets on the blockchain',
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Invest',
      description: 'Purchase tokens with as little as $100 and start earning',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Earn',
      description: 'Receive rental income and capital gains from your investments',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Amazing & Beautiful */}
      <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
        {/* Animated Background Elements */}
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
            className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: 5
            }}
            className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-primary-600 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: ['-100%', '200%'],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            style={{ transform: 'skewX(-20deg)' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold"
              >
                <Sparkles size={16} />
                <span>Blockchain-Powered Real Estate</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-primary via-orange-500 to-pink-600 animate-gradient bg-[length:200%_auto]">
                  Invest in Real Estate
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-pink-500 via-orange-500 to-primary animate-gradient bg-[length:200%_auto] mt-2">
                  Token by Token
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-accent-600 leading-relaxed max-w-xl"
              >
                Fractional ownership of premium properties. Start investing with as little as $100
                and earn passive income through blockchain-powered real estate tokens.
              </motion.p>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-6 py-6"
              >
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-1">$50M+</p>
                  <p className="text-sm text-accent-600">Tokenized</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-1">10K+</p>
                  <p className="text-sm text-accent-600">Investors</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-1">15%</p>
                  <p className="text-sm text-accent-600">Avg ROI</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 122, 0, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConnectWallet}
                  className="group flex items-center space-x-3 px-8 py-5 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-bold text-lg shadow-2xl transition-all"
                >
                  <Wallet size={24} className="group-hover:rotate-12 transition-transform" />
                  <span>{isConnected ? 'Connected' : 'Get Started'}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-5 bg-white hover:bg-accent-50 text-accent-800 rounded-2xl font-bold text-lg shadow-soft-lg border-2 border-accent-200 transition-all"
                >
                  Explore Properties
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Side - Price Card */}
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary-600 to-primary rounded-3xl opacity-20 blur-xl"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-accent-800">Live PROPY Price</h3>
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"
                    >
                      <TrendingUp className="text-primary" size={24} />
                    </motion.div>
                  </div>
                  
                  <div className="mb-8">
                    <p className="text-sm text-accent-500 mb-2">Current Price</p>
                    <div className="flex items-baseline space-x-3">
                      <motion.p
                        key={tokenPrice}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl font-bold text-primary"
                      >
                        ${tokenPrice}
                      </motion.p>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex items-center text-green-500"
                      >
                        <TrendingUp size={24} />
                        <span className="ml-1 text-sm font-semibold">+2.4%</span>
                      </motion.div>
                    </div>
                  </div>

                  <div className="border-t-2 border-accent-100 pt-6 mt-6">
                    <div className="flex items-center space-x-2 mb-5">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Calculator className="text-primary" size={20} />
                      </div>
                      <h4 className="text-lg font-bold text-accent-800">PKR ↔ PROPY Calculator</h4>
                    </div>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-accent-600 mb-2">PKR Amount</label>
                        <input
                          type="number"
                          value={pkrAmount}
                          onChange={(e) => setPkrAmount(e.target.value)}
                          placeholder="Enter PKR amount"
                          className="w-full px-4 py-3.5 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-accent-600 mb-2">PROPY Tokens</label>
                        <input
                          type="text"
                          value={propyAmount || ''}
                          readOnly
                          placeholder="PROPY equivalent"
                          className="w-full px-4 py-3.5 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl text-accent-800 font-bold text-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Properties - Amazing Slider */}
      <section className="py-24 bg-gradient-to-b from-white via-orange-50/30 to-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #FF7A00 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
            >
              <Star className="fill-primary text-primary" size={16} />
              <span>Premium Selection</span>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold text-accent-900 mb-6">
              Featured Properties
            </h2>
            <p className="text-xl md:text-2xl text-accent-600 max-w-2xl mx-auto">
              Discover premium real estate opportunities tokenized on the blockchain
            </p>
          </motion.div>

          {/* Properties Grid with Enhanced Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <PropertyCard
                  property={property}
                  onViewProperty={setSelectedProperty}
                />
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-primary/30 transition-all"
            >
              View All Properties
              <ArrowRight className="inline ml-2" size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Amazing Design */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: ['-100%', '200%'],
              rotate: [0, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-accent-900 mb-6">How It Works</h2>
            <p className="text-xl md:text-2xl text-accent-600 max-w-2xl mx-auto">
              Three simple steps to start your real estate investment journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent transform -translate-y-1/2"></div>

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="relative group"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                  {index + 1}
                </div>

                <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-3xl shadow-soft-lg p-8 text-center border-2 border-transparent group-hover:border-primary/20 transition-all h-full">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary-600 text-white rounded-2xl mb-6 shadow-lg"
                  >
                    {step.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-accent-900 mb-4">{step.title}</h3>
                  <p className="text-accent-600 leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-1/2 -translate-y-1/2 z-20">
                    <ArrowRightIcon className="text-primary" size={32} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-white to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-accent-900 mb-6">Why Choose PropToken?</h2>
            <p className="text-xl text-accent-600 max-w-2xl mx-auto">
              Experience the future of real estate investment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Secure', desc: 'Blockchain-powered security' },
              { icon: Zap, title: 'Fast', desc: 'Instant transactions' },
              { icon: Users, title: 'Community', desc: '10K+ active investors' },
              { icon: Award, title: 'Verified', desc: 'Audited smart contracts' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-soft-lg border-2 border-transparent hover:border-primary/20 transition-all text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-4">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-accent-900 mb-2">{feature.title}</h3>
                <p className="text-accent-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Detail Modal */}
      <Modal
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        title={selectedProperty?.name}
      >
        {selectedProperty && (
          <div>
            <img
              src={selectedProperty.image}
              alt={selectedProperty.name}
              className="w-full h-64 object-cover rounded-2xl mb-6"
            />
            <div className="space-y-4">
              <div>
                <p className="text-sm text-accent-500 mb-1">Location</p>
                <p className="text-lg font-semibold text-accent-800">{selectedProperty.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-accent-500 mb-1">Price</p>
                  <p className="text-xl font-bold text-accent-800">
                    ${selectedProperty.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-accent-500 mb-1">ROI</p>
                  <p className="text-xl font-bold text-green-600">{selectedProperty.roi}%</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-accent-500 mb-1">Description</p>
                <p className="text-accent-700">{selectedProperty.description}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;

