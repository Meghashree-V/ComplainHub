import { cn } from "@/lib/utils";
import { ComplaintStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
  showText?: boolean;
}

const statusStyles: Record<ComplaintStatus, { color: string; dot: string }> = {
  pending: {
    color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  "in-progress": {
    color: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  resolved: {
    color: "bg-green-500/20 text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  rejected: {
    color: "bg-red-500/20 text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
};

const statusTextMap: Record<ComplaintStatus, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const StatusBadge = ({ status, className = "", showText = true }: StatusBadgeProps) => {
  const { color, dot } = statusStyles[status] || {
    color: "bg-gray-500/20 text-gray-700 dark:text-gray-400",
    dot: "bg-gray-500",
  };

  const statusText = statusTextMap[status] || status;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit",
        color,
        className
      )}
      role="status"
      aria-label={`Status: ${statusText}`}
    >
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      {showText && <span>{statusText}</span>}
    </div>
  );
};

export default StatusBadge;