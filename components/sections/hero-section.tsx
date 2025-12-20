import { resumeData } from "@/lib/data/resume-data";
import { Button } from "@/components/ui/button";
import { FileText, Linkedin as LinkedinIcon, Github as GithubIcon } from "lucide-react";
import Image from "next/image";
import { SpotifyNowPlaying } from "@/components/spotify-now-playing";

export function HeroSection() {
  const { personalInfo } = resumeData;

  return (
    <section
      id="home"
      className="flex items-center justify-center px-4 pt-16 pb-2 sm:pt-22 sm:pb-2"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <div className="shrink-0">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-border shadow-lg">
              <Image
                src="/profile.jpg"
                alt={personalInfo.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              {`Hi, I'm ` + personalInfo.name}
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-4">
              {personalInfo.title}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href="/Kevin_Xiao_Resume.pdf" target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  Resume
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a
                  href={`https://${personalInfo.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedinIcon className="h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a
                  href={`https://${personalInfo.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon className="h-4 w-4" />
                  GitHub
                </a>
              </Button>
            </div>

            <SpotifyNowPlaying />
          </div>

        </div>
      </div>
    </section>
  );
}
