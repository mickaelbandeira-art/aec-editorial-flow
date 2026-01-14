
import { useMemo } from "react";
import { usePermissions } from "@/hooks/usePermission";

export interface DeadlineNotification {
    title: string;
    message: string;
    isUrgent: boolean;
    deadlineDay: number;
    daysRemaining: number;
    type: 'deadline';
}

export function useDeadlineNotifications() {
    const { user } = usePermissions();

    const notification = useMemo<DeadlineNotification | null>(() => {
        if (!user) return null;

        // Roles that should see the alert
        const allowedRoles = ['supervisor', 'analista_pleno', 'coordenador', 'gerente'];
        if (!allowedRoles.includes(user.role)) return null;

        const now = new Date();
        const currentDay = now.getDate();

        let targetPhase = "";
        let deadlineDay = 0;
        let daysRes = 0;

        // Logic from DeadlineAlert.tsx

        // 1. Check for Textual Insumos (Due Day 25)
        // Window: 22, 23, 24, 25
        if (currentDay >= 22 && currentDay <= 25) {
            targetPhase = "Insumos Textuais";
            deadlineDay = 25;
            daysRes = 25 - currentDay;
        }
        // 2. Check for Big Numbers (Due Day 01 of NEXT month OR Today if 01)
        else if (currentDay >= 28 || currentDay === 1) {
            targetPhase = "Big Numbers";
            deadlineDay = 1;

            if (currentDay === 1) {
                daysRes = 0;
            } else {
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                daysRes = daysInMonth - currentDay + 1;
            }
        }
        // 3. Check for Production/Validation (Due Day 09)
        // Window: 6, 7, 8, 9
        else if (currentDay >= 6 && currentDay <= 9) {
            targetPhase = "Finalização da Produção";
            deadlineDay = 9;
            daysRes = 9 - currentDay;
        }

        if (!targetPhase) return null;

        return {
            title: `Prazo de ${targetPhase}`,
            message: `Vence dia ${deadlineDay.toString().padStart(2, '0')} (${daysRes === 0 ? 'HOJE' : daysRes + ' dias'})`,
            isUrgent: daysRes <= 1,
            deadlineDay,
            daysRemaining: daysRes,
            type: 'deadline'
        };

    }, [user]);

    return notification;
}
