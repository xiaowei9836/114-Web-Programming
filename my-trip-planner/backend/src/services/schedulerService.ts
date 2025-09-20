import cron from 'node-cron';
import Trip from '../models/Trip';
import { sendTripReminder } from './emailService';

// 檢查並發送提醒郵件
const checkAndSendReminders = async () => {
  try {
    console.log('🔍 檢查旅行提醒...');
    
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000); // 5分鐘後
    
    // 查找需要發送提醒的旅行（在未來5分鐘內）
    const tripsToRemind = await Trip.find({
      'notificationSettings.enabled': true,
      'notificationSettings.reminderTime': {
        $gte: now.toISOString(),
        $lte: fiveMinutesFromNow.toISOString()
      }
    });
    
    console.log(`📧 找到 ${tripsToRemind.length} 個需要提醒的旅行`);
    
    for (const trip of tripsToRemind) {
      try {
        const reminderType = trip.notificationSettings?.reminderType || 'start';
        const reminderTime = new Date(trip.notificationSettings?.reminderTime || '');
        
        console.log(`⏰ 檢查提醒: ${trip.title}`);
        console.log(`📅 提醒時間 (台灣): ${new Date(reminderTime.getTime() + 8 * 60 * 60 * 1000).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`);
        console.log(`🕐 當前時間 (台灣): ${new Date(now.getTime() + 8 * 60 * 60 * 1000).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`);
        console.log(`⏱️ 時間差: ${Math.round((reminderTime.getTime() - now.getTime()) / 1000 / 60)} 分鐘`);
        
        const result = await sendTripReminder(trip, reminderType);
        
        if (result.success) {
          console.log(`✅ 提醒已發送: ${trip.title} -> ${trip.notificationSettings?.email}`);
          
          // 發送後關閉通知，避免重複發送
          await Trip.findByIdAndUpdate(trip._id, {
            'notificationSettings.enabled': false
          });
        } else {
          console.error(`❌ 提醒發送失敗: ${trip.title}`, result.error);
        }
      } catch (error) {
        console.error(`❌ 處理旅行提醒時發生錯誤: ${trip.title}`, error);
      }
    }
  } catch (error) {
    console.error('❌ 檢查提醒時發生錯誤:', error);
  }
};

// 啟動定時任務
export const startScheduler = () => {
  console.log('⏰ 啟動定時任務服務...');
  
  // 每分鐘檢查一次提醒
  cron.schedule('* * * * *', () => {
    checkAndSendReminders();
  });
  
  console.log('✅ 定時任務已啟動 - 每分鐘檢查一次提醒');
};

// 手動觸發檢查（用於測試）
export const triggerReminderCheck = () => {
  console.log('🔔 手動觸發提醒檢查...');
  checkAndSendReminders();
};
