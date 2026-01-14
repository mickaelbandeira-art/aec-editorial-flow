
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarClock } from "lucide-react";
import { useDeadlineNotifications } from "@/hooks/useDeadlineNotifications";

export function DeadlineAlert() {
    const alertInfo = useDeadlineNotifications();

    if (!alertInfo) return null;

    return (
        <Alert variant={alertInfo.isUrgent ? "destructive" : "default"} className={`mb-6 border-l-4 ${!alertInfo.isUrgent ? 'border-l-amber-500 bg-amber-50' : 'border-l-red-500 bg-red-50'}`}>
            <CalendarClock className={`h-5 w-5 ${alertInfo.isUrgent ? 'text-red-600' : 'text-amber-600'}`} />
            <div className="ml-2">
                <AlertTitle className={`${alertInfo.isUrgent ? 'text-red-800' : 'text-amber-800'} font-bold flex items-center gap-2`}>
                    {alertInfo.title}
                </AlertTitle>
                <AlertDescription className={`${alertInfo.isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
                    {alertInfo.message}
                    <br />
                    <span className="font-semibold text-xs mt-1 block opacity-90">
                        ⚠️ Fique atento aos finais de semana e feriados!
                    </span>
                </AlertDescription>
            </div>
        </Alert>
    );
}
