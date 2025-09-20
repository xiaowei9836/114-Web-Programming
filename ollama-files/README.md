# Ollama 相關檔案整理

本資料夾包含所有與 Ollama 相關的檔案，已從專案各處整理至此。

## 檔案分類

### 部署相關
- `deploy-ollama.sh` - 基本 Ollama 部署腳本
- `deploy-ollama-online.sh` - 線上 Ollama 部署腳本
- `update-existing-ollama.sh` - 更新現有 Ollama 服務
- `update-ollama-with-cors.sh` - 更新 Ollama 並修復 CORS 問題

### CORS 代理相關
- `ollama-cors-proxy.js` - CORS 代理服務器
- `ollama-cors-package.json` - CORS 代理的 package.json
- `ollama-cors.Dockerfile` - CORS 代理的 Docker 配置
- `ollama-cors-render.yaml` - Render 部署配置

### 測試檔案
- `test-ollama.html` - Ollama 測試頁面
- `test-ollama-local.js` - 本地 Ollama 測試腳本
- `test-ollama-simple.js` - 簡化版 Ollama 測試腳本

### 文檔
- `OLLAMA_SETUP.md` - Ollama 設定指南
- `OLLAMA_CLOUD_DEPLOYMENT.md` - Ollama 雲端部署指南
- `OLLAMA_CORS_DEPLOYMENT.md` - Ollama CORS 部署指南

### 子資料夾
- `ollama-cors-update/` - CORS 更新相關檔案
- `ollama-service-update/` - 服務更新相關檔案
- `simple-ollama-update/` - 簡化更新相關檔案

## 整理時間
2025-09-20

## 說明
所有原本散落在專案各處的 Ollama 相關檔案已統一整理至此資料夾，方便管理和維護。
