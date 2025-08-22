"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const tripRoutes_1 = __importDefault(require("./routes/tripRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// 連接數據庫
(0, database_1.default)();
// 中間件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 路由
app.use('/api/trips', tripRoutes_1.default);
// 健康檢查
app.get('/health', (req, res) => {
    res.status(200).json({ message: '旅行規劃器 API 運行正常' });
});
// 錯誤處理中間件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '服務器內部錯誤' });
});
// 啟動服務器
app.listen(PORT, () => {
    console.log(`服務器運行在端口 ${PORT}`);
    console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});
//# sourceMappingURL=server.js.map