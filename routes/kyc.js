import express from 'express';
import KYCApplication from '../models/KYCApplication.js';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   POST /api/kyc/submit
// @desc    Submit KYC application
// @access  Private
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { kycDocuments } = req.body;

    if (!kycDocuments) {
      return res.status(400).json({
        success: false,
        message: 'KYC documents are required'
      });
    }

    // Check if user already has a pending application
    const existingApp = await KYCApplication.findOne({
      userId: req.user._id,
      status: { $in: ['submitted', 'hold'] }
    });

    let application;
    if (existingApp) {
      // Update existing application
      existingApp.kycDocuments = kycDocuments;
      existingApp.submittedDate = new Date();
      existingApp.status = 'submitted';
      await existingApp.save();
      application = existingApp;
    } else {
      // Create new application
      application = await KYCApplication.create({
        userId: req.user._id,
        userEmail: req.user.email,
        userName: req.user.name,
        kycDocuments,
        status: 'submitted'
      });

      // Update user KYC status
      await User.findByIdAndUpdate(req.user._id, {
        kycStatus: 'submitted'
      });
    }

    // Log action
    await AuditLog.create({
      actionType: 'kyc_submitted',
      userId: req.user._id,
      userEmail: req.user.email,
      data: {
        applicationId: application._id
      }
    });

    res.status(201).json({
      success: true,
      message: 'KYC application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/kyc/status
// @desc    Get current user's KYC status
// @access  Private
router.get('/status', authenticate, async (req, res) => {
  try {
    const application = await KYCApplication.findOne({ userId: req.user._id })
      .sort({ submittedDate: -1 });

    res.json({
      success: true,
      status: application?.status || 'not_submitted',
      rejectionReason: application?.rejectionReason || null,
      application
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/kyc/applications
// @desc    Get all KYC applications (Admin only)
// @access  Private/Admin
router.get('/applications', authenticate, isAdmin, async (req, res) => {
  try {
    const applications = await KYCApplication.find()
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ submittedDate: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get KYC applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/kyc/approve/:id
// @desc    Approve KYC application
// @access  Private/Admin
router.put('/approve/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const application = await KYCApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'KYC application not found'
      });
    }

    application.status = 'approved';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    // Update user KYC status
    await User.findByIdAndUpdate(application.userId, {
      kycStatus: 'approved'
    });

    // Log action
    await AuditLog.create({
      actionType: 'kyc_approved',
      userId: req.user._id,
      userEmail: req.user.email,
      data: {
        applicationId: application._id,
        approvedUserId: application.userId
      }
    });

    res.json({
      success: true,
      message: 'KYC application approved',
      application
    });
  } catch (error) {
    console.error('Approve KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/kyc/reject/:id
// @desc    Reject KYC application
// @access  Private/Admin
router.put('/reject/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const application = await KYCApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'KYC application not found'
      });
    }

    application.status = 'rejected';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    application.rejectionReason = rejectionReason || 'Not specified';
    await application.save();

    // Update user KYC status
    await User.findByIdAndUpdate(application.userId, {
      kycStatus: 'rejected'
    });

    // Log action
    await AuditLog.create({
      actionType: 'kyc_rejected',
      userId: req.user._id,
      userEmail: req.user.email,
      data: {
        applicationId: application._id,
        rejectedUserId: application.userId,
        rejectionReason
      }
    });

    res.json({
      success: true,
      message: 'KYC application rejected',
      application
    });
  } catch (error) {
    console.error('Reject KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
