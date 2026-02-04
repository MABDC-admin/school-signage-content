
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const display = await prisma.display.update({
            where: { id: params.id },
            data: {
                ...body,
                updated_at: new Date(),
            },
        });
        return NextResponse.json(display);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update display' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.display.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete display' }, { status: 500 });
    }
}
