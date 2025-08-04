import express from 'express';
import {
  listEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  enrollUser,
  deleteEnrollment,
  listEventLocations,
  listMyEvents // ✅
} from '../controllers/event.controller.js';


import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, listEvents);
router.get('/mine', verifyToken, listMyEvents); // ✅ ESTA ES LA NUEVA RUTA

router.get('/:id', verifyToken, getEventDetail);
router.post('/', verifyToken, createEvent);
router.put('/:id', verifyToken, updateEvent);
router.delete('/:id', verifyToken, deleteEvent);
router.post('/:id/enrollment', verifyToken, enrollUser);
router.delete('/:id/enrollment', verifyToken, deleteEnrollment);
router.get("/", verifyToken, listEventLocations);


export default router;
