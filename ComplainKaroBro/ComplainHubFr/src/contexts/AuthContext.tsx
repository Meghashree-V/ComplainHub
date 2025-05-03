import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Define user types and roles
export type UserRole = "student" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  profileImage?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    email: string,
    password: string,
    name: string,
    studentId: string,
    department: string
  ) => Promise<boolean>;
  signOut: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateUserProfile: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const { uid, email } = firebaseUser;

        try {
          // Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: uid,
              email: email || "",
              name: userData.name || "User",
              role: userData.role || "student", // Default to "student"
              studentId: userData.studentId || "",
              department: userData.department || "",
              profileImage: userData.profileImage || "",
              bio: userData.bio || "",
            });
          } else {
            console.error("User document not found in Firestore.");
            toast.error("User data not found. Please contact support.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to fetch user data.");
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch additional user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: user.uid,
          email: user.email || "",
          name: userData.name || "User",
          role: userData.role || "student",
          studentId: userData.studentId || "",
          department: userData.department || "",
          profileImage: userData.profileImage || "",
          bio: userData.bio || "",
        });

        // Check if the user is an admin
        if (userData.role === "admin") {
          toast.success("Welcome, Admin!");
        } else {
          toast.success(`Welcome back, ${userData.name || "User"}!`);
        }
        return true;
      } else {
        toast.error("User data not found. Please contact support.");
        return false;
      }
    } catch (error: any) {
      console.error("Sign in error:", error);

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
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    studentId: string,
    department: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: "student", // Default role
        studentId,
        department,
        profileImage: "",
        bio: "",
      });

      setUser({
        id: user.uid,
        email: user.email || "",
        name,
        role: "student",
        studentId,
        department,
        profileImage: "",
        bio: "",
      });

      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An error occurred during sign-up.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    firebaseSignOut(auth)
      .then(() => {
        setUser(null);
        toast.success("You have been signed out.");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
        toast.error("An error occurred during sign-out.");
      });
  };

  const updateUserProfile = (updatedUser: User) => {
    setUser(updatedUser);
    toast.success("Profile updated successfully!");
  };

  const isAuthenticated = !!user;
  const isAdmin = !!user && user.role === "admin";

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;