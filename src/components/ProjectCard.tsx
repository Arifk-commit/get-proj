import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  whatsappNumber: string;
  className?: string;
}

export const ProjectCard = ({ 
  id,
  title, 
  description, 
  technologies, 
  imageUrl,
  whatsappNumber,
  className = ""
}: ProjectCardProps) => {
  const navigate = useNavigate();
  
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking WhatsApp button
    const phoneNumber = "919137106851"; // Direct WhatsApp number with country code
    const message = encodeURIComponent(`Hello, I'm interested in this project: ${title}`);
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleViewDetails = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent double navigation when clicking the button
    }
    navigate(`/project/${id}`);
  };

  return (
    <Card 
      className={`group overflow-hidden border-0 bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer touch-manipulation ${className}`}
      onClick={handleViewDetails}
    >
      {imageUrl && (
        <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}
      {!imageUrl && (
        <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 flex items-center justify-center">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
        <CardTitle className="text-gray-900 group-hover:text-blue-600 transition-colors text-lg sm:text-xl line-clamp-2">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600 line-clamp-2 text-sm sm:text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {technologies.map((tech, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors font-medium text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
            >
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleViewDetails}
            variant="outline"
            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all font-semibold py-5 sm:py-6 rounded-xl text-sm sm:text-base touch-manipulation"
          >
            <Eye className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">Details</span>
          </Button>
          <Button 
            onClick={handleWhatsAppClick}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all font-semibold py-5 sm:py-6 rounded-xl text-sm sm:text-base touch-manipulation"
          >
            <MessageCircle className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Get a Quote</span>
            <span className="sm:hidden">Quote</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
