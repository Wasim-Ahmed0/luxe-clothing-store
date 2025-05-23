import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import productImages from "@/lib/product-images";

interface Product {
  product_id: string
  name: string
  description: string
  price: number
  category: string
}

export default function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/product/${product.product_id}`}
      className="group block"
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer"
      >
        <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-stone-100">
          <Image
            src={productImages[product.name]}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-700 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div>
          <h3 className="text-lg font-light text-stone-900">{product.name}</h3>
          <p className="text-sm text-stone-500 mb-1">{product.category}</p>
          <p className="text-amber-800">£{product.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  )
}
