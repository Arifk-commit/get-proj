import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image_url?: string;
  category?: string; // Make optional
}

const PROJECT_CATEGORIES = [
  "All Categories",
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

export default function BrowseProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchSettings();
  }, []);

  useEffect(() => {
    let filtered = projects;

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(project => 
        selectedCategories.includes(project.category || 'Web Development')
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.technologies.some(tech => tech.toLowerCase().includes(query)) ||
        (project.category || '').toLowerCase().includes(query)
      );
    }

    setFilteredProjects(filtered);
  }, [searchQuery, selectedCategories, projects]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mappedProjects = (data || []).map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        technologies: Array.isArray(project.technologies) ? project.technologies.map(String) : [],
        image_url: project.image_url,
        category: project.category || 'Web Development',
      }));
      setProjects(mappedProjects);
      setFilteredProjects(mappedProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load projects. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('whatsapp_number')
        .single();

      if (data) {
        setWhatsappNumber(data.whatsapp_number);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a4d8f] via-[#2563eb] to-[#0ea5e9]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Desktop: Single Row with Logo, Search, Home */}
          {/* Mobile: Logo & Home on first row, Search on second row */}
          
          {/* First Row on Mobile / Complete Row on Desktop */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
            {/* Left: Menu (mobile) + Logo + Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Menu Button */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="sm:hidden text-white hover:bg-white/20 p-1.5 h-auto relative"
                  >
                    <Menu className="h-5 w-5" />
                    {selectedCategories.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {selectedCategories.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] bg-gradient-to-br from-[#1a4d8f] via-[#2563eb] to-[#0ea5e9] border-white/20">
                  <SheetHeader>
                    <SheetTitle className="text-white text-left">Filter by Category</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    {/* Clear All Button */}
                    {selectedCategories.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedCategories([]);
                          setSidebarOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center justify-between"
                      >
                        <span>Clear All Filters</span>
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    
                    {/* Category List */}
                    {PROJECT_CATEGORIES.filter(cat => cat !== "All Categories").map((cat) => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCategories(selectedCategories.filter(c => c !== cat));
                            } else {
                              setSelectedCategories([...selectedCategories, cat]);
                            }
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all ${
                            isSelected
                              ? 'bg-white text-blue-600 font-medium shadow-lg'
                              : 'text-white hover:bg-white/20'
                          }`}
                        >
                          {cat}
                          {isSelected && <span className="ml-2">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Apply Filters Button */}
                  <div className="mt-6 pt-4 border-t border-white/20 space-y-3">
                    {selectedCategories.length > 0 && (
                      <p className="text-xs text-white/60 text-center">
                        {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                      </p>
                    )}
                    <Button
                      onClick={() => setSidebarOpen(false)}
                      className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold py-5 rounded-xl shadow-lg"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Apply Filters & Search
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo and Title */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <img src="/logo-black.svg" alt="ProjectKart" className="h-6 w-6 sm:h-8 sm:w-8 brightness-0 invert" />
                <span className="text-white font-bold text-sm sm:text-lg">ProjectKart</span>
              </div>
            </div>

            {/* Center: Search Bar (Desktop) - Hidden on mobile */}
            <div className="hidden sm:flex flex-1 max-w-md mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 focus:ring-white/30 rounded-full"
                />
              </div>
            </div>
            
            {/* Right: Home Button */}
            <Button
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 whitespace-nowrap flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>

          {/* Second Row: Search Bar (Mobile only) */}
          <div className="sm:hidden mb-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/60 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 focus:ring-white/30 rounded-full"
              />
            </div>
          </div>

          {/* Bottom Row: Category Filters (Desktop only) */}
          <div className="hidden sm:block pt-3 sm:pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <span className="text-white font-semibold text-xs sm:text-sm">Filter by Category</span>
              {selectedCategories.length > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-white/60">
                    {selectedCategories.length} selected
                  </span>
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-[10px] sm:text-xs text-white/70 hover:text-white underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2">
              {PROJECT_CATEGORIES.filter(cat => cat !== "All Categories").map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategories(selectedCategories.filter(c => c !== cat));
                      } else {
                        setSelectedCategories([...selectedCategories, cat]);
                      }
                    }}
                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium rounded-lg transition-all relative touch-manipulation ${
                      isSelected
                        ? 'bg-white text-blue-600 shadow-lg scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
                    }`}
                  >
                    <span className="line-clamp-2 sm:line-clamp-1">{cat}</span>
                    {isSelected && (
                      <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-[8px] sm:text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Projects Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {loading ? (
          <div className="text-center text-white py-12 sm:py-16 lg:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 sm:py-16 lg:py-20 px-4">
            <div className="text-white mb-3 sm:mb-4 text-base sm:text-lg">
              {searchQuery ? `No projects found for "${searchQuery}"` : "No projects available yet."}
            </div>
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery("")}
                className="mt-4 bg-white text-blue-600 hover:bg-white/90 text-sm sm:text-base"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-6 text-white/90 text-xs sm:text-sm text-center md:text-left px-1">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              {selectedCategories.length > 0 && ` in ${selectedCategories.join(', ')}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  technologies={project.technologies}
                  imageUrl={project.image_url}
                  whatsappNumber={whatsappNumber}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur-md border-t border-white/10 py-8 sm:py-10 lg:py-12 mt-12 sm:mt-16 lg:mt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <img src="/logo-black.svg" alt="ProjectKart" className="h-8 w-8 sm:h-10 sm:w-10 brightness-0 invert" />
                <span className="text-white font-bold text-base sm:text-lg">ProjectKart</span>
              </div>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Professional ready-made projects and custom solutions for your business needs.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <button 
                    onClick={() => navigate('/')} 
                    className="text-white/70 hover:text-white transition-colors text-xs sm:text-sm"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/browse-projects')} 
                    className="text-white/70 hover:text-white transition-colors text-xs sm:text-sm"
                  >
                    Browse Projects
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      const phoneNumber = "919137106851";
                      const message = encodeURIComponent("Hello, I'd like to discuss a project with you!");
                      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                    }}
                    className="text-white/70 hover:text-white transition-colors text-xs sm:text-sm"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

            {/* Get in Touch */}
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Get in Touch</h3>
              <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                Ready to start your project? Contact us today!
              </p>
              <Button 
                onClick={() => {
                  const phoneNumber = "919137106851";
                  const message = encodeURIComponent("Hello, I'd like to discuss a project with you!");
                  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                }}
                className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white hover:from-blue-700 hover:to-cyan-500 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 w-full sm:w-auto"
              >
                WhatsApp Us
              </Button>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-4 sm:pt-6 text-center text-white/70 text-xs sm:text-sm">
            <p>&copy; {new Date().getFullYear()} ProjectKart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
