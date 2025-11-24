import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Product, VendorProduct, PriceData } from '@/models';

// GET /api/debug/products - Debug endpoint to check database state
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all products
    const products = await Product.find({}).lean();
    
    // Get all vendor products
    const vendorProducts = await VendorProduct.find({}).lean();
    
    // Get all price data
    const priceData = await PriceData.find({}).lean();

    // Get specific BPC-157 data
    const bpcProduct = await Product.findOne({ slug: 'bpc-157' }).lean();
    let bpcVendors = [];
    let bpcPrices = [];
    
    if (bpcProduct) {
      bpcVendors = await VendorProduct.find({ productId: (bpcProduct as any)._id }).lean();
      if (bpcVendors.length > 0) {
        bpcPrices = await PriceData.find({ 
          vendorProductId: { $in: bpcVendors.map(v => v._id) }
        }).lean();
      }
    }

    return NextResponse.json({
      summary: {
        totalProducts: products.length,
        totalVendorProducts: vendorProducts.length,
        totalPriceData: priceData.length,
      },
      bpcAnalysis: {
        productFound: !!bpcProduct,
        productId: (bpcProduct as any)?._id,
        vendorCount: bpcVendors.length,
        priceDataCount: bpcPrices.length,
      },
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        slug: p.slug,
        isActive: p.isActive,
      })),
      vendorProducts: vendorProducts.map(vp => ({
        id: vp._id,
        productId: vp.productId,
        vendorName: vp.vendorName,
        isActive: vp.isActive,
      })),
      samplePriceData: priceData.slice(0, 5).map(pd => ({
        id: pd._id,
        vendorProductId: pd.vendorProductId,
        price: pd.price,
        amount: pd.amount,
        unit: pd.unit,
        scrapedAt: pd.scrapedAt,
      })),
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Debug API error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
