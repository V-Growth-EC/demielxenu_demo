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
              set({ cart: parsed.state.cart });
            }
          } catch (error) {
            console.error('カートの状態解析エラー:', error);
          }
        }
      },
      addToCart: (product, options = { quantity: 1, stylus: false, keyboard: false }) => {
        
        set(state => {
          // 確保類型一致比較
          const idx = state.cart.findIndex(item => String(item.product_id) === String(product.product_id));
          
          if (idx > -1) {
            // 既存の場合は数量とオプションを更新
            const updated = [...state.cart];
            const oldQuantity = updated[idx].quantity;
            const newQuantity = oldQuantity + options.quantity;
            updated[idx] = {
              ...updated[idx],
              quantity: newQuantity,
              stylus: options.stylus,
              keyboard: options.keyboard,
            };
            return { cart: updated };
          } else {
            // 新規追加
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
        set(state => {
          const updatedCart = state.cart.map(item => {
            // 確保類型一致比較
            if (String(item.product_id) === String(product_id)) {
              return { ...item, quantity: newQuantity };
            }
            return item;
          });
          return { cart: updatedCart };
        });
      },
      // 商品削除
      removeFromCart: (product_id) => {
        set(state => {
          const updatedCart = state.cart.filter(item => String(item.product_id) !== String(product_id));
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