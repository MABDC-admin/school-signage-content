
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const items = await prisma.contentItem.findMany({
            orderBy: { created_at: 'desc' },
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching content items:', error);
        return NextResponse.json({ error: 'Failed to fetch content items' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const item = await prisma.contentItem.create({
            data: body,
        });
        return NextResponse.json(item);
    } catch (error) {
        console.error('Error creating content item:', error);
        return NextResponse.json({ error: 'Failed to create content item' }, { status: 500 });
    }
}
