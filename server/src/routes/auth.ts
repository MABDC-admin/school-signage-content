import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Login (or Register if new)
router.post('/login', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Create new user
            const name = email.split('@')[0];
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    role: 'VIEWER',
                },
            });
        }

        res.json(user);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

export default router;
