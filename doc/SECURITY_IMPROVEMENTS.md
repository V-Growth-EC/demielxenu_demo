# 付款系統安全性改進建議

## 🔒 當前安全狀況分析

### ✅ 已實施的安全措施
- VPC 私有網路隔離
- HTTPS 加密傳輸
- 環境變數管理敏感資訊
- SSL/TLS 憑證保護

### ⚠️ 需要改進的安全風險

## 1. API 身份驗證與授權

### 問題
- Lambda API Gateway 端點完全公開
- 缺乏 API 調用身份驗證
- 任何人都可以查詢訂單狀態

### 解決方案

#### 1.1 JWT Token 驗證
```javascript
// middleware/auth.js
import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```

#### 1.2 API Key 驗證
```javascript
// middleware/apiKey.js
export function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
}
```

#### 1.3 Lambda 函數更新
```javascript
// lambda/order-crud/index.js
exports.handler = async (event) => {
  // 驗證 API Key
  const apiKey = event.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }
  
  // 繼續處理請求...
};
```

## 2. 輸入驗證與清理

### 問題
- 缺乏輸入資料驗證
- 可能導致 SQL 注入或 XSS 攻擊
- 沒有資料格式檢查

### 解決方案

#### 2.1 輸入驗證中間件
```javascript
// middleware/validation.js
import Joi from 'joi';

const orderSchema = Joi.object({
  order_number: Joi.string().pattern(/^\d{13}$/).required(),
  contract_code: Joi.string().pattern(/^\d{8}$/).required(),
  customer_id: Joi.number().integer().positive().required()
});

export function validateOrder(req, res, next) {
  const { error } = orderSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      error: 'Invalid input data',
      details: error.details 
    });
  }
  
  next();
}
```

#### 2.2 SQL 查詢參數化
```javascript
// lambda/order-crud/index.js
// 使用參數化查詢防止 SQL 注入
const query = 'SELECT * FROM orders WHERE order_id = $1';
const result = await pool.query(query, [orderId]);
```

## 3. 敏感資料保護

### 問題
- Console 日誌可能洩露敏感資訊
- 客戶資料可能被記錄
- 缺乏資料脫敏機制

### 解決方案

#### 3.1 敏感資料脫敏
```javascript
// utils/dataMasking.js
export function maskSensitiveData(data) {
  const masked = { ...data };
  
  // 遮罩信用卡號
  if (masked.cardNumber) {
    masked.cardNumber = masked.cardNumber.replace(/\d(?=\d{4})/g, '*');
  }
  
  // 遮罩郵箱
  if (masked.email) {
    const [name, domain] = masked.email.split('@');
    masked.email = `${name.substring(0, 2)}***@${domain}`;
  }
  
  // 遮罩電話
  if (masked.phone) {
    masked.phone = masked.phone.replace(/\d(?=\d{4})/g, '*');
  }
  
  return masked;
}
```

#### 3.2 安全日誌記錄
```javascript
// utils/secureLogger.js
import { maskSensitiveData } from './dataMasking.js';

export function secureLog(level, message, data = {}) {
  const maskedData = maskSensitiveData(data);
  
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    data: maskedData
  }));
}
```

## 4. 速率限制與 DDoS 防護

### 問題
- 缺乏 API 調用頻率限制
- 可能遭受 DDoS 攻擊
- 沒有請求節流機制

### 解決方案

#### 4.1 API Gateway 速率限制
```yaml
# serverless.yml
functions:
  orderCrud:
    handler: index.handler
    events:
      - http:
          path: orders/{proxy+}
          method: ANY
          throttling:
            burstLimit: 100
            rateLimit: 50
```

#### 4.2 應用層速率限制
```javascript
// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 10, // 每個 IP 最多 10 次請求
  message: 'Too many payment requests, please try again later'
});
```

## 5. 資料庫安全

### 問題
- 資料庫連接字串可能洩露
- 缺乏資料庫存取日誌
- 沒有資料備份加密

### 解決方案

#### 5.1 資料庫連接加密
```javascript
// lambda/order-crud/index.js
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CERT
  }
});
```

#### 5.2 資料庫存取審計
```sql
-- 啟用 PostgreSQL 審計日誌
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 0;
SELECT pg_reload_conf();
```

## 6. GMO API 安全

### 問題
- GMO API 金鑰可能洩露
- 缺乏 API 調用驗證
- 沒有錯誤處理安全機制

### 解決方案

#### 6.1 API 金鑰輪換
```javascript
// utils/apiKeyRotation.js
export function getCurrentApiKey() {
  const now = new Date();
  const hour = now.getHours();
  
  // 每小時輪換 API 金鑰
  return process.env[`GMO_API_KEY_${hour % 24}`];
}
```

#### 6.2 API 調用簽名
```javascript
// utils/apiSignature.js
import crypto from 'crypto';

export function generateSignature(params, secret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return crypto
    .createHmac('sha256', secret)
    .update(sortedParams)
    .digest('hex');
}
```

## 7. 監控與告警

### 問題
- 缺乏安全事件監控
- 沒有異常行為檢測
- 缺乏即時告警機制

### 解決方案

#### 7.1 CloudWatch 監控
```javascript
// utils/monitoring.js
import AWS from 'aws-sdk';

const cloudwatch = new AWS.CloudWatch();

export async function logSecurityEvent(eventType, details) {
  await cloudwatch.putMetricData({
    Namespace: 'PaymentSystem/Security',
    MetricData: [{
      MetricName: eventType,
      Value: 1,
      Unit: 'Count',
      Dimensions: [{
        Name: 'Environment',
        Value: process.env.NODE_ENV
      }]
    }]
  }).promise();
}
```

#### 7.2 異常檢測
```javascript
// utils/anomalyDetection.js
export function detectAnomalies(requestData) {
  const anomalies = [];
  
  // 檢測異常 IP
  if (isSuspiciousIP(requestData.ip)) {
    anomalies.push('Suspicious IP address');
  }
  
  // 檢測異常請求頻率
  if (isHighFrequency(requestData.timestamp)) {
    anomalies.push('High frequency requests');
  }
  
  // 檢測異常資料模式
  if (hasSuspiciousPattern(requestData.data)) {
    anomalies.push('Suspicious data pattern');
  }
  
  return anomalies;
}
```

## 8. 合規性與隱私保護

### 問題
- 缺乏 GDPR/個資法合規
- 沒有資料保留政策
- 缺乏用戶同意機制

### 解決方案

#### 8.1 資料保留政策
```javascript
// utils/dataRetention.js
export async function cleanupExpiredData() {
  const retentionDays = 365; // 保留 1 年
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  await pool.query(
    'DELETE FROM orders WHERE created_at < $1',
    [cutoffDate]
  );
}
```

#### 8.2 用戶同意管理
```javascript
// middleware/consent.js
export function checkConsent(req, res, next) {
  const consent = req.headers['x-user-consent'];
  
  if (!consent || consent !== 'accepted') {
    return res.status(403).json({ 
      error: 'User consent required' 
    });
  }
  
  next();
}
```

## 9. 實施優先級

### 🔴 高優先級（立即實施）
1. API 身份驗證
2. 輸入驗證
3. 敏感資料脫敏
4. 速率限制

### 🟡 中優先級（1-2 週內）
1. 資料庫安全加固
2. 監控告警系統
3. API 簽名驗證
4. 異常檢測

### 🟢 低優先級（1 個月內）
1. 合規性改進
2. 資料保留政策
3. 進階監控
4. 安全審計

## 10. 安全檢查清單

### 部署前檢查
- [ ] 所有 API 端點都有身份驗證
- [ ] 輸入資料都有驗證
- [ ] 敏感資料已脫敏
- [ ] 速率限制已配置
- [ ] SSL 憑證有效
- [ ] 環境變數安全
- [ ] 資料庫連接加密
- [ ] 監控告警正常

### 定期檢查
- [ ] 安全日誌審查
- [ ] 異常行為分析
- [ ] 憑證到期檢查
- [ ] 依賴套件更新
- [ ] 滲透測試
- [ ] 備份恢復測試

---

**文件版本**: 1.0  
**建立日期**: 2025年10月25日  
**安全等級**: 中等（需要改進）  
**建議實施時間**: 2-4 週
