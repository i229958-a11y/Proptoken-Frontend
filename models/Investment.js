import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  propertyName: {
    type: String,
    required: true
  },
  propertyImage: {
    type: String,
    default: null
  },
  propertyLocation: {
    type: String,
    required: true
  },
  tokens: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
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
  transactionHash: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'cancelled'],
    default: 'active'
  },
  currentValuation: {
    type: Number,
    default: function() {
      return this.amount;
    }
  },
  tokensSold: {
    type: Number,
    default: 0
  },
  investedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
investmentSchema.index({ userId: 1 });
investmentSchema.index({ propertyId: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ investedAt: -1 });

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;





