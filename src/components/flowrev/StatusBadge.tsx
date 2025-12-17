import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { InsumoStatus } from '@/types/flowrev';
import { STATUS_LABELS } from '@/types/flowrev';
import { 
  Circle, 
  Edit, 
  Send, 
  Eye, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

interface StatusBadgeProps {
  status: InsumoStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<InsumoStatus, { 
  bg: string; 
  text: string;
  icon: React.ElementType;
}> = {
  nao_iniciado: { 
    bg: 'bg-muted', 
    text: 'text-muted-foreground',
    icon: Circle
  },
  em_preenchimento: { 
    bg: 'bg-warning/10', 
    text: 'text-warning',
    icon: Edit
  },
  enviado: { 
    bg: 'bg-info/10', 
    text: 'text-info',
    icon: Send
  },
  em_analise: { 
    bg: 'bg-purple-500/10', 
    text: 'text-purple-500',
    icon: Eye
  },
  ajuste_solicitado: { 
    bg: 'bg-destructive/10', 
    text: 'text-destructive',
    icon: AlertTriangle
  },
  aprovado: { 
    bg: 'bg-success/10', 
    text: 'text-success',
    icon: CheckCircle2
  },
};

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.bg, 
        config.text,
        sizeClasses[size],
        "font-medium border-transparent gap-1.5"
      )}
    >
      {showIcon && <Icon className={cn(
        size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'
      )} />}
      {STATUS_LABELS[status]}
    </Badge>
  );
}
