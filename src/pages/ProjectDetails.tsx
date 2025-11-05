import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Calendar, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectDetails {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image_url?: string;
  image_urls?: string[];
  category?: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchSettings();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .single();

      if (error) throw error;

      if (data) {
        // Handle both new image_urls array and old single image_url
        let imageUrls: string[] = [];
        
        if (data.image_urls && Array.isArray(data.image_urls) && data.image_urls.length > 0) {
          // New format: multiple images
          imageUrls = data.image_urls.map(String).filter(url => url && url.trim() !== '');
        } else if (data.image_url && data.image_url.trim() !== '') {
          // Old format: single image
          imageUrls = [data.image_url];
        }
        
        setProject({
          id: data.id,
          title: data.title,
          description: data.description,
          technologies: Array.isArray(data.technologies) ? data.technologies.map(String) : [],
          image_url: data.image_url,
          image_urls: imageUrls,
          category: data.category || 'Web Development',
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
    } catch (error: any) {
      console.error('Error fetching project details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details. Please try again later.",
      });
      navigate('/browse-projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('whatsapp_number')
        .single();

      if (error) throw error;
      setWhatsappNumber(data?.whatsapp_number || "919137106851");
    } catch (error) {
      console.error('Error fetching settings:', error);
      setWhatsappNumber("919137106851");
    }
  };

  const handleWhatsAppClick = () => {
    if (!project) return;
    const phoneNumber = whatsappNumber || "919137106851";
    const message = encodeURIComponent(`Hello, I'm interested in this project: ${project.title}`);
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 mb-4 sm:mb-6 lg:mb-8" />
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-48 sm:h-64 md:h-80 lg:h-96 w-full mb-4 sm:mb-6 lg:mb-8 rounded-lg sm:rounded-xl" />
            <Skeleton className="h-8 sm:h-10 md:h-12 w-full sm:w-3/4 mb-3 sm:mb-4" />
            <Skeleton className="h-5 sm:h-6 w-1/2 sm:w-1/4 mb-4 sm:mb-6 lg:mb-8" />
            <Skeleton className="h-32 sm:h-40 w-full mb-4 sm:mb-6 lg:mb-8" />
            <Skeleton className="h-24 sm:h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <Button onClick={() => navigate('/browse-projects')} className="text-sm sm:text-base">
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Navigation Buttons */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
          <Button
            variant="ghost"
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-black hover:bg-white/50 text-sm sm:text-base"
          >
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Home</span>
            <span className="sm:hidden">Home</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              navigate('/browse-projects');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-black hover:bg-white/50 text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Back to Projects</span>
            <span className="sm:hidden">Projects</span>
          </Button>
        </div>

        {/* Project Details */}
        <div className="max-w-4xl mx-auto">
          {/* Project Images - Carousel */}
          {project.image_urls && project.image_urls.length > 0 ? (
            <div className="relative aspect-video overflow-hidden rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-br from-blue-100 to-cyan-100">
              <img 
                src={project.image_urls[currentImageIndex]} 
                alt={`${project.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {project.image_urls.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? project.image_urls!.length - 1 : prev - 1))}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all"
                  >
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === project.image_urls!.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all"
                  >
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                    {project.image_urls.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-6 sm:w-8' : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Image Counter */}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                    {currentImageIndex + 1} / {project.image_urls.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="aspect-video overflow-hidden rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 flex items-center justify-center">
              <svg className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Project Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              {project.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-600 mb-4 sm:mb-6">
              {project.category && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">{project.category}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Created {formatDate(project.created_at)}</span>
              </div>
            </div>

            {/* Technologies */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {project.technologies.map((tech, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors font-medium px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Project Description */}
          <Card className="mb-6 sm:mb-8 border-0 shadow-lg sm:shadow-xl bg-gradient-to-br from-white to-blue-50/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-blue-100/40 to-cyan-100/40 rounded-full blur-2xl sm:blur-3xl -translate-y-16 sm:-translate-y-24 md:-translate-y-32 translate-x-16 sm:translate-x-24 md:translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-gradient-to-tr from-cyan-100/40 to-blue-100/40 rounded-full blur-2xl sm:blur-3xl translate-y-12 sm:translate-y-18 md:translate-y-24 -translate-x-12 sm:-translate-x-18 md:-translate-x-24"></div>
            
            <CardHeader className="relative z-10 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold">
                  About This Project
                </CardTitle>
              </div>
              <div className="h-0.5 sm:h-1 w-16 sm:w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            </CardHeader>
            
            <CardContent className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-blue-100/50 shadow-inner">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-wrap break-words">
                  {project.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-white">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-xl sm:text-2xl text-white">Interested in This Project?</CardTitle>
              <CardDescription className="text-blue-50 text-sm sm:text-base">
                Get in touch with us to discuss your requirements and get a personalized quote.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <Button 
                onClick={handleWhatsAppClick}
                size="lg"
                className="w-full bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all font-semibold py-5 sm:py-6 rounded-xl text-sm sm:text-base"
              >
                <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Contact Us on WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
