import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';
import {v4} from 'uuid';
async function main() {
  await prisma.usuario.create({
    data: {
      email: 'alice@prisma.io',
      nome: 'Alice',
      senha: bcrypt.hashSync('password', 8),
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'bob@prisma.io',
      nome: 'Bob',
      senha: bcrypt.hashSync('password', 8),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
