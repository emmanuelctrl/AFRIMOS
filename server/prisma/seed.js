import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@afrimos.et' },
    update: {},
    create: {
      email: 'admin@afrimos.et',
      password,
      fullName: 'AFRIMOS Admin',
      role: 'admin',
      emailVerified: true,
      verificationStatus: 'verified',
    },
  });

  const suppliersData = [
    {
      email: 'yirga@example.et',
      fullName: 'Abebe Bekele',
      companyName: 'Yirgacheffe Coffee Exporters PLC',
      city: 'Addis Ababa',
      description:
        'Family-owned coffee exporter since 1994, specializing in washed Yirgacheffe and Sidamo specialty lots. Direct relationships with 12 washing stations.',
      certifications: ['Organic', 'Fair Trade'],
      shippingTerms: 'FOB',
      phone: '+251 911 123 456',
      website: 'https://yirga-coffee.example.com',
      products: [
        { category: 'Coffee', name: 'Ethiopian Yirgacheffe Grade 1', pricePerUnit: 8.5, unit: 'kg', minimumOrderQuantity: 500, quality: 'Specialty', origin: 'Yirgacheffe', certifications: ['Organic'] },
        { category: 'Coffee', name: 'Sidamo Grade 2 Washed', pricePerUnit: 6.2, unit: 'kg', minimumOrderQuantity: 1000, quality: 'Premium', origin: 'Sidamo' },
      ],
    },
    {
      email: 'humera@example.et',
      fullName: 'Selam Tesfaye',
      companyName: 'Humera Sesame Trading',
      city: 'Gondar',
      description:
        'Leading exporter of premium Humera-type sesame seeds with in-house cleaning and sorting facilities. Annual capacity 5,000 MT.',
      certifications: ['ISO'],
      shippingTerms: 'CIF',
      phone: '+251 911 654 321',
      products: [
        { category: 'Sesame', name: 'Humera Whitish Sesame Seeds', pricePerUnit: 1850, unit: 'MT', minimumOrderQuantity: 19, quality: 'Premium', origin: 'Humera' },
        { category: 'Oilseeds', name: 'Niger Seed (Noug)', pricePerUnit: 1400, unit: 'MT', minimumOrderQuantity: 20, quality: 'Standard', origin: 'Wollega' },
      ],
    },
    {
      email: 'pulses@example.et',
      fullName: 'Daniel Girma',
      companyName: 'Rift Valley Pulses & Spices',
      city: 'Adama',
      description:
        'Exporter of red kidney beans, chickpeas, green mung beans and Ethiopian spices. HACCP-certified processing plant near Adama.',
      certifications: ['ISO', 'Organic'],
      shippingTerms: 'FOB',
      phone: '+251 922 333 444',
      products: [
        { category: 'Pulses', name: 'Desi Chickpeas', pricePerUnit: 950, unit: 'MT', minimumOrderQuantity: 25, quality: 'Standard', origin: 'Shewa' },
        { category: 'Spices', name: 'Korarima (Ethiopian Cardamom)', pricePerUnit: 12, unit: 'kg', minimumOrderQuantity: 100, quality: 'Premium', origin: 'Kaffa' },
        { category: 'Pulses', name: 'Green Mung Beans', pricePerUnit: 1100, unit: 'MT', minimumOrderQuantity: 20, quality: 'Premium', origin: 'Amhara' },
      ],
    },
  ];

  for (const s of suppliersData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password,
        fullName: s.fullName,
        role: 'supplier',
        userType: 'company',
        emailVerified: true,
        verificationStatus: 'verified',
        supplierProfile: {
          create: {
            companyName: s.companyName,
            city: s.city,
            country: 'Ethiopia',
            description: s.description,
            certifications: s.certifications,
            shippingTerms: s.shippingTerms,
            phone: s.phone,
            website: s.website,
            products: { create: s.products },
          },
        },
      },
    });
    console.log(`Seeded supplier: ${user.email}`);
  }

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      password,
      fullName: 'Hans Mueller',
      role: 'buyer',
      userType: 'company',
      emailVerified: true,
      verificationStatus: 'verified',
    },
  });

  console.log('Seed complete.');
  console.log('Login accounts (password for all: Password123!):');
  console.log(`  admin:    ${admin.email}`);
  console.log(`  buyer:    ${buyer.email}`);
  console.log('  supplier: yirga@example.et / humera@example.et / pulses@example.et');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
