// 測試新的 Hugging Face API Key
import fetch from 'node-fetch';

// 請在這裡填入您的新 API Key
const NEW_API_KEY = 'YOUR_NEW_API_KEY_HERE'; // 請替換為您的新 API Key

async function testNewAPIKey() {
  if (NEW_API_KEY === 'YOUR_NEW_API_KEY_HERE') {
    console.log('❌ 請先在腳本中填入您的新 API Key');
    console.log('💡 步驟:');
    console.log('   1. 編輯 test-new-api-key.js 文件');
    console.log('   2. 將 YOUR_NEW_API_KEY_HERE 替換為您的新 API Key');
    console.log('   3. 重新運行腳本');
    return;
  }

  console.log('🚀 測試新的 API Key...');
  console.log(`🔑 API Key: ${NEW_API_KEY.substring(0, 10)}...\n`);

  try {
    // 測試 1: 檢查 API Key 狀態
    console.log('🔍 測試 1: 檢查 API Key 狀態');
    const userResponse = await fetch('https://huggingface.co/api/whoami', {
      headers: {
        'Authorization': `Bearer ${NEW_API_KEY}`,
      },
      timeout: 10000,
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log(`✅ API Key 有效`);
      console.log(`👤 用戶: ${userData.name || '未知'}`);
      console.log(`📧 郵箱: ${userData.email || '未知'}`);
      console.log(`🔓 權限: ${userData.pro ? 'Pro' : 'Free'}`);
    } else {
      console.log(`❌ API Key 仍然無效 (${userResponse.status})`);
      return;
    }

    // 測試 2: 檢查簡單模型
    console.log('\n🔍 測試 2: 檢查簡單模型');
    const modelResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${NEW_API_KEY}`,
      },
      timeout: 10000,
    });

    if (modelResponse.ok) {
      console.log('✅ 可以訪問 gpt2 模型');
    } else {
      console.log(`❌ 無法訪問 gpt2 模型 (${modelResponse.status})`);
      return;
    }

    // 測試 3: 測試簡單推理
    console.log('\n🔍 測試 3: 測試簡單推理');
    const inferenceResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'Hello, how are you?',
        parameters: {
          max_new_tokens: 20,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false,
        }
      }),
      timeout: 30000,
    });

    if (inferenceResponse.ok) {
      const data = await inferenceResponse.json();
      if (data && data[0] && data[0].generated_text) {
        console.log('✅ 推理測試成功');
        console.log(`📝 回應: ${data[0].generated_text}`);
      } else {
        console.log('⚠️  推理回應格式異常');
        console.log('📝 原始回應:', JSON.stringify(data, null, 2));
      }
    } else {
      console.log(`❌ 推理測試失敗 (${inferenceResponse.status})`);
      const errorText = await inferenceResponse.text();
      console.log(`📝 錯誤詳情: ${errorText}`);
      return;
    }

    // 測試 4: 檢查 Qwen 模型
    console.log('\n🔍 測試 4: 檢查 Qwen 模型');
    const qwenModels = [
      'Qwen/Qwen2.5-7B-Instruct',
      'Qwen/Qwen2-7B-Instruct',
      'Qwen/Qwen-7B-Chat'
    ];

    for (const model of qwenModels) {
      try {
        const qwenResponse = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${NEW_API_KEY}`,
          },
          timeout: 10000,
        });

        if (qwenResponse.ok) {
          console.log(`✅ 可以訪問: ${model}`);
          
          // 如果 Qwen 模型可用，測試推理
          console.log(`🧪 測試 Qwen 推理: ${model}`);
          const qwenInferenceResponse = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${NEW_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: '你好，請簡單介紹一下自己',
              parameters: {
                max_new_tokens: 100,
                temperature: 0.7,
                do_sample: true,
                return_full_text: false,
              }
            }),
            timeout: 60000,
          });

          if (qwenInferenceResponse.ok) {
            const qwenData = await qwenInferenceResponse.json();
            if (qwenData && qwenData[0] && qwenData[0].generated_text) {
              console.log(`✅ Qwen 推理成功`);
              console.log(`📝 回應: ${qwenData[0].generated_text.substring(0, 100)}...`);
              
              // 測試旅遊問題
              console.log(`🗺️  測試旅遊問題: ${model}`);
              const travelResponse = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${NEW_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  inputs: '我想去日本東京旅遊5天，請幫我規劃',
                  parameters: {
                    max_new_tokens: 200,
                    temperature: 0.7,
                    do_sample: true,
                    return_full_text: false,
                  }
                }),
                timeout: 60000,
              });

              if (travelResponse.ok) {
                const travelData = await travelResponse.json();
                if (travelData && travelData[0] && travelData[0].generated_text) {
                  console.log(`✅ 旅遊問題回應成功`);
                  console.log(`📝 回應: ${travelData[0].generated_text.substring(0, 150)}...`);
                }
              }
              
              break; // 找到可用的 Qwen 模型，停止檢查
            }
          }
        } else {
          console.log(`❌ 無法訪問: ${model} (${qwenResponse.status})`);
        }
      } catch (error) {
        console.log(`❌ 檢查失敗: ${model} - ${error.message}`);
      }
      
      // 避免 API 限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 所有測試完成！');
    
  } catch (error) {
    console.log(`❌ 測試過程中發生錯誤: ${error.message}`);
  }
}

// 運行測試
testNewAPIKey();
