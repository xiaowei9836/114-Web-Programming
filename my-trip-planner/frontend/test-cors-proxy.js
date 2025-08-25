// 测试 CORS 代理服务
const testCorsProxy = async () => {
  const corsProxyUrl = 'https://cors-proxy-ollama.onrender.com';
  const ollamaUrl = 'https://ollama-ai-travel.onrender.com';
  
  console.log('🧪 测试 CORS 代理服务...');
  console.log(`📡 代理服务: ${corsProxyUrl}`);
  console.log(`🎯 目标服务: ${ollamaUrl}`);
  
  try {
    // 测试代理服务健康状态
    console.log('\n1️⃣ 测试代理服务健康状态...');
    const healthResponse = await fetch(`${corsProxyUrl}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ 代理服务健康检查通过:', healthData);
    } else {
      console.log('❌ 代理服务健康检查失败:', healthResponse.status);
    }
    
    // 测试代理服务测试端点
    console.log('\n2️⃣ 测试代理服务测试端点...');
    const testResponse = await fetch(`${corsProxyUrl}/test`);
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ 代理服务测试端点正常:', testData);
    } else {
      console.log('❌ 代理服务测试端点失败:', testResponse.status);
    }
    
    // 测试通过代理访问 Ollama API
    console.log('\n3️⃣ 测试通过代理访问 Ollama API...');
    const ollamaResponse = await fetch(`${corsProxyUrl}/api/tags`);
    if (ollamaResponse.ok) {
      const ollamaData = await ollamaResponse.json();
      console.log('✅ 通过代理访问 Ollama API 成功:', ollamaData);
    } else {
      console.log('❌ 通过代理访问 Ollama API 失败:', ollamaResponse.status, ollamaResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
};

// 在浏览器中运行
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.testCorsProxy = testCorsProxy;
  console.log('🧪 测试函数已加载，请在控制台运行: testCorsProxy()');
} else {
  // Node.js 环境
  testCorsProxy();
}
