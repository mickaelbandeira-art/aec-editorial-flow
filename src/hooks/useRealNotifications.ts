import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermission";
import { useDeadlineNotifications } from "./useDeadlineNotifications";

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: 'deadline' | 'adjustment' | 'approved' | 'sent' | 'info';
    date: Date;
    isUrgent?: boolean;
    read?: boolean;
}

export function useRealNotifications() {
    const { user } = usePermissions();
    const deadlineAlert = useDeadlineNotifications();

    return useQuery({
        queryKey: ['flowrev-notifications', user?.id],
        queryFn: async () => {
            const notifications: NotificationItem[] = [];

            // 1. Add Deadline Alert if exists
            if (deadlineAlert) {
                notifications.push({
                    id: 'deadline-alert',
                    title: deadlineAlert.title,
                    message: deadlineAlert.message,
                    type: 'deadline',
                    date: new Date(),
                    isUrgent: deadlineAlert.isUrgent
                });
            }

            // 2. Fetch Recent Activities (Last 3 days)
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            const { data: recentInsumos, error } = await supabase
                .from('flowrev_insumos')
                .select(`
                    id, 
                    titulo, 
                    status, 
                    updated_at, 
                    tipo_insumo(nome),
                    motivo_ajuste,
                    edicao(produto(nome))
                `)
                .gte('updated_at', threeDaysAgo.toISOString())
                .order('updated_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error("Error fetching notifications:", error);
                return notifications;
            }

            // 3. Process Insumos into Notifications
            recentInsumos?.forEach(insumo => {
                const date = new Date(insumo.updated_at);
                const produto = insumo.edicao?.produto?.nome || '';
                const nome = insumo.titulo || insumo.tipo_insumo?.nome || 'Insumo sem nome';

                if (insumo.status === 'ajuste_solicitado') {
                    notifications.push({
                        id: `ajuste-${insumo.id}`,
                        title: 'Ajuste Solicitado',
                        message: `${nome} (${produto}) requer revisão.`,
                        type: 'adjustment',
                        date,
                        isUrgent: true
                    });
                } else if (insumo.status === 'aprovado') {
                    notifications.push({
                        id: `aprovado-${insumo.id}`,
                        title: 'Insumo Aprovado',
                        message: `${nome} (${produto}) foi aprovado!`,
                        type: 'approved',
                        date
                    });
                } else if (insumo.status === 'enviado') {
                    notifications.push({
                        id: `enviado-${insumo.id}`,
                        title: 'Insumo Enviado',
                        message: `${nome} (${produto}) enviado para análise.`,
                        type: 'sent',
                        date
                    });
                }
            });

            // Sort by date descending
            return notifications.sort((a, b) => b.date.getTime() - a.date.getTime());
        },
        // Refresh every minute
        refetchInterval: 60 * 1000,
        enabled: !!user
    });
}
