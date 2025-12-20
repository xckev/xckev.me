"use client";

import { useState } from "react";
import { resumeData } from "@/lib/data/resume-data";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";

export function ExperienceSection() {
  const { experiences } = resumeData;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="experience" className="py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Experience</h2>
        <Separator className="mb-6" />

        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <div key={index} className="border-b border-border pb-4 last:border-b-0">
              <div
                className="flex items-start gap-4 cursor-pointer"
                onClick={() => toggleExpand(index)}
              >
                {/* Company Logo */}
                <div className="shrink-0 w-12 h-12 relative rounded-md overflow-hidden flex items-center justify-center">
                  {exp.logo ? (
                    <Image
                      src={exp.logo}
                      alt={`${exp.company} logo`}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                </div>

                {/* Company Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base text-foreground">
                          {exp.company}
                        </h3>
                        {expandedIndex === index ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {exp.title}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {exp.period}
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              {expandedIndex === index && (
                <div className="mt-3 ml-16 space-y-1">
                  <ul className="space-y-1.5">
                    {exp.description.map((desc, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {desc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
