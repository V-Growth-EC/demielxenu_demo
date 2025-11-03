const { Pool } = require('pg');
const { authenticateRequest, createErrorResponse } = require('./middleware/auth');

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// CORS headers for API Gateway
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS?.split(',')[0] || '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

// Helper function to generate order_info_id
function generateOrderInfoId(customerId, order_id) {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  return `ORD_${customerId}_${timestamp}_${order_id}`;
}

// Helper function to validate order data
function validateOrderData(orderData) {
  const requiredFields = ['customer_id', 'order_data'];
  const errors = [];

  for (const field of requiredFields) {
    if (!orderData[field]) {
      errors.push(`${field} is required`);
    }
  }

  // Validate customer_id is a number
  if (orderData.customer_id && !Number.isInteger(Number(orderData.customer_id))) {
    errors.push('customer_id must be an integer');
  }

  // Validate order_data is an object
  if (orderData.order_data && typeof orderData.order_data !== 'object') {
    errors.push('order_data must be an object');
  }

  return errors;
}

// CREATE - Create a new order
async function createOrder(event) {
  try {
    const orderData = JSON.parse(event.body);
    const validationErrors = validateOrderData(orderData);
    
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Validation failed',
          details: validationErrors
        })
      };
    }

    const { customer_id, order_status = 'pending', order_data } = orderData;
    
    // Generate order_id and order_info_id
    // Use a smaller number for order_id (last 8 digits of timestamp)
    const order_id = parseInt(Date.now().toString().slice(-8));
    const order_info_id = generateOrderInfoId(customer_id, order_id);
    
    // Verify customer exists
    const customerCheck = await pool.query(
      'SELECT customer_id FROM customers WHERE customer_id = $1',
      [customer_id]
    );
    
    if (customerCheck.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Customer not found',
          customer_id
        })
      };
    }

    // Insert new order
    const result = await pool.query(`
      INSERT INTO orders (order_id, order_info_id, customer_id, order_status, order_data, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING order_id, order_info_id, customer_id, order_status, created_at, updated_at, order_data
    `, [order_id, order_info_id, customer_id, order_status, JSON.stringify(order_data)]);

    const newOrder = result.rows[0];
    // Parse order_data if it's a string, otherwise keep as is
    if (typeof newOrder.order_data === 'string') {
      newOrder.order_data = JSON.parse(newOrder.order_data);
    }

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Order created successfully',
        order: newOrder
      })
    };

  } catch (error) {
    console.error('Error creating order:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        detail: error.message
      })
    };
  }
}

// READ - Get order(s)
async function getOrder(event) {
  try {
    const { order_id, customer_id, order_info_id } = event.queryStringParameters || {};
    
    let query = 'SELECT * FROM orders';
    let params = [];
    let paramCount = 0;
    const conditions = [];

    if (order_id) {
      paramCount++;
      conditions.push(`order_id = $${paramCount}`);
      params.push(order_id);
    }

    if (customer_id) {
      paramCount++;
      conditions.push(`customer_id = $${paramCount}`);
      params.push(customer_id);
    }

    if (order_info_id) {
      paramCount++;
      conditions.push(`order_info_id = $${paramCount}`);
      params.push(order_info_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    // Parse order_data JSON for each order
    const orders = result.rows.map(row => ({
      ...row,
      order_data: typeof row.order_data === 'string' ? JSON.parse(row.order_data) : row.order_data
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        orders,
        count: orders.length
      })
    };

  } catch (error) {
    console.error('Error getting orders:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        detail: error.message
      })
    };
  }
}

// UPDATE - Update an existing order
async function updateOrder(event) {
  try {
    const { order_id, id } = event.pathParameters || {};
    const finalOrderId = order_id || id;
    const updateData = JSON.parse(event.body);
    
    if (!finalOrderId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'order_id is required in path parameters'
        })
      };
    }

    // Check if order exists
    const existingOrder = await pool.query(
      'SELECT * FROM orders WHERE order_id = $1',
      [finalOrderId]
    );

    if (existingOrder.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Order not found',
          order_id: finalOrderId
        })
      };
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (updateData.order_status !== undefined) {
      paramCount++;
      updateFields.push(`order_status = $${paramCount}`);
      values.push(updateData.order_status);
    }

    if (updateData.order_data !== undefined) {
      paramCount++;
      updateFields.push(`order_data = $${paramCount}`);
      values.push(JSON.stringify(updateData.order_data));
    }

    if (updateFields.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'No valid fields to update'
        })
      };
    }

    // Add updated_at
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date().toISOString());

    // Add order_id for WHERE clause
    paramCount++;
    values.push(finalOrderId);

    const query = `
      UPDATE orders 
      SET ${updateFields.join(', ')}
      WHERE order_id = $${paramCount}
      RETURNING order_id, order_info_id, customer_id, order_status, created_at, updated_at, order_data
    `;

    const result = await pool.query(query, values);
    const updatedOrder = result.rows[0];
    // Parse order_data if it's a string, otherwise keep as is
    if (typeof updatedOrder.order_data === 'string') {
      updatedOrder.order_data = JSON.parse(updatedOrder.order_data);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Order updated successfully',
        order: updatedOrder
      })
    };

  } catch (error) {
    console.error('Error updating order:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        detail: error.message
      })
    };
  }
}

// DELETE - Delete an order
async function deleteOrder(event) {
  try {
    const { order_id, id } = event.pathParameters || {};
    const finalOrderId = order_id || id;
    
    if (!finalOrderId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'order_id is required in path parameters'
        })
      };
    }

    // Check if order exists
    const existingOrder = await pool.query(
      'SELECT * FROM orders WHERE order_id = $1',
      [finalOrderId]
    );

    if (existingOrder.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Order not found',
          order_id: finalOrderId
        })
      };
    }

    // Delete the order
    await pool.query('DELETE FROM orders WHERE order_id = $1', [finalOrderId]);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Order deleted successfully',
        order_id: finalOrderId
      })
    };

  } catch (error) {
    console.error('Error deleting order:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        detail: error.message
      })
    };
  }
}

// Main Lambda handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // 身份驗證檢查
  const authError = authenticateRequest(event);
  if (authError) {
    console.warn('Authentication failed:', {
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path,
      sourceIp: event.requestContext?.identity?.sourceIp || 'unknown'
    });
    return createErrorResponse(authError);
  }

  try {
    const { httpMethod, pathParameters } = event;
    
    switch (httpMethod) {
      case 'POST':
        return await createOrder(event);
      
      case 'GET':
        return await getOrder(event);
      
      case 'PUT':
        return await updateOrder(event);
      
      case 'DELETE':
        return await deleteOrder(event);
      
      default:
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({
            error: 'Method not allowed',
            allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
          })
        };
    }

  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        detail: error.message
      })
    };
  } finally {
    // Don't close the pool in Lambda - it will be reused
    // await pool.end();
  }
};
