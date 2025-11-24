import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Product, VendorProduct, PriceData } from '@/models';
import { startOfDay, subDays, format } from 'date-fns';

// GET /api/products/[slug]/price-history - Get price history for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const vendorId = searchParams.get('vendorId'); // Optional: specific vendor

    await dbConnect();

    // Find product by slug
    const product = await Product.findOne({ slug: slug }).lean();
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate date range based on timeframe
    let daysBack = 30;
    switch (timeframe) {
      case '7d': daysBack = 7; break;
      case '30d': daysBack = 30; break;
      case '90d': daysBack = 90; break;
      case '1y': daysBack = 365; break;
    }

    const startDate = subDays(new Date(), daysBack);

    // Build aggregation pipeline
    const matchStage: any = {
      scrapedAt: { $gte: startDate },
    };

    // If specific vendor requested, filter by vendor
    if (vendorId) {
      matchStage.vendorProductId = vendorId;
    } else {
      // Get all vendor products for this product
      const vendorProducts = await VendorProduct.find({ 
        productId: (product as any)._id 
      }).select('_id').lean();
      
      matchStage.vendorProductId = { 
        $in: vendorProducts.map(vp => vp._id) 
      };
    }

    // Aggregate price data by day
    const priceHistory = await PriceData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$scrapedAt'
              }
            }
          },
          prices: { $push: '$price' },
          pricesPerUnit: { $push: '$pricePerUnit' },
          count: { $sum: 1 },
        }
      },
      {
        $project: {
          date: '$_id.date',
          open: { $arrayElemAt: ['$prices', 0] },
          close: { $arrayElemAt: ['$prices', -1] },
          high: { $max: '$prices' },
          low: { $min: '$prices' },
          avgPricePerUnit: { $avg: '$pricesPerUnit' },
          volume: '$count',
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Fill in missing days with previous day's close price
    const filledHistory = [];
    let lastPrice = null;

    for (let i = 0; i < daysBack; i++) {
      const currentDate = format(subDays(new Date(), daysBack - i - 1), 'yyyy-MM-dd');
      const existingData = priceHistory.find(ph => ph.date === currentDate);

      if (existingData) {
        filledHistory.push(existingData);
        lastPrice = existingData.close;
      } else if (lastPrice !== null) {
        // Fill with previous price
        filledHistory.push({
          date: currentDate,
          open: lastPrice,
          close: lastPrice,
          high: lastPrice,
          low: lastPrice,
          avgPricePerUnit: null,
          volume: 0,
        });
      }
    }

    // Calculate statistics
    const prices = filledHistory.map(h => h.close).filter(p => p > 0);
    const stats = {
      current: prices[prices.length - 1] || 0,
      high: Math.max(...prices) || 0,
      low: Math.min(...prices) || 0,
      change24h: prices.length > 1 
        ? ((prices[prices.length - 1] - prices[prices.length - 2]) / prices[prices.length - 2] * 100)
        : 0,
      avgPricePerUnit: priceHistory.length > 0
        ? priceHistory.reduce((sum, h) => sum + (h.avgPricePerUnit || 0), 0) / priceHistory.length
        : 0,
    };

    return NextResponse.json({
      product: {
        id: (product as any)._id,
        name: (product as any).name,
        slug: (product as any).slug,
        unit: (product as any).unit,
      },
      timeframe,
      data: filledHistory,
      stats,
      dataPoints: priceHistory.length,
    });

  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
