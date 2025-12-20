// Type Definitions
export interface PersonalInfo {
  name: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
}

export interface Education {
  institution: string;
  location: string;
  degrees: string[];
  gpa: number;
  period: string;
  achievements: string[];
  coursework: string[];
  logo?: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  technologies?: string[];
  logo?: string;
}

export interface Project {
  name: string;
  date: string;
  description: string;
  achievements: string[];
  technologies: string[];
  image?: string;
  link?: string;
  github?: string;
}

export interface Skills {
  languages: string[];
  frameworks: string[];
  developerTools: string[];
  concepts: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education;
  experiences: Experience[];
  projects: Project[];
  skills: Skills;
}

// Resume Data
export const resumeData: ResumeData = {
  personalInfo: {
    name: "Kevin",
    title: "CS + Math @ University of Washington",
    phone: "425-525-9964",
    email: "xckevin@cs.washington.edu",
    linkedin: "linkedin.com/in/xckev",
    github: "github.com/xckev",
  },

  education: {
    institution: "University of Washington",
    location: "Seattle, WA",
    degrees: ["B.S. Computer Science", "B.A. Mathematics"],
    gpa: 3.91,
    period: "Sept 2023 - June 2027",
    achievements: ["Dean's List", "Publication Accepted to ACM IUI"],
    coursework: [
      "Data Structures",
      "Algorithms",
      "Artificial Intelligence",
      "Numerical Analysis",
      "Machine Learning",
      "Software Design & Implementation",
      "Computer Vision",
      "Systems Programming",
      "Software Tools",
      "Discrete Math",
    ],
    logo: "/logos/uw.png",
  },

  experiences: [
    {
      title: "Incoming Software Engineer Intern",
      company: "Meta",
      location: "Menlo Park, CA",
      period: "Jun 2026 – Sept 2026",
      description: [
        "Summer 2026",
      ],
      technologies: [],
      logo: "/logos/metalogo.png",
    },
    {
      title: "Research Assistant",
      company: "Paul G. Allen School of Computer Science & Engineering",
      location: "Seattle, WA",
      period: "Dec 2026 – Present",
      description: [
        "🔬 RAIVN Lab - AI Agents for Radiomics Research",
      ],
      technologies: [],
      logo: "/logos/paul.png",
    },
    {
      title: "Software Development Engineer Intern",
      company: "Amazon Web Services (AWS)",
      location: "Seattle, WA",
      period: "Jun 2025 – Sept 2025",
      description: [
        "🛠️ Amazon Connect - Agentic AI Tools",
      ],
      technologies: ["MCP", "AI", "AWS"],
      logo: "/logos/amazon.png",
    },
    {
      title: "Research Assistant",
      company: "Makeability Lab",
      location: "Seattle, WA",
      period: "Jun 2024 – March 2025",
      description: [
        "🎨 ArtInsight - GenAI to supplement BLV interactions with visual artwork",
      ],
      technologies: ["SwiftUI", "GPT-4o", "iOS"],
      logo: "/logos/makeability.png",
    },
    {
      title: "Software Subsystem Lead",
      company: "Husky Satellite Lab",
      location: "Seattle, WA",
      period: "Apr 2024 – August 2025",
      description: [
        "🛰️ Star Tracker for HuskySat-2",
      ],
      technologies: ["C++", "Embedded Systems"],
      logo: "/logos/huskysat.png",
    },
    {
      title: "Dessert Artist",
      company: "Hui Lau Shan",
      location: "Bellevue, WA",
      period: "Jan 2023 – Aug 2023",
      description: [
        "🥭🥥 Mangos and Coconuts.",
      ],
      technologies: [],
      logo: "/logos/hls.png",
    },
  ],

  projects: [
    {
      name: "Discreetly",
      date: "October 2026",
      description:
        "Versatile iOS mobile application that connects users to emergency contacts with ubiquitous phone sensor data and an AI Voice Agent when it isn't convenient to take your phone out. Provides a wide array of discreet triggers like the action button or sudden motion.",
      achievements: [
        "Project for Dubhacks 2025",
        "Used Twilio for calling and Ultravox for AI Agent",
      ],
      technologies: ["SwiftUI", "Twilio", "Ultravox", "Gemini API"],
      image: "/projects/discreetly.png",
      link: "https://devpost.com/software/discreetly-q9ij40",
    },
    {
      name: "Sussi",
      date: "June 2025",
      description:
        "Intelligent student laptop monitoring system with quick classroom insights and automation. Won 1st place at Meta Llama 4 Seattle Hackathon against 200+ competitors and gained pre-seed investor attention.",
      achievements: [
        "Placed 1st at Meta Llama 4 Seattle Hackathon, competing against 200+ top college and full-time competitors",
        "Built a Next.js teacher client and a SwiftUI MacOS student client that interface through MongoDB Atlas",
        "Gained pre-seed investor attention for startup potential and interviewed with Afore VC",
      ],
      technologies: ["Next.js", "SwiftUI", "MongoDB", "Llama 4 API"],
      image: "/projects/sussi.png",
      link: "https://www.youtube.com/watch?v=9fk_h4dAfGA",
    },
    {
      name: "Triage",
      date: "October 2024",
      description:
        "AI disaster assessment and detection tool using satellite imagery to improve emergency response. Won 1st place out of 1000+ participants at DubHacks '24, the largest hackathon in the Pacific Northwest.",
      achievements: [
        "Placed 1st out of 1000+ participants at DubHacks '24, the largest hackathon in the Pacific Northwest",
        "Built with Next.js frontend, Python Flask backend, Intel Tiber hosting, and AWS CloudFormationStack",
      ],
      technologies: [
        "Next.js",
        "Flask",
        "HTML/CSS",
        "Perplexity AI",
        "SAM 2",
        "REST API",
      ],
      image: "/projects/triage.png",
      link: "https://devpost.com/software/triage-k7vr5n",
    },
    {
      name: "ClinicChatBot",
      date: "July 2023",
      description:
        "Full-stack RAG chatbot with fine-tuned GPT-3.5-turbo for clinic website visitors. Deployed to a local acupuncture clinic, achieving an 86% reduction in average customer service ticket lifetime.",
      achievements: [
        "Deployed system to a local acupuncture clinic for an 86% reduction in the average customer service ticket lifetime",
      ],
      technologies: ["Flask", "OpenAI API", "ChromaDB"],
      image: "/projects/clinicchatbot.png",
      link: "https://github.com/xckev/clinicchatbot",
    },
    {
      name: "CipherBot",
      date: "November 2022",
      description:
        "An open source Discord bot written in Python that does all things Cryptography. CipherBot helps you encrypt/decrypt secret messages to friends, vote in secure polls, check cryptocurrency prices, and more!",
      achievements: [
        "An open source Discord bot written in Python that utilizes cryptographic algorithms", 
        "Inspired by the Stanford Summer Institutes Cryptography/Cryptocurrency Course",
        "Allows users to encrypt/decrypt messages with Diffie-Hellman Key Exchange and Public Key Encryption",
        "Emulation of mix-networks and homomorphic encryption for secure voting, a crucial part of modern political integrity",
        "Retrieves cryptocurrency prices from coinmarketcap.com",
      ],
      technologies: ["Discord API", "CoinMarketCap API", "Microsoft SEAL Homomorphic Encryption"],
      image: "/projects/cipherbot.png",
      link: "https://github.com/xckev/CipherBot",
    },
    {
      name: "Lavablock",
      date: "September 2020",
      description:
        "A simple but fun 2D game run on Java's native graphics engine. The first video game I ever made, introducing myself to many aspects of game design.",
      achievements: [
        "A simple but fun 2D game run on Java's native graphics engine", 
        "A refinement of the first video game I made, which was coded in Python",
        "Introduced myself to many aspects of game design",
      ],
      technologies: ["Java", "Bensound Music"],
      image: "/projects/lavablock.png",
      link: "https://github.com/xckev/LavaBlockGame",
    },
  ],

  skills: {
    languages: [
      "Python",
      "Java",
      "C++",
      "C",
      "JavaScript",
      "TypeScript",
      "HTML/CSS",
      "Swift",
      "SQL",
      "MQL",
      "x86-64 Assembly",
    ],
    frameworks: [
      "PyTorch",
      "Node.js",
      "React.js",
      "Next.js",
      "Express.js",
      "Flask",
      "SwiftUI",
      "Flutter",
      "Bazel",
      "FastAPI",
      "JUnit",
      "Jest",
    ],
    developerTools: [
      "Git",
      "Linux",
      "Amazon Web Services",
      "Google Cloud Platform",
      "Microsoft Azure",
      "Docker",
      "TSLint",
    ],
    concepts: [
      "Machine Learning",
      "Object-Oriented Programming",
      "Web Development",
      "Databases",
      "Full stack",
      "Cloud Computing",
      "Cybersecurity",
      "Parallel Programming",
      "Statistics",
      "Probability",
      "NLP",
      "REST API",
      "HTTP",
      "MCP",
    ],
  },
};
