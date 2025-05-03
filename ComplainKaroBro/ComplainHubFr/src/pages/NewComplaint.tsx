import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/MainLayout";
import { COMPLAINT_CATEGORY_OPTIONS, ComplaintCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send, X, Image } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }).max(100, {
    message: "Title must not exceed 100 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }).max(2000, {
    message: "Description must not exceed 2000 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const NewComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const newImages: { file: File; preview: string }[] = [];
    
    Array.from(files).forEach(file => {
      // Validate file type and size
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`File ${file.name} is not a supported image type`);
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} is too large (max 5MB)`);
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({
          file,
          preview: reader.result as string
        });
        setImages(prev => [...prev, ...newImages]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit a complaint");
      return;
    }

    setIsSubmitting(true);
    try {
      // Process the image (in a real app, you would upload to a storage service)
      let imageUrl = "";
      if (images.length > 0) {
        // For now, we'll just use the preview data URL
        imageUrl = images[0].preview;
        console.log("Using image URL:", imageUrl);
      }

      // Add the new complaint to Firestore
      const docRef = await addDoc(collection(db, "complaints"), {
        title: values.title,
        description: values.description,
        category: values.category as ComplaintCategory,
        priority: "medium", // Default priority
        studentId: user.studentId || user.uid, // Ensure studentId is set
        studentName: user.name,
        department: user.department || "",
        status: "pending",
        imageUrl: imageUrl, // Add the image URL to the complaint
        createdAt: serverTimestamp(),
      });

      toast.success("Complaint submitted successfully!");

      // Navigate to the complaints list or details page
      navigate(`/complaints/${docRef.id}`);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Submit a New Complaint</h1>
            <p className="text-muted-foreground">
              Please provide detailed information about your complaint to help us address it effectively.
            </p>
          </div>

          <div className="glass-card rounded-xl p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief title describing your complaint"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a clear and concise title for your complaint
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMPLAINT_CATEGORY_OPTIONS.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the category that best fits your complaint
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed information about your complaint..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include all relevant details, such as when and where the issue occurred, who was involved, and any other important information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <FormLabel htmlFor="images">Upload Images</FormLabel>
                    <div className="mt-2">
                      <div className="flex items-center justify-center w-full">
                        <label 
                          htmlFor="image-upload" 
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Image className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG or WEBP (MAX. 5MB)
                            </p>
                          </div>
                          <input 
                            id="image-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            multiple
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                    <FormDescription>
                      Upload images related to your complaint (optional)
                    </FormDescription>
                  </div>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image.preview} 
                            alt={`Preview ${index}`} 
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default NewComplaint;