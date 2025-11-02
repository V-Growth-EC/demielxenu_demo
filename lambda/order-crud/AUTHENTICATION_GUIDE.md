# Lambda 身份認證配置指南

## 🔐 身份認證功能概述

本 Lambda 函數已實現以下安全功能：

### ✅ 已實施的安全措施
- **API Key 驗證**: 所有請求必須包含有效的 API Key
- **來源驗證**: 可配置允許的請求來源
- **速率限制**: API Gateway 層面的請求頻率限制
- **安全日誌**: 記錄所有認證失敗和可疑活動
- **CORS 配置**: 可配置的跨域請求控制

## 🚀 快速開始

### 1. 生成 API Key

```bash
# 生成隨機 API Key
node generate-api-key.js generate

# 生成帶前綴的 API Key
node generate-api-key.js generate-prefixed ak 32

# 驗證 API Key 格式
node generate-api-key.js validate your-api-key-here
```

### 2. 配置環境變數

更新 `env-vars.json` 和 `env-vars-ec.json` 文件：

```json
{
  "Variables": {
    "DATABASE_URL": "your-database-url",
    "NODE_ENV": "production",
    "API_KEY": "your-generated-api-key-here",
    "ALLOWED_ORIGINS": "https://yourdomain.com,https://www.yourdomain.com"
  }
}
```

### 3. 部署 Lambda 函數

```bash
# 使用 serverless 部署
serverless deploy

# 或使用自定義部署腳本
./deploy.sh
```

## 📋 API 使用方式

### 請求頭配置

所有 API 請求必須包含以下頭部：

```http
X-Api-Key: your-api-key-here
Content-Type: application/json
```

### 範例請求

```bash
# 創建訂單
curl -X POST https://your-api-gateway-url/orders \
  -H "X-Api-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 123,
    "order_data": {
      "items": [{"id": 1, "quantity": 2}],
      "total": 100.00
    }
  }'

# 查詢訂單
curl -X GET "https://your-api-gateway-url/orders?customer_id=123" \
  -H "X-Api-Key: your-api-key-here"
```

## 🔧 配置選項

### 環境變數說明

| 變數名 | 說明 | 範例值 |
|--------|------|--------|
| `API_KEY` | API 認證金鑰 | `ak_1234567890abcdef...` |
| `ALLOWED_ORIGINS` | 允許的請求來源 | `https://yourdomain.com,https://www.yourdomain.com` |
| `DATABASE_URL` | 資料庫連接字串 | `postgresql://user:pass@host:port/db` |
| `NODE_ENV` | 運行環境 | `production` |

### 速率限制配置

在 `serverless.yml` 中配置：

```yaml
events:
  - http:
      path: orders
      method: ANY
      throttling:
        burstLimit: 100    # 突發請求限制
        rateLimit: 50      # 每秒請求限制
```

## 🛡️ 安全最佳實踐

### 1. API Key 管理
- 使用強隨機生成的 API Key（至少 32 字符）
- 定期輪換 API Key
- 不要在代碼中硬編碼 API Key
- 使用環境變數或 AWS Secrets Manager

### 2. 來源控制
- 明確指定允許的來源域名
- 避免使用通配符 `*` 在生產環境
- 定期審查允許的來源列表

### 3. 監控與日誌
- 監控認證失敗的請求
- 設置異常活動告警
- 定期審查訪問日誌

### 4. 錯誤處理
- 不洩露敏感資訊在錯誤訊息中
- 記錄安全事件但不記錄敏感資料
- 使用標準化的錯誤代碼

## 🚨 故障排除

### 常見錯誤

#### 401 Unauthorized
```
{
  "error": "Unauthorized",
  "message": "API Key is required",
  "code": "MISSING_API_KEY"
}
```
**解決方案**: 檢查請求頭是否包含 `X-Api-Key`

#### 403 Forbidden
```
{
  "error": "Forbidden",
  "message": "Invalid API Key",
  "code": "INVALID_API_KEY"
}
```
**解決方案**: 檢查 API Key 是否正確且有效

#### 403 Origin Not Allowed
```
{
  "error": "Forbidden",
  "message": "Origin not allowed",
  "code": "UNAUTHORIZED_ORIGIN"
}
```
**解決方案**: 檢查 `ALLOWED_ORIGINS` 環境變數配置

### 調試模式

啟用詳細日誌：

```bash
# 設置環境變數
export DEBUG=true
export LOG_LEVEL=debug

# 重新部署
serverless deploy
```

## 📊 監控指標

### CloudWatch 指標
- `4XXError`: 客戶端錯誤（認證失敗等）
- `5XXError`: 服務器錯誤
- `Duration`: 請求處理時間
- `ThrottleCount`: 速率限制觸發次數

### 自定義指標
- 認證失敗次數
- 異常來源請求
- API Key 使用統計

## 🔄 更新與維護

### 定期任務
1. **每週**: 檢查認證失敗日誌
2. **每月**: 審查允許的來源列表
3. **每季**: 輪換 API Key
4. **每年**: 安全審計和滲透測試

### 版本更新
```bash
# 更新依賴
npm update

# 重新部署
serverless deploy

# 測試新版本
npm test
```

## 📞 支援

如有問題，請檢查：
1. 環境變數配置是否正確
2. API Key 是否有效
3. 網路連接是否正常
4. CloudWatch 日誌中的錯誤訊息

---

**文件版本**: 1.0  
**最後更新**: 2025年10月25日  
**安全等級**: 高（已實施身份認證）
