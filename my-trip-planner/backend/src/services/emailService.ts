import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 創建郵件傳輸器
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD // 使用應用程式密碼
    }
  });
};

// 發送旅行提醒郵件
export const sendTripReminder = async (trip: any, reminderType: string) => {
  try {
    const transporter = createTransporter();
    
    let subject = '';
    let content = '';
    
    switch (reminderType) {
      case 'start':
        subject = `🔔 旅行提醒：${trip.title} 即將開始！`;
        content = `
          <h2>🎉 您的旅行即將開始！</h2>
          <p><strong>旅行名稱：</strong>${trip.title}</p>
          <p><strong>目的地：</strong>${trip.destination}</p>
          <p><strong>開始日期：</strong>${new Date(trip.startDate).toLocaleDateString('zh-TW')}</p>
          <p><strong>結束日期：</strong>${new Date(trip.endDate).toLocaleDateString('zh-TW')}</p>
          <p><strong>預算：</strong>${trip.budget.total} ${trip.budget.currency}</p>
          ${trip.description ? `<p><strong>描述：</strong>${trip.description}</p>` : ''}
          
          <h3>📍 行程地點：</h3>
          ${trip.mapTripData && trip.mapTripData.points ? 
            `<ul>${trip.mapTripData.points.map((point: any) => 
              `<li>${point.name} - ${point.address}</li>`
            ).join('')}</ul>` : 
            '<p>無特定行程地點</p>'
          }
          
          <p>祝您旅途愉快！🎒✈️</p>
        `;
        break;
        
      case 'end':
        subject = `⏰ 旅行提醒：${trip.title} 即將結束！`;
        content = `
          <h2>⏰ 您的旅行即將結束</h2>
          <p><strong>旅行名稱：</strong>${trip.title}</p>
          <p><strong>結束日期：</strong>${new Date(trip.endDate).toLocaleDateString('zh-TW')}</p>
          <p>記得整理行李，準備回家囉！</p>
          <p>祝您平安歸來！🏠</p>
        `;
        break;
        
      case 'custom':
        subject = `🔔 自訂提醒：${trip.title}`;
        content = `
          <h2>🔔 旅行提醒</h2>
          <p><strong>旅行名稱：</strong>${trip.title}</p>
          <p><strong>提醒時間：</strong>${new Date(trip.notificationSettings.reminderTime).toLocaleString('zh-TW')}</p>
          <p>這是您設定的自訂提醒！</p>
        `;
        break;
    }
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: trip.notificationSettings.email,
      subject: subject,
      html: content
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ 郵件發送成功: ${trip.notificationSettings.email}`);
    console.log(`📧 郵件ID: ${result.messageId}`);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ 郵件發送失敗:', error);
    return { success: false, error: error };
  }
};

// 測試郵件服務
export const testEmailService = async () => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // 發送給自己測試
      subject: '🧪 郵件服務測試',
      html: '<h2>郵件服務測試</h2><p>如果您收到這封郵件，表示郵件服務設定成功！</p>'
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ 郵件服務測試成功');
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ 郵件服務測試失敗:', error);
    return { success: false, error: error };
  }
};
