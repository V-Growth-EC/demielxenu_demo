# GMO LinkPay orderData 欄位說明文件

## 概述

本文檔說明 GMO LinkPay 付款流程中 `orderData` 資料結構的欄位含義。

---

## 一、前端發送的 orderData（`/cart/payment` → `/api/gmo-linkpay`）

前端在 `src/app/cart/payment/page.jsx` 中構建的資料結構。

### 完整結構

```javascript
{
  // 訂單基本信息
  orderId: string,              // 訂單ID（使用 Date.now() 生成）
  amount: number,               // 總金額
  classroom: string,            // 教室/班級名稱
  
  // 用戶基本信息（簡化版）
  userName: string,            // 用戶姓名
  email: string,               // 電子郵件
  
  // 客戶詳細信息
  customerInfo: {
    name: string,              // 姓名
    guardian: string,          // 保護者名
    postal: string,           // 郵遞區號（可能包含 "-"）
    prefecture: string,       // 都道府縣
    address: string,          // 詳細地址
    tel: string,             // 電話號碼（可能包含 "-"）
    email: string,           // 電子郵件
    payment_method: string   // 付款方式
  },
  
  // 商品信息
  products: {
    names: string,            // 商品名稱（多個用分隔符連接）
    ids: string,             // 商品ID（多個用分隔符連接）
    items: Array,            // 購物車中的商品陣列
    productDetails: Object   // 商品詳細信息物件
  },
  
  // 價格信息
  pricing: {
    subtotal: number,        // 小計（不含運費）
    shipping: number,        // 運費
    total: number           // 總金額（含運費）
  }
}
```

### 欄位詳細說明

#### 1. 訂單基本信息

| 欄位 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `orderId` | string | ✅ | 唯一訂單ID，前端使用 `Date.now()` 生成 | `"1728345600000"` |
| `amount` | number | ✅ | 訂單總金額（應等於 `pricing.total`） | `15000` |
| `classroom` | string | ❌ | 教室或班級名稱（可選） | `"初級班A"` |

#### 2. 用戶基本信息

| 欄位 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `userName` | string | ✅ | 用戶姓名（簡化版，通常與 `customerInfo.name` 相同） | `"山田太郎"` |
| `email` | string | ✅ | 電子郵件（簡化版，通常與 `customerInfo.email` 相同） | `"yamada@example.com"` |

#### 3. customerInfo（客戶詳細信息）

| 欄位 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `name` | string | ✅ | 客戶姓名 | `"山田太郎"` |
| `guardian` | string | ❌ | 監護人姓名（學生訂單時使用） | `"山田花子"` |
| `postal` | string | ✅ | 郵遞區號（可能包含 "-"） | `"123-4567"` |
| `prefecture` | string | ✅ | 都道府縣 | `"東京都"` |
| `address` | string | ✅ | 詳細地址 | `"新宿区新宿1-1-1"` |
| `tel` | string | ✅ | 電話號碼（可能包含 "-"） | `"03-1234-5678"` |
| `email` | string | ✅ | 電子郵件 | `"yamada@example.com"` |
| `payment_method` | string | ✅ | 付款方式 | `"credit_card"` 或 `"bank_transfer"` |

#### 4. products（商品信息）

| 欄位 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `names` | string | ✅ | 商品名稱字串（多個商品用分隔符連接） | `"商品A,商品B"` |
| `ids` | string | ✅ | 商品ID字串（多個商品用分隔符連接） | `"PROD001,PROD002"` |
| `items` | Array | ✅ | 購物車中的完整商品物件陣列 | `[{id, name, price, ...}, ...]` |
| `productDetails` | Object | ✅ | 商品詳細信息物件（可能是 ID 對應的商品詳情） | `{PROD001: {...}, ...}` |

#### 5. pricing（價格信息）

| 欄位 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `subtotal` | number | ✅ | 小計（不含運費的商品總額） | `14000` |
| `shipping` | number | ✅ | 運費 | `1000` |
| `total` | number | ✅ | 總金額（`subtotal + shipping`） | `15000` |

---

## 二、後端處理後的 orderData（`/api/gmo-linkpay` → Lambda API）

後端在 `src/app/api/gmo-linkpay/route.js` 中處理後發送到 Lambda 的資料結構。

### 完整結構

```javascript
{
  // 資料庫關聯欄位
  customer_id: number,       // 客戶ID（從前端 data.customer_id 取得，預設為 1）
  order_status: string,     // 訂單狀態（固定為 "pending"）
  
  // 訂單詳細資料
  order_data: {
    // 訂單識別
    orderId: string,         // GMO 實際使用的訂單號（可能與前端不同）
    amount: number,         // 訂單總金額
    classroom: string,      // 教室名稱
    
    // 客戶信息
    customerInfo: {
      name: string,
      guardian: string,
      postal: string,
      prefecture: string,
      address: string,
      tel: string,
      email: string,
      payment_method: string
    },
    
    // 商品信息
    products: {
      names: string,
      ids: string,
      items: Array,
      productDetails: Object
    },
    
    // 價格信息
    pricing: {
      subtotal: number,
      shipping: number,
      total: number
    },
    
    // GMO 支付相關數據
    gmoData: {
      contract_code: string,    // GMO 合約代碼
      order_number: string,      // GMO 訂單號
      redirectUrl: string        // GMO 重定向URL（用於跳轉到支付頁面）
    }
  }
}
```

### 欄位詳細說明

#### 1. 頂層欄位（資料庫關聯）

| 欄位 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `customer_id` | number | ✅ | 客戶ID，從前端 `data.customer_id` 取得，如果沒有則預設為 1 | `1` |
| `order_status` | string | ✅ | 訂單狀態，固定為 `"pending"`（待處理） | `"pending"` |

#### 2. order_data（訂單詳細資料）

| 欄位 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `orderId` | string | ✅ | GMO 實際使用的訂單號，可能與前端生成的 `orderId` 不同 | `"1728345600000"` |
| `amount` | number | ✅ | 訂單總金額，從 `data.pricing?.total` 取得 | `15000` |
| `classroom` | string | ❌ | 教室名稱，從 `data.classroom` 取得 | `"初級班A"` |

**注意：** `customerInfo`、`products`、`pricing` 三個子物件的結構與前端發送的一致，但欄位值會經過處理（例如去除郵遞區號和電話號碼中的 "-"）。

#### 3. gmoData（GMO 支付相關數據）

| 欄位 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `contract_code` | string | ✅ | GMO Epsilon 合約代碼（固定值） | `"74225830"` |
| `order_number` | string | ✅ | 發送到 GMO 的訂單號（與前端 `orderId` 相同） | `"1728345600000"` |
| `redirectUrl` | string | ✅ | GMO 返回的重定向URL，用於跳轉到支付頁面 | `"https://secure.epsilon.jp/..."` |

---

## 三、資料流程圖

```
前端 (payment/page.jsx)
  ↓
orderData {
  orderId, amount, classroom,
  userName, email,
  customerInfo: {...},
  products: {...},
  pricing: {...}
}
  ↓
POST /api/gmo-linkpay
  ↓
後端處理 (route.js)
  - 發送請求到 GMO API
  - 取得 redirectUrl
  - 構建新的 orderData
  ↓
orderData {
  customer_id,
  order_status: "pending",
  order_data: {
    orderId: gmoOrderNumber,  // GMO 實際使用的訂單號
    amount,
    classroom,
    customerInfo: {...},
    products: {...},
    pricing: {...},
    gmoData: {
      contract_code,
      order_number,
      redirectUrl
    }
  }
}
  ↓
POST Lambda API /orders
  ↓
保存到資料庫 (orders 表)
```

---

## 四、重要注意事項

### 1. orderId 的變化
- **前端生成**：使用 `Date.now()` 生成，例如 `1728345600000`
- **後端使用**：在發送到 Lambda 時，使用從 GMO 重定向 URL 中提取的 `order_number`（可能與前端不同）
- **存儲到資料庫**：使用 GMO 實際使用的 `order_number` 作為 `orderId`

### 2. 資料格式處理
- **郵遞區號**：前端可能包含 "-"（如 `"123-4567"`），發送到 GMO API 時會移除 "-"
- **電話號碼**：前端可能包含 "-"（如 `"03-1234-5678"`），發送到 GMO API 時會移除 "-"
- **存儲到資料庫**：保留原始格式（包含 "-"）

### 3. 預設值處理
- 如果前端沒有傳入 `customer_id`，後端會使用預設值 `1`
- 如果某些欄位為空，後端會使用空字串 `""` 或數字 `0` 作為預設值

### 4. 訂單狀態
- 初始狀態固定為 `"pending"`（待處理）
- 付款成功後會更新為 `"paid"` 或其他狀態

---

## 五、範例資料

### 前端發送的 orderData 範例

```json
{
  "orderId": "1728345600000",
  "amount": 15000,
  "classroom": "初級班A",
  "userName": "山田太郎",
  "email": "yamada@example.com",
  "customerInfo": {
    "name": "山田太郎",
    "guardian": "山田花子",
    "postal": "123-4567",
    "prefecture": "東京都",
    "address": "新宿区新宿1-1-1",
    "tel": "03-1234-5678",
    "email": "yamada@example.com",
    "payment_method": "credit_card"
  },
  "products": {
    "names": "商品A,商品B",
    "ids": "PROD001,PROD002",
    "items": [
      {"id": "PROD001", "name": "商品A", "price": 8000},
      {"id": "PROD002", "name": "商品B", "price": 6000}
    ],
    "productDetails": {
      "PROD001": {"name": "商品A", "description": "..."},
      "PROD002": {"name": "商品B", "description": "..."}
    }
  },
  "pricing": {
    "subtotal": 14000,
    "shipping": 1000,
    "total": 15000
  }
}
```

### 後端發送到 Lambda 的 orderData 範例

```json
{
  "customer_id": 1,
  "order_status": "pending",
  "order_data": {
    "orderId": "1728345600000",
    "amount": 15000,
    "classroom": "初級班A",
    "customerInfo": {
      "name": "山田太郎",
      "guardian": "山田花子",
      "postal": "123-4567",
      "prefecture": "東京都",
      "address": "新宿区新宿1-1-1",
      "tel": "03-1234-5678",
      "email": "yamada@example.com",
      "payment_method": "credit_card"
    },
    "products": {
      "names": "商品A,商品B",
      "ids": "PROD001,PROD002",
      "items": [
        {"id": "PROD001", "name": "商品A", "price": 8000},
        {"id": "PROD002", "name": "商品B", "price": 6000}
      ],
      "productDetails": {
        "PROD001": {"name": "商品A", "description": "..."},
        "PROD002": {"name": "商品B", "description": "..."}
      }
    },
    "pricing": {
      "subtotal": 14000,
      "shipping": 1000,
      "total": 15000
    },
    "gmoData": {
      "contract_code": "74225830",
      "order_number": "1728345600000",
      "redirectUrl": "https://secure.epsilon.jp/cgi-bin/order/receive_order3.cgi?..."
    }
  }
}
```

---

## 更新記錄

- **建立日期**：2025-01-XX
- **說明**：整理 GMO LinkPay orderData 欄位含義

