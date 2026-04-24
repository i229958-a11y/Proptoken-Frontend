import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, ChevronDown, Zap, TestTube2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const NetworkToggle = () => {
  const { demoMode, setDemoMode, isConnected, walletAddress } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (mode) => {
    if (!mode && !isConnected) {
      // Trying to go live without wallet
      alert('Please connect your MetaMask wallet first to switch to Live Mode.');
      setIsOpen(false);
      return;
    }
    setDemoMode(mode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold shadow-md transition-all ${
          demoMode
            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
            : 'bg-gradient-to-r from-emerald-400 to-green-500 text-white'
        }`}
      >
        {demoMode ? (
          <>
            <TestTube2 size={14} />
            <span>Demo</span>
          </>
        ) : (
          <>
            <Zap size={14} />
            <span>Live</span>
          </>
        )}
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            >
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Network Mode</p>
              </div>

              {/* Demo Mode Option */}
              <button
                onClick={() => handleToggle(true)}
                className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors ${
                  demoMode
                    ? 'bg-amber-50 border-l-4 border-amber-500'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  demoMode ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <TestTube2 size={16} />
                </div>
                <div className="text-left flex-1">
                  <p className={`text-sm font-bold ${demoMode ? 'text-amber-700' : 'text-gray-700'}`}>
                    Demo Mode
                  </p>
                  <p className="text-xs text-gray-500">Simulated transactions</p>
                </div>
                {demoMode && (
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Live Mode Option */}
              <button
                onClick={() => handleToggle(false)}
                className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors ${
                  !demoMode
                    ? 'bg-emerald-50 border-l-4 border-emerald-500'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  !demoMode ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Zap size={16} />
                </div>
                <div className="text-left flex-1">
                  <p className={`text-sm font-bold ${!demoMode ? 'text-emerald-700' : 'text-gray-700'}`}>
                    Live Mode
                  </p>
                  <p className="text-xs text-gray-500">
                    {isConnected ? 'Real blockchain txns' : 'Connect wallet first'}
                  </p>
                </div>
                {!demoMode && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Status Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <>
                      <Wifi size={12} className="text-green-500" />
                      <span className="text-xs text-gray-600">
                        Wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">No wallet connected</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkToggle;
