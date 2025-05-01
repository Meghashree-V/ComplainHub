import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import ComplaintImageDisplay from "@/components/ComplaintImageDisplay";
import ComplaintUpdateForm from "@/components/ComplaintUpdateForm";
import {
  ArrowLeft,
  Clock,
  FileText,
  MessageSquare,
  SendHorizonal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { Complaint, ComplaintUpdate, Comment } from "@/lib/types";

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Track if the update form is open
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      setIsLoading(true);
      try {
        if (!id) {
          toast.error("Invalid complaint ID");
          navigate("/admin/complaints");
          return;
        }

        const docRef = doc(db, "complaints", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Complaint;

          // Convert Firestore Timestamps to JavaScript Dates
          const createdAt = data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : (typeof data.createdAt === 'string'
                ? new Date(data.createdAt)
                : data.createdAt instanceof Date
                  ? data.createdAt
                  : new Date());

          const updatedAt = data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : (typeof data.updatedAt === 'string'
                ? new Date(data.updatedAt)
                : data.updatedAt instanceof Date
                  ? data.updatedAt
                  : new Date());

          setComplaint({
            id: docSnap.id,
            ...data,
            createdAt,
            updatedAt,
            comments: data.comments || [],
          });
          document.title = `Complaint: ${data.title} - Admin Panel`; // Dynamic page title
        } else {
          toast.error("Complaint not found");
          navigate("/admin/complaints");
        }
      } catch (error) {
        console.error("Error fetching complaint:", error);
        toast.error("Failed to load complaint details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaint();
  }, [id, navigate]);

  const handleUpdateComplaint = async (updatedData: Partial<Complaint>) => {
    if (!complaint) return;

    try {
      const docRef = doc(db, "complaints", complaint.id);

      console.log("Updating complaint with data:", updatedData);

      // Update the complaint in Firestore
      await updateDoc(docRef, updatedData);

      // Update the local state
      setComplaint((prev) => (prev ? { ...prev, ...updatedData } : null));
      toast.success("Complaint updated successfully!");
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast.error("Failed to update complaint");
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !complaint || !user) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmittingComment(true);

    try {
      // Create a comment object that matches the Comment interface
      const commentData: Comment = {
        id: `comment_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        content: newComment,
        complaintId: complaint.id,
        createdAt: new Date(),
      };

      // Reference to the complaint document
      const complaintRef = doc(db, "complaints", complaint.id);
      
      // Get current complaint data first
      const complaintSnap = await getDoc(complaintRef);
      if (!complaintSnap.exists()) {
        throw new Error("Complaint not found");
      }
      
      const currentData = complaintSnap.data();
      const currentComments = currentData.comments || [];
      
      // Convert Date to Firestore format for storage
      const firestoreCommentData = {
        ...commentData,
        createdAt: commentData.createdAt.toISOString(), // Convert to string for Firestore
      };
      
      // Update with the new comment
      await updateDoc(complaintRef, {
        comments: [...currentComments, firestoreCommentData],
        updatedAt: serverTimestamp(),
      });

      // Update local state with the properly typed Comment object
      setComplaint((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, commentData],
              updatedAt: new Date(),
            }
          : null
      );

      setNewComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex flex-col w-full space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted rounded-lg h-24 w-full" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!complaint) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Complaint not found</h2>
            <p className="text-muted-foreground mb-4">
              The complaint you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/admin/complaints")}>
              View All Complaints
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back button and title */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => navigate(-1)}
            aria-label="Go back to the previous page"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Complaint Details</h1>
        </div>

        {/* Complaint details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold">{complaint.title}</h2>
                <StatusBadge status={complaint.status} />
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {complaint.createdAt && !isNaN(complaint.createdAt.getTime())
                      ? format(complaint.createdAt, "MMM d, yyyy 'at' h:mm a")
                      : "Date not available"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{complaint.category}</span>
                </div>
                <Badge
                  variant={
                    complaint.priority === "high"
                      ? "destructive"
                      : complaint.priority === "medium"
                      ? "default"
                      : "secondary"
                  }
                >
                  {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{complaint.description}</p>

              {/* Student Uploaded Image */}
              {complaint.imageUrl && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Attached Image</h3>
                  <ComplaintImageDisplay
                    imageUrl={complaint.imageUrl}
                    altText={`Image for complaint: ${complaint.title}`}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status Updates Section */}
        {complaint.updates && complaint.updates.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Status Updates</h3>
            <ul className="space-y-2">
              {complaint.updates.map((update, idx) => (
                <li key={`update-${idx}`} className="p-3 bg-muted rounded-lg">
                  <div>
                    <span className="font-bold">{update.status}</span>
                    {update.description && (
                      <span className="ml-2 text-muted-foreground">— {update.description}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    By: {update.by} | {update.date ? new Date(update.date).toLocaleString() : ""}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-xl font-bold mb-4">Comments</h2>
          
          {/* Add Comment Form */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Add a Comment</h3>
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Write your comment here..."
                  className="mb-3"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim() || isSubmittingComment}
                  >
                    {isSubmittingComment ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          key="loading-spinner"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </div>
                    ) : (
                      <>
                        <SendHorizonal className="mr-2 h-4 w-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

        {/* Display Comments */}
        {complaint.comments && complaint.comments.length > 0 ? (
          <div className="space-y-4">
            {complaint.comments.map((comment, index) => (
              <motion.div key={comment.id || index}>
                {/* Render comment content here, e.g.: */}
                <div className="flex gap-3 items-start">
                  <Avatar>
                    <AvatarFallback>{comment.userName?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt instanceof Timestamp
                          ? comment.createdAt.toDate().toLocaleString()
                          : comment.createdAt instanceof Date
                            ? comment.createdAt.toLocaleString()
                            : typeof comment.createdAt === 'string'
                              ? new Date(comment.createdAt).toLocaleString()
                              : ''}
                      </span>
                    </div>
                    <div className="text-sm mt-1">{comment.content}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No comments yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to leave a comment on this complaint.
            </p>
          </div>
        )}
        </motion.div>

        {/* Update Form */}
        {isEditing ? (
          <ComplaintUpdateForm
            complaint={complaint}
            onUpdate={(updatedData) => {
              handleUpdateComplaint(updatedData);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <Button onClick={() => setIsEditing(true)}>Update Complaint</Button>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminComplaintDetail;