import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import tripRoutes from './routes/tripRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 連接數據庫
connectDB();

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/trips', tripRoutes);

// 健康檢查
app.get('/health', (req, res) => {
  res.status(200).json({ message: '旅行規劃器 API 運行正常' });
});

// 錯誤處理中間件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: '服務器內部錯誤' });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`服務器運行在端口 ${PORT}`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});
