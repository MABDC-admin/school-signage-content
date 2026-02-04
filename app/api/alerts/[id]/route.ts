
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const alert = await prisma.alert.update({
            where: { id: params.id },
            data: {
                ...body,
                updated_at: new Date(),
            },
        });
        return NextResponse.json(alert);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.alert.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
    }
}
