import mongoose, { Document, Schema } from 'mongoose';

export interface IVendorProduct extends Document {
  productId: mongoose.Types.ObjectId;
  vendorName: string;
  url: string;
  isActive: boolean;
  scrapingSelector?: string; // CSS selector for price extraction
  lastScrapedAt?: Date;
  lastSuccessfulScrapeAt?: Date;
  scrapeFailureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const VendorProductSchema = new Schema<IVendorProduct>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  vendorName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  url: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid HTTP/HTTPS URL',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  scrapingSelector: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  lastScrapedAt: {
    type: Date,
  },
  lastSuccessfulScrapeAt: {
    type: Date,
  },
  scrapeFailureCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Create indexes
VendorProductSchema.index({ productId: 1, isActive: 1 });
VendorProductSchema.index({ vendorName: 1 });
VendorProductSchema.index({ lastScrapedAt: -1 });

export default mongoose.models.VendorProduct || mongoose.model<IVendorProduct>('VendorProduct', VendorProductSchema);
