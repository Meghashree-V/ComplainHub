import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  FileText,
  Users,
  LogOut,
  Shield,
  ChevronRight,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageTransition, setPageTransition] = useState(false);

  const handleNavigation = (path: string) => {
    if (location.pathname !== path) {
      setPageTransition(true);
      setTimeout(() => {
        navigate(path);
        setPageTransition(false);
      }, 300);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigationItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: Home,
    },
    {
      title: "All Complaints",
      path: "/admin/complaints",
      icon: FileText,
    },
    {
      title: "Manage Users",
      path: "/admin/users",
      icon: Users,
    },
  ];

  useEffect(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || "dashboard";
    const title =
      lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) + " - Admin Portal";
    document.title = title;
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="px-6 py-5">
            <div className="flex items-center gap-2 text-indigo-600 font-medium text-lg">
              <Shield className="w-5 h-5" />
              <span>Campus Resolve Admin</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Admin Controls</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.length > 0 ? (
                    navigationItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          className={`w-full ${
                            location.pathname.startsWith(item.path)
                              ? "bg-indigo-600/10 text-indigo-600"
                              : ""
                          }`}
                          onClick={() => handleNavigation(item.path)}
                          aria-label={`Navigate to ${item.title}`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                          {location.pathname.startsWith(item.path) && (
                            <ChevronRight className="h-4 w-4 ml-auto" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <p className="text-muted-foreground px-4">
                      No navigation items available
                    </p>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <Avatar>
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Admin"}`}
                  />
                </Avatar>

                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.name || "Admin"}</p>
                  <p className="text-xs text-indigo-600">Administrator</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 w-full">
          <header className="flex items-center justify-between px-6 py-4 border-b border-border h-16">
            <div className="flex items-center">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-xl font-medium">
                  {navigationItems.find(
                    (item) => item.path === location.pathname
                  )?.title || "Admin Dashboard"}
                </h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <motion.div
              initial={{ opacity: pageTransition ? 0 : 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {pageTransition ? (
                <div className="flex items-center justify-center h-full">
                  <div className="loader" />
                </div>
              ) : (
                children
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;