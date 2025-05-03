import { useState } from "react";
import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"

import suitImg from "../../../public/images/Savile Row Suit.png";

interface Product {
  product_id: string
  name: string
  description: string
  price: number
  category: string
}

export default function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <Link
      href={`/product/${product.product_id}`}
      className="group block"      // make the link fill its container
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer"  // make sure pointer shows
      >
        <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-stone-100">
          <Image
            src={ suitImg }
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-700 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <button
            onClick={(e) => {
              e.preventDefault()   // don’t navigate when clicking the heart
              setIsFavorite(!isFavorite)
            }}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white bg-opacity-80 rounded-full transition-opacity duration-300"
          >
            <Heart
              size={18}
              className={
                isFavorite ? "fill-amber-800 text-amber-800" : "text-stone-700"
              }
            />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-light text-stone-900">{product.name}</h3>
          <p className="text-sm text-stone-500 mb-1">{product.category}</p>
          <p className="text-amber-800">${product.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  )
}
