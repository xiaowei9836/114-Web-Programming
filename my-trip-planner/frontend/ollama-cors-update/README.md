# Ollama AI Travel Service with CORS

Ollama AI 服务，内置 CORS 支持，解决跨域问题。

## 功能特性
- Ollama AI 服务 (端口 11434)
- CORS 代理服务 (端口 10000)
- 健康检查端点: /health
- 测试端点: /test
- 自动代理所有 Ollama API 请求

## 部署
1. 上传所有文件到 Render
2. 环境选择: Docker
3. 自动构建和部署
4. 服务将在几分钟内可用

## 访问
- 主服务: https://ollama-ai-travel.onrender.com
- CORS 代理: https://ollama-ai-travel.onrender.com (通过代理访问)
