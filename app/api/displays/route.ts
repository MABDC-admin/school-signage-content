
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const displays = await prisma.display.findMany({
            orderBy: { created_at: 'desc' },
        });
        return NextResponse.json(displays);
    } catch (error) {
        console.error('Error fetching displays:', error);
        return NextResponse.json({ error: 'Failed to fetch displays' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const display = await prisma.display.create({
            data: body,
        });
        return NextResponse.json(display);
    } catch (error) {
        console.error('Error creating display:', error);
        return NextResponse.json({ error: 'Failed to create display' }, { status: 500 });
    }
}
