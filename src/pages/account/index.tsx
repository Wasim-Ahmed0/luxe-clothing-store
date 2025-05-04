// pages/account.tsx
import { useState } from "react"
import Head from "next/head"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import AccountLayout from "@/components/account/AccountLayout"

export default function AccountPage() {
  const tabs = ["Orders", "Profile", "Wishlist"] as const
  const [active, setActive] = useState<typeof tabs[number]>('Orders')

  return (
    <>
      <Head>
        <title>My Account | LUXE</title>
      </Head>
      <Navbar />
      <main className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-light text-stone-900 mb-6">My Account</h1>
          <AccountLayout activeTab={active} onTabChange={setActive} />
        </div>
      </main>
      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    }
  }
  return { props: {} }
}
