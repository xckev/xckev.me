"use client";

import { useActiveSection } from "@/hooks/use-active-section";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Home, Briefcase, GraduationCap, FolderCode, Brain, Mail, Sun, Moon, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const navItems: { id: string; icon: LucideIcon; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "experience", icon: Briefcase, label: "Experience" },
  { id: "education", icon: GraduationCap, label: "Education" },
  { id: "projects", icon: FolderCode, label: "Projects" },
  { id: "skills", icon: Brain, label: "Skills" },
  { id: "contact", icon: Mail, label: "Contact" },
];

export function BottomNavbar() {
  const activeSection = useActiveSection(navItems.map((item) => item.id));
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isOnJournal = pathname === "/journal";

  const scrollToSection = (sectionId: string) => {
    if (isOnJournal) {
      // Navigate home first, then scroll
      router.push(`/#${sectionId}`);
      return;
    }
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 px-3 py-2 bg-background/80 backdrop-blur-lg border border-border rounded-full shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              size="icon"
              onClick={() => scrollToSection(item.id)}
              className="rounded-full h-9 w-9"
              title={item.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          id="journal-lock-btn"
          variant={isOnJournal ? "default" : "ghost"}
          size="icon"
          onClick={() => router.push("/journal")}
          className="rounded-full h-9 w-9"
          title="Private"
        >
          <Lock className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full h-9 w-9"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </nav>
  );
}
