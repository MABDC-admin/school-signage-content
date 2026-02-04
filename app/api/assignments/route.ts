
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const assignments = await prisma.displayAssignment.findMany({
            include: {
                display: true,
                playlist: true,
            },
            orderBy: { created_at: 'desc' },
        });
        return NextResponse.json(assignments);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const assignment = await prisma.displayAssignment.create({
            data: body,
            include: {
                display: true,
                playlist: true,
            },
        });
        return NextResponse.json(assignment);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
    }
}
