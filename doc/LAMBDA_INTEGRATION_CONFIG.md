# Lambda Function Integration Configuration

## 環境變數設置

在您的 `.env.local` 文件中添加以下環境變數：

```bash
# Lambda Function Configuration
LAMBDA_FUNCTION_URL=https://your-lambda-api-gateway-url.amazonaws.com/prod
```

## API Gateway 設置

由於我們目前只有 Lambda 函數，您需要設置 API Gateway 來暴露 HTTP 端點：

### 方法 1: 使用 AWS CLI 創建 API Gateway

```bash
# 創建 REST API
aws apigateway create-rest-api \
    --name order-crud-api \
    --description "Order CRUD API" \
    --region us-east-1

# 獲取 API ID
API_ID=$(aws apigateway get-rest-apis --region us-east-1 --query 'items[?name==`order-crud-api`].id' --output text)

# 創建資源
aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $(aws apigateway get-resources --rest-api-id $API_ID --query 'items[0].id' --output text) \
    --path-part orders \
    --region us-east-1

# 創建方法
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $(aws apigateway get-resources --rest-api-id $API_ID --query 'items[1].id' --output text) \
    --http-method ANY \
    --authorization-type NONE \
    --region us-east-1

# 設置 Lambda 集成
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $(aws apigateway get-resources --rest-api-id $API_ID --query 'items[1].id' --output text) \
    --http-method ANY \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:349392551017:function:order-crud/invocations \
    --region us-east-1

# 部署 API
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --region us-east-1
```

### 方法 2: 暫時使用 Lambda 直接調用

如果您暫時不想設置 API Gateway，可以修改 `route.js` 使用 AWS SDK 直接調用 Lambda：

```javascript
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambdaClient = new LambdaClient({ region: "us-east-1" });

// 在保存訂單的部分替換 fetch 調用
const command = new InvokeCommand({
  FunctionName: "order-crud",
  Payload: JSON.stringify({
    httpMethod: "POST",
    path: "/orders",
    body: JSON.stringify(orderData),
    headers: { "Content-Type": "application/json" }
  })
});

const response = await lambdaClient.send(command);
const result = JSON.parse(new TextDecoder().decode(response.Payload));
```

## 測試

設置完成後，您可以測試整合：

1. 確保環境變數 `LAMBDA_FUNCTION_URL` 設置正確
2. 測試支付流程
3. 檢查 CloudWatch 日誌確認訂單是否成功保存
4. 查詢資料庫確認訂單記錄

## 注意事項

- 確保 Lambda 函數有適當的權限
- 監控 CloudWatch 日誌以調試任何問題
- 考慮添加重試機制處理網路錯誤
- 建議設置 API Gateway 以獲得更好的監控和日誌記錄

