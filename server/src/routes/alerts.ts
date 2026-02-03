import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Get all alerts
router.get('/', async (req, res) => {
    try {
        const alerts = await prisma.alert.findMany({
            orderBy: { created_at: 'desc' },
        });
        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// Create alert
router.post('/', async (req, res) => {
    try {
        const alert = await prisma.alert.create({
            data: req.body,
        });
        res.json(alert);
    } catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({ error: 'Failed to create alert' });
    }
});

// Update alert
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const alert = await prisma.alert.update({
            where: { id },
            data: {
                ...req.body,
                updated_at: new Date(),
            },
        });
        res.json(alert);
    } catch (error) {
        console.error('Error updating alert:', error);
        res.status(500).json({ error: 'Failed to update alert' });
    }
});

// Delete alert
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.alert.delete({
            where: { id },
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ error: 'Failed to delete alert' });
    }
});

export default router;
