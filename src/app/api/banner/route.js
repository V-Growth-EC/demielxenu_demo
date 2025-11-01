import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // query string から customer_id を取得
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id');
    const apiKey = process.env.EDU_CART_API_KEY;
    
    if (!customer_id) {
      return NextResponse.json({ error: '缺少 customer_id' }, { status: 400 });
    }

    // 调用外部 Banner API
    console.log(`https://e1aw6mjh55.execute-api.us-east-1.amazonaws.com/banner/${customer_id}`, customer_id);
    const bannerRes = await fetch(`https://e1aw6mjh55.execute-api.us-east-1.amazonaws.com/banner/${customer_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    });

    if (!bannerRes.ok) {
      const errorText = await bannerRes.text();
      return NextResponse.json(
        { error: 'Banner API 调用失败', status: bannerRes.status, detail: errorText },
        { status: bannerRes.status }
      );
    }

    const data = await bannerRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Banner:', error);
    return NextResponse.json({ error: '查询失败', detail: error.message }, { status: 500 });
  }
}
