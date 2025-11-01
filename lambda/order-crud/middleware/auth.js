/**
 * Lambda 身份驗證中間件
 * 實現 API Key 驗證機制
 */

/**
 * 驗證 API Key
 * @param {Object} event - Lambda 事件對象
 * @returns {Object} 驗證結果
 */
function verifyApiKey(event) {
  // 從 headers 中獲取 API Key
  const apiKey = event.headers?.['x-api-key'] || 
                 event.headers?.['X-Api-Key'] || 
                 event.headers?.['X-API-KEY'];
  
  // 檢查 API Key 是否存在
  if (!apiKey) {
    return {
      isValid: false,
      error: {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'API Key is required',
          code: 'MISSING_API_KEY'
        })
      }
    };
  }
  
  // 檢查 API Key 是否有效
  const validApiKey = process.env.API_KEY;
  if (!validApiKey) {
    console.error('API_KEY environment variable is not set');
    return {
      isValid: false,
      error: {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Server configuration error',
          message: 'API Key validation not configured',
          code: 'SERVER_CONFIG_ERROR'
        })
      }
    };
  }
  
  if (apiKey !== validApiKey) {
    // 記錄無效的 API Key 嘗試（但不記錄實際的 key 值）
    console.warn('Invalid API Key attempt', {
      timestamp: new Date().toISOString(),
      sourceIp: event.requestContext?.identity?.sourceIp || 'unknown',
      userAgent: event.headers?.['user-agent'] || 'unknown'
    });
    
    return {
      isValid: false,
      error: {
        statusCode: 403,
        body: JSON.stringify({
          error: 'Forbidden',
          message: 'Invalid API Key',
          code: 'INVALID_API_KEY'
        })
      }
    };
  }
  
  return {
    isValid: true,
    apiKey: apiKey.substring(0, 8) + '...' // 只記錄前8位用於日誌
  };
}

/**
 * 驗證請求來源
 * @param {Object} event - Lambda 事件對象
 * @returns {Object} 驗證結果
 */
function verifyRequestOrigin(event) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = event.headers?.['origin'] || event.headers?.['Origin'];
  
  // 如果允許所有來源，則跳過檢查
  if (allowedOrigins.includes('*')) {
    return { isValid: true };
  }
  
  if (!origin) {
    return {
      isValid: false,
      error: {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Origin header is required',
          code: 'MISSING_ORIGIN'
        })
      }
    };
  }
  
  if (!allowedOrigins.includes(origin)) {
    console.warn('Unauthorized origin attempt', {
      timestamp: new Date().toISOString(),
      origin: origin,
      sourceIp: event.requestContext?.identity?.sourceIp || 'unknown'
    });
    
    return {
      isValid: false,
      error: {
        statusCode: 403,
        body: JSON.stringify({
          error: 'Forbidden',
          message: 'Origin not allowed',
          code: 'UNAUTHORIZED_ORIGIN'
        })
      }
    };
  }
  
  return { isValid: true };
}

/**
 * 速率限制檢查（簡單實現）
 * @param {Object} event - Lambda 事件對象
 * @returns {Object} 檢查結果
 */
function checkRateLimit(event) {
  // 這裡可以實現更複雜的速率限制邏輯
  // 目前只是一個簡單的檢查框架
  const sourceIp = event.requestContext?.identity?.sourceIp || 'unknown';
  
  // 記錄請求
  console.log('API Request', {
    timestamp: new Date().toISOString(),
    sourceIp: sourceIp,
    method: event.httpMethod,
    path: event.path,
    userAgent: event.headers?.['user-agent'] || 'unknown'
  });
  
  return { isValid: true };
}

/**
 * 主要身份驗證函數
 * @param {Object} event - Lambda 事件對象
 * @returns {Object|null} 如果驗證失敗返回錯誤響應，成功返回 null
 */
function authenticateRequest(event) {
  // 1. 檢查 API Key
  const apiKeyResult = verifyApiKey(event);
  if (!apiKeyResult.isValid) {
    return apiKeyResult.error;
  }
  
  // 2. 檢查請求來源
  const originResult = verifyRequestOrigin(event);
  if (!originResult.isValid) {
    return originResult.error;
  }
  
  // 3. 速率限制檢查
  const rateLimitResult = checkRateLimit(event);
  if (!rateLimitResult.isValid) {
    return rateLimitResult.error;
  }
  
  // 所有驗證通過
  return null;
}

/**
 * 生成安全的錯誤響應
 * @param {Object} error - 錯誤對象
 * @returns {Object} Lambda 響應格式
 */
function createErrorResponse(error) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS?.split(',')[0] || '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };
  
  return {
    statusCode: error.statusCode || 500,
    headers: corsHeaders,
    body: error.body || JSON.stringify({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
    })
  };
}

module.exports = {
  authenticateRequest,
  verifyApiKey,
  verifyRequestOrigin,
  checkRateLimit,
  createErrorResponse
};
