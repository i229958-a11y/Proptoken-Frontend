import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatAddress, connectWallet, isMetaMaskInstalled, getChainId } from '../utils/wallet';
import { Wallet, Menu, X, Building2, Home, Store, LayoutDashboard, Sparkles, Info, User, LogOut, Copy, Check, Shield, Mail, Brain } from 'lucide-react';
import { useState } from 'react';
import NetworkToggle from './NetworkToggle';

const Layout = ({ children }) => {
  const location = useLocation();
  const { walletAddress, isConnected, setWalletAddress, setChainId, disconnectWallet, isLoggedIn, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectWallet = async () => {
    if (isConnecting) return; // Prevent multiple clicks
    
    setIsConnecting(true);
    try {
      if (!isMetaMaskInstalled()) {
        alert('MetaMask is not installed. Please install MetaMask extension to continue.');
        window.open('https://metamask.io/download/', '_blank');
        setIsConnecting(false);
        return;
      }

      console.log('Connecting to MetaMask...');
      const address = await connectWallet();
      console.log('Connected address:', address);
      
      if (address) {
      setWalletAddress(address);
        // Try to get chain ID, but don't fail if it doesn't work
        try {
          const chainId = await Promise.race([
            getChainId(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);
          if (chainId) {
            setChainId(chainId);
          }
        } catch (chainError) {
          console.warn('Could not get chain ID:', chainError);
          // Don't fail the connection if chain ID fails
        }
        console.log('Wallet connected successfully');
      } else {
        throw new Error('No wallet address returned');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      const errorMessage = error.message || 'Failed to connect wallet. Please try again.';
      alert(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/marketplace', label: 'Marketplace', icon: Store },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/recommendations', label: 'Recommendations', icon: Sparkles },
    { path: '/ml-analytics', label: 'ML Analytics', icon: Brain },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-secondary relative overflow-hidden">
      {/* Animated Running Gradient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white via-orange-50/30 to-primary/5 animate-gradient-move"></div>
        <motion.div
          animate={{
            x: ['-50%', '150%', '-50%'],
            y: ['-50%', '150%', '-50%'],
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-[800px] h-[800px] bg-gradient-to-r from-primary/10 via-pink-500/10 to-primary/10 rounded-full blur-3xl animate-gradient-flow"
          style={{
            top: '-400px',
            left: '-400px',
          }}
        />
        <motion.div
          animate={{
            x: ['150%', '-50%', '150%'],
            y: ['150%', '-50%', '150%'],
            rotate: [360, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          className="absolute w-[1000px] h-[1000px] bg-gradient-to-r from-orange-500/10 via-primary/10 to-pink-500/10 rounded-full blur-3xl animate-gradient-flow"
          style={{
            bottom: '-500px',
            right: '-500px',
          }}
        />
        <motion.div
          animate={{
            x: ['0%', '100%', '0%'],
            y: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-primary/8 to-orange-500/8 rounded-full blur-3xl"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      
      {/* Navigation - Complete Redesign */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-lg border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 group flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Building2 className="text-white" size={18} />
              </div>
              <span className="text-base sm:text-lg md:text-xl font-bold text-primary hidden xs:inline">PropToken</span>
            </Link>

            {/* Desktop Navigation - Hidden on mobile, visible from md */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                    to={item.path}
                      className={`flex items-center space-x-1.5 px-3 xl:px-4 2xl:px-5 py-2 xl:py-2.5 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                      isActive
                          ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-lg shadow-primary/30'
                          : 'text-accent-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary border border-transparent hover:border-primary/20'
                      }`}
                    >
                      <Icon size={14} className="xl:w-4 xl:h-4" />
                      <span className="hidden 2xl:inline">{item.label}</span>
                      <span className="2xl:hidden">{item.label.length > 10 ? item.label.substring(0, 8) + '...' : item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Medium Screen Navigation - Icons only */}
            <div className="hidden md:flex lg:hidden items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Link
                      to={item.path}
                      className={`p-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-lg shadow-primary/30'
                          : 'text-accent-700 hover:bg-primary/10 hover:text-primary'
                      }`}
                      title={item.label}
                    >
                      <Icon size={18} />
                  </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {!isLoggedIn ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
                  <Link
                    to="/login"
                      className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-accent-700 hover:text-primary transition-colors border border-transparent hover:border-primary/20 rounded-xl"
                  >
                    Login
                  </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                      className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                  >
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Start</span>
                  </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  {!isConnected && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConnectWallet}
                      disabled={isConnecting}
                      className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                    >
                      <Wallet size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{isConnecting ? 'Connecting...' : 'Connect'}</span>
                      <span className="sm:hidden">{isConnecting ? '...' : 'Connect'}</span>
                    </motion.button>
                  )}
                  {isConnected && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDisconnect}
                      className="hidden sm:block px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-accent-600 hover:text-accent-800 transition-colors border border-accent-200 hover:border-accent-300 rounded-xl"
                    >
                      Disconnect
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      logout();
                      disconnectWallet();
                    }}
                    className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
                  >
                    <LogOut size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </motion.button>
                </>
              )}
              
              {/* Network Mode Toggle */}
              <NetworkToggle />
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-accent-600 hover:text-primary rounded-lg transition-colors ml-1"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
        {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-accent-200 bg-white overflow-hidden"
            >
              <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1.5 sm:space-y-2">
                {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                    <motion.div
                      key={item.path}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-2.5 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all ${
                      isActive
                            ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-lg shadow-primary/30'
                        : 'text-accent-700 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                        <Icon size={18} className="sm:w-5 sm:h-5" />
                    <span>{item.label}</span>
                  </Link>
                    </motion.div>
                );
              })}
              <div className="pt-3 mt-3 border-t border-accent-200 space-y-2">
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-2.5 text-center text-sm sm:text-base font-semibold text-accent-700 hover:text-primary transition-colors border border-accent-200 hover:border-primary/20 rounded-xl"
                    >
                      Login
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-2.5 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm sm:text-base font-bold rounded-xl text-center transition-all shadow-lg shadow-primary/30"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <>
                    {!isConnected && (
                      <button
                        onClick={handleConnectWallet}
                          disabled={isConnecting}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-lg shadow-primary/30"
                      >
                          <Wallet size={18} className="sm:w-5 sm:h-5" />
                          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                      </button>
                    )}
                    {isConnected && (
                      <button
                        onClick={handleDisconnect}
                          className="w-full px-4 py-2.5 text-sm sm:text-base font-semibold text-accent-600 hover:text-accent-800 transition-colors border border-accent-200 hover:border-accent-300 rounded-xl"
                      >
                        Disconnect
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        disconnectWallet();
                        setMobileMenuOpen(false);
                      }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-lg shadow-red-500/30"
                    >
                        <LogOut size={18} className="sm:w-5 sm:h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            </motion.div>
        )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer - Orange Theme Design */}
      <footer className="relative bg-gradient-to-br from-primary/20 via-primary/15 to-primary/20 backdrop-blur-sm border-t border-primary/30 mt-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #FF7A00 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              x: ['-10%', '10%', '-10%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.15, 0.1],
              x: ['10%', '-10%', '10%'],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: 5
            }}
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-600 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3 mb-6"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="text-white" size={28} />
                </div>
                <h3 className="text-3xl font-bold text-primary">
                  PropToken
                </h3>
              </motion.div>
              <p className="text-accent-700 text-base leading-relaxed mb-6">
                Real estate tokenization platform for the modern investor. Democratizing property investment through blockchain technology.
              </p>
              <div className="flex items-center space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-2xl flex items-center justify-center transition-colors text-primary hover:text-white"
                >
                  <span className="text-lg">𝕏</span>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-2xl flex items-center justify-center transition-colors text-primary hover:text-white"
                >
                  <span className="text-lg">in</span>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-2xl flex items-center justify-center transition-colors text-primary hover:text-white"
                >
                  <span className="text-lg">f</span>
                </motion.a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <motion.h4
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xl font-bold mb-6 flex items-center space-x-2 text-primary"
              >
                <Store size={20} />
                <span>Platform</span>
              </motion.h4>
              <ul className="space-y-3">
                {[
                  { path: '/', label: 'Home' },
                  { path: '/marketplace', label: 'Marketplace' },
                  { path: '/dashboard', label: 'Dashboard' },
                  { path: '/recommendations', label: 'Recommendations' },
                  { path: '/about', label: 'About' },
                ].map((link, index) => (
                  <motion.li
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className="text-accent-700 hover:text-primary transition-colors flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>{link.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <motion.h4
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xl font-bold mb-6 flex items-center space-x-2 text-primary"
              >
                <Shield size={20} />
                <span>Legal</span>
              </motion.h4>
              <ul className="space-y-3">
                {[
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Disclaimer', href: '#' },
                  { label: 'Cookie Policy', href: '#' },
                ].map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <a
                      href={link.href}
                      className="text-accent-700 hover:text-primary transition-colors flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>{link.label}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <motion.h4
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xl font-bold mb-6 flex items-center space-x-2 text-primary"
              >
                <Mail size={20} />
                <span>Contact</span>
              </motion.h4>
              <ul className="space-y-4">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-3"
                >
                  <Mail className="text-primary mt-1 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-accent-600 text-sm mb-1">Email</p>
                    <a href="mailto:msnkhp@gmail.com" className="text-primary hover:text-primary-600 transition-colors font-medium">
                      msnkhp@gmail.com
                    </a>
                  </div>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <Mail className="text-primary mt-1 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-accent-600 text-sm mb-1">Support</p>
                    <a href="mailto:i229958@nu.edu.pk" className="text-primary hover:text-primary-600 transition-colors font-medium">
                      i229958@nu.edu.pk
                    </a>
                  </div>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start space-x-3"
                >
                  <Building2 className="text-primary mt-1 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-accent-600 text-sm mb-1">Location</p>
                    <p className="text-primary font-medium">FAST NU, Islamabad</p>
                  </div>
                </motion.li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-t-2 border-primary/30 pt-8 mt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-accent-700 text-sm">
                © 2025 <span className="text-primary font-bold">PropToken</span>. All rights reserved.
              </p>
              <div className="text-sm text-accent-700">
                <span>Made by </span>
                <span className="text-primary font-semibold">Sohail Nasir</span>
                <span>, </span>
                <span className="text-primary font-semibold">Moosa Saeed</span>
                <span>, </span>
                <span className="text-primary font-semibold">Ayesha Jawad</span>
                <span> and </span>
                <span className="text-primary font-semibold">Manal Ahsan</span>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

