import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/MainLayout";
import ComplaintListItem from "@/components/ComplaintListItem";
import { Complaint, COMPLAINT_STATUS_OPTIONS, COMPLAINT_CATEGORY_OPTIONS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, getDocs, query, where, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Firestore instance
import { toast } from "sonner";

// Helper to get JS Date from Firestore Timestamp or Date
function getJSDate(ts: any): Date {
  // Firestore Timestamp
  if (ts && typeof ts.toDate === "function") return ts.toDate();
  // JS Date
  if (ts instanceof Date) return ts;
  // Seconds since epoch
  if (ts && typeof ts.seconds === "number") return new Date(ts.seconds * 1000);
  // Fallback
  return new Date(ts);
}

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    if (!user) return;
    const studentId = (user as any)?.studentId;
    const uid = (user as any)?.uid;
    if (!studentId && !uid) return; // Guard: don't query with undefined
    setIsLoading(true);
    const complaintsRef = collection(db, "complaints");
    let q;

    // Type-narrowing for admin
    const isAdmin = user?.role === "admin";

    // For admins, show all complaints
    if (isAdmin) {
      q = query(complaintsRef);
      console.log("Admin query - showing all complaints");
    } 
    // For students, use a more comprehensive approach to show ALL their complaints
    else {
      // Get ALL complaints first, then filter client-side
      // This ensures we catch everything regardless of field structure
      q = query(complaintsRef);
      console.log("Student query - fetching all complaints to filter client-side");
    }

    // Helper to get JS Date from Firestore Timestamp or Date
function getJSDate(ts: any): Date {
  // Firestore Timestamp
  if (ts && typeof ts.toDate === "function") return ts.toDate();
  // JS Date
  if (ts instanceof Date) return ts;
  // Seconds since epoch
  if (ts && typeof ts.seconds === "number") return new Date(ts.seconds * 1000);
  // Fallback
  return new Date(ts);
}

// Admins can view all complaints; students can only view their own
    if (isAdmin) {
      q = query(complaintsRef, orderBy("createdAt", "desc"));
    } else {
      q = query(
        complaintsRef,
        where("studentId", "==", studentId),
        orderBy("createdAt", "desc")
      );
    }

    // Create sample complaints for fallback when Firestore connection fails
    const createSampleComplaints = () => {
      const currentTime = new Date();
      return [
        {
          id: "sample1",
          title: "Syllabus Not Covered",
          description: "The syllabus for Data Structures has not been fully covered and exams are approaching soon.",
          studentId: studentId || "",
          category: "academic",
          status: "pending",
          createdAt: { seconds: Math.floor(currentTime.getTime() / 1000) - 86400 },
          priority: "high"
        },
        {
          id: "sample2",
          title: "Hostel Water Issue",
          description: "There is no water supply in the hostel since yesterday evening.",
          studentId: studentId || "",
          category: "hostel",
          status: "in-progress",
          createdAt: { seconds: Math.floor(currentTime.getTime() / 1000) - 172800 },
          priority: "medium"
        }
      ] as Complaint[];
    };
    
    // Connection timeout for Firestore
    const connectionTimeoutMs = 5000;
    let connectionTimedOut = false;
    
    // Set a timeout to show sample data if Firestore connection takes too long
    const timeoutId = setTimeout(() => {
      console.log("Firestore connection timed out, showing sample data");
      connectionTimedOut = true;
      setComplaints(createSampleComplaints());
      setIsLoading(false);
      toast.warning("Using sample data due to connection issues. Your actual complaints will appear when connection is restored.");
    }, connectionTimeoutMs);
    
    // Use Firestore onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      // If we already showed sample data, don't replace it unless we have real data
      if (connectionTimedOut && querySnapshot.empty) {
        return;
      }
      
      let fetchedComplaints = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Complaint data from Firestore:", data); // Log for debugging
        
        // Ensure all required fields exist with fallbacks
        return {
          id: doc.id,
          title: data.title || "Untitled Complaint",
          description: data.description || "",
          studentId: data.studentId || data.uid || "",
          category: data.category || "general",
          status: data.status || "pending",
          createdAt: data.createdAt || data.timestamp || { seconds: Date.now() / 1000 },
          ...data // Include any other fields
        };
      }) as Complaint[];
      
      // For students, filter complaints client-side to ensure we catch ALL possible matches
      if (!isAdmin && studentId) {
        console.log("Filtering complaints for student with ID:", studentId);
        fetchedComplaints = fetchedComplaints.filter(complaint => {
          // Check ALL possible fields that might contain user identifiers
          const possibleMatches = [
            complaint.studentId === studentId,
            complaint.studentId === uid,
            complaint.uid === uid,
            complaint.uid === studentId,
            // Add any other possible field matches here
            String(complaint.studentId || "").includes(studentId || ""),
            (studentId || "").includes(String(complaint.studentId || ""))
          ];
          
          return possibleMatches.some(match => match);
        });
      }
      
      // If we have no complaints after filtering, and we're in development mode, show samples
      if (fetchedComplaints.length === 0 && process.env.NODE_ENV === "development") {
        console.log("No complaints found after filtering, showing sample data");
        fetchedComplaints = createSampleComplaints();
      }
      
      console.log("Processed complaints:", fetchedComplaints); // Log processed data
      setComplaints(fetchedComplaints);
      setIsLoading(false);
    }, (error) => {
      // Clear the timeout since we got a response (even if it's an error)
      clearTimeout(timeoutId);
      
      console.error("Firestore error:", error); // Log error details
      toast.error("Failed to fetch complaints: " + error.message);
      
      // Show sample data on error
      setComplaints(createSampleComplaints());
      setIsLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user]);

  // Keep filteredComplaints in sync with complaints
  useEffect(() => {
    setFilteredComplaints(complaints);
  }, [complaints]);

  useEffect(() => {
    let result = [...complaints];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((complaint) => complaint.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((complaint) => complaint.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (complaint) =>
          complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sort
    if (sortOrder === "newest") {
      result.sort(
        (a, b) =>
          getJSDate(b.createdAt).getTime() -
          getJSDate(a.createdAt).getTime()
      );
    } else if (sortOrder === "oldest") {
      result.sort(
        (a, b) =>
          getJSDate(a.createdAt).getTime() -
          getJSDate(b.createdAt).getTime()
      );
    }

    setFilteredComplaints(result);
  }, [complaints, statusFilter, categoryFilter, searchQuery, sortOrder]);

  // Compute counts by status for tabs
  const counts = {
    all: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    rejected: complaints.filter((c) => c.status === "rejected").length,
  };

  const handleTabChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // No debug panel in production

  return (
    <MainLayout>
      {/* Debug panel removed */}
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {user?.role === "admin" ? "All Complaints" : "My Complaints"}
            </h1>
            <p className="text-muted-foreground">
              {user?.role === "admin"
                  ? "View and manage all submitted complaints"
                  : "View and track all your submitted complaints"}
            </p>
          </div>
          {user?.role !== "admin" && (
            <Button asChild aria-label="Create a new complaint">
              <Link to="/complaints/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Complaint
              </Link>
            </Button>
          )}
        </div>

        {/* Filters and search */}
        <div className="glass-card rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                placeholder="Search complaints..."
                className="pl-9"
                value={searchQuery}
                onChange={handleSearch}
                aria-label="Search complaints"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full" aria-label="Filter by category">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {COMPLAINT_CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full" aria-label="Sort complaints">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs and Complaints List */}
        <Tabs defaultValue="all" value={statusFilter} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All <span className="ml-1">({counts.all})</span>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending <span className="ml-1">({counts.pending})</span>
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress <span className="ml-1">({counts.inProgress})</span>
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved <span className="ml-1">({counts.resolved})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected <span className="ml-1">({counts.rejected})</span>
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex flex-col w-full space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-muted rounded-lg h-24 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <div>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint, index) => (
                  <ComplaintListItem
                    key={complaint.id}
                    complaint={complaint}
                    index={index}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-lg p-8 text-center"
                >
                  <h3 className="text-lg font-medium mb-2">No complaints found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                      ? "Try changing your filters or search query."
                      : user?.role === "admin"
                      ? "No complaints have been submitted yet."
                      : "You haven't submitted any complaints yet."}
                  </p>
                  {!searchQuery && statusFilter === "all" && categoryFilter === "all" && user?.role !== "admin" && (
                    <Button asChild aria-label="Create a new complaint">
                      <Link to="/complaints/new">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Complaint
                      </Link>
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Complaints;