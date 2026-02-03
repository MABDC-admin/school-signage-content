import { Router } from 'express';
import authRoutes from './auth';
import displayRoutes from './displays';
import contentRoutes from './content';
import playlistRoutes from './playlists';
import assignmentRoutes from './assignments';
import alertRoutes from './alerts';
import auditRoutes from './audit';
import playerRoutes from './player';

const router = Router();

router.use('/auth', authRoutes);
router.use('/displays', displayRoutes);
router.use('/content_items', contentRoutes);
router.use('/playlists', playlistRoutes);
router.use('/display_assignments', assignmentRoutes);
router.use('/alerts', alertRoutes);
router.use('/audit_logs', auditRoutes);
router.use('/player', playerRoutes); // Custom endpoint for player

export default router;
