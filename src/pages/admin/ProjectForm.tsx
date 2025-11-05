import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload } from "lucide-react";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Description is too long (max 5000 characters)"),
  technologies: z.string().trim().min(1, "Technologies are required"),
  category: z.string().optional(), // Make category optional
});

const PROJECT_CATEGORIES = [
  "Web Development",
  "Mobile App",
  "Machine Learning",
  "Data Science",
  "AI/ML",
  "Blockchain",
  "Game Development",
  "Desktop Application",
  "DevOps/Cloud",
  "Cybersecurity",
  "IoT",
  "E-commerce",
  "Other"
];

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [category, setCategory] = useState("Web Development");

  useEffect(() => {
    checkAuth();
    if (isEditing) {
      fetchProject();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "Please login to access this page.",
      });
      navigate('/admin/login');
    }
  };

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setTitle(data.title);
      setDescription(data.description);
      setTechnologies(Array.isArray(data.technologies) ? data.technologies.join(', ') : '');
      setImageUrl(data.image_url || '');
      
      // Handle both new image_urls array and old single image_url
      let urls: string[] = [];
      if (data.image_urls && Array.isArray(data.image_urls) && data.image_urls.length > 0) {
        urls = data.image_urls.map(String).filter(url => url && url.trim() !== '');
      } else if (data.image_url && data.image_url.trim() !== '') {
        urls = [data.image_url];
      }
      setImageUrls(urls);
      
      setPublished(data.published);
      // Only set category if it exists in the data
      if (data.category) {
        setCategory(data.category);
      }
    } catch (error: any) {
      console.error('Fetch project error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project.",
      });
      navigate('/admin/dashboard');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name}: Please upload a JPEG, PNG, WebP, or GIF image.`,
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name}: Please upload an image smaller than 5MB.`,
        });
        return;
      }
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setImageUrls([...imageUrls, ...uploadedUrls]);
      // Set first image as primary image for backward compatibility
      if (!imageUrl && uploadedUrls.length > 0) {
        setImageUrl(uploadedUrls[0]);
      }

      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload images.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    // Update primary image if needed
    if (newUrls.length > 0) {
      setImageUrl(newUrls[0]);
    } else {
      setImageUrl('');
    }
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return; // Already main image
    const newUrls = [...imageUrls];
    const [mainImage] = newUrls.splice(index, 1);
    newUrls.unshift(mainImage);
    setImageUrls(newUrls);
    setImageUrl(mainImage);
    toast({
      title: "Success",
      description: "Main image updated successfully.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const validation = projectSchema.safeParse({
      title,
      description,
      technologies,
      category,
    });

    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: validation.error.errors[0].message,
      });
      return;
    }

    setLoading(true);
    try {
      const techArray = technologies
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const projectData = {
        title: title.trim(),
        description: description.trim(),
        technologies: techArray,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        image_urls: imageUrls,
        published,
        category,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Project ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Project creation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} project.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-dark)] p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button
          onClick={() => navigate('/admin/dashboard')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="border-border bg-card shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isEditing ? 'Edit Project' : 'New Project'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isEditing ? 'Update project details' : 'Add a new project to your portfolio'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E-commerce Platform"
                  required
                  maxLength={100}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A full-stack e-commerce solution with payment integration..."
                  required
                  maxLength={5000}
                  rows={10}
                  className="bg-input border-border resize-y min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/5000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Project Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Select the primary domain/category for this project
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies</Label>
                <Input
                  id="technologies"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="React, Node.js, MongoDB, Stripe"
                  required
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Separate technologies with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Project Images</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="bg-input border-border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => document.getElementById('images')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can upload multiple images. Click "Set as Main" to change which image appears first.
                </p>
                {imageUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover" />
                        
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        
                        {/* Set as Main Button */}
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(index)}
                            className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all shadow-lg font-medium"
                            title="Set as main image"
                          >
                            Set as Main
                          </button>
                        )}
                        
                        {/* Main Image Badge */}
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-semibold shadow-lg">
                            ⭐ Main Image
                          </div>
                        )}
                        
                        {/* Image Number */}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary">
                <div className="space-y-0.5">
                  <Label htmlFor="published">Publish Project</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this project visible on your portfolio
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading || uploading}
                >
                  {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
