
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const playlists = await prisma.playlist.findMany({
            orderBy: { created_at: 'desc' },
        });
        return NextResponse.json(playlists);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const playlist = await prisma.playlist.create({
            data: body,
        });
        return NextResponse.json(playlist);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
    }
}
