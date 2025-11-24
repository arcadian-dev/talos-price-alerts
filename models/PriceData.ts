import mongoose, { Document, Schema } from 'mongoose';

export interface IPriceData extends Document {
  vendorProductId: mongoose.Types.ObjectId;
  price: number;
  amount: number;
  unit: string;
  pricePerUnit: number; // calculated field
  currency: string;
  isAvailable: boolean;
  confidence: number; // Grok API confidence score (0-1)
  rawData?: string; // original scraped HTML/data
  scrapedAt: Date;
  sourceUrl: string;
}

const PriceDataSchema = new Schema<IPriceData>({
  vendorProductId: {
    type: Schema.Types.ObjectId,
    ref: 'VendorProduct',
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    enum: ['mg', 'ml', 'g', 'capsules', 'tablets', 'iu', 'mcg'],
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD'],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1,
  },
  rawData: {
    type: String,
    maxlength: 10000, // Limit raw data size
  },
  scrapedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  sourceUrl: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: false, // We use scrapedAt instead
});

// Pre-save middleware to calculate pricePerUnit
PriceDataSchema.pre('save', function(next) {
  if (this.amount > 0 && this.price > 0) {
    this.pricePerUnit = this.price / this.amount;
  } else {
    // Prevent saving invalid data
    return next(new Error('PriceData validation failed: price and amount must be greater than 0'));
  }
  
  // Additional validation
  if (isNaN(this.pricePerUnit) || !isFinite(this.pricePerUnit)) {
    return next(new Error('PriceData validation failed: pricePerUnit calculation resulted in invalid number'));
  }
  
  next();
});

// Create indexes
PriceDataSchema.index({ vendorProductId: 1, scrapedAt: -1 });
PriceDataSchema.index({ scrapedAt: -1 });
PriceDataSchema.index({ pricePerUnit: 1 });

export default mongoose.models.PriceData || mongoose.model<IPriceData>('PriceData', PriceDataSchema);
