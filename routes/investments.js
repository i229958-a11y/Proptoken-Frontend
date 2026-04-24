import express from 'express';
import Investment from '../models/Investment.js';
import Property from '../models/Property.js';
import { authenticate } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/investments
// @desc    Get all investments for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id })
      .populate('propertyId', 'name image location')
      .sort({ investedAt: -1 });

    res.json({
      success: true,
      count: investments.length,
      investments
    });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/investments/:id
// @desc    Get single investment
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate('propertyId')
      .populate('userId', 'name email');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Check if user owns this investment or is admin
    if (investment.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      investment
    });
  } catch (error) {
    console.error('Get investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/investments
// @desc    Create new investment
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { propertyId, tokens, amount, tokenPrice, transactionHash } = req.body;

    // Validate required fields
    if (!propertyId || !tokens || !amount || !tokenPrice) {
      return res.status(400).json({
        success: false,
        message: 'Property ID, tokens, amount, and token price are required'
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Create investment
    const investment = await Investment.create({
      userId: req.user._id,
      propertyId,
      propertyName: property.name,
      propertyImage: property.image || null,
      propertyLocation: property.location || property.city || 'Unknown',
      tokens,
      amount,
      tokenPrice,
      transactionHash: transactionHash || null,
      status: 'active'
    });

    // Log action
    await AuditLog.create({
      actionType: 'investment_created',
      userId: req.user._id,
      userEmail: req.user.email,
      data: {
        investmentId: investment._id,
        propertyId: property._id,
        propertyName: property.name,
        tokens,
        amount
      }
    });

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      investment
    });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/investments/:id
// @desc    Update investment
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Check if user owns this investment or is admin
    if (investment.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status, roi, currentValuation, tokensSold } = req.body;

    // Update allowed fields
    if (status) investment.status = status;
    if (roi !== undefined) investment.roi = roi;
    if (currentValuation !== undefined) investment.currentValuation = currentValuation;
    if (tokensSold !== undefined) investment.tokensSold = tokensSold;
    
    investment.lastUpdated = new Date();
    await investment.save();

    // Log action
    await AuditLog.create({
      actionType: 'investment_updated',
      userId: req.user._id,
      userEmail: req.user.email,
      data: {
        investmentId: investment._id,
        updates: req.body
      }
    });

    res.json({
      success: true,
      message: 'Investment updated successfully',
      investment
    });
  } catch (error) {
    console.error('Update investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/investments/:id
// @desc    Cancel/delete investment
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Check if user owns this investment or is admin
    if (investment.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow cancellation if status is active
    if (investment.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active investments can be cancelled'
      });
    }

    investment.status = 'cancelled';
    await investment.save();

    // Log action
    await AuditLog.create({
      actionType: 'investment_cancelled',
      userId: req.user._id,
      userEmail: req.user.email,
      data: {
        investmentId: investment._id,
        propertyId: investment.propertyId
      }
    });

    res.json({
      success: true,
      message: 'Investment cancelled successfully',
      investment
    });
  } catch (error) {
    console.error('Cancel investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;
