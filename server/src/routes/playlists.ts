import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Get all playlists
router.get('/', async (req, res) => {
    try {
        const playlists = await prisma.playlist.findMany({
            orderBy: { created_at: 'desc' },
        });
        res.json(playlists);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

// Create playlist
router.post('/', async (req, res) => {
    try {
        const playlist = await prisma.playlist.create({
            data: req.body,
        });
        res.json(playlist);
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

// Update playlist
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const playlist = await prisma.playlist.update({
            where: { id },
            data: {
                ...req.body,
                updated_at: new Date(),
            },
        });
        res.json(playlist);
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).json({ error: 'Failed to update playlist' });
    }
});

// Delete playlist
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.playlist.delete({
            where: { id },
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
});

// --- Playlist Items ---

// Get items for a playlist
router.get('/:id/items', async (req, res) => {
    const { id } = req.params;
    try {
        const items = await prisma.playlistItem.findMany({
            where: { playlist_id: id },
            include: { content_item: true },
            orderBy: { order_index: 'asc' },
        });
        res.json(items);
    } catch (error) {
        console.error('Error fetching playlist items:', error);
        res.status(500).json({ error: 'Failed to fetch playlist items' });
    }
});

// Add item to playlist
router.post('/:id/items', async (req, res) => {
    const { id } = req.params;
    const { content_item_id, order_index } = req.body;
    try {
        const item = await prisma.playlistItem.create({
            data: {
                playlist_id: id,
                content_item_id,
                order_index,
            },
            include: { content_item: true }, // Return with content item for immediate UI update
        });
        res.json(item);
    } catch (error) {
        console.error('Error adding playlist item:', error);
        res.status(500).json({ error: 'Failed to add playlist item' });
    }
});

// Remove item from playlist (uses playlist_item id)
router.delete('/items/:itemId', async (req, res) => {
    const { itemId } = req.params;
    try {
        await prisma.playlistItem.delete({
            where: { id: itemId },
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing playlist item:', error);
        res.status(500).json({ error: 'Failed to remove playlist item' });
    }
});

// Update item order (Batch update)
router.post('/items/reorder', async (req, res) => {
    const { orderedIds } = req.body; // Array of Playlist Item IDs in order
    try {
        const updates = orderedIds.map((id: string, index: number) =>
            prisma.playlistItem.update({
                where: { id },
                data: { order_index: index },
            })
        );
        await prisma.$transaction(updates);
        res.json({ success: true });
    } catch (error) {
        console.error('Error reordering items:', error);
        res.status(500).json({ error: 'Failed to reorder items' });
    }
});

export default router;
