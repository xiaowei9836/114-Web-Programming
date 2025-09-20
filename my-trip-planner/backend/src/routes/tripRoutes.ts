import express from 'express';
import Trip from '../models/Trip';
import { 
  getAllTrips, 
  getTripById, 
  createTrip, 
  updateTrip, 
  deleteTrip,
  addItineraryActivity,
  addReminder,
  addJournalEntry,
  deleteJournalEntry,
  updateNotificationSettings
} from '../controllers/tripController';

const router = express.Router();

// 健康檢查端點
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: '後端服務運行正常'
  });
});

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

// 日誌管理
router.post('/journal', addJournalEntry);
router.post('/:id/journal', addJournalEntry);
router.delete('/:id/journal/:journalId', deleteJournalEntry);

// 通知管理
router.put('/:id/notification', updateNotificationSettings);

export default router;
