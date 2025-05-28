import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import CampusResolveListItem from "../../components/CampusResolveListItem";
import { CampusResolve, CampusResolveStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminCampusResolves = () => {
  const [campusResolves, setCampusResolves] = useState<CampusResolve[]>([]);
  const [filteredCampusResolves, setFilteredCampusResolves] = useState<CampusResolve[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    document.title = "Admin Campus Resolves - Manage Campus Resolves";

    const fetchCampusResolves = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/complaint/all");
        if (!res.ok) throw new Error("Failed to fetch complaints");
        const data = await res.json();
        
        // Transform and validate the data from the backend
        const campusResolvesData = Array.isArray(data) ? data.map(campusResolve => {
          // Ensure all required fields exist with proper defaults
          return {
            ...campusResolve,
            // Convert string dates to Date objects if they exist
            createdAt: campusResolve.createdAt ? new Date(campusResolve.createdAt) : null,
            updatedAt: campusResolve.updatedAt ? new Date(campusResolve.updatedAt) : null,
            // Ensure other required fields have defaults
            status: campusResolve.status || 'pending',
            priority: campusResolve.priority || 'low',
            category: campusResolve.category || 'general',
            comments: Array.isArray(campusResolve.comments) ? campusResolve.comments : []
          };
        }) : [];
        
        console.log('Processed campus resolves data:', campusResolvesData);
        setCampusResolves(campusResolvesData);
        setFilteredCampusResolves(campusResolvesData);
      } catch (error) {
        console.error("Error fetching complaints:", error);
        toast.error("Failed to load complaints");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampusResolves();
  }, []);

  useEffect(() => {
    let result = [...campusResolves];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((campusResolve) => campusResolve.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((campusResolve) => campusResolve.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (campusResolve) =>
          campusResolve.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campusResolve.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campusResolve.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campusResolve.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCampusResolves(result);
  }, [campusResolves, statusFilter, categoryFilter, searchQuery]);

  const handleStatusChange = async (id: string, status: CampusResolveStatus) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Updating campus resolve status...");
      
      const res = await fetch(`/api/complaint/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status, 
          updatedBy: "admin",
          updateDate: new Date().toISOString() // Include current date
        }),
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update status");
      }
      
      // Success toast
      toast.success(`Campus resolve marked as ${status}`);
      
      // Update local state with the new status
      setCampusResolves((prev) =>
        prev.map((campusResolve) => {
          if (campusResolve.id === id) {
            return {
              ...campusResolve,
              status, // status is already of type CampusResolveStatus
              updatedAt: new Date() // Update the updatedAt date
            };
          }
          return campusResolve;
        })
      );
    } catch (error) {
      console.error("Error updating campus resolve status:", error);
      toast.error(typeof error === 'object' && error !== null && 'message' in error 
        ? (error as Error).message 
        : "Failed to update campus resolve status.");
    }
  };

  const handleAddComment = async (id: string, comment: string) => {
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    try {
      // Show loading toast
      const loadingToast = toast.loading("Adding comment...");
      
      // Create comment data with current timestamp
      const commentData = { 
        userId: "admin", 
        userName: "Admin", 
        userRole: "admin",
        content: comment, 
        createdAt: new Date().toISOString(),
        campusResolveId: id
      };
      
      const res = await fetch(`/api/complaint/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add comment");
      }
      
      // Get the response data which should include the saved comment with ID
      const responseData = await res.json().catch(() => null);
      const savedComment = responseData || commentData;
      
      // Success toast
      toast.success("Comment added successfully");
      
      // Update local state with the new comment
      setCampusResolves((prev) =>
        prev.map((campusResolve) => {
          if (campusResolve.id === id) {
            return { 
              ...campusResolve, 
              comments: [...(Array.isArray(campusResolve.comments) ? campusResolve.comments : []), savedComment],
              updatedAt: new Date() // Update the last modified date
            };
          }
          return campusResolve;
        })
      );
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(typeof error === 'object' && error !== null && 'message' in error 
        ? (error as Error).message 
        : "Failed to add comment.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 bg-teal-500 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 h-screen p-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">All Campus Resolves</h1>
            <p className="text-muted-foreground text-white">Manage and process all student-submitted complaints</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            aria-label="Refresh campus resolves list"
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2 text-white" />
            Refresh
          </Button>
        </div>

        {/* Filters Section */}
        <div className="glass-card rounded-xl p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campus resolves, students, departments..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search campus resolves"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                aria-label="Filter by category"
              >
                <SelectTrigger className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                aria-label="Filter by status"
              >
                <SelectTrigger className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs and Campus Resolves List */}
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="bg-teal-600 hover:bg-teal-700 text-white">All</TabsTrigger>
            <TabsTrigger value="pending" className="bg-teal-600 hover:bg-teal-700 text-white">Pending</TabsTrigger>
            <TabsTrigger value="in-progress" className="bg-teal-600 hover:bg-teal-700 text-white">In Progress</TabsTrigger>
            <TabsTrigger value="resolved" className="bg-teal-600 hover:bg-teal-700 text-white">Resolved</TabsTrigger>
            <TabsTrigger value="rejected" className="bg-teal-600 hover:bg-teal-700 text-white">Rejected</TabsTrigger>
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
              {filteredCampusResolves.length > 0 ? (
                filteredCampusResolves.map((campusResolve) => (
                  <CampusResolveListItem
                    key={campusResolve.id}
                    campusResolve={campusResolve}
                    isAdmin
                    onStatusChange={handleStatusChange}
                    onAddComment={handleAddComment}
                  />
                ))
              ) : (
                <div className="glass-card rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">No campus resolves found</h3>
                  <p className="text-muted-foreground">Try changing your filters or search query</p>
                </div>
              )}
            </div>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminCampusResolves;