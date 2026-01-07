import { ethers } from 'ethers';
import { getSigner } from './wallet';
import propTokenABI from '../contracts/propTokenABI.json';
import { PROP_TOKEN_CONTRACT_ADDRESS } from '../contracts/address';

/**
 * Get the PropToken contract instance
 */
export const getPropTokenContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(PROP_TOKEN_CONTRACT_ADDRESS, propTokenABI, signer);
};

/**
 * Get the PropToken contract instance (read-only with provider)
 */
export const getPropTokenContractReadOnly = async () => {
  const { getProvider } = await import('./wallet');
  const provider = getProvider();
  return new ethers.Contract(PROP_TOKEN_CONTRACT_ADDRESS, propTokenABI, provider);
};

/**
 * Buy tokens for a property
 * @param {number} propertyId - The property ID
 * @param {number} amount - Amount of tokens to buy
 * @param {string} ethAmount - ETH amount to send (in ETH, not Wei)
 */
export const buyTokens = async (propertyId, amount, ethAmount) => {
  try {
    const contract = await getPropTokenContract();
    const tx = await contract.buyTokens(
      propertyId,
      amount,
      { value: ethers.parseEther(ethAmount.toString()) }
    );
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error buying tokens:', error);
    throw error;
  }
};

/**
 * Get token price for a property
 * @param {number} propertyId - The property ID
 */
export const getTokenPrice = async (propertyId) => {
  try {
    const contract = await getPropTokenContractReadOnly();
    const price = await contract.getTokenPrice(propertyId);
    return ethers.formatEther(price);
  } catch (error) {
    console.error('Error getting token price:', error);
    // Return a default price if contract call fails
    return '0.01';
  }
};

/**
 * Invest in a property
 * @param {number} propertyId - The property ID
 * @param {number} amount - Amount to invest
 * @param {string} ethAmount - ETH amount to send
 */
export const invest = async (propertyId, amount, ethAmount) => {
  try {
    const contract = await getPropTokenContract();
    const tx = await contract.invest(
      propertyId,
      amount,
      { value: ethers.parseEther(ethAmount.toString()) }
    );
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error investing:', error);
    throw error;
  }
};

/**
 * Withdraw funds
 * @param {number} amount - Amount to withdraw
 */
export const withdraw = async (amount) => {
  try {
    const contract = await getPropTokenContract();
    const tx = await contract.withdraw(amount);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error withdrawing:', error);
    throw error;
  }
};

/**
 * Get token balance for an address
 * In demo mode, returns demo balance
 * @param {string} address - The address to check
 */
export const getTokenBalance = async (address) => {
  try {
    // Check if demo mode is enabled
    const isDemoMode = localStorage.getItem('propToken_demoMode') !== 'false';
    if (isDemoMode) {
      return '12500.0000'; // Demo PROPY balance
    }
    
    const contract = await getPropTokenContractReadOnly();
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting token balance:', error);
    // Fallback to demo balance in demo mode
    const isDemoMode = localStorage.getItem('propToken_demoMode') !== 'false';
    return isDemoMode ? '12500.0000' : '0';
  }
};

