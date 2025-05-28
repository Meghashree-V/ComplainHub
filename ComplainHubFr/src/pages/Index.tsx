
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CampusResolveLogo from "@/components/CampusResolveLogo";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400/70 via-white to-teal-50 dark:from-teal-900 dark:to-teal-950">
      {/* Update page title */}
      <title>Campus Resolve - Streamlined Complaint Management</title>

      {/* Header */}
      <header className="border-b border-teal-200/40 dark:border-teal-800/60 shadow-sm bg-white/60 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <CampusResolveLogo className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tight text-teal-700">Campus Resolve</span>
            </motion.div>
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
      <section className="relative py-20 md:py-32 overflow-hidden">
  {/* Animated background shapes */}
  <div className="absolute -top-24 -left-32 w-[600px] h-[600px] bg-teal-300 opacity-30 rounded-full blur-3xl animate-pulse z-0"></div>
  <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-100 opacity-40 rounded-full blur-2xl animate-pulse z-0"></div>
  <div className="container mx-auto px-4 relative z-10">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Hero Card with SVG */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="bg-white/80 dark:bg-teal-900/70 glass-card rounded-3xl p-12 shadow-2xl flex flex-col items-start"
      >
        <div className="flex items-center gap-8 mb-8">
          {/* Campus SVG illustration */}
          <svg width="90" height="90" fill="none" viewBox="0 0 90 90" className="drop-shadow-xl">
            <circle cx="45" cy="45" r="45" fill="#06b6d4"/>
            <rect x="28" y="38" width="34" height="20" rx="5" fill="#fff"/>
            <rect x="38" y="52" width="14" height="8" rx="2" fill="#06b6d4"/>
            <rect x="42" y="44" width="6" height="8" rx="1" fill="#06b6d4"/>
            <rect x="40" y="58" width="10" height="6" rx="1" fill="#fff"/>
          </svg>
          <div>
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-tight mb-2 text-balance text-teal-900 dark:text-teal-100 drop-shadow-lg">
              Campus Resolve
            </h1>
            <p className="text-2xl text-teal-700/90 dark:text-teal-100/80 font-semibold mb-2">
              Your voice, your campus, your solution.
            </p>
            <p className="text-lg text-teal-800/80 dark:text-teal-100/70 max-w-lg mb-4">
              Submit, track, and resolve campus issues with ease. Join a community committed to positive change.
            </p>
          </div>
        </div>
        <motion.div className="flex flex-wrap gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Link to="/signin" aria-label="Go to Student Login">
  <Button size="lg" className="rounded-full shadow-lg bg-teal-500 text-white hover:bg-teal-600 hover:scale-105 transition-transform duration-200 flex items-center gap-2">
    {/* Graduation Cap Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2.25 9l9.75 6 9.75-6L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12.75m6 0V21" />
    </svg>
    Student Login
    <ArrowRight className="ml-2 h-5 w-5" />
  </Button>
</Link>
<Link to="/admin/signin" aria-label="Go to Admin Login">
  <Button variant="outline" size="lg" className="rounded-full border-2 border-teal-500 text-teal-700 hover:bg-teal-50 hover:scale-105 transition-transform duration-200 flex items-center gap-2">
    {/* Shield Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8.25 4.5v5.25c0 5.25-4.5 9-8.25 9s-8.25-3.75-8.25-9V7.5L12 3z" />
    </svg>
    Admin Login
    <ArrowRight className="ml-2 h-5 w-5" />
  </Button>
</Link>
        </motion.div>
      </motion.div>
      {/* Modernized image card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative flex justify-center items-center"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-200/30 to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1503676382389-4809596d5290?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
            alt="Diverse students collaborating on campus"
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
              <CampusResolveLogo className="w-5 h-5" />
              <span className="font-bold">Campus Resolve - College Complaint Management System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Campus Resolve. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;