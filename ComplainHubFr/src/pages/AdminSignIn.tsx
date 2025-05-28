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
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side: Welcome Message */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-blue-400 via-teal-400 to-blue-600 text-white p-12 min-h-screen">
        <div className="flex flex-col items-center justify-center h-full w-full">
          {/* Shield Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M24 4l18 8.25v9.25c0 9.25-7.5 16.5-18 20-10.5-3.5-18-10.75-18-20V12.25L24 4z" />
          </svg>
          <h2 className="text-3xl font-bold mb-2 text-center">Admin Portal</h2>
          <p className="text-base text-center max-w-xs">Sign in to access the administrator dashboard and manage student complaints.</p>
        </div>
      </div>
      {/* Right Side: Admin Login Form */}
      <div className="flex flex-1 items-center justify-center min-h-screen bg-white">
        <div className="bg-white/90 rounded-2xl shadow-xl w-full max-w-md flex flex-col px-8 py-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Administrator Sign In</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Admin Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="admin@college.edu"
                        autoComplete="username"
                        className="bg-white border border-gray-300 focus:border-blue-400 px-3 py-2 rounded-md text-gray-800"
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
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        className="bg-white border border-gray-300 focus:border-blue-400 px-3 py-2 rounded-md text-gray-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <Button type="submit" size="lg" className="w-full rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors duration-200 mt-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                Sign in as Administrator
              </Button>
            </form>
          </Form>
          <div className="flex justify-center items-center mt-4 text-gray-600 text-sm">
            Student?&nbsp;
            <Link to="/signin" className="text-blue-600 hover:underline">Go to student login</Link>
          </div>
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-3 text-gray-400 text-xs">Demo Admin Account</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <div className="bg-gray-100 rounded-lg px-4 py-3 text-gray-700 text-sm">
            <div><span className="font-semibold">Admin:</span> admin@college.edu</div>
            <div><span className="font-semibold">Password:</span> password</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;
