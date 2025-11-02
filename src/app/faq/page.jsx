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

  // 按分类组织 FAQ 数据
  const organizedFAQs = faqData && faqData['faq-body'] && Array.isArray(faqData['faq-body']) 
    ? faqData['faq-category']?.map(category => ({
        category,
        items: faqData['faq-body'].filter(faq => faq.category === category)
      })) || []
    : [];

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
            {loading ? (
              <div>読み込み中...</div>
            ) : error ? (
              <div style={{ color: 'red' }}>{error}</div>
            ) : organizedFAQs.length > 0 ? (
              organizedFAQs.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <div className="is-faq-box">
                    <h3>{section.category}</h3>
                  </div>
                  {section.items.map((faq, faqIndex) => (
                    <div key={faqIndex} className="is-faq-box">
                      <p className="ques">{faq.question}</p>
                      <p className="ans">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div>FAQデータが見つかりませんでした。</div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
