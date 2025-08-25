# 🚀 CORS 代理服务部署指南

## 📋 问题描述

你的线上版网页 `https://my-trip-planner-lc34rbbeu-kuanweis-projects.vercel.app` 出现以下错误：

```
Access to fetch at 'https://ollama-ai-travel.onrender.com/api/tags' 
from origin 'https://my-trip-planner-lc34rbbeu-kuanweis-projects.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

这是因为 Ollama 服务没有正确设置 CORS 头，导致浏览器阻止跨域请求。

## 🛠️ 解决方案

部署一个 CORS 代理服务来解决跨域问题。

## 📁 部署文件准备

✅ 已完成！部署文件位于 `cors-proxy-deploy/` 目录中，包含：

- `cors-proxy.js` - 代理服务主文件
- `package.json` - 依赖配置
- `render.yaml` - Render 部署配置
- `README.md` - 部署说明
- `node_modules/` - 已安装的依赖

## 🌐 部署步骤

### 步骤 1：访问 Render

1. 打开浏览器，访问 [https://render.com](https://render.com)
2. 使用你的账户登录

### 步骤 2：创建新服务

1. 点击页面右上角的 **"New +"** 按钮
2. 选择 **"Web Service"**

### 步骤 3：配置服务

1. **服务名称**: `cors-proxy-ollama`
2. **环境**: 选择 `Node`
3. **计划**: 选择 `Free` (免费计划)
4. **构建命令**: `npm install`
5. **启动命令**: `npm start`

### 步骤 4：上传文件

有两种方式：

#### 方式 A：手动上传（推荐）

1. 选择 **"Build and deploy from a Git repository"**
2. 点击 **"Upload files"**
3. 将 `cors-proxy-deploy/` 目录中的所有文件拖拽上传
4. 确保包含以下文件：
   - `cors-proxy.js`
   - `package.json`
   - `render.yaml`
   - `README.md`
   - `.gitignore`

#### 方式 B：连接 GitHub

1. 选择 **"Connect a Git repository"**
2. 连接你的 GitHub 账户
3. 选择或创建包含这些文件的仓库

### 步骤 5：创建服务

1. 检查所有配置是否正确
2. 点击 **"Create Web Service"**
3. 等待部署完成（通常需要 2-5 分钟）

## ⏱️ 部署完成

部署成功后，你将获得一个类似这样的 URL：
```
https://cors-proxy-ollama.onrender.com
```

## 🔧 更新前端配置

部署完成后，运行以下命令更新前端配置：

```bash
cd my-trip-planner/frontend
chmod +x update-frontend-config.sh
./update-frontend-config.sh
```

脚本会提示你输入 CORS 代理服务的 URL，然后自动更新配置。

## 🧪 测试服务

### 测试代理服务健康状态

```bash
curl https://your-service-name.onrender.com/health
```

应该返回：
```json
{
  "status": "OK",
  "message": "CORS Proxy is running",
  "target": "https://ollama-ai-travel.onrender.com",
  "timestamp": "2024-08-25T..."
}
```

### 测试代理服务测试端点

```bash
curl https://your-service-name.onrender.com/test
```

应该返回：
```json
{
  "message": "CORS Proxy test endpoint",
  "cors": "enabled",
  "timestamp": "2024-08-25T..."
}
```

### 测试通过代理访问 Ollama

```bash
curl https://your-service-name.onrender.com/api/tags
```

应该返回 Ollama 的模型列表。

## 🔄 重新部署前端

配置更新后，需要重新部署前端：

1. 提交代码到 GitHub
2. Vercel 会自动重新部署
3. 或者手动触发重新部署

## ✅ 验证修复

部署完成后，访问你的前端页面：

1. 打开浏览器开发者工具
2. 查看控制台是否还有 CORS 错误
3. 测试 AI 聊天功能
4. 验证 llama2:7b 模型是否正常工作

## 🚨 常见问题

### 问题 1：代理服务返回 404

**原因**: 代理服务配置错误或未正确部署
**解决**: 检查代理服务日志，确认服务正常运行

### 问题 2：仍然有 CORS 错误

**原因**: 前端配置未更新或代理服务未正确添加 CORS 头
**解决**: 确认代理服务已部署，前端配置已更新

### 问题 3：模型加载失败

**原因**: Ollama 服务不可用或模型不存在
**解决**: 检查 Ollama 服务状态，确认模型已安装

## 📞 需要帮助？

如果遇到问题：

1. 检查 Render 控制台的部署日志
2. 运行测试命令验证服务状态
3. 查看浏览器控制台的详细错误信息
4. 确认所有服务 URL 的正确性

## 🎉 完成！

按照这个指南操作后，你的 Ollama2:7b 功能应该能够正常工作，不再出现 CORS 错误！

---

**部署完成后，记得运行 `./update-frontend-config.sh` 来更新前端配置！**
