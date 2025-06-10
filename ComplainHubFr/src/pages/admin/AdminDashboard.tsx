import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, AlertCircle, FileText } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";
import { Complaint } from "@/lib/types";

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      setError("");

      try {
        if (isAdmin) {
          const complaintsCollection = collection(db, "complaints");
          const snapshot = await getDocs(complaintsCollection);
          const complaintsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : null,
            updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : null,
          })) as Complaint[];
          setComplaints(complaintsData);
        } else {
          setError("Unauthorized access. Redirecting...");
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
        setError("Failed to fetch complaints. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [isAdmin]);

  // Redirect non-admin users to the student dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Analyze complaints by category
  const categoryData =
    complaints.length > 0
      ? Object.entries(
          complaints.reduce((acc, complaint) => {
            const category = complaint.category || "Uncategorized";
            if (!acc[category]) {
              acc[category] = 0;
            }
            acc[category]++;
            return acc;
          }, {} as Record<string, number>)
        ).map(([name, value]) => ({ name, value }))
      : [];

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Complaints Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Complaints Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="category">
                <TabsList>
                  <TabsTrigger value="category">By Category</TabsTrigger>
                </TabsList>

                <TabsContent value="category" className="pt-4">
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="animate-pulse h-64 w-64 rounded-full bg-muted"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-600">{error}</p>
                    </div>
                  ) : categoryData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} complaints`, "Count"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium">No complaint data available</p>
                        <p className="text-muted-foreground">There are no complaints in the system yet.</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Complaints Section */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Complaints</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/complaints" aria-label="View all complaints">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded-md" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : complaints.length > 0 ? (
                <div className="space-y-2">
                  {complaints.slice(0, 5).map((complaint) => (
                    <Link
                      key={complaint.id}
                      to={`/admin/complaints/${complaint.id}`}
                      className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-accent transition-colors"
                      aria-label={`View details for complaint: ${complaint.title}`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{complaint.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {complaint.category || "Uncategorized"} • {complaint.studentName || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            complaint.status === "resolved"
                              ? "bg-green-100 text-green-800"
                              : complaint.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : complaint.status === "in-progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {complaint.status
                            ? complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)
                            : "Unknown"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No complaints found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;