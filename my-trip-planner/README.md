# 我的旅行规划器 (My Trip Planner)

一个功能完整的旅行规划应用，帮助用户规划旅行、管理预算、设置提醒和记录旅行日记。

## 🚀 功能特性

- **地图规划**: 使用 Google Maps API 进行旅行路线规划
- **行程安排**: 创建详细的每日行程计划
- **预算管理**: 跟踪旅行支出和预算
- **旅行提醒**: 设置重要事项提醒
- **旅行日记**: 记录旅行中的美好时刻
- **响应式设计**: 支持桌面和移动设备

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Vite (构建工具)
- Tailwind CSS (样式框架)
- React Router (路由管理)
- Lucide React (图标库)

### 后端
- Node.js + Express.js
- TypeScript
- MongoDB (数据库)
- Mongoose (ODM)

## 📁 项目结构

```
my-trip-planner/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── types/          # TypeScript 类型定义
│   │   └── utils/          # 工具函数
│   ├── public/             # 静态资源
│   └── package.json
├── backend/                 # Node.js 后端 API
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── middleware/     # 中间件
│   │   └── config/         # 配置文件
│   └── package.json
└── docs/                   # 项目文档
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- MongoDB 4.4+
- Google Maps API Key

### 1. 克隆项目
```bash
git clone <repository-url>
cd my-trip-planner
```

### 2. 后端设置
```bash
cd backend
npm install
cp env.example .env
# 编辑 .env 文件，设置环境变量
npm run dev
```

### 3. 前端设置
```bash
cd frontend
npm install
npm run dev
```

### 4. 环境变量配置
在 `backend/.env` 文件中设置：
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trip-planner
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NODE_ENV=development
```

## 📱 主要页面

1. **首页**: 应用介绍和功能概览
2. **旅行列表**: 显示所有旅行计划
3. **创建旅行**: 新建旅行计划表单
4. **旅行详情**: 旅行详细信息，包含多个标签页
   - 概览: 预算和统计信息
   - 行程: 每日活动安排
   - 预算: 预算管理和支出记录
   - 提醒: 旅行提醒事项
   - 日记: 旅行日记记录

## 🔧 API 端点

### 旅行管理
- `GET /api/trips` - 获取所有旅行
- `GET /api/trips/:id` - 获取单个旅行
- `POST /api/trips` - 创建新旅行
- `PUT /api/trips/:id` - 更新旅行
- `DELETE /api/trips/:id` - 删除旅行

### 行程管理
- `POST /api/trips/itinerary` - 添加行程活动

### 提醒管理
- `POST /api/trips/reminders` - 添加提醒

### 日记管理
- `POST /api/trips/journal` - 添加日记条目

## 🎨 设计特点

- **现代化 UI**: 使用 Tailwind CSS 构建的清新界面
- **响应式设计**: 完美适配各种设备尺寸
- **用户体验**: 直观的导航和交互设计
- **数据可视化**: 预算进度条和统计图表

## 🚀 部署

### 前端部署 (Vercel)
```bash
cd frontend
npm run build
# 将 dist 文件夹部署到 Vercel
```

### 后端部署
```bash
cd backend
npm run build
npm start
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请提交 Issue 或联系开发团队。
