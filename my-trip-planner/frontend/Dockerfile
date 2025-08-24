FROM ubuntu:22.04

# 設置環境變數
ENV DEBIAN_FRONTEND=noninteractive
ENV OLLAMA_HOST=0.0.0.0

# 安裝依賴
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 下載並安裝 Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# 創建工作目錄
WORKDIR /app

# 創建啟動腳本
RUN echo '#!/bin/bash\n\
echo "🚀 啟動 Ollama 服務..."\n\
\n\
# 啟動 Ollama 服務\n\
ollama serve &\n\
OLLAMA_PID=$!\n\
\n\
# 等待服務啟動\n\
echo "⏳ 等待服務啟動..."\n\
sleep 10\n\
\n\
# 檢查服務狀態\n\
until curl -s http://localhost:11434/api/tags > /dev/null; do\n\
    echo "⏳ 等待 Ollama API 就緒..."\n\
    sleep 5\n\
done\n\
\n\
echo "✅ Ollama 服務已啟動"\n\
\n\
# 下載模型 (如果不存在)\n\
echo "📥 檢查模型..."\n\
if ! ollama list | grep -q "gpt-oss:20b"; then\n\
    echo "📥 下載 gpt-oss:20b 模型..."\n\
    ollama pull gpt-oss:20b\n\
fi\n\
\n\
if ! ollama list | grep -q "gpt-oss:120b"; then\n\
    echo "📥 下載 gpt-oss:120b 模型..."\n\
    ollama pull gpt-oss:120b\n\
fi\n\
\n\
echo "🎉 所有模型準備就緒！"\n\
echo "📊 可用模型:"\n\
ollama list\n\
\n\
# 保持服務運行\n\
wait $OLLAMA_PID\n\
' > /app/start.sh

# 設置腳本權限
RUN chmod +x /app/start.sh

# 暴露端口
EXPOSE 11434

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:11434/api/tags || exit 1

# 啟動服務
CMD ["/app/start.sh"]
