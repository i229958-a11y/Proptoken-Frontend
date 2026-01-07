import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, Building2, TrendingUp, Shield, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { connectWallet, isMetaMaskInstalled } from '../utils/wallet';

const Login = () => {
  const navigate = useNavigate();
  const { setWalletAddress, updateUser, setKycStatus, setChainId } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Login logic
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }

      // Simple validation - in production, this would call an API
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = users.find(u => u.email === formData.email && u.password === formData.password);

      if (user) {
        updateUser({
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          walletAddress: user.walletAddress || null,
        });
        setKycStatus(user.kycStatus || 'not_submitted');
        if (user.walletAddress) {
          setWalletAddress(user.walletAddress);
        }
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } else {
      // Register logic
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // Save user to localStorage
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Check if user already exists
      if (users.find(u => u.email === formData.email)) {
        setError('User with this email already exists');
        return;
      }

      const newUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password, // In production, this should be hashed
        kycStatus: 'not_submitted',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));

      // Auto login after registration
      updateUser({
        name: newUser.name,
        email: newUser.email,
      });
      setKycStatus('not_submitted');
      
      alert('Registration successful! Please complete your KYC verification.');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Luxury Home Background Image - Fully Transparent & Amazing */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80')`,
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Multi-layer Transparent Overlays for Amazing Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/75 via-orange-600/70 to-orange-700/75"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/20 to-orange-700/40"></div>
        {/* Subtle animated overlay */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"
        />
      </div>
      
      {/* Animated Running Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
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
          className="absolute w-[800px] h-[800px] bg-gradient-to-r from-white/20 via-pink-500/20 to-white/20 rounded-full blur-3xl"
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
          className="absolute w-[1000px] h-[1000px] bg-gradient-to-r from-orange-400/20 via-white/20 to-pink-500/20 rounded-full blur-3xl"
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
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-white/15 to-orange-400/15 rounded-full blur-3xl"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      <div className="relative z-20 w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Animation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block text-white space-y-8"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-3 mb-6"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                  <Building2 className="text-white" size={32} />
                </div>
                <h1 className="text-5xl font-bold">PropToken</h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-light text-white/90 mb-8"
              >
                Real Estate Tokenization Platform
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-primary-400 rounded-2xl flex items-center justify-center">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Instant Tokenization</h3>
                  <p className="text-white/80 text-sm">Transform properties into digital assets instantly</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-primary-400 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">High ROI Returns</h3>
                  <p className="text-white/80 text-sm">Earn passive income from tokenized properties</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-primary-400 rounded-2xl flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Secure & Transparent</h3>
                  <p className="text-white/80 text-sm">Blockchain-powered security for your investments</p>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-4 mt-8"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                <p className="text-3xl font-bold mb-1">$50M+</p>
                <p className="text-white/80 text-xs">Tokenized</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                <p className="text-3xl font-bold mb-1">10K+</p>
                <p className="text-white/80 text-xs">Investors</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                <p className="text-3xl font-bold mb-1">15%</p>
                <p className="text-white/80 text-xs">Avg ROI</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                    <Building2 className="text-white" size={24} />
                  </div>
                  <h1 className="text-3xl font-bold text-accent-800">PropToken</h1>
                </div>
                <p className="text-accent-600">Real Estate Tokenization</p>
              </div>

              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl mb-4 shadow-soft-lg"
                >
                  {isLogin ? (
                    <Lock className="text-white" size={32} />
                  ) : (
                    <User className="text-white" size={32} />
                  )}
                </motion.div>
                <h2 className="text-3xl font-bold text-accent-800 mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-accent-600">
                  {isLogin ? 'Sign in to continue your investment journey' : 'Join thousands of smart investors'}
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6"
                >
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-semibold text-accent-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isLogin ? 0.1 : 0.2 }}
                >
                  <label className="block text-sm font-semibold text-accent-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isLogin ? 0.2 : 0.3 }}
                >
                  <label className="block text-sm font-semibold text-accent-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3.5 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-accent-400 hover:text-accent-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </motion.div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-semibold text-accent-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm your password"
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}

                {isLogin && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary" />
                      <span className="text-sm text-accent-600">Remember me</span>
                    </label>
                    <Link to="#" className="text-sm text-primary hover:text-primary-600 font-medium">
                      Forgot password?
                    </Link>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-bold text-lg shadow-soft-lg transition-all transform"
                >
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={20} />
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-accent-600">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                    }}
                    className="text-primary hover:text-primary-600 font-bold transition-colors"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-accent-200">
                <p className="text-center text-sm text-accent-600 mb-4">Or continue with</p>
                <div className="space-y-3">
                  {/* MetaMask Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (loading) return; // Prevent multiple clicks
                      
                      setLoading(true);
                      setError('');
                      try {
                        if (!isMetaMaskInstalled()) {
                          setError('MetaMask is not installed. Please install MetaMask extension to continue.');
                          setLoading(false);
                          window.open('https://metamask.io/download/', '_blank');
                          return;
                        }

                        // Add small delay to prevent duplicate requests
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        const address = await connectWallet();
                        const { getChainId } = await import('../utils/wallet');
                        const chainId = await getChainId();
                        
                        // Create or find user account with wallet address
                        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                        let user = users.find(u => u.walletAddress === address);
                        
                        if (!user) {
                          // Create new user with wallet
                          user = {
                            id: Date.now(),
                            name: `Wallet User ${address.slice(0, 6)}`,
                            email: `${address.slice(0, 8)}@wallet.proptoken`,
                            walletAddress: address,
                            kycStatus: 'not_submitted',
                            createdAt: new Date().toISOString(),
                            loginMethod: 'metamask'
                          };
                          users.push(user);
                          localStorage.setItem('registeredUsers', JSON.stringify(users));
                        }

                        // Set wallet and user state
                        setWalletAddress(address);
                        if (chainId) setChainId(chainId);
                        
                        updateUser({
                          name: user.name,
                          email: user.email,
                          walletAddress: address,
                        });
                        setKycStatus(user.kycStatus || 'not_submitted');
                        
                        navigate('/dashboard');
                      } catch (error) {
                        console.error('MetaMask connection error:', error);
                        setError(error.message || 'Failed to connect MetaMask. Please try again.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-all shadow-soft"
                  >
                    <Sparkles size={20} />
                    <span>{loading ? 'Connecting...' : 'MetaMask Wallet'}</span>
                  </motion.button>

                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
