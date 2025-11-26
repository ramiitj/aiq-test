import { Brain, GraduationCap, LucideIcon } from "lucide-react";

export interface TrackData {
  name: string;
  slug: string;
  icon: LucideIcon;
  description: string;
  longDescription: string;
  targetAudience: string[];
  dimensions: {
    code: string;
    name: string;
    description: string;
  }[];
  careerBenefits: string[];
}

export const generalTrack: TrackData = {
  name: "General Track",
  slug: "general",
  icon: Brain,
  description: "Universal AI collaboration intelligence for all professionals",
  longDescription: "The General Track assessments measure your foundational AI collaboration skills across 8 core dimensions. These competencies are essential for any professional working with AI tools, regardless of industry or role. Build a strong foundation in strategic AI understanding, prompt engineering, critical evaluation, and ethical AI utilization.",
  targetAudience: [
    "Professionals across all industries seeking AI skills validation",
    "Career changers entering AI-enhanced roles",
    "Managers overseeing AI-integrated teams",
    "Freelancers and consultants expanding their AI capabilities",
    "Anyone wanting to demonstrate AI collaboration competence",
  ],
  dimensions: [
    {
      code: "SAU",
      name: "Strategic AI Understanding",
      description: "Ability to comprehend AI capabilities, limitations, and appropriate use cases for professional tasks. Understanding when and how to leverage AI tools effectively for strategic advantage.",
    },
    {
      code: "PEI",
      name: "Prompt Engineering Intelligence",
      description: "Skill in crafting effective prompts to elicit optimal AI responses and outputs. Mastering the art of communicating with AI systems to achieve desired results.",
    },
    {
      code: "CEC",
      name: "Critical Evaluation Capability",
      description: "Ability to assess AI-generated content for accuracy, bias, relevance, and quality. Developing discernment to validate and refine AI outputs before application.",
    },
    {
      code: "II",
      name: "Integration Intelligence",
      description: "Competence in incorporating AI tools into existing workflows and processes. Seamlessly blending AI capabilities with traditional work methods for enhanced productivity.",
    },
    {
      code: "ALC",
      name: "Adaptive Learning Capability",
      description: "Capacity to continuously learn new AI tools and adapt to rapidly evolving AI capabilities. Staying current with AI advancements and applying new technologies effectively.",
    },
    {
      code: "EJC",
      name: "Ethical Judgment in AI Utilization",
      description: "Understanding of ethical implications, privacy concerns, and responsible AI usage. Making principled decisions about AI application in professional contexts.",
    },
    {
      code: "CS",
      name: "Context Sensitivity",
      description: "Ability to apply AI appropriately based on situational context, organizational culture, and stakeholder needs. Recognizing when AI is suitable and when human judgment is essential.",
    },
    {
      code: "CRS",
      name: "Creative Reasoning Synthesis",
      description: "Using AI as a creative partner for problem-solving, innovation, and idea generation. Combining human creativity with AI capabilities to produce novel solutions.",
    },
  ],
  careerBenefits: [
    "Build foundational AI collaboration skills applicable across any industry",
    "Demonstrate AI competency to current or prospective employers",
    "Stand out in a competitive job market with verified AI skills",
    "Gain confidence in leveraging AI tools for professional tasks",
    "Receive personalized recommendations to strengthen weak areas",
    "Earn a shareable digital certificate upon passing",
  ],
};

export const adolescent14_15Track: TrackData = {
  name: "Student Track (Ages 14-15)",
  slug: "adolescent-14-15",
  icon: GraduationCap,
  description: "Age-appropriate AI literacy assessment for Grade 9-10 students",
  longDescription: "The Student Track (Ages 14-15) assessment introduces high school freshmen and sophomores to essential AI collaboration skills. This age-appropriate evaluation covers 8 foundational dimensions designed specifically for teenage learners, emphasizing academic applications, digital citizenship, and responsible AI use in educational contexts.",
  targetAudience: [
    "Grade 9-10 students exploring AI technology",
    "High school students preparing for AI-integrated learning",
    "Teens interested in understanding AI tools for schoolwork",
    "Young learners developing digital literacy skills",
    "Students building foundation for future AI careers",
  ],
  dimensions: [
    {
      code: "SAU",
      name: "Strategic AI Understanding",
      description: "Understanding what AI can and cannot do, and when it's appropriate to use AI tools for schoolwork and learning. Recognizing AI's strengths and limitations in academic contexts.",
    },
    {
      code: "PEI",
      name: "Prompt Engineering Intelligence",
      description: "Learning how to ask AI tools clear questions to get helpful answers for homework and projects. Developing skills to communicate effectively with AI systems.",
    },
    {
      code: "CEC",
      name: "Critical Evaluation Capability",
      description: "Checking AI-generated information for accuracy and understanding when to verify facts independently. Building critical thinking skills for evaluating AI outputs.",
    },
    {
      code: "II",
      name: "Integration Intelligence",
      description: "Using AI tools alongside traditional study methods to enhance learning without replacing critical thinking. Balancing AI assistance with personal effort.",
    },
    {
      code: "ALC",
      name: "Adaptive Learning Capability",
      description: "Being open to learning new AI tools and adapting to technology changes in education. Staying curious about emerging AI applications for students.",
    },
    {
      code: "EJC",
      name: "Ethical Judgment in AI Utilization",
      description: "Understanding academic honesty, plagiarism concerns, and responsible AI use in school settings. Making ethical decisions about when and how to use AI for assignments.",
    },
    {
      code: "CS",
      name: "Context Sensitivity",
      description: "Knowing when AI is helpful for learning versus when human effort and creativity are more important. Recognizing appropriate contexts for AI use in education.",
    },
    {
      code: "CRS",
      name: "Creative Reasoning Synthesis",
      description: "Using AI as a brainstorming partner while developing your own original ideas and creative thinking. Combining AI suggestions with personal creativity.",
    },
  ],
  careerBenefits: [
    "Build early AI literacy skills for future academic and career success",
    "Develop responsible AI usage habits from a young age",
    "Stand out in college applications with verified AI competency",
    "Gain confidence using AI tools for school projects",
    "Learn digital citizenship skills for the AI era",
    "Receive personalized guidance on strengthening AI skills",
  ],
};

export const adolescent16_17Track: TrackData = {
  name: "Student Track (Ages 16-17)",
  slug: "adolescent-16-17",
  icon: GraduationCap,
  description: "Advanced AI literacy assessment for Grade 11-12 students",
  longDescription: "The Student Track (Ages 16-17) assessment evaluates advanced AI collaboration skills for high school juniors and seniors. This comprehensive evaluation covers 8 dimensions at a higher complexity level, preparing college-bound students for AI-integrated academic work, career readiness, and responsible AI citizenship in higher education and professional settings.",
  targetAudience: [
    "Grade 11-12 students preparing for college and careers",
    "High school juniors/seniors using AI for research projects",
    "College-bound students building AI literacy portfolio",
    "Young adults exploring AI-related career paths",
    "AP/Honors students seeking advanced AI competency validation",
  ],
  dimensions: [
    {
      code: "SAU",
      name: "Strategic AI Understanding",
      description: "Advanced comprehension of AI capabilities for academic research, college preparation, and career planning. Understanding AI's role in higher education and professional contexts.",
    },
    {
      code: "PEI",
      name: "Prompt Engineering Intelligence",
      description: "Sophisticated prompt crafting for complex research, essay writing support, and advanced problem-solving. Developing nuanced communication strategies with AI tools.",
    },
    {
      code: "CEC",
      name: "Critical Evaluation Capability",
      description: "Rigorous assessment of AI-generated content, including source verification, bias detection, and academic integrity validation. Advanced critical thinking for college-level work.",
    },
    {
      code: "II",
      name: "Integration Intelligence",
      description: "Seamlessly integrating AI tools with advanced study methods, college application processes, and extracurricular projects. Preparing for AI-enhanced college coursework.",
    },
    {
      code: "ALC",
      name: "Adaptive Learning Capability",
      description: "Rapidly learning new AI platforms and adapting to evolving technology in preparation for college and career demands. Building lifelong learning skills.",
    },
    {
      code: "EJC",
      name: "Ethical Judgment in AI Utilization",
      description: "Sophisticated understanding of academic integrity, intellectual property, and ethical AI use in academic and professional settings. Preparing for college-level ethical standards.",
    },
    {
      code: "CS",
      name: "Context Sensitivity",
      description: "Advanced judgment about appropriate AI use across academic, extracurricular, and pre-professional contexts. Recognizing nuanced situations requiring human expertise.",
    },
    {
      code: "CRS",
      name: "Creative Reasoning Synthesis",
      description: "Using AI as an advanced creative partner for college essays, research projects, and innovative problem-solving while maintaining originality. Balancing AI assistance with personal voice.",
    },
  ],
  careerBenefits: [
    "Strengthen college applications with demonstrated AI competency",
    "Prepare for AI-integrated coursework in higher education",
    "Develop career-ready AI collaboration skills",
    "Build foundation for AI-enhanced professional roles",
    "Demonstrate digital citizenship and ethical technology use",
    "Receive targeted recommendations for college and career readiness",
  ],
};

export const getTrackBySlug = (slug: string): TrackData | null => {
  if (slug === "general") return generalTrack;
  if (slug === "adolescent-14-15") return adolescent14_15Track;
  if (slug === "adolescent-16-17") return adolescent16_17Track;
  return null;
};
