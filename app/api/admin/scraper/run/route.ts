import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { VendorProduct, PriceData, IVendorProduct } from '@/models';
import { ScraperService } from '@/lib/scraper/ScraperService';

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

// POST /api/admin/scraper/run - Run scraper for all active vendors or specific product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, limit = 10 } = await request.json();

    await dbConnect();

    // Build query for active vendors
    const query: any = { isActive: true };
    if (productId) {
      query.productId = productId;
    }

    // Get vendors to scrape (limit to prevent overwhelming)
    const vendorProducts = await VendorProduct.find(query)
      .populate('productId', 'name category unit')
      .limit(parseInt(limit))
      .lean() as any[];

    if (vendorProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active vendors found to scrape',
        report: {
          totalVendors: 0,
          successfulScrapes: 0,
          failedScrapes: 0,
          results: [],
        },
      });
    }

    // Initialize scraper service
    const scraperService = new ScraperService();

    try {
      // Run the scraping process (cast for compatibility)
      const report = await scraperService.scrapeMultipleVendors(vendorProducts as any);

      // Process results and save successful scrapes
      const savedPrices = [];
      
      for (const result of report.results) {
        // Update vendor product with scrape attempt
        await VendorProduct.findByIdAndUpdate(result.vendorProductId, {
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

        // Save successful price data
        if (result.success && result.data) {
          const priceData = new PriceData(result.data);
          await priceData.save();
          savedPrices.push(priceData);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Scraping completed. ${report.successfulScrapes} successful, ${report.failedScrapes} failed.`,
        report: {
          ...report,
          savedPrices: savedPrices.length,
          duration: report.endTime.getTime() - report.startTime.getTime(),
        },
      });

    } finally {
      await scraperService.close();
    }

  } catch (error) {
    console.error('Error in scraper run:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
