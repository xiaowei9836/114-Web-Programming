"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tripController_1 = require("../controllers/tripController");
const router = express_1.default.Router();
// 健康檢查端點
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: '後端服務運行正常'
    });
});
// 基礎 CRUD 操作
router.get('/', tripController_1.getAllTrips);
router.get('/:id', tripController_1.getTripById);
router.post('/', tripController_1.createTrip);
router.put('/:id', tripController_1.updateTrip);
router.delete('/:id', tripController_1.deleteTrip);
// 行程管理
router.post('/itinerary', tripController_1.addItineraryActivity);
// 提醒管理
router.post('/reminders', tripController_1.addReminder);
// 日誌管理
router.post('/journal', tripController_1.addJournalEntry);
exports.default = router;
//# sourceMappingURL=tripRoutes.js.map