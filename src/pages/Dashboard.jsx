import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Wallet, FileText, Bell, TrendingUp, DollarSign, History, Upload, CheckCircle, XCircle, Clock, Building, Plus, Edit, Save, Camera, Mail, MapPin, Shield, Award, Calendar, Phone, Globe, Lock, Eye, EyeOff, Brain, Sparkles, Zap, BarChart3, PieChart, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import { connectWallet, getEthBalance, formatAddress } from '../utils/wallet';
import { getTokenBalance, getUSDTBalance, getUserTokenBalance } from '../utils/contract';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getUserAnalytics, getPropertyAnalytics, getSentiment } from '../ml';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    walletAddress,
    isConnected,
    setWalletAddress,
    isLoggedIn,
    ethBalance,
    propyBalance,
    usdtBalance,
    setEthBalance,
    setPropyBalance,
    setUsdtBalance,
    user,
    updateUser,
    kycStatus,
    kycRejectionReason,
    setKycStatus,
    updateKycDocuments,
    userInvestments,
    notifications,
    markNotificationRead,
    addNotification,
    demoMode,
    setInvestments,
  } = useStore();
  
  const [userPropertyRequests, setUserPropertyRequests] = useState([]);

  const [activeTab, setActiveTab] = useState('profile');
  const [profilePic, setProfilePic] = useState(user.profilePicture);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    bio: user.bio || '',
    dateOfBirth: user.dateOfBirth || '',
    password: '',
    confirmPassword: '',
  });
  const [kycFiles, setKycFiles] = useState({
    cnicFront: null,
    cnicBack: null,
    selfie: null,
    addressProof: null,
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // Load KYC status from localStorage if available
    const loadKYCStatus = async () => {
      try {
        const { getAllKYCApplications } = await import('../utils/backend');
        const applications = getAllKYCApplications();
        const currentUserEmail = user.email;
        if (currentUserEmail) {
          const userApp = applications.find(app => 
            app.userEmail === currentUserEmail || app.userId === currentUserEmail
          );
          if (userApp) {
            setKycStatus(userApp.status, userApp.rejectionReason || '');
          }
        }
      } catch (error) {
        console.error('Error loading KYC status:', error);
      }
    };
    
    loadKYCStatus();
    
    // Refresh KYC status every 3 seconds
    const interval = setInterval(() => {
      loadKYCStatus();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn, navigate, user.email, setKycStatus]);

  useEffect(() => {
    if (isConnected && walletAddress) {
      loadWalletData();
    }
  }, [isConnected, walletAddress]);

  useEffect(() => {
    if (isLoggedIn && user.email) {
      const loadUserRequests = async () => {
        const { getUserRequests } = await import('../utils/backend');
        const requests = getUserRequests(user.email);
        setUserPropertyRequests(requests);
      };
      loadUserRequests();
    }
  }, [isLoggedIn, user.email]);

  // Load investments from backend
  useEffect(() => {
    if (isLoggedIn && user.email) {
      const loadInvestments = async () => {
        const { getUserInvestments, getUserInvestmentStats } = await import('../utils/backend');
        let investments = getUserInvestments(user.email);
        const stats = getUserInvestmentStats(user.email);
        
        // If not in demo mode, sync with on-chain balances
        if (!demoMode && isConnected && walletAddress) {
          try {
            const syncedInvestments = await Promise.all(investments.map(async (inv) => {
              const onChainId = inv.onChainId ?? inv.propertyId;
              const realBalance = await getUserTokenBalance(onChainId, walletAddress);
              return { ...inv, tokens: parseFloat(realBalance) };
            }));
            investments = syncedInvestments;
          } catch (error) {
            console.error('Error syncing on-chain investments:', error);
          }
        }

        // Update store with investments
        const { setInvestments } = useStore.getState();
        setInvestments(investments);
        
        // Update wallet data if available
        const { getUserWalletData } = await import('../utils/backend');
        const walletData = getUserWalletData(user.email);
        if (walletData.walletAddress && walletData.ethBalance) {
          setEthBalance(walletData.ethBalance);
          setPropyBalance(walletData.propyBalance || '0');
        }
      };
      loadInvestments();
      
      // Refresh investments every 5 seconds
      const interval = setInterval(() => {
        loadInvestments();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, user.email, setEthBalance, setPropyBalance, demoMode, isConnected, walletAddress]);

  const loadWalletData = async () => {
    try {
      if (demoMode) {
        // Demo mode: Use demo balances
        setEthBalance('5.2500');
        setPropyBalance('12500.0000');
        setUsdtBalance('10000.00');
      } else {
        // Production mode: Get real balances
        const ethBal = await getEthBalance(walletAddress);
        setEthBalance(ethBal);
        const propyBal = await getTokenBalance(walletAddress);
        setPropyBalance(propyBal);
        const usdtBal = await getUSDTBalance(walletAddress);
        setUsdtBalance(usdtBal);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      // Fallback to demo balance on error in demo mode
      if (demoMode) {
        setEthBalance('5.2500');
        setPropyBalance('12500.0000');
        setUsdtBalance('10000.00');
      }
    }
  };

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      await loadWalletData();
      
      // Save wallet data to backend
      if (isLoggedIn && user.email) {
        const { updateUserWalletData } = await import('../utils/backend');
        updateUserWalletData(user.email, {
          walletAddress: address,
          ethBalance: ethBalance,
          propyBalance: propyBalance,
        });
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleProfileUpdate = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleSaveProfile = () => {
    updateUser({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address,
      bio: profileData.bio,
      dateOfBirth: profileData.dateOfBirth,
    });
    
    // Update password if provided
    if (profileData.password && profileData.password === profileData.confirmPassword) {
      // In a real app, you would update the password via API
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userIndex = users.findIndex(u => u.email === user.email);
      if (userIndex !== -1) {
        users[userIndex].password = profileData.password;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
      }
      alert('Profile updated successfully!');
    } else if (profileData.password && profileData.password !== profileData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    } else {
      alert('Profile updated successfully!');
    }
    
    setIsEditing(false);
    setProfileData({ ...profileData, password: '', confirmPassword: '' });
  };

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        updateUser({ profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycFileUpload = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFiles = { ...kycFiles, [type]: reader.result };
        setKycFiles(newFiles);
        updateKycDocuments(newFiles);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycSubmit = async () => {
    if (!kycFiles.cnicFront || !kycFiles.cnicBack || !kycFiles.selfie || !kycFiles.addressProof) {
      alert('Please upload all required documents');
      return;
    }
    
    try {
      const { submitKYCApplication } = await import('../utils/backend');
      const userData = {
        id: user.email,
        email: user.email,
        name: user.name || user.email,
      };
      
      const application = submitKYCApplication(userData, kycFiles);
      setKycStatus('submitted');
      updateKycDocuments(kycFiles);
      
      addNotification({
        title: 'KYC Submitted',
        message: 'Your KYC application has been submitted successfully. It is now under review by our admin team.',
        type: 'kyc',
      });
      
      alert('KYC documents submitted successfully. Your application is under review.');
    } catch (error) {
      console.error('Error submitting KYC:', error);
      alert('Failed to submit KYC. Please try again.');
    }
  };

  const getKycStatusBadge = () => {
    const statusConfig = {
      not_submitted: { color: 'bg-accent-200 text-accent-800', icon: <Clock size={16} />, text: 'Not Submitted' },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: <Clock size={16} />, text: 'Submitted' },
      hold: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} />, text: 'Hold - KYC Being Verified' },
      approved: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} />, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: <XCircle size={16} />, text: 'Rejected' },
    };
    const config = statusConfig[kycStatus] || statusConfig.not_submitted;
    return (
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl ${config.color}`}>
        {config.icon}
        <span className="font-medium">{config.text}</span>
      </div>
    );
  };

  const [mlAnalytics, setMLAnalytics] = useState(null);
  const [userBehavior, setUserBehavior] = useState(null);

  useEffect(() => {
    if (isLoggedIn && userInvestments.length > 0) {
      // Generate user analytics
      const userData = {
        totalInvestment: userInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0),
        investmentCount: userInvestments.length,
        riskTolerance: user.riskTolerance || 0.5,
        preferredType: user.preferredType || 'residential',
        accountAge: 180, // days
        recentMessages: notifications.filter(n => n.message).map(n => ({ text: n.message })),
      };
      const analytics = getUserAnalytics(userData, []);
      setMLAnalytics(analytics);
      setUserBehavior(analytics);
    }
  }, [isLoggedIn, userInvestments, notifications, user]);

  // Sample ROI data for chart with ML predictions
  const roiData = [
    { month: 'Jan', roi: 2.1 },
    { month: 'Feb', roi: 2.3 },
    { month: 'Mar', roi: 2.5 },
    { month: 'Apr', roi: 2.8 },
    { month: 'May', roi: 3.0 },
    { month: 'Jun', roi: 3.2 },
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'investments', label: 'My Investments', icon: <TrendingUp size={20} /> },
    { id: 'kyc', label: 'KYC', icon: <FileText size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { id: 'transactions', label: 'Transactions', icon: <History size={20} /> },
  ];

  // Calculate stats
  const totalInvestment = userInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalTokens = userInvestments.reduce((sum, inv) => sum + (inv.tokens || 0), 0);
  const totalValuation = userInvestments.reduce((sum, inv) => {
    const currentValuation = inv.currentValuation || (inv.amount * (1 + (inv.roi || 12) / 100));
    return sum + currentValuation;
  }, 0);
  const totalProfit = totalValuation - totalInvestment;
  const totalProfitPercent = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-primary via-orange-500 to-pink-600 animate-gradient bg-[length:200%_auto] mb-3"
              >
                Dashboard
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-accent-600"
              >
                Welcome back, {user.name || 'Investor'}! 👋
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 md:mt-0"
            >
              <Link
                to="/ml-analytics"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-bold shadow-lg transition-all transform hover:scale-105"
              >
                <Sparkles size={20} />
                <span>ML Analytics</span>
              </Link>
        </motion.div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-primary/10 via-primary/5 to-white rounded-3xl p-6 shadow-lg border border-primary/20 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <DollarSign className="text-primary" size={24} />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  +{totalProfitPercent.toFixed(1)}%
                </span>
              </div>
              <p className="text-sm text-accent-600 mb-1">Total Investment</p>
              <p className="text-3xl font-bold text-accent-900">
                ${totalInvestment.toLocaleString()}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 via-blue-50/50 to-white rounded-3xl p-6 shadow-lg border border-blue-200/50 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-2xl">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-accent-600 mb-1">Tokens Owned</p>
              <p className="text-3xl font-bold text-accent-900">
                {totalTokens.toLocaleString()}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-50 via-green-50/50 to-white rounded-3xl p-6 shadow-lg border border-green-200/50 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-2xl">
                  <BarChart3 className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-accent-600 mb-1">Live Valuation</p>
              <p className="text-3xl font-bold text-accent-900">
                ${totalValuation.toLocaleString()}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-50 via-purple-50/50 to-white rounded-3xl p-6 shadow-lg border border-purple-200/50 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-2xl">
                  <Activity className="text-purple-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-accent-600 mb-1">Total Profit</p>
              <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Premium Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-8 overflow-hidden"
        >
          <div className="flex flex-wrap border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative flex items-center space-x-2 px-6 py-4 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-accent-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-600 rounded-t-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab.icon}
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="p-8 bg-gradient-to-br from-white to-gray-50/50">
            {/* Profile Tab - Amazing Design */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Profile Header Card */}
                <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-white rounded-3xl p-8 shadow-soft-lg border border-primary/20 overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, #FF7A00 1px, transparent 0)`,
                      backgroundSize: '40px 40px'
                    }}></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                      {/* Profile Picture */}
                      <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-primary to-primary-600 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
                        <div className="relative">
                          <img
                            src={profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FF7A00&color=fff&size=200&bold=true`}
                            alt="Profile"
                            className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-white shadow-2xl"
                          />
                          <label className="absolute bottom-2 right-2 bg-gradient-to-r from-primary to-primary-600 text-white p-3 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-lg">
                            <Camera size={20} />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePicUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Profile Info */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                          <h3 className="text-3xl md:text-4xl font-bold text-accent-900">
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => handleProfileUpdate('name', e.target.value)}
                                className="bg-white border-2 border-primary rounded-2xl px-4 py-2 text-2xl font-bold w-full md:w-auto"
                              />
                            ) : (
                              user.name || 'User'
                            )}
                          </h3>
                          {!isEditing && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setIsEditing(true)}
                              className="p-2 bg-white hover:bg-primary/10 rounded-2xl shadow-soft transition-colors"
                            >
                              <Edit size={20} className="text-primary" />
                            </motion.button>
                          )}
                        </div>
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-6 mb-4">
                          <div className="flex items-center space-x-2 text-accent-600">
                            <Mail size={18} />
                            <span className="font-medium">
                              {isEditing ? (
                                <input
                                  type="email"
                                  value={profileData.email}
                                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                                  className="bg-white border-2 border-primary rounded-xl px-3 py-1"
                                />
                              ) : (
                                user.email || 'user@example.com'
                              )}
                            </span>
                          </div>
                          {walletAddress && (
                            <div className="flex items-center space-x-2 text-accent-600">
                              <Wallet size={18} />
                              <span className="font-mono text-sm">{formatAddress(walletAddress)}</span>
                            </div>
                          )}
                        </div>
                        {profileData.bio && (
                          <p className="text-accent-700 text-lg mb-4">{profileData.bio}</p>
                        )}
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                          <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft">
                            <Award className="text-primary" size={18} />
                            <span className="text-sm font-semibold text-accent-800">Member Since</span>
                            <span className="text-sm text-accent-600">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2024'}
                            </span>
                          </div>
                          {kycStatus === 'approved' && (
                            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-2xl">
                              <Shield className="text-green-700" size={18} />
                              <span className="text-sm font-semibold text-green-800">KYC Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* List Property Banner */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20 rounded-3xl p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Building className="text-white" size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-accent-900 mb-1">List Your Property</h3>
                        <p className="text-sm text-accent-600">Submit your property for tokenization and start earning</p>
                      </div>
                    </div>
                    <Link
                      to="/list-property"
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-bold shadow-lg transition-all transform hover:scale-105"
                    >
                      <Plus size={20} />
                      <span>List Property</span>
                    </Link>
                  </div>
                </div>

                {/* Property Requests */}
                {userPropertyRequests.length > 0 && (
                  <div className="bg-gradient-to-br from-accent-50 to-white rounded-3xl p-6 shadow-soft-lg border border-accent-200">
                    <h3 className="text-xl font-bold text-accent-900 mb-4 flex items-center space-x-2">
                      <Building className="text-primary" size={24} />
                      <span>My Property Requests</span>
                    </h3>
                    <div className="space-y-3">
                      {userPropertyRequests.map((request) => (
                        <motion.div
                          key={request.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white p-5 rounded-2xl shadow-soft border border-accent-200"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-lg text-accent-900">{request.name}</p>
                              <p className="text-sm text-accent-600 flex items-center mt-1">
                                <MapPin size={14} className="mr-1" />
                                {request.location}
                              </p>
                            </div>
                            <span className={`px-4 py-2 rounded-2xl text-sm font-bold capitalize ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Profile Details Form */}
                <div className="bg-white rounded-3xl shadow-soft-lg p-8 border border-accent-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-accent-900">Profile Information</h3>
                    {isEditing ? (
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveProfile}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-600 text-white rounded-2xl font-bold shadow-lg"
                        >
                          <Save size={18} />
                          <span>Save Changes</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setIsEditing(false);
                            setProfileData({
                              name: user.name || '',
                              email: user.email || '',
                              phone: user.phone || '',
                              address: user.address || '',
                              bio: user.bio || '',
                              dateOfBirth: user.dateOfBirth || '',
                              password: '',
                              confirmPassword: '',
                            });
                          }}
                          className="px-6 py-3 bg-accent-100 hover:bg-accent-200 text-accent-800 rounded-2xl font-semibold transition-colors"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-2xl font-bold shadow-lg transition-colors"
                      >
                        <Edit size={18} />
                        <span>Edit Profile</span>
                      </motion.button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-accent-700 mb-2 flex items-center space-x-2">
                        <User size={16} />
                        <span>Full Name</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => handleProfileUpdate('name', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-accent-50 border-2 border-accent-200 rounded-2xl text-accent-800">
                          {user.name || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-accent-700 mb-2 flex items-center space-x-2">
                        <Mail size={16} />
                        <span>Email Address</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleProfileUpdate('email', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-accent-50 border-2 border-accent-200 rounded-2xl text-accent-800">
                          {user.email || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-accent-700 mb-2 flex items-center space-x-2">
                        <Phone size={16} />
                        <span>Phone Number</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                          placeholder="+92 300 1234567"
                          className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-accent-50 border-2 border-accent-200 rounded-2xl text-accent-800">
                          {user.phone || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-accent-700 mb-2 flex items-center space-x-2">
                        <Calendar size={16} />
                        <span>Date of Birth</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => handleProfileUpdate('dateOfBirth', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-accent-50 border-2 border-accent-200 rounded-2xl text-accent-800">
                          {user.dateOfBirth || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-accent-700 mb-2 flex items-center space-x-2">
                        <MapPin size={16} />
                        <span>Address</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.address}
                          onChange={(e) => handleProfileUpdate('address', e.target.value)}
                          placeholder="Enter your address"
                          className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-accent-50 border-2 border-accent-200 rounded-2xl text-accent-800">
                          {user.address || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-accent-700 mb-2">Bio</label>
                      {isEditing ? (
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 bg-accent-50 border-2 border-accent-200 rounded-2xl text-accent-800 min-h-[100px]">
                          {user.bio || 'No bio added yet'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-accent-700 mb-2 flex items-center space-x-2">
                        <Wallet size={16} />
                        <span>Wallet Address</span>
                      </label>
                      <div className="w-full px-4 py-3 bg-accent-50 border-2 border-accent-200 rounded-2xl text-accent-800 font-mono text-sm">
                        {walletAddress ? formatAddress(walletAddress) : 'Not connected'}
                      </div>
                    </div>
                    {isEditing && (
                      <>
                        <div>
                          <label className="block text-sm font-bold text-accent-700 mb-2 flex items-center space-x-2">
                            <Lock size={16} />
                            <span>New Password</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={profileData.password}
                              onChange={(e) => handleProfileUpdate('password', e.target.value)}
                              placeholder="Enter new password"
                              className="w-full px-4 py-3 pr-12 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent-400 hover:text-accent-600"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-accent-700 mb-2 flex items-center space-x-2">
                            <Lock size={16} />
                            <span>Confirm Password</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={profileData.confirmPassword}
                              onChange={(e) => handleProfileUpdate('confirmPassword', e.target.value)}
                              placeholder="Confirm new password"
                              className="w-full px-4 py-3 pr-12 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent-400 hover:text-accent-600"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Investments Tab */}
            {activeTab === 'investments' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-white via-primary/5 to-white p-8 rounded-3xl shadow-xl border border-primary/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <TrendingUp className="text-primary" size={24} />
                    </div>
                      <div>
                        <h3 className="text-2xl font-bold text-accent-900">ROI Performance</h3>
                        <p className="text-sm text-accent-600">Your investment growth over time</p>
                  </div>
                    </div>
                    {mlAnalytics && (
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl border border-primary/20"
                      >
                        <Brain size={18} className="text-primary" />
                        <span className="text-sm font-bold text-primary">
                          {mlAnalytics.cluster.clusterLabel} Investor
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={roiData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #FF7A00',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="roi" 
                        stroke="#FF7A00" 
                        strokeWidth={3}
                        dot={{ fill: '#FF7A00', r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* ML Investment Behavior Prediction */}
                {mlAnalytics && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-primary/10 via-primary/5 to-white p-8 rounded-3xl shadow-xl border-2 border-primary/20"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-primary/20 rounded-2xl">
                        <Brain className="text-primary" size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-accent-900">ML Investment Behavior Analysis</h3>
                        <p className="text-sm text-accent-600">AI-powered insights about your investment patterns</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 shadow-md"
                      >
                        <p className="text-sm font-semibold text-accent-600 mb-2">Investor Cluster</p>
                        <p className="text-2xl font-bold text-primary mb-2">{mlAnalytics.cluster.clusterName}</p>
                        <p className="text-sm text-accent-500">{mlAnalytics.cluster.description}</p>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 shadow-md"
                      >
                        <p className="text-sm font-semibold text-accent-600 mb-2">Risk Assessment</p>
                        <p className={`text-2xl font-bold mb-2 ${mlAnalytics.fraudCheck.isSuspicious ? 'text-red-600' : 'text-green-600'}`}>
                          {mlAnalytics.fraudCheck.isSuspicious ? '⚠️ Suspicious Activity' : '✓ Normal Activity'}
                        </p>
                        <p className="text-sm text-accent-500">
                          Suspicion Score: {(mlAnalytics.fraudCheck.suspicionScore * 100).toFixed(1)}%
                        </p>
                      </motion.div>
                      {mlAnalytics.sentiment && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="md:col-span-2 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 shadow-md"
                        >
                          <p className="text-sm font-semibold text-accent-600 mb-3">Sentiment Analysis</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-lg font-bold ${mlAnalytics.sentiment.overall > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Overall: {mlAnalytics.sentiment.overall > 0 ? 'Positive' : 'Negative'}
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-semibold text-sm">
                                +{mlAnalytics.sentiment.positive}
                              </span>
                              <span className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold text-sm">
                                -{mlAnalytics.sentiment.negative}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-bold text-accent-900 mb-2">My Properties</h3>
                      <p className="text-accent-600">Your investment portfolio overview</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <Building className="text-primary" size={28} />
                    </div>
                  </div>
                  {userInvestments && userInvestments.length > 0 ? (
                    <div className="space-y-6">
                      {userInvestments.map((inv, index) => {
                        // Calculate current valuation based on ROI
                        const currentValuation = inv.currentValuation || 
                          (inv.amount * (1 + (inv.roi || 12) / 100));
                        const profit = currentValuation - (inv.amount || 0);
                        const profitPercent = inv.amount > 0 ? (profit / inv.amount) * 100 : 0;
                        
                        return (
                          <motion.div
                            key={inv.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01, y: -5 }}
                            className="bg-gradient-to-br from-white via-primary/5 to-white rounded-3xl shadow-xl p-8 border-2 border-primary/10 hover:border-primary/30 transition-all overflow-hidden relative group"
                          >
                            {/* Decorative gradient overlay */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-6">
                              {/* Property Image */}
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-full md:w-56 h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                              >
                                <img 
                                  src={inv.propertyImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'} 
                                  alt={inv.propertyName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400';
                                  }}
                                />
                              </motion.div>
                              
                              {/* Investment Details */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-xl font-bold text-accent-900 mb-1">
                                      {inv.propertyName || 'Property Investment'}
                                    </h3>
                                    <p className="text-sm text-accent-600 flex items-center space-x-1">
                                      <MapPin size={14} />
                                      <span>{inv.propertyLocation || 'Location not specified'}</span>
                                    </p>
                                  </div>
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="text-right"
                                  >
                                    <p className="text-sm font-semibold text-accent-600 mb-1">ROI</p>
                                    <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg">
                                      <p className="text-2xl font-bold">
                                      {inv.roi || 12}%
                                    </p>
                                  </div>
                                  </motion.div>
                                </div>
                                
                                {/* Investment Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-2xl border border-primary/20"
                                  >
                                    <p className="text-xs font-semibold text-accent-600 mb-2">Tokens Owned</p>
                                    <p className="text-2xl font-bold text-primary">
                                      {parseFloat(inv.tokens || 0).toLocaleString()}
                                    </p>
                                  </motion.div>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-blue-50 to-blue-50/50 p-4 rounded-2xl border border-blue-200/50"
                                  >
                                    <p className="text-xs font-semibold text-accent-600 mb-2">Invested Amount</p>
                                    <p className="text-2xl font-bold text-accent-900">
                                      ${parseFloat(inv.amount || 0).toLocaleString()}
                                    </p>
                                  </motion.div>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-green-50 to-green-50/50 p-4 rounded-2xl border border-green-200/50"
                                  >
                                    <p className="text-xs font-semibold text-accent-600 mb-2">Current Valuation</p>
                                    <p className="text-2xl font-bold text-green-600">
                                      ${parseFloat(currentValuation).toLocaleString()}
                                    </p>
                                  </motion.div>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className={`p-4 rounded-2xl border ${
                                      profit >= 0 
                                        ? 'bg-gradient-to-br from-green-50 to-green-50/50 border-green-200/50' 
                                        : 'bg-gradient-to-br from-red-50 to-red-50/50 border-red-200/50'
                                    }`}
                                  >
                                    <p className="text-xs font-semibold text-accent-600 mb-2">Profit</p>
                                    <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {profit >= 0 ? '+' : ''}${parseFloat(profit).toLocaleString()}
                                    </p>
                                    <p className={`text-sm font-semibold ${profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                                    </p>
                                  </motion.div>
                                </div>
                                
                                {/* Investment Date */}
                                <div className="flex items-center justify-between pt-4 border-t border-accent-200">
                                  <p className="text-xs text-accent-500 flex items-center space-x-1">
                                    <Calendar size={12} />
                                    <span>
                                      Invested: {inv.investedAt 
                                        ? new Date(inv.investedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                          })
                                        : 'N/A'}
                                    </span>
                                  </p>
                                  {inv.transactionHash && (
                                    <p className="text-xs text-accent-500 font-mono">
                                      TX: {inv.transactionHash.substring(0, 10)}...
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-accent-50 rounded-2xl">
                      <Building className="mx-auto text-accent-400 mb-4" size={48} />
                      <p className="text-accent-600 mb-2">No investments yet</p>
                      <p className="text-sm text-accent-500">Start investing in properties from the Marketplace</p>
                    </div>
                  )}
                </div>
                {userInvestments && userInvestments.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-8 py-4 bg-gradient-to-r from-primary via-primary-600 to-primary hover:from-primary-600 hover:via-primary-700 hover:to-primary-600 text-white rounded-3xl font-bold text-lg transition-all shadow-2xl flex items-center justify-center space-x-3"
                  >
                    <DollarSign size={24} />
                    <span>Withdraw Earnings</span>
                    <Zap size={20} />
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* KYC Tab */}
            {activeTab === 'kyc' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-accent-800">KYC Verification</h3>
                  {getKycStatusBadge()}
                </div>
                {kycStatus === 'rejected' && kycRejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-red-800 font-semibold mb-1">Rejection Reason:</p>
                    <p className="text-red-700">{kycRejectionReason}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-accent-700 mb-2">
                      CNIC Front
                    </label>
                    <div className="border-2 border-dashed border-accent-300 rounded-2xl p-6 text-center">
                      {kycFiles.cnicFront ? (
                        <img src={kycFiles.cnicFront} alt="CNIC Front" className="max-h-32 mx-auto rounded-2xl" />
                      ) : (
                        <div>
                          <Upload className="mx-auto text-accent-400 mb-2" size={32} />
                          <p className="text-sm text-accent-600">Click to upload</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleKycFileUpload('cnicFront', e)}
                        className="hidden"
                        id="cnicFront"
                      />
                      <label htmlFor="cnicFront" className="cursor-pointer text-primary font-medium">
                        Upload
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-accent-700 mb-2">
                      CNIC Back
                    </label>
                    <div className="border-2 border-dashed border-accent-300 rounded-2xl p-6 text-center">
                      {kycFiles.cnicBack ? (
                        <img src={kycFiles.cnicBack} alt="CNIC Back" className="max-h-32 mx-auto rounded-2xl" />
                      ) : (
                        <div>
                          <Upload className="mx-auto text-accent-400 mb-2" size={32} />
                          <p className="text-sm text-accent-600">Click to upload</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleKycFileUpload('cnicBack', e)}
                        className="hidden"
                        id="cnicBack"
                      />
                      <label htmlFor="cnicBack" className="cursor-pointer text-primary font-medium">
                        Upload
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-accent-700 mb-2">
                      Selfie
                    </label>
                    <div className="border-2 border-dashed border-accent-300 rounded-2xl p-6 text-center">
                      {kycFiles.selfie ? (
                        <img src={kycFiles.selfie} alt="Selfie" className="max-h-32 mx-auto rounded-2xl" />
                      ) : (
                        <div>
                          <Upload className="mx-auto text-accent-400 mb-2" size={32} />
                          <p className="text-sm text-accent-600">Click to upload</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleKycFileUpload('selfie', e)}
                        className="hidden"
                        id="selfie"
                      />
                      <label htmlFor="selfie" className="cursor-pointer text-primary font-medium">
                        Upload
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-accent-700 mb-2">
                      Address Proof
                    </label>
                    <div className="border-2 border-dashed border-accent-300 rounded-2xl p-6 text-center">
                      {kycFiles.addressProof ? (
                        <img src={kycFiles.addressProof} alt="Address Proof" className="max-h-32 mx-auto rounded-2xl" />
                      ) : (
                        <div>
                          <Upload className="mx-auto text-accent-400 mb-2" size={32} />
                          <p className="text-sm text-accent-600">Click to upload</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleKycFileUpload('addressProof', e)}
                        className="hidden"
                        id="addressProof"
                      />
                      <label htmlFor="addressProof" className="cursor-pointer text-primary font-medium">
                        Upload
                      </label>
                    </div>
                  </div>
                </div>
                {kycStatus === 'not_submitted' && (
                  <button
                    onClick={handleKycSubmit}
                    className="px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-2xl font-semibold transition-colors"
                  >
                    Submit KYC
                  </button>
                )}
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-4 rounded-2xl cursor-pointer transition-colors ${
                        notif.read ? 'bg-accent-50' : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-accent-800">{notif.title}</p>
                          <p className="text-sm text-accent-600 mt-1">{notif.message}</p>
                          <p className="text-xs text-accent-500 mt-2">
                            {new Date(notif.timestamp || Date.now()).toLocaleString()}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-accent-600 text-center py-8">No notifications</p>
                )}
              </motion.div>
            )}

            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Always show demo wallet for demo purposes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-green-50 via-green-50/50 to-white border-2 border-green-200 rounded-3xl p-6 mb-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <Sparkles className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800">Demo Wallet Active</p>
                      <p className="text-xs text-green-600">Using demo balances for testing purposes</p>
                    </div>
                  </div>
                </motion.div>

                {!isConnected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6 mb-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Wallet className="text-blue-600" size={24} />
                        <div>
                          <p className="text-sm font-semibold text-blue-800">Wallet Not Connected</p>
                          <p className="text-xs text-blue-600">Showing demo balances. Connect wallet for real-time data.</p>
                        </div>
                      </div>
                    <button
                      onClick={handleConnectWallet}
                        className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors text-sm"
                    >
                        Connect Wallet
                    </button>
                  </div>
                  </motion.div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-gradient-to-br from-primary-50 via-primary/10 to-white p-8 rounded-3xl shadow-xl border-2 border-primary/20 relative overflow-hidden"
                      >
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-primary/20 rounded-2xl">
                              <Wallet className="text-primary" size={28} />
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${demoMode ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {demoMode ? 'DEMO' : 'LIVE'}
                          </span>
                          </div>
                          <p className="text-sm font-semibold text-accent-600 mb-2">ETH Balance</p>
                          <p className="text-4xl font-bold text-accent-900 mb-2">
                            {demoMode || !isConnected ? '12.5432' : parseFloat(ethBalance).toFixed(4)} ETH
                          </p>
                          <p className="text-lg font-semibold text-green-600">
                            ≈ ${demoMode || !isConnected ? '45,234' : (parseFloat(ethBalance) * 3600).toFixed(0).toLocaleString()} USD
                          </p>
                          <p className="text-xs text-accent-500 mt-2">{demoMode ? 'Demo balance for testing' : 'Live balance'}</p>
                      </div>
                      </motion.div>
                      {/* USDT Balance Card */}
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-gradient-to-br from-emerald-50 via-emerald-500/10 to-white p-8 rounded-3xl shadow-xl border-2 border-emerald-200/50 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl">
                              <DollarSign className="text-emerald-600" size={28} />
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${demoMode ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                              {demoMode ? 'DEMO' : 'LIVE'}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-accent-600 mb-2">USDT Balance</p>
                          <p className="text-4xl font-bold text-accent-900 mb-2">
                            {demoMode || !isConnected ? '10,000.00' : parseFloat(usdtBalance).toLocaleString()} USDT
                          </p>
                          <p className="text-lg font-semibold text-emerald-600">
                            ≈ ${demoMode || !isConnected ? '10,000' : parseFloat(usdtBalance).toLocaleString()} USD
                          </p>
                          <p className="text-xs text-accent-500 mt-2">{demoMode ? 'Demo balance for testing' : 'Live on-chain balance'}</p>
                        </div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-gradient-to-br from-blue-50 via-blue-500/10 to-white p-8 rounded-3xl shadow-xl border-2 border-blue-200/50 relative overflow-hidden"
                      >
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-2xl">
                              <DollarSign className="text-blue-600" size={28} />
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${demoMode ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {demoMode ? 'DEMO' : 'LIVE'}
                          </span>
                          </div>
                          <p className="text-sm font-semibold text-accent-600 mb-2">PROPY Balance</p>
                          <p className="text-4xl font-bold text-accent-900 mb-2">
                            {demoMode || !isConnected ? '28,450.75' : parseFloat(propyBalance).toFixed(4)} PROPY
                          </p>
                          <p className="text-lg font-semibold text-blue-600">
                            ≈ ${demoMode || !isConnected ? '71,126' : (parseFloat(propyBalance) * 2.5).toFixed(0).toLocaleString()} USD
                          </p>
                          <p className="text-xs text-accent-500 mt-2">{demoMode ? 'Demo balance for testing' : 'Live balance'}</p>
                      </div>
                      </motion.div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-3xl shadow-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-accent-600 mb-2">Connected Account</p>
                      <p className="text-lg font-semibold text-accent-800 font-mono">
                            {walletAddress || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'}
                      </p>
                    </div>
                        <div className="p-3 bg-green-100 rounded-2xl">
                          <CheckCircle className="text-green-600" size={24} />
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-accent-500 mb-1">Total Portfolio Value</p>
                            <p className="text-xl font-bold text-primary">
                              ${isDemoMode || !isConnected ? '116,360' : ((parseFloat(ethBalance) * 3600) + (parseFloat(propyBalance) * 2.5)).toFixed(0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-accent-500 mb-1">Available for Investment</p>
                            <p className="text-xl font-bold text-green-600">
                              ${isDemoMode || !isConnected ? '85,000' : ((parseFloat(ethBalance) * 3600) + (parseFloat(propyBalance) * 2.5) * 0.7).toFixed(0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
              </motion.div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {isConnected ? (
                  <div className="space-y-4">
                    {userInvestments && userInvestments.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-accent-900 mb-4">Investment Transactions</h3>
                        {userInvestments.map((inv, index) => (
                          <div
                            key={inv.id || index}
                            className="bg-white rounded-2xl shadow-soft p-4 border border-primary/10 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                  <Building className="text-primary" size={24} />
                                </div>
                                <div>
                                  <p className="font-semibold text-accent-900">{inv.propertyName || 'Property Investment'}</p>
                                  <p className="text-sm text-accent-600">
                                    {inv.investedAt 
                                      ? new Date(inv.investedAt).toLocaleString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">+{parseFloat(inv.tokens || 0).toLocaleString()} Tokens</p>
                                <p className="text-sm text-accent-600">${parseFloat(inv.amount || 0).toLocaleString()}</p>
                                {inv.transactionHash && (
                                  <p className="text-xs text-accent-500 font-mono mt-1">
                                    {inv.transactionHash.substring(0, 16)}...
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <History className="mx-auto text-accent-400 mb-4" size={48} />
                        <p className="text-accent-600 mb-2">No transactions yet</p>
                        <p className="text-sm text-accent-500">Start investing in properties to see your transaction history</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="mx-auto text-accent-400 mb-4" size={48} />
                    <p className="text-accent-600">Connect your wallet to view transaction history</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

