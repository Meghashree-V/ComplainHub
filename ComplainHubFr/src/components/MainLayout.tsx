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
import ProfileMenu from "@/components/ProfileMenu";
import {
  Home,
  FileText,
  PlusCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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

  const navigationItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: Home,
    },
    {
      title: "My Complaints",
      path: "/complaints",
      icon: FileText,
    },
    {
      title: "New Complaint",
      path: "/complaints/new",
      icon: PlusCircle,
    },
  ];

  useEffect(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || "dashboard";
    const title =
      lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) + " - Campus Resolve";
    document.title = title;
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="px-6 py-5">
            <div className="flex items-center gap-2 text-primary font-medium text-lg">
              <FileText className="w-5 h-5" />
              <span>Campus Resolve</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.length > 0 ? (
                    navigationItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          className={`w-full ${
                            location.pathname.startsWith(item.path)
                              ? "bg-primary/10 text-primary"
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
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`}
                  />
                </Avatar>

                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "No email available"}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={signOut}
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
                  )?.title || "Campus Resolve"}
                </h1>
              </div>
            </div>

            <div className="flex items-center">
              <ProfileMenu />
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

export default MainLayout;