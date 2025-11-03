# 付款系統整合更新報告

**更新日期：2025年10月25日**

## 概述

本次更新完成了 GMO LinkPay 付款系統與 AWS Lambda 後端服務的完整整合，實現了從付款處理到訂單狀態更新的全自動化流程。

## 主要功能實現

### 1. AWS Lambda 訂單管理系統

#### 1.1 Lambda 函數架構
- **函數名稱**: `order-crud-function`
- **API Gateway URL**: `https://sehin2d3nc.execute-api.us-east-1.amazonaws.com/prod`
- **支援操作**: CREATE, READ, UPDATE, DELETE (CRUD)

#### 1.2 資料庫結構
```sql
-- Orders 表格
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_info_id VARCHAR(255),
    customer_id INTEGER,
    order_status VARCHAR(50),
    order_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers 表格
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.3 Lambda 函數端點
- `POST /orders` - 創建新訂單
- `GET /orders` - 獲取所有訂單
- `GET /orders/{id}` - 獲取特定訂單
- `PUT /orders/{id}` - 更新訂單狀態
- `DELETE /orders/{id}` - 刪除訂單

### 2. GMO LinkPay 付款整合

#### 2.1 付款處理流程
1. **前端發起付款** (`/cart/payment`)
   - 生成唯一 `orderId` (使用 `Date.now()`)
   - 收集客戶資訊和商品資料
   - 調用 `/api/gmo-linkpay` API

2. **GMO API 調用** (`/api/gmo-linkpay`)
   - 發送付款請求到 GMO Epsilon
   - 解析 GMO XML 回應
   - 提取重定向 URL
   - 保存訂單到資料庫

3. **付款重定向**
   - GMO 重定向到 `https://www3.edu-cart.jp/shop/utransctionback`
   - 中間頁面捕獲 GMO 參數
   - 重定向到 `/cart/complete` 完成頁面

#### 2.2 GMO API 參數配置
```javascript
const params = {
  contract_code: '74225830',
  order_number: data.orderId,
  item_code: data.products?.ids || '',
  item_name: data.products?.names || '',
  item_price: data.pricing?.total || 0,
  user_name: info.name,
  orderer_name: info.name,
  orderer_address: info.address,
  orderer_postal: info.postal.replace('-', ''),
  orderer_tel: info.tel.replace(/-/g, ''),
  user_mail_add: info.email,
  return_url: 'https://www3.edu-cart.jp/shop/utransctionback',
  lang_id: 'ja',
  currency_id: 'JPY',
  xml: '1',
  version: '2',
  page_type: '2'
};
```

### 3. 付款狀態驗證系統

#### 3.1 自動驗證流程
1. **付款完成頁面** (`/cart/complete`)
   - 自動檢測 URL 參數中的 `order_number`
   - 調用 `/api/verify-payment` 進行狀態驗證

2. **GMO 狀態查詢** (`/api/verify-payment`)
   - 調用 GMO `getsales2.cgi` API
   - 解析 XML 回應格式
   - 提取付款狀態資訊

3. **資料庫更新**
   - 根據 `order_number` 查找對應訂單
   - 更新訂單狀態為 `paid`
   - 清空購物車

#### 3.2 GMO 狀態碼對應
```javascript
const statusMapping = {
  '1': { status: 'paid', isPaid: true },
  '0': { status: 'unpaid', isPaid: false },
  '5': { status: 'authorized', isPaid: false },
  '9': { status: 'cancelled', isPaid: false },
  '21': { status: 'processing', isPaid: false }
};
```

## 技術實現細節

### 1. XML 解析處理
使用 `xml2js` 庫解析 GMO API 的 XML 回應：
```javascript
const parsed = await parseStringPromise(xmlResponse);
const state = parsed?.Epsilon_result?.result?.find(r => r?.$?.state)?.$?.state;
const transCode = parsed?.Epsilon_result?.result?.find(r => r?.$?.trans_code)?.$?.trans_code;
```

### 2. 訂單匹配邏輯
解決了前端生成的 `orderId` 與 GMO 實際使用的 `order_number` 不一致的問題：
```javascript
// 從 GMO 重定向 URL 中提取實際的 order_number
const url = new URL(redirectUrl);
const gmoOrderNumber = url.searchParams.get('order_number') || data.orderId;

// 保存時使用 GMO 實際的 order_number
order_data: {
  orderId: gmoOrderNumber, // 使用 GMO 實際使用的 order_number
  // ... 其他資料
}
```

### 3. 錯誤處理機制
- **網路錯誤**: 自動重試機制
- **API 錯誤**: 詳細錯誤日誌記錄
- **資料驗證**: 輸入參數驗證
- **優雅降級**: 即使部分功能失敗也能繼續付款流程

### 4. 安全性考量
- **環境變數**: 敏感資訊使用環境變數管理
- **VPC 配置**: Lambda 函數運行在私有網路中
- **IAM 權限**: 最小權限原則
- **資料加密**: 資料庫連接使用 SSL

## 部署配置

### 1. AWS 基礎設施
- **Lambda 函數**: 配置 VPC 和 RDS 連接
- **API Gateway**: RESTful API 端點
- **RDS PostgreSQL**: 資料庫服務
- **IAM 角色**: 適當的權限配置

### 2. EC2 部署
- **Nginx**: 反向代理和 SSL 終端
- **PM2**: Node.js 應用程式管理
- **Let's Encrypt**: SSL 憑證自動更新

### 3. 環境變數配置
```bash
# Lambda 函數 URL
LAMBDA_FUNCTION_URL=https://sehin2d3nc.execute-api.us-east-1.amazonaws.com/prod

# 資料庫連接
DB_HOST=ec-db.cluster-ckfayia6mz4j.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=ec
DB_USER=postgres
DB_PASSWORD=fje5W1C0uLOshLnAmdf1
```

## 測試結果

### 1. 付款流程測試
✅ **成功案例**:
- 訂單編號: `1761386115412`
- 交易代碼: `421474692`
- 付款狀態: `paid` (GMO 狀態: `1`)
- 資料庫更新: 成功
- 購物車清空: 成功

### 2. 錯誤處理測試
✅ **各種錯誤情況**:
- 網路連線失敗: 優雅處理
- GMO API 錯誤: 詳細日誌記錄
- 資料庫連接失敗: 錯誤回報
- 無效訂單號: 適當錯誤訊息

## 檔案結構

```
src/app/
├── api/
│   ├── gmo-linkpay/route.js          # GMO 付款處理 API
│   ├── verify-payment/route.js       # 付款狀態驗證 API
│   ├── check-payment-status/route.js # GMO 狀態查詢 API
│   └── update-order-status/route.js  # 訂單狀態更新 API
├── cart/
│   ├── payment/page.jsx              # 付款頁面
│   └── complete/page.jsx             # 付款完成頁面
├── shop/
│   └── utransctionback/page.jsx      # GMO 重定向中間頁面
└── store/
    └── cartStore.js                  # 購物車狀態管理

lambda/
└── order-crud/
    ├── index.js                      # Lambda 函數主程式
    ├── package.json                  # 依賴管理
    └── setup-database.sh            # 資料庫設定腳本
```

## 已知問題與解決方案

### 1. 訂單號碼不匹配問題
**問題**: 前端生成的 `orderId` 與 GMO 實際使用的 `order_number` 不一致
**解決方案**: 從 GMO 重定向 URL 中提取實際的 `order_number` 並保存到資料庫

### 2. XML 解析錯誤
**問題**: GMO API 返回 XML 格式，但代碼期望 key-value 格式
**解決方案**: 使用 `xml2js` 庫正確解析 XML 回應

### 3. 資料庫連接問題
**問題**: Lambda 函數無法連接到 RDS 資料庫
**解決方案**: 配置 VPC、安全群組和 IAM 權限

### 4. 重定向 URL 錯誤
**問題**: GMO 重定向到錯誤的域名 (`www` vs `www3`)
**解決方案**: 更新 `return_url` 為正確的域名

## 未來改進建議

### 1. 功能增強
- [ ] 添加付款失敗重試機制
- [ ] 實現訂單狀態通知系統
- [ ] 添加付款歷史查詢功能
- [ ] 實現部分退款功能

### 2. 效能優化
- [ ] 實現資料庫連接池
- [ ] 添加快取機制
- [ ] 優化 API 回應時間
- [ ] 實現非同步處理

### 3. 監控與日誌
- [ ] 添加 CloudWatch 監控
- [ ] 實現結構化日誌記錄
- [ ] 添加效能指標追蹤
- [ ] 實現錯誤告警系統

## 維護指南

### 1. 日常監控
- 檢查 Lambda 函數執行日誌
- 監控資料庫連接狀態
- 檢查 GMO API 回應狀態
- 監控付款成功率

### 2. 故障排除
- 檢查網路連線狀態
- 驗證環境變數配置
- 檢查 IAM 權限設定
- 查看詳細錯誤日誌

### 3. 更新流程
1. 在開發環境測試
2. 更新 Lambda 函數代碼
3. 部署到 EC2 伺服器
4. 驗證功能正常運作
5. 監控系統穩定性

## 聯絡資訊

如有任何問題或需要支援，請聯繫開發團隊。

---

**文件版本**: 1.0  
**最後更新**: 2025年10月25日  
**更新人員**: AI Assistant  
**審核狀態**: 已完成
