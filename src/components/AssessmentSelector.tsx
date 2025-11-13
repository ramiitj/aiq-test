import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, FileQuestion, Briefcase, Brain, GraduationCap, TrendingUp } from "lucide-react";

interface Assessment {
  slug: string;
  name: string;
  track: "general" | "adolescent" | "role-based";
  role?: string;
  difficulty: "beginner" | "advanced";
  duration: number;
  questionCount: number;
  description: string;
  targetAudience: string;
  icon?: any;
}

const assessments: Assessment[] = [
  // General Track
  {
    slug: "general-beginner",
    name: "AIQ General Assessment - Beginner",
    track: "general",
    difficulty: "beginner",
    duration: 60,
    questionCount: 60,
    description: "Comprehensive assessment of AI collaboration intelligence for all professionals",
    targetAudience: "Professionals new to AI tools and collaboration",
    icon: Brain
  },
  {
    slug: "general-advanced",
    name: "AIQ General Assessment - Advanced",
    track: "general",
    difficulty: "advanced",
    duration: 80,
    questionCount: 80,
    description: "In-depth evaluation of advanced AI collaboration capabilities",
    targetAudience: "Experienced AI users seeking comprehensive evaluation",
    icon: Brain
  },
  
  // Adolescent Track
  {
    slug: "adolescent-14-15",
    name: "AIQ Student Assessment (Ages 14-15)",
    track: "adolescent",
    difficulty: "beginner",
    duration: 60,
    questionCount: 60,
    description: "Age-appropriate AI literacy assessment for high school students (Grades 9-10)",
    targetAudience: "Students aged 14-15 years",
    icon: GraduationCap
  },
  {
    slug: "adolescent-16-17",
    name: "AIQ Student Assessment (Ages 16-17)",
    track: "adolescent",
    difficulty: "beginner",
    duration: 60,
    questionCount: 60,
    description: "Advanced AI literacy assessment for senior high school students (Grades 11-12)",
    targetAudience: "Students aged 16-17 years",
    icon: GraduationCap
  },
  
  // Role-Based Track - Product Manager
  {
    slug: "pm-beginner",
    name: "Product Manager - Beginner",
    track: "role-based",
    role: "Product Manager",
    difficulty: "beginner",
    duration: 60,
    questionCount: 60,
    description: "Foundational AI collaboration skills for product management",
    targetAudience: "Product managers new to AI-powered workflows",
    icon: Briefcase
  },
  
  // Data Scientist
  {
    slug: "ds-beginner",
    name: "Data Scientist - Beginner",
    track: "role-based",
    role: "Data Scientist",
    difficulty: "beginner",
    duration: 60,
    questionCount: 60,
    description: "Essential AI collaboration skills for data science professionals",
    targetAudience: "Data scientists beginning to work with AI tools",
    icon: Briefcase
  },
  {
    slug: "ds-advanced",
    name: "Data Scientist - Advanced",
    track: "role-based",
    role: "Data Scientist",
    difficulty: "advanced",
    duration: 150,
    questionCount: 160,
    description: "Advanced AI collaboration capabilities for senior data scientists",
    targetAudience: "Experienced data scientists leveraging AI at scale",
    icon: Briefcase
  },
  
  // Software Engineer
  {
    slug: "sde-beginner",
    name: "Software Engineer - Beginner",
    track: "role-based",
    role: "Software Engineer",
    difficulty: "beginner",
    duration: 60,
    questionCount: 60,
    description: "Core AI collaboration skills for software development",
    targetAudience: "Software engineers new to AI-assisted development",
    icon: Briefcase
  },
  {
    slug: "sde-advanced",
    name: "Software Engineer - Advanced",
    track: "role-based",
    role: "Software Engineer",
    difficulty: "advanced",
    duration: 150,
    questionCount: 160,
    description: "Expert-level AI collaboration for senior software engineers",
    targetAudience: "Senior engineers mastering AI-powered development",
    icon: Briefcase
  },
  
  // Digital Marketer
  {
    slug: "dm-beginner",
    name: "Digital Marketer - Beginner",
    track: "role-based",
    role: "Digital Marketer",
    difficulty: "beginner",
    duration: 60,
    questionCount: 60,
    description: "Foundational AI collaboration for digital marketing professionals",
    targetAudience: "Marketers beginning to integrate AI into campaigns",
    icon: Briefcase
  },
  {
    slug: "dm-advanced",
    name: "Digital Marketer - Advanced",
    track: "role-based",
    role: "Digital Marketer",
    difficulty: "advanced",
    duration: 150,
    questionCount: 160,
    description: "Advanced AI marketing strategies and implementation",
    targetAudience: "Senior marketers driving AI-powered growth",
    icon: Briefcase
  },
  
  // Business Analyst
  {
    slug: "ba-beginner",
    name: "Business Analyst - Beginner",
    track: "role-based",
    role: "Business Analyst",
    difficulty: "beginner",
    duration: 60,
    questionCount: 60,
    description: "Essential AI collaboration skills for business analysis",
    targetAudience: "Business analysts exploring AI-enhanced workflows",
    icon: Briefcase
  },
  {
    slug: "ba-advanced",
    name: "Business Analyst - Advanced",
    track: "role-based",
    role: "Business Analyst",
    difficulty: "advanced",
    duration: 150,
    questionCount: 160,
    description: "Advanced AI-driven business intelligence and analysis",
    targetAudience: "Senior analysts leveraging AI for strategic insights",
    icon: Briefcase
  },
  
  // Sales Professional
  {
    slug: "sales-beginner",
    name: "Sales Professional - Beginner",
    track: "role-based",
    role: "Sales Professional",
    difficulty: "beginner",
    duration: 60,
    questionCount: 60,
    description: "Core AI collaboration skills for sales professionals",
    targetAudience: "Sales professionals new to AI-powered CRM and automation",
    icon: Briefcase
  },
  {
    slug: "sales-advanced",
    name: "Sales Professional - Advanced",
    track: "role-based",
    role: "Sales Professional",
    difficulty: "advanced",
    duration: 150,
    questionCount: 160,
    description: "Advanced AI strategies for sales optimization and growth",
    targetAudience: "Senior sales leaders mastering AI-driven pipelines",
    icon: Briefcase
  },
  
  // Operations Manager
  {
    slug: "ops-beginner",
    name: "Operations Manager - Beginner",
    track: "role-based",
    role: "Operations Manager",
    difficulty: "beginner",
    duration: 60,
    questionCount: 60,
    description: "Foundational AI collaboration for operations management",
    targetAudience: "Operations managers starting to automate with AI",
    icon: Briefcase
  },
  {
    slug: "ops-advanced",
    name: "Operations Manager - Advanced",
    track: "role-based",
    role: "Operations Manager",
    difficulty: "advanced",
    duration: 150,
    questionCount: 160,
    description: "Advanced AI-driven operational excellence and efficiency",
    targetAudience: "Senior operations leaders optimizing with AI at scale",
    icon: Briefcase
  },
  
  // HR Professional
  {
    slug: "hr-beginner",
    name: "HR Professional - Beginner",
    track: "role-based",
    role: "HR Professional",
    difficulty: "beginner",
    duration: 60,
    questionCount: 60,
    description: "Essential AI collaboration skills for human resources",
    targetAudience: "HR professionals beginning to leverage AI tools",
    icon: Briefcase
  },
  {
    slug: "hr-advanced",
    name: "HR Professional - Advanced",
    track: "role-based",
    role: "HR Professional",
    difficulty: "advanced",
    duration: 150,
    questionCount: 160,
    description: "Advanced AI strategies for talent management and development",
    targetAudience: "Senior HR leaders driving AI-powered people strategies",
    icon: Briefcase
  }
];

const trackLabels = {
  general: "General Track",
  adolescent: "Student Track",
  "role-based": "Professional Track"
};

interface AssessmentSelectorProps {
  defaultTrack?: "all" | "general" | "adolescent" | "role-based";
}

export default function AssessmentSelector({ defaultTrack = "all" }: AssessmentSelectorProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTrack, setActiveTrack] = useState<"all" | "general" | "adolescent" | "role-based">(defaultTrack);

  const filteredAssessments = useMemo(() => {
    let filtered = assessments;

    // Filter by track
    if (activeTrack !== "all") {
      filtered = filtered.filter(a => a.track === activeTrack);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.role?.toLowerCase().includes(query) ||
        a.targetAudience.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, activeTrack]);

  const handleStartAssessment = (slug: string) => {
    navigate(`/test?product=${slug}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    return difficulty === "beginner" 
      ? "bg-primary/10 text-primary border-primary/20" 
      : "bg-accent/10 text-accent-foreground border-accent/20";
  };

  const groupedByTrack = useMemo(() => {
    const grouped: Record<string, Assessment[]> = {
      general: [],
      adolescent: [],
      "role-based": []
    };

    filteredAssessments.forEach(assessment => {
      grouped[assessment.track].push(assessment);
    });

    return grouped;
  }, [filteredAssessments]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Choose Your Assessment
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          19 specialized assessments across 3 tracks. Find the perfect assessment for your needs.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTrack} onValueChange={(v) => setActiveTrack(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
          <TabsTrigger value="all">All ({assessments.length})</TabsTrigger>
          <TabsTrigger value="general">General (2)</TabsTrigger>
          <TabsTrigger value="adolescent">Students (2)</TabsTrigger>
          <TabsTrigger value="role-based">Professional (15)</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTrack} className="mt-6">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No assessments found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {activeTrack === "all" ? (
                // Grouped view for "All" tab
                Object.entries(groupedByTrack).map(([track, trackAssessments]) => {
                  if (trackAssessments.length === 0) return null;
                  
                  return (
                    <div key={track} className="space-y-4">
                      <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                        {track === "general" && <Brain className="h-6 w-6" />}
                        {track === "adolescent" && <GraduationCap className="h-6 w-6" />}
                        {track === "role-based" && <Briefcase className="h-6 w-6" />}
                        {trackLabels[track as keyof typeof trackLabels]}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trackAssessments.map(assessment => (
                          <AssessmentCard
                            key={assessment.slug}
                            assessment={assessment}
                            onStart={handleStartAssessment}
                            getDifficultyColor={getDifficultyColor}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Single track view
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssessments.map(assessment => (
                    <AssessmentCard
                      key={assessment.slug}
                      assessment={assessment}
                      onStart={handleStartAssessment}
                      getDifficultyColor={getDifficultyColor}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AssessmentCardProps {
  assessment: Assessment;
  onStart: (slug: string) => void;
  getDifficultyColor: (difficulty: string) => string;
}

function AssessmentCard({ assessment, onStart, getDifficultyColor }: AssessmentCardProps) {
  const Icon = assessment.icon || Briefcase;
  
  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Icon className="h-5 w-5 text-primary shrink-0 mt-1" />
          <Badge variant="outline" className={getDifficultyColor(assessment.difficulty)}>
            {assessment.difficulty === "beginner" ? "Beginner" : "Advanced"}
          </Badge>
        </div>
        <CardTitle className="text-lg">{assessment.name}</CardTitle>
        <CardDescription className="text-sm">{assessment.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{assessment.duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <FileQuestion className="h-4 w-4" />
              <span>{assessment.questionCount} questions</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">For:</span> {assessment.targetAudience}
          </div>
        </div>
        <Button 
          onClick={() => onStart(assessment.slug)} 
          className="w-full mt-4"
          variant="default"
        >
          Start Assessment
        </Button>
      </CardContent>
    </Card>
  );
}
