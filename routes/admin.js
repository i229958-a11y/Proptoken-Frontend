import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Investment from '../models/Investment.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        kycStatus: user.kycStatus,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
        phone: user.phone,
        address: user.address,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        registrationDate: user.createdAt,
        isActive: true, // All registered users are active
      }))
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/transactions
// @desc    Get all transactions/investments (Admin only)
// @access  Private/Admin
router.get('/transactions', async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('userId', 'name email')
      .populate('propertyId', 'name location')
      .sort({ investedAt: -1 });

    const transactions = investments.map(inv => ({
      id: inv._id,
      _id: inv._id,
      userId: inv.userId?._id || inv.userId,
      userName: inv.userId?.name || 'Unknown',
      userEmail: inv.userId?.email || 'Unknown',
      propertyId: inv.propertyId?._id || inv.propertyId,
      propertyName: inv.propertyName || inv.propertyId?.name || 'Unknown Property',
      tokens: inv.tokens,
      amount: inv.amount,
      tokenPrice: inv.tokenPrice,
      roi: inv.roi,
      transactionHash: inv.transactionHash,
      status: inv.status || 'active',
      investedAt: inv.investedAt,
      currentValuation: inv.currentValuation || inv.amount,
    }));

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;





