import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { VendorProduct, Product } from '@/models';
import { z } from 'zod';

const vendorSchema = z.object({
  productId: z.string().min(1),
  vendorName: z.string().min(1).max(100),
  url: z.string().url(),
  scrapingSelector: z.string().max(500).optional(),
});

// GET /api/admin/vendors - List all vendor products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const productId = searchParams.get('productId') || '';
    const vendorName = searchParams.get('vendorName') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (productId) {
      query.productId = productId;
    }
    if (vendorName) {
      query.vendorName = { $regex: vendorName, $options: 'i' };
    }

    const [vendors, total] = await Promise.all([
      VendorProduct.find(query)
        .populate('productId', 'name category unit')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      VendorProduct.countDocuments(query),
    ]);

    return NextResponse.json({
      vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/vendors - Create new vendor product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = vendorSchema.parse(body);

    await dbConnect();

    // Verify product exists
    const product = await Product.findById(validatedData.productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if vendor URL already exists for this product
    const existingVendor = await VendorProduct.findOne({
      productId: validatedData.productId,
      url: validatedData.url,
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: 'This URL is already being tracked for this product' },
        { status: 400 }
      );
    }

    const vendor = new VendorProduct(validatedData);
    await vendor.save();

    // Populate product data for response
    await vendor.populate('productId', 'name category unit');

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating vendor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
