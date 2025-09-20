import { Request, Response } from 'express';
import Trip, { ITrip } from '../models/Trip';

// 获取所有旅行
export const getAllTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 查詢所有旅行...');
    const trips = await Trip.find().sort({ createdAt: -1 });
    console.log(`✅ 找到 ${trips.length} 個旅行`);
    res.status(200).json(trips);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('❌ 查詢旅行列表失敗:', error);
    res.status(500).json({ message: '获取旅行列表失败', error: errorMessage });
  }
};

// 获取单个旅行
export const getTripById = async (req: Request, res: Response): Promise<void> => {
  try {
    const tripId = req.params.id;
    console.log(`🔍 查詢旅行 ID: ${tripId}`);
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
      console.log(`❌ 旅行不存在，ID: ${tripId}`);
      res.status(404).json({ message: '旅行不存在' });
      return;
    }
    
    console.log(`✅ 找到旅行: ${trip.title} (${tripId})`);
    res.status(200).json(trip);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error(`❌ 查詢旅行失敗，ID: ${req.params.id}`, error);
    res.status(500).json({ message: '获取旅行详情失败', error: errorMessage });
  }
};

// 创建新旅行
export const createTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const trip = new Trip(req.body);
    const savedTrip = await trip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(400).json({ message: '创建旅行失败', error: errorMessage });
  }
};

// 更新旅行
export const updateTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!trip) {
      res.status(404).json({ message: '旅行不存在' });
      return;
    }
    res.status(200).json(trip);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(400).json({ message: '更新旅行失败', error: errorMessage });
  }
};

// 删除旅行
export const deleteTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      res.status(404).json({ message: '旅行不存在' });
      return;
    }
    res.status(200).json({ message: '旅行删除成功' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json({ message: '删除旅行失败', error: errorMessage });
  }
};

// 添加行程活动
export const addItineraryActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId, date, activity } = req.body;
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      res.status(404).json({ message: '旅行不存在' });
      return;
    }

    const existingDate = trip.itinerary.find(item => 
      item.date.toDateString() === new Date(date).toDateString()
    );

    if (existingDate) {
      existingDate.activities.push(activity);
    } else {
      trip.itinerary.push({ date: new Date(date), activities: [activity] });
    }

    const updatedTrip = await trip.save();
    res.status(200).json(updatedTrip);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(400).json({ message: '添加行程活动失败', error: errorMessage });
  }
};

// 添加提醒
export const addReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId, reminder } = req.body;
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      res.status(404).json({ message: '旅行不存在' });
      return;
    }

    trip.reminders.push(reminder);
    const updatedTrip = await trip.save();
    res.status(200).json(updatedTrip);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(400).json({ message: '添加提醒失败', error: errorMessage });
  }
};

// 添加日记条目
export const addJournalEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    // 支持两种请求格式：/:id/journal 和 /journal
    const tripId = req.params.id || req.body.tripId;
    const journalEntry = req.body.journalEntry || req.body;
    
    if (!tripId) {
      res.status(400).json({ message: '缺少旅行ID' });
      return;
    }

    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      res.status(404).json({ message: '旅行不存在' });
      return;
    }

    // 确保 journal 数组存在
    if (!trip.journal) {
      trip.journal = [];
    }

    trip.journal.push(journalEntry);
    const updatedTrip = await trip.save();
    res.status(200).json(updatedTrip);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(400).json({ message: '添加日记条目失败', error: errorMessage });
  }
};

// 删除日记条目
export const deleteJournalEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, journalId } = req.params;
    
    const trip = await Trip.findById(id);
    
    if (!trip) {
      res.status(404).json({ message: '旅行不存在' });
      return;
    }

    // 确保 journal 数组存在
    if (!trip.journal) {
      res.status(404).json({ message: '日記不存在' });
      return;
    }

    // 查找並刪除指定的日記條目
    const journalIndex = trip.journal.findIndex((entry, index) => 
      index.toString() === journalId || entry.title === journalId
    );

    if (journalIndex === -1) {
      res.status(404).json({ message: '日記條目不存在' });
      return;
    }

    trip.journal.splice(journalIndex, 1);
    const updatedTrip = await trip.save();
    res.status(200).json(updatedTrip);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(400).json({ message: '删除日记条目失败', error: errorMessage });
  }
};

// 更新通知設定
export const updateNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notificationSettings } = req.body;
    
    console.log(`🔔 更新旅行通知設定，ID: ${id}`);
    console.log(`📧 通知設定:`, notificationSettings);
    
    const trip = await Trip.findByIdAndUpdate(
      id,
      { notificationSettings },
      { new: true, runValidators: true }
    );
    
    if (!trip) {
      console.log(`❌ 旅行不存在，ID: ${id}`);
      res.status(404).json({ message: '旅行不存在' });
      return;
    }
    
    console.log(`✅ 通知設定已更新: ${trip.title}`);
    res.status(200).json(trip);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error(`❌ 更新通知設定失敗，ID: ${req.params.id}`, error);
    res.status(400).json({ message: '更新通知設定失败', error: errorMessage });
  }
};
