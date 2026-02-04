
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const { is_active } = await request.json();
        const assignment = await prisma.displayAssignment.update({
            where: { id: params.id },
            data: { is_active },
        });
        return NextResponse.json(assignment);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update assignment status' }, { status: 500 });
    }
}
