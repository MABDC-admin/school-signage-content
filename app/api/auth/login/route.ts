
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Create new user (Demo mode logic maintained)
            const name = email.split('@')[0];
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    role: 'VIEWER',
                },
            });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
    }
}
