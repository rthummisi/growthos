import { InTheWildClient } from "@frontend/components/feed/InTheWildClient";
import { apiGet } from "@frontend/lib/api";

interface ProductOption {
  id: string;
  url: string;
  description: string;
}

export default async function InTheWildPage({
  searchParams
}: {
  searchParams?: Promise<{ productId?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const products = await apiGet<ProductOption[]>("/products").catch(() => []);
  const selectedProductId = resolved.productId ?? products[0]?.id;

  return (
    <InTheWildClient
      productId={selectedProductId}
      products={products}
    />
  );
}
