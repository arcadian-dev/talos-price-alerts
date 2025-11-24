import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { VendorProduct, PriceData, IVendorProduct } from '@/models';
import { ScraperService } from '@/lib/scraper/ScraperService';
import mongoose from 'mongoose';

// Type for lean() query results
type LeanVendorProduct = Omit<IVendorProduct, '_id'> & { 
  _id: string; 
  productId: { 
    _id: string; 
    name: string; 
    category: string; 
    unit: string; 
  } 
};

// POST /api/admin/scraper/test - Test scrape a single vendor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vendorId } = await request.json();

    if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
      return NextResponse.json({ error: 'Invalid vendor ID' }, { status: 400 });
    }

    await dbConnect();

    // Get vendor product with populated product data
    const vendorProduct = await VendorProduct.findById(vendorId)
      .populate('productId', 'name category unit')
      .lean() as LeanVendorProduct | null;

    if (!vendorProduct) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    if (!vendorProduct.isActive) {
      return NextResponse.json({ error: 'Vendor is not active' }, { status: 400 });
    }

    // Initialize scraper service
    const scraperService = new ScraperService();

    try {
      // Perform the scrape (cast to IVendorProduct for compatibility)
      const result = await scraperService.scrapeVendorProduct(vendorProduct as any);

      // Update vendor product with scrape attempt
      await VendorProduct.findByIdAndUpdate(vendorId, {
        lastScrapedAt: new Date(),
        ...(result.success 
          ? { 
              lastSuccessfulScrapeAt: new Date(),
              scrapeFailureCount: 0 
            }
          : { 
              $inc: { scrapeFailureCount: 1 } 
            }
        ),
      });

      // If successful, save the price data
      if (result.success && result.data) {
        const priceData = new PriceData(result.data);
        await priceData.save();
        
        return NextResponse.json({
          success: true,
          message: 'Scrape completed successfully',
          data: {
            price: result.data.price,
            amount: result.data.amount,
            unit: result.data.unit,
            pricePerUnit: result.data.pricePerUnit,
            confidence: result.data.confidence,
            scrapedAt: result.data.scrapedAt,
          },
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Scrape failed',
          error: result.error,
        });
      }

    } finally {
      await scraperService.close();
    }

  } catch (error) {
    console.error('Error in test scrape:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
