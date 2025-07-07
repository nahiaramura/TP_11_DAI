import express from 'express';
import { listEvents, getEventDetail } from '../controllers/event.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, listEvents);
router.get('/:id', verifyToken, getEventDetail);

export default router;
