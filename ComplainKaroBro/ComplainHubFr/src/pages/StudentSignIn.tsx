
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

const StudentSignIn = () => {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from || "/dashboard";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      const success = await signIn(values.email, values.password);
      
      if (success) {
        // Check if the signed in user is a student
        if (!values.email.includes('admin')) {
          navigate(from);
        } else {
          setError("Please use the admin login page for administrator access.");
          setTimeout(() => {
            signOut();
          }, 1000);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Background image for desktop */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary/70 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <FileText className="h-12 w-12 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-xl max-w-md text-center text-white/90">
            Sign in to access your dashboard and manage your complaints.
          </p>
        </div>
      </div>
      
      {/* Right side - Sign in form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-background">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Mobile header - only visible on mobile */}
          <div className="flex flex-col items-center mb-8 md:hidden">
            <FileText className="h-10 w-10 text-primary mb-4" />
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground text-center mt-2">
              Sign in to access your dashboard
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 hidden md:block">Student Sign In</h2>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{error}</p>
            </div>}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@college.edu" 
                          {...field}
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field}
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between">
                  <Link to="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In as Student"
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account?</span>{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up now
              </Link>
            </div>
            
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Administrator?</span>{" "}
              <Link to="/admin/signin" className="text-red-600 font-medium hover:underline">
                Admin login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentSignIn;
