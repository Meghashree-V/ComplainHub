import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/MainLayout";
import StatusBadge from "@/components/StatusBadge";
import ComplaintImageDisplay from "@/components/ComplaintImageDisplay";
import { Button } from "@/components/ui/button";
import { Complaint, Comment } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MessageSquare,
  SendHorizonal,
  ArrowLeft,
  FileBadge,
  Building,
  User,
  AlertCircle,
} from "lucide-react";
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig"; // Firestore instance

const ComplaintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const complaintRef = doc(db, "complaints", id);
          const complaintSnap = await getDoc(complaintRef);

          if (complaintSnap.exists()) {
            const complaintData = complaintSnap.data() as Complaint;

            // Check if the user has permission to view the complaint
            if (user && (user.isAdmin || complaintData.studentId === user.studentId)) {
              setComplaint({
                ...complaintData,
                id: complaintSnap.id,
                comments: complaintData.comments || [],
                createdAt: complaintData.createdAt?.toDate
                  ? complaintData.createdAt.toDate()
                  : new Date(),
                updatedAt: complaintData.updatedAt?.toDate
                  ? complaintData.updatedAt.toDate()
                  : new Date(),
              });
            } else {
              toast.error("You don't have permission to view this complaint");
              navigate("/complaints");
            }
          } else {
            toast.error("Complaint not found");
            navigate("/complaints");
          }
        }
      } catch (error) {
        console.error("Error fetching complaint details:", error);
        toast.error("Failed to fetch complaint details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaintDetails();
  }, [id, navigate, user]);

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
        createdAt: new Date(), // Use a Date object to match the interface
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
              comments: [...prev.comments, commentData], // Use the properly typed Comment object
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
      <MainLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-pulse space-y-6 w-full max-w-4xl">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!complaint) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h1 className="text-2xl font-bold mt-4">Complaint Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The complaint you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button className="mt-6" onClick={() => navigate("/complaints")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Complaints
          </Button>
        </div>
      </MainLayout>
    );
  }

  const sortedComments = complaint.comments && complaint.comments.length > 0 
    ? [...complaint.comments].sort((a, b) => {
        // Safely handle different date formats
        const getTimestamp = (date: any) => {
          if (!date) return 0;
          if (date.toDate && typeof date.toDate === 'function') {
            return date.toDate().getTime();
          }
          if (date instanceof Date) {
            return date.getTime();
          }
          const parsed = new Date(date);
          return !isNaN(parsed.getTime()) ? parsed.getTime() : 0;
        };
        
        return getTimestamp(a.createdAt) - getTimestamp(b.createdAt);
      })
    : [];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/complaints")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Complaints
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold">{complaint.title}</h1>
            <StatusBadge status={complaint.status} className="text-sm py-1.5 px-3" />
          </div>

          <div className="glass-card rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Submitted on:</span>
                  <span className="ml-2 font-medium">
                    {complaint.createdAt && !isNaN(complaint.createdAt.getTime())
                      ? format(complaint.createdAt, "MMMM d, yyyy")
                      : "Date not available"}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Last updated:</span>
                  <span className="ml-2 font-medium">
                    {complaint.updatedAt && !isNaN(complaint.updatedAt.getTime())
                      ? format(complaint.updatedAt, "MMMM d, yyyy 'at' h:mm a")
                      : "Date not available"}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <FileBadge className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 font-medium capitalize">
                    {complaint.category}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Submitted by:</span>
                  <span className="ml-2 font-medium">{complaint.studentName}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Department:</span>
                  <span className="ml-2 font-medium">{complaint.department}</span>
                </div>

                <div className="flex items-center text-sm">
                  <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Comments:</span>
                  <span className="ml-2 font-medium">{complaint.comments.length}</span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="text-lg font-medium mb-3">Description</h3>
              <p className="whitespace-pre-line text-muted-foreground">{complaint.description}</p>
            </div>

            {complaint.imageUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Uploaded Image</h3>
                <ComplaintImageDisplay
                  imageUrl={complaint.imageUrl}
                  altText={`Image for complaint: ${complaint.title}`}
                />
              </div>
            )}
          </div>

          <section className="mb-6">
            <h2 className="text-xl font-bold mb-4">Comments</h2>

            <div className="glass-card rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Add a Comment</h3>
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
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

            {sortedComments.length > 0 ? (
              <div className="space-y-4">
                {sortedComments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`glass-card rounded-xl p-4 ${
                      comment.userRole === "admin" ? "border-l-4 border-primary" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.userName}`}
                        />
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{comment.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {comment.userRole === "admin" ? "Administrator" : "Student"}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              try {
                                const date = comment.createdAt;
                                if (!date) return "Date not available";
                                
                                // Handle Firestore timestamp
                                if (date.toDate && typeof date.toDate === 'function') {
                                  return format(date.toDate(), "MMM d, yyyy 'at' h:mm a");
                                }
                                
                                // Handle Date object
                                if (date instanceof Date) {
                                  return format(date, "MMM d, yyyy 'at' h:mm a");
                                }
                                
                                // Handle string format (ISO string from Firestore)
                                if (typeof date === 'string') {
                                  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
                                }
                                
                                // Handle numeric timestamp
                                if (typeof date === 'number') {
                                  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
                                }
                                
                                return "Date not available";
                              } catch (error) {
                                console.error("Error formatting date:", error);
                                return "Date not available";
                              }
                            })()}
                          </p>
                        </div>
                        <p className="mt-3">{comment.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-6 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to leave a comment on this complaint.
                </p>
              </div>
            )}
          </section>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default ComplaintDetail;