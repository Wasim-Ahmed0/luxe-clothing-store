// src/context/wishlist-context.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface WishlistItem {
  productId:      string;
  variantId:      string;
  wishlistItemId: string;
  name:           string;
  price:          number;
  size:           string;
  color:          string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (variantId: string) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  toggleItem: (variantId: string) => Promise<void>;
  isInWishlist: (variantId: string) => boolean;
  wishlistCount: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({} as any);
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // helper to fetch the full list from server
  const fetchWishlist = async () => {
    setLoading(true);
    const res = await fetch("/api/wishlist");
    const data = await res.json();
    if (data.success) {
      setItems(
        data.items.map((i: any) => ({
          variantId:      i.variant_id,
          productId:      i.product_id,
          wishlistItemId: i.wishlist_item_id,
          name:           i.product_name,
          price:          i.price,
          size:           i.size,
          color:          i.color,
        }))
      );
    }
    setLoading(false);
  };

  // load on auth
  useEffect(() => {
    if (status === "authenticated") {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [status]);

  const isInWishlist = (variantId: string) =>
    items.some((i) => i.variantId === variantId);

  const addItem = async (variantId: string) => {
    if (status !== "authenticated") return;
    const res = await fetch("/api/wishlist/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: variantId }),
    });
    const data = await res.json();
    if (data.success) {
      // once created, re-fetch the full list (this fills in productId etc)
      await fetchWishlist();
    }
  };

  const removeItem = async (variantId: string) => {
    const res = await fetch(`/api/wishlist/items/${variantId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Could not remove from wishlist");
    }
    // re-fetch full list
    await fetchWishlist();
  };

  const toggleItem = async (variantId: string) => {
    if (isInWishlist(variantId)) {
      await removeItem(variantId);
    } else {
      await addItem(variantId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        wishlistCount: items.length,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
