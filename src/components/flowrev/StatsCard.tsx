import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantStyles = {
  default: 'bg-card',
  success: 'bg-success/5 border-success/20',
  warning: 'bg-warning/5 border-warning/20',
  danger: 'bg-destructive/5 border-destructive/20',
  info: 'bg-info/5 border-info/20',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
};

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  variant = 'default' 
}: StatsCardProps) {
  return (
    <Card className={cn("bg-white rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]")}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{title}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            {description && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">{description}</p>
            )}
          </div>
          
          {icon && (
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] bg-slate-50 text-slate-900",
              iconStyles[variant] // Kept for text color override if needed, but forced bg to clash with brutalism
            )}>
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-1.5 text-xs">
            {trend.value > 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            ) : trend.value < 0 ? (
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={cn(
              "font-medium",
              trend.value > 0 ? "text-success" : trend.value < 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
