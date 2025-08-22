"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addJournalEntry = exports.addReminder = exports.addItineraryActivity = exports.deleteTrip = exports.updateTrip = exports.createTrip = exports.getTripById = exports.getAllTrips = void 0;
const Trip_1 = __importDefault(require("../models/Trip"));
// 获取所有旅行
const getAllTrips = async (req, res) => {
    try {
        const trips = await Trip_1.default.find().sort({ createdAt: -1 });
        res.status(200).json(trips);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        res.status(500).json({ message: '获取旅行列表失败', error: errorMessage });
    }
};
exports.getAllTrips = getAllTrips;
// 获取单个旅行
const getTripById = async (req, res) => {
    try {
        const trip = await Trip_1.default.findById(req.params.id);
        if (!trip) {
            res.status(404).json({ message: '旅行不存在' });
            return;
        }
        res.status(200).json(trip);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        res.status(500).json({ message: '获取旅行详情失败', error: errorMessage });
    }
};
exports.getTripById = getTripById;
// 创建新旅行
const createTrip = async (req, res) => {
    try {
        const trip = new Trip_1.default(req.body);
        const savedTrip = await trip.save();
        res.status(201).json(savedTrip);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        res.status(400).json({ message: '创建旅行失败', error: errorMessage });
    }
};
exports.createTrip = createTrip;
// 更新旅行
const updateTrip = async (req, res) => {
    try {
        const trip = await Trip_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!trip) {
            res.status(404).json({ message: '旅行不存在' });
            return;
        }
        res.status(200).json(trip);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        res.status(400).json({ message: '更新旅行失败', error: errorMessage });
    }
};
exports.updateTrip = updateTrip;
// 删除旅行
const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip_1.default.findByIdAndDelete(req.params.id);
        if (!trip) {
            res.status(404).json({ message: '旅行不存在' });
            return;
        }
        res.status(200).json({ message: '旅行删除成功' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        res.status(500).json({ message: '删除旅行失败', error: errorMessage });
    }
};
exports.deleteTrip = deleteTrip;
// 添加行程活动
const addItineraryActivity = async (req, res) => {
    try {
        const { tripId, date, activity } = req.body;
        const trip = await Trip_1.default.findById(tripId);
        if (!trip) {
            res.status(404).json({ message: '旅行不存在' });
            return;
        }
        const existingDate = trip.itinerary.find(item => item.date.toDateString() === new Date(date).toDateString());
        if (existingDate) {
            existingDate.activities.push(activity);
        }
        else {
            trip.itinerary.push({ date: new Date(date), activities: [activity] });
        }
        const updatedTrip = await trip.save();
        res.status(200).json(updatedTrip);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        res.status(400).json({ message: '添加行程活动失败', error: errorMessage });
    }
};
exports.addItineraryActivity = addItineraryActivity;
// 添加提醒
const addReminder = async (req, res) => {
    try {
        const { tripId, reminder } = req.body;
        const trip = await Trip_1.default.findById(tripId);
        if (!trip) {
            res.status(404).json({ message: '旅行不存在' });
            return;
        }
        trip.reminders.push(reminder);
        const updatedTrip = await trip.save();
        res.status(200).json(updatedTrip);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        res.status(400).json({ message: '添加提醒失败', error: errorMessage });
    }
};
exports.addReminder = addReminder;
// 添加日记条目
const addJournalEntry = async (req, res) => {
    try {
        const { tripId, journalEntry } = req.body;
        const trip = await Trip_1.default.findById(tripId);
        if (!trip) {
            res.status(404).json({ message: '旅行不存在' });
            return;
        }
        trip.journal.push(journalEntry);
        const updatedTrip = await trip.save();
        res.status(200).json(updatedTrip);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        res.status(400).json({ message: '添加日记条目失败', error: errorMessage });
    }
};
exports.addJournalEntry = addJournalEntry;
//# sourceMappingURL=tripController.js.map