import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import Recommendations from './pages/Recommendations';
import Dashboard from './pages/Dashboard';
import ListProperty from './pages/ListProperty';
import About from './pages/About';
import AdminPortal from './pages/AdminPortal';
import MLAnalytics from './pages/MLAnalytics';
import { useStore } from './store/useStore';
import { setupMetaMaskListeners, getCurrentAccount, getChainId } from './utils/wallet';
import './App.css';

function App() {
  console.log('=== APP STARTING ===');
  
  const { setWalletAddress, setChainId, disconnectWallet } = useStore();
  console.log('Store loaded successfully');

  // Debug: Log that App is rendering
  console.log('App component rendering...');

  useEffect(() => {
    // Check for existing wallet connection
    const checkWallet = async () => {
      try {
        const account = await getCurrentAccount();
        if (account) {
          setWalletAddress(account);
        }
        try {
          const chainId = await getChainId();
          if (chainId) {
            setChainId(chainId);
          }
        } catch (chainError) {
          console.warn('Could not get chain ID:', chainError);
        }
      } catch (error) {
        console.warn('Error checking wallet:', error);
        // Don't block app if wallet check fails
      }
    };
    checkWallet();

    // Setup MetaMask listeners
    try {
      const handleAccountsChanged = (accounts) => {
        if (accounts) {
          setWalletAddress(accounts);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(chainId);
      };

      setupMetaMaskListeners(handleAccountsChanged, handleChainChanged);
    } catch (error) {
      console.warn('Error setting up MetaMask listeners:', error);
      // Don't block app if listener setup fails
    }

    return () => {
      // Cleanup listeners would go here if needed
    };
  }, [setWalletAddress, setChainId, disconnectWallet]);

  console.log('App rendering, setting up routes...');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
        <Route path="/recommendations" element={<Layout><Recommendations /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/ml-analytics" element={<Layout><MLAnalytics /></Layout>} />
        <Route path="/list-property" element={<Layout><ListProperty /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/admin-portal-98234-secret" element={<AdminPortal />} />
      </Routes>
    </Router>
  );
}

export default App;

