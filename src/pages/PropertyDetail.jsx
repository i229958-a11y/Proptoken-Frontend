import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, DollarSign, TrendingUp, Shield, Building2, Wallet, AlertCircle, CheckCircle, XCircle, Coins, Users, BarChart3, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { connectWallet } from '../utils/wallet';
import { buyTokens, getTokenPrice, getUserTokenBalance, getUSDTBalance, getPendingRevenue, withdrawRevenue, formatOnChainProperty, getProperty as getOnChainProperty } from '../utils/contract';
import { sampleProperties } from '../data/properties';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    walletAddress, isConnected, setWalletAddress, demoMode,
    properties, setProperties, kycStatus, usdtBalance, setUsdtBalance,
    ethBalance, propyBalance, setEthBalance, setPropyBalance,
    user, addInvestment, setInvestments, updateTokenHolding,
  } = useStore();

  const [property, setProperty] = useState(null);
  const [onChainData, setOnChainData] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [isBuying, setIsBuying] = useState(false);
  const [userTokens, setUserTokens] = useState('0');
  const [pendingRevenue, setPendingRevenueState] = useState('0');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load property data
  useEffect(() => {
    const loadProperty = async () => {
      setLoading(true);
      // Find from sample/store properties
      const allProps = properties.length > 0 ? properties : sampleProperties;
      if (properties.length === 0) setProperties(sampleProperties);

      const found = allProps.find(p => String(p.id) === String(id));
      if (found) setProperty(found);

      // Try to load on-chain data if not in demo mode
      if (!demoMode && found?.onChainId !== undefined) {
        try {
          const raw = await getOnChainProperty(found.onChainId);
          setOnChainData(formatOnChainProperty(raw));
        } catch (e) { console.warn('Could not load on-chain data:', e); }
      }

      // Load user token balance
      if (isConnected && walletAddress && found && !demoMode) {
        try {
          const balance = await getUserTokenBalance(found.onChainId ?? found.id, walletAddress);
          setUserTokens(balance);
          updateTokenHolding(found.id, balance);
        } catch (e) { console.warn('Could not load token balance:', e); }

        // Load USDT balance
        try {
          const usdtBal = await getUSDTBalance(walletAddress);
          setUsdtBalance(usdtBal);
        } catch (e) { console.warn('Could not load USDT balance:', e); }

        // Load pending revenue if user is lister
        if (onChainData && onChainData.lister?.toLowerCase() === walletAddress?.toLowerCase()) {
          try {
            const rev = await getPendingRevenue(found.onChainId ?? found.id);
            setPendingRevenueState(rev);
          } catch (e) { console.warn('Could not load revenue:', e); }
        }
      }
      setLoading(false);
    };
    loadProperty();
  }, [id, demoMode, isConnected, walletAddress]);

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (error) { alert(error.message); }
  };

  const handleBuyTokens = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      alert('Please enter a valid token amount');
      return;
    }
    if (!demoMode && !isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsBuying(true);
    try {
      if (demoMode) {
        // Demo mode purchase
        await new Promise(r => setTimeout(r, 1500));
        const tokenPrice = property.tokenPrice || 250;
        const cost = parseFloat(buyAmount) * tokenPrice;

        // Update balances
        const { setEthBalance, setPropyBalance, addInvestment: storeAddInvestment, setInvestments: storeSetInvestments } = useStore.getState();
        const currentEth = parseFloat(ethBalance) > 0 ? parseFloat(ethBalance) : 12.5432;
        setEthBalance(Math.max(0, currentEth - cost * 0.0004).toFixed(4));

        // Save investment
        if (user?.email) {
          const { addInvestment: addInvBackend, getUserInvestments } = await import('../utils/backend');
          addInvBackend(user.email, {
            propertyId: property.id, propertyName: property.name,
            propertyImage: property.image, propertyLocation: property.location,
            tokens: parseFloat(buyAmount), amount: cost,
            tokenPrice, roi: property.roi || 12,
            transactionHash: `demo_tx_${Date.now()}`,
          });
          const updated = getUserInvestments(user.email);
          storeSetInvestments(updated);
        }

        storeAddInvestment({
          propertyId: property.id, propertyName: property.name,
          tokens: parseFloat(buyAmount), amount: cost,
          tokenPrice, roi: property.roi || 12,
          investedAt: new Date().toISOString(),
        });

        setProperty(prev => ({
          ...prev,
          tokensAvailable: Math.max(0, (prev.tokensAvailable || prev.tokensTotal) - parseFloat(buyAmount)),
        }));

        alert(`✅ Demo: Purchased ${buyAmount} tokens for ${property.name}!\nCost: $${cost.toLocaleString()} USDT`);
      } else {
        // Live mode — real blockchain
        if (kycStatus !== 'approved') {
          alert('KYC verification required. Complete KYC in your Dashboard.');
          setIsBuying(false);
          return;
        }
        const onChainId = property.onChainId ?? property.id;
        const receipt = await buyTokens(onChainId, buyAmount);
        alert(`✅ Purchase confirmed!\nTx: ${receipt.hash}`);

        // Refresh balances
        const usdtBal = await getUSDTBalance(walletAddress);
        setUsdtBalance(usdtBal);
        const newBalance = await getUserTokenBalance(onChainId, walletAddress);
        setUserTokens(newBalance);
        updateTokenHolding(property.id, newBalance);
      }
      setBuyAmount('');
    } catch (error) {
      console.error('Buy error:', error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setIsBuying(false);
    }
  };

  const handleWithdrawRevenue = async () => {
    if (demoMode) { alert('Revenue withdrawal is only available in Live Mode.'); return; }
    setIsWithdrawing(true);
    try {
      const onChainId = property.onChainId ?? property.id;
      await withdrawRevenue(onChainId);
      alert('✅ Revenue withdrawn successfully!');
      setPendingRevenueState('0');
    } catch (error) {
      alert(`Withdrawal failed: ${error.message}`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const effectiveTokenPrice = onChainData?.tokenPriceUSDT || property.tokenPrice || 250;
  const effectiveAvailable = onChainData?.tokensAvailable ?? property.tokensAvailable ?? property.tokensTotal;
  const effectiveTotal = onChainData?.totalTokens ?? property.tokensTotal ?? 10000;
  const soldPercent = effectiveTotal > 0 ? ((effectiveTotal - effectiveAvailable) / effectiveTotal * 100).toFixed(1) : '0';
  const totalCost = buyAmount ? (parseFloat(buyAmount) * effectiveTokenPrice) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-orange-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-accent-600 hover:text-primary mb-6 font-medium"
        >
          <ArrowLeft size={20} /><span>Back</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl h-80 md:h-[420px]"
            >
              <img src={property.image} alt={property.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&sig=${property.id}`; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center space-x-2 mb-2">
                  {onChainData?.isApproved && (
                    <span className="px-3 py-1 bg-green-500/90 text-white rounded-full text-xs font-bold flex items-center space-x-1">
                      <CheckCircle size={12} /><span>On-Chain Approved</span>
                    </span>
                  )}
                  {onChainData && !onChainData.isActive && (
                    <span className="px-3 py-1 bg-red-500/90 text-white rounded-full text-xs font-bold flex items-center space-x-1">
                      <Lock size={12} /><span>Frozen</span>
                    </span>
                  )}
                  <span className="px-3 py-1 bg-primary/90 text-white rounded-full text-xs font-bold capitalize">
                    {property.type || 'Residential'}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-1">{property.name}</h1>
                <p className="text-white/80 flex items-center"><MapPin size={16} className="mr-1" />{property.location}</p>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: 'Property Value', value: `$${(property.price || effectiveTotal * effectiveTokenPrice).toLocaleString()}`, icon: DollarSign, color: 'from-primary/10 to-orange-100' },
                { label: 'Token Price', value: `$${effectiveTokenPrice.toLocaleString()} USDT`, icon: Coins, color: 'from-blue-50 to-blue-100' },
                { label: 'Expected ROI', value: `${property.roi || 12}%`, icon: TrendingUp, color: 'from-green-50 to-green-100' },
                { label: 'Tokens Sold', value: `${soldPercent}%`, icon: BarChart3, color: 'from-purple-50 to-purple-100' },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 shadow-soft border border-white/50`}>
                  <stat.icon className="text-accent-600 mb-2" size={20} />
                  <p className="text-xs text-accent-500 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-accent-900">{stat.value}</p>
                </div>
              ))}
            </motion.div>

            {/* Token Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl shadow-soft-lg p-6 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-accent-800 mb-4">Token Distribution</h3>
              <div className="flex justify-between text-sm text-accent-600 mb-2">
                <span>{effectiveAvailable.toLocaleString()} available</span>
                <span>{effectiveTotal.toLocaleString()} total</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${soldPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary to-primary-600 rounded-full"
                />
              </div>
              <p className="text-sm text-accent-500 mt-2">{soldPercent}% sold</p>

              {onChainData && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-accent-500">Lister</p>
                    <p className="font-mono text-xs text-accent-700">{onChainData.lister?.slice(0, 10)}...{onChainData.lister?.slice(-6)}</p>
                  </div>
                  <div>
                    <p className="text-accent-500">Status</p>
                    <p className="font-semibold">{onChainData.isApproved ? '✅ Approved' : '⏳ Pending'} · {onChainData.isActive ? '🟢 Active' : '🔴 Frozen'}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-soft-lg p-6 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-accent-800 mb-3">About This Property</h3>
              <p className="text-accent-600 leading-relaxed">{property.description || 'Premium tokenized real estate investment opportunity.'}</p>
            </motion.div>
          </div>

          {/* Right — Buy Panel */}
          <div className="space-y-6">
            {/* Buy Card */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 sticky top-8"
            >
              <h3 className="text-xl font-bold text-accent-900 mb-6">Invest in This Property</h3>

              {/* User Holdings */}
              {(isConnected || demoMode) && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 mb-6">
                  <p className="text-xs text-accent-500 mb-1">Your Holdings</p>
                  <p className="text-2xl font-bold text-primary">{demoMode ? '0' : userTokens} tokens</p>
                  {!demoMode && (
                    <p className="text-xs text-accent-500 mt-1">USDT Balance: ${parseFloat(usdtBalance).toLocaleString()}</p>
                  )}
                </div>
              )}

              {/* Price Info */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-accent-500">Token Price</p>
                  <p className="text-lg font-bold text-accent-800">${effectiveTokenPrice}</p>
                  <p className="text-xs text-accent-400">USDT</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-accent-500">Available</p>
                  <p className="text-lg font-bold text-accent-800">{effectiveAvailable.toLocaleString()}</p>
                  <p className="text-xs text-accent-400">tokens</p>
                </div>
              </div>

              {/* Buy Form */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-accent-700 mb-2">Tokens to Buy</label>
                <input type="number" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="Enter amount" max={effectiveAvailable} min="1"
                  className="w-full px-4 py-3 border-2 border-accent-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                />
                {buyAmount && (
                  <div className="mt-2 p-3 bg-primary/5 rounded-xl">
                    <div className="flex justify-between text-sm">
                      <span className="text-accent-600">Total Cost</span>
                      <span className="font-bold text-primary">${totalCost.toLocaleString()} USDT</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Warnings */}
              {!isConnected && !demoMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} className="text-yellow-600" />
                    <p className="text-xs text-yellow-800">Connect wallet to purchase</p>
                  </div>
                </div>
              )}

              {isConnected && kycStatus !== 'approved' && !demoMode && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <XCircle size={16} className="text-red-600" />
                    <div>
                      <p className="text-xs font-bold text-red-800">KYC Required</p>
                      <Link to="/dashboard" className="text-xs text-red-600 underline">Complete KYC →</Link>
                    </div>
                  </div>
                </div>
              )}

              {demoMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4">
                  <p className="text-xs text-amber-800 font-semibold">🧪 Demo Mode — simulated transaction</p>
                </div>
              )}

              {/* Buy Button */}
              {!isConnected && !demoMode ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleConnectWallet}
                  className="w-full py-4 bg-gradient-to-r from-primary to-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg"
                >
                  <Wallet size={20} className="inline mr-2" />Connect Wallet
                </motion.button>
              ) : (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleBuyTokens} disabled={isBuying || !buyAmount || parseFloat(buyAmount) <= 0}
                  className="w-full py-4 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-bold text-lg shadow-lg transition-all"
                >
                  {isBuying ? (
                    <span className="flex items-center justify-center space-x-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Processing...</span>
                    </span>
                  ) : (
                    `Buy ${buyAmount || '0'} Tokens`
                  )}
                </motion.button>
              )}

              {/* Security Note */}
              <div className="flex items-center space-x-2 mt-4 text-xs text-accent-400">
                <Shield size={14} /><span>Secured by Ethereum smart contract</span>
              </div>
            </motion.div>

            {/* Revenue Withdrawal (for listers) */}
            {!demoMode && onChainData && walletAddress &&
              onChainData.lister?.toLowerCase() === walletAddress?.toLowerCase() &&
              parseFloat(pendingRevenue) > 0 && (
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg p-6 border border-green-200"
              >
                <h3 className="text-lg font-bold text-green-800 mb-2">Revenue Available</h3>
                <p className="text-3xl font-black text-green-600 mb-4">${parseFloat(pendingRevenue).toLocaleString()} USDT</p>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleWithdrawRevenue} disabled={isWithdrawing}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg"
                >
                  {isWithdrawing ? 'Withdrawing...' : 'Withdraw Revenue'}
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
