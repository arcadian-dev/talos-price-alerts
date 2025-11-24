import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { VendorProduct } from '@/models';
import { z } from 'zod';
import mongoose from 'mongoose';

const vendorUpdateSchema = z.object({
  vendorName: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  scrapingSelector: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/vendors/[id] - Get single vendor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid vendor ID' }, { status: 400 });
    }

    await dbConnect();

    const vendor = await VendorProduct.findById(id)
      .populate('productId', 'name category unit')
      .lean();

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/vendors/[id] - Update vendor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid vendor ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = vendorUpdateSchema.parse(body);

    await dbConnect();

    // If URL is being updated, check for duplicates
    if (validatedData.url) {
      const vendor = await VendorProduct.findById(id);
      if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
      }

      const existingVendor = await VendorProduct.findOne({
        productId: vendor.productId,
        url: validatedData.url,
        _id: { $ne: id },
      });

      if (existingVendor) {
        return NextResponse.json(
          { error: 'This URL is already being tracked for this product' },
          { status: 400 }
        );
      }
    }

    const updatedVendor = await VendorProduct.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    ).populate('productId', 'name category unit');

    if (!updatedVendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json(updatedVendor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating vendor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/vendors/[id] - Delete vendor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid vendor ID' }, { status: 400 });
    }

    await dbConnect();

    const vendor = await VendorProduct.findByIdAndDelete(id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
