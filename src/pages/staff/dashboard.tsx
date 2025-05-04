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
import type { Inventory } from '../../generated/prisma'

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
  }: Props) {
    const isManager = role === 'store_manager'
    const [tab, setTab] = useState<'inventory' | 'requests'>(
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
            {/* Header + Logout */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-light text-stone-900">
                Staff Dashboard
              </h1>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Log out
              </button>
            </div>
  
            {/* Tab buttons */}
            <div className="flex space-x-4 mb-6">
              {isManager && (
                <button
                  className={`px-4 py-2 rounded ${
                    tab === 'inventory'
                      ? 'bg-amber-800 text-white'
                      : 'bg-stone-200 cursor-pointer'
                  }`}
                  onClick={() => setTab('inventory')}
                >
                  Inventory
                </button>
              )}
              <button
                className={`px-4 py-2 rounded ${
                  tab === 'requests'
                    ? 'bg-amber-800 text-white'
                    : 'bg-stone-200 cursor-pointer'
                }`}
                onClick={() => setTab('requests')}
              >
                Fitting Requests
              </button>
            </div>
  
            {/* Tab content */}
            {tab === 'inventory' && isManager ? (
              <InventoryTable
                initialData={initialInventory.map((r) => ({
                  inventory_id: r.inventory_id,
                  product_name: r.product_name,
                  variant_id: r.variant_id,
                  color: r.color,
                  size: r.size,
                  quantity: r.quantity,
                  status: r.status,
                  last_updated: r.last_updated,
                }))}
              />
            ) : (
              <FittingRequestsTable initialData={initialRequests} />
            )}
          </div>
        </main>
  
        <Footer />
      </>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)

  if (
    !session ||
    (session.user.role !== 'employee' &&
      session.user.role !== 'store_manager')
  ) {
    return { redirect: { destination: '/auth', permanent: false } }
  }

  // grab the user's store
  const user = await prisma.user.findUnique({
    where: { user_id: session.user.id },
    select: { store_id: true },
  })
  if (!user?.store_id) {
    return { notFound: true }
  }

  // fetch inventory
  const invRows = await prisma.inventory.findMany({
    where: { store_id: user.store_id },
    orderBy: { last_updated: 'desc' },
    select: {
      inventory_id: true,
      variant_id: true,
      quantity: true,
      status: true,
      last_updated: true,
      variant: {
        select: {
          product: { select: { name: true } },
          color: true,
          size: true,
        },
      },
    },
  })
  const initialInventory = invRows.map((r) => ({
    inventory_id: r.inventory_id,
    product_name: r.variant.product.name,
    variant_id: r.variant_id,
    color: r.variant.color,
    size: r.variant.size,
    quantity: r.quantity,
    status: r.status,
    last_updated: r.last_updated.toISOString(),
  }))

  // fetch pending fitting requests
  const reqRows = await prisma.fittingRoomRequest.findMany({
    where: {
      store_id: user.store_id,
      status: 'pending',
    },
    select: {
      request_id: true,
      fitting_cart_id: true,
      variant_id: true,
      fitting_room_id: true,
      status: true,
      created_at: true,
    },
  })
  const initialRequests: FittingRequestRow[] = reqRows.map((r) => ({
    request_id: r.request_id,
    fitting_cart_id: r.fitting_cart_id,
    variant_id: r.variant_id,
    fitting_room_id: r.fitting_room_id,
    status: r.status,
    created_at: r.created_at.toISOString(),
  }))

  return {
    props: {
      role: session.user.role,
      storeId: user.store_id,
      initialInventory,
      initialRequests,
    },
  }
}
