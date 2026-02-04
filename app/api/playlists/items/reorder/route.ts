
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { orderedIds } = await request.json();
        const updates = orderedIds.map((id: string, index: number) =>
            prisma.playlistItem.update({
                where: { id },
                data: { order_index: index },
            })
        );
        await prisma.$transaction(updates);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 });
    }
}
