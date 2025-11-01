'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function FAQPage() {
  const [faqData, setFaqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    
    // まず customer_id を取得
    fetch('/api/check-auth')
      .then(res => res.json())
      .then(auth => {
        if (auth.customer_id && typeof auth.customer_id === 'number' && auth.customer_id !== -1) {
          // FAQ API を取得
          return fetch(`/api/faq?customer_id=${auth.customer_id}`);
        } else {
          throw new Error('認証されていません');
        }
      })
      .then(res => res.json())
      .then(data => {
        setFaqData(data);
        console.log('FAQ data received:', data);
      })
      .catch(() => setError('FAQ API 接続エラー'))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      
      <div className="is-faq-wrap">
        <main className="is-page-main is-faq-main">
          <section className="is-kv is-kv-lower is-kv-lower-faq">
            <div className="ttl-primary">
              <h2>
                <span className="jp">よくあるご質問</span>
                <span className="en"><i>FAQ</i></span>
              </h2>
            </div>
          </section>
          
          <section className="is-faq-inner">
            <div className="is-faq-box">
              <h3>デバイスについて</h3>
            </div>
            <div className="is-faq-box">
              <p className="ques">iPadの色は選べますか？</p>
              <p className="ans">iPadの色はシルバーのみのご提供となります。</p>
            </div>
            <div className="is-faq-box">
              <p className="ques">タブレットはiPad以外の取り扱いもありますか？</p>
              <p className="ans">弊社iPadのみのご提供となります。</p>
            </div>
            <div className="is-faq-box">
              <p className="ques">初期設定はされていますか？</p>
              <p className="ans">初期設定は実施しておりません。ご購入者様にて設定をお願い致します。</p>
            </div>
            <div className="is-faq-box">
              <h3>補償について</h3>
            </div>
            <div className="is-faq-box">
              <p className="ques">故障の場合は、全て補償してもらえますか？</p>
              <p className="ans">"ご加入の補償に関しては、自然故障とアクシデント物損(落下・破損・水没など)に関して対応可能です。
火災・落雷・地震・天災・盗難・紛失は、補償の対象外となります。
また、補償の対象は、iPad本体です。その他付属品・アクセサリー（キーボード/ケース/スタイラスペン/ACアダプター/USBケーブル等）は補償対象外です。"</p>
            </div>
            <div className="is-faq-box">
              <p className="ques">故障の場合の受付手順について</p>
              <p className="ans">ご購入いただいた店舗に持ち込んでください。修理が完了しましたら店舗よりお引き取りください。</p>
            </div>
            <div className="is-faq-box">
              <p className="ques">途中解約は可能ですか？</p>
              <p className="ans">途中解約はできません。期間は1年となります。</p>
            </div>
            <div className="is-faq-box">
              <h3>ご購入について</h3>
            </div>
            <div className="is-faq-box">
              <p className="ques">iPadだけ・タッチペンだけというように単体での購入はできますか？</p>
              <p className="ans">単体でのご提供はしておりません。</p>
            </div>
            <div className="is-faq-box">
              <p className="ques">初期不良があった場合はどうすればいいですか？</p>
              <p className="ans">商品受取後、3日以内に購入した書店へご連絡ください。 初期不良は、Apple側の判断になります。初期不良として認められない場合もございます。 商品受取後、４日以降のお問い合わせについては、保証サービスのサービス要綱に従ってご対応いたします。</p>
            </div>
            <div className="is-faq-box">
              <p className="ques">申込をキャンセルしたい場合はどうすればいいですか？</p>
              <p className="ans">"お申込後のキャンセルは原則受け付けておりません。
              但し、二重申込をしてしまった場合は、購入した書店までお問い合わせください。"</p>
            </div>
            <div className="is-faq-box">
              <p className="ques">商品のご契約取りについて</p>
              <p className="ans">商品について 書面での受け渡しとなります。</p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
