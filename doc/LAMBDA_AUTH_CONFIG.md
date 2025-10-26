# Lambda API 身份認證配置

## 環境變數設置

請在您的 `.env.local` 文件中添加以下環境變數：

```bash
# Lambda API 配置
LAMBDA_FUNCTION_URL=https://sehin2d3nc.execute-api.us-east-1.amazonaws.com/prod
LAMBDA_API_KEY=ak_d98545386008dbcf1743337df60f038cdd336f270fa15bbd7e32cfa9d7cce1f
ALLOWED_ORIGIN=https://www3.edu-cart.jp

# 資料庫配置
DB_HOST=ec-db.cluster-ckfayia6mz4j.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=fje5W1C0uLOshLnAmdf1

# GMO 配置
GMO_CONTRACT_CODE=74225830
GMO_API_URL=https://secure.epsilon.jp/cgi-bin/order/getsales2.cgi
```

## 已更新的 API 路由

以下 API 路由已更新以包含 Lambda 身份認證：

1. **`/api/gmo-linkpay`** - GMO 付款處理
2. **`/api/verify-payment`** - 付款狀態驗證
3. **`/api/update-order-status`** - 訂單狀態更新

## API 調用格式

所有對 Lambda API 的調用現在都包含以下頭部：

```javascript
headers: {
  'Content-Type': 'application/json',
  'X-Api-Key': process.env.LAMBDA_API_KEY,
  'Origin': process.env.ALLOWED_ORIGIN
}
```

## 測試

您可以使用以下方式測試 Lambda API：

```bash
curl -X GET "https://sehin2d3nc.execute-api.us-east-1.amazonaws.com/prod/orders?customer_id=1" \
  -H "X-Api-Key: ak_d98545386008dbcf1743337df60f038cdd336f270fa15bbd7e32cfa9d7ccee1f" \
  -H "Origin: https://www3.edu-cart.jp"
```

## 安全注意事項

1. **API Key 保護**: 請確保 API Key 不會洩露到客戶端代碼中
2. **環境變數**: 使用環境變數管理敏感資訊
3. **來源驗證**: Lambda 函數會驗證請求來源
4. **速率限制**: API Gateway 已設置速率限制

## 故障排除

如果遇到認證錯誤，請檢查：

1. API Key 是否正確
2. Origin 頭部是否匹配允許的來源
3. 環境變數是否正確設置
4. Lambda 函數環境變數是否已更新

---

**更新時間**: 2025年10月25日  
**API Key**: ak_d98545386008dbcf1743337df60f038cdd336f270fa15bbd7e32cfa9d7ccee1f  
**Lambda URL**: https://sehin2d3nc.execute-api.us-east-1.amazonaws.com/prod
