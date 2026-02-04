
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const items = await prisma.playlistItem.findMany({
            where: { playlist_id: params.id },
            include: { content_item: true },
            orderBy: { order_index: 'asc' },
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch playlist items' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { content_item_id, order_index } = body;
        const item = await prisma.playlistItem.create({
            data: {
                playlist_id: params.id,
                content_item_id,
                order_index,
            },
            include: { content_item: true },
        });
        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add playlist item' }, { status: 500 });
    }
}
