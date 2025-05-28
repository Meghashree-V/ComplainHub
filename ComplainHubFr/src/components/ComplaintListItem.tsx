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
  complaint: CampusResolve;
  onStatusChange?: (id: string, status: CampusResolve["status"]) => void;
  onAddComment?: (id: string, comment: string) => Promise<void>;
  isAdmin?: boolean;
  index?: number;
}

const CampusResolveListItem = ({
  complaint,
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
    // Check if createdAt exists and is valid
    if (complaint.createdAt) {
      // Handle different date formats - string, timestamp, or date object
      const dateValue = typeof complaint.createdAt === 'object' && 
        complaint.createdAt !== null && 
        'seconds' in complaint.createdAt
        ? new Date((complaint.createdAt as any).seconds * 1000) // Handle Firestore timestamp
        : new Date(complaint.createdAt);
      
      // Verify the date is valid
      if (!isNaN(dateValue.getTime())) {
        createdAt = dateValue;
      }
    }
  } catch (error) {
    console.warn(`Error parsing date for complaint ID: ${complaint.id}`);
  }
  
  // Ensure priority is a string with proper type checking
  const priority = typeof complaint.priority === 'string' ? complaint.priority : "low"; // Default to "low"
  const category = complaint.category || "general"; // Default to "general"

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-shrink-0 bg-primary/10 rounded-full p-2.5">
          <FileText className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-grow min-w-0">
          <Link to={`${basePath}/${complaint.id}`} className="hover:underline">
            <h3 className="font-medium text-lg line-clamp-1">{complaint.title}</h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {createdAt && !isNaN(createdAt.getTime())
                ? format(createdAt, "MMM d, yyyy")
                : "Date not available"}
            </span>
            <span>•</span>
            <span className={`font-medium ${getPriorityColor(priority)}`}>
              {typeof priority === 'string' && priority.length > 0 
                ? priority.charAt(0).toUpperCase() + priority.slice(1) 
                : "Low"} Priority
            </span>
            <span>•</span>
            <span>
              {typeof category === 'string' && category.length > 0 
                ? category.charAt(0).toUpperCase() + category.slice(1) 
                : "General"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0 self-end sm:self-center">
          <StatusBadge status={complaint.status} className="bg-teal-500 text-white" />

          {isAdmin && (
            <>
              {/* Dropdown for Admin Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Admin actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuItem
                    onClick={() => onStatusChange?.(complaint.id, "in-progress")}
                  >
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange?.(complaint.id, "resolved")}
                  >
                    Mark as Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange?.(complaint.id, "rejected")}
                    className="text-red-500"
                  >
                    Reject Campus Resolve
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Button to Add/View Comments */}
              <Link to={`${basePath}/${complaint.id}`}>
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