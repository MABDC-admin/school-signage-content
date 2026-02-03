import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Get all displays
router.get('/', async (req, res) => {
    try {
        const displays = await prisma.display.findMany({
            orderBy: { created_at: 'desc' },
        });
        res.json(displays);
    } catch (error) {
        console.error('Error fetching displays:', error);
        res.status(500).json({ error: 'Failed to fetch displays' });
    }
});

// Create display
router.post('/', async (req, res) => {
    try {
        const display = await prisma.display.create({
            data: req.body,
        });
        res.json(display);
    } catch (error) {
        console.error('Error creating display:', error);
        res.status(500).json({ error: 'Failed to create display' });
    }
});

// Update display
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const display = await prisma.display.update({
            where: { id },
            data: {
                ...req.body,
                updated_at: new Date(),
            },
        });
        res.json(display);
    } catch (error) {
        console.error('Error updating display:', error);
        res.status(500).json({ error: 'Failed to update display' });
    }
});

// Delete display
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.display.delete({
            where: { id },
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting display:', error);
        res.status(500).json({ error: 'Failed to delete display' });
    }
});

// Rotate secret key
// Note: Frontend implementation sends { secret_key: newKey } to update endpoint,
// so the generic update endpoint handles this. 
// But if we want a specific action (which useDisplays doesn't strictly imply, it calls updateDisplay)
// we are good with just the patch.

export default router;
