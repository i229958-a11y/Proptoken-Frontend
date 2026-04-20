import { ethers } from 'ethers';
import { getSigner } from './wallet';
import propTokenABI from '../contracts/propTokenABI.json';
import { PROP_TOKEN_CONTRACT_ADDRESS, USDT_CONTRACT_ADDRESS } from '../contracts/address';

// ─── Minimal ERC-20 ABI (approve + allowance + balanceOf) ────────────────

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

// ─── Contract instances ───────────────────────────────────────────────────

/**
 * Returns a signer-connected PropToken contract instance.
 */
export const getPropTokenContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(PROP_TOKEN_CONTRACT_ADDRESS, propTokenABI, signer);
};

/**
 * Returns a read-only PropToken contract instance (no signer required).
 */
export const getPropTokenContractReadOnly = async () => {
  const { getProvider } = await import('./wallet');
  const provider = getProvider();
  return new ethers.Contract(PROP_TOKEN_CONTRACT_ADDRESS, propTokenABI, provider);
};

/**
 * Returns a signer-connected USDT contract instance.
 */
export const getUSDTContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, signer);
};

// ─── Investor Functions ───────────────────────────────────────────────────

/**
 * Buy tokens for a property using USDT.
 *
 * Flow:
 *  1. Calculate total USDT cost  (amount × tokenPriceUSDT)
 *  2. Check existing USDT allowance — only call approve() if needed
 *  3. Call propToken.buyTokens(propertyId, amount)
 *
 * @param {number|string} propertyId  On-chain property ID (0-indexed).
 * @param {number|string} amount      Number of whole tokens to buy.
 * @returns {object}  ethers transaction receipt.
 */
export const buyTokens = async (propertyId, amount) => {
  try {
    const propToken  = await getPropTokenContract();
    const usdtToken  = await getUSDTContract();
    const signer     = await getSigner();
    const buyerAddr  = await signer.getAddress();

    // 1. Get the on-chain token price (in USDT, 6 decimals)
    const tokenPriceUSDT = await propToken.getTokenPrice(propertyId);
    const totalCost      = BigInt(amount) * tokenPriceUSDT; // BigInt arithmetic

    // 2. Check existing allowance — skip approval tx if already sufficient
    const currentAllowance = await usdtToken.allowance(buyerAddr, PROP_TOKEN_CONTRACT_ADDRESS);
    if (currentAllowance < totalCost) {
      console.log(`Approving USDT spend: ${ethers.formatUnits(totalCost, 6)} USDT`);
      const approveTx = await usdtToken.approve(PROP_TOKEN_CONTRACT_ADDRESS, totalCost);
      await approveTx.wait();
      console.log('USDT approval confirmed.');
    }

    // 3. Buy the tokens
    console.log(`Buying ${amount} tokens for property ${propertyId}...`);
    const tx = await propToken.buyTokens(propertyId, amount);
    const receipt = await tx.wait();
    console.log('Purchase confirmed. Tx hash:', receipt.hash);

    return receipt;
  } catch (error) {
    console.error('Error buying tokens:', error);
    throw error;
  }
};

/**
 * Get the token price for a property in human-readable USDT.
 * @param {number|string} propertyId  On-chain property ID.
 * @returns {string}  Price per token in USDT (e.g. "250.00").
 */
export const getTokenPrice = async (propertyId) => {
  try {
    const contract = await getPropTokenContractReadOnly();
    const priceRaw = await contract.getTokenPrice(propertyId);
    // USDT has 6 decimals; formatUnits converts from 6-decimal bigint → string
    return ethers.formatUnits(priceRaw, 6);
  } catch (error) {
    console.error('Error getting token price:', error);
    return '0';
  }
};

// ─── Property Owner Functions ─────────────────────────────────────────────

/**
 * List a new property on-chain for tokenization.
 * Admin must call approveProperty() before tokens go on sale.
 *
 * @param {number|string} totalTokens     Total tokens to divide the property into.
 * @param {number|string} tokenPriceUSDT  Price per token in USDT with 6 decimals.
 *                                        e.g. 250 USDT → pass "250000000"
 * @returns {object}  { receipt, propertyId }
 */
export const listProperty = async (totalTokens, tokenPriceUSDT) => {
  try {
    const contract = await getPropTokenContract();
    const tx       = await contract.listProperty(totalTokens, tokenPriceUSDT);
    const receipt  = await tx.wait();

    // Parse the PropertyListed event to get the assigned propertyId
    const iface  = new ethers.Interface(propTokenABI);
    let propertyId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === 'PropertyListed') {
          propertyId = parsed.args.propertyId.toString();
          break;
        }
      } catch { /* skip unparseable logs */ }
    }

    console.log(`Property listed on-chain. ID: ${propertyId}`);
    return { receipt, propertyId };
  } catch (error) {
    console.error('Error listing property:', error);
    throw error;
  }
};

/**
 * Property lister withdraws their USDT revenue for a specific property.
 * @param {number|string} propertyId  On-chain property ID.
 */
export const withdrawRevenue = async (propertyId) => {
  try {
    const contract = await getPropTokenContract();
    const tx       = await contract.withdrawRevenue(propertyId);
    return await tx.wait();
  } catch (error) {
    console.error('Error withdrawing revenue:', error);
    throw error;
  }
};

// ─── Admin Functions ──────────────────────────────────────────────────────

/**
 * Admin approves a listed property so its tokens become purchasable.
 * @param {number|string} propertyId  On-chain property ID.
 */
export const approveProperty = async (propertyId) => {
  try {
    const contract = await getPropTokenContract();
    const tx       = await contract.approveProperty(propertyId);
    return await tx.wait();
  } catch (error) {
    console.error('Error approving property:', error);
    throw error;
  }
};

/**
 * Admin freezes or unfreezes a property.
 * @param {number|string} propertyId  On-chain property ID.
 * @param {boolean}       freeze      true = freeze, false = unfreeze.
 */
export const setPropertyActive = async (propertyId, freeze) => {
  try {
    const contract = await getPropTokenContract();
    const tx       = await contract.setPropertyActive(propertyId, freeze);
    return await tx.wait();
  } catch (error) {
    console.error('Error setting property active state:', error);
    throw error;
  }
};

// ─── View / Read Functions ────────────────────────────────────────────────

/**
 * Fetch full on-chain property data.
 * @param {number|string} propertyId
 * @returns {object}  Property struct with BigInt fields.
 */
export const getProperty = async (propertyId) => {
  try {
    const contract = await getPropTokenContractReadOnly();
    return await contract.getProperty(propertyId);
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};

/**
 * Get all on-chain properties.
 * @returns {Array}  Array of Property structs.
 */
export const getAllProperties = async () => {
  try {
    const contract = await getPropTokenContractReadOnly();
    return await contract.getAllProperties();
  } catch (error) {
    console.error('Error fetching all properties:', error);
    return [];
  }
};

/**
 * Get how many tokens of a property an investor holds.
 * @param {number|string} propertyId
 * @param {string}        userAddress  Investor's wallet address.
 * @returns {string}  Token count as string.
 */
export const getUserTokenBalance = async (propertyId, userAddress) => {
  try {
    const contract = await getPropTokenContractReadOnly();
    const balance  = await contract.getUserTokenBalance(propertyId, userAddress);
    return balance.toString();
  } catch (error) {
    console.error('Error getting user token balance:', error);
    return '0';
  }
};

/**
 * Get accumulated USDT revenue pending withdrawal for a property lister.
 * @param {number|string} propertyId
 * @returns {string}  Amount in human-readable USDT (e.g. "1250.50").
 */
export const getPendingRevenue = async (propertyId) => {
  try {
    const contract = await getPropTokenContractReadOnly();
    const raw      = await contract.getPendingRevenue(propertyId);
    return ethers.formatUnits(raw, 6);
  } catch (error) {
    console.error('Error getting pending revenue:', error);
    return '0';
  }
};

/**
 * Get the investor's USDT balance.
 * @param {string} address  Wallet address.
 * @returns {string}  Balance in human-readable USDT.
 */
export const getUSDTBalance = async (address) => {
  try {
    const { getProvider } = await import('./wallet');
    const provider = getProvider();
    const usdtReadOnly = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);
    const raw = await usdtReadOnly.balanceOf(address);
    return ethers.formatUnits(raw, 6);
  } catch (error) {
    console.error('Error getting USDT balance:', error);
    return '0';
  }
};

/**
 * Legacy: get the old-style token balance (kept for backwards compatibility
 * with existing dashboard components that call this).
 * Now returns USDT balance of the wallet.
 * @param {string} address
 */
export const getTokenBalance = async (address) => {
  const isDemoMode = localStorage.getItem('propToken_demoMode') !== 'false';
  if (isDemoMode) return '12500.0000';
  return getUSDTBalance(address);
};

/**
 * Legacy: kept so existing imports don't break.
 * Use buyTokens() for real on-chain purchases.
 */
export const invest = async (propertyId, amount) => {
  return buyTokens(propertyId, amount);
};

/**
 * Legacy: kept so existing imports don't break.
 * Use withdrawRevenue() or adminWithdraw() instead.
 */
export const withdraw = async (propertyId) => {
  return withdrawRevenue(propertyId);
};
