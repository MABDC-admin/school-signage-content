
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const alert = await prisma.alert.update({
            where: { id: params.id },
            data: { is_active: true },
        });
        return NextResponse.json(alert);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to activate alert' }, { status: 500 });
    }
}
