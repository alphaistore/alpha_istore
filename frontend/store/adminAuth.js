import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAdminAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      admin: null,
      token: null,
      login: (admin) => {
        if (typeof window !== 'undefined' && admin.token) {
          localStorage.setItem('adminAuthToken', admin.token);
          localStorage.setItem('authToken', admin.token);
        }
        set({ isAuthenticated: true, admin, token: admin.token });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminAuthToken');
          localStorage.removeItem('authToken');
        }
        set({ isAuthenticated: false, admin: null, token: null });
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        admin: state.admin,
        token: state.token,
      }),
    }
  )
);

export default useAdminAuthStore;