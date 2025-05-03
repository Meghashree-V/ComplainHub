
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthContextProvider from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLoading from "./components/PageLoading";

// Lazy load pages for better performance
const LandingPage = lazy(() => import("./pages/Index"));
const StudentSignIn = lazy(() => import("./pages/StudentSignIn"));
const AdminSignIn = lazy(() => import("./pages/AdminSignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Complaints = lazy(() => import("./pages/Complaints"));
const NewComplaint = lazy(() => import("./pages/NewComplaint"));
const ComplaintDetail = lazy(() => import("./pages/ComplaintDetail"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminComplaints = lazy(() => import("./pages/admin/AdminComplaints"));
const AdminComplaintDetail = lazy(() => import("./pages/admin/AdminComplaintDetail"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<StudentSignIn />} />
              <Route path="/admin/signin" element={<AdminSignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Redirect for old routes */}
              <Route path="/signin" element={<Navigate to="/signin" replace />} />
              
              {/* Protected student routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/complaints" element={
                <ProtectedRoute>
                  <Complaints />
                </ProtectedRoute>
              } />
              <Route path="/complaints/new" element={
                <ProtectedRoute>
                  <NewComplaint />
                </ProtectedRoute>
              } />
              <Route path="/complaints/:id" element={
                <ProtectedRoute>
                  <ComplaintDetail />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              
              {/* Protected admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/complaints" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminComplaints />
                </ProtectedRoute>
              } />
              <Route path="/admin/complaints/:id" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminComplaintDetail />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthContextProvider>
  </QueryClientProvider>
);

export default App;
