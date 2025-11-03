# AWS Lambda Order CRUD Function Deployment Guide

## Prerequisites
- AWS CLI configured with appropriate permissions
- Node.js 18+ installed
- PostgreSQL database accessible from AWS Lambda

## Environment Variables
Set the following environment variables in your Lambda function:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development/production)

## Database Setup
Ensure your PostgreSQL database has the following tables:

```sql
-- Orders table
CREATE TABLE orders (
    order_id      SERIAL PRIMARY KEY,
    order_info_id VARCHAR(255) NOT NULL,
    customer_id   INTEGER REFERENCES customers(customer_id),
    order_status  VARCHAR(255) NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    order_data    JSON NOT NULL
);

-- Customers table (should already exist)
CREATE TABLE customers (
    customer_id    INTEGER PRIMARY KEY,
    customer_name  VARCHAR(50) NOT NULL,
    auth_code      VARCHAR(50) NOT NULL,
    color_code     VARCHAR(50) NOT NULL,
    order_prefix   VARCHAR(50) NOT NULL,
    logo_img       VARCHAR(255),
    payment_method JSON NOT NULL,
    manager_id     INTEGER REFERENCES accounts(account_id)
);
```

## Deployment Steps

### 1. Package the Lambda Function
```bash
cd lambda/order-crud
npm install
zip -r order-crud-lambda.zip .
```

### 2. Create Lambda Function (if not exists)
```bash
aws lambda create-function \
  --function-name order-crud \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://order-crud-lambda.zip \
  --timeout 30 \
  --memory-size 256
```

### 3. Update Existing Function
```bash
aws lambda update-function-code \
  --function-name order-crud \
  --zip-file fileb://order-crud-lambda.zip
```

### 4. Set Environment Variables
```bash
aws lambda update-function-configuration \
  --function-name order-crud \
  --environment Variables='{
    "DATABASE_URL":"postgresql://username:password@host:port/database",
    "NODE_ENV":"production"
  }'
```

### 5. Configure API Gateway (Optional)
If you want to expose this as an HTTP API:

```bash
# Create API Gateway
aws apigateway create-rest-api --name order-crud-api

# Create resources and methods as needed
# Example: POST /orders, GET /orders/{id}, etc.
```

## API Endpoints

### Create Order
- **Method**: POST
- **Path**: /orders
- **Body**:
```json
{
  "customer_id": 123,
  "order_status": "pending",
  "order_data": {
    "orderId": 1234567890,
    "amount": 10000,
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "products": {
      "items": [...],
      "names": "Product 1x2/Product 2x1"
    },
    "pricing": {
      "subtotal": 9000,
      "shipping": 1000,
      "total": 10000
    }
  }
}
```

### Get Orders
- **Method**: GET
- **Path**: /orders
- **Query Parameters**:
  - `order_id`: Get specific order by ID
  - `customer_id`: Get all orders for a customer
  - `order_info_id`: Get order by order_info_id

### Update Order
- **Method**: PUT
- **Path**: /orders/{order_id}
- **Body**:
```json
{
  "order_status": "completed",
  "order_data": {
    // Updated order data
  }
}
```

### Delete Order
- **Method**: DELETE
- **Path**: /orders/{order_id}

## Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "order": {
    "order_id": 1,
    "order_info_id": "ORD_123_20231201120000_1234567890",
    "customer_id": 123,
    "order_status": "pending",
    "created_at": "2023-12-01T12:00:00Z",
    "updated_at": "2023-12-01T12:00:00Z",
    "order_data": {
      // Order data object
    }
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "detail": "Detailed error information"
}
```

## Testing

### Local Testing
You can test the function locally using AWS SAM or by creating a test event:

```json
{
  "httpMethod": "POST",
  "path": "/orders",
  "body": "{\"customer_id\": 123, \"order_data\": {...}}",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

### Integration with Frontend
Update your frontend payment processing to call this Lambda function:

```javascript
// After successful payment processing
const orderResponse = await fetch('YOUR_LAMBDA_API_ENDPOINT/orders', {
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
```

## Monitoring and Logs
- Monitor function performance in AWS CloudWatch
- Set up CloudWatch alarms for errors
- Review logs for debugging issues

## Security Considerations
- Use IAM roles with minimal required permissions
- Encrypt sensitive data in environment variables
- Implement proper input validation
- Use VPC if database is in private subnet
- Enable AWS X-Ray for tracing (optional)

