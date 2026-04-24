import express from 'express';
import Property from '../models/Property.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/properties
// @desc    Get all properties (with filters)
// @access  Public (filtered by visible/status)
router.get('/', async (req, res) => {
  try {
    const { visible, status, type, city } = req.query;
    
    const filter = {};
    if (visible !== undefined) filter.visible = visible === 'true';
    if (status) {
      // Validate status to prevent injection
      const allowedStatuses = ['pending', 'approved', 'rejected', 'active'];
      if (allowedStatuses.includes(status)) {
        filter.status = status;
      }
    }
    if (type) {
      // Validate type to prevent injection
      const allowedTypes = ['residential', 'commercial', 'industrial', 'land'];
      if (allowedTypes.includes(type)) {
        filter.type = type;
      }
    }
    if (city) {
      // Sanitize city input to prevent regex injection
      const sanitizedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.city = new RegExp(sanitizedCity, 'i');
    }

    const properties = await Property.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/properties
// @desc    Create new property listing
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      submittedBy: req.user._id,
      status: 'pending',
      visible: false
    };

    const property = await Property.create(propertyData);

    // Log action
    await AuditLog.create({
      actionType: 'property_listed',
      userId: req.user._id,
      userEmail: req.user.email,
      data: {
        propertyId: property._id,
        propertyName: property.name
      }
    });

    res.status(201).json({
      success: true,
      message: 'Property listing created successfully',
      property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/properties/:id/approve
// @desc    Approve property listing
// @access  Private/Admin
router.put('/:id/approve', authenticate, isAdmin, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.status = 'approved';
    property.visible = true;
    property.approvedBy = req.user._id;
    property.approvedAt = new Date();
    await property.save();

    // Log action
    await AuditLog.create({
      actionType: 'property_approved',
      userId: req.user._id,
      userEmail: req.user.email,
      data: {
        propertyId: property._id,
        propertyName: property.name
      }
    });

    res.json({
      success: true,
      message: 'Property approved successfully',
      property
    });
  } catch (error) {
    console.error('Approve property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/properties/:id/reject
// @desc    Reject property listing
// @access  Private/Admin
router.put('/:id/reject', authenticate, isAdmin, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.status = 'rejected';
    property.visible = false;
    property.rejectionReason = rejectionReason || 'Not specified';
    await property.save();

    // Log action
    await AuditLog.create({
      actionType: 'property_rejected',
      userId: req.user._id,
      userEmail: req.user.email,
      data: {
        propertyId: property._id,
        propertyName: property.name,
        rejectionReason
      }
    });

    res.json({
      success: true,
      message: 'Property rejected',
      property
    });
  } catch (error) {
    console.error('Reject property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;





