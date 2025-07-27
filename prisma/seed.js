const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: 'admin@station2290.ru' }, { username: 'admin' }],
    },
  });

  if (existingAdmin) {
    console.log('Admin user already exists, skipping seed...');
    return;
  }

  // Hash the admin password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('admin123', saltRounds);

  // Create default admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@station2290.ru',
      username: 'admin',
      password_hash: hashedPassword,
      role: Role.ADMIN,
      is_active: true,
    },
  });

  console.log('Created admin user:', {
    id: adminUser.id,
    email: adminUser.email,
    username: adminUser.username,
    role: adminUser.role,
  });

  // Create sample categories if none exist
  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    console.log('Creating sample categories...');

    await prisma.category.createMany({
      data: [
        {
          name: 'Coffee',
          description: 'Fresh brewed coffee and espresso drinks',
          slug: 'coffee',
          display_order: 1,
        },
        {
          name: 'Desserts',
          description: 'Sweet treats and pastries',
          slug: 'desserts',
          display_order: 2,
        },
        {
          name: 'Beverages',
          description: 'Non-coffee drinks and refreshments',
          slug: 'beverages',
          display_order: 3,
        },
      ],
    });

    console.log('Created sample categories');
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });