import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = 'supervisor' | 'analista_pleno' | 'analista' | 'coordenador' | 'gerente';

export interface UserProfile {
    id: string;
    email: string;
    nome: string;
    matricula: string;
    role: UserRole;
    produtos_acesso: string[]; // Slugs
}

interface AuthState {
    user: UserProfile | null;
    login: (user: UserProfile) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            login: (user) => set({ user }),
            logout: () => set({ user: null }),
        }),
        {
            name: 'flowrev-auth-storage',
        }
    )
);

export function useCurrentUser() {
    const user = useAuthStore((state) => state.user);
    // Return user directly from store to stay sync, or refetch if needed.
    // Since we save full profile on login, we can return it directly.
    return { data: user };
}

export function usePermissions() {
    const { data: user } = useCurrentUser();

    const canAccessProduct = (productSlug: string) => {
        if (!user) return false;

        // Hardcoded overrides for specific users/cases
        if (user.email === 'mickael.bandeira@aec.com.br') {
            if (productSlug === 'claro') return true;
            if (productSlug === 'fabrica') return false;
        }

        if (user.role === 'gerente') return true; // Full access
        return user.produtos_acesso?.includes(productSlug) || false;
    };

    const canPerformAction = (action: 'approve' | 'edit' | 'upload' | 'admin_view') => {
        if (!user) return false;

        switch (action) {
            case 'approve': // Only Analista, Coordenador, Gerente
                return ['analista', 'coordenador', 'gerente'].includes(user.role);

            case 'edit': // Supervisor, Analista Pleno
                return ['supervisor', 'analista_pleno'].includes(user.role);

            case 'upload':
                return ['supervisor', 'analista_pleno'].includes(user.role);

            case 'admin_view': // Dashboards, etc.
                return ['coordenador', 'gerente'].includes(user.role);

            default:
                return false;
        }
    };

    return {
        user,
        canAccessProduct,
        canPerformAction,
        role: user?.role
    };
}
