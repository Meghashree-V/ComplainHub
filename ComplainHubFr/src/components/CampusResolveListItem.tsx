import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { CampusResolve } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { motion } from "framer-motion";
import { FileText, MoreHorizontal, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CampusResolveListItemProps {
  campusResolve: CampusResolve;
  onStatusChange?: (id: string, status: CampusResolve["status"]) => void;
  onAddComment?: (id: string, comment: string) => Promise<void>;
  isAdmin?: boolean;
  index?: number;
}

const CampusResolveListItem = ({
  campusResolve,
  onStatusChange,
  isAdmin = false,
  index = 0,
}: CampusResolveListItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const basePath = isAdmin ? "/admin/complaints" : "/complaints";

  const getPriorityColor = (priority: CampusResolve["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  // Parse and validate the date
  let createdAt = null;
  try {
    if (campusResolve.createdAt) {
      const dateValue = typeof campusResolve.createdAt === 'object' && 
        campusResolve.createdAt !== null && 
        'seconds' in campusResolve.createdAt
        ? new Date((campusResolve.createdAt as any).seconds * 1000)
        : new Date(campusResolve.createdAt);
      if (!isNaN(dateValue.getTime())) {
        createdAt = dateValue;
      }
    }
  } catch (error) {
    console.warn(`Error parsing date for campusResolve ID: ${campusResolve.id}`);
  }

  const priority = typeof campusResolve.priority === 'string' ? campusResolve.priority : "low";
  const category = campusResolve.category || "general";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`glass-card rounded-lg p-4 mb-3 transition-all duration-300 ${
        isHovered ? "shadow-md" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-teal-100 ${getPriorityColor(priority)}`}>
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <Link to={`${basePath}/${campusResolve.id}`} className="font-bold text-lg hover:underline text-teal-900 dark:text-teal-200">
              {campusResolve.title}
            </Link>
            <div className="text-xs text-muted-foreground mt-1">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
            {createdAt && (
              <div className="text-xs text-muted-foreground mt-1">
                <Clock className="inline h-3 w-3 mr-1" />
                {format(createdAt, "PPP p")}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 sm:mt-0 self-end sm:self-center">
          <StatusBadge status={campusResolve.status} className="bg-teal-500 text-white" />
          {isAdmin && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Change status">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStatusChange?.(campusResolve.id, "resolved")}
                    className="text-green-600">
                    Mark as Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange?.(campusResolve.id, "in-progress")}
                    className="text-blue-600">
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange?.(campusResolve.id, "pending")}
                    className="text-yellow-600">
                    Mark as Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange?.(campusResolve.id, "rejected")}
                    className="text-red-500">
                    Reject Campus Resolve
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to={`${basePath}/${campusResolve.id}`}>
                <Button variant="ghost" size="icon" aria-label="View comments">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CampusResolveListItem;
