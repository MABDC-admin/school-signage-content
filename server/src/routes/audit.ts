import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Get all audit logs
router.get('/', async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                user: true, // Only if we want to show user names
            },
            take: 100, // Limit to last 100 logs for performance
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// Create audit log
router.post('/', async (req, res) => {
    try {
        const log = await prisma.auditLog.create({
            data: req.body,
        });
        res.json(log);
    } catch (error) {
        console.error('Error creating audit log:', error);
        // Don't fail the request if logging fails, but log to console
        res.status(500).json({ error: 'Failed to create log' });
    }
});

export default router;
