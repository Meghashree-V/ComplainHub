import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ComplaintRatingProps {
  complaintId: string;
  onRatingSubmit?: (rating: number, feedback: string) => void;
}

const ComplaintRating = ({ complaintId, onRatingSubmit }: ComplaintRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating before submitting");
      return;
    }

    if (feedback.trim() === "" && rating < 5) {
      toast.error("Please provide feedback for ratings below 5 stars.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would save this to your database
      console.log(`Submitted rating ${rating} for complaint ${complaintId} with feedback: ${feedback}`);

      // Call the callback if provided
      if (onRatingSubmit) {
        onRatingSubmit(rating, feedback);
      }

      toast.success("Thank you for your feedback!");
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);

      // Reset the form for next time
      setRating(0);
      setFeedback("");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit your feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setHoveredRating(0);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Rate Resolution</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-6 bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Rate Your Experience</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Please rate your satisfaction with how your complaint was resolved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex justify-center">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {rating ? (
              <span>
                You selected <strong>{rating}</strong> star{rating !== 1 ? "s" : ""}
              </span>
            ) : (
              <span>Click on a star to rate</span>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Additional Feedback (Optional)
            </label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintRating;