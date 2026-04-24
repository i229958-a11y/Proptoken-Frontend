import express from 'express';
import Investment from '../models/Investment.js';
import Property from '../models/Property.js';
import { authenticate } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/sell
// @desc    Sell tokens (update investment status)
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { investmentId, tokensToSell } = req.body;

    if (!investmentId || !tokensToSell) {
      return res.status(400).json({
        success: false,
        message: 'Investment ID and tokens to sell are required'
      });
    }

    // Get investment
    const investment = await Investment.findOne({
      _id: investmentId,
      userId: req.user._id,
      status: 'active'
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found or already sold'
      });
    }

    // Check if user has enough tokens
    if (parseFloat(tokensToSell) > investment.tokens) {
      return res.status(400).json({
        success: false,
        message: 'Not enough tokens to sell'
      });
    }

    // Update investment
    if (parseFloat(tokensToSell) === investment.tokens) {
      // Sell all tokens - mark as sold
      investment.status = 'sold';
      investment.tokensSold = investment.tokens;
    } else {
      // Partial sale - create new investment with remaining tokens
      const remainingTokens = investment.tokens - parseFloat(tokensToSell);
      const soldAmount = (parseFloat(tokensToSell) / investment.tokens) * investment.amount;
      
      // Update current investment
      investment.tokens = remainingTokens;
      investment.amount = investment.amount - soldAmount;
      investment.tokensSold = parseFloat(tokensToSell);
      
      // Create new investment record for sold portion
      await Investment.create({
        userId: req.user._id,
        propertyId: investment.propertyId,
        propertyName: investment.propertyName,
        propertyImage: investment.propertyImage,
        propertyLocation: investment.propertyLocation,
        tokens: parseFloat(tokensToSell),
        amount: soldAmount,
        tokenPrice: investment.tokenPrice,
        roi: investment.roi,
        status: 'sold',
        investedAt: investment.investedAt,
        tokensSold: parseFloat(tokensToSell)
      });
    }

    // Update property tokens available
    const property = await Property.findById(investment.propertyId);
    if (property) {
      property.tokensAvailable += parseFloat(tokensToSell);
      await property.save();
    }

    await investment.save();

    // Log action
    await AuditLog.create({
      actionType: 'tokens_sold',
      userId: req.user._id,
      userEmail: req.user.email,
      data: {
        investmentId: investment._id,
        propertyId: investment.propertyId,
        tokensSold: parseFloat(tokensToSell)
      }
    });

    res.json({
      success: true,
      message: 'Tokens sold successfully',
      investment
    });
  } catch (error) {
    console.error('Sell tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;





