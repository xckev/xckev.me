"use client";

import { useState } from "react";
import { resumeData } from "@/lib/data/resume-data";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";

export function EducationSection() {
  const { education } = resumeData;
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section id="education" className="pt-6 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Education</h2>
        <Separator className="mb-6" />

        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="border-b border-border pb-4 last:border-b-0">
              <div
                className="flex items-start gap-4 cursor-pointer"
                onClick={() => toggleExpand(index)}
              >
                {/* School Logo */}
                <div className="shrink-0 w-12 h-12 relative rounded-md overflow-hidden flex items-center justify-center">
                  {edu.logo ? (
                    <Image
                      src={edu.logo}
                      alt={`${edu.institution} logo`}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                </div>

                {/* School Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base text-foreground">
                          {edu.institution}
                        </h3>
                        {expandedIndices.has(index) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {edu.degrees.join(", ")}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {edu.period}
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              {expandedIndices.has(index) && (
                <div className="mt-3 ml-16 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      GPA: {edu.gpa.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1.5">
                      Achievements
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {edu.achievements.map((achievement, achievementIndex) => (
                        <Badge key={achievementIndex} variant="secondary" className="text-xs">
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1.5">
                      Relevant Coursework
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {edu.coursework.map((course, courseIndex) => (
                        <Badge key={courseIndex} variant="outline" className="text-xs">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
