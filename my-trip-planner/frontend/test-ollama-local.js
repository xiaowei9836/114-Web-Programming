// 測試本地 Ollama 模型
import fetch from 'node-fetch';

// 本地 Ollama 配置
const OLLAMA_BASE_URL = 'http://localhost:11434';
const AVAILABLE_MODELS = ['gpt-oss:20b', 'gpt-oss:120b'];

// 旅遊系統提示詞（繁體中文）
const TRAVEL_SYSTEM_PROMPT = `你是一位專業的AI旅遊顧問，專門為用戶提供旅遊規劃建議。

請用繁體中文回答，提供實用、具體的建議。回答要結構化，使用表情符號和項目符號讓內容更易讀。

**重要：** 當用戶詢問旅遊規劃時，請提供完整、詳細的回答，包括：
- 完整的行程安排（時間、地點、活動）
- 具體的交通建議和費用
- 實用的旅遊小貼士
- 預算分配建議
- 季節性注意事項

不要因為字數限制而截斷回答，確保提供完整的旅遊建議。

如果用戶的問題超出旅遊範圍，請禮貌地引導回旅遊相關話題。`;

// 測試問題
const testQuestions = [
  "我想去日本東京旅遊5天，預算3萬台幣，請幫我規劃",
  "推薦台北週末兩日遊的景點和美食",
  "如何規劃歐洲背包旅行？",
  "去泰國旅遊需要注意什麼？",
  "台灣環島旅遊建議，要有詳細的行程安排"
];

// 檢查 Ollama 服務狀態
async function checkOllamaStatus() {
  try {
    console.log('🔍 檢查 Ollama 服務狀態...');
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      timeout: 10000,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama 服務正常運行');
      console.log(`📋 可用模型數量: ${data.models ? data.models.length : '未知'}`);
      return true;
    } else {
      console.log(`❌ Ollama 服務異常 (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 無法連接到 Ollama 服務: ${error.message}`);
    return false;
  }
}

// 測試 Ollama 模型
async function testOllamaModel(modelName, question) {
  try {
    console.log(`\n🤖 測試模型: ${modelName}`);
    console.log(`📝 問題: ${question}`);
    console.log('⏳ 正在等待回應...');
    
    const startTime = Date.now();
    
    const prompt = `${TRAVEL_SYSTEM_PROMPT}\n\n用戶: ${question}\n助手:`;
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_k: 40,
          top_p: 0.9,
          repeat_penalty: 1.1,
          num_predict: 2048,
          num_ctx: 4096,
        }
      }),
      timeout: 120000, // 2分鐘超時
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data && data.response) {
      const aiResponse = data.response;
      console.log(`✅ 回應成功 (${responseTime}ms)`);
      console.log(`📝 AI 回應:\n${aiResponse}`);
      
      // 檢查回應質量
      const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(aiResponse);
      const hasStructure = /\n|•|\*|-/.test(aiResponse);
      const hasTravelContent = /旅遊|行程|景點|交通|住宿|預算|建議/.test(aiResponse);
      const hasChinese = /[\u4e00-\u9fff]/.test(aiResponse);
      
      console.log(`\n📊 回應質量分析:`);
      console.log(`   🎨 表情符號: ${hasEmojis ? '✅' : '❌'}`);
      console.log(`   📋 結構化: ${hasStructure ? '✅' : '❌'}`);
      console.log(`   🗺️ 旅遊內容: ${hasTravelContent ? '✅' : '❌'}`);
      console.log(`   🇹🇼 繁體中文: ${hasChinese ? '✅' : '❌'}`);
      
      return {
        success: true,
        model: modelName,
        responseTime,
        hasEmojis,
        hasStructure,
        hasTravelContent,
        hasChinese,
        response: aiResponse
      };
    } else {
      throw new Error('回應格式不正確');
    }
    
  } catch (error) {
    console.log(`❌ 測試失敗: ${error.message}`);
    return {
      success: false,
      model: modelName,
      error: error.message
    };
  }
}

// 主測試函數
async function runOllamaTests() {
  console.log('🚀 開始測試本地 Ollama 模型...\n');
  console.log(`📋 測試配置:`);
  console.log(`   🌐 服務地址: ${OLLAMA_BASE_URL}`);
  console.log(`   🤖 可用模型: ${AVAILABLE_MODELS.join(', ')}`);
  console.log(`   ⏱️  超時: 120秒`);
  console.log(`   📝 最大 tokens: 2048`);
  
  // 檢查服務狀態
  const serviceRunning = await checkOllamaStatus();
  if (!serviceRunning) {
    console.log('\n❌ Ollama 服務未運行，請先啟動服務');
    console.log('💡 啟動命令: ollama serve');
    return;
  }
  
  const results = [];
  
  // 測試每個模型
  for (let i = 0; i < AVAILABLE_MODELS.length; i++) {
    const modelName = AVAILABLE_MODELS[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 測試 ${i + 1}/${AVAILABLE_MODELS.length}: ${modelName}`);
    
    // 選擇一個測試問題
    const question = testQuestions[0]; // 使用第一個問題進行測試
    const result = await testOllamaModel(modelName, question);
    results.push(result);
    
    // 避免過度負載，在測試之間稍作延遲
    if (i < AVAILABLE_MODELS.length - 1) {
      console.log('⏳ 等待 3 秒後進行下一個測試...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // 測試結果總結
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 測試結果總結');
  console.log(`${'='.repeat(60)}`);
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  console.log(`✅ 成功測試: ${successfulTests.length}/${results.length}`);
  console.log(`❌ 失敗測試: ${failedTests.length}/${results.length}`);
  
  if (successfulTests.length > 0) {
    console.log('\n🎉 成功的模型:');
    successfulTests.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.model}`);
      console.log(`      ⏱️  回應時間: ${result.responseTime}ms`);
      console.log(`      🎨 表情符號: ${result.hasEmojis ? '✅' : '❌'}`);
      console.log(`      📋 結構化: ${result.hasStructure ? '✅' : '❌'}`);
      console.log(`      🗺️ 旅遊內容: ${result.hasTravelContent ? '✅' : '❌'}`);
      console.log(`      🇹🇼 繁體中文: ${result.hasChinese ? '✅' : '❌'}`);
    });
    
    // 推薦最佳模型
    const bestModel = successfulTests.find(m => m.hasTravelContent && m.hasChinese && m.hasStructure) || successfulTests[0];
    console.log(`\n🏆 最佳推薦: ${bestModel.model}`);
    console.log(`💡 建議在 .env 文件中設置:`);
    console.log(`   VITE_OLLAMA_MODEL=${bestModel.model}`);
    
    // 測試旅遊問題
    console.log(`\n🗺️  測試旅遊問題回應:`);
    const travelQuestion = "推薦台北週末兩日遊的景點和美食";
    console.log(`📝 問題: ${travelQuestion}`);
    
    const travelResult = await testOllamaModel(bestModel.model, travelQuestion);
    if (travelResult.success) {
      console.log(`✅ 旅遊問題回應成功`);
      console.log(`📝 回應: ${travelResult.response.substring(0, 200)}...`);
    }
    
  } else {
    console.log('\n❌ 所有模型測試失敗');
  }
  
  if (failedTests.length > 0) {
    console.log(`\n❌ 失敗原因:`);
    failedTests.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.model}: ${result.error}`);
    });
  }
  
  console.log(`\n${'='.repeat(60)}`);
  
  if (successfulTests.length === results.length) {
    console.log('🎉 所有測試通過！本地 Ollama 模型功能正常！');
  } else if (successfulTests.length > 0) {
    console.log('⚠️  部分測試通過，本地 AI 功能基本正常！');
  } else {
    console.log('❌ 所有測試失敗，請檢查 Ollama 服務狀態。');
  }
  
  console.log(`\n💡 建議:`);
  if (successfulTests.length === 0) {
    console.log('   1. 檢查 Ollama 服務是否正常運行');
    console.log('   2. 確認模型是否已正確下載');
    console.log('   3. 檢查網路連接');
  } else if (successfulTests.length < results.length) {
    console.log('   1. 使用成功的模型進行旅遊顧問功能');
    console.log('   2. 檢查失敗模型的狀態');
    console.log('   3. 可以部署到生產環境');
  } else {
    console.log('   1. 功能完全正常，可以開始使用');
    console.log('   2. 考慮使用更大的模型獲得更好性能');
    console.log('   3. 可以部署到生產環境');
  }
}

// 運行測試
runOllamaTests().catch(console.error);
