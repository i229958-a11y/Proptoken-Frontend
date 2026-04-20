// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PropToken
 * @notice Allows property owners to tokenize their real estate and investors
 *         to buy fractional shares using USDT (ERC-20, 6 decimals).
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  FLOW                                                           │
 * │  1. Property owner calls listProperty(totalTokens, priceUSDT)  │
 * │  2. Admin (contract owner) calls approveProperty(propertyId)   │
 * │  3. Investor: usdt.approve(propTokenAddr, cost)                │
 * │               propToken.buyTokens(propertyId, amount)           │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * DEPLOYMENT:
 *   constructor(_usdtAddress)
 *     Sepolia   → deploy MockUSDT.sol first, pass its address
 *     Mainnet   → 0xdAC17F958D2ee523a2206206994597C13D831ec7
 *     Localhost → deploy MockUSDT.sol first, pass its address
 */

// ─── Minimal ERC-20 interface (only what we need) ─────────────────────────
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract PropToken {
    // ─── State ─────────────────────────────────────────────────────────────

    address public owner;           // Admin / contract deployer
    IERC20  public usdt;            // USDT token contract
    uint256 public propertyCount;   // Auto-incrementing property ID

    struct Property {
        uint256 propertyId;
        address lister;             // Wallet that listed the property
        uint256 totalTokens;        // Total tokens the property is divided into
        uint256 tokensAvailable;    // Tokens left to sell
        uint256 tokenPriceUSDT;     // Price per token in USDT (6 decimal places)
        bool    isApproved;         // Approved by admin
        bool    isActive;           // Not frozen
    }

    // propertyId → Property
    mapping(uint256 => Property) public properties;

    // propertyId → investor address → token balance
    mapping(uint256 => mapping(address => uint256)) public tokenBalances;

    // Total USDT collected per property (for lister to withdraw)
    mapping(uint256 => uint256) public propertyRevenue;

    // ─── Events ────────────────────────────────────────────────────────────

    event PropertyListed(
        uint256 indexed propertyId,
        address indexed lister,
        uint256 totalTokens,
        uint256 tokenPriceUSDT
    );

    event PropertyApproved(uint256 indexed propertyId);
    event PropertyFrozen(uint256 indexed propertyId, bool frozen);

    event TokensPurchased(
        uint256 indexed propertyId,
        address indexed buyer,
        uint256 amount,
        uint256 totalCostUSDT
    );

    event RevenueWithdrawn(
        uint256 indexed propertyId,
        address indexed lister,
        uint256 amountUSDT
    );

    event AdminWithdrawn(address indexed admin, uint256 amountUSDT);

    // ─── Modifiers ─────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "PropToken: not the admin");
        _;
    }

    modifier propertyExists(uint256 propertyId) {
        require(propertyId < propertyCount, "PropToken: property does not exist");
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────────

    /**
     * @param _usdtAddress Address of the USDT ERC-20 contract.
     *   Mainnet:   0xdAC17F958D2ee523a2206206994597C13D831ec7
     *   Testnet:   Deploy MockUSDT.sol and pass its address
     */
    constructor(address _usdtAddress) {
        require(_usdtAddress != address(0), "PropToken: invalid USDT address");
        owner = msg.sender;
        usdt  = IERC20(_usdtAddress);
    }

    // ─── Property Owner Functions ──────────────────────────────────────────

    /**
     * @notice List a property for tokenization. Admin must approve before
     *         tokens go on sale.
     * @param _totalTokens     How many tokens to divide the property into.
     *                         e.g. 10000 tokens for a $2.5M property.
     * @param _tokenPriceUSDT  Price per single token in USDT, using 6 decimals.
     *                         e.g. 250 USDT → pass 250_000_000 (250 * 10^6)
     */
    function listProperty(
        uint256 _totalTokens,
        uint256 _tokenPriceUSDT
    ) external returns (uint256 propertyId) {
        require(_totalTokens > 0,       "PropToken: total tokens must be > 0");
        require(_tokenPriceUSDT > 0,    "PropToken: token price must be > 0");

        propertyId = propertyCount++;

        properties[propertyId] = Property({
            propertyId:      propertyId,
            lister:          msg.sender,
            totalTokens:     _totalTokens,
            tokensAvailable: _totalTokens,
            tokenPriceUSDT:  _tokenPriceUSDT,
            isApproved:      false,
            isActive:        true
        });

        emit PropertyListed(propertyId, msg.sender, _totalTokens, _tokenPriceUSDT);
    }

    /**
     * @notice Property lister withdraws their portion of the accumulated USDT
     *         revenue for one of their properties.
     * @param propertyId The property to withdraw revenue from.
     */
    function withdrawRevenue(uint256 propertyId)
        external
        propertyExists(propertyId)
    {
        Property storage prop = properties[propertyId];
        require(msg.sender == prop.lister, "PropToken: not the lister");

        uint256 amount = propertyRevenue[propertyId];
        require(amount > 0, "PropToken: no revenue to withdraw");

        propertyRevenue[propertyId] = 0;
        require(usdt.transfer(msg.sender, amount), "PropToken: USDT transfer failed");

        emit RevenueWithdrawn(propertyId, msg.sender, amount);
    }

    // ─── Admin Functions ───────────────────────────────────────────────────

    /**
     * @notice Approve a listed property so tokens become available to buy.
     * @param propertyId The property to approve.
     */
    function approveProperty(uint256 propertyId)
        external
        onlyOwner
        propertyExists(propertyId)
    {
        properties[propertyId].isApproved = true;
        emit PropertyApproved(propertyId);
    }

    /**
     * @notice Freeze or unfreeze a property (emergency stop).
     * @param propertyId The property to freeze/unfreeze.
     * @param freeze     true = freeze, false = unfreeze.
     */
    function setPropertyActive(uint256 propertyId, bool freeze)
        external
        onlyOwner
        propertyExists(propertyId)
    {
        // freeze=true → isActive=false (frozen), freeze=false → isActive=true (live)
        properties[propertyId].isActive = !freeze;
        emit PropertyFrozen(propertyId, freeze);
    }

    /**
     * @notice Admin emergency withdrawal of all USDT held by the contract.
     *         Use only if property revenue mapping becomes out of sync.
     * @param amount Amount in USDT (6 decimals) to withdraw.
     */
    function adminWithdraw(uint256 amount) external onlyOwner {
        require(
            usdt.balanceOf(address(this)) >= amount,
            "PropToken: insufficient contract balance"
        );
        require(usdt.transfer(owner, amount), "PropToken: transfer failed");
        emit AdminWithdrawn(owner, amount);
    }

    /**
     * @notice Transfer contract ownership (admin role) to a new address.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "PropToken: zero address");
        owner = newOwner;
    }

    // ─── Investor Functions ────────────────────────────────────────────────

    /**
     * @notice Buy tokens for an approved property.
     *
     * ⚠️  Before calling this, the investor MUST call:
     *       usdt.approve(propTokenContractAddress, totalCost)
     *     where totalCost = amount * property.tokenPriceUSDT
     *
     * @param propertyId  ID of the property to invest in.
     * @param amount      Number of tokens to purchase (whole tokens, no decimals).
     */
    function buyTokens(uint256 propertyId, uint256 amount)
        external
        propertyExists(propertyId)
    {
        Property storage prop = properties[propertyId];

        require(prop.isApproved,               "PropToken: property not approved");
        require(prop.isActive,                 "PropToken: property is frozen");
        require(amount > 0,                    "PropToken: amount must be > 0");
        require(amount <= prop.tokensAvailable,"PropToken: not enough tokens available");

        uint256 totalCost = amount * prop.tokenPriceUSDT;

        // Pull USDT from buyer (buyer must have pre-approved this contract)
        require(
            usdt.transferFrom(msg.sender, address(this), totalCost),
            "PropToken: USDT transfer failed — did you approve first?"
        );

        // Update state
        prop.tokensAvailable        -= amount;
        tokenBalances[propertyId][msg.sender] += amount;
        propertyRevenue[propertyId] += totalCost;

        emit TokensPurchased(propertyId, msg.sender, amount, totalCost);
    }

    // ─── View Functions ────────────────────────────────────────────────────

    /**
     * @notice Get full details of a property.
     */
    function getProperty(uint256 propertyId)
        external
        view
        propertyExists(propertyId)
        returns (Property memory)
    {
        return properties[propertyId];
    }

    /**
     * @notice Get how many tokens of a property a user holds.
     */
    function getUserTokenBalance(uint256 propertyId, address user)
        external
        view
        returns (uint256)
    {
        return tokenBalances[propertyId][user];
    }

    /**
     * @notice Get the token price for a property in USDT (6 decimals).
     *         e.g. returns 250_000_000 for 250 USDT per token.
     */
    function getTokenPrice(uint256 propertyId)
        external
        view
        propertyExists(propertyId)
        returns (uint256)
    {
        return properties[propertyId].tokenPriceUSDT;
    }

    /**
     * @notice Get the total number of listed properties.
     */
    function getTotalProperties() external view returns (uint256) {
        return propertyCount;
    }

    /**
     * @notice Get all properties (use off-chain only for small counts,
     *         or paginate for large ones).
     */
    function getAllProperties() external view returns (Property[] memory) {
        Property[] memory result = new Property[](propertyCount);
        for (uint256 i = 0; i < propertyCount; i++) {
            result[i] = properties[i];
        }
        return result;
    }

    /**
     * @notice How much USDT revenue the lister of a property can withdraw.
     */
    function getPendingRevenue(uint256 propertyId)
        external
        view
        returns (uint256)
    {
        return propertyRevenue[propertyId];
    }

    /**
     * @notice Total USDT balance held by the contract.
     */
    function getContractUSDTBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }
}
