import { resumeData } from "@/lib/data/resume-data";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

export function ProjectsSection() {
  const { projects } = resumeData;

  return (
    <section id="projects" className="py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Projects</h2>
        <Separator className="mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col p-0">
              {/* Project Image */}
              {project.image && (
                <div className="relative w-full h-50 bg-muted">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <CardContent className="pt-0 pb-4 flex flex-col flex-1">
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="font-semibold text-base text-foreground">
                      {project.name}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {project.date}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Technologies */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Link Button */}
                {project.link && (
                  <div className="mt-auto">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Project
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
