# Ollama CORS 部署指南

## 🎯 目标

为现有的 Ollama 服务添加 CORS 支持，解决前端跨域访问问题。

## 📁 文件说明

- `ollama-cors.Dockerfile` - 支持 CORS 的 Docker 配置
- `ollama-cors-proxy.js` - CORS 代理服务
- `ollama-cors-package.json` - Node.js 依赖配置
- `ollama-cors-render.yaml` - Render 部署配置

## 🚀 部署步骤

### 步骤 1：在 Render 控制台中更新服务

1. 访问 [https://render.com](https://render.com) 并登录
2. 找到名为 `ollama-ai-travel` 的服务
3. 点击进入服务详情页

### 步骤 2：更新服务配置

1. 点击 **"Settings"** 标签页
2. 在 **"Build & Deploy"** 部分找到 **"Source"** 设置
3. 确保连接到正确的 GitHub 仓库：
   ```
   https://github.com/xiaowei9836/114-Web-Programming
   ```
4. 设置分支为：**`cors-fix-ollama`**

### 步骤 3：更新 Docker 配置

1. 在 **"Environment"** 部分，确保设置为 **"Docker"**
2. 更新 **"Dockerfile Path"** 为：`ollama-cors.Dockerfile`
3. 保存配置

### 步骤 4：重新部署

1. 点击 **"Manual Deploy"** 按钮
2. 选择 **"Deploy latest commit"**
3. 等待部署完成

## 🔧 配置说明

新的配置将：

- ✅ **启动 Ollama 服务**：在端口 11434 上运行
- ✅ **启动 CORS 代理服务**：在端口 10000 上运行
- ✅ **解决跨域问题**：添加必要的 CORS 头
- ✅ **保持现有功能**：Ollama AI 服务继续工作

## 🌐 服务架构

```
前端 (Vercel)
    ↓
CORS 代理 (端口 10000) ← 解决跨域问题
    ↓
Ollama 服务 (端口 11434) ← AI 模型服务
```

## ⏱️ 预期时间

- **构建时间**：约 3-5 分钟
- **部署时间**：约 1-2 分钟
- **总时间**：约 5-7 分钟

## ✅ 部署完成后的验证

部署成功后，测试以下端点：

1. **健康检查**：
   ```
   https://ollama-ai-travel.onrender.com/health
   ```

2. **测试端点**：
   ```
   https://ollama-ai-travel.onrender.com/test
   ```

3. **Ollama API**（通过 CORS 代理）：
   ```
   https://ollama-ai-travel.onrender.com/api/tags
   ```

## 🎉 预期结果

部署完成后：
- ✅ **CORS 问题解决**：前端可以正常访问
- ✅ **Ollama 服务保持**：AI 功能继续工作
- ✅ **URL 不变**：仍然是 `https://ollama-ai-travel.onrender.com`
- ✅ **前端配置已更新**：指向正确的服务

## 🚨 如果遇到问题

1. **检查构建日志**：查看 Docker 构建过程中的错误
2. **验证文件路径**：确保 Dockerfile 路径正确
3. **检查端口配置**：确保端口设置正确
4. **查看服务日志**：检查服务启动过程中的错误

## 📞 需要帮助？

如果部署过程中遇到问题：
1. 检查 Render 控制台的构建日志
2. 查看服务日志中的错误信息
3. 确认所有配置文件都正确上传

---

**部署完成后，记得测试前端功能，确保 AI 聊天正常工作！** 🚀
