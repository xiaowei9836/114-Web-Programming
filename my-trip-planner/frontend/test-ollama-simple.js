// 簡化的 Ollama 測試腳本
import fetch from 'node-fetch';

const OLLAMA_BASE_URL = 'http://localhost:11434';

// 測試 Ollama 連接
async function testOllamaConnection() {
  try {
    console.log('🔍 測試 Ollama 連接...');
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      timeout: 30000, // 30秒超時
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ollama 連接成功');
      console.log(`📋 可用模型: ${data.models.map(m => m.name).join(', ')}`);
      return true;
    } else {
      console.log(`❌ 連接失敗 (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 連接錯誤: ${error.message}`);
    return false;
  }
}

// 測試簡單的模型回應
async function testSimpleResponse() {
  try {
    console.log('\n🧪 測試簡單回應...');
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-oss:20b',
        prompt: '你好，請簡單介紹一下自己',
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 100,
        }
      }),
      timeout: 60000, // 60秒超時
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.response) {
        console.log('✅ 簡單回應測試成功');
        console.log(`📝 回應: ${data.response}`);
        return true;
      } else {
        console.log('⚠️  回應格式異常');
        console.log('📝 原始回應:', JSON.stringify(data, null, 2));
        return false;
      }
    } else {
      console.log(`❌ 回應測試失敗 (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 回應測試錯誤: ${error.message}`);
    return false;
  }
}

// 測試旅遊問題
async function testTravelQuestion() {
  try {
    console.log('\n🗺️  測試旅遊問題...');
    
    const prompt = `你是一位專業的AI旅遊顧問。請用繁體中文回答以下問題：

用戶: 推薦台北週末兩日遊的景點和美食

助手:`;
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-oss:20b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500,
        }
      }),
      timeout: 120000, // 2分鐘超時
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.response) {
        console.log('✅ 旅遊問題測試成功');
        console.log(`📝 回應: ${data.response}`);
        
        // 檢查回應質量
        const hasChinese = /[\u4e00-\u9fff]/.test(data.response);
        const hasTravelContent = /旅遊|行程|景點|交通|住宿|預算|建議/.test(data.response);
        
        console.log(`\n📊 回應質量分析:`);
        console.log(`   🇹🇼 繁體中文: ${hasChinese ? '✅' : '❌'}`);
        console.log(`   🗺️ 旅遊內容: ${hasTravelContent ? '✅' : '❌'}`);
        
        return true;
      } else {
        console.log('⚠️  旅遊問題回應格式異常');
        return false;
      }
    } else {
      console.log(`❌ 旅遊問題測試失敗 (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 旅遊問題測試錯誤: ${error.message}`);
    return false;
  }
}

// 主函數
async function main() {
  console.log('🚀 開始測試 Ollama 本地模型...\n');
  
  // 測試連接
  const connectionOk = await testOllamaConnection();
  if (!connectionOk) {
    console.log('\n❌ 無法連接到 Ollama，測試終止');
    return;
  }
  
  // 測試簡單回應
  const simpleOk = await testSimpleResponse();
  
  // 測試旅遊問題
  const travelOk = await testTravelQuestion();
  
  // 結果總結
  console.log('\n' + '='.repeat(60));
  console.log('📊 測試結果總結');
  console.log('='.repeat(60));
  
  console.log(`🔗 連接測試: ${connectionOk ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`🧪 簡單回應: ${simpleOk ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`🗺️ 旅遊問題: ${travelOk ? '✅ 成功' : '❌ 失敗'}`);
  
  if (connectionOk && simpleOk && travelOk) {
    console.log('\n🎉 所有測試通過！Ollama 旅遊顧問功能正常！');
    console.log('\n💡 建議:');
    console.log('   1. 更新 .env 文件使用 Ollama 模型');
    console.log('   2. 啟動應用測試完整功能');
    console.log('   3. 可以部署到生產環境');
  } else if (connectionOk && simpleOk) {
    console.log('\n⚠️  基本功能正常，旅遊問題需要調整');
    console.log('\n💡 建議:');
    console.log('   1. 檢查提示詞格式');
    console.log('   2. 調整模型參數');
    console.log('   3. 嘗試不同的模型');
  } else {
    console.log('\n❌ 測試失敗，需要進一步檢查');
  }
}

// 運行測試
main().catch(console.error);
