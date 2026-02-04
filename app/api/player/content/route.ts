
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { displayId, secretKey } = await request.json();

        // 1. Validate Display
        const display = await prisma.display.findUnique({
            where: { id: displayId },
        });

        if (!display || display.secret_key !== secretKey) {
            return NextResponse.json({ isValid: false, error: 'Invalid display credentials' }, { status: 401 });
        }

        // 2. Update Last Seen
        await prisma.display.update({
            where: { id: displayId },
            data: { last_seen_at: new Date() },
        });

        // 3. Get Active Assignment
        const assignment = await prisma.displayAssignment.findFirst({
            where: {
                display_id: displayId,
                is_active: true,
            },
            include: {
                playlist: true,
            },
        });

        let items: any[] = [];
        let playlist = null;

        if (assignment && assignment.playlist) {
            playlist = assignment.playlist;

            // 4. Get Playlist Items
            const playlistItems = await prisma.playlistItem.findMany({
                where: { playlist_id: assignment.playlist_id },
                include: { content_item: true },
                orderBy: { order_index: 'asc' },
            });

            const now = new Date();

            // 5. Filter Content
            items = playlistItems
                .map(pi => pi.content_item)
                .filter(item => {
                    if (item.status !== 'PUBLISHED') return false;
                    if (item.start_at && new Date(item.start_at) > now) return false;
                    if (item.end_at && new Date(item.end_at) < now) return false;
                    return true;
                })
                .sort((a, b) => b.priority - a.priority);
        }

        // 6. Get Active Alerts
        const alerts = await prisma.alert.findMany({
            where: { is_active: true },
            orderBy: { created_at: 'desc' },
        });

        return NextResponse.json({
            isValid: true,
            display,
            assignment,
            playlist,
            items,
            alerts,
        });

    } catch (error) {
        console.error('Error fetching player data:', error);
        return NextResponse.json({ isValid: false, error: 'Internal server error' }, { status: 500 });
    }
}
