import gradio as gr
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import json
import re

# 配置
MODEL_NAME = "Qwen/Qwen2.5-7B-Instruct"  # 免費使用
MAX_LENGTH = 4096
TEMPERATURE = 0.7

# 旅遊系統提示詞
TRAVEL_SYSTEM_PROMPT = """你是一位專業的AI旅遊顧問，專門為用戶提供旅遊規劃建議。

請用繁體中文回答，提供實用、具體的建議。回答要結構化，使用表情符號和項目符號讓內容更易讀。

**重要：** 當用戶詢問旅遊規劃時，請提供完整、詳細的回答，包括：
- 完整的行程安排（時間、地點、活動）
- 具體的交通建議和費用
- 實用的旅遊小貼士
- 預算分配建議
- 季節性注意事項

不要因為字數限制而截斷回答，確保提供完整的旅遊建議。

如果用戶的問題超出旅遊範圍，請禮貌地引導回旅遊相關話題。"""

class TravelAIConsultant:
    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.is_loaded = False
        
    def load_model(self):
        """載入模型（延遲載入以節省資源）"""
        if not self.is_loaded:
            try:
                print("🔄 正在載入 Qwen 模型...")
                self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
                self.model = AutoModelForCausalLM.from_pretrained(
                    MODEL_NAME,
                    torch_dtype=torch.float16,
                    device_map="auto",
                    trust_remote_code=True
                )
                self.is_loaded = True
                print("✅ 模型載入完成！")
            except Exception as e:
                print(f"❌ 模型載入失敗: {e}")
                return False
        return True
    
    def build_prompt(self, user_input, conversation_history=None):
        """構建完整的提示詞"""
        if conversation_history:
            # 有對話歷史的情況
            history_text = "\n".join([
                f"{'用戶' if msg['role'] == 'user' else 'AI旅遊顧問'}: {msg['content']}"
                for msg in conversation_history[-5:]  # 只保留最近5條對話
            ])
            prompt = f"{TRAVEL_SYSTEM_PROMPT}\n\n對話歷史:\n{history_text}\n\n用戶: {user_input}\n\nAI旅遊顧問:"
        else:
            # 新對話
            prompt = f"{TRAVEL_SYSTEM_PROMPT}\n\n用戶: {user_input}\n\nAI旅遊顧問:"
        
        return prompt
    
    def generate_response(self, user_input, conversation_history=None):
        """生成AI回應"""
        if not self.load_model():
            return "❌ 抱歉，模型載入失敗，請稍後再試。"
        
        try:
            # 構建提示詞
            prompt = self.build_prompt(user_input, conversation_history)
            
            # 生成回應
            inputs = self.tokenizer(prompt, return_tensors="pt", max_length=MAX_LENGTH, truncation=True)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=2048,
                    temperature=TEMPERATURE,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id
                )
            
            # 解碼回應
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # 提取AI回應部分
            ai_response = response.split("AI旅遊顧問:")[-1].strip()
            
            # 清理回應
            ai_response = re.sub(r'用戶:.*', '', ai_response).strip()
            
            return ai_response if ai_response else "抱歉，我沒有生成有效的回應，請重新提問。"
            
        except Exception as e:
            print(f"❌ 生成回應時發生錯誤: {e}")
            return f"❌ 抱歉，生成回應時發生錯誤: {str(e)}"

# 創建AI顧問實例
ai_consultant = TravelAIConsultant()

# 對話歷史存儲
conversation_history = []

def chat_with_ai(user_input, history):
    """與AI對話的函數"""
    global conversation_history
    
    # 更新對話歷史
    conversation_history.append({"role": "user", "content": user_input})
    
    # 生成AI回應
    ai_response = ai_consultant.generate_response(user_input, conversation_history)
    
    # 更新對話歷史
    conversation_history.append({"role": "assistant", "content": ai_response})
    
    # 限制對話歷史長度（避免過長）
    if len(conversation_history) > 20:
        conversation_history = conversation_history[-20:]
    
    # 返回對話歷史
    history.append((user_input, ai_response))
    return "", history

def clear_history():
    """清空對話歷史"""
    global conversation_history
    conversation_history.clear()
    return []

# 創建 Gradio 界面
with gr.Blocks(
    title="AI 旅遊顧問 - 免費版",
    theme=gr.themes.Soft(),
    css="""
    .gradio-container {
        max-width: 1200px !important;
        margin: 0 auto !important;
    }
    .chat-container {
        height: 600px;
        overflow-y: auto;
    }
    """
) as demo:
    
    gr.Markdown("""
    # 🌍 AI 旅遊顧問 - 免費版
    
    **完全免費的AI旅遊規劃助手，基於 Qwen 2.5 模型**
    
    ---
    
    ### 💡 我可以幫助您：
    - 🗺️ 規劃旅遊路線和行程安排
    - 💰 提供預算管理和節省建議
    - 🏛️ 推薦熱門景點和隱藏美食
    - ⏰ 優化行程時間安排
    - 🏨 酒店和交通建議
    - 🌍 目的地文化和注意事項
    - 📱 實用的旅遊小貼士
    
    ---
    
    ### 🚀 快速開始：
    您可以這樣問我：
    - "我想去日本東京旅遊5天，預算3萬台幣，請幫我規劃"
    - "推薦台北週末兩日遊的景點和美食"
    - "如何規劃歐洲背包旅行？"
    - "去泰國旅遊需要注意什麼？"
    """)
    
    with gr.Row():
        with gr.Column(scale=3):
            # 聊天界面
            chatbot = gr.Chatbot(
                label="AI 旅遊顧問對話",
                height=500,
                show_label=True,
                container=True,
                elem_classes=["chat-container"]
            )
            
            with gr.Row():
                with gr.Column(scale=4):
                    user_input = gr.Textbox(
                        label="輸入您的旅遊問題",
                        placeholder="例如：我想去日本旅遊，請幫我規劃...",
                        lines=2
                    )
                
                with gr.Column(scale=1):
                    send_btn = gr.Button("🚀 發送", variant="primary", size="lg")
                    clear_btn = gr.Button("🗑️ 清空", variant="secondary")
            
            # 示例問題
            gr.Examples(
                examples=[
                    "我想去日本東京旅遊5天，預算3萬台幣，請幫我規劃",
                    "推薦台北週末兩日遊的景點和美食",
                    "如何規劃歐洲背包旅行？",
                    "去泰國旅遊需要注意什麼？",
                    "台灣環島旅遊建議，要有詳細的行程安排",
                    "歐洲旅遊預算規劃，包含交通和住宿"
                ],
                inputs=user_input,
                label="💡 點擊快速提問"
            )
        
        with gr.Column(scale=1):
            # 右側信息面板
            gr.Markdown("""
            ### 📊 模型信息
            - **模型**: Qwen 2.5 7B Instruct
            - **語言**: 繁體中文
            - **專業**: 旅遊規劃
            - **費用**: 完全免費
            
            ---
            
            ### 🔧 使用技巧
            1. **具體描述**: 提供詳細的旅遊需求
            2. **預算範圍**: 說明您的預算限制
            3. **時間安排**: 告知旅遊天數和時間
            4. **興趣偏好**: 說明您喜歡的活動類型
            
            ---
            
            ### ⚠️ 注意事項
            - 首次載入模型需要一些時間
            - 複雜問題可能需要等待幾秒鐘
            - 建議一次提問一個主題
            - 如需詳細規劃，可以分段提問
            """)
    
    # 事件處理
    send_btn.click(
        fn=chat_with_ai,
        inputs=[user_input, chatbot],
        outputs=[user_input, chatbot]
    )
    
    user_input.submit(
        fn=chat_with_ai,
        inputs=[user_input, chatbot],
        outputs=[user_input, chatbot]
    )
    
    clear_btn.click(
        fn=clear_history,
        outputs=[chatbot]
    )
    
    # 頁面載入時的歡迎訊息
    demo.load(lambda: [("AI旅遊顧問", "🎉 歡迎使用 AI 旅遊顧問！我是您的專屬旅遊規劃助手 🤖\n\n💡 **我可以幫助您：**\n• 🗺️ 規劃旅遊路線和行程安排\n• 💰 提供預算管理和節省建議\n• 🏛️ 推薦熱門景點和隱藏美食\n• ⏰ 優化行程時間安排\n• 🏨 酒店和交通建議\n• 🌍 目的地文化和注意事項\n• 📱 實用的旅遊小貼士\n\n🚀 **快速開始：**\n您可以這樣問我：\n• "我想去日本東京旅遊5天，預算3萬台幣，請幫我規劃"\n• "推薦台北週末兩日遊的景點和美食"\n• "如何規劃歐洲背包旅行？"\n• "去泰國旅遊需要注意什麼？"\n\n💬 請告訴我您的旅遊需求，我會為您量身定制專業建議！")], outputs=[chatbot])

# 啟動應用
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )
