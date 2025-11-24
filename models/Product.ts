import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  description?: string;
  unit: string; // 'mg', 'ml', 'capsules', etc.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  unit: {
    type: String,
    required: true,
    enum: ['mg', 'ml', 'g', 'capsules', 'tablets', 'iu', 'mcg'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create indexes
ProductSchema.index({ name: 'text', category: 'text' });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1, isActive: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
