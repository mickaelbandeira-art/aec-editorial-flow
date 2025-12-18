import { useAuthStore } from "@/hooks/usePermission";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
    const { user } = useAuthStore();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
