import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";

export interface KanbanItem {
  id: string;
  title: string;
  type: "Article" | "Video" | "Social";
  priority: "High" | "Medium" | "Low";
}

interface KanbanCardProps {
  item: KanbanItem;
}

export function KanbanCard({ item }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: "Item",
      item,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-background border-2 border-primary/20 rounded-lg h-[120px]"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors">
        <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium leading-none line-clamp-2">
            {item.title}
          </CardTitle>
          <GripVertical className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {item.type}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                item.priority === "High"
                  ? "text-red-500 border-red-500/20 bg-red-500/10"
                  : item.priority === "Medium"
                  ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/10"
                  : "text-green-500 border-green-500/20 bg-green-500/10"
              }`}
            >
              {item.priority}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
