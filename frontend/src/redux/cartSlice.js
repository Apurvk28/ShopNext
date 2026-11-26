import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const itemId = item._id || item.productId;
      const existItem = state.cartItems.find(
        (x) => (x._id || x.productId) === itemId
      );

      // Dynamically use the product's actual stock value
      const availableStock = typeof item.stock === 'number'
        ? item.stock
        : (existItem && typeof existItem.stock === 'number' ? existItem.stock : undefined);

      const requestedQty = Number(item.qty) || 1;
      const finalQty = typeof availableStock === 'number'
        ? Math.max(1, Math.min(requestedQty, availableStock))
        : Math.max(1, requestedQty);

      const itemWithStock = {
        ...item,
        stock: availableStock,
        qty: finalQty,
      };

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          (x._id || x.productId) === itemId ? itemWithStock : x
        );
      } else {
        state.cartItems.push(itemWithStock);
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => (x._id || x.productId) !== action.payload
      );
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
