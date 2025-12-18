import { useQuery } from "@tanstack/react-query";
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

// Simple store to simulate logged in user for testing/dev purposes
// In production, this would come from supabase.auth.getUser() matching with the flowrev_users table
interface AuthState {
    selectedEmail: string;
    setSelectedEmail: (email: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            selectedEmail: 'jonathan.silva@aec.com.br', // Default to Gerente for full access initially
            setSelectedEmail: (email) => set({ selectedEmail: email }),
        }),
        {
            name: 'flowrev-auth-storage',
        }
    )
);

export function useCurrentUser() {
    const selectedEmail = useAuthStore((state) => state.selectedEmail);

    return useQuery({
        queryKey: ['current-user', selectedEmail],
        queryFn: async () => {
            // In a real scenario, we might use: const { data: { user } } = await supabase.auth.getUser();
            // And filter by user.email. For now, we rely on the implementation plan's "Simulated" auth.

            const { data, error } = await supabase
                .from('flowrev_users')
                .select('*')
                .eq('email', selectedEmail)
                .single();

            if (error) {
                console.error("Error fetching user profile:", error);
                return null;
            }

            return data as UserProfile;
        },
    });
}

export function usePermissions() {
    const { data: user } = useCurrentUser();

    const canAccessProduct = (productSlug: string) => {
        if (!user) return false;
        if (user.role === 'gerente') return true; // Full access
        return user.produtos_acesso?.includes(productSlug) || false;
    };

    const canPerformAction = (action: 'approve' | 'edit' | 'upload' | 'admin_view') => {
        if (!user) return false;

        switch (action) {
            case 'approve': // Only Analista, Coordenador, Gerente
                return ['analista', 'coordenador', 'gerente'].includes(user.role);

            case 'edit': // Supervisor, Analista Pleno
                // Analista can also edit status but maybe not content? Prompt says "Não realizam edição operacional" for Gerente/Coord (optional)
                // Let's stick to the prompt:
                // Supervisor/Pleno: Criar, editar, enviar.
                // Analista: Alterar status, aprovar.
                // Gerente/Coord: Visualizar (Read Only mainly)
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
