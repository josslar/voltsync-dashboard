import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  email: string | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      email: null,
      login: (email) => set({ email }),
      logout: () => set({ email: null }),
    }),
    { name: "voltrex-auth" },
  ),
);
