import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Complaint, ComplaintStatus, ComplaintUpdate } from "@/lib/types";

interface ComplaintUpdateFormProps {
  complaint: Complaint;
  onUpdate: (updatedData: Partial<Complaint>) => void;
  onCancel: () => void;
}

const ComplaintUpdateForm = ({ 
  complaint, 
  onUpdate, 
  onCancel 
}: ComplaintUpdateFormProps) => {
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [updateDescription, setUpdateDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!status) {
      toast.error("Please select a valid status");
      return;
    }

    const updatedData: Partial<Complaint> = {
      status,
      updates: [
        ...(complaint.updates || []),
        {
          date: new Date().toISOString(),
          description: updateDescription || "Status updated",
          status,
          by: "Admin",
        },
      ],
    };

    if (status === "rejected") {
      updatedData.rejectionReason = updateDescription || "No reason provided";
    }

    if (status === "resolved") {
      updatedData.resolvedAt = new Date(); // Add the resolvedAt timestamp
    }

    onUpdate(updatedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Update Status</label>
        <Select
          value={status}
          onValueChange={(value: ComplaintStatus) => setStatus(value)}
        >
          <SelectTrigger aria-label="Select complaint status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Update Description</label>
        <Textarea
          placeholder="Provide details about this status update..."
          value={updateDescription}
          onChange={(e) => setUpdateDescription(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          This description will be visible to the student who submitted the complaint.
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting || !updateDescription.trim()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSubmitting ? "Updating..." : "Update Complaint"}
        </Button>
      </div>
    </form>
  );
};

export default ComplaintUpdateForm;