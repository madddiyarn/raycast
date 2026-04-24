import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const publishedCount = await prisma.job.count({ where: { status: "published" } });
  const allCount = await prisma.job.count();
  console.log(`DB Verification: Total=${allCount}, Published=${publishedCount}`);
}

main().finally(() => prisma.$disconnect());
