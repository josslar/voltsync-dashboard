import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
    {
      name: "voltrex-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as never),
      ),
      skipHydration: typeof window === "undefined",
    },
  ),
);
