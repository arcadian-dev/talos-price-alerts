import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface PriceAlertData {
  productName: string;
  productSlug: string;
  vendorName: string;
  oldPrice: number;
  newPrice: number;
  amount: number;
  unit: string;
  pricePerUnit: number;
  savings: number;
  url: string;
}

export interface WeeklyDigestData {
  products: Array<{
    name: string;
    slug: string;
    bestPrice: number;
    worstPrice: number;
    avgPrice: number;
    unit: string;
    vendorCount: number;
    priceChange: number;
  }>;
  totalSavings: number;
  newProducts: number;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private useSendGrid: boolean;

  constructor() {
    this.useSendGrid = !!process.env.SENDGRID_API_KEY;
    
    if (this.useSendGrid) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
      console.log('Email service initialized with SendGrid');
    } else if (process.env.SMTP_HOST) {
      this.initializeSMTP();
      console.log('Email service initialized with SMTP');
    } else {
      console.warn('No email service configured. Set SENDGRID_API_KEY or SMTP credentials.');
    }
  }

  private initializeSMTP() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      if (this.useSendGrid) {
        await sgMail.send({
          to,
          from: process.env.FROM_EMAIL || 'alerts@talos.com',
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      } else if (this.transporter) {
        await this.transporter.sendMail({
          from: process.env.FROM_EMAIL || 'alerts@talos.com',
          to,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      } else {
        console.log('Email would be sent:', { to, subject: template.subject });
        return false;
      }

      console.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  generatePriceAlertTemplate(data: PriceAlertData): EmailTemplate {
    const savingsPercent = ((data.oldPrice - data.newPrice) / data.oldPrice * 100).toFixed(1);
    
    const subject = `🔥 Price Drop Alert: ${data.productName} - Save $${data.savings.toFixed(2)}!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Price Drop Alert</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #a86332 0%, #0d9488 100%); padding: 30px; text-align: center; }
          .header h1 { margin: 0; color: white; font-size: 24px; }
          .content { padding: 30px; }
          .alert-box { background: #2a2a2a; border: 1px solid #404040; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .price-comparison { display: flex; justify-content: space-between; align-items: center; margin: 20px 0; }
          .old-price { text-decoration: line-through; color: #737373; font-size: 18px; }
          .new-price { color: #0d9488; font-size: 24px; font-weight: bold; }
          .savings { background: #0d9488; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
          .cta { text-align: center; margin: 30px 0; }
          .button { background: #a86332; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
          .footer { background: #2a2a2a; padding: 20px; text-align: center; color: #737373; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔥 Price Drop Alert!</h1>
          </div>
          <div class="content">
            <h2>Great news! The price for ${data.productName} has dropped!</h2>
            
            <div class="alert-box">
              <h3>${data.productName}</h3>
              <p><strong>Vendor:</strong> ${data.vendorName}</p>
              <p><strong>Amount:</strong> ${data.amount}${data.unit}</p>
              
              <div class="price-comparison">
                <div>
                  <div class="old-price">Was: $${data.oldPrice.toFixed(2)}</div>
                  <div class="new-price">Now: $${data.newPrice.toFixed(2)}</div>
                  <div style="color: #737373; font-size: 14px;">
                    $${data.pricePerUnit.toFixed(4)}/${data.unit}
                  </div>
                </div>
                <div class="savings">
                  Save ${savingsPercent}%<br>
                  ($${data.savings.toFixed(2)})
                </div>
              </div>
            </div>

            <div class="cta">
              <a href="${data.url}" class="button" target="_blank">
                View Deal →
              </a>
            </div>

            <p style="color: #737373; font-size: 14px;">
              This alert was sent because you subscribed to price notifications for ${data.productName}. 
              You can manage your subscriptions in your account settings.
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Talos Price Alerts. All rights reserved.</p>
            <p>Helping you save on peptides and longevity products.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      🔥 PRICE DROP ALERT!
      
      ${data.productName} price has dropped!
      
      Vendor: ${data.vendorName}
      Amount: ${data.amount}${data.unit}
      
      Was: $${data.oldPrice.toFixed(2)}
      Now: $${data.newPrice.toFixed(2)} ($${data.pricePerUnit.toFixed(4)}/${data.unit})
      
      You save: $${data.savings.toFixed(2)} (${savingsPercent}%)
      
      View deal: ${data.url}
      
      This alert was sent because you subscribed to price notifications for ${data.productName}.
    `;

    return { subject, html, text };
  }

  generateWeeklyDigestTemplate(email: string, data: WeeklyDigestData): EmailTemplate {
    const subject = `📊 Weekly Price Digest - ${data.products.length} Products Tracked`;
    
    const productRows = data.products.map(product => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #404040;">
          <strong>${product.name}</strong><br>
          <span style="color: #737373; font-size: 12px;">${product.vendorCount} vendors</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #404040; text-align: center;">
          $${product.bestPrice.toFixed(4)}/${product.unit}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #404040; text-align: center;">
          $${product.avgPrice.toFixed(4)}/${product.unit}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #404040; text-align: center; color: ${product.priceChange > 0 ? '#ef4444' : product.priceChange < 0 ? '#0d9488' : '#737373'};">
          ${product.priceChange > 0 ? '+' : ''}${product.priceChange.toFixed(1)}%
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Price Digest</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #0a0a0a; color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #a86332 0%, #0d9488 100%); padding: 30px; text-align: center; }
          .header h1 { margin: 0; color: white; font-size: 24px; }
          .content { padding: 30px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; color: #0d9488; }
          .stat-label { font-size: 12px; color: #737373; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #2a2a2a; padding: 12px; text-align: left; color: #a86332; font-weight: bold; }
          .footer { background: #2a2a2a; padding: 20px; text-align: center; color: #737373; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Price Digest</h1>
          </div>
          <div class="content">
            <h2>Your Price Tracking Summary</h2>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-number">${data.products.length}</div>
                <div class="stat-label">Products Tracked</div>
              </div>
              <div class="stat">
                <div class="stat-number">$${data.totalSavings.toFixed(2)}</div>
                <div class="stat-label">Potential Savings</div>
              </div>
              <div class="stat">
                <div class="stat-number">${data.newProducts}</div>
                <div class="stat-label">New Products</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Best Price</th>
                  <th style="text-align: center;">Avg Price</th>
                  <th style="text-align: center;">7d Change</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
            </table>

            <p style="color: #737373; font-size: 14px;">
              This weekly digest shows your tracked products and their price movements. 
              Set up individual price alerts to get notified of drops immediately.
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Talos Price Alerts. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      📊 WEEKLY PRICE DIGEST
      
      Your Price Tracking Summary:
      - ${data.products.length} products tracked
      - $${data.totalSavings.toFixed(2)} potential savings
      - ${data.newProducts} new products added
      
      Product Summary:
      ${data.products.map(p => 
        `${p.name}: $${p.bestPrice.toFixed(4)}/${p.unit} (${p.priceChange > 0 ? '+' : ''}${p.priceChange.toFixed(1)}%)`
      ).join('\n')}
      
      This weekly digest shows your tracked products and their price movements.
    `;

    return { subject, html, text };
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.useSendGrid) {
        // SendGrid doesn't have a simple test method, so we'll assume it works if API key is set
        return true;
      } else if (this.transporter) {
        await this.transporter.verify();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Email service test failed:', error);
      return false;
    }
  }
}
