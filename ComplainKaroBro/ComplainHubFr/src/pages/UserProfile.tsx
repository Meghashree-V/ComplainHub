import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Pencil, Camera, Save } from "lucide-react";

const UserProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    studentId: user?.studentId || "",
    department: user?.department || "",
    bio: user?.bio || "",
  });

  // Update form data if user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        studentId: user.studentId || "",
        department: user.department || "",
        bio: user.bio || "",
      });
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Failed to upload image. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!formData.studentId.trim()) {
      toast.error("Student ID is required.");
      return;
    }

    if (user && updateUserProfile) {
      try {
        await updateUserProfile({
          ...user,
          name: formData.name,
          studentId: formData.studentId || user.studentId,
          department: formData.department || user.department,
          bio: formData.bio,
          profileImage: profileImage || user.profileImage,
        });
        toast.success("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again.");
      }
    }

    setIsEditing(false);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() =>
                isEditing
                  ? handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                  : setIsEditing(true)
              }
            >
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center space-y-4">
                    <div
                      className="relative cursor-pointer group"
                      onClick={handleImageClick}
                      aria-label="Upload profile picture"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleImageClick()}
                    >
                      <Avatar className="h-32 w-32 border-2 border-primary">
                        {profileImage ? (
                          <AvatarImage src={profileImage} alt={formData.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/20 text-primary text-4xl">
                            <User />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="text-sm text-muted-foreground">Click to upload profile picture</p>
                  </div>

                  <div className="flex-1 grid gap-5 w-full">
                    <div className="grid gap-3">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        readOnly={true}
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground">Email addresses cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleChange}
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder="Tell us a little about yourself..."
                        value={formData.bio}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          name: user?.name || "",
                          email: user?.email || "",
                          studentId: user?.studentId || "",
                          department: user?.department || "",
                          bio: user?.bio || "",
                        });
                        setProfileImage(user?.profileImage || null);
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;