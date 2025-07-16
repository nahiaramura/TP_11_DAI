import express from 'express';
import {
  listEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  enrollUser
} from '../controllers/event.controller.js';

import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, listEvents);
router.get('/:id', verifyToken, getEventDetail);
router.post('/', verifyToken, createEvent);
router.put('/', verifyToken, updateEvent);
router.delete('/:id', verifyToken, deleteEvent);
router.post('/enrollment', verifyToken, enrollUser);

export default router;
