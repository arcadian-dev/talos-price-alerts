import puppeteer, { Browser, Page } from 'puppeteer';
import { IVendorProduct, IPriceData } from '@/models';
import { GrokClient } from './GrokClient';

export interface ScrapedData {
  price: number;
  amount: number;
  unit: string;
  confidence: number;
  rawText: string;
}

export interface ScrapingResult {
  success: boolean;
  data?: IPriceData;
  error?: string;
  vendorProductId: string;
}

export interface ScrapingReport {
  totalVendors: number;
  successfulScrapes: number;
  failedScrapes: number;
  results: ScrapingResult[];
  startTime: Date;
  endTime: Date;
}

export class ScraperService {
  private browser: Browser | null = null;
  private grokClient: GrokClient;

  constructor() {
    this.grokClient = new GrokClient();
  }

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeVendorProduct(vendorProduct: IVendorProduct): Promise<ScrapingResult> {
    const result: ScrapingResult = {
      success: false,
      vendorProductId: vendorProduct._id.toString(),
    };

    let page: Page | null = null;

    try {
      await this.initialize();
      
      if (!this.browser) {
        throw new Error('Failed to initialize browser');
      }

      page = await this.browser.newPage();

      // Set user agent to avoid bot detection
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      console.log(`Scraping ${vendorProduct.vendorName}: ${vendorProduct.url}`);

      // Navigate to the page
      console.log('Navigating to page...');
      await page.goto(vendorProduct.url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      console.log('Page loaded successfully');

      // Wait a bit for dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract page content
      console.log('Extracting page content...');
      const pageContent = await page.content();
      console.log(`Page content length: ${pageContent.length} characters`);
      
      // Try to extract price using CSS selector if provided
      let priceText = '';
      if (vendorProduct.scrapingSelector) {
        console.log(`Trying CSS selector: ${vendorProduct.scrapingSelector}`);
        try {
          const element = await page.$(vendorProduct.scrapingSelector);
          if (element) {
            priceText = await page.evaluate(el => el.textContent || '', element);
            console.log(`CSS selector found text: "${priceText}"`);
          } else {
            console.log('CSS selector found no matching elements');
          }
        } catch (error) {
          console.log('CSS selector failed:', error);
        }
      }

      // If no specific selector or selector failed, get full page content
      if (!priceText) {
        console.log('No CSS selector or selector failed, extracting full page content...');
        
        // Always get full page content for Grok API analysis
        // This gives Grok the full context to find both price and amount/unit
        priceText = await page.evaluate(() => {
          return document.body.innerText.substring(0, 5000); // Limit to first 5000 chars
        });
        
        console.log(`Extracted full page text length: ${priceText.length} characters`);
        console.log(`First 200 chars: "${priceText.substring(0, 200)}"`);
      }

      if (!priceText || priceText.trim().length === 0) {
        console.log('No text content extracted from page');
        result.error = 'No content could be extracted from the page';
        return result;
      }

      // Use Grok API to extract structured price data
      console.log('Sending content to Grok API for price extraction...');
      const grokData = await this.extractPriceWithGrok(priceText, vendorProduct);
      console.log('Grok API response:', grokData);

      if (grokData) {
        // Create price data object
        const priceData: Partial<IPriceData> = {
          vendorProductId: vendorProduct._id,
          price: grokData.price,
          amount: grokData.amount,
          unit: grokData.unit,
          pricePerUnit: grokData.price / grokData.amount,
          currency: 'USD',
          isAvailable: true,
          confidence: grokData.confidence,
          rawData: priceText.substring(0, 1000), // Store first 1000 chars
          scrapedAt: new Date(),
          sourceUrl: vendorProduct.url,
        };

        result.success = true;
        result.data = priceData as IPriceData;
      } else {
        result.error = 'Failed to extract price data from page content';
      }

    } catch (error) {
      console.error(`Error scraping ${vendorProduct.vendorName}:`, error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('waitForTimeout')) {
          result.error = 'Puppeteer API error: waitForTimeout method not available';
        } else if (error.message.includes('timeout')) {
          result.error = `Timeout error: Page took too long to load (${vendorProduct.url})`;
        } else if (error.message.includes('net::')) {
          result.error = `Network error: Could not reach ${vendorProduct.url}`;
        } else {
          result.error = error.message;
        }
      } else {
        result.error = 'Unknown scraping error';
      }
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.warn('Error closing page:', closeError);
        }
      }
    }

    return result;
  }

  private async extractPriceWithGrok(content: string, vendorProduct: IVendorProduct): Promise<ScrapedData | null> {
    try {
      // Get product info for context
      const productName = typeof vendorProduct.productId === 'object' 
        ? (vendorProduct.productId as any).name 
        : 'unknown product';

      console.log(`Calling Grok API for product: ${productName}`);
      console.log(`Content length being sent: ${content.length} characters`);
      console.log(`First 50 characters of content: "${content.substring(0, 50)}"`);
      if (content.length < 100) {
        console.log(`Full content (short): "${content}"`);
      }

      const grokResponse = await this.grokClient.extractPriceData(
        content, 
        productName, 
        vendorProduct.vendorName
      );

      console.log('Grok API response received:', {
        success: grokResponse.success,
        hasData: !!grokResponse.data,
        error: grokResponse.error
      });

      if (grokResponse.success && grokResponse.data) {
        console.log('Grok API extracted data:', grokResponse.data);
        
        // Validate Grok response - check if it actually found meaningful data
        const isValidData = grokResponse.data.price > 0 && 
                           grokResponse.data.amount > 0 && 
                           grokResponse.data.unit && 
                           grokResponse.data.confidence > 0;
        
        if (isValidData) {
          console.log('Grok API data is valid, using it');
          return {
            price: grokResponse.data.price,
            amount: grokResponse.data.amount,
            unit: grokResponse.data.unit,
            confidence: grokResponse.data.confidence,
            rawText: content.substring(0, 500),
          };
        } else {
          console.warn('Grok API returned invalid data (zeros/empty), using fallback extraction');
        }
      } else {
        console.warn('Grok API failed, using fallback extraction:', grokResponse.error);
      }
      
      console.log('Attempting fallback price extraction...');
      const fallbackResult = this.fallbackPriceExtraction(content, vendorProduct);
      console.log('Fallback extraction result:', fallbackResult);
      return fallbackResult;

    } catch (error) {
      console.error('Error calling Grok API:', error);
      console.log('Attempting fallback price extraction due to error...');
      const fallbackResult = this.fallbackPriceExtraction(content, vendorProduct);
      console.log('Fallback extraction result:', fallbackResult);
      return fallbackResult;
    }
  }

  private fallbackPriceExtraction(content: string, vendorProduct: IVendorProduct): ScrapedData | null {
    try {
      console.log('Starting fallback price extraction...');
      console.log(`Content sample: "${content.substring(0, 300)}"`);
      
      // Check URL for size parameter (common pattern)
      const urlMatch = vendorProduct?.url?.match(/size[=:](\d+(?:\.\d+)?)(mg|ml|g|mcg|iu)/i);
      if (urlMatch) {
        console.log(`Found size in URL: ${urlMatch[1]}${urlMatch[2]}`);
      }
      
      // Multiple regex patterns for price extraction
      const pricePatterns = [
        /\$(\d+(?:\.\d{2})?)/g,           // $19.99
        /(\d+(?:\.\d{2})?)\s*USD/gi,      // 19.99 USD
        /Price[:\s]*\$?(\d+(?:\.\d{2})?)/gi, // Price: $19.99
        /(\d+(?:\.\d{2})?)\s*dollars?/gi, // 19.99 dollars
      ];

      // Multiple regex patterns for amount/unit extraction
      const amountPatterns = [
        /(\d+(?:\.\d+)?)\s*(mg|ml|g|capsules?|tablets?|iu|mcg)/gi,
        /(\d+(?:\.\d+)?)\s*x\s*(\d+)\s*(mg|ml|g|capsules?|tablets?|iu|mcg)/gi,
        /Quantity[:\s]*(\d+(?:\.\d+)?)\s*(mg|ml|g|capsules?|tablets?|iu|mcg)/gi,
        /size[=:]\s*(\d+(?:\.\d+)?)\s*(mg|ml|g|capsules?|tablets?|iu|mcg)/gi,
        /(\d+(?:\.\d+)?)\s*-?\s*(mg|ml|g|capsules?|tablets?|iu|mcg)/gi, // More flexible spacing
      ];

      let prices: number[] = [];
      let amounts: { amount: number; unit: string }[] = [];

      // Extract prices
      for (const pattern of pricePatterns) {
        const matches = [...content.matchAll(pattern)];
        for (const match of matches) {
          const price = parseFloat(match[1]);
          if (!isNaN(price) && price > 0 && price < 10000) { // Reasonable price range
            prices.push(price);
          }
        }
      }

      // Extract amounts and units
      for (const pattern of amountPatterns) {
        const matches = [...content.matchAll(pattern)];
        for (const match of matches) {
          const amount = parseFloat(match[1]);
          const unit = match[2] || match[3]; // Handle different capture groups
          if (!isNaN(amount) && amount > 0 && unit) {
            amounts.push({ amount, unit: unit.toLowerCase().replace(/s$/, '') }); // Remove plural 's'
          }
        }
      }

      console.log('Extracted prices:', prices);
      console.log('Extracted amounts:', amounts);

      // If we found size in URL but no amounts in content, use URL data
      if (prices.length > 0 && amounts.length === 0 && urlMatch) {
        const price = prices[0];
        const amount = parseFloat(urlMatch[1]);
        const unit = urlMatch[2].toLowerCase();

        const result = {
          price,
          amount,
          unit,
          confidence: 0.7, // Higher confidence when URL provides size
          rawText: content.substring(0, 500),
        };

        console.log('Fallback extraction successful (using URL size):', result);
        return result;
      }

      if (prices.length > 0 && amounts.length > 0) {
        // Use the first reasonable price and amount
        const price = prices[0];
        const { amount, unit } = amounts[0];

        const result = {
          price,
          amount,
          unit,
          confidence: 0.6, // Lower confidence for fallback method
          rawText: content.substring(0, 500),
        };

        console.log('Fallback extraction successful:', result);
        return result;
      }

      console.log('No price/amount patterns found in content');
      return null;
    } catch (error) {
      console.error('Fallback price extraction failed:', error);
      return null;
    }
  }

  async scrapeMultipleVendors(vendorProducts: IVendorProduct[]): Promise<ScrapingReport> {
    const report: ScrapingReport = {
      totalVendors: vendorProducts.length,
      successfulScrapes: 0,
      failedScrapes: 0,
      results: [],
      startTime: new Date(),
      endTime: new Date(),
    };

    try {
      await this.initialize();

      // Process vendors with rate limiting (avoid overwhelming servers)
      for (const vendor of vendorProducts) {
        const result = await this.scrapeVendorProduct(vendor);
        report.results.push(result);

        if (result.success) {
          report.successfulScrapes++;
        } else {
          report.failedScrapes++;
        }

        // Rate limiting: wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error('Error in batch scraping:', error);
    } finally {
      await this.close();
      report.endTime = new Date();
    }

    return report;
  }
}
