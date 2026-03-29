const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete existing user
    await prisma.user.deleteMany({
      where: { username: 'test' }
    });
    console.log('✅ Deleted old user');
    
    // Create new user with password "test"
    const hashedPassword = await bcrypt.hash('test', 10);
    
    const user = await prisma.user.create({
      data: {
        username: 'test',
        passwordHash: hashedPassword,
        bio: 'Test user account',
        avatarUrl: null,
      }
    });
    
    console.log('✅ New user created! Username: test, Password: test');
  } catch (error) {
    console.error('❌ Error creating test user:');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
