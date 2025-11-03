import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  whatsappNumber: string;
}

export const ProjectCard = ({ 
  title, 
  description, 
  technologies, 
  imageUrl,
  whatsappNumber 
}: ProjectCardProps) => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Hello, I'm interested in discussing your project: ${title}`);
    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="group overflow-hidden border-border bg-card hover:shadow-[var(--shadow-glow)] transition-[box-shadow] duration-300">
      {imageUrl && (
        <div className="aspect-video overflow-hidden bg-muted">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-foreground group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {tech}
            </Badge>
          ))}
        </div>
        <Button 
          onClick={handleWhatsAppClick}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[var(--shadow-glow)] transition-all"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Get a Quote
        </Button>
      </CardContent>
    </Card>
  );
};
