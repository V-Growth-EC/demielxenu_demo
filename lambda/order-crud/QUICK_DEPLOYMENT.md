# AWS Lambda Order CRUD - Quick Deployment Guide

## 🚀 Quick Start Deployment

### Prerequisites
- AWS CLI configured with appropriate permissions
- Node.js 18+ installed
- PostgreSQL client (psql) installed

### Step 1: Set up Database Tables
```bash
cd lambda/order-crud
./setup-database.sh
```

### Step 2: Deploy Lambda Function
```bash
./deploy.sh
```

## 📋 Manual Deployment Steps

### 1. Database Configuration
Your database details:
- **Host**: `ec-db.cluster-ckfayia6mz4j.us-east-1.rds.amazonaws.com`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `fje5W1C0uLOshLnAmdf1`
- **Database**: `postgres`

### 2. Create IAM Role (if needed)
If you don't have an IAM role for Lambda execution:

```bash
# Create trust policy
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create IAM role
aws iam create-role \
    --role-name lambda-execution-role \
    --assume-role-policy-document file://trust-policy.json

# Attach basic execution policy
aws iam attach-role-policy \
    --role-name lambda-execution-role \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Get role ARN
aws iam get-role --role-name lambda-execution-role --query 'Role.Arn' --output text
```

### 3. Deploy Lambda Function
```bash
cd lambda/order-crud

# Install dependencies
npm install

# Create deployment package
zip -r order-crud-lambda.zip . -x "*.git*" "test.js" "README.md" "DEPLOYMENT_GUIDE.md" "serverless.yml" "*.md"

# Create or update function
aws lambda create-function \
    --function-name order-crud \
    --runtime nodejs18.x \
    --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
    --handler index.handler \
    --zip-file fileb://order-crud-lambda.zip \
    --timeout 30 \
    --memory-size 256 \
    --environment Variables='{
        "DATABASE_URL":"postgresql://postgres:fje5W1C0uLOshLnAmdf1@ec-db.cluster-ckfayia6mz4j.us-east-1.rds.amazonaws.com:5432/postgres",
        "NODE_ENV":"production"
    }' \
    --description "CRUD operations for orders" \
    --region us-east-1
```

### 4. Test the Function
```bash
# Create test event
cat > test-event.json << EOF
{
  "httpMethod": "POST",
  "path": "/orders",
  "body": "{\"customer_id\": 1, \"order_status\": \"pending\", \"order_data\": {\"orderId\": 1234567890, \"amount\": 10000, \"customerInfo\": {\"name\": \"Test User\", \"email\": \"test@example.com\"}, \"products\": {\"names\": \"Test Product x1\"}, \"pricing\": {\"total\": 10000}}}",
  "headers": {
    "Content-Type": "application/json"
  }
}
EOF

# Test the function
aws lambda invoke \
    --function-name order-crud \
    --payload file://test-event.json \
    --region us-east-1 \
    response.json

# View response
cat response.json | jq '.'
```

## 🔧 API Gateway Setup (Optional)

To expose HTTP endpoints:

```bash
# Create API Gateway
aws apigateway create-rest-api \
    --name order-crud-api \
    --description "Order CRUD API" \
    --region us-east-1

# Get API ID
API_ID=$(aws apigateway get-rest-apis --region us-east-1 --query 'items[?name==`order-crud-api`].id' --output text)

# Create resource
aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $(aws apigateway get-resources --rest-api-id $API_ID --query 'items[0].id' --output text) \
    --path-part orders \
    --region us-east-1

# Create methods (GET, POST, PUT, DELETE)
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $(aws apigateway get-resources --rest-api-id $API_ID --query 'items[1].id' --output text) \
    --http-method ANY \
    --authorization-type NONE \
    --region us-east-1

# Deploy API
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --region us-east-1
```

## 🧪 Testing Commands

### Test Database Connection
```bash
PGPASSWORD='fje5W1C0uLOshLnAmdf1' psql \
    -h ec-db.cluster-ckfayia6mz4j.us-east-1.rds.amazonaws.com \
    -p 5432 \
    -U postgres \
    -d postgres \
    -c 'SELECT version();'
```

### Test Orders Table
```bash
PGPASSWORD='fje5W1C0uLOshLnAmdf1' psql \
    -h ec-db.cluster-ckfayia6mz4j.us-east-1.rds.amazonaws.com \
    -p 5432 \
    -U postgres \
    -d postgres \
    -c 'SELECT * FROM orders;'
```

### Test Lambda Function
```bash
# Test create order
aws lambda invoke \
    --function-name order-crud \
    --payload '{"httpMethod":"POST","path":"/orders","body":"{\"customer_id\":1,\"order_status\":\"pending\",\"order_data\":{\"orderId\":1234567890,\"amount\":10000,\"customerInfo\":{\"name\":\"Test User\",\"email\":\"test@example.com\"},\"products\":{\"names\":\"Test Product x1\"},\"pricing\":{\"total\":10000}}}","headers":{"Content-Type":"application/json"}}' \
    --region us-east-1 \
    response.json && cat response.json | jq '.'

# Test get orders
aws lambda invoke \
    --function-name order-crud \
    --payload '{"httpMethod":"GET","path":"/orders","queryStringParameters":{"customer_id":"1"}}' \
    --region us-east-1 \
    response.json && cat response.json | jq '.'
```

## 📊 Monitoring

### View Lambda Logs
```bash
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/order-crud --region us-east-1
```

### Monitor Function Metrics
```bash
aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda \
    --metric-name Invocations \
    --dimensions Name=FunctionName,Value=order-crud \
    --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
    --period 300 \
    --statistics Sum \
    --region us-east-1
```

## 🔗 Integration with Frontend

Update your payment processing to save orders:

```javascript
// In src/app/cart/payment/page.jsx
const saveOrderToDatabase = async (orderData, customerId) => {
  try {
    const response = await fetch('YOUR_LAMBDA_FUNCTION_URL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        order_status: 'pending',
        order_data: orderData
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Order saved:', result.order);
      return result.order;
    } else {
      console.error('Failed to save order:', await response.text());
    }
  } catch (error) {
    console.error('Error saving order:', error);
  }
};
```

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check security groups allow Lambda to connect to RDS
   - Verify DATABASE_URL format
   - Test connection manually

2. **Permission Errors**
   - Ensure Lambda execution role has proper permissions
   - Check CloudWatch logs for detailed errors

3. **Function Timeout**
   - Increase timeout in function configuration
   - Check database query performance

### Debug Commands:
```bash
# Check function configuration
aws lambda get-function --function-name order-crud --region us-east-1

# View recent logs
aws logs filter-log-events \
    --log-group-name /aws/lambda/order-crud \
    --start-time $(date -d '1 hour ago' +%s)000 \
    --region us-east-1
```

