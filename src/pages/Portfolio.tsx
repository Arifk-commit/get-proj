import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image_url?: string;
  category?: string;
}

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchSettings();
    checkAdminStatus();

    // Add scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []).map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        technologies: Array.isArray(project.technologies) ? project.technologies.map(String) : [],
        image_url: project.image_url,
        category: project.category || 'Web Development',
      })));
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

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const handleAddProject = () => {
    if (isAdmin) {
      navigate('/admin/project/new');
    } else {
      navigate('/admin/login');
    }
  };

  const handleContactClick = () => {
    const phoneNumber = "919137106851"; // Your WhatsApp number with country code
    const message = encodeURIComponent("Hello, I'd like to discuss a project with you!");
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const scrollToProjects = () => {
    navigate('/browse-projects');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a4d8f] via-[#2563eb] to-[#0ea5e9] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/10 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo-black.svg" alt="ProjectKart Logo" className="h-10 w-10" />
            <span className={`font-bold text-xl transition-colors ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>ProjectKart</span>
          </div>
          <div className="flex gap-6">
            <button 
              onClick={() => navigate('/')}
              className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-900 hover:text-blue-600' : 'text-white hover:text-cyan-200'
              }`}
            >
              Home
            </button>
            <button 
              onClick={scrollToProjects}
              className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-900 hover:text-blue-600' : 'text-white hover:text-cyan-200'
              }`}
            >
              Browse Projects
            </button>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-3xl">
          {/* Tag */}
          <div className="inline-block mb-4 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <span className="text-white text-xs font-medium">YOUR PROJECT. READY. RUNNING.</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Browse and buy<br />
            ready-made<br />
            projects or request<br />
            custom-built ones
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-xl">
            Skip the coding chaos — get complete, working projects built and set up<br />
            for your use-needs in days, not weeks.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={scrollToProjects}
              size="lg"
              className="bg-white text-blue-600 hover:bg-white/90 text-base px-6 py-5 h-auto font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              Browse Projects
            </Button>
            <Button 
              onClick={handleContactClick}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/20 text-base px-6 py-5 h-auto font-semibold rounded-full backdrop-blur-sm"
            >
              Contact
            </Button>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block">
          <div className="relative">
            {/* Phone frame */}
            <div className="w-[280px] h-[560px] bg-white rounded-[2.5rem] shadow-2xl p-2.5 border-[6px] border-gray-800">
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 rounded-[2rem] overflow-hidden relative">
                {/* Phone content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <button 
                      onClick={handleAddProject}
                      className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mx-auto mb-3 flex items-center justify-center hover:from-blue-600 hover:to-cyan-500 transition-all cursor-pointer shadow-lg hover:shadow-xl group"
                      title={isAdmin ? "Add New Project" : "Login to Add Projects"}
                    >
                      <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <div className="text-gray-600 text-xs mb-2">1400 x 900px</div>
                    <div className="w-full h-24 bg-white/50 rounded-xl mb-2"></div>
                    <div className="text-xs text-gray-400">2532 x 1170px</div>
                  </div>
                </div>
                {/* Contact button on phone */}
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={handleContactClick}
                    className="bg-white px-4 py-1.5 rounded-full shadow-lg text-blue-600 font-semibold text-xs hover:bg-blue-50 hover:shadow-xl transition-all cursor-pointer"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <section id="projects-section" className="relative z-10 bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Featured Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our portfolio of innovative solutions ready to deploy
            </p>
          </div>

          {loading ? (
            <div className="text-center text-gray-600 py-12">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600 mb-4">No projects available yet.</div>
              <p className="text-gray-500">Check back soon for amazing projects!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {projects.slice(0, 6).map((project) => (
                  <ProjectCard
                    key={project.id}
                    title={project.title}
                    description={project.description}
                    technologies={project.technologies}
                    imageUrl={project.image_url}
                    whatsappNumber={whatsappNumber}
                  />
                ))}
              </div>
              
              {projects.length > 6 && (
                <div className="text-center">
                  <Button
                    onClick={() => navigate('/browse-projects')}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600"
                  >
                    View All Projects
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-black.svg" alt="ProjectKart Logo" className="h-10 w-10 brightness-0 invert" />
                <span className="text-white font-bold text-lg">ProjectKart</span>
              </div>
              <p className="text-gray-400">
                Professional ready-made projects and custom solutions for your business needs.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/browse-projects')} className="text-gray-400 hover:text-white transition-colors">Browse Projects</button></li>
                <li><button onClick={handleContactClick} className="text-gray-400 hover:text-white transition-colors">Contact Us</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Get in Touch</h3>
              <p className="text-gray-400 mb-4">
                Ready to start your project? Contact us today!
              </p>
              <Button 
                onClick={handleContactClick}
                className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white hover:from-blue-700 hover:to-cyan-500"
              >
                WhatsApp Us
              </Button>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ProjectKart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
