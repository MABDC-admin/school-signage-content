
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { itemId: string } }) {
    try {
        await prisma.playlistItem.delete({
            where: { id: params.itemId },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove playlist item' }, { status: 500 });
    }
}
