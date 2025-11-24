// Admin-specific types with string IDs for React components

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVendorProduct {
  _id: string;
  productId: string | AdminProduct;
  vendorName: string;
  url: string;
  scrapingSelector?: string;
  isActive: boolean;
  lastSuccessfulScrapeAt?: string;
  scrapeFailureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPriceData {
  _id: string;
  vendorProductId: string;
  price: number;
  amount: number;
  unit: string;
  pricePerUnit: number;
  confidence: number;
  isAvailable: boolean;
  scrapedAt: string;
  sourceUrl: string;
  createdAt: string;
}

// Helper function to convert MongoDB documents to admin types
export function toAdminProduct(product: any): AdminProduct {
  return {
    ...product,
    _id: product._id.toString(),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function toAdminVendorProduct(vendor: any): AdminVendorProduct {
  return {
    ...vendor,
    _id: vendor._id.toString(),
    productId: typeof vendor.productId === 'object' 
      ? toAdminProduct(vendor.productId)
      : vendor.productId.toString(),
    lastSuccessfulScrapeAt: vendor.lastSuccessfulScrapeAt?.toISOString(),
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
  };
}
