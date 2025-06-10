import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Trend {
  value: number;
  isPositive: boolean;
}

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: Trend;
  className?: string;
  index?: number;
}

const StatisticCard = ({
  title,
  value,
  description = "",
  icon: Icon,
  trend,
  className = "",
  index = 0,
}: StatisticCardProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        "glass-card p-6 rounded-xl flex flex-col h-full hover:transform hover:translate-y-[-5px] hover:shadow-lg transition-transform",
        className
      )}
      role="region"
      aria-label={`Statistic card for ${title}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
          {trend && trend.value !== undefined && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatisticCard;