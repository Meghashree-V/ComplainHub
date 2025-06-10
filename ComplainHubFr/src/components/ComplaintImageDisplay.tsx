import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, ZoomIn } from "lucide-react";
import { motion } from "framer-motion";

interface ComplaintImageDisplayProps {
  imageUrl?: string;
  altText: string;
}

const ComplaintImageDisplay = ({ imageUrl, altText }: ComplaintImageDisplayProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-40 bg-muted rounded-md">
        <div className="text-center p-4">
          <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No image attached</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="relative group">
        <img
          src={imageUrl}
          alt={altText}
          className={`w-full h-auto object-cover max-h-[300px] ${isLoading ? "hidden" : ""}`}
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            e.currentTarget.src = "/path/to/fallback-image.png"; // Replace with your fallback image path
            e.currentTarget.alt = "Image not available";
            setIsLoading(false);
          }}
        />
        {isLoading && (
          <div className="flex items-center justify-center h-40 bg-muted rounded-md">
            <div className="loader" /> {/* Replace with your loader component */}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="gap-2"
                aria-label="View full image"
              >
                <ZoomIn className="h-4 w-4" />
                View Full Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-4 bg-white rounded-lg shadow-lg">
              <motion.img
                src={imageUrl}
                alt={altText}
                className="w-full h-auto max-h-[80vh] object-contain rounded-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ComplaintImageDisplay;