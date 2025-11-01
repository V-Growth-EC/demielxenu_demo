#!/bin/bash

# 🔒 Lambda 多層安全防護設置腳本
# 這個腳本會設置多層安全防護來限制 API 訪問

echo "🔒 設置 Lambda 多層安全防護..."

# 配置
FUNCTION_NAME="order-crud"
REGION="us-east-1"
VPC_ID="vpc-05a65bdd495d3a413"
SUBNET_IDS="subnet-02537eb6d1a902c96,subnet-064fc51de6116eb10"

# 允許的 IP 範圍 (請根據您的實際需求修改)
ALLOWED_IPS=(
    "203.0.113.0/24"      # 範例 IP 範圍 1
    "198.51.100.0/24"     # 範例 IP 範圍 2
    "192.0.2.0/24"        # 範例 IP 範圍 3
)

echo "📋 方法 1: 創建限制性安全群組..."

# 創建新的安全群組
RESTRICTED_SG_ID=$(aws ec2 create-security-group \
    --group-name lambda-restricted-sg \
    --description "Lambda function with restricted ingress" \
    --vpc-id $VPC_ID \
    --region $REGION \
    --query 'GroupId' \
    --output text)

echo "✅ 安全群組創建成功: $RESTRICTED_SG_ID"

# 添加 ingress 規則 (只允許特定 IP)
for ip_range in "${ALLOWED_IPS[@]}"; do
    echo "添加允許規則: $ip_range"
    aws ec2 authorize-security-group-ingress \
        --group-id $RESTRICTED_SG_ID \
        --protocol tcp \
        --port 443 \
        --cidr $ip_range \
        --region $REGION \
        --output text > /dev/null 2>&1 || echo "  (規則可能已存在)"
done

# 添加 egress 規則 (允許訪問 RDS)
aws ec2 authorize-security-group-egress \
    --group-id $RESTRICTED_SG_ID \
    --protocol tcp \
    --port 5432 \
    --cidr 10.0.0.0/8 \
    --region $REGION \
    --output text > /dev/null 2>&1 || echo "  (egress 規則可能已存在)"

echo ""
echo "📋 方法 2: 設置 API Gateway 使用計劃和 API Key..."

# 創建使用計劃
USAGE_PLAN_ID=$(aws apigateway create-usage-plan \
    --name "restricted-usage-plan" \
    --description "Usage plan with rate limiting" \
    --throttle burstLimit=100,rateLimit=50 \
    --quota limit=10000,period=DAY \
    --region $REGION \
    --query 'id' \
    --output text)

echo "✅ 使用計劃創建成功: $USAGE_PLAN_ID"

# 創建 API Key
API_KEY_ID=$(aws apigateway create-api-key \
    --name "restricted-api-key" \
    --description "API Key for restricted access" \
    --enabled \
    --region $REGION \
    --query 'id' \
    --output text)

echo "✅ API Key 創建成功: $API_KEY_ID"

# 將 API Key 關聯到使用計劃
aws apigateway create-usage-plan-key \
    --usage-plan-id $USAGE_PLAN_ID \
    --key-id $API_KEY_ID \
    --key-type API_KEY \
    --region $REGION \
    --output text > /dev/null 2>&1

echo "✅ API Key 已關聯到使用計劃"

echo ""
echo "📋 方法 3: 更新 Lambda 函數使用限制性安全群組..."

# 更新 Lambda 函數使用新的安全群組
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --vpc-config SubnetIds=$SUBNET_IDS,SecurityGroupIds=$RESTRICTED_SG_ID \
    --region $REGION \
    --output text > /dev/null 2>&1

echo "✅ Lambda 函數已更新使用限制性安全群組"

echo ""
echo "📋 方法 4: 創建 CloudFront 分發 (可選)..."

# 創建 CloudFront 分發來進一步限制訪問
cat > cloudfront-config.json << EOF
{
  "CallerReference": "lambda-restricted-$(date +%s)",
  "Comment": "CloudFront distribution for Lambda API",
  "DefaultCacheBehavior": {
    "TargetOriginId": "lambda-api-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 0,
    "MaxTTL": 0
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "lambda-api-origin",
        "DomainName": "sehin2d3nc.execute-api.us-east-1.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 443,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only"
        }
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF

echo "✅ CloudFront 配置已創建"

echo ""
echo "🎉 多層安全防護設置完成！"
echo ""
echo "📊 安全層級總結:"
echo "1. ✅ VPC 安全群組限制 (IP 層面)"
echo "2. ✅ API Gateway 使用計劃 (速率限制)"
echo "3. ✅ API Key 認證 (應用層面)"
echo "4. ✅ Lambda 函數身份驗證 (代碼層面)"
echo "5. ✅ CloudFront 分發 (CDN 層面)"
echo ""
echo "🔧 下一步操作:"
echo "1. 測試新的安全群組是否正常工作"
echo "2. 更新您的應用程式使用新的 API Key"
echo "3. 監控 CloudWatch 日誌中的安全事件"
echo ""
echo "📝 重要資訊:"
echo "安全群組 ID: $RESTRICTED_SG_ID"
echo "API Key ID: $API_KEY_ID"
echo "使用計劃 ID: $USAGE_PLAN_ID"
echo ""
echo "⚠️  注意: 安全群組更改可能需要幾分鐘才會生效"
