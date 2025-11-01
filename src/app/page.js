'use client';

import Header from './components/Header';
import MainVisualSwiper from './components/MainVisualSwiper';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [productError, setProductError] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  console.log("8/23HomePage");
  // 検索キーワードをURLから取得
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchKeyword = urlParams.get('keyword');
    if (searchKeyword) {
      setKeyword(searchKeyword);
    }
  }, []);

  // 商品リスト用 API 取得
  useEffect(() => {
    setLoading(true);
    setProductError('');
    
    // まず customer_id を取得
    fetch('/api/check-auth')
      .then(res => res.json())
      .then(auth => {
        if (auth.customer_id && typeof auth.customer_id === 'number' && auth.customer_id !== -1) {
          // すべての商品リストを取得
          return fetch(`/api/product-overview?customer_id=${auth.customer_id}`);
        } else {
          throw new Error('認証されていません');
        }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        } else {
          setProductError('商品データが見つかりません');
        }
      })
      .catch(() => setProductError('商品 API 接続エラー'))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 前端検索フィルタリング機能
  useEffect(() => {
    console.log("keyword:", keyword);
    if (keyword && keyword.trim()) {
      const searchTerm = keyword.toLowerCase();
      const filtered = allProducts.filter(product => {
        console.log("product:", product);
        // 搜索產品名字
        const nameMatch = product.product_name && 
          product.product_name.toLowerCase().includes(searchTerm);
        
        // 搜索產品描述
        const descriptionMatch = product.description && 
          product.description.toLowerCase().includes(searchTerm);
        
        return nameMatch || descriptionMatch;
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(allProducts);
    }
  }, [keyword, allProducts]);

  return (
    <>
      <Header />

      <MainVisualSwiper />

      <div className="is-home-wrap flex-set">
        
        <aside className="aside">
          <nav className="aside-box aside-nav">
            <div className="aside-nav-box">
              <p className="ttl">カテゴリから探す</p>
              <ul className="aside-nav_lists">
                <li className="aside-nav_lists__item"><a href="">パソコン</a></li>
                <li className="aside-nav_lists__item"><a href="">タブレット</a></li>
                <li className="aside-nav_lists__item"><a href="">スマートフォン</a></li>
                <li className="aside-nav_lists__item"><a href="">アクセサリ</a></li>
              </ul>
            </div>
            <div className="aside-nav-box">
              <p className="ttl">サービス</p>
              <ul className="aside-nav_lists">
                <li className="aside-nav_lists__item"><a href="">補償</a></li>
                <li className="aside-nav_lists__item"><a href="">安心・安全</a></li>
                <li className="aside-nav_lists__item"><a href="">遠隔サポート</a></li>
                <li className="aside-nav_lists__item"><a href="">即日利用可能</a></li>
              </ul>
            </div>
            <div className="aside-nav-box">
              <p className="ttl">おすすめコンテンツ</p>
              <ul className="aside-nav_lists">
                <li className="aside-nav_lists__item"><a href="">プログラミング学習</a></li>
                <li className="aside-nav_lists__item"><a href="">科学・電子工作</a></li>
                <li className="aside-nav_lists__item"><a href="">オーディオ</a></li>
                <li className="aside-nav_lists__item"><a href="">中古品</a></li>
              </ul>
            </div>
          </nav>
          <div className="aside-box aside-link aside-link-howtouse">
            <p className="btn">
              <span className="jp">はじめての方へ</span>
              <span className="en">HOW TO USE</span>
            </p>
          </div>
        </aside> 

        {/* メインコンテンツ（商品リスト） */}
        <main className="is-page-main is-home-main">
          <article className="article article-products article-clm">
            {keyword && (
              <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <p>検索結果: "{keyword}" ({filteredProducts.length}件)</p>
              </div>
            )}
            
            {productError ? (
              <div style={{ color: 'red' }}>{productError}</div>
            ) : loading ? (
              <div>読み込み中...</div>
            ) : filteredProducts.length === 0 ? (
              <div>
                {keyword ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <p>「{keyword}」に一致する商品が見つかりませんでした。</p>
                    <p>別のキーワードで検索してください。</p>
                  </div>
                ) : (
                  <div>商品が見つかりませんでした。</div>
                )}
              </div>
            ) : (
              <ul className="article-clm_lists article-clm_lists-3 article-products_lists flex-set">
                {filteredProducts.map((p) => (
                  <li key={p.product_id} className="article-clm_lists__item article-products_lists__item clm_item">
                    <div className="thumb">
                      <img src={p.thumbnail_img} alt={p.product_name} />
                    </div>
                    <div className="txt">
                      <h3 className="ttl-post">{p.product_name}</h3>
                      <div className="conv flex flex-stretch">
                        <p className="price en">¥{p.price?.toLocaleString()}<small>(税込)</small></p>
                        <p className="btn-more"><span>カートに入れる</span></p>
                      </div>
                    </div>
                    <a href={`/products?product_id=${p.product_id}`} className="box-link"></a>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </main>
      </div>

      {/* バナー */}
      <div className="ftr-bnr">
        <ul className="ftr-bnr_lists flex flex-stretch">
          <li className="ftr-bnr_lists__item"><a href=""><img src="/images/common/bnr-1.png" alt="" /></a></li>
          <li className="ftr-bnr_lists__item"><a href=""><img src="/images/common/bnr-2.png" alt="" /></a></li>
          <li className="ftr-bnr_lists__item"><a href=""><img src="/images/common/bnr-3.png" alt="" /></a></li>
        </ul>
      </div>
    </>
  );
}
