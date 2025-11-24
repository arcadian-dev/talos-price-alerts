import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Product, VendorProduct, PriceData } from '@/models';

// GET /api/products/[slug] - Get single product with vendor rankings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log(`API: Looking for product with slug: "${slug}"`);
    console.log(`API: Slug length: ${slug.length}`);
    console.log(`API: Slug char codes:`, Array.from(slug).map(c => c.charCodeAt(0)));
    
    await dbConnect();

    // First, let's see all products to debug
    const allProducts = await Product.find({}).lean();
    console.log(`API: All products in DB:`, allProducts.map(p => ({ 
      slug: p.slug, 
      slugLength: p.slug.length,
      isActive: p.isActive,
      exactMatch: p.slug === slug
    })));

    // Try exact string comparison
    const exactMatch = allProducts.find(p => p.slug === slug);
    console.log(`API: Exact string match:`, exactMatch ? 'Found' : 'Not found');

    // Find product by slug
    const product = await Product.findOne({ 
      slug: slug, 
      isActive: true 
    }).lean();

    console.log(`API: MongoDB query result:`, product ? `Found: ${(product as any).name}` : 'Not found');
    
    if (!product) {
      // Also try without isActive filter for debugging
      const anyProduct = await Product.findOne({ slug: slug }).lean();
      console.log(`API: Product without isActive filter:`, anyProduct ? `Found: ${(anyProduct as any).name}` : 'Still not found');
      
      return NextResponse.json({ 
        error: 'Product not found',
        debug: {
          searchedSlug: slug,
          allSlugs: allProducts.map(p => p.slug),
        }
      }, { status: 404 });
    }

    // Get all vendor products for this product
    const vendorProducts = await VendorProduct.find({ 
      productId: (product as any)._id,
      isActive: true 
    }).lean();

    // Get latest price data for each vendor
    const vendorRankings = await Promise.all(
      vendorProducts.map(async (vendorProduct) => {
        // Get latest price for this vendor
        const latestPrice = await PriceData.findOne({
          vendorProductId: vendorProduct._id
        })
        .sort({ scrapedAt: -1 })
        .lean();

        // Get price history (last 30 days) for trend calculation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const priceHistory = await PriceData.find({
          vendorProductId: vendorProduct._id,
          scrapedAt: { $gte: thirtyDaysAgo }
        })
        .sort({ scrapedAt: 1 })
        .limit(30)
        .lean();

        // Calculate trend
        let trend = 'stable';
        if (priceHistory.length >= 2) {
          const oldPrice = priceHistory[0].pricePerUnit;
          const newPrice = priceHistory[priceHistory.length - 1].pricePerUnit;
          const change = ((newPrice - oldPrice) / oldPrice) * 100;
          
          if (change > 5) trend = 'up';
          else if (change < -5) trend = 'down';
        }

        return {
          vendorId: vendorProduct._id,
          vendorName: vendorProduct.vendorName,
          url: vendorProduct.url,
          price: (latestPrice as any)?.price || null,
          amount: (latestPrice as any)?.amount || null,
          unit: (latestPrice as any)?.unit || (product as any).unit,
          pricePerUnit: (latestPrice as any)?.pricePerUnit || null,
          confidence: (latestPrice as any)?.confidence || null,
          lastUpdated: (latestPrice as any)?.scrapedAt || null,
          isAvailable: (latestPrice as any)?.isAvailable ?? null,
          trend,
          dataPoints: priceHistory.length,
          lastSuccessfulScrape: vendorProduct.lastSuccessfulScrapeAt,
          failureCount: vendorProduct.scrapeFailureCount,
        };
      })
    );

    // Sort vendors by price per unit (ascending - cheapest first)
    const rankedVendors = vendorRankings
      .filter(v => v.pricePerUnit !== null)
      .sort((a, b) => a.pricePerUnit! - b.pricePerUnit!)
      .concat(vendorRankings.filter(v => v.pricePerUnit === null));

    // Calculate product statistics
    const availablePrices = rankedVendors
      .filter(v => v.pricePerUnit !== null && v.isAvailable !== false)
      .map(v => v.pricePerUnit!);

    const stats = availablePrices.length > 0 ? {
      bestPrice: Math.min(...availablePrices),
      worstPrice: Math.max(...availablePrices),
      avgPrice: availablePrices.reduce((sum, p) => sum + p, 0) / availablePrices.length,
      vendorCount: rankedVendors.length,
      availableVendors: availablePrices.length,
      lastUpdated: Math.max(...rankedVendors
        .filter(v => v.lastUpdated)
        .map(v => new Date(v.lastUpdated!).getTime())
      ),
    } : null;

    return NextResponse.json({
      product: {
        id: (product as any)._id,
        name: (product as any).name,
        slug: (product as any).slug,
        category: (product as any).category,
        description: (product as any).description,
        unit: (product as any).unit,
        createdAt: (product as any).createdAt,
        updatedAt: (product as any).updatedAt,
      },
      vendors: rankedVendors,
      stats,
    });

  } catch (error) {
    console.error('Error fetching product details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
