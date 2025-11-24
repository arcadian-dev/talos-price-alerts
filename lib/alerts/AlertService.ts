import dbConnect from '@/lib/mongodb';
import { UserSubscription, Product, VendorProduct, PriceData } from '@/models';
import { EmailService, PriceAlertData } from '@/lib/email/EmailService';
import { subDays, startOfDay } from 'date-fns';

export interface AlertCheck {
  subscriptionId: string;
  email: string;
  productName: string;
  alertType: string;
  triggered: boolean;
  reason?: string;
}

export interface AlertReport {
  totalChecks: number;
  alertsSent: number;
  errors: number;
  checks: AlertCheck[];
  startTime: Date;
  endTime: Date;
}

export class AlertService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async checkAllAlerts(): Promise<AlertReport> {
    const report: AlertReport = {
      totalChecks: 0,
      alertsSent: 0,
      errors: 0,
      checks: [],
      startTime: new Date(),
      endTime: new Date(),
    };

    try {
      await dbConnect();

      // Get all active, verified subscriptions
      const subscriptions = await UserSubscription.find({
        isActive: true,
        isVerified: true,
      }).populate('productId', 'name slug unit').lean();

      report.totalChecks = subscriptions.length;

      for (const subscription of subscriptions) {
        try {
          const alertCheck = await this.checkSubscriptionAlerts(subscription);
          report.checks.push(alertCheck);

          if (alertCheck.triggered) {
            report.alertsSent++;
          }
        } catch (error) {
          console.error(`Error checking alerts for subscription ${subscription._id}:`, error);
          report.errors++;
          report.checks.push({
            subscriptionId: (subscription as any)._id.toString(),
            email: subscription.email,
            productName: subscription.productId?.name || 'Unknown',
            alertType: subscription.alertType,
            triggered: false,
            reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      }

    } catch (error) {
      console.error('Error in checkAllAlerts:', error);
    } finally {
      report.endTime = new Date();
    }

    return report;
  }

  private async checkSubscriptionAlerts(subscription: any): Promise<AlertCheck> {
    const alertCheck: AlertCheck = {
      subscriptionId: subscription._id.toString(),
      email: subscription.email,
      productName: subscription.productId?.name || 'Unknown',
      alertType: subscription.alertType,
      triggered: false,
    };

    // Skip if we sent an alert recently (within 24 hours)
    if (subscription.lastAlertSent) {
      const lastAlertTime = new Date(subscription.lastAlertSent);
      const hoursSinceLastAlert = (Date.now() - lastAlertTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastAlert < 24) {
        alertCheck.reason = `Alert sent ${Math.round(hoursSinceLastAlert)}h ago, skipping`;
        return alertCheck;
      }
    }

    // Get vendor products for this product
    const vendorProducts = await VendorProduct.find({
      productId: subscription.productId._id,
      isActive: true,
    }).lean();

    if (vendorProducts.length === 0) {
      alertCheck.reason = 'No active vendors for product';
      return alertCheck;
    }

    // Check for price drops based on alert type
    switch (subscription.alertType) {
      case 'price_drop':
      case 'all':
        const priceDropAlert = await this.checkPriceDropAlert(subscription, vendorProducts);
        if (priceDropAlert) {
          alertCheck.triggered = true;
          alertCheck.reason = 'Price drop detected';
          return alertCheck;
        }
        break;

      case 'new_vendor':
      case 'all':
        const newVendorAlert = await this.checkNewVendorAlert(subscription, vendorProducts);
        if (newVendorAlert) {
          alertCheck.triggered = true;
          alertCheck.reason = 'New vendor detected';
          return alertCheck;
        }
        break;
    }

    alertCheck.reason = 'No alerts triggered';
    return alertCheck;
  }

  private async checkPriceDropAlert(subscription: any, vendorProducts: any[]): Promise<boolean> {
    try {
      // Get recent price data (last 7 days)
      const sevenDaysAgo = subDays(new Date(), 7);
      const oneDayAgo = subDays(new Date(), 1);

      for (const vendorProduct of vendorProducts) {
        // Get latest price
        const latestPrice = await PriceData.findOne({
          vendorProductId: vendorProduct._id,
          scrapedAt: { $gte: oneDayAgo },
        }).sort({ scrapedAt: -1 }).lean();

        if (!latestPrice) continue;

        // Get previous price for comparison
        const previousPrice = await PriceData.findOne({
          vendorProductId: vendorProduct._id,
          scrapedAt: { 
            $gte: sevenDaysAgo,
            $lt: oneDayAgo,
          },
        }).sort({ scrapedAt: -1 }).lean();

        if (!previousPrice) continue;

        // Check for price drop
        const priceDrop = (previousPrice as any).pricePerUnit - (latestPrice as any).pricePerUnit;
        const percentDrop = (priceDrop / (previousPrice as any).pricePerUnit) * 100;

        // Trigger alert if:
        // 1. Price dropped by more than 5% OR
        // 2. Price dropped below user's threshold (if set)
        const significantDrop = percentDrop > 5;
        const belowThreshold = subscription.alertThreshold && 
          (latestPrice as any).pricePerUnit <= subscription.alertThreshold;

        if (significantDrop || belowThreshold) {
          // Send price drop alert
          const alertData: PriceAlertData = {
            productName: subscription.productId.name,
            productSlug: subscription.productId.slug,
            vendorName: vendorProduct.vendorName,
            oldPrice: (previousPrice as any).pricePerUnit,
            newPrice: (latestPrice as any).pricePerUnit,
            amount: (latestPrice as any).amount,
            unit: (latestPrice as any).unit,
            pricePerUnit: (latestPrice as any).pricePerUnit,
            savings: priceDrop,
            url: vendorProduct.url,
          };

          const template = this.emailService.generatePriceAlertTemplate(alertData);
          const emailSent = await this.emailService.sendEmail(subscription.email, template);

          if (emailSent) {
            // Update subscription with last alert time
            await UserSubscription.findByIdAndUpdate(subscription._id, {
              lastAlertSent: new Date(),
            });

            console.log(`Price drop alert sent to ${subscription.email} for ${subscription.productId.name}`);
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking price drop alert:', error);
      return false;
    }
  }

  private async checkNewVendorAlert(subscription: any, vendorProducts: any[]): Promise<boolean> {
    try {
      // Check if any vendors were added in the last 24 hours
      const oneDayAgo = subDays(new Date(), 1);

      const newVendors = vendorProducts.filter(vp => 
        new Date(vp.createdAt) > oneDayAgo
      );

      if (newVendors.length > 0) {
        // For simplicity, we'll send a basic notification
        // In a full implementation, you'd create a specific template for new vendor alerts
        console.log(`New vendor alert would be sent to ${subscription.email} for ${subscription.productId.name}`);
        
        // Update subscription with last alert time
        await UserSubscription.findByIdAndUpdate(subscription._id, {
          lastAlertSent: new Date(),
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking new vendor alert:', error);
      return false;
    }
  }

  async sendWeeklyDigests(): Promise<number> {
    try {
      await dbConnect();

      // Get users who want weekly digests
      const digestSubscriptions = await UserSubscription.find({
        isActive: true,
        isVerified: true,
        alertType: { $in: ['weekly_digest', 'all'] },
      }).lean();

      // Group by email
      const userEmails = [...new Set(digestSubscriptions.map(s => s.email))];
      let digestsSent = 0;

      for (const email of userEmails) {
        try {
          const userSubscriptions = digestSubscriptions.filter(s => s.email === email);
          
          // Get product data for user's subscriptions
          const productIds = userSubscriptions.map(s => s.productId);
          const products = await Product.find({ _id: { $in: productIds } }).lean();

          // Generate digest data (simplified version)
          const digestData = {
            products: products.map(p => ({
              name: p.name,
              slug: p.slug,
              bestPrice: 0, // Would calculate from recent price data
              worstPrice: 0,
              avgPrice: 0,
              unit: p.unit,
              vendorCount: 0,
              priceChange: 0,
            })),
            totalSavings: 0,
            newProducts: 0,
          };

          const template = this.emailService.generateWeeklyDigestTemplate(email, digestData);
          const emailSent = await this.emailService.sendEmail(email, template);

          if (emailSent) {
            digestsSent++;
          }
        } catch (error) {
          console.error(`Error sending weekly digest to ${email}:`, error);
        }
      }

      console.log(`Sent ${digestsSent} weekly digests`);
      return digestsSent;
    } catch (error) {
      console.error('Error sending weekly digests:', error);
      return 0;
    }
  }
}
