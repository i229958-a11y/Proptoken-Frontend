/**
 * Smart Contract & Token Addresses
 * ─────────────────────────────────────────────────────────────────────────
 * After deployment, replace the placeholder addresses below with your
 * actual deployed contract addresses.
 *
 * PropToken constructor requires the USDT address for the target network.
 *
 * MAINNET USDT:  0xdAC17F958D2ee523a2206206994597C13D831ec7
 * SEPOLIA USDT:  Deploy MockUSDT.sol → use that address
 * LOCALHOST:     Deploy MockUSDT.sol → use that address (default shown)
 */

// ─── PropToken Contract Addresses ────────────────────────────────────────

export const PROP_TOKEN_ADDRESSES = {
  mainnet:   "0x0000000000000000000000000000000000000000", // ← replace after mainnet deploy
  sepolia:   "0x0000000000000000000000000000000000000000", // ← replace after Sepolia deploy
  localhost: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // default Hardhat first deploy
};

// ─── USDT Contract Addresses ──────────────────────────────────────────────

export const USDT_ADDRESSES = {
  mainnet:   "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Real USDT — do NOT change
  sepolia:   "0x0000000000000000000000000000000000000000", // ← replace with MockUSDT address on Sepolia
  localhost: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // default Hardhat second deploy
};

// ─── Active network (change this to switch environments) ─────────────────

const ACTIVE_NETWORK = "sepolia"; // "mainnet" | "sepolia" | "localhost"

export const PROP_TOKEN_CONTRACT_ADDRESS = PROP_TOKEN_ADDRESSES[ACTIVE_NETWORK];
export const USDT_CONTRACT_ADDRESS       = USDT_ADDRESSES[ACTIVE_NETWORK];
