// utils/formatter.ts

/**
 * Format a number as GBP currency.
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
}
  
  /**
   * Turn an ISO date (or JS Date) into a human‐readable string.
   * e.g. "15 May 2025"
   */
export function formatDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleDateString('en-GB', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

export interface ProductDetails {
  variant_id: string;
  name: string;
  image: string;
  size: string;
  color: string;
}

type VariantLookupResp = {
  success: true;
  variant: {
    variant_id: string;
    size: string;
    color: string;
    product: {
      product_id: string;
      name: string;
      // assume you have an `image_url` field on product or hard‐code a placeholder
      image_url: string;
    };
  };
};
  
/**
 * Fetch the full product‐variant details for a given variant ID.
 * Assumes you have an API endpoint at /api/product-variants/[variantId]
 * that returns:
 *   {
 *     success: true,
 *     variant: {
 *       variant_id: string,
 *       size: string,
 *       color: string,
 *       product: {
 *         name: string,
 *         image_url: string
 *       }
 *     }
 *   }
 */
export async function getProductDetails(
  variantId: string
): Promise<ProductDetails> {
  const res = await fetch(`/api/products?variant_id=${variantId}`);
  const json = (await res.json()) as VariantLookupResp;
  if (!json.success) {
    throw new Error("Failed to load product details");
  }
  const v = json.variant;
  return {
    variant_id: v.variant_id,
    name: v.product.name,
    image: v.product.image_url || "/placeholder.svg",
    size: v.size,
    color: v.color,
  };
}