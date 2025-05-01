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
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Firestore instance
import { toast } from "sonner";

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
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const complaintsRef = collection(db, "complaints");
          let q;

          // Admins can view all complaints; students can only view their own
          if (user.isAdmin) {
            q = query(complaintsRef, orderBy("createdAt", "desc"));
          } else {
            q = query(
              complaintsRef,
              where("studentId", "==", user.studentId || user.uid), // Ensure studentId matches the logged-in user
              orderBy("createdAt", "desc")
            );
          }

          const querySnapshot = await getDocs(q);

          const fetchedComplaints = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt || { seconds: 0 }, // Default value for createdAt
            status: doc.data().status || "pending", // Default value for status
            category: doc.data().category || "general", // Default value for category
          })) as Complaint[];

          setComplaints(fetchedComplaints);
          setFilteredComplaints(fetchedComplaints);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
        toast.error("Failed to load complaints. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [user]);

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
          new Date(b.createdAt?.toDate?.() || b.createdAt).getTime() -
          new Date(a.createdAt?.toDate?.() || a.createdAt).getTime()
      );
    } else if (sortOrder === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt?.toDate?.() || a.createdAt).getTime() -
          new Date(b.createdAt?.toDate?.() || b.createdAt).getTime()
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {user?.isAdmin ? "All Complaints" : "My Complaints"}
            </h1>
            <p className="text-muted-foreground">
              {user?.isAdmin
                ? "View and manage all submitted complaints"
                : "View and track all your submitted complaints"}
            </p>
          </div>
          {!user?.isAdmin && (
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
                      : user?.isAdmin
                      ? "No complaints have been submitted yet."
                      : "You haven't submitted any complaints yet."}
                  </p>
                  {!searchQuery && statusFilter === "all" && categoryFilter === "all" && !user?.isAdmin && (
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