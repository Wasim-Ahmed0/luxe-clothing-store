import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { signIn, useSession } from "next-auth/react";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import InventoryTable, {
  InventoryRow,
} from "@/components/staff/InventoryTable";

interface Props {
  initialData: InventoryRow[];
}

export default function StaffDashboard({ initialData }: Props) {
  // force login + roles
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => signIn(),
  });

  // render
  return (
    <>
      <Head>
        <title>Staff Dashboard | LUXE</title>
      </Head>
      <Navbar />
      <main className="min-h-screen bg-stone-50 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-light text-stone-900 mb-6">Inventory Management</h1>
          <InventoryTable initialData={initialData} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  // auth + role check
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (
    !session ||
    (session.user.role !== "employee" &&
      session.user.role !== "store_manager")
  ) {
    return {
      redirect: { destination: "/auth", permanent: false },
    };
  }

  // look up this staff's store_id
  const user = await prisma.user.findUnique({
    where: { user_id: session.user.id },
    select: { store_id: true },
  });
  if (!user?.store_id) {
    return { notFound: true };
  }

  // fetch inventory + join variant→product.name + colour/size
  const rows = await prisma.inventory.findMany({
    where: { store_id: user.store_id },
    orderBy: { last_updated: "desc" },
    select: {
      inventory_id: true,
      quantity: true,
      status: true,
      last_updated: true,
      variant: {
        select: {
          variant_id: true,
          color: true,
          size: true,
          product: { select: { name: true } },
        },
      },
    },
  });

  // serialize + flatten
  const initialData: InventoryRow[] = rows.map((r) => ({
    inventory_id: r.inventory_id,
    quantity: r.quantity,
    status: r.status,
    last_updated: r.last_updated.toISOString(),
    // flattened fields:
    product_name: r.variant.product.name,
    variant_id: r.variant.variant_id,
    color: r.variant.color,
    size: r.variant.size,
  }));

  return { props: { initialData } };
};
