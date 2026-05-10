import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Setup our Prisma 7 standard connection
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Find the house you created in the UI
  const house = await prisma.house.findFirst();

  if (!house) {
    console.error(
      "❌ No house found! Please go to the website and create an account/house first.",
    );
    process.exit(1);
  }

  // Check if we already seeded to prevent duplicates
  const existingItems = await prisma.item.count({
    where: { houseId: house.id },
  });
  if (existingItems > 0) {
    console.log(
      `⚠️ You already have ${existingItems} items in your pantry. Skipping seed.`,
    );
    return;
  }

  console.log(`🏠 Found house: ${house.name}. Stocking the pantry...`);

  // 2. Our realistic test data
  const initialItems = [
    // Produce
    { name: "Garlic", category: "Produce", unit: "cloves" },
    { name: "Onion", category: "Produce", unit: "pcs" },
    { name: "Tomatoes", category: "Produce", unit: "pcs" },
    { name: "Spinach", category: "Produce", unit: "g" },
    { name: "Potatoes", category: "Produce", unit: "kg" },
    // Dairy/Fridge
    { name: "Milk", category: "Dairy", unit: "L" },
    { name: "Eggs", category: "Dairy", unit: "pcs" },
    { name: "Butter", category: "Dairy", unit: "g" },
    { name: "Cheddar Cheese", category: "Dairy", unit: "g" },
    // Proteins
    { name: "Chicken Breast", category: "Meat", unit: "kg" },
    { name: "Ground Beef", category: "Meat", unit: "kg" },
    // Pantry Staples
    { name: "Olive Oil", category: "Pantry", unit: "mL" },
    { name: "Pasta", category: "Pantry", unit: "g" },
    { name: "White Rice", category: "Pantry", unit: "kg" },
    { name: "Flour", category: "Pantry", unit: "kg" },
    { name: "Sugar", category: "Pantry", unit: "kg" },
    { name: "Salt", category: "Spices", unit: "g" },
    { name: "Black Pepper", category: "Spices", unit: "g" },
    // Household
    { name: "Dish Soap", category: "Household", unit: "bottle" },
    { name: "Paper Towels", category: "Household", unit: "rolls" },
  ];

  // 3. Inject them into the database
  let count = 0;
  for (const item of initialItems) {
    await prisma.item.create({
      data: { ...item, houseId: house.id },
    });
    count++;
  }

  console.log(`✅ Successfully added ${count} items to the pantry!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
