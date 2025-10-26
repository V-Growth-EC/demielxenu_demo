import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// カートデータの形式
// [
//   {
//     product_id: string | number,
//     quantity: number,
//     stylus: boolean,
//     keyboard: boolean
//   },
//   ...
// ]

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      // 強制重新水合購物車狀態
      rehydrate: () => {
        const stored = localStorage.getItem('cart-storage');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.state && parsed.state.cart) {
              console.log('重新水合購物車狀態:', parsed.state.cart);
              set({ cart: parsed.state.cart });
            }
          } catch (error) {
            console.error('購物車狀態解析錯誤:', error);
          }
        }
      },
      addToCart: (product, options = { quantity: 1, stylus: false, keyboard: false }) => {
        console.log('10/21 12:18test_加入購物車:', product.product_id, '數量:', options.quantity);
        set(state => {
          // 確保類型一致比較
          const idx = state.cart.findIndex(item => String(item.product_id) === String(product.product_id));
          console.log('找到商品索引:', idx, '當前購物車:', state.cart);
          if (idx > -1) {
            // 既存の場合は数量とオプションを更新
            const updated = [...state.cart];
            const oldQuantity = updated[idx].quantity;
            const newQuantity = oldQuantity + options.quantity;
            console.log('累加數量:', oldQuantity, '+', options.quantity, '=', newQuantity);
            updated[idx] = {
              ...updated[idx],
              quantity: newQuantity,
              stylus: options.stylus,
              keyboard: options.keyboard,
            };
            console.log('更新後的購物車:', updated);
            return { cart: updated };
          } else {
            // 新規追加
            console.log('新商品，直接添加');
            return {
              cart: [
                ...state.cart,
                {
                  product_id: product.product_id,
                  quantity: options.quantity,
                  stylus: options.stylus,
                  keyboard: options.keyboard,
                },
              ],
            };
          }
        });
      },
      getCartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
      clearCart: () => set({ cart: [] }),
      // 商品詳細情報のキャッシュ
      productDetailsCache: {},
      setProductDetail: (product_id, detail) => {
        console.log('加入暫存:', product_id, detail);
        return set(state => ({
          productDetailsCache: {
            ...state.productDetailsCache,
            [product_id]: detail,
          },
        }));
      },
      getProductDetail: (product_id) => get().productDetailsCache[product_id],
      clearProductDetailsCache: () => set({ productDetailsCache: {} }),
      updateCartQuantity: (product_id, quantity) => {
        const newQuantity = Math.max(1, Number(quantity));
        console.log('更新購物車數量:', product_id, '從', quantity, '到', newQuantity);
        set(state => {
          const updatedCart = state.cart.map(item => {
            // 確保類型一致比較
            if (String(item.product_id) === String(product_id)) {
              console.log('找到商品，更新數量:', item.product_id, item.quantity, '->', newQuantity);
              return { ...item, quantity: newQuantity };
            }
            return item;
          });
          console.log('更新後的購物車:', updatedCart);
          return { cart: updatedCart };
        });
      },
      // 商品削除
      removeFromCart: (product_id) => {
        console.log('刪除商品:', product_id);
        set(state => {
          const updatedCart = state.cart.filter(item => String(item.product_id) !== String(product_id));
          console.log('刪除後的購物車:', updatedCart);
          return { cart: updatedCart };
        });
      },
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({ cart: state.cart }), // productDetailsCache は永続化しない
      version: 1, // 添加版本控制
      migrate: (persistedState, version) => {
        // 版本遷移邏輯
        if (version === 0) {
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);

export default useCartStore; 