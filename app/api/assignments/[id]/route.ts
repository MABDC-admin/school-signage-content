
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const assignment = await prisma.displayAssignment.update({
            where: { id: params.id },
            data: {
                ...body,
                updated_at: new Date(),
            },
            include: {
                display: true,
                playlist: true,
            },
        });
        return NextResponse.json(assignment);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.displayAssignment.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
    }
}
