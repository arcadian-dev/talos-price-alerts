import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Product, VendorProduct, PriceData } from '@/models';

// GET /api/products - Public product listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'name'; // name, price, updated

    await dbConnect();

    const skip = (page - 1) * limit;

    // Build query for active products only
    const query: any = { isActive: true };
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }

    // Get products with basic info
    const products = await Product.find(query)
      .sort({ [sortBy]: sortBy === 'price' ? 1 : sortBy === 'updated' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    // Enrich products with latest pricing data
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        // Get vendor products for this product
        const vendorProducts = await VendorProduct.find({ 
          productId: product._id,
          isActive: true 
        }).lean();

        if (vendorProducts.length === 0) {
          return {
            ...product,
            pricing: null,
            vendorCount: 0,
          };
        }

        // Get latest price data
        const latestPrices = await PriceData.find({
          vendorProductId: { $in: vendorProducts.map(vp => vp._id) }
        })
        .sort({ scrapedAt: -1 })
        .limit(vendorProducts.length)
        .lean();

        if (latestPrices.length === 0) {
          return {
            ...product,
            pricing: null,
            vendorCount: vendorProducts.length,
          };
        }

        // Calculate pricing statistics
        const prices = latestPrices.map(p => p.price);
        const pricesPerUnit = latestPrices.map(p => p.pricePerUnit);

        const pricing = {
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          avgPrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
          minPricePerUnit: Math.min(...pricesPerUnit),
          maxPricePerUnit: Math.max(...pricesPerUnit),
          avgPricePerUnit: pricesPerUnit.reduce((sum, p) => sum + p, 0) / pricesPerUnit.length,
          lastUpdated: Math.max(...latestPrices.map(p => new Date(p.scrapedAt).getTime())),
        };

        return {
          ...product,
          pricing,
          vendorCount: vendorProducts.length,
        };
      })
    );

    // Get categories for filtering
    const categories = await Product.distinct('category', { isActive: true });

    return NextResponse.json({
      products: enrichedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      categories: categories.sort(),
      filters: {
        search,
        category,
        sortBy,
      },
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
