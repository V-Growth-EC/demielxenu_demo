#!/bin/bash

# AWS Lambda Order CRUD Deployment Script
# This script deploys the Lambda function using AWS CLI

set -e

echo "🚀 Starting AWS Lambda deployment..."

# Configuration
FUNCTION_NAME="order-crud"
RUNTIME="nodejs18.x"
HANDLER="index.handler"
TIMEOUT=30
MEMORY_SIZE=256
REGION="us-east-1"  # Based on your RDS region

# Database configuration from your provided info
DB_HOST="ec-db.cluster-ckfayia6mz4j.us-east-1.rds.amazonaws.com"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="fje5W1C0uLOshLnAmdf1"
DB_NAME="postgres"

# Security configuration
API_KEY="ak_$(openssl rand -hex 32)"
ALLOWED_ORIGINS="https://www3.edu-cart.jp,https://edu-cart.jp"

# Create DATABASE_URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "📦 Preparing Lambda package..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create deployment package
echo "Creating deployment package..."
zip -r order-crud-lambda.zip . -x "*.git*" "test.js" "README.md" "DEPLOYMENT_GUIDE.md" "serverless.yml" "*.md"

echo "📋 Checking if Lambda function exists..."

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION >/dev/null 2>&1; then
    echo "✅ Function exists, updating code..."
    
    # Update function code
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://order-crud-lambda.zip \
        --region $REGION
    
    echo "✅ Function code updated successfully!"
    
    # Update function configuration
    echo "Updating function configuration..."
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --timeout $TIMEOUT \
        --memory-size $MEMORY_SIZE \
        --environment Variables='{"DATABASE_URL":"'${DATABASE_URL}'","NODE_ENV":"production","API_KEY":"'${API_KEY}'","ALLOWED_ORIGINS":"'${ALLOWED_ORIGINS}'"}' \
        --region $REGION
    
    echo "✅ Function configuration updated!"
    
else
    echo "❌ Function does not exist, creating new function..."
    
    # You need to provide an IAM role ARN for Lambda execution
    echo "Please provide the IAM role ARN for Lambda execution:"
    read -p "IAM Role ARN: " IAM_ROLE_ARN
    
    if [ -z "$IAM_ROLE_ARN" ]; then
        echo "❌ IAM Role ARN is required to create the function"
        echo "Please create an IAM role with Lambda execution permissions and provide the ARN"
        exit 1
    fi
    
    # Create new function
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $IAM_ROLE_ARN \
        --handler $HANDLER \
        --zip-file fileb://order-crud-lambda.zip \
        --timeout $TIMEOUT \
        --memory-size $MEMORY_SIZE \
        --environment Variables='{"DATABASE_URL":"'${DATABASE_URL}'","NODE_ENV":"production","API_KEY":"'${API_KEY}'","ALLOWED_ORIGINS":"'${ALLOWED_ORIGINS}'"}' \
        --description "CRUD operations for orders" \
        --region $REGION
    
    echo "✅ Function created successfully!"
fi

# Test the function
echo "🧪 Testing Lambda function..."

# Create a test event
cat > test-event.json << EOF
{
  "httpMethod": "GET",
  "path": "/orders",
  "queryStringParameters": {
    "customer_id": "1"
  },
  "headers": {
    "Content-Type": "application/json",
    "X-Api-Key": "${API_KEY}"
  }
}
EOF

echo "Running test..."
aws lambda invoke \
    --function-name $FUNCTION_NAME \
    --payload file://test-event.json \
    --region $REGION \
    response.json

echo "Test response:"
cat response.json | jq '.'

# Cleanup
rm -f test-event.json response.json order-crud-lambda.zip

echo "🎉 Deployment completed successfully!"
echo ""
echo "🔐 Generated API Key: ${API_KEY}"
echo "📋 Next steps:"
echo "1. Update your frontend/backend applications with the API Key"
echo "2. Test the function with real data"
echo "3. Monitor logs in CloudWatch"
echo ""
echo "🔗 Function ARN:"
aws lambda get-function --function-name $FUNCTION_NAME --region $REGION --query 'Configuration.FunctionArn' --output text
echo ""
echo "📝 Environment Variables:"
echo "API_KEY=${API_KEY}"
echo "ALLOWED_ORIGINS=${ALLOWED_ORIGINS}"

