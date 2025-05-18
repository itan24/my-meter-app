import prisma from "@/lib/db";

async function testDb() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users:", users);
  } catch (error) {
    console.error("Error:", error);
  }
}

testDb();