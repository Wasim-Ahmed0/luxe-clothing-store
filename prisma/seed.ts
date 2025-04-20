import { prisma, Role } from '../lib/prisma'
import argon2 from 'argon2';

async function main() {
  // 1. Create Stores
  const storeLondon = await prisma.store.create({
    data: {
      store_name: 'Luxe London',
      location: '123 Savile Row, London',
      area_code: ['A1', 'B2', 'C3'],
    },
  });

  const storeManchester = await prisma.store.create({
    data: {
      store_name: 'Luxe Manchester',
      location: '1 King Street, Manchester',
      area_code: ['D1', 'E2', 'F3'],
    },
  });

  const storeEdinburgh = await prisma.store.create({
    data: {
      store_name: 'Luxe Edinburgh',
      location: '45 George Street, Edinburgh',
      area_code: ['G1', 'H2', 'I3'],
    },
  });

  // 2. Hash a default password for all test users
  const defaultPlain = 'password';
  const hashedDefault = await argon2.hash(defaultPlain);

  // 3. Create Users (store managers, employees, customer)
  await prisma.user.createMany({
    data: [
      { username: 'mg1', email: 'mg1@example.com', password_hash: hashedDefault, role: Role.store_manager, store_id: storeLondon.store_id, created_at: new Date(), updated_at: new Date() },
      { username: 'emp1', email: 'emp1@example.com', password_hash: hashedDefault, role: Role.employee, store_id: storeLondon.store_id, created_at: new Date(), updated_at: new Date() },
      { username: 'mg2', email: 'mg2@example.com', password_hash: hashedDefault, role: Role.store_manager, store_id: storeManchester.store_id, created_at: new Date(), updated_at: new Date() },
      { username: 'emp2', email: 'emp2@example.com', password_hash: hashedDefault, role: Role.employee, store_id: storeManchester.store_id, created_at: new Date(), updated_at: new Date() },
      { username: 'mg3', email: 'mg3@example.com', password_hash: hashedDefault, role: Role.store_manager, store_id: storeEdinburgh.store_id, created_at: new Date(), updated_at: new Date() },
      { username: 'emp3', email: 'emp3@example.com', password_hash: hashedDefault, role: Role.employee, store_id: storeEdinburgh.store_id, created_at: new Date(), updated_at: new Date() },
      { username: 'john_doe', email: 'john.doe@example.com', password_hash: hashedDefault, role: Role.customer },
    ],
  });

  // 4. Create Products & Variants
  const productsData = [
    { name: 'Savile Row Signature Suit', category: 'Suits', price: 799.99, description: 'Two-piece wool suit with peak lapels.' },
    { name: 'Edinburgh Tweed Blazer', category: 'Outerwear', price: 349.99, description: 'Heritage tweed blazer.' },
    { name: 'Regent Street Overcoat', category: 'Outerwear', price: 449.99, description: 'Wool-cashmere blend overcoat.' },
    { name: 'Mayfair Cashmere Sweater', category: 'Knitwear', price: 279.99, description: '100% cashmere crewneck.' },
    { name: 'Classic Oxford Shirt', category: 'Shirts', price: 119.99, description: 'Button-down Oxford cotton shirt.' },
    { name: 'Royal Chauffeur Trousers', category: 'Trousers', price: 159.99, description: 'Tailored wool dress trousers.' },
    { name: 'Knightsbridge Chinos', category: 'Casual Wear', price: 99.99, description: 'Slim-fit cotton chinos.' },
    { name: 'Westminster Denim Jeans', category: 'Casual Wear', price: 89.99, description: 'Dark rinse stretch denim.' },
    { name: 'Piccadilly Polo Shirt', category: 'Casual Wear', price: 79.99, description: 'Pique cotton polo with embroidered logo.' },
    { name: 'Chelsea Leather Boots', category: 'Footwear', price: 249.99, description: 'Black leather Chelsea boots.' },
    { name: 'Mayfair Oxford Brogues', category: 'Footwear', price: 229.99, description: 'Hand-finished brogue detailing.' },
    { name: 'Soho Suede Loafers', category: 'Footwear', price: 219.99, description: 'Slip-on suede loafers.' },
    { name: 'Savile Slide Sandals', category: 'Footwear', price: 99.99, description: 'Luxury leather slide sandals.' },
    { name: 'Bifold Heritage Wallet', category: 'Accessories', price: 69.99, description: 'Full-grain leather wallet.' },
    { name: 'Savile Leather Belt', category: 'Accessories', price: 79.99, description: 'Italian leather belt with brass buckle.' },
    { name: 'Sterling Silver Cufflinks', category: 'Accessories', price: 89.99, description: 'Handcrafted cufflinks.' },
    { name: 'Mayfair Chronograph Watch', category: 'Accessories', price: 549.99, description: 'Automatic chronograph wristwatch.' },
    { name: 'Leather Duffel Traveller', category: 'Accessories', price: 349.99, description: 'Full-grain leather duffel bag.' },
    { name: 'Oxford Leather Backpack', category: 'Accessories', price: 299.99, description: 'Structured leather backpack.' },
    { name: 'Regent Laptop Folio', category: 'Accessories', price: 179.99, description: 'Leather laptop folio case.' },
    { name: 'Regent Phone Cover', category: 'Accessories', price: 39.99, description: 'Slim leather phone case.' },
  ];

  const sizes = ['S', 'M', 'L', 'XL'];
  const colors = ['Black', 'Navy', 'Grey', 'Brown'];
  const variants: { id: string; productId: string }[] = [];

  for (const p of productsData) {
    const product = await prisma.product.create({ data: p });
    if (p.category === 'Accessories') {
      const variant = await prisma.productVariant.create({ data: { product_id: product.product_id, size: '', color: 'Default' } });
      variants.push({ id: variant.variant_id, productId: product.product_id });
    } else {
      for (const size of sizes) {
        for (const color of colors) {
          const variant = await prisma.productVariant.create({ data: { product_id: product.product_id, size, color } });
          variants.push({ id: variant.variant_id, productId: product.product_id });
        }
      }
    }
  }

  // 5. Seed Inventory for each variant in all stores
  for (const variant of variants) {
    for (const store of [storeLondon, storeManchester, storeEdinburgh]) {
      const qty = Math.floor(Math.random() * 20) + 1;
      await prisma.inventory.create({
        data: {
          store_id: store.store_id,
          product_id: variant.productId,
          variant_id: variant.id,
          quantity: qty,
          status: qty > 0 ? 'available' : 'unavailable',
          last_updated: new Date(),
        },
      });
    }
  }

  console.log('✅ Seed complete');
}

main().catch((e) => console.error(e)).finally(() => prisma.$disconnect());