# 後端資料模型說明文檔

## 資料模型架構

### 技術棧
- **MongoDB**: NoSQL 資料庫
- **Mongoose**: MongoDB ODM
- **TypeScript**: 型別定義

---

## Trip 模型

### 檔案位置
`backend/src/models/Trip.ts`

### 模型定義
```typescript
export interface ITrip extends Document {
  title: string;                    // 旅行標題
  description: string;              // 旅行描述
  startDate: Date;                  // 開始日期
  endDate: Date;                    // 結束日期
  destination: string;              // 目的地
  budget: BudgetInfo;              // 預算資訊
  itinerary: ItineraryItem[];      // 行程安排
  reminders: ReminderItem[];       // 提醒事項
  journal: JournalEntry[];         // 旅行日記
  mapTripData?: MapTripData;       // 地圖行程資料
  createdAt: Date;                 // 創建時間
  updatedAt: Date;                 // 更新時間
}
```

---

## 子模型定義

### 1. BudgetInfo - 預算資訊
```typescript
interface BudgetInfo {
  total: number;        // 預算總額
  spent: number;        // 已花費金額
  currency: string;     // 貨幣類型 (USD, TWD, EUR, JPY)
}
```

**Schema 定義**:
```typescript
budget: {
  total: {
    type: Number,
    default: 0
  },
  spent: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  }
}
```

### 2. MapTripData - 地圖行程資料
```typescript
interface MapTripData {
  id: string;                       // 地圖行程 ID
  createdAt: string;                // 創建時間
  totalPoints: number;              // 總地點數
  totalEstimatedCost: number;       // 總預估費用
  totalEstimatedTime: number;       // 總預估時間
  points: MapPoint[];               // 地點列表
}
```

### 3. MapPoint - 地圖地點
```typescript
interface MapPoint {
  order: number;                    // 順序
  name: string;                     // 地點名稱
  address: string;                  // 地址
  coordinates: {
    lat: number;                    // 緯度
    lng: number;                    // 經度
  };
  estimatedCost?: number;           // 預估費用
  estimatedTime?: number;           // 預估時間
  notes?: string;                   // 備註
  currency?: string;                // 貨幣類型
}
```

**Schema 定義**:
```typescript
points: [{
  order: Number,
  name: String,
  address: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  estimatedCost: Number,
  estimatedTime: Number,
  notes: String,
  currency: String
}]
```

### 4. ItineraryItem - 行程項目
```typescript
interface ItineraryItem {
  date: Date;                       // 日期
  activities: Activity[];           // 活動列表
}
```

### 5. Activity - 活動
```typescript
interface Activity {
  title: string;                    // 活動標題
  description: string;              // 活動描述
  location: string;                 // 地點
  time: string;                     // 時間
  cost: number;                     // 費用
}
```

### 6. ReminderItem - 提醒事項
```typescript
interface ReminderItem {
  title: string;                    // 提醒標題
  description: string;              // 提醒描述
  dueDate: Date;                    // 到期日期
  completed: boolean;               // 是否完成
}
```

### 7. JournalEntry - 日記條目
```typescript
interface JournalEntry {
  date: Date;                       // 日期
  title: string;                    // 日記標題
  content: string;                  // 日記內容
  photos: string[];                 // 照片列表
  mood: 'excellent' | 'good' | 'okay' | 'bad';  // 心情
}
```

---

## 資料驗證規則

### 1. 必填欄位
- `title`: 旅行標題（必填）
- `startDate`: 開始日期（必填）
- `endDate`: 結束日期（必填）
- `destination`: 目的地（必填）

### 2. 預設值
- `budget.total`: 0
- `budget.spent`: 0
- `budget.currency`: 'USD'
- `mood`: 'good'

### 3. 資料型別限制
- `budget.total`: 數字，預設 0
- `budget.spent`: 數字，預設 0
- `mood`: 枚舉值 ('excellent', 'good', 'okay', 'bad')

---

## 索引策略

### 自動索引
- `createdAt`: 創建時間索引
- `updatedAt`: 更新時間索引

### 建議索引
```typescript
// 複合索引
{ destination: 1, startDate: 1 }
{ userId: 1, createdAt: -1 }
```

---

## 資料關聯

### 1. 自引用關係
- 旅行 → 行程項目 → 活動
- 旅行 → 地圖行程 → 地點

### 2. 時間序列
- 行程按日期排序
- 日記按日期排序
- 提醒按到期日期排序

---

## 資料遷移

### 版本控制
```typescript
// 模型版本
const MODEL_VERSION = '1.0.0';

// 遷移腳本
const migration = {
  from: '0.9.0',
  to: '1.0.0',
  changes: [
    'Add currency field to mapTripData.points',
    'Update budget schema structure'
  ]
};
```

---

## 效能優化

### 1. 查詢優化
- 使用投影減少資料傳輸
- 適當的索引策略
- 分頁查詢

### 2. 快取策略
- 熱門查詢結果快取
- 資料更新時清除快取

### 3. 資料清理
- 定期清理過期資料
- 軟刪除機制

---

## 使用範例

### 創建旅行
```typescript
const trip = new Trip({
  title: '東京之旅',
  description: '春季櫻花之旅',
  destination: '東京',
  startDate: new Date('2024-03-01'),
  endDate: new Date('2024-03-07'),
  budget: {
    total: 50000,
    currency: 'TWD'
  }
});
```

### 查詢旅行
```typescript
// 查詢所有旅行
const trips = await Trip.find().sort({ createdAt: -1 });

// 查詢特定旅行
const trip = await Trip.findById(tripId);

// 查詢有地圖資料的旅行
const mapTrips = await Trip.find({ mapTripData: { $exists: true } });
```

### 更新旅行
```typescript
const updatedTrip = await Trip.findByIdAndUpdate(
  tripId,
  { 
    'budget.total': 60000,
    'mapTripData.points.0.estimatedCost': 1000
  },
  { new: true }
);
```
