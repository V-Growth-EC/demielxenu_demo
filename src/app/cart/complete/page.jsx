'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import useCartStore from '../../store/cartStore';

export default function CartCompletePage() {
  const clearCart = useCartStore(state => state.clearCart);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  useEffect(() => {
    console.log('=== CART COMPLETE ページ読み込み ===');
    console.log('現在の URL:', window.location.href);
    console.log('現在の search:', window.location.search);
    
    // ネイティブJavaScriptでURLパラメータを取得
    const urlParams = new URLSearchParams(window.location.search);
    const allParams = {};
    for (const [key, value] of urlParams.entries()) {
      allParams[key] = value;
    }
    
    console.log('すべての URL パラメータ:', allParams);
    
    const result = urlParams.get('result');
    const orderNumber = urlParams.get('order_number');
    const transCode = urlParams.get('trans_code');
    const userId = urlParams.get('user_id');

    console.log('解析された URL パラメータ:', { result, orderNumber, transCode, userId });

    // order_numberがある場合、支払い検証を実行
    if (orderNumber) {
      console.log('order_numberを発見、支払い検証フローを開始');
      verifyPayment(orderNumber);
    } else {
      console.log('order_numberがない、支払い検証をスキップ');
    }

    // result=1の場合、支払い成功としてカートをクリア
    if (result === '1') {
      console.log('result=1を検出、カートをクリア');
      clearCart();
      console.log('支払い成功、カートをクリアしました', {
        orderNumber,
        transCode,
        userId
      });
    } else {
      console.log('result は 1 ではありません、現在の値:', result);
    }
  }, [clearCart]);

  const verifyPayment = async (orderNumber) => {
    console.log('=== 支払い検証フロー開始 ===');
    console.log('注文番号:', orderNumber);
    
    setIsVerifying(true);
    setVerificationError(null);

    try {
      console.log('/api/verify-payment API を呼び出し準備');
      console.log('リクエストパラメータ:', {
        order_number: orderNumber,
        contract_code: '74225830'
      });

      // 支払い検証 API を呼び出し
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_number: orderNumber,
          contract_code: '74225830' // 契約番号を使用
        }),
      });

      console.log('API レスポンスステータス:', response.status);
      console.log('API レスポンス OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API レスポンスエラー詳細:', errorText);
        throw new Error(`API レスポンスエラー: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('支払い検証 API 完全レスポンス:', result);

      setPaymentStatus(result);

      // 支払いが成功した場合、カートをクリア
      if (result.is_paid) {
        console.log('支払い検証成功、カートをクリア');
        clearCart();
        console.log('カートがクリアされました');
      } else {
        console.log('支払い検証で未払いが表示、カート状態を維持');
      }

    } catch (error) {
      console.error('=== 支払い検証失敗 ===');
      console.error('エラー詳細:', error);
      console.error('エラーメッセージ:', error.message);
      console.error('エラースタック:', error.stack);
      setVerificationError(error.message);
    } finally {
      console.log('支払い検証フロー終了');
      setIsVerifying(false);
    }
  };

  return (
    <>
      <Header />
      
      <ul className="is-cart_navi flex flerx-stretch">
        <li>カート</li>
        <li>情報入力</li>
        <li className="current">注文完了</li>
      </ul>

      <div className="is-cart-wrap">
        <main className="is-page-main is-cart-main is-complete-main">
          <h3 className="ttl">注文完了</h3>
          
          {/* 支払い検証状態表示 */}
          {isVerifying && (
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f0f8ff', 
              border: '1px solid #007bff', 
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <p>🔍 支払い状態を確認中...</p>
            </div>
          )}

          {verificationError && (
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <p>⚠️ 支払い検証に失敗しました: {verificationError}</p>
              <p>カスタマーサービスにお問い合わせください</p>
            </div>
          )}


          {paymentStatus && paymentStatus.is_paid ? (
            <div>
              <p className="lead">
                お買い上げありがとうございました。<br />
                商品発送準備が完了次第、発送いたします。
              </p>
              <p className="btn-more"><a href="/">トップページ</a></p>
            </div>
          ) : paymentStatus && !paymentStatus.is_paid ? (
            <div>
              <p className="lead">
                支払いが完了していないか、処理中です。<br />
                しばらくお待ちください。またはカスタマーサービスにお問い合わせください。
              </p>
              <p className="btn-more">
                <button onClick={() => window.location.reload()}>再確認</button>
              </p>
              <p className="btn-more"><a href="/">トップページ</a></p>
            </div>
          ) : (
            <div>
              <p className="lead">
                お買い上げありがとうございました。<br />
                商品発送準備が完了次第、発送いたします。
              </p>
              <p className="btn-more"><a href="/">トップページ</a></p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
