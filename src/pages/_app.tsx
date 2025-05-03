import { useEffect } from "react"
import { useRouter } from "next/router"
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/cart-context"
import { WishlistProvider } from "@/context/wishlist-context"
import "@/styles/globals.css";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
	const router = useRouter()

  	useEffect(() => {
    	const { store_id } = router.query
    	if (typeof store_id === "string") {
      		// Persist for ~1 day
      		document.cookie = `store_id=${store_id};path=/;max-age=${60 * 60 * 24}`
    	}
  	}, [router.query.store_id])

	return (
    	<SessionProvider session={session}>
			<CartProvider>
				<WishlistProvider>
      				<Component {...pageProps} />
				</WishlistProvider>
			</CartProvider>
    	</SessionProvider>
  	);
}
