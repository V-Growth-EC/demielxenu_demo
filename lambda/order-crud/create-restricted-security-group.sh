#!/bin/bash

# 創建新的安全群組，限制 Lambda 的 ingress 流量
# 這個腳本會創建一個只允許特定 IP 範圍訪問的安全群組

echo "🔒 創建 Lambda 專用安全群組..."

# 配置
VPC_ID="vpc-05a65bdd495d3a413"
REGION="us-east-1"
SECURITY_GROUP_NAME="lambda-restricted-sg"
SECURITY_GROUP_DESCRIPTION="Lambda function with restricted ingress"

# 允許的 IP 範圍 (請根據您的實際需求修改)
ALLOWED_IPS=(
    "203.0.113.0/24"      # 範例 IP 範圍 1
    "198.51.100.0/24"     # 範例 IP 範圍 2
    "192.0.2.0/24"        # 範例 IP 範圍 3
)

# 允許的網域對應的 IP (需要先解析)
ALLOWED_DOMAINS=(
    "www3.edu-cart.jp"
    "edu-cart.jp"
)

echo "📋 解析允許的網域 IP..."
DOMAIN_IPS=()
for domain in "${ALLOWED_DOMAINS[@]}"; do
    echo "解析 $domain..."
    ips=$(dig +short $domain | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$')
    if [ ! -z "$ips" ]; then
        while IFS= read -r ip; do
            DOMAIN_IPS+=("$ip/32")
            echo "  - $ip"
        done <<< "$ips"
    fi
done

# 合併所有允許的 IP
ALL_ALLOWED_IPS=("${ALLOWED_IPS[@]}" "${DOMAIN_IPS[@]}")

echo "🔍 檢查是否已存在安全群組..."
EXISTING_SG=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" "Name=vpc-id,Values=$VPC_ID" \
    --region $REGION \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

if [ "$EXISTING_SG" != "None" ] && [ ! -z "$EXISTING_SG" ]; then
    echo "⚠️  安全群組已存在: $EXISTING_SG"
    echo "是否要刪除並重新創建? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🗑️  刪除現有安全群組..."
        aws ec2 delete-security-group --group-id $EXISTING_SG --region $REGION
    else
        echo "使用現有安全群組: $EXISTING_SG"
        NEW_SG_ID=$EXISTING_SG
    fi
fi

if [ -z "$NEW_SG_ID" ]; then
    echo "🆕 創建新的安全群組..."
    NEW_SG_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP_NAME \
        --description "$SECURITY_GROUP_DESCRIPTION" \
        --vpc-id $VPC_ID \
        --region $REGION \
        --query 'GroupId' \
        --output text)
    
    echo "✅ 安全群組創建成功: $NEW_SG_ID"
fi

# 添加 ingress 規則
echo "🔧 配置 ingress 規則..."
for ip_range in "${ALL_ALLOWED_IPS[@]}"; do
    echo "添加規則: $ip_range"
    aws ec2 authorize-security-group-ingress \
        --group-id $NEW_SG_ID \
        --protocol tcp \
        --port 443 \
        --cidr $ip_range \
        --region $REGION \
        --output text > /dev/null 2>&1 || echo "  (規則可能已存在)"
done

# 添加 egress 規則 (允許訪問 RDS)
echo "🔧 配置 egress 規則..."
aws ec2 authorize-security-group-egress \
    --group-id $NEW_SG_ID \
    --protocol tcp \
    --port 5432 \
    --cidr 10.0.0.0/8 \
    --region $REGION \
    --output text > /dev/null 2>&1 || echo "  (egress 規則可能已存在)"

echo "📋 安全群組配置完成:"
echo "Group ID: $NEW_SG_ID"
echo "Group Name: $SECURITY_GROUP_NAME"
echo ""
echo "🔍 查看安全群組規則:"
aws ec2 describe-security-groups --group-ids $NEW_SG_ID --region $REGION

echo ""
echo "📝 要將此安全群組應用到 Lambda 函數，請運行:"
echo "aws lambda update-function-configuration \\"
echo "  --function-name order-crud \\"
echo "  --vpc-config SubnetIds=subnet-02537eb6d1a902c96,subnet-064fc51de6116eb10,SecurityGroupIds=$NEW_SG_ID \\"
echo "  --region $REGION"
