FROM ubuntu:22.04

# 安装必要的包
RUN apt-get update && apt-get install -y \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# 下载并安装 Ollama
RUN curl -L https://github.com/ollama/ollama/releases/download/v0.1.29/ollama-linux-amd64 -o /usr/local/bin/ollama \
    && chmod +x /usr/local/bin/ollama

# 设置工作目录
WORKDIR /app

# 复制 CORS 代理文件
COPY cors-proxy.js .
COPY package.json .

# 安装 Node.js 依赖
RUN npm install

# 创建启动脚本
RUN echo '#!/bin/bash' > /start.sh && \
    echo 'echo "🚀 启动 Ollama 服务..."' >> /start.sh && \
    echo 'export OLLAMA_HOST=0.0.0.0' >> /start.sh && \
    echo 'ollama serve &' >> /start.sh && \
    echo 'sleep 10' >> /start.sh && \
    echo 'echo "🌐 启动 CORS 代理..."' >> /start.sh && \
    echo 'node cors-proxy.js' >> /start.sh && \
    chmod +x /start.sh

# 暴露端口
EXPOSE 10000 11434

# 启动服务
CMD ["/start.sh"]
