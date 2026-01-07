import { ethers } from 'ethers';

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Track pending connection requests to prevent duplicates
let pendingConnection = null;

/**
 * Request account access from MetaMask
 */
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  // Check if window.ethereum is available and responding
  if (!window.ethereum || !window.ethereum.request) {
    throw new Error('MetaMask is not responding. Please refresh the page and try again.');
  }

  // Clear any stale pending connection
  if (pendingConnection) {
    pendingConnection = null;
  }

  // Create new connection promise with timeout
  const connectionPromise = (async () => {
    try {
      // First, try to get existing accounts (quick check, no timeout needed)
      let existingAccounts;
      try {
        existingAccounts = await window.ethereum.request({ method: 'eth_accounts' });
      } catch (err) {
        console.warn('Error checking existing accounts:', err);
        existingAccounts = [];
      }

      if (existingAccounts && existingAccounts.length > 0) {
        return existingAccounts[0];
      }

      // If no existing accounts, request new connection with timeout
      const accounts = await Promise.race([
        window.ethereum.request({ method: 'eth_requestAccounts' }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout. Please check MetaMask and try again.')), 30000)
        )
      ]);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from MetaMask.');
      }
      
      return accounts[0];
    } catch (error) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request.');
      }
      
      if (error.code === -32002) {
        throw new Error('A connection request is already pending. Please check MetaMask.');
      }
      
      if (error.message && error.message.includes('timeout')) {
        throw error;
      }
      
      if (error.message) {
        throw new Error(error.message);
      }
      
      throw new Error('Failed to connect wallet. Please try again.');
    } finally {
      // Always clear pending connection after completion
      pendingConnection = null;
    }
  })();

  pendingConnection = connectionPromise;
  return connectionPromise;
};

/**
 * Get the current connected account
 */
export const getCurrentAccount = async () => {
  if (!isMetaMaskInstalled()) return null;

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Get the current network chain ID
 */
export const getChainId = async () => {
  if (!isMetaMaskInstalled()) return null;

  try {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });
    return parseInt(chainId, 16);
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
};

/**
 * Get Ethers.js provider
 */
export const getProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Get Ethers.js signer
 */
export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

/**
 * Get ETH balance for an address
 * In demo mode, returns demo balance
 */
export const getEthBalance = async (address) => {
  try {
    // Check if demo mode is enabled
    const isDemoMode = localStorage.getItem('propToken_demoMode') !== 'false';
    if (isDemoMode) {
      return '5.2500'; // Demo ETH balance
    }
    
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting ETH balance:', error);
    // Fallback to demo balance in demo mode
    const isDemoMode = localStorage.getItem('propToken_demoMode') !== 'false';
    return isDemoMode ? '5.2500' : '0';
  }
};

/**
 * Format address for display
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Setup MetaMask event listeners
 */
export const setupMetaMaskListeners = (onAccountsChanged, onChainChanged) => {
  if (!isMetaMaskInstalled()) return;

  if (onAccountsChanged) {
    window.ethereum.on('accountsChanged', (accounts) => {
      onAccountsChanged(accounts[0] || null);
    });
  }

  if (onChainChanged) {
    window.ethereum.on('chainChanged', (chainId) => {
      onChainChanged(parseInt(chainId, 16));
      // Reload page on chain change
      window.location.reload();
    });
  }
};

/**
 * Remove MetaMask event listeners
 */
export const removeMetaMaskListeners = (onAccountsChanged, onChainChanged) => {
  if (!isMetaMaskInstalled()) return;

  if (onAccountsChanged) {
    window.ethereum.removeListener('accountsChanged', onAccountsChanged);
  }

  if (onChainChanged) {
    window.ethereum.removeListener('chainChanged', onChainChanged);
  }
};

