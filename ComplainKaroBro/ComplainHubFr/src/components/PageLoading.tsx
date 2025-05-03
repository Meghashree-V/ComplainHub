import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PageLoadingProps {
  message?: string;
  fullscreen?: boolean;
  size?: number;
}

const PageLoading = ({
  message = "Loading...",
  fullscreen = true,
  size = 12,
}: PageLoadingProps) => {
  return (
    <motion.div
      className={`${
        fullscreen ? "h-[100vh] w-full" : "h-auto w-auto"
      } flex items-center justify-center`}
      role="status"
      aria-label="Loading content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="animate-fade-in flex flex-col items-center">
        <Loader2 className={`h-${size} w-${size} animate-spin text-primary`} />
        <p className="mt-4 text-lg font-medium text-muted-foreground">{message}</p>
      </div>
    </motion.div>
  );
};

export default PageLoading;