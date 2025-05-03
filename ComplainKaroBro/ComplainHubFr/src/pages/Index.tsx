import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Update page title */}
      <title>ComplainHub - Simplified Complaint Management</title>

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">ComplainHub</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/signin"
                className="text-sm font-medium hover:text-primary transition-colors"
                aria-label="Go to Student Login"
              >
                Student Login
              </Link>
              <Link
                to="/admin/signin"
                className="text-sm font-medium hover:text-primary transition-colors"
                aria-label="Go to Admin Login"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                Campus Voice: <span className="text-primary">Simplified</span> Complaint Management
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-md">
                An intuitive platform for students to submit, track, and resolve campus complaints efficiently.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signin" aria-label="Go to Student Login">
                  <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/20">
                    Student Login
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/admin/signin" aria-label="Go to Admin Login">
                  <Button variant="outline" size="lg" className="rounded-full">
                    Admin Login
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Student using complaint platform"
                  className="w-full h-full object-cover aspect-[4/3]"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold">ComplainHub - College Complaint Management System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 ComplainHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;