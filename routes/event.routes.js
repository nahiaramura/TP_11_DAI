import express from 'express';
import { listEvents, getEventDetail, createEvent } from '../controllers/event.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, listEvents);
router.get('/:id', verifyToken, getEventDetail);
router.post('/', verifyToken, createEvent);

export default router;
