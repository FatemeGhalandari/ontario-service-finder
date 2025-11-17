const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany();
  console.log("Services in DB:", services);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
