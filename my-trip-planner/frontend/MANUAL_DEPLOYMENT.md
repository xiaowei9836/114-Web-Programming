# 🚀 CORS 代理手動部署說明

## ✅ 本地測試完成
CORS 代理已經在本地測試成功，能夠正確代理 Ollama 服務。

## 🌐 部署到 Render

### 方法 1：通過 Render 儀表板（推薦）

1. **訪問 Render 儀表板**
   - 前往 [https://dashboard.render.com](https://dashboard.render.com)
   - 登入你的帳戶

2. **創建新服務**
   - 點擊 "New +" 按鈕
   - 選擇 "Web Service"
   - 連接你的 GitHub 倉庫

3. **配置服務**
   - **Name**: `cors-proxy-ollama`
   - **Environment**: `Node`
   - **Region**: 選擇離你最近的區域
   - **Branch**: `main`
   - **Root Directory**: `my-trip-planner/frontend`
   - **Build Command**: `npm install`
   - **Start Command**: `node cors-proxy.js`

4. **環境變數**
   - `NODE_ENV`: `production`

5. **點擊 "Create Web Service"**

### 方法 2：使用 GitHub 直接部署

1. **推送代碼到 GitHub**
   ```bash
   git add .
   git commit -m "Add CORS proxy for Ollama service"
   git push origin main
   ```

2. **在 Render 中連接倉庫**
   - 選擇 "Connect a repository"
   - 選擇你的 GitHub 倉庫
   - 使用上述配置創建服務

## 🔧 部署後配置

部署完成後，CORS 代理的 URL 將是：
```
https://cors-proxy-ollama.onrender.com
```

### 測試部署
```bash
# 健康檢查
curl "https://cors-proxy-ollama.onrender.com/health"

# 測試 Ollama 代理
curl "https://cors-proxy-ollama.onrender.com/api/tags"
```

## 📱 前端配置更新

前端配置已經更新為使用新的 CORS 代理 URL。部署完成後，線上網頁應該能夠：

1. ✅ 正確連接到雲端 Ollama 服務
2. ✅ 使用 `llama2:7b` 模型
3. ✅ 不再出現 CORS 錯誤
4. ✅ 提供免費的 AI 旅遊顧問服務

## 🧪 功能測試

部署完成後，請訪問：
```
https://my-trip-planner-lc34rbbeu-kuanweis-projects.vercel.app
```

並測試"AI諮詢"功能是否正常工作。

## 🆘 故障排除

### 如果部署失敗：
1. 檢查 `package.json` 中的依賴是否正確
2. 確認 `cors-proxy.js` 文件存在
3. 查看 Render 儀表板中的錯誤日誌

### 如果 CORS 仍然有問題：
1. 確認 CORS 代理服務正在運行
2. 檢查前端配置中的 URL 是否正確
3. 清除瀏覽器緩存並重新測試

## 🎯 預期結果

部署完成後，所有線上用戶都應該能夠：
- 使用"AI諮詢"功能
- 獲得免費的旅遊規劃建議
- 享受流暢的 AI 對話體驗
