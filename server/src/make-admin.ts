
import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'sottodennis@gmail.com';

    console.log(`Checking for user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log(`User found (ID: ${user.id}). Updating role to ADMIN...`);
        await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log('User role updated to ADMIN.');
    } else {
        console.log('User not found. Creating new ADMIN user...');
        await prisma.user.create({
            data: {
                email,
                role: 'ADMIN',
                // Add other required fields if any, based on schema
            },
        });
        console.log('User created with ADMIN role.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
