// Utility functions for admin components

export function objectIdToString(id: any): string {
  return typeof id === 'string' ? id : id.toString();
}

export function convertProductForAdmin(product: any) {
  return {
    ...product,
    _id: objectIdToString(product._id),
  };
}

export function convertVendorForAdmin(vendor: any) {
  return {
    ...vendor,
    _id: objectIdToString(vendor._id),
    productId: typeof vendor.productId === 'object' 
      ? objectIdToString(vendor.productId._id || vendor.productId)
      : objectIdToString(vendor.productId),
  };
}
