import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
    role: 'user' | 'admin' | null;
    user: User | null;
    lastPath: string | null;
    setRole: (role: 'user' | 'admin') => void;
    setUser: (user: User) => void;
    setLastPath: (path: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            role: null,
            user: null,
            lastPath: null,
            setRole: (role) => set({ role }),
            setUser: (user) => set({ user, role: user.role }),
            setLastPath: (path) => set({ lastPath: path }),
            logout: () => set({ role: null, user: null, lastPath: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);