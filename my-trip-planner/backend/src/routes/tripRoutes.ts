import express from 'express';
import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  addItineraryActivity,
  addReminder,
  addJournalEntry
} from '../controllers/tripController';

const router = express.Router();

// 基礎 CRUD 操作
router.get('/', getAllTrips);
router.get('/:id', getTripById);
router.post('/', createTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// 行程管理
router.post('/itinerary', addItineraryActivity);

// 提醒管理
router.post('/reminders', addReminder);

// 日記管理
router.post('/journal', addJournalEntry);

export default router;
