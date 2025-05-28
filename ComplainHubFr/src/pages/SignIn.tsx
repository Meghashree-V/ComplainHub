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
import { FileText, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig"; // Corrected import path
import { toast } from "sonner"; // For user notifications

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      console.log("Attempting to sign in with email:", values.email); // Debugging log

      // Firebase Authentication sign-in
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);

      if (userCredential.user) {
        console.log("Sign-in successful:", userCredential.user); // Debugging log

        // Redirect to the page they were trying to access or dashboard
        if (values.email.includes("admin")) {
          navigate("/admin");
        } else {
          navigate(from);
        }

        toast.success("Sign-in successful!");
      }
    } catch (error: any) {
      console.error("Error signing in:", error.message); // Debugging log

      // Handle specific Firebase errors
      switch (error.code) {
        case "auth/user-not-found":
          toast.error("No user found with this email.");
          break;
        case "auth/wrong-password":
          toast.error("Incorrect password. Please try again.");
          break;
        case "auth/too-many-requests":
          toast.error("Too many failed attempts. Please try again later.");
          break;
        default:
          toast.error("An error occurred during sign-in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-white to-teal-50 relative overflow-hidden">
  {/* Animated background shapes */}
  <div className="absolute -top-24 -left-32 w-[400px] h-[400px] bg-teal-200 opacity-30 rounded-full blur-3xl animate-pulse z-0"></div>
  <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-teal-300 opacity-30 rounded-full blur-2xl animate-pulse z-0"></div>
  <div className="relative z-10 w-full max-w-md mx-auto">
    <div className="glass-card p-10 rounded-3xl shadow-2xl flex flex-col items-center">
      {/* Campus SVG illustration */}
      <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-6">
        <circle cx="32" cy="32" r="32" fill="#06b6d4"/>
        <rect x="18" y="28" width="28" height="16" rx="4" fill="#fff"/>
        <rect x="24" y="36" width="16" height="6" rx="2" fill="#06b6d4"/>
        <rect x="28" y="32" width="8" height="4" rx="1" fill="#06b6d4"/>
        <rect x="30" y="38" width="4" height="6" rx="1" fill="#fff"/>
      </svg>
      <h1 className="text-3xl font-extrabold mb-2 text-teal-900 text-center drop-shadow-lg">Welcome to Campus Resolve</h1>
      <p className="mb-6 text-lg text-teal-700 text-center">Sign in to access your dashboard and manage your campus life.</p>          <h1 className="text-4xl font-extrabold mb-4 drop-shadow-lg">Welcome Back</h1>
          <p className="text-xl max-w-md text-center text-white/90 font-medium drop-shadow">
            Sign in to access your Campus Resolve dashboard and manage your campus issues.
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
          <div className="glass-card p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 hidden md:block">Sign In</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
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

                {/* Password Field */}
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
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg"
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;