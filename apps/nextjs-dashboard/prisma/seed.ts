import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const merchant = await prisma.merchant.upsert({
    where: { email: "demo@foxai.io" },
    update: {},
    create: {
      name: "Demo Restaurant",
      email: "demo@foxai.io",
      slug: "demo-restaurant",
      timezone: "Europe/Kyiv",
    },
  });

  await prisma.botSettings.upsert({
    where: { merchantId: merchant.id },
    update: {},
    create: {
      merchantId: merchant.id,
      systemPrompt: "You are a helpful sales assistant for Demo Restaurant. Help customers with menu questions and orders.",
      tone: "friendly",
      language: "en",
      welcomeMessage: "Hello! Welcome to Demo Restaurant. How can I help you today?",
    },
  });

  const category = await prisma.productCategory.upsert({
    where: { merchantId_name: { merchantId: merchant.id, name: "Pizza" } },
    update: {},
    create: { merchantId: merchant.id, name: "Pizza", sortOrder: 1 },
  });

  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      { merchantId: merchant.id, categoryId: category.id, name: "Margherita", description: "Classic tomato & mozzarella", price: 9.99, stock: 100 },
      { merchantId: merchant.id, categoryId: category.id, name: "Pepperoni", description: "Pepperoni with extra cheese", price: 11.99, stock: 100 },
      { merchantId: merchant.id, categoryId: category.id, name: "BBQ Chicken", description: "Smoked chicken, BBQ sauce", price: 12.99, stock: 100 },
    ],
  });

  console.log("Seeded:", { merchantId: merchant.id });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
