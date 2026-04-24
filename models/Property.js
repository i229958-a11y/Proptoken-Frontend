import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    required: true
  },
  city: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'mixed'],
    default: 'residential'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  tokensTotal: {
    type: Number,
    required: true,
    min: 0
  },
  tokensAvailable: {
    type: Number,
    required: true,
    min: 0
  },
  tokenPrice: {
    type: Number,
    required: true,
    min: 0
  },
  roi: {
    type: Number,
    default: 0
  },
  images: {
    type: [String],
    default: []
  },
  features: {
    type: [String],
    default: []
  },
  age: {
    type: Number,
    default: null
  },
  area: {
    type: Number,
    default: null
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium-low', 'medium', 'high', 'very-high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold_out'],
    default: 'pending'
  },
  visible: {
    type: Boolean,
    default: false
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
propertySchema.index({ status: 1 });
propertySchema.index({ visible: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ city: 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;





