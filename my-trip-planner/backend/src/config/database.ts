import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trip-planner';
    
    if (!process.env.MONGODB_URI) {
      console.warn('警告: 未設置 MONGODB_URI 環境變數，使用本地 MongoDB');
    }
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    console.warn('服務器將在沒有數據庫的情況下繼續運行（僅限開發模式）');
    
    // 在生產環境中，如果沒有 MongoDB，我們仍然讓服務器運行
    // 但會記錄警告
    if (process.env.NODE_ENV === 'production') {
      console.warn('生產環境中 MongoDB 連接失敗，但服務器繼續運行');
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;
