// Lambda function configuration
const LAMBDA_FUNCTION_URL = 'https://sehin2d3nc.execute-api.us-east-1.amazonaws.com/prod';

export async function POST(req) {
  try {
    console.log('=== BANKING PAY API 開始 ===');
    console.log('請求時間:', new Date().toISOString());
    
    const data = await req.json();
    console.log('銀行振込 請求數據:', data);

    // ユーザー情報を取得
    const info = data.customerInfo;
    console.log('客戶資訊:', info);

    // 直接保存訂單到資料庫（不需要像 GMO 那樣先調用外部 API）
    try {
      console.log('開始保存銀行振込訂單到資料庫...');
      console.log('Lambda Function URL:', LAMBDA_FUNCTION_URL);
      
      // 準備訂單資料
      const orderData = {
        customer_id: data.customer_id || 1, // 從前端傳入的 customer_id
        order_status: 'pending', // 初始狀態為 pending
        order_data: {
          orderId: data.orderId, // 使用前端生成的 orderId
          amount: data.pricing?.total || 0,
          classroom: data.classroom || '',
          customerInfo: {
            name: info.name,
            company_name: info.company_name,
            postal: info.postal,
            prefecture: info.prefecture,
            address: info.address,
            tel: info.tel,
            email: info.email,
            remarks: info.remarks,
            payment_method: info.payment_method
          },
          products: {
            names: data.products?.names || '',
            ids: data.products?.ids || '',
            items: data.products?.items || [],
            productDetails: data.products?.productDetails || {}
          },
          pricing: {
            subtotal: data.pricing?.subtotal || 0,
            shipping: data.pricing?.shipping || 0,
            total: data.pricing?.total || 0
          },
          bankingData: {
            order_number: data.orderId,
            payment_type: 'banking_transfer'
          }
        }
      };

      console.log('準備發送到 Lambda 的訂單資料:', JSON.stringify(orderData, null, 2));

      // 調用 Lambda 函數保存訂單
      console.log('調用 Lambda API:', `${LAMBDA_FUNCTION_URL}/orders`);
      const lambdaResponse = await fetch(`${LAMBDA_FUNCTION_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'ak_d98545386008dbcf1743337df60f038cdd336f270fa15bbd7e32cfa9d7ccee1f',
          'Origin': 'https://www3.edu-cart.jp'
        },
        body: JSON.stringify(orderData),
      });

      console.log('Lambda API 回應狀態:', lambdaResponse.status);
      console.log('Lambda API 回應 headers:', Object.fromEntries(lambdaResponse.headers.entries()));

      if (lambdaResponse.ok) {
        const savedOrder = await lambdaResponse.json();
        console.log('訂單已成功保存到資料庫:', savedOrder.order.order_id);
        console.log('完整的 Lambda 回應:', JSON.stringify(savedOrder, null, 2));
        
        // 返回成功結果，包含訂單資訊
        return new Response(JSON.stringify({ 
          success: true,
          orderId: savedOrder.order.order_id,
          orderInfoId: savedOrder.order.order_info_id,
          order_number: data.orderId,
          message: 'Banking payment order saved successfully'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        const errorText = await lambdaResponse.text();
        console.error('Lambda API 錯誤詳情:', {
          status: lambdaResponse.status,
          statusText: lambdaResponse.statusText,
          body: errorText
        });
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        console.error('保存訂單失敗:', errorData);
        
        // 返回錯誤
        return new Response(JSON.stringify({ 
          success: false,
          error: errorData.error || 'Failed to save order to database'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      console.error('=== 保存訂單時發生錯誤 ===');
      console.error('錯誤詳情:', error);
      console.error('錯誤訊息:', error.message);
      console.error('錯誤堆疊:', error.stack);
      
      // 返回錯誤
      return new Response(JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to save banking payment order'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('=== BANKING PAY API 發生未預期錯誤 ===');
    console.error('錯誤詳情:', error);
    console.error('錯誤訊息:', error.message);
    console.error('錯誤堆疊:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      detail: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
