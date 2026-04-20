// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockUSDT
 * @notice A minimal ERC-20 token that mimics USDT (6 decimals) for use
 *         on Sepolia testnet or local Hardhat development.
 *
 * DEPLOYMENT (Remix):
 *   1. Compile this file
 *   2. Deploy → constructor mints 1,000,000 USDT to msg.sender
 *   3. Pass this contract's address to PropToken constructor
 *   4. Use mint() to give test USDT to investor wallets
 *
 * ❌ DO NOT use on mainnet — use the real USDT at:
 *    0xdAC17F958D2ee523a2206206994597C13D831ec7
 */
contract MockUSDT {
    string  public constant name     = "USD Tether (Mock)";
    string  public constant symbol   = "USDT";
    uint8   public constant decimals = 6;          // Matches real USDT

    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256)                     public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        owner = msg.sender;
        // Mint 1,000,000 USDT (= 1_000_000 * 10^6) to deployer
        _mint(msg.sender, 1_000_000 * 10 ** 6);
    }

    // ─── ERC-20 standard functions ─────────────────────────────────────────

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount)
        external
        returns (bool)
    {
        require(allowance[from][msg.sender] >= amount, "MockUSDT: allowance too low");
        allowance[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }

    // ─── Helpers for testing ───────────────────────────────────────────────

    /**
     * @notice Mint USDT to any address (for testing only).
     * @param to     Recipient address.
     * @param amount Amount in USDT with 6 decimals (e.g. 500 USDT = 500_000_000).
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "MockUSDT: not owner");
        _mint(to, amount);
    }

    // ─── Internal ──────────────────────────────────────────────────────────

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0),           "MockUSDT: transfer to zero address");
        require(balanceOf[from] >= amount,  "MockUSDT: insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to]   += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply    += amount;
        balanceOf[to]  += amount;
        emit Transfer(address(0), to, amount);
    }
}
