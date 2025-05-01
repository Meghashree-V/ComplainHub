import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import ComplaintListItem from "@/components/ComplaintListItem";
import { Complaint, ComplaintStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    document.title = "Admin Complaints - Manage Complaints";

    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/complaint/all");
        let errorText = '';
        if (!res.ok) {
          try {
            errorText = await res.text();
          } catch (e) {
            errorText = 'Failed to fetch complaints (and no error body)';
          }
          throw new Error(errorText || "Failed to fetch complaints");
        }
        const data = await res.json();
        
        // Transform and validate the data from the backend
        const complaintsData = Array.isArray(data) ? data.map(complaint => {
          // Ensure all required fields exist with proper defaults
          return {
            ...complaint,
            // Convert string dates to Date objects if they exist
            createdAt: complaint.createdAt ? new Date(complaint.createdAt) : null,
            updatedAt: complaint.updatedAt ? new Date(complaint.updatedAt) : null,
            // Ensure other required fields have defaults
            status: complaint.status || 'pending',
            priority: complaint.priority || 'Unknown',
            category: complaint.category || 'general',
            comments: Array.isArray(complaint.comments) ? complaint.comments : []
          };
        }) : [];
        
        console.log('Processed complaints data:', complaintsData);
        setComplaints(complaintsData);
        setFilteredComplaints(complaintsData);
      } catch (error) {
        console.error("Error fetching complaints:", error);
        toast.error(error && typeof error === 'object' && 'message' in error ? (error as Error).message : "Failed to load complaints");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

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
          complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredComplaints(result);
  }, [complaints, statusFilter, categoryFilter, searchQuery]);

  const handleStatusChange = async (id: string, status: ComplaintStatus) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Updating complaint status...");
      
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
      toast.success(`Complaint marked as ${status}`);
      
      // Update local state with the new status
      setComplaints((prev) =>
        prev.map((complaint) => {
          if (complaint.id === id) {
            return {
              ...complaint,
              status, // status is already of type ComplaintStatus
              updatedAt: new Date() // Update the updatedAt date
            };
          }
          return complaint;
        })
      );
    } catch (error) {
      console.error("Error updating complaint status:", error);
      toast.error(typeof error === 'object' && error !== null && 'message' in error 
        ? (error as Error).message 
        : "Failed to update complaint status.");
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
        complaintId: id
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
      setComplaints((prev) =>
        prev.map((complaint) => {
          if (complaint.id === id) {
            return { 
              ...complaint, 
              comments: [...(Array.isArray(complaint.comments) ? complaint.comments : []), savedComment],
              updatedAt: new Date() // Update the last modified date
            };
          }
          return complaint;
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Complaints</h1>
            <p className="text-muted-foreground">View and manage all complaints in the system</p>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button variant="outline" size="icon" onClick={() => window.location.reload()} disabled={isLoading}>
              <RefreshCw className={isLoading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="mess">Mess</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Tabs defaultValue="all" className="w-full mt-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-8">Loading complaints...</div>
            ) : filteredComplaints.length === 0 ? (
              <div className="text-center py-8">No complaints found.</div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-5 gap-2 font-bold text-base text-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-t-lg sticky top-0 z-10 border-b-2 border-gray-400 dark:border-gray-600">
                  <div className="truncate">Title</div>
                  <div className="truncate">Description</div>
                  <div className="truncate">Category</div>
                  <div className="truncate">Priority</div>
                  <div className="truncate">Status</div>
                </div>
                {filteredComplaints.map((complaint, idx) => (
                  <div
                    key={complaint.id}
                    className={`grid grid-cols-5 gap-2 items-center px-4 py-3 text-sm border-b-2 border-gray-400 dark:border-gray-600 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-blue-50 dark:hover:bg-gray-700`}
                    style={{ borderBottomLeftRadius: idx === filteredComplaints.length - 1 ? '0.5rem' : undefined, borderBottomRightRadius: idx === filteredComplaints.length - 1 ? '0.5rem' : undefined }}
                  >
                    <div className="truncate max-w-xs font-semibold text-blue-700 hover:underline cursor-pointer">
                      <Link to={`/admin/complaints/${complaint.id}`}>{complaint.title || 'Untitled'}</Link>
                    </div>
                    <div className="truncate max-w-xs" title={complaint.description}>{complaint.description}</div>
                    <div className="capitalize">{complaint.category}</div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${complaint.priority === 'high' ? 'bg-red-100 text-red-700' : complaint.priority === 'medium' ? 'bg-orange-100 text-orange-700' : complaint.priority === 'low' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{complaint.priority || 'Unknown'}</span>
                    </div>
                    <div className="capitalize font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : complaint.status === 'resolved' ? 'bg-green-100 text-green-800' : complaint.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>{complaint.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminComplaints;