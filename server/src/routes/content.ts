import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Get all content items
router.get('/', async (req, res) => {
    try {
        const items = await prisma.contentItem.findMany({
            orderBy: { created_at: 'desc' },
        });
        res.json(items);
    } catch (error) {
        console.error('Error fetching content items:', error);
        res.status(500).json({ error: 'Failed to fetch content items' });
    }
});

// Create content item
router.post('/', async (req, res) => {
    try {
        const item = await prisma.contentItem.create({
            data: req.body,
        });
        res.json(item);
    } catch (error) {
        console.error('Error creating content item:', error);
        res.status(500).json({ error: 'Failed to create content item' });
    }
});

// Update content item
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const item = await prisma.contentItem.update({
            where: { id },
            data: {
                ...req.body,
                updated_at: new Date(),
            },
        });
        res.json(item);
    } catch (error) {
        console.error('Error updating content item:', error);
        res.status(500).json({ error: 'Failed to update content item' });
    }
});

// Delete content item
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.contentItem.delete({
            where: { id },
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting content item:', error);
        res.status(500).json({ error: 'Failed to delete content item' });
    }
});

export default router;
