const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const userModule = await prisma.project.create({
    data: {
      name: "QT User Module"
    }
  });

  const taskModule = await prisma.project.create({
    data: {
      name: "QT Task Module"
    }
  });
  console.log({ taskModule, userModule });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
