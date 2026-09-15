import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      cart: [],
      isCartOpen: false,
      wishlist: [],
      isDarkMode: false,

      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (typeof window !== 'undefined') {
          if (token) localStorage.setItem('authToken', token);
          else localStorage.removeItem('authToken');
        }
        set({ token });
      },
      login: (user, token) => {
        if (typeof window !== 'undefined') localStorage.setItem('authToken', token);
        set({ user, token });
      },
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('authToken');
        set({ user: null, token: null });
      },

      setCartOpen: (open) => set({ isCartOpen: open }),
      addToCart: (product, qty = 1, variant = null) => {
        set((state) => {
          const productId = product._id || product.id;
          const existingIndex = state.cart.findIndex(item => item.id === productId);
          let updatedCart;
          if (existingIndex > -1) {
            updatedCart = [...state.cart];
            updatedCart[existingIndex].quantity += qty;
          } else {
            updatedCart = [...state.cart, {
              id: productId,
              name: product.name,
              price: variant?.price || product.basePrice || 0,
              quantity: qty,
              imageUrl: product.images?.[0]?.url || '/Apple-iPhone-18-Pro.png',
              variant,
            }];
          }
          return { cart: updatedCart, isCartOpen: true };
        });
      },
      removeFromCart: (productId) => {
        set((state) => ({ cart: state.cart.filter(item => item.id !== productId) }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          cart: state.cart.map(item => item.id === productId ? { ...item, quantity } : item),
        }));
      },
      clearCart: () => set({ cart: [] }),

      toggleWishlist: (product) => {
        set((state) => {
          const productId = typeof product === 'object' ? (product._id || product.id) : product;
          const exists = state.wishlist.some(w => {
            const wId = typeof w === 'object' ? (w._id || w.id) : w;
            return wId === productId;
          });
          if (exists) {
            return { wishlist: state.wishlist.filter(w => {
              const wId = typeof w === 'object' ? (w._id || w.id) : w;
              return wId !== productId;
            })};
          } else {
            return { wishlist: [...state.wishlist, typeof product === 'object' ? product : productId] };
          }
        });
      },

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'alphai-store-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        cart: state.cart,
        wishlist: state.wishlist,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);

export default useStore;
export const useCartStore = () => useStore();
