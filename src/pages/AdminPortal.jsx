import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Users, FileCheck, Building, Bell, Settings, LogOut, CheckCircle, XCircle, Eye, EyeOff, Sparkles, TrendingUp, FileText, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { tctTestPasswords } from '../data/tctPasswords';
import { sampleProperties } from '../data/properties';
import { getSponsoredAnalytics } from '../utils/sponsored';
import { getPendingPropertyRequests, approvePropertyListing, rejectPropertyListing, getAuditLogs, linkAdminToUser, getAdminLinkedUser, getAllKYCApplications, getPendingKYCApplications, approveKYCApplication, rejectKYCApplication } from '../utils/backend';
import { getAllUsersAdmin, getAllTransactionsAdmin, getKYCApplications, approveKYC, rejectKYC, getProperties, approveProperty, rejectProperty } from '../utils/api';
import Modal from '../components/Modal';
import { getFraudSignals, getKYCScore, getMarketPredictions, getPropertyAnalytics } from '../ml';
import { approveProperty as approvePropertyOnChain, setPropertyActive, getContractUSDTBalance, adminWithdraw } from '../utils/contract';

const AdminPortal = () => {
  const navigate = useNavigate();
  const {
    adminLoggedIn,
    setAdminLoggedIn,
    properties,
    setProperties,
    setKycStatus,
    kycStatus,
    notifications,
    addNotification,
    contractFrozen,
    setContractFrozen,
    demoMode,
    isConnected,
    walletAddress,
  } = useStore();

  const [contractUsdtBalance, setContractUsdtBalance] = useState('0.00');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    twoFA: '',
  });
  const [activeTab, setActiveTab] = useState('requests');
  const [selectedKycUser, setSelectedKycUser] = useState(null);
  const [kycRejectionReason, setKycRejectionReason] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sponsoredRank, setSponsoredRank] = useState(1);
  const [selectedPropertyForSponsored, setSelectedPropertyForSponsored] = useState(null);
  const [propertyRequests, setPropertyRequests] = useState([]);
  const [selectedRequestForReject, setSelectedRequestForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [currentAdminEmail, setCurrentAdminEmail] = useState('');
  const [kycApplications, setKycApplications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    if (properties.length === 0) {
      setProperties(sampleProperties);
    }
  }, [properties.length, setProperties]);

  useEffect(() => {
    if (adminLoggedIn && !demoMode && isConnected && walletAddress) {
      const loadContractStats = async () => {
        try {
          const balance = await getContractUSDTBalance();
          setContractUsdtBalance(balance);
        } catch (error) {
          console.error('Error loading contract balance:', error);
        }
      };
      loadContractStats();
    }
  }, [adminLoggedIn, demoMode, isConnected, walletAddress]);

  const loadAdminData = async () => {
    if (!adminLoggedIn) return;
    
    try {
      // Load KYC applications from MongoDB
      try {
        const kycResponse = await getKYCApplications();
        setKycApplications(kycResponse.applications || []);
      } catch (error) {
        console.error('Error loading KYC applications:', error);
        // Fallback to localStorage
        const kycApps = getAllKYCApplications();
        setKycApplications(kycApps);
      }
      
      // Load all users from MongoDB
      try {
        setLoadingUsers(true);
        const usersResponse = await getAllUsersAdmin();
        setAllUsers(usersResponse.users || []);
      } catch (error) {
        console.error('Error loading users:', error);
        setAllUsers([]);
      } finally {
        setLoadingUsers(false);
      }
      
      // Load all transactions from MongoDB
      try {
        setLoadingTransactions(true);
        const transactionsResponse = await getAllTransactionsAdmin();
        setAllTransactions(transactionsResponse.transactions || []);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setAllTransactions([]);
      } finally {
        setLoadingTransactions(false);
      }
      
      // Load pending property requests (from localStorage for now)
      const requests = getPendingPropertyRequests();
      setPropertyRequests(requests);
      
      // Load audit logs (from localStorage for now)
      const logs = getAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  useEffect(() => {
    if (adminLoggedIn) {
      loadAdminData();
    }
  }, [adminLoggedIn]);

  // Refresh admin data every 5 seconds when admin is logged in
  useEffect(() => {
    if (!adminLoggedIn) return;
    
    const interval = setInterval(() => {
      loadAdminData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [adminLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Try MongoDB API login first
    try {
      const { loginUser, getCurrentUser } = await import('../utils/api');
      const response = await loginUser(loginForm.email, loginForm.password);
      
      if (response.success && response.user) {
        // Check if user is admin
        const currentUser = await getCurrentUser();
        if (currentUser.user && currentUser.user.isAdmin) {
          setAdminLoggedIn(true);
          setCurrentAdminEmail(loginForm.email);
          setLoginForm({ email: '', password: '', twoFA: '' });
          return;
        } else {
          alert('Access denied. Admin privileges required.');
          return;
        }
      }
    } catch (error) {
      console.error('API login error:', error);
      // Fallback to local admin check
    }
    
    // Fallback: Auto login for admin@gmail.com with admin123 (2FA not required)
    if (loginForm.email.toLowerCase() === 'admin@gmail.com' && loginForm.password === 'admin123') {
      setAdminLoggedIn(true);
      setCurrentAdminEmail(loginForm.email);
      setLoginForm({ email: '', password: '', twoFA: '' });
      return;
    }
    
    // Check if password is in TCT passwords list (2FA required)
    if (tctTestPasswords.includes(loginForm.password) && loginForm.email && loginForm.twoFA) {
      setAdminLoggedIn(true);
      setCurrentAdminEmail(loginForm.email);
      setLoginForm({ email: '', password: '', twoFA: '' });
    } else {
      alert('Invalid credentials. Please check your email, password, and 2FA code.');
    }
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    navigate('/');
  };

  const handleKycApprove = async (applicationId) => {
    try {
      const result = approveKYCApplication(applicationId, currentAdminEmail);
      if (result) {
        // Refresh KYC applications
        const updatedApps = getAllKYCApplications();
        setKycApplications(updatedApps);
        
        // Refresh audit logs
        const logs = getAuditLogs();
        setAuditLogs(logs);
        
        alert(`KYC approved successfully for ${result.userName || result.userEmail}`);
      } else {
        alert('Failed to approve KYC application');
      }
    } catch (error) {
      console.error('Error approving KYC:', error);
      alert('Failed to approve KYC. Please try again.');
    }
  };

  const handleKycReject = async () => {
    if (!kycRejectionReason || !selectedKycUser) {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      const result = rejectKYCApplication(selectedKycUser.id, currentAdminEmail, kycRejectionReason);
      if (result) {
        // Refresh KYC applications
        const updatedApps = getAllKYCApplications();
        setKycApplications(updatedApps);
        
        // Refresh audit logs
        const logs = getAuditLogs();
        setAuditLogs(logs);
        
        alert(`KYC rejected for ${result.userName || result.userEmail}`);
        setSelectedKycUser(null);
        setKycRejectionReason('');
      } else {
        alert('Failed to reject KYC application');
      }
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      alert('Failed to reject KYC. Please try again.');
    }
  };

  const handlePropertyApprove = async (propertyId) => {
    // Check if it's a request
    const request = propertyRequests.find(r => r.id === propertyId);
    if (request) {
      // If not in demo mode, approve on-chain first
      if (!demoMode && isConnected) {
        try {
          const onChainId = request.onChainId ?? propertyId;
          await approvePropertyOnChain(onChainId);
          console.log('Property approved on-chain:', onChainId);
        } catch (error) {
          console.error('Error approving property on-chain:', error);
          alert('Failed to approve property on-chain: ' + error.message);
          return;
        }
      }

      await approvePropertyListing(propertyId, currentAdminEmail);
      
      // Refresh requests list
      const updatedRequests = getPendingPropertyRequests();
      setPropertyRequests(updatedRequests);
      
      // Add to properties list
      const { status, submittedAt, submittedBy, approvedAt, approvedBy, rejectionReason, ...propertyData } = request;
      const newProperty = {
        ...propertyData,
        id: Date.now(),
        visible: true,
      };
      setProperties([...properties, newProperty]);
      
      // Refresh audit logs
      const logs = getAuditLogs();
      setAuditLogs(logs);
      
      alert('Property approved and added to marketplace! Request removed from pending list.');
    } else {
      // Existing property
      const targetProperty = properties.find(p => p.id === propertyId);
      
      // If not in demo mode, activate on-chain
      if (!demoMode && isConnected && targetProperty) {
        try {
          const onChainId = targetProperty.onChainId ?? propertyId;
          await setPropertyActive(onChainId, true);
        } catch (error) {
          console.error('Error activating property on-chain:', error);
          alert('Failed to activate property on-chain: ' + error.message);
          return;
        }
      }

      const updatedProperties = properties.map(p =>
        p.id === propertyId ? { ...p, visible: true } : p
      );
      setProperties(updatedProperties);
      alert('Property approved and made visible');
    }
  };

  const handlePropertyReject = async (propertyId) => {
    // Check if it's a request
    const request = propertyRequests.find(r => r.id === propertyId);
    if (request) {
      setSelectedRequestForReject(request);
      // Modal will handle rejection
    } else {
      // Existing property
      const updatedProperties = properties.map(p =>
        p.id === propertyId ? { ...p, visible: false } : p
      );
      setProperties(updatedProperties);
      alert('Property rejected and hidden');
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedRequestForReject || !rejectionReason) {
      alert('Please provide a rejection reason');
      return;
    }

    await rejectPropertyListing(selectedRequestForReject.id, currentAdminEmail, rejectionReason);
    
    // Refresh requests list
    const updatedRequests = getPendingPropertyRequests();
    setPropertyRequests(updatedRequests);
    
    // Refresh audit logs
    const logs = getAuditLogs();
    setAuditLogs(logs);
    
    setSelectedRequestForReject(null);
    setRejectionReason('');
    alert('Property request rejected! Request removed from pending list.');
  };

  const handleMarkAsSponsored = (propertyId) => {
    const updatedProperties = properties.map(p =>
      p.id === propertyId ? { ...p, sponsored: true, sponsoredRank: sponsoredRank } : p
    );
    setProperties(updatedProperties);
    alert('Property marked as sponsored');
    setSelectedPropertyForSponsored(null);
    setSponsoredRank(1);
  };

  const handleUnmarkAsSponsored = (propertyId) => {
    const updatedProperties = properties.map(p => {
      if (p.id === propertyId) {
        const { sponsored, sponsoredRank, ...rest } = p;
        return rest;
      }
      return p;
    });
    setProperties(updatedProperties);
    alert('Property unmarked as sponsored');
  };

  const handleWithdrawFees = async () => {
    if (demoMode) {
      alert('Withdrawal simulated in Demo Mode');
      return;
    }
    
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const receipt = await adminWithdraw();
      alert(`Successfully withdrawn fees from contract!\nHash: ${receipt.hash}`);
      const balance = await getContractUSDTBalance();
      setContractUsdtBalance(balance);
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Failed to withdraw fees: ' + error.message);
    }
  };

  const handleToggleFreeze = async () => {
    const newState = !contractFrozen;
    
    // Note: The smart contract doesn't have a global freeze, 
    // so we only update the local platform state.
    setContractFrozen(newState);
    alert(`Platform contract interactions ${newState ? 'frozen' : 'unfrozen'} successfully`);
  };

  const handleBroadcastNotification = () => {
    if (!notificationMessage) {
      alert('Please enter a notification message');
      return;
    }
    addNotification({
      title: 'System Announcement',
      message: notificationMessage,
      type: 'system',
    });
    alert('Notification broadcasted to all users');
    setNotificationMessage('');
  };

  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [kycScores, setKycScores] = useState({});
  const [mlMarketData, setMLMarketData] = useState(null);

  useEffect(() => {
    if (adminLoggedIn) {
      // Generate fraud alerts
      const mockTransactions = [
        { amount: 50000, userAvgAmount: 10000, timestamp: Date.now(), recentTxCount: 8, patternDeviation: 0.7, timeSinceLastTx: 30000 },
        { amount: 15000, userAvgAmount: 12000, timestamp: Date.now() - 3600000, recentTxCount: 2, patternDeviation: 0.2, timeSinceLastTx: 3600000 },
      ];
      const alerts = mockTransactions.map(tx => ({
        ...tx,
        fraud: getFraudSignals(tx, {}),
      })).filter(a => a.fraud.isHighRisk);
      setFraudAlerts(alerts);

      // Generate ML market data
      const marketData = getMarketPredictions(properties, {
        historicalPrices: [250, 252, 248, 255, 250, 253, 251, 254, 252, 256],
        investorCount: 200,
        totalTokens: 60000,
        circulatingTokens: 35000,
        transactionVolume: 20000,
        liquidity: 900000,
      });
      setMLMarketData(marketData);
    }
  }, [adminLoggedIn, properties]);

  // Get KYC users from real applications
  const kycUsers = kycApplications.map(app => ({
    id: app.id,
    name: app.userName,
    email: app.userEmail,
    status: app.status,
    submittedDate: new Date(app.submittedDate).toLocaleDateString(),
    cnicFront: app.kycDocuments?.cnicFront,
    cnicBack: app.kycDocuments?.cnicBack,
    selfie: app.kycDocuments?.selfie,
    rejectionReason: app.rejectionReason,
  }));

  const tabs = [
    { id: 'requests', label: 'Property Requests', icon: <Clock size={20} /> },
    { id: 'kyc', label: 'KYC Management', icon: <FileCheck size={20} /> },
    { id: 'ml-analytics', label: 'ML Analytics', icon: <Sparkles size={20} /> },
    { id: 'properties', label: 'Properties', icon: <Building size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'transactions', label: 'Transactions', icon: <FileCheck size={20} /> },
    { id: 'logs', label: 'Audit Logs', icon: <FileText size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  if (!adminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-50 to-white py-12 relative overflow-hidden">
        {/* Animated Running Gradient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
            className="absolute w-[800px] h-[800px] bg-gradient-to-r from-primary/10 via-pink-500/10 to-primary/10 rounded-full blur-3xl"
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
            className="absolute w-[1000px] h-[1000px] bg-gradient-to-r from-orange-500/10 via-primary/10 to-pink-500/10 rounded-full blur-3xl"
            style={{
              bottom: '-500px',
              right: '-500px',
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft-lg p-8 max-w-md w-full relative z-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Lock className="text-primary" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-accent-800 mb-2">Admin Portal Login</h1>
            <p className="text-accent-600">Enter admin credentials to access</p>
            <p className="text-xs text-accent-500 mt-2">Use TCT passwords from admin panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-accent-700 mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-accent-700 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-accent-700 mb-2">
                2FA Code <span className="text-xs text-accent-500">(Optional for admin@gmail.com)</span>
              </label>
              <input
                type="text"
                value={loginForm.twoFA}
                onChange={(e) => setLoginForm({ ...loginForm, twoFA: e.target.value })}
                placeholder="Enter 2FA code (optional for admin@gmail.com)"
                className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-2xl font-semibold transition-colors"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-accent-50 to-white relative overflow-hidden">
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
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-accent-800">Admin Portal</h1>
            <p className="text-xl text-accent-600">Manage platform operations</p>
          </motion.div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-medium transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft mb-8">
          <div className="flex flex-wrap border-b border-accent-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-accent-600 hover:text-primary'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Property Requests */}
            {activeTab === 'requests' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-accent-800">Pending Property Requests</h2>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-2xl text-sm font-semibold">
                    {propertyRequests.length} Pending
                  </span>
                </div>
                {propertyRequests.length === 0 ? (
                  <div className="text-center py-12 bg-accent-50 rounded-2xl">
                    <p className="text-accent-600">No pending property requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {propertyRequests.map((request) => (
                      <div key={request.id} className="bg-accent-50 p-6 rounded-2xl border-2 border-yellow-200">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4 flex-1">
                            {request.image && (
                              <img src={request.image} alt={request.name} className="w-24 h-24 rounded-2xl object-cover" />
                            )}
                            <div className="flex-1">
                              <h3 className="font-bold text-accent-800 text-lg">{request.name}</h3>
                              <p className="text-sm text-accent-600 mt-1">{request.location}</p>
                              <div className="grid grid-cols-3 gap-4 mt-3">
                                <div>
                                  <p className="text-xs text-accent-500">Price</p>
                                  <p className="text-sm font-semibold text-accent-800">${request.price?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-accent-500">ROI</p>
                                  <p className="text-sm font-semibold text-green-600">{request.roi}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-accent-500">Type</p>
                                  <p className="text-sm font-semibold text-accent-800 capitalize">{request.type}</p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <p className="text-xs text-accent-500">Submitted by</p>
                                <p className="text-sm font-medium text-accent-700">{request.userName || request.userEmail}</p>
                                <p className="text-xs text-accent-500 mt-1">
                                  {new Date(request.submittedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => handlePropertyApprove(request.id)}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-sm font-medium transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handlePropertyReject(request.id)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ML Analytics Tab */}
            {activeTab === 'ml-analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-accent-800 mb-4">ML Analytics Dashboard</h2>
                
                {/* Fraud Detection */}
                <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-primary/10">
                  <h3 className="text-xl font-bold text-accent-800 mb-4 flex items-center space-x-2">
                    <Sparkles className="text-primary" size={24} />
                    <span>Fraud Detection Alerts</span>
                  </h3>
                  {fraudAlerts.length > 0 ? (
                    <div className="space-y-3">
                      {fraudAlerts.map((alert, index) => (
                        <div key={index} className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-red-800">{alert.fraud.transactionRisk.riskLabel}</span>
                            <span className="text-sm text-red-600">
                              Score: {(alert.fraud.transactionRisk.riskScore * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-sm text-red-700 mb-2">
                            Amount: ${alert.amount.toLocaleString()} | Recent TX: {alert.recentTxCount}
                          </p>
                          <ul className="text-xs text-red-600 space-y-1">
                            {alert.fraud.transactionRisk.recommendations.map((rec, i) => (
                              <li key={i}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-accent-600">No fraud alerts detected</p>
                  )}
                </div>

                {/* Market Predictions */}
                {mlMarketData && (
                  <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-primary/10">
                    <h3 className="text-xl font-bold text-accent-800 mb-4">Market Predictions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-primary/10 p-4 rounded-xl">
                        <p className="text-sm text-accent-600 mb-1">Token Price</p>
                        <p className="text-2xl font-bold text-primary">
                          ${mlMarketData.tokenPrice.predictedPrice}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          {mlMarketData.tokenPrice.changePercent > 0 ? '+' : ''}
                          {mlMarketData.tokenPrice.changePercent}%
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl">
                        <p className="text-sm text-accent-600 mb-1">Top Performers</p>
                        <p className="text-2xl font-bold text-green-600">
                          {mlMarketData.topPerformers.length}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-xl">
                        <p className="text-sm text-accent-600 mb-1">High Risk Properties</p>
                        <p className="text-2xl font-bold text-red-600">
                          {mlMarketData.highRiskProperties.length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* KYC Management */}
            {activeTab === 'kyc' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-accent-800 mb-4 flex items-center space-x-2">
                  <span>KYC Applications</span>
                  <Sparkles className="text-primary" size={20} />
                  <span className="text-sm font-normal text-accent-600">(ML-Powered)</span>
                </h2>
                <div className="space-y-4">
                  {kycUsers.map((user) => {
                    // Generate ML KYC score
                    const kycScore = getKYCScore({
                      front: user.cnicFront || 'mock',
                      back: user.cnicBack || 'mock',
                      selfie: user.selfie || 'mock',
                    });
                    return (
                      <div key={user.id} className="bg-accent-50 p-6 rounded-2xl border border-primary/10">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h3 className="font-bold text-accent-800">{user.name}</h3>
                            <p className="text-sm text-accent-600">{user.email}</p>
                            <p className="text-xs text-accent-500 mt-1">Submitted: {user.submittedDate}</p>
                            {/* ML KYC Score Display */}
                            <div className="mt-3 p-3 bg-white rounded-xl border border-primary/20">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-accent-600">ML Validation Score:</span>
                                <span className={`text-sm font-bold ${
                                  kycScore.overallScore >= 0.9 ? 'text-green-600' :
                                  kycScore.overallScore >= 0.7 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {(kycScore.overallScore * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <p className="text-accent-500">Front</p>
                                  <p className="font-semibold">{(kycScore.frontScore * 100).toFixed(0)}%</p>
                                </div>
                                <div>
                                  <p className="text-accent-500">Back</p>
                                  <p className="font-semibold">{(kycScore.backScore * 100).toFixed(0)}%</p>
                                </div>
                                <div>
                                  <p className="text-accent-500">Selfie</p>
                                  <p className="font-semibold">{(kycScore.selfieScore * 100).toFixed(0)}%</p>
                                </div>
                              </div>
                              {kycScore.issues.length > 0 && kycScore.issues[0] !== 'All validations passed' && (
                                <div className="mt-2 text-xs text-red-600">
                                  <p className="font-semibold">Issues:</p>
                                  <ul className="list-disc list-inside">
                                    {kycScore.issues.slice(0, 2).map((issue, i) => (
                                      <li key={i}>{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 ml-4">
                            <span className={`px-3 py-1 rounded-2xl text-sm font-medium ${
                              user.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              user.status === 'hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.status}
                            </span>
                            <button
                              onClick={() => handleKycApprove(user.id)}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-sm font-medium transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setSelectedKycUser(user)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Properties Management */}
            {activeTab === 'properties' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-accent-800 mb-4">Property Listings</h2>
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="bg-accent-50 p-6 rounded-2xl">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <img src={property.image} alt={property.name} className="w-20 h-20 rounded-2xl object-cover" />
                          <div>
                            <h3 className="font-bold text-accent-800">{property.name}</h3>
                            <p className="text-sm text-accent-600">{property.location}</p>
                            <p className="text-sm text-accent-500">${property.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 flex-wrap">
                          {property.visible ? (
                            <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-2xl text-sm">
                              <Eye size={16} />
                              <span>Visible</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-2xl text-sm">
                              <EyeOff size={16} />
                              <span>Hidden</span>
                            </span>
                          )}
                          {property.sponsored && (
                            <span className="flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary rounded-2xl text-sm font-semibold">
                              <Sparkles size={16} />
                              <span>Sponsored (Rank: {property.sponsoredRank || 1})</span>
                            </span>
                          )}
                          <button
                            onClick={() => handlePropertyApprove(property.id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-sm font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handlePropertyReject(property.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-medium transition-colors"
                          >
                            Reject
                          </button>
                          {property.sponsored ? (
                            <>
                              <button
                                onClick={() => handleUnmarkAsSponsored(property.id)}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl text-sm font-medium transition-colors"
                              >
                                Unmark Sponsored
                              </button>
                              {property.sponsored && (
                                <button
                                  onClick={() => {
                                    const analytics = getSponsoredAnalytics(property.id);
                                    alert(`Analytics for ${property.name}:\nImpressions: ${analytics.impressions}\nClicks: ${analytics.clicks}\nCTR: ${analytics.ctr}%`);
                                  }}
                                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-sm font-medium transition-colors"
                                >
                                  View Analytics
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedPropertyForSponsored(property)}
                              className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-2xl text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <Sparkles size={16} />
                              <span>Mark Sponsored</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-accent-800 mb-4">All Users</h2>
                <p className="text-accent-600">User management interface would be displayed here</p>
              </motion.div>
            )}

            {/* Transactions */}
            {activeTab === 'transactions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-accent-800 mb-4 flex items-center space-x-2">
                  <FileCheck className="text-primary" size={24} />
                  <span>All Transactions</span>
                  <span className="text-sm font-normal text-accent-600">({allTransactions.length} total)</span>
                </h2>
                
                {loadingTransactions ? (
                  <div className="text-center py-8">
                    <p className="text-accent-600">Loading transactions...</p>
                  </div>
                ) : allTransactions.length === 0 ? (
                  <div className="bg-accent-50 p-8 rounded-2xl text-center border border-accent-200">
                    <FileCheck className="mx-auto text-accent-400 mb-4" size={48} />
                    <p className="text-accent-600 font-semibold">No Transactions Found</p>
                    <p className="text-sm text-accent-500 mt-2">No transactions have been made yet.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-accent-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-accent-50 border-b border-accent-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-accent-800">User</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-accent-800">Property</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-accent-800">Tokens</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-accent-800">Amount</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-accent-800">Token Price</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-accent-800">ROI</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-accent-800">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-accent-800">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-accent-100">
                          {allTransactions.map((tx) => (
                            <tr key={tx.id || tx._id} className="hover:bg-accent-50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold text-accent-800">{tx.userName}</p>
                                  <p className="text-xs text-accent-500">{tx.userEmail}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm font-medium text-accent-800">{tx.propertyName}</p>
                                <p className="text-xs text-accent-500">ID: {tx.propertyId}</p>
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-accent-800">
                                {tx.tokens?.toLocaleString() || '0'}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-green-600">
                                ${tx.amount?.toLocaleString() || '0'}
                              </td>
                              <td className="px-6 py-4 text-sm text-accent-600">
                                ${tx.tokenPrice?.toFixed(2) || '0.00'}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-semibold text-green-600">
                                  {tx.roi?.toFixed(1) || '0'}%
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  tx.status === 'active' ? 'bg-green-100 text-green-800' :
                                  tx.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {tx.status || 'active'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-accent-600">
                                {tx.investedAt 
                                  ? new Date(tx.investedAt).toLocaleDateString()
                                  : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Summary Stats */}
                    <div className="bg-accent-50 px-6 py-4 border-t border-accent-200">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-accent-500 mb-1">Total Volume</p>
                          <p className="text-lg font-bold text-accent-800">
                            ${allTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-accent-500 mb-1">Total Tokens</p>
                          <p className="text-lg font-bold text-accent-800">
                            {allTransactions.reduce((sum, tx) => sum + (tx.tokens || 0), 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-accent-500 mb-1">Active Investments</p>
                          <p className="text-lg font-bold text-green-600">
                            {allTransactions.filter(tx => tx.status === 'active').length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-accent-500 mb-1">Unique Users</p>
                          <p className="text-lg font-bold text-primary">
                            {new Set(allTransactions.map(tx => tx.userId)).size}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Audit Logs */}
            {activeTab === 'logs' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-accent-800 mb-4">Audit Logs</h2>
                <div className="bg-accent-50 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-accent-600">Total Logs: {auditLogs.length}</p>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auditLogs.length === 0 ? (
                    <p className="text-center text-accent-600 py-8">No logs available</p>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="bg-white p-4 rounded-2xl border border-accent-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-accent-800 capitalize">
                              {log.actionType.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-accent-500 mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                            {log.data && (
                              <div className="mt-2 text-sm text-accent-700">
                                {Object.entries(log.data).map(([key, value]) => (
                                  <p key={key}>
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-accent-800 mb-4">Broadcast Notification</h2>
                <div>
                  <label className="block text-sm font-medium text-accent-700 mb-2">Notification Message</label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter notification message to broadcast to all users"
                  />
                </div>
                <button
                  onClick={handleBroadcastNotification}
                  className="px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-2xl font-semibold transition-colors"
                >
                  Broadcast to All Users
                </button>
              </motion.div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-accent-800 mb-4">Platform Settings</h2>
                <div className="bg-white p-6 rounded-2xl border border-accent-200">
                  <h3 className="text-lg font-bold text-accent-800 mb-2">Contract Management</h3>
                  <p className="text-accent-600 mb-4">Control global platform settings and fund management.</p>
                  
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 bg-accent-50 p-4 rounded-2xl border border-accent-100">
                      <p className="text-xs text-accent-500 mb-1">Contract Balance (Fees)</p>
                      <p className="text-2xl font-bold text-accent-900">{contractUsdtBalance} USDT</p>
                    </div>
                    <button
                      onClick={handleWithdrawFees}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-primary-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      Withdraw All Fees
                    </button>
                  </div>

                  <button
                    onClick={handleToggleFreeze}
                    className={`w-full px-6 py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${
                      contractFrozen 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    }`}
                  >
                    {contractFrozen ? 'Unfreeze Contract' : 'Freeze Contract'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* KYC Rejection Modal */}
      <Modal
        isOpen={!!selectedKycUser}
        onClose={() => {
          setSelectedKycUser(null);
          setKycRejectionReason('');
        }}
        title="Reject KYC Application"
      >
        <div className="space-y-4">
          <p className="text-accent-700">
            Rejecting KYC for: <strong>{selectedKycUser?.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-accent-700 mb-2">Rejection Reason</label>
            <textarea
              value={kycRejectionReason}
              onChange={(e) => setKycRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter reason for rejection"
            />
          </div>
          <button
            onClick={handleKycReject}
            className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition-colors"
          >
            Confirm Rejection
          </button>
        </div>
      </Modal>

      {/* Mark as Sponsored Modal */}
      <Modal
        isOpen={!!selectedPropertyForSponsored}
        onClose={() => {
          setSelectedPropertyForSponsored(null);
          setSponsoredRank(1);
        }}
        title={`Mark as Sponsored - ${selectedPropertyForSponsored?.name}`}
      >
        <div className="space-y-4">
          <p className="text-accent-700">
            Marking property as sponsored will display it prominently in the Recommendations page.
          </p>
          <div>
            <label className="block text-sm font-medium text-accent-700 mb-2">Sponsored Rank</label>
            <p className="text-xs text-accent-500 mb-2">Higher rank = more prominent display (1-10)</p>
            <input
              type="number"
              min="1"
              max="10"
              value={sponsoredRank}
              onChange={(e) => setSponsoredRank(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                handleMarkAsSponsored(selectedPropertyForSponsored.id);
                setSelectedPropertyForSponsored(null);
              }}
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-2xl font-semibold transition-colors"
            >
              Mark as Sponsored
            </button>
            <button
              onClick={() => {
                setSelectedPropertyForSponsored(null);
                setSponsoredRank(1);
              }}
              className="px-6 py-3 bg-accent-200 hover:bg-accent-300 text-accent-800 rounded-2xl font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Property Rejection Modal */}
      <Modal
        isOpen={!!selectedRequestForReject}
        onClose={() => {
          setSelectedRequestForReject(null);
          setRejectionReason('');
        }}
        title={`Reject Property Request - ${selectedRequestForReject?.name}`}
      >
        <div className="space-y-4">
          <p className="text-accent-700">
            Rejecting property listing request from: <strong>{selectedRequestForReject?.userName || selectedRequestForReject?.userEmail}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-accent-700 mb-2">Rejection Reason *</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-accent-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter reason for rejection"
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleConfirmReject}
              disabled={!rejectionReason}
              className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-accent-300 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-colors"
            >
              Confirm Rejection
            </button>
            <button
              onClick={() => {
                setSelectedRequestForReject(null);
                setRejectionReason('');
              }}
              className="px-6 py-3 bg-accent-200 hover:bg-accent-300 text-accent-800 rounded-2xl font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPortal;

