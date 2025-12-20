import { Separator } from "@/components/ui/separator";

export function AboutSection() {
  return (
    <section id="about" className="pt-2 pb-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">About Me</h2>
        <Separator className="mb-6" />

        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Incoming Software Engineer Intern at Meta</li>
          <li>• Research Assistant in UW RAIVN Lab</li>
          <li>• USACO Gold Division and 2x AIME Qualifier</li>
          <li>• DJ for local college events, bars, and nightclubs</li>
          <li>• I love basketball, snowboarding, and EDM!</li>
        </ul>
      </div>
    </section>
  );
}
