import mongoose from 'mongoose';

const kycApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  kycDocuments: {
    cnicFront: {
      type: String,
      required: true
    },
    cnicBack: {
      type: String,
      required: true
    },
    selfie: {
      type: String,
      required: true
    },
    addressProof: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected', 'hold'],
    default: 'submitted'
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
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
kycApplicationSchema.index({ userId: 1 });
kycApplicationSchema.index({ status: 1 });
kycApplicationSchema.index({ submittedDate: -1 });

const KYCApplication = mongoose.model('KYCApplication', kycApplicationSchema);

export default KYCApplication;
