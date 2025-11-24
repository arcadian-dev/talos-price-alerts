import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSubscription extends Document {
  email: string;
  productId: mongoose.Types.ObjectId;
  alertThreshold?: number; // price threshold for alerts
  alertType: 'price_drop' | 'new_vendor' | 'weekly_digest' | 'all';
  isActive: boolean;
  isVerified: boolean;
  verificationToken?: string;
  lastAlertSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address',
    },
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  alertThreshold: {
    type: Number,
    min: 0,
  },
  alertType: {
    type: String,
    enum: ['price_drop', 'new_vendor', 'weekly_digest', 'all'],
    default: 'all',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    sparse: true,
  },
  lastAlertSent: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Create compound index to prevent duplicate subscriptions
UserSubscriptionSchema.index({ email: 1, productId: 1 }, { unique: true });
UserSubscriptionSchema.index({ isActive: 1, isVerified: 1 });
UserSubscriptionSchema.index({ verificationToken: 1 }, { sparse: true });

export default mongoose.models.UserSubscription || mongoose.model<IUserSubscription>('UserSubscription', UserSubscriptionSchema);
