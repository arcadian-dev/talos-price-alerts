import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Product } from '@/models';
import { z } from 'zod';

// Validation schema for product creation/update
const productSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  unit: z.enum(['mg', 'ml', 'g', 'capsules', 'tablets', 'iu', 'mcg']),
});

// GET /api/admin/products - List all products
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
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/products - Starting request');
    
    const session = await getServerSession(authOptions);
    console.log('Session check:', session ? 'authenticated' : 'not authenticated');
    
    if (!session || session.user.role !== 'admin') {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Parsing request body...');
    const body = await request.json();
    console.log('Request body:', body);
    
    console.log('Validating data...');
    const validatedData = productSchema.parse(body);
    console.log('Validated data:', validatedData);

    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    console.log('Generated slug:', slug);

    // Check if slug already exists
    console.log('Checking for existing product...');
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      console.log('Product already exists with slug:', slug);
      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 400 }
      );
    }

    console.log('Creating new product...');
    const product = new Product({
      ...validatedData,
      slug,
    });

    console.log('Saving product to database...');
    await product.save();
    console.log('Product saved successfully:', product._id);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/products:', error);
    
    if (error instanceof z.ZodError) {
      console.log('Validation error details:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
