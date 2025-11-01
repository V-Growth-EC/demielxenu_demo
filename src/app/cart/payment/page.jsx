'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import useCartStore from '../../store/cartStore';

export default function PaymentPage() {
  const [formData, setFormData] = useState({
    classroom: '',
    name: '',
    guardian: '',
    postal: '',
    prefecture: '',
    address: '',
    tel: '',
    email: '',
    payment_method: 'creditcard' // 更新預設值
  });

  const [errors, setErrors] = useState({});
  const [customerId, setCustomerId] = useState(null);
  const [orderFormData, setOrderFormData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orderFormLoading, setOrderFormLoading] = useState(false);

  const { cart, setProductDetail, getProductDetail } = useCartStore();
  const [productDetails, setProductDetailsState] = useState({});
  const [loading, setLoading] = useState(true);

  // 認証チェックとcustomer_id取得
  useEffect(() => {
    async function checkAuth() {
      try {
        setAuthLoading(true);
        const authRes = await fetch('/api/check-auth');
        const authData = await authRes.json();
        
        if (authData.customer_id && typeof authData.customer_id === 'number' && authData.customer_id !== -1) {
          setCustomerId(authData.customer_id);
          console.log('Customer ID obtained:', authData.customer_id);
          
          // order-form APIを呼び出し
          setOrderFormLoading(true);
          const orderFormRes = await fetch(`/api/order-form?customer_id=${authData.customer_id}`);
          const orderFormData = await orderFormRes.json();
          setOrderFormData(orderFormData);
          console.log('Order form data:', orderFormData);
          
          // 自動選擇第一個可用的付款方式
          if (orderFormData?.payments?.length > 0) {
            setFormData(prev => ({
              ...prev,
              payment_method: orderFormData.payments[0]
            }));
          }
        } else {
          console.log('Not authenticated or invalid customer_id');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthLoading(false);
        setOrderFormLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchAllDetails() {
      const details = {};
      for (const item of cart) {
        let detail = useCartStore.getState().productDetailsCache[item.product_id];
        console.log('productDetailsCache', useCartStore.getState().productDetailsCache, item.product_id, useCartStore.getState().productDetailsCache[item.product_id]);
        if (!detail) {
          const res = await fetch(`/api/product-detail?product_id=${item.product_id}`);
          detail = await res.json();
          setProductDetail(item.product_id, detail);
        }
        details[item.product_id] = detail;
      }
      setProductDetailsState(details);
      setLoading(false);
    }
    if (cart.length > 0) {
      setLoading(true);
      fetchAllDetails();
    } else {
      setProductDetailsState({});
      setLoading(false);
    }
  }, [cart]);

  const getSubtotal = (item) => {
    const product = productDetails[item.product_id] || {};
    let base = product.price || 0;
    let extra = 0;
    // if (item.stylus) extra += 3000;
    // if (item.keyboard) extra += 5000;
    return (base + extra) * item.quantity;
  };
  const subtotal = cart.reduce((sum, item) => sum + getSubtotal(item), 0);
  // const shipping = cart.length > 0 ? 1000 : 0;
  const shipping = 0;
  const total = subtotal + shipping;

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = {
      name: 'お名前',
      guardian: '保護者名',
      postal: '郵便番号',
      prefecture: '都道府県',
      address: '住所',
      tel: '電話番号',
      email: 'メールアドレス'
    };

    // 必須項目のチェック
    for (const [id, label] of Object.entries(requiredFields)) {
      if (!formData[id]) {
        newErrors[id] = `${label}を入力してください`;
      }
    }

    // 郵便番号の形式チェック
    if (formData.postal) {
      const postalPattern = /^\d{3}-?\d{4}$/;
      if (!postalPattern.test(formData.postal)) {
        newErrors.postal = '郵便番号は正しい形式で入力してください（例：123-4567）';
      }
    }

    // 電話番号の形式チェック
    if (formData.tel) {
      const telPattern = /^\d{2,4}-?\d{2,4}-?\d{3,4}$/;
      if (!telPattern.test(formData.tel)) {
        newErrors.tel = '電話番号は正しい形式で入力してください（例：03-1234-5678）';
      }
    }

    // メールアドレスの形式チェック
    if (formData.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        newErrors.email = 'メールアドレスは正しい形式で入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit', e);
    if (validateForm()) {
      const orderId = Date.now();
      const amount = total;
      
      // 商品情報を準備 - 数量を考慮してグループ化
      const productGroups = {};
      
      // 商品をグループ化
      console.log('cart', cart);
      cart.forEach(item => {
        // cartStoreのgetProductDetailを使用して商品詳細を取得
        const productDetail = getProductDetail(item.product_id);
        console.log('productDetail', productDetail);
        const productName = productDetail.product_name;
        const productId = item.product_id;
        
        if (!productGroups[productId]) {
          productGroups[productId] = {
            name: productName,
            id: productId,
            quantity: 0
          };
        }
        productGroups[productId].quantity += item.quantity;
      });
      
      // フォーマットされた文字列を生成
      const productNames = Object.values(productGroups)
        .map(group => `${group.name}x${group.quantity}`)
        .join('/');
      
      const productIds = Object.values(productGroups)
        .map(group => `${group.id}x${group.quantity}`)
        .join('/');
      
      // 完全な注文データを準備
      const orderData = {
        orderId,
        amount,
        classroom: formData.classroom,
        userName: formData.name,
        email: formData.email,
        // ユーザー入力データ
        customerInfo: {
          name: formData.name,
          guardian: formData.guardian,
          postal: formData.postal,
          prefecture: formData.prefecture,
          address: formData.address,
          tel: formData.tel,
          email: formData.email,
          payment_method: formData.payment_method
        },
        // 商品情報
        products: {
          names: productNames,
          ids: productIds,
          items: cart,
          productDetails: productDetails
        },
        // 金額情報
        pricing: {
          subtotal,
          shipping,
          total
        }
      };
      console.log('orderData', orderData);
      const res = await fetch('/api/gmo-linkpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      console.log('res', res);
      const data = await res.json();
      console.log('data', data);
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  return (
    <>
      <Header />
      
      <ul className="is-cart_navi flex flerx-stretch">
        <li>カート</li>
        <li className="current">情報入力</li>
        <li>注文完了</li>
      </ul>

      <div className="is-cart-wrap is-payment">
        <div className="is-cart-wrap-flex flex-set">
        <main className="is-page-main is-cart-main">
  <form className="cart-form" onSubmit={handleSubmit} noValidate>
    <div className="form-group">
      <label htmlFor="classroom">教室名<span className="required">必須</span></label>
      <div className="select-wrapper">
        <select id="classroom" name="classroom" required>
          <option value="">選択してください</option>
          {orderFormData?.field?.[0]?.menu?.map((classroom, index) => (
            <option key={index} value={classroom}>
              {classroom}
            </option>
          ))}
        </select>
      </div>
    </div>
    <div className="form-group">
      <label htmlFor="name">お名前<span className="required">必須</span></label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      {errors.name && <span className="error-message">{errors.name}</span>}
    </div>
    <div className="form-group">
      <label htmlFor="guardian">保護者名<span className="required">必須</span></label>
      <input
        type="text"
        id="guardian"
        name="guardian"
        value={formData.guardian}
        onChange={handleChange}
        required
      />
      {errors.guardian && <span className="error-message">{errors.guardian}</span>}
    </div>
    <div className="form-group">
      <label htmlFor="postal">郵便番号<span className="required">必須</span></label>
      <input
        type="text"
        id="postal"
        name="postal"
        value={formData.postal}
        onChange={handleChange}
        pattern="\d{3}-?\d{4}"
        placeholder="例：123-4567"
        required
      />
      {errors.postal && <span className="error-message">{errors.postal}</span>}
    </div>
    <div className="form-group">
      <label htmlFor="prefecture">都道府県<span className="required">必須</span></label>
      <div className="select-wrapper">
        <select
          id="prefecture"
          name="prefecture"
          value={formData.prefecture}
          onChange={handleChange}
          required
        >
          <option value="">選択してください</option>
          {orderFormData?.field?.[4]?.menu?.map((prefecture, index) => (
            <option key={index} value={prefecture}>
              {prefecture}
            </option>
          ))}
        </select>
      </div>
      {errors.prefecture && <span className="error-message">{errors.prefecture}</span>}
    </div>
    <div className="form-group">
      <label htmlFor="address">住所<span className="required">必須</span></label>
      <input
        type="text"
        id="address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
      />
      {errors.address && <span className="error-message">{errors.address}</span>}
    </div>
    <div className="form-group">
      <label htmlFor="tel">電話番号<span className="required">必須</span></label>
      <input
        type="tel"
        id="tel"
        name="tel"
        value={formData.tel}
        onChange={handleChange}
        pattern="\d{2,4}-?\d{2,4}-?\d{3,4}"
        placeholder="例：03-1234-5678"
        required
      />
      {errors.tel && <span className="error-message">{errors.tel}</span>}
    </div>
    <div className="form-group">
      <label htmlFor="email">メールアドレス<span className="required">必須</span></label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      {errors.email && <span className="error-message">{errors.email}</span>}
    </div>
    <button type="submit"  style={{display: 'none'}} className="btn-cart">決済する</button>
  </form>
</main>

          <aside className="aside aside-cart aside-cart-peyment">
            <div className="aside-cart_box">
              <p className="ttl-main">お買い物カゴ</p>
              <form className="cart-form" onSubmit={handleSubmit}>
                <table className="table_clm table_clm-cart_side">
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={2}>金額計算中...</td></tr>
                    ) : (
                      <>
                        <tr>
                          <th>小計</th>
                          <td>¥{subtotal.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <th>送料</th>
                          <td>¥{shipping.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <th>合計</th>
                          <td>¥{total.toLocaleString()}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>

                <div className="howto_payment">
                  <p className="ttl-main">決済方法</p>
                  <div className="payment-options">
                    {orderFormData?.payments?.includes('creditcard') && (
                      <label className="payment-options_item">
                        <input
                          type="radio"
                          name="payment_method"
                          value="creditcard"
                          checked={formData.payment_method === 'creditcard'}
                          onChange={handleChange}
                        />
                        <span>クレジットカード決済</span>
                      </label>
                    )}
                    {orderFormData?.payments?.includes('banking') && (
                      <label className="payment-options_item">
                        <input
                          type="radio"
                          name="payment_method"
                          value="banking"
                          checked={formData.payment_method === 'banking'}
                          onChange={handleChange}
                        />
                        <span>銀行振込</span>
                      </label>
                    )}
                    {/* 代金引換は現在無効 */}
                    {/* {orderFormData?.payments?.includes('apply') && (
                      <label className="payment-options_item">
                        <input
                          type="radio"
                          name="payment_method"
                          value="apply"
                          checked={formData.payment_method === 'apply'}
                          onChange={handleChange}
                        />
                        <span>代金引換</span>
                      </label>
                    )} */}
                  </div>
                </div>
                <button type="submit" className="btn-cart">決済する</button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
