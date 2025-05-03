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
import { Loader2, Shield } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

// Validation schema for the form
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

const AdminSignIn = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Get the redirect path from location state or default to admin dashboard
  const from = location.state?.from || "/admin";

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
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          console.log("Admin signed in:", user.email);
          navigate(from, { replace: true });
        } else {
          setError("You do not have administrator privileges.");
          setTimeout(() => {
            signOut();
          }, 1000);
        }
      } else {
        setError("User data not found. Please contact support.");
      }
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      switch (error.code) {
        case "auth/user-not-found":
          setError("No user found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.");
          break;
        default:
          setError("An error occurred during sign-in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Background image for desktop */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-600 to-red-800 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <Shield className="h-12 w-12 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Admin Portal</h1>
          <p className="text-xl max-w-md text-center text-white/90">
            Sign in to access the administrator dashboard and manage student complaints.
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
            <Shield className="h-10 w-10 text-red-600 mb-4" />
            <h1 className="text-3xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground text-center mt-2">
              Sign in to manage complaints
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 hidden md:block">Administrator Sign In</h2>

            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                role="alert"
              >
                <p>{error}</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@college.edu"
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In as Administrator"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Student?</span>{" "}
              <Link to="/signin" className="text-primary font-medium hover:underline">
                Go to student login
              </Link>
            </div>

            {/* Demo account info */}
            <div className="mt-8 text-sm border-t pt-4">
              <p className="text-muted-foreground mb-2 text-center font-medium">
                Demo Admin Account
              </p>
              <div className="text-xs rounded bg-secondary p-2">
                <p>
                  <span className="font-medium">Admin:</span> admin@college.edu
                </p>
                <p>
                  <span className="font-medium">Password:</span> password
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSignIn;
