import { Shield } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SecurityBadgeProps {
  userId: string;
  testId: string;
}

export const SecurityBadge = ({ userId, testId }: SecurityBadgeProps) => {
  const sessionId = userId.slice(0, 8);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 border border-border/50 cursor-help">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Monitored
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p className="font-medium">Session: {sessionId}</p>
            <p className="text-muted-foreground mt-0.5">Recording Prohibited</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
