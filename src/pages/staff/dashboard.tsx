import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'
import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import InventoryTable from '@/components/staff/InventoryTable'
import FittingRequestsTable, { FittingRequestRow } from '@/components/staff/FittingRequestsTable'
import OrderCheckout from '@/components/staff/OrderCheckout'
import { Inventory } from '../../generated/prisma'

interface Props {
  role: 'employee' | 'store_manager'
  storeId: string
  initialInventory: (Omit<Inventory, 'store_id' | 'user_id'> & {
    product_name: string
    color: string
    size: string
    last_updated: string
  })[]
  initialRequests: FittingRequestRow[]
}

export default function StaffDashboard({
  role,
  initialInventory,
  initialRequests,
  storeId,
}: Props) {
  const isManager = role === 'store_manager'
  const [tab, setTab] = useState<'inventory' | 'requests' | 'checkout'>(
    isManager ? 'inventory' : 'requests'
  )

  return (
    <>
      <Head>
        <title>Staff Dashboard | LUXE</title>
      </Head>
      <Navbar />

      <main className="min-h-screen bg-stone-50 pt-24 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-light text-stone-900">Staff Dashboard</h1>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
            >
              Log out
            </button>
          </div>

          <div className="flex space-x-4 mb-6">
            {isManager && (
              <button
                className={`px-4 py-2 rounded ${
                  tab === 'inventory' ? 'bg-amber-800 text-white' : ' text-stone-400 bg-stone-200 cursor-pointer'
                }`}
                onClick={() => setTab('inventory')}
              >
                Inventory
              </button>
            )}
            <button
              className={`px-4 py-2 rounded ${
                tab === 'requests' ? 'bg-amber-800 text-white' : ' text-stone-400 bg-stone-200 cursor-pointer'
              }`}
              onClick={() => setTab('requests')}
            >
              Fitting Requests
            </button>
            <button
              className={`px-4 py-2 rounded ${
                tab === 'checkout' ? 'bg-amber-800 text-white' : ' text-stone-400 bg-stone-200 cursor-pointer'
              }`}
              onClick={() => setTab('checkout')}
            >
              Checkout
            </button>
          </div>

          {tab === 'inventory' && isManager && (
            <InventoryTable initialData={initialInventory} />
          )}

          {tab === 'requests' && (
            <FittingRequestsTable initialData={initialRequests} />
          )}

          {tab === 'checkout' && <OrderCheckout storeId={storeId} />}
        </div>
      </main>

      <Footer />
    </>
  )
}

// getServerSideProps remains unchanged from previous example.
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session || !['employee', 'store_manager'].includes(session.user.role)) {
    return { redirect: { destination: '/auth', permanent: false } }
  }

  const user = await prisma.user.findUnique({
    where: { user_id: session.user.id },
    select: { store_id: true },
  })
  if (!user?.store_id) return { notFound: true }

  const inventory = await prisma.inventory.findMany({
    where: { store_id: user.store_id },
    select: {
      inventory_id: true,
      quantity: true,
      status: true,
      last_updated: true,
      variant: {
        select: { product: { select: { name: true } }, color: true, size: true },
      },
    },
  })

  const requests = await prisma.fittingRoomRequest.findMany({
    where: { store_id: user.store_id, status: 'pending' },
    select: {
      request_id: true,
      fitting_cart_id: true,
      variant_id: true,
      fitting_room_id: true,
      status: true,
      created_at: true,
    },
  })

  return {
    props: {
      role: session.user.role,
      storeId: user.store_id,
      initialInventory: inventory.map((r) => ({
        inventory_id: r.inventory_id,
        product_name: r.variant.product.name,
        variant_id: r.inventory_id,
        color: r.variant.color,
        size: r.variant.size,
        quantity: r.quantity,
        status: r.status,
        last_updated: r.last_updated.toISOString(),
      })),
      initialRequests: requests.map((r) => ({
        ...r,
        created_at: r.created_at.toISOString(),
      })),
    },
  }
}
