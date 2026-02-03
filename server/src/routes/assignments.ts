import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Get all assignments
router.get('/', async (req, res) => {
    try {
        const assignments = await prisma.displayAssignment.findMany({
            include: {
                display: true,
                playlist: true,
            },
            orderBy: { created_at: 'desc' },
        });
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// Create assignment
router.post('/', async (req, res) => {
    try {
        const assignment = await prisma.displayAssignment.create({
            data: req.body,
            include: {
                display: true,
                playlist: true,
            },
        });
        res.json(assignment);
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ error: 'Failed to create assignment' });
    }
});

// Update assignment
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const assignment = await prisma.displayAssignment.update({
            where: { id },
            data: {
                ...req.body,
                updated_at: new Date(),
            },
            include: {
                display: true,
                playlist: true,
            },
        });
        res.json(assignment);
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({ error: 'Failed to update assignment' });
    }
});

// Delete assignment
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.displayAssignment.delete({
            where: { id },
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ error: 'Failed to delete assignment' });
    }
});

export default router;
